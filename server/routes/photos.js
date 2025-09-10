import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import pool from "../db/db.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

router.post(
  "/upload",
  authMiddleware,
  upload.single("photo"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No photo uploaded" });

    const userId = req.user.id;
    const geofenceId = req.body.geofenceId ? Number(req.body.geofenceId) : null;
    const photoUrl = `/uploads/${req.file.filename}`;

    try {
      await pool.query(
        `INSERT INTO checkins (user_id, geofence_id, photo_url) VALUES ($1, $2, $3)`,
        [userId, geofenceId || null, photoUrl]
      );
      res.json({ success: true, photoUrl });
    } catch (err) {
      console.error("photo upload error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

export default router;
