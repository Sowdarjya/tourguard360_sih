import express from "express";
import { triggerSOS } from "../controllers/sos.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/trigger", authMiddleware, triggerSOS);

export default router;
