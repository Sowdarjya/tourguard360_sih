import zipfile
import io
import hashlib
import os
import httpx
import asyncio
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from lxml import etree
import xmlsec

# Initialize logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("AadhaarKYCApp")

app = FastAPI(title="Aadhaar KYC Verifier & Issuer", version="1.0.0")

# --- ACA-Py Configuration ---
FABER_ADMIN_URL = "http://localhost:8021"
ALICE_ADMIN_URL = "http://localhost:8031"
CRED_DEF_ID = "FenxhqdAMsZS8xprCFPyYZ:3:CL:10:default" # The Cred Def ID from our setup steps
# -----------------------------

#
# >>> CORE HELPER FUNCTIONS <<<
#
def verify_and_parse_xml(zip_content: bytes, share_code: str) -> dict:
    """Verifies and parses the Aadhaar XML from a ZIP file."""
    try:
        with zipfile.ZipFile(io.BytesIO(zip_content), 'r') as z:
            xml_files = [f for f in z.namelist() if f.lower().endswith(".xml")]
            if len(xml_files) != 1: raise HTTPException(status_code=400, detail="ZIP must contain one XML file")
            xml_bytes = z.read(xml_files[0], pwd=share_code.encode())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ZIP or share code")
    
    certs_dir = os.path.join(os.path.dirname(__file__), "certs")
    parser = etree.XMLParser(remove_blank_text=True)
    try:
        doc = etree.fromstring(xml_bytes, parser)
        sig_node = xmlsec.tree.find_node(doc, xmlsec.Node.SIGNATURE)
        if sig_node is None: raise HTTPException(status_code=400, detail="Signature element not found.")
    except etree.XMLSyntaxError:
        raise HTTPException(status_code=400, detail="Malformed XML")
    
    valid = False
    for cert_name in os.listdir(certs_dir):
        if not cert_name.lower().endswith(('.pem', '.cer', '.crt', '.cert')): continue
        cert_path = os.path.join(certs_dir, cert_name)
        try:
            with open(cert_path, 'rb') as cf: cert_data = cf.read()
            ctx = xmlsec.SignatureContext()
            key = xmlsec.Key.from_memory(cert_data, xmlsec.KeyFormat.CERT_PEM, None)
            ctx.key = key
            ctx.verify(sig_node)
            valid = True
            break
        except Exception: continue
    
    if not valid: raise HTTPException(status_code=400, detail="Aadhaar XML signature is invalid")
    
    root = etree.fromstring(xml_bytes)
    data = {}
    if root.tag == "OfflinePaperlessKyc":
        uid = root.find('UidData')
        if uid is not None:
            poi, poa, pht = uid.find('Poi'), uid.find('Poa'), uid.find('Pht')
            if poi is not None: data.update({'name': poi.get('name', ''), 'dob': poi.get('dob', ''), 'gender': poi.get('gender', '')})
            if poa is not None: data['address'] = ", ".join([poa.get(f, '') for f in ['house','street','landmark','loc','vtc','subdist','dist','state','pc'] if poa.get(f)])
            if pht is not None: data['photo'] = pht.text or ""
    logger.info("Parsed Aadhaar data for: %s", data.get("name"))
    return data

async def perform_handshake():
    """Establishes a DID-Exchange 1.1 connection between Faber and Alice."""
    async with httpx.AsyncClient(timeout=90.0) as client:
        payload = {"handshake_protocols": ["https://didcomm.org/didexchange/1.1"]}
        resp = await client.post(f"{FABER_ADMIN_URL}/out-of-band/create-invitation", json=payload)
        resp.raise_for_status()
        invi = resp.json()["invitation"]
        invi_msg_id = invi["@id"]
        logger.info("Created Invitation ID: %s", invi_msg_id)
        
        resp = await client.post(f"{ALICE_ADMIN_URL}/out-of-band/receive-invitation", json=invi, params={"auto_accept": "true"})
        resp.raise_for_status()
        alice_conn_id = resp.json()["connection_id"]
        logger.info("Alice Connection ID: %s", alice_conn_id)

        for attempt in range(15):
            await asyncio.sleep(5)
            list_resp = await client.get(f"{FABER_ADMIN_URL}/connections", params={"invitation_msg_id": invi_msg_id})
            list_resp.raise_for_status()
            records = list_resp.json().get("results", [])
            if records and records[0].get("state") == "active":
                faber_conn_id = records[0]["connection_id"]
                logger.info("Connection is active for Faber Connection ID: %s", faber_conn_id)
                return faber_conn_id, alice_conn_id
            logger.info("Attempt %d: Handshake not yet active...", attempt + 1)
        raise HTTPException(status_code=504, detail="Connection handshake timed out.")

async def send_credential_offer(faber_connection_id: str, attrs: dict):
    """Sends a credential offer with the complete, correct filter."""
    issuer_did = CRED_DEF_ID.split(':')[0]
    schema_id = f"{issuer_did}:2:aadhaar-id:1.0"
    
    cred_attrs = [
        {"name": "name", "value": attrs.get("name", "")},
        {"name": "date_of_birth", "value": attrs.get("dob", "")},
        {"name": "gender", "value": attrs.get("gender", "")},
        {"name": "address", "value": attrs.get("address", "")},
        {"mime-type": "image/jpeg", "name": "photo_hash", "value": hashlib.sha256(attrs.get("photo", "").encode()).hexdigest()},
    ]

    payload = {
        "connection_id": faber_connection_id, "comment": "Aadhaar ID credential offer", "auto_issue": True, "auto_remove": True, "cred_type": "anoncreds",
        "filter": {
            "anoncreds": {
                "schema_id": schema_id,
                "cred_def_id": CRED_DEF_ID
            }
        },
        "credential_preview": {"@type": "issue-credential/2.0/credential-preview", "attributes": cred_attrs}, "trace": True
    }
    
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{FABER_ADMIN_URL}/issue-credential-2.0/send-offer", json=payload)
        resp.raise_for_status()
        return resp.json()

#
# >>> API ENDPOINTS <<<
#
@app.post("/verify-aadhaar-xml")
async def endpoint_verify_aadhaar_xml(zip_file: UploadFile = File(...), share_code: str = Form(...)):
    zip_content = await zip_file.read()
    parsed_data = verify_and_parse_xml(zip_content, share_code)
    return JSONResponse(content={"status": "verified", "data": parsed_data})

@app.post("/create-connection")
async def endpoint_create_connection():
    try:
        faber_conn_id, alice_conn_id = await perform_handshake()
        return JSONResponse(content={"status": "connection_active", "faber_connection_id": faber_conn_id, "alice_connection_id": alice_conn_id})
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Agent communication error: {e}")

@app.post("/verify-connect-and-issue")
async def endpoint_verify_connect_and_issue(zip_file: UploadFile = File(...), share_code: str = Form(...)):
    try:
        zip_content = await zip_file.read()
        parsed_data = verify_and_parse_xml(zip_content, share_code)
        faber_conn_id, _ = await perform_handshake()
        issuance_record = await send_credential_offer(faber_conn_id, parsed_data)
        return JSONResponse(content={"status": "issuance_complete", "issuance_record": issuance_record})
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Agent communication error: {e}")