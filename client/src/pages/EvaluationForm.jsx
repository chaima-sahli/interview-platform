import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/api";
import RatingInput from "../components/RatingInput";
import { RATING_CATEGORIES, RECOMMENDATIONS } from "../utils/evaluationOptions";

const emptyRatings = { technicalSkills: 0, problemSolving: 0, communication: 0, codeQuality: 0 };

const EvaluationForm = () => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [evaluation, setEvaluation] = useState(null); // existing one, if already submitted
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [ratings, setRatings] = useState(emptyRatings);
  const [recommendation, setRecommendation] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    Promise.all([
      api.get(`/interviews/${interviewId}`),
      api.get(`/evaluations/interview/${interviewId}`),
    ])
      .then(([interviewData, evaluationData]) => {
        setInterview(interviewData);
        setEvaluation(evaluationData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [interviewId]);

  const allRated = Object.values(ratings).every((r) => r > 0);
  const canSubmit = allRated && recommendation && !submitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.post(`/evaluations/interview/${interviewId}`, {
        ratings,
        recommendation,
        strengths,
        improvements,
        comments,
      });
      setEvaluation(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-charcoal/50">Loading…</p>;
  if (!interview) return <p className="text-coral">{error || "Interview not found"}</p>;

  const header = (
    <div className="flex items-center gap-3 mb-6">
      <button onClick={() => navigate("/evaluations")} className="text-charcoal/50 hover:text-charcoal">
        <ArrowLeft size={20} />
      </button>
      <div>
        <h1 className="font-display font-extrabold text-2xl">{interview.title}</h1>
        <p className="text-sm text-charcoal/50">
          Candidate: {interview.candidate?.name} ·{" "}
          {new Date(interview.scheduledFor).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );

  // Already submitted: read-only summary
  if (evaluation) {
    const rec = RECOMMENDATIONS.find((r) => r.value === evaluation.recommendation);
    return (
      <div className="max-w-2xl">
        {header}
        <div className="bg-white rounded-2xl p-6 space-y-5">
          <span className="inline-block text-xs font-semibold bg-amber/40 rounded-full px-3 py-1">
            Submitted · {rec?.label}
          </span>

          <div className="space-y-3">
            {RATING_CATEGORIES.map((cat) => (
              <RatingInput key={cat.key} label={cat.label} value={evaluation.ratings[cat.key]} readOnly />
            ))}
          </div>

          {[
            ["Strengths", evaluation.strengths],
            ["Areas to improve", evaluation.improvements],
            ["Additional comments", evaluation.comments],
          ].map(
            ([title, text]) =>
              text && (
                <div key={title}>
                  <p className="text-sm font-semibold mb-1">{title}</p>
                  <p className="text-sm text-charcoal/70 whitespace-pre-wrap">{text}</p>
                </div>
              )
          )}
        </div>
      </div>
    );
  }

  // Not submitted yet: the form
  return (
    <div className="max-w-2xl">
      {header}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-6">
        {error && <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2">{error}</p>}

        <div className="space-y-3">
          {RATING_CATEGORIES.map((cat) => (
            <RatingInput
              key={cat.key}
              label={cat.label}
              value={ratings[cat.key]}
              onChange={(n) => setRatings({ ...ratings, [cat.key]: n })}
            />
          ))}
        </div>

        <div>
          <p className="text-sm font-semibold mb-2">Recommendation</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {RECOMMENDATIONS.map((rec) => (
              <button
                type="button"
                key={rec.value}
                onClick={() => setRecommendation(rec.value)}
                className={`rounded-xl px-3 py-2.5 text-sm border transition ${
                  recommendation === rec.value
                    ? "border-coral bg-coral/10 text-coral font-semibold"
                    : "border-charcoal/10 text-charcoal/50 hover:border-charcoal/30"
                }`}
              >
                {rec.label}
              </button>
            ))}
          </div>
        </div>

        {[
          ["Strengths", strengths, setStrengths],
          ["Areas to improve", improvements, setImprovements],
          ["Additional comments", comments, setComments],
        ].map(([title, value, setter]) => (
          <div key={title}>
            <label className="block text-sm font-semibold mb-1.5">{title}</label>
            <textarea
              rows={3}
              value={value}
              onChange={(e) => setter(e.target.value)}
              className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-coral hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition text-white rounded-full px-6 py-3 text-sm font-semibold"
        >
          {submitting ? "Submitting…" : "Submit evaluation"}
        </button>
      </form>
    </div>
  );
};

export default EvaluationForm;