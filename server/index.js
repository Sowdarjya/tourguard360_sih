import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { initializeDB } from "./utils/initDB.js";
import authRoutes from "./routes/auth.js";
import geofenceRoutes from "./routes/geofence.js";
import photoRoutes from "./routes/photos.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/auth", authRoutes);
app.use("/geofence", geofenceRoutes);
app.use("/photos", photoRoutes);

(async () => {
  try {
    await initializeDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
