import { useAuth } from "../context/AuthContext";
import CandidateDashboard from "./dashboards/CandidateDashboard";
import InterviewerDashboard from "./dashboards/InterviewerDashboard";
import { useSocket } from "../hooks/useSocket";

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();

  return (
    <div>
      <p className={`text-xs mb-4 ${isConnected ? "text-green-600" : "text-charcoal/40"}`}>
        {isConnected ? "● Live connection active" : "○ Connecting…"}
      </p>
      {user.role === "interviewer" ? <InterviewerDashboard /> : <CandidateDashboard />}
    </div>
  );
};

export default Dashboard;