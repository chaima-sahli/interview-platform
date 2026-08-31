import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import { interviewTypeStyles } from "../utils/interviewTypeStyles";

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChats = () => {
    Promise.all([api.get("/interviews"), api.get("/chat/conversations")])
      .then(([interviews, conversations]) => {
        console.log("interviews:", interviews); // add this
        console.log("conversations:", conversations);
        // Only interviews with a registered candidate can chat
        const eligible = interviews.filter((i) => i.candidate);
        console.log("eligible (has candidate):", eligible); // add this

        // Index existing conversations by interview id for quick lookup
        const byInterviewId = new Map(
          conversations.map((c) => [c.interview?._id, c]),
        );

        const merged = eligible.map((interview) => {
          const conv = byInterviewId.get(interview._id);
          const otherParty =
            user.role === "interviewer"
              ? interview.candidate
              : interview.interviewer;

          return {
            interviewId: interview._id,
            title: interview.title,
            type: interview.type,
            otherPartyName: otherParty?.name,
            unreadCount: conv?.unreadCount || 0,
            lastMessageAt: conv?.lastMessageAt || interview.createdAt,
          };
        });

        merged.sort(
          (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
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
      <h1 className='font-display font-extrabold text-3xl'>Chat</h1>
      <p className='text-charcoal/50 mt-2'>Pick a conversation to open it.</p>

      {loading ? (
        <p className='text-charcoal/50 mt-8'>Loading…</p>
      ) : rows.length === 0 ? (
        <p className='text-charcoal/50 mt-8'>
          No conversations yet — chat becomes available once an interview has a
          registered candidate.
        </p>
      ) : (
        <div className='mt-8 space-y-2'>
          {rows.map((row) => {
            const style =
              interviewTypeStyles[row.type] || interviewTypeStyles.technical;

            return (
              <button
                key={row.interviewId}
                onClick={() => navigate(`/chat/${row.interviewId}`)}
                className='w-full flex items-center gap-4 bg-white hover:bg-cream/60 transition rounded-2xl p-4 text-left'
              >
                <div
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center ${style.badge}`}
                >
                  <MessageSquare size={18} className='text-charcoal' />
                  {row.unreadCount > 0 && (
                    <span className='absolute -top-1 -right-1 bg-coral text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center'>
                      {row.unreadCount > 9 ? "9+" : row.unreadCount}
                    </span>
                  )}
                </div>
                <div className='flex-1'>
                  <p
                    className={
                      row.unreadCount > 0 ? "font-bold" : "font-semibold"
                    }
                  >
                    {row.otherPartyName}
                  </p>
                  <p className='text-sm text-charcoal/50'>{row.title}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
