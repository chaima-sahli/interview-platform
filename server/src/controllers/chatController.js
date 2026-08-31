import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";


export const getOrCreateConversationWith = async (req, res, next) => {
  try {
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.user.role === otherUser.role) {
      return res.status(400).json({ message: "Chat is only between a candidate and an interviewer" });
    }

    const interviewerId = req.user.role === "interviewer" ? req.user._id : otherUser._id;
    const candidateId = req.user.role === "candidate" ? req.user._id : otherUser._id;

    let conversation = await Conversation.findOne({ interviewer: interviewerId, candidate: candidateId });

    if (!conversation) {
      conversation = await Conversation.create({ interviewer: interviewerId, candidate: candidateId });
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

    const isParticipant =
      conversation.interviewer.equals(req.user._id) || conversation.candidate.equals(req.user._id);
    if (!isParticipant) {
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
    const filter = req.user.role === "interviewer" ? { interviewer: req.user._id } : { candidate: req.user._id };

    const conversations = await Conversation.find(filter)
      .populate("interviewer", "name email")
      .populate("candidate", "name email")
      .sort({ lastMessageAt: -1 });

    const withUnreadCounts = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          readBy: { $ne: req.user._id },
        });

        const otherParticipant = req.user.role === "interviewer" ? conv.candidate : conv.interviewer;

        return {
          _id: conv._id,
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