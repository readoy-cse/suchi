import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider.jsx";
import { AuthPage } from "./features/auth/AuthPage.jsx";
import { AccountPage } from "./features/auth/AccountPage.jsx";
import { AcademicCollectionPage } from "./features/academics/AcademicCollectionPage.jsx";
import { DashboardPage } from "./features/dashboard/DashboardPage.jsx";
import { NotificationLogsPage } from "./features/notifications/NotificationLogsPage.jsx";
import { EventsPage, MySubmissionsPage, ReviewQueuePage, SubmissionFormPage } from "./features/submissions/SubmissionPages.jsx";
import { useAuth } from "./features/auth/useAuth.js";
import { UsersPage } from "./features/users/UsersPage.jsx";

function LoadingPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f4f4ef] text-sm text-[#63756d]" role="status">
      Loading your Suchi workspace...
    </main>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage />;
  return user ? <Navigate to="/" replace /> : children;
}

function UsersRoute() {
  const { user } = useAuth();
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return <UsersPage />;
}

export default function AppShell() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><AuthPage mode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><AuthPage mode="register" /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/routines" element={<ProtectedRoute><AcademicCollectionPage type="routines" /></ProtectedRoute>} />
        <Route path="/routines/create" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="routines" mode="create" /></ProtectedRoute>} />
        <Route path="/routines/edit/:id" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="routines" mode="edit" /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute><AcademicCollectionPage type="exams" /></ProtectedRoute>} />
        <Route path="/exams/create" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="exams" mode="create" /></ProtectedRoute>} />
        <Route path="/exams/edit/:id" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="exams" mode="edit" /></ProtectedRoute>} />
        <Route path="/notices" element={<ProtectedRoute><AcademicCollectionPage type="notices" /></ProtectedRoute>} />
        <Route path="/notices/create" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="notices" mode="create" /></ProtectedRoute>} />
        <Route path="/notices/edit/:id" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="notices" mode="edit" /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/contribute" element={<ProtectedRoute><SubmissionFormPage /></ProtectedRoute>} />
        <Route path="/submissions/mine" element={<ProtectedRoute><MySubmissionsPage /></ProtectedRoute>} />
        <Route path="/submissions/review" element={<ProtectedRoute roles={["admin", "cr"]}><ReviewQueuePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={["admin", "cr"]}><NotificationLogsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UsersRoute /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
