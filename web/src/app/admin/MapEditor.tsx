
import { useState } from "react";

// Helper: convert polygon to WKT string
function polygonToWKT(coords: [number, number][]): string {
  if (!coords.length) return "";
  // WKT expects lon lat pairs, closed ring
  const ring = [...coords, coords[0]]
    .map(([lng, lat]) => `${lng} ${lat}`)
    .join(", ");
  return `POLYGON((${ring}))`;
}

interface MapEditorProps {
  token: string;
}

export default function MapEditor({ token }: MapEditorProps) {
  // Remove mapbox, use manual input for polygon coordinates
  const [polygon, setPolygon] = useState<[number, number][]>([]);
  const [drawing, setDrawing] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  // Submit geofence to backend
  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const wkt = polygonToWKT(polygon);
      if (!name || !wkt) {
        setStatus("Please enter a name and draw a polygon.");
        setLoading(false);
        return;
      }
      // Use fetch to POST to backend
      const res = await fetch("/api/geofence-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name, wktPolygon: wkt }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("Geofence created successfully!");
        setPolygon([]);
        setName("");
      } else {
        setStatus(data.error || "Failed to create geofence.");
      }
    } catch (err) {
      let msg = "Unknown error";
      if (err && typeof err === "object" && "message" in err) {
        msg = (err as { message?: string }).message || msg;
      }
      setStatus("Error: " + msg);
    }
    setLoading(false);
  };

  // Manual input for polygon coordinates
  const [lng, setLng] = useState("");
  const [lat, setLat] = useState("");

  const handleAddPoint = () => {
    const lon = parseFloat(lng);
    const la = parseFloat(lat);
    if (!isNaN(lon) && !isNaN(la)) {
      setPolygon(prev => [...prev, [lon, la]]);
      setLng("");
      setLat("");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded shadow w-full max-w-md mb-4">
        <h3 className="font-bold mb-2">Add Polygon Points</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            className="border p-2 rounded w-1/2"
            placeholder="Longitude"
            value={lng}
            onChange={e => setLng(e.target.value)}
            disabled={loading}
          />
          <input
            type="text"
            className="border p-2 rounded w-1/2"
            placeholder="Latitude"
            value={lat}
            onChange={e => setLat(e.target.value)}
            disabled={loading}
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleAddPoint}
            disabled={loading}
          >
            Add Point
          </button>
        </div>
        {polygon.length > 0 && (
          <pre className="text-xs whitespace-pre-wrap mb-2">{JSON.stringify(polygon, null, 2)}</pre>
        )}
        <input
          type="text"
          className="border p-2 rounded w-full mb-2"
          placeholder="Geofence Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
          onClick={handleSubmit}
          disabled={loading || polygon.length < 3}
        >
          {loading ? "Saving..." : "Save Geofence"}
        </button>
        {status && (
          <div className="mt-2 text-center text-sm text-gray-700">{status}</div>
        )}
      </div>
    </div>
  );
}
