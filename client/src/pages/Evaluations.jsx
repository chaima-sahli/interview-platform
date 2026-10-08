import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, CheckCircle2 } from "lucide-react";
import api from "../api/api";
import { RECOMMENDATIONS } from "../utils/evaluationOptions";

const Evaluations = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [done, setDone] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/interviews"), api.get("/evaluations")])
      .then(([interviews, evaluations]) => {
        const evaluatedIds = new Set(evaluations.map((e) => e.interview?._id));
        const now = new Date();

        setPending(
          interviews.filter(
            (i) =>
              i.candidate &&
              i.status !== "cancelled" &&
              new Date(i.scheduledFor) <= now &&
              !evaluatedIds.has(i._id)
          )
        );
        setDone(evaluations);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-charcoal/50">Loading…</p>;

  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl">Evaluations</h1>
      <p className="text-charcoal/50 mt-2">Write feedback for the interviews you've run.</p>

      <h2 className="font-display font-bold text-lg mt-8 mb-3">Needs your feedback</h2>
      {pending.length === 0 ? (
        <p className="text-charcoal/50 text-sm">You're all caught up.</p>
      ) : (
        <div className="space-y-2">
          {pending.map((interview) => (
            <button
              key={interview._id}
              onClick={() => navigate(`/evaluations/${interview._id}`)}
              className="w-full flex items-center gap-4 bg-white hover:bg-cream/60 transition rounded-2xl p-4 text-left"
            >
              <div className="w-10 h-10 rounded-full bg-amber/40 flex items-center justify-center">
                <ClipboardList size={18} />
              </div>
              <div>
                <p className="font-semibold">{interview.candidate.name}</p>
                <p className="text-sm text-charcoal/50">{interview.title}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <h2 className="font-display font-bold text-lg mt-10 mb-3">Submitted</h2>
      {done.length === 0 ? (
        <p className="text-charcoal/50 text-sm">No evaluations submitted yet.</p>
      ) : (
        <div className="space-y-2">
          {done.map((evaluation) => {
            const rec = RECOMMENDATIONS.find((r) => r.value === evaluation.recommendation);
            return (
              <button
                key={evaluation._id}
                onClick={() => navigate(`/evaluations/${evaluation.interview._id}`)}
                className="w-full flex items-center gap-4 bg-white hover:bg-cream/60 transition rounded-2xl p-4 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-sky/40 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{evaluation.candidate?.name}</p>
                  <p className="text-sm text-charcoal/50">{evaluation.interview?.title}</p>
                </div>
                <span className="text-xs font-semibold bg-cream rounded-full px-3 py-1">{rec?.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Evaluations;