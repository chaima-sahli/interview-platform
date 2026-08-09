import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "candidate" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch {
      // error already surfaced via context
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      headline="Access your interviews, evaluations, and schedule anytime."
      subtext="Create an account as a candidate or an interviewer to get going."
    >
      <span className="font-display font-extrabold text-xl">
        Interview<span className="text-coral">Hub</span>
      </span>
      <h1 className="font-display font-extrabold text-2xl mt-4">Create an account</h1>
      <p className="text-charcoal/50 text-sm mt-1 mb-6">
        Keep everything flowing in one place.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2">{error}</p>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1.5">Your name</label>
          <input
            type="text"
            name="name"
            required
            placeholder="Jane Doe"
            value={form.name}
            onChange={handleChange}
            className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Your email</label>
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              minLength={6}
              placeholder="••••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">I am a</label>
          <div className="grid grid-cols-2 gap-2">
            {["candidate", "interviewer"].map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setForm({ ...form, role })}
                className={`rounded-xl px-3 py-2.5 text-sm border transition capitalize ${
                  form.role === role
                    ? "border-coral bg-coral/10 text-coral font-semibold"
                    : "border-charcoal/10 text-charcoal/50 hover:border-charcoal/30"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coral hover:opacity-90 disabled:opacity-50 transition text-white rounded-full py-3 text-sm font-semibold mt-2"
        >
          {loading ? "Creating account…" : "Get Started"}
        </button>
      </form>

      <p className="text-center text-sm text-charcoal/50 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-coral font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;