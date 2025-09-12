import express from "express";
import {
  addFamilyMember,
  getFamilyMembers,
  removeFamilyMember,
} from "../controllers/family.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addFamilyMember);
router.get("/", authMiddleware, getFamilyMembers);
router.delete("/:id", authMiddleware, removeFamilyMember);

export default router;
