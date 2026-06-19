import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Lesson from "../pages/Lesson";
import QuizPage from "../pages/QuizPage";
import ExamPage from "../pages/ExamPage";
import CertificatePage from "../pages/CertificatePage";

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user);
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/course/:courseId/day/:n"
        element={
          <RequireAuth>
            <Lesson />
          </RequireAuth>
        }
      />
      <Route
        path="/course/:courseId/day/:n/quiz"
        element={
          <RequireAuth>
            <QuizPage />
          </RequireAuth>
        }
      />
      <Route
        path="/course/:courseId/exam"
        element={
          <RequireAuth>
            <ExamPage />
          </RequireAuth>
        }
      />
      <Route
        path="/course/:courseId/certificate"
        element={
          <RequireAuth>
            <CertificatePage />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}