import express from "express";
import { getOrCreateConversation, getMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/interviews/:interviewId/conversation", protect, getOrCreateConversation);
router.get("/conversations/:conversationId/messages", protect, getMessages);
router.get("/interviews/:interviewId/conversation", protect, getOrCreateConversation);

export default router;