import express from "express";
import {
  createEvaluation,
  getEvaluationForInterview,
  getMyEvaluations,
} from "../controllers/evaluationController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, authorize("interviewer", "admin"), getMyEvaluations);
router.post("/interview/:interviewId", protect, authorize("interviewer", "admin"), createEvaluation);
router.get("/interview/:interviewId", protect, authorize("interviewer", "admin"), getEvaluationForInterview);

export default router;