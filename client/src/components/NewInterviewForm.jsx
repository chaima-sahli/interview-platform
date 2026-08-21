import { useState } from "react";
import api from "../api/api";

const NewInterviewForm = ({ onCreated, onClose }) => {
  const [form, setForm] = useState({
    candidateEmail: "",
    title: "",
    type: "technical",
    scheduledFor: "",
    durationMinutes: 45,
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const created = await api.post("/interviews", {
        ...form,
        scheduledFor: new Date(form.scheduledFor).toISOString(),
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 space-y-4 mb-6">
      {error && <p className="text-sm text-coral bg-coral/10 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <label className="block text-sm font-semibold mb-1.5">Candidate email</label>
        <input
          type="email"
          name="candidateEmail"
          required
          value={form.candidateEmail}
          onChange={handleChange}
          className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Interview title</label>
        <input
          type="text"
          name="title"
          required
          placeholder="Frontend Technical Round"
          value={form.title}
          onChange={handleChange}
          className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1.5">Type</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
          >
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="system-design">System Design</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Duration (min)</label>
          <input
            type="number"
            name="durationMinutes"
            min="15"
            step="15"
            value={form.durationMinutes}
            onChange={handleChange}
            className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1.5">Date & time</label>
        <input
          type="datetime-local"
          name="scheduledFor"
          required
          value={form.scheduledFor}
          onChange={handleChange}
          className="w-full bg-cream border border-charcoal/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-coral hover:opacity-90 disabled:opacity-50 transition text-white rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          {loading ? "Scheduling…" : "Schedule interview"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-charcoal/50 hover:text-charcoal text-sm font-medium px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default NewInterviewForm;