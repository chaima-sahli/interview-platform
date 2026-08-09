import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarClock,
  MessageSquare,
  Video,
  Code2,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/schedule", icon: CalendarClock, label: "Schedule" },
  { to: "/chat", icon: MessageSquare, label: "Chat" },
  { to: "/interviews", icon: Video, label: "Interviews" },
  { to: "/code", icon: Code2, label: "Code Editor" },
  { to: "/evaluations", icon: ClipboardList, label: "Evaluations" },
];

const Sidebar = () => {
  const { logout } = useAuth();

  return (
    <aside className="w-20 bg-charcoal rounded-l-xl2 flex flex-col items-center py-6 justify-between">
      <div className="flex flex-col items-center gap-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={label}
            className={({ isActive }) =>
              `w-11 h-11 rounded-xl flex items-center justify-center transition ${
                isActive
                  ? "bg-amber text-charcoal"
                  : "text-cream/50 hover:text-cream hover:bg-white/5"
              }`
            }
          >
            <Icon size={20} strokeWidth={2} />
          </NavLink>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          title="Settings"
          className="w-11 h-11 rounded-xl flex items-center justify-center text-cream/50 hover:text-cream hover:bg-white/5 transition"
        >
          <Settings size={20} />
        </button>
        <button
          title="Log out"
          onClick={logout}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-cream/50 hover:text-coral hover:bg-white/5 transition"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;