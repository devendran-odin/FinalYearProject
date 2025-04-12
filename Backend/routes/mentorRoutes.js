import express from "express";
import { getAllMentors, getMentorById } from "../controllers/mentorController.js";
import { authenticateToken } from "../middleware/jwtAuth.js";

const router = express.Router();

router.get("/", getAllMentors);
router.get("/:id", authenticateToken, getMentorById);

export default router; 