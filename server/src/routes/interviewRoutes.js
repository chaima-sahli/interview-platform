import express from "express";
import {
  createInterview,
  getMyInterviews,
  getInterviewById,
} from "../controllers/interviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, authorize("interviewer", "admin"), createInterview);
router.get("/", protect, getMyInterviews);
router.get("/:id", protect, getInterviewById);

export default router;