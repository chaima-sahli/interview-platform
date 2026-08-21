import { Clock } from "lucide-react";
import { interviewTypeStyles } from "../utils/interviewTypeStyles";
import { useAuth } from "../context/AuthContext";

const InterviewCard = ({ interview }) => {
  const { user } = useAuth();
  const style = interviewTypeStyles[interview.type] || interviewTypeStyles.technical;

  const otherParty = user.role === "interviewer" ? interview.candidate : interview.interviewer;
  const dateLabel = new Date(interview.scheduledFor).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className={`rounded-2xl p-5 ${style.bg}`}>
      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge} text-charcoal`}>
        {style.label}
      </span>

      <h3 className="font-display font-bold text-lg mt-3">{interview.title}</h3>

      <p className="text-sm text-charcoal/60 mt-1">
        with {otherParty?.name || "—"}
      </p>

      <div className="flex items-center gap-1.5 text-sm text-charcoal/50 mt-3">
        <Clock size={14} />
        <span>{dateLabel} · {interview.durationMinutes} min</span>
      </div>
    </div>
  );
};

export default InterviewCard;