import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/");
    } catch {
      // error already surfaced via context
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      headline="Run interviews with clarity and confidence."
      subtext="Schedule, chat, pair-code, and evaluate candidates. All in one place."
    >
      <span className="font-display font-extrabold text-xl">
        Interview<span className="text-coral">Hub</span>
      </span>
      <h1 className="font-display font-extrabold text-2xl mt-4">Sign in</h1>
      <p className="text-charcoal/50 text-sm mt-1 mb-6">
        Access your interviews and schedule.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2">{error}</p>
        )}

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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coral hover:opacity-90 disabled:opacity-50 transition text-white rounded-full py-3 text-sm font-semibold mt-2"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-charcoal/50 mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-coral font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;