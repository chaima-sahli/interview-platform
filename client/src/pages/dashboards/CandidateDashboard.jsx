import StatCard from "../../components/StatCard";

const CandidateDashboard = () => {
  return (
    <div>
      <h1 className="font-display font-extrabold text-3xl">Your interview journey 👋</h1>
      <p className="text-charcoal/50 mt-2">
        Track upcoming interviews and past feedback here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <StatCard label="Upcoming interviews" value="0" tint="amber" />
        <StatCard label="Completed" value="0" tint="lilac" />
        <StatCard label="Pending feedback" value="0" tint="sky" />
      </div>

      <div className="mt-10 bg-white rounded-2xl p-6">
        <h2 className="font-display font-bold text-lg mb-1">Next interview</h2>
        <p className="text-charcoal/50 text-sm">
          Nothing scheduled yet — this will populate once scheduling is built.
        </p>
      </div>
    </div>
  );
};

export default CandidateDashboard;