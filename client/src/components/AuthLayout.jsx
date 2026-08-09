const AuthLayout = ({ eyebrow, headline, subtext, children }) => {
  return (
    <div className="min-h-screen flex bg-cream">
      {/* Brand panel — hidden on small screens */}
      <div className="hidden md:flex md:w-[45%] relative overflow-hidden bg-gradient-to-br from-charcoal via-charcoal to-coral/60 p-10 flex-col justify-between">
        <span className="font-display font-extrabold text-3xl text-amber">*</span>

        <div>
          <p className="text-cream/60 text-sm mb-2">{eyebrow}</p>
          <h2 className="font-display font-extrabold text-3xl text-cream leading-snug max-w-sm">
            {headline}
          </h2>
          {subtext && (
            <p className="text-cream/60 text-sm mt-4 max-w-xs">{subtext}</p>
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