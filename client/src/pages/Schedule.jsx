import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import InterviewCard from "../components/InterviewCard";
import NewInterviewForm from "../components/NewInterviewForm";

const Schedule = () => {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api
      .get("/interviews")
      .then(setInterviews)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-extrabold text-3xl">Schedule</h1>
          <p className="text-charcoal/50 mt-2">
            {user.role === "interviewer" ? "Interviews you're running" : "Your upcoming interviews"}
          </p>
        </div>

        {user.role === "interviewer" && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 bg-charcoal text-cream rounded-full px-4 py-2.5 text-sm font-semibold hover:opacity-90 transition"
          >
            <Plus size={16} /> New interview
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-6">
          <NewInterviewForm
            onCreated={(created) => setInterviews((prev) => [...prev, created])}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      {loading ? (
        <p className="text-charcoal/50 mt-8">Loading…</p>
      ) : interviews.length === 0 ? (
        <p className="text-charcoal/50 mt-8">No interviews scheduled yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {interviews.map((interview) => (
            <InterviewCard key={interview._id} interview={interview} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;