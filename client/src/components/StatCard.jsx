const tintClasses = {
  amber: "bg-amber/20 text-charcoal",
  lilac: "bg-lilac/30 text-charcoal",
  sky: "bg-sky/30 text-charcoal",
};

const StatCard = ({ label, value, tint = "amber" }) => {
  return (
    <div className={`rounded-2xl p-5 ${tintClasses[tint]}`}>
      <p className="text-sm opacity-70">{label}</p>
      <p className="font-display font-extrabold text-3xl mt-2">{value}</p>
    </div>
  );
};

export default StatCard;