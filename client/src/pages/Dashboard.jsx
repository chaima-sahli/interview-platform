import { useAuth } from "../context/AuthContext";
import CandidateDashboard from "./dashboards/CandidateDashboard";
import InterviewerDashboard from "./dashboards/InterviewerDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (user.role === "interviewer") return <InterviewerDashboard />;
  return <CandidateDashboard />;
};

export default Dashboard;