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

  // Client sends a message — persist it, then broadcast to everyone
  // in that conversation's room (including the sender, for consistency).
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

  // Simple typing indicator — no persistence, just a live broadcast
  socket.on("typing", ({ conversationId }) => {
    socket.to(conversationId).emit("userTyping", { name: socket.user.name });
  });
};