import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

const isParticipant = (conversation, userId) =>
  conversation.interviewer.toString() === userId || conversation.candidate.toString() === userId;

export const registerChatHandlers = (io, socket) => {
  socket.on("joinConversation", async (conversationId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isParticipant(conversation, socket.user.id)) return;
    socket.join(conversationId);
  });

  socket.on("markAsRead", async (conversationId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isParticipant(conversation, socket.user.id)) return;

    await Message.updateMany(
      { conversation: conversationId, readBy: { $ne: socket.user.id } },
      { $addToSet: { readBy: socket.user.id } }
    );

    io.to(conversationId).emit("conversationRead", {
      conversationId,
      readerId: socket.user.id,
    });
  });

  socket.on("sendMessage", async ({ conversationId, text }) => {
    if (!text?.trim()) return;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !isParticipant(conversation, socket.user.id)) return;

    const message = await Message.create({
      conversation: conversationId,
      sender: socket.user.id,
      text: text.trim(),
      readBy: [socket.user.id],
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await message.populate("sender", "name");

    io.to(conversationId).emit("newMessage", populated);
  });

  socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("userTyping", { name: socket.user.name });
  });
};