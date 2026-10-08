const RatingInput = ({ label, value, onChange, readOnly = false }) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-semibold">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition ${
              value === n
                ? "bg-coral text-white"
                : "bg-cream text-charcoal/50 hover:bg-charcoal/10"
            } ${readOnly ? "cursor-default" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingInput;