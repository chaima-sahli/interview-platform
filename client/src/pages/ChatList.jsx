import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { interviewTypeStyles } from "../utils/interviewTypeStyles";

const ChatList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/interviews")
      .then((data) => setInterviews(data.filter((i) => i.candidate))) // hide pending invites
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl">Chat</h1>
      <p className="text-charcoal/50 mt-2">Pick an interview to open its conversation.</p>

      {loading ? (
        <p className="text-charcoal/50 mt-8">Loading…</p>
      ) : interviews.length === 0 ? (
        <p className="text-charcoal/50 mt-8">No conversations available yet.</p>
      ) : (
        <div className="mt-8 space-y-2">
          {interviews.map((interview) => {
            const style = interviewTypeStyles[interview.type] || interviewTypeStyles.technical;
            const otherParty = user.role === "interviewer" ? interview.candidate : interview.interviewer;

            return (
              <button
                key={interview._id}
                onClick={() => navigate(`/chat/${interview._id}`)}
                className="w-full flex items-center gap-4 bg-white hover:bg-cream/60 transition rounded-2xl p-4 text-left"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.badge}`}>
                  <MessageSquare size={18} className="text-charcoal" />
                </div>
                <div>
                  <p className="font-semibold">{interview.title}</p>
                  <p className="text-sm text-charcoal/50">with {otherParty?.name}</p>
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