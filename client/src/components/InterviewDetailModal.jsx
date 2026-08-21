import { X, Clock, Mail, FileText } from "lucide-react";
import { interviewTypeStyles } from "../utils/interviewTypeStyles";
import { useAuth } from "../context/AuthContext";

const InterviewDetailModal = ({ interview, onClose }) => {
  const { user } = useAuth();
  if (!interview) return null;

  const style = interviewTypeStyles[interview.type] || interviewTypeStyles.technical;
  const isPending = user.role === "interviewer" && !interview.candidate;

  const dateLabel = new Date(interview.scheduledFor).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 bg-charcoal/40 flex items-center justify-center px-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${style.badge} text-charcoal`}>
            {style.label}
          </span>
          <button onClick={onClose} className="text-charcoal/40 hover:text-charcoal">
            <X size={20} />
          </button>
        </div>

        <h2 className="font-display font-extrabold text-2xl mt-4">{interview.title}</h2>

        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center gap-2 text-charcoal/70">
            <Clock size={16} />
            <span>{dateLabel} · {interview.durationMinutes} min</span>
          </div>

          <div className="flex items-center gap-2 text-charcoal/70">
            <Mail size={16} />
            {isPending ? (
              <span>{interview.candidateEmail} <span className="text-coral font-medium">(pending signup)</span></span>
            ) : (
              <span>
                Candidate: {interview.candidate?.name} ({interview.candidate?.email})
              </span>
            )}
          </div>

          <div className="text-charcoal/70">
            Interviewer: {interview.interviewer?.name} ({interview.interviewer?.email})
          </div>

          {interview.notes && (
            <div className="flex items-start gap-2 text-charcoal/70 pt-2 border-t border-charcoal/10">
              <FileText size={16} className="mt-0.5 shrink-0" />
              <span>{interview.notes}</span>
            </div>
          )}
        </div>

        <span className="inline-block mt-5 text-xs font-medium text-charcoal/50 bg-cream rounded-full px-3 py-1 capitalize">
          {interview.status}
        </span>
      </div>
    </div>
  );
};

export default InterviewDetailModal;