import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Interview from "../models/Interview.js";


export const getOrCreateConversation = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.interviewId);

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const isParticipant =
      interview.interviewer.equals(req.user._id) ||
      (interview.candidate && interview.candidate.equals(req.user._id));

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to access this conversation" });
    }

    if (!interview.candidate) {
      return res.status(400).json({
        message: "Chat isn't available yet — the candidate hasn't created an account",
      });
    }

    let conversation = await Conversation.findOne({ interview: interview._id });

    if (!conversation) {
      conversation = await Conversation.create({
        interview: interview._id,
        participants: [interview.interviewer, interview.candidate],
      });
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};


export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((p) => p.equals(req.user._id))) {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate("interview", "title type")
      .populate("participants", "name email")
      .sort({ lastMessageAt: -1 });

    const withUnreadCounts = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          readBy: { $ne: req.user._id },
        });

        const otherParticipant = conv.participants.find(
          (p) => !p._id.equals(req.user._id)
        );

        return {
          _id: conv._id,
          interview: conv.interview,
          otherParticipant,
          lastMessageAt: conv.lastMessageAt,
          unreadCount,
        };
      })
    );

    res.json(withUnreadCounts);
  } catch (error) {
    next(error);
  }
};