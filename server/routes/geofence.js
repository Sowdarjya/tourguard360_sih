import express from "express";
import {
  checkNearbyGeofences,
  checkUserLocation,
  createGeofence,
} from "../controllers/geofence.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/check-location", authMiddleware, checkUserLocation);

router.get("/nearby", authMiddleware, checkNearbyGeofences);

router.post("/create", authMiddleware, createGeofence);

export default router;
