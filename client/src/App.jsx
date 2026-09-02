import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import VerifyEmail from "./pages/VerifyEmail.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PolicyGenerator from "./pages/PolicyGenerator.jsx";
import Templates from "./pages/Templates.jsx";
import PolicyEditorPage from "./pages/PolicyEditorPage.jsx";
import GapAnalyzer from "./pages/GapAnalyzer.jsx";
import Auditor from "./pages/Auditor.jsx";
import Acknowledgments from "./pages/Acknowledgments.jsx";
import Regulations from "./pages/Regulations.jsx";
import Chatbot from "./pages/Chatbot.jsx";
import Workflows from "./pages/Workflows.jsx";
import Calendar from "./pages/Calendar.jsx";
import Reports from "./pages/Reports.jsx";
import Organization from "./pages/Organization.jsx";
import Activity from "./pages/Activity.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading secure session…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route
        path="/app"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="generator" element={<PolicyGenerator />} />
        <Route path="templates" element={<Templates />} />
        <Route path="editor/:id" element={<PolicyEditorPage />} />
        <Route path="gap" element={<GapAnalyzer />} />
        <Route path="auditor" element={<Auditor />} />
        <Route path="acknowledgments" element={<Acknowledgments />} />
        <Route path="regulations" element={<Regulations />} />
        <Route path="chat" element={<Chatbot />} />
        <Route path="workflows" element={<Workflows />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="reports" element={<Reports />} />
        <Route path="organization" element={<Organization />} />
        <Route path="activity" element={<Activity />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
