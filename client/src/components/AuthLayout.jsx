const AuthLayout = ({ eyebrow, headline, subtext, children }) => {
  return (
    <div className="min-h-screen flex bg-cream">
      {/* Brand panel — hidden on small screens */}
      <div
        className="hidden md:flex md:w-[45%] relative overflow-hidden p-10 flex-col justify-between"
        style={{
          background: "linear-gradient(135deg, #F7F3EA, #FF6B4A)",
        }}
      >
        <span className="relative font-display font-extrabold text-3xl text-charcoal">*</span>

        <div className="relative">
          <p className="text-charcoal/60 text-sm mb-2">{eyebrow}</p>
          <h2 className="font-display font-extrabold text-3xl text-charcoal leading-snug max-w-sm">
            {headline}
          </h2>
          {subtext && (
            <p className="text-charcoal/60 text-sm mt-4 max-w-xs">{subtext}</p>
          )}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;