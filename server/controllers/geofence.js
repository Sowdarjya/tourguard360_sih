import pool from "../db/db.js";

export const checkUserLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const query = `
            SELECT id, name
            FROM geofences
            WHERE ST_Contains(
        geom::geometry,
        ST_SetSRID(ST_Point($1, $2), 4326)
      );
        `;

    const result = await pool.query(query, [longitude, latitude]);

    if (result.rows.length > 0) {
      res.json({ inside: true, zone: result.rows[0] });
    } else {
      res.json({ inside: false });
    }
  } catch (error) {
    console.log("checkUserLocation error:", error);

    res
      .status(500)
      .json({ error: error.message, message: "Internal Server Error" });
  }
};

export const checkNearbyGeofences = async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const radius = Number(req.query.radius || 5000);

  if (Number.isNaN(lat) || Number.isNaN(lon))
    return res.status(400).json({ error: "Invalid lat/lon" });

  try {
    const query = `
      SELECT id, name, ST_AsGeoJSON(geom) AS geometry
      FROM geofences
      WHERE ST_DWithin(
        geom,
        ST_SetSRID(ST_Point($1, $2), 4326)::geography,
        $3
      );
    `;
    const result = await pool.query(query, [lon, lat, radius]);
    return res.json(result.rows);
  } catch (err) {
    console.error("nearby error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const createGeofence = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });

  const { name, wktPolygon } = req.body || {};
  if (!name || !wktPolygon)
    return res.status(400).json({ error: "Missing name or wktPolygon" });

  try {
    const q = `INSERT INTO geofences (name, geom) VALUES ($1, ST_GeogFromText($2)) RETURNING id, name`;
    const r = await pool.query(q, [name, wktPolygon]);
    res.json({ success: true, geofence: r.rows[0] });
  } catch (err) {
    console.error("create geofence error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
