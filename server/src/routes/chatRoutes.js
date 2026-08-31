import express from "express";
import { getOrCreateConversationWith, getMessages, getMyConversations } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/conversations", protect, getMyConversations);
router.get("/with/:userId", protect, getOrCreateConversationWith);
router.get("/conversations/:conversationId/messages", protect, getMessages);

export default router;