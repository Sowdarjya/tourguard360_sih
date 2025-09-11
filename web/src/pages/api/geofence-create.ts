import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { name, wktPolygon } = req.body || {};
  if (!name || !wktPolygon) return res.status(400).json({ error: "Missing name or wktPolygon" });

  // Forward to backend API
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
    // Use token from incoming request, not from env
    const token = req.headers.authorization || "";
    const response = await fetch(`${backendUrl}/geofence/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
      body: JSON.stringify({ name, wktPolygon }),
    });
    const data = await response.json();
    if (response.ok) {
      res.status(200).json({ success: true, geofence: data.geofence });
    } else {
      res.status(response.status).json({ error: data.error || "Failed to create geofence" });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}
