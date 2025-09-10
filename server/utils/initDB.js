import pool from "../db/db.js";
import bcrypt from "bcryptjs";

export async function initializeDB() {
  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis;`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS geofences (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        geom GEOGRAPHY(POLYGON, 4326),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS checkins (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        geofence_id INT REFERENCES geofences(id) ON DELETE SET NULL,
        photo_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tables ensured");

    const { rows } = await pool.query(
      "SELECT count(*)::int as c FROM geofences;"
    );
    if (rows[0].c === 0) {
      await pool.query(
        `INSERT INTO geofences (name, geom) VALUES ($1, ST_GeogFromText($2))`,
        [
          "Example Safe Zone",
          "POLYGON((91.736 26.144, 91.738 26.144, 91.738 26.146, 91.736 26.146, 91.736 26.144))",
        ]
      );
      console.log("✅ Seeded example geofence");
    }

    const u = await pool.query("SELECT count(*)::int as c FROM users;");
    if (u.rows[0].c === 0) {
      const pwd = "admin123";
      const hashed = await bcrypt.hash(pwd, 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ["Admin", "admin@tourguard360.local", hashed, "admin"]
      );
      console.log(`✅ Seeded admin user -> admin@tourguard360.local / ${pwd}`);
    }

    console.log("✅ Database initialization complete");
  } catch (err) {
    console.error("❌ initializeDB error:", err);
    throw err;
  }
}
