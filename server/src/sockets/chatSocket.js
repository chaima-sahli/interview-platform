import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";

/**
 * Registers all chat-related event listeners on a single connected socket.
 * Called once per connection from server.js.
 */
export const registerChatHandlers = (io, socket) => {
  socket.on("joinConversation", async (conversationId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === socket.user.id
    );
    if (!isParticipant) return;

    socket.join(conversationId);
  });

  // Mark every message in this conversation as read by the current user,
  // then let the room know (so unread badges can clear in real time).
  socket.on("markAsRead", async (conversationId) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return;

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === socket.user.id
    );
    if (!isParticipant) return;

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
    if (!conversation) return;

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === socket.user.id
    );
    if (!isParticipant) return;

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