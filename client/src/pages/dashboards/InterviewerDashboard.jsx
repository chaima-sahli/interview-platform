import StatCard from "../../components/StatCard";

const InterviewerDashboard = () => {
  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl">Your interview panel 🎯</h1>
      <p className="text-charcoal/50 mt-2">
        Manage your interview schedule and pending evaluations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <StatCard label="Interviews today" value="0" tint="amber" />
        <StatCard label="This week" value="0" tint="lilac" />
        <StatCard label="Evaluations due" value="0" tint="sky" />
      </div>

      <div className="mt-10 bg-white rounded-2xl p-6">
        <h2 className="font-display font-bold text-lg mb-1">Upcoming candidates</h2>
        <p className="text-charcoal/50 text-sm">
          No interviews scheduled yet — this will populate once scheduling is built.
        </p>
      </div>
    </div>
  );
};

export default InterviewerDashboard;