import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

const Chat = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  // Load (or create) the conversation, then its message history
  useEffect(() => {
    let active = true;

    api
      .get(`/chat/interviews/${interviewId}/conversation`)
      .then((conv) => {
        if (!active) return;
        setConversation(conv);
        return api.get(`/chat/conversations/${conv._id}/messages`);
      })
      .then((msgs) => {
        if (active && msgs) setMessages(msgs);
      })
      .catch((err) => setError(err.message));

    return () => {
      active = false;
    };
  }, [interviewId]);

  // Join the socket room once we know the conversation and the socket is ready
  useEffect(() => {
    if (!socket || !conversation) return;
    socket.emit("joinConversation", conversation._id);
  }, [socket, conversation]);

  // Listen for incoming messages
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (msg) => setMessages((prev) => [...prev, msg]);
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket || !conversation) return;
    socket.emit("sendMessage", { conversationId: conversation._id, text });
    setText("");
  };

  if (error) {
    return <p className="text-coral">{error}</p>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-charcoal/10">
        <button onClick={() => navigate("/chat")} className="text-charcoal/50 hover:text-charcoal">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="font-display font-bold text-lg">Conversation</h2>
          <p className="text-xs text-charcoal/40">
            {isConnected ? "Connected" : "Connecting…"}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender._id === user._id;
          return (
            <div key={msg._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                  isMine ? "bg-coral text-white" : "bg-white text-charcoal"
                }`}
              >
                {!isMine && (
                  <p className="text-xs font-semibold mb-0.5 opacity-70">{msg.sender.name}</p>
                )}
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 pt-4 border-t border-charcoal/10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-white border border-charcoal/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="bg-coral hover:opacity-90 disabled:opacity-50 transition text-white rounded-full p-2.5"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default Chat;