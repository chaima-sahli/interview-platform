import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChats = () => {
    Promise.all([api.get("/interviews"), api.get("/chat/conversations")])
      .then(([interviews, conversations]) => {
        // Build one row per unique person you've interviewed/been interviewed by
        const peopleById = new Map();

        interviews
          .filter((i) => i.candidate) // chat only available once candidate has an account
          .forEach((interview) => {
            const otherParty = user.role === "interviewer" ? interview.candidate : interview.interviewer;
            if (!otherParty) return;
            if (!peopleById.has(otherParty._id)) {
              peopleById.set(otherParty._id, { userId: otherParty._id, name: otherParty.name });
            }
          });

        // Layer unread counts / last activity from actual conversations, if any exist
        conversations.forEach((conv) => {
          const otherId = conv.otherParticipant?._id;
          if (!otherId || !peopleById.has(otherId)) return;
          const entry = peopleById.get(otherId);
          entry.unreadCount = conv.unreadCount;
          entry.lastMessageAt = conv.lastMessageAt;
        });

        const merged = Array.from(peopleById.values()).sort(
          (a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0)
        );

        setRows(merged);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("newMessage", loadChats);
    socket.on("conversationRead", loadChats);
    return () => {
      socket.off("newMessage", loadChats);
      socket.off("conversationRead", loadChats);
    };
  }, [socket]);

  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl">Chat</h1>
      <p className="text-charcoal/50 mt-2">Pick someone to open your conversation.</p>

      {loading ? (
        <p className="text-charcoal/50 mt-8">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-charcoal/50 mt-8">
          No conversations yet — chat becomes available once an interview has a registered candidate.
        </p>
      ) : (
        <div className="mt-8 space-y-2">
          {rows.map((row) => (
            <button
              key={row.userId}
              onClick={() => navigate(`/chat/${row.userId}`)}
              className="w-full flex items-center gap-4 bg-white hover:bg-cream/60 transition rounded-2xl p-4 text-left"
            >
              <div className="relative w-10 h-10 rounded-full bg-lilac/40 flex items-center justify-center">
                <MessageSquare size={18} className="text-charcoal" />
                {row.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-coral text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {row.unreadCount > 9 ? "9+" : row.unreadCount}
                  </span>
                )}
              </div>
              <p className={row.unreadCount > 0 ? "font-bold" : "font-semibold"}>{row.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatList;