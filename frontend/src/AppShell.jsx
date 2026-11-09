import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider.jsx";
import { AuthPage } from "./features/auth/AuthPage.jsx";
import { AccountPage } from "./features/auth/AccountPage.jsx";
import { AcademicCollectionPage, AcademicDetailPage } from "./features/academics/AcademicCollectionPage.jsx";
import { DashboardPage } from "./features/dashboard/DashboardPage.jsx";
import { NotificationLogsPage } from "./features/notifications/NotificationLogsPage.jsx";
import { EventsPage, MySubmissionsPage, ReviewQueuePage, SubmissionFormPage } from "./features/submissions/SubmissionPages.jsx";
import { useAuth } from "./features/auth/useAuth.js";
import { UserDetailPage, UsersPage } from "./features/users/UsersPage.jsx";

function LoadingPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f4f4ef] px-5 text-[#17392f]" role="status" aria-live="polite">
      <div aria-hidden="true" className="absolute -left-24 -top-24 size-72 rounded-full bg-[#d6ef79]/25 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -right-20 size-80 rounded-full bg-[#a75a3b]/10 blur-3xl" />
      <section className="relative flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/80 bg-[#fbfbf8]/85 px-8 py-10 text-center shadow-[0_24px_80px_-40px_rgba(23,57,47,0.3)] backdrop-blur-sm">
        <div className="relative mb-7 grid size-24 place-items-center">
          <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-[#d8ddd5] border-t-[#a75a3b] border-r-[#17392f] animate-spin [animation-duration:1.8s]" />
          <span aria-hidden="true" className="absolute inset-2 rounded-full border border-dashed border-[#cbd4cb] animate-[spin_8s_linear_infinite_reverse]" />
          <span className="font-bengali text-3xl font-bold text-[#17392f]">সূচি</span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a75a3b]">Your class, in context</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Getting things ready</h1>
        <p className="mt-2 text-sm text-[#63756d]">Loading your Suchi workspace</p>
        <div aria-hidden="true" className="mt-6 flex items-center gap-1.5">
          <span className="size-1.5 animate-bounce rounded-full bg-[#a75a3b] [animation-delay:-0.3s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-[#17392f] [animation-delay:-0.15s]" />
          <span className="size-1.5 animate-bounce rounded-full bg-[#a75a3b]" />
        </div>
      </section>
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
        <Route path="/routines/:id" element={<ProtectedRoute><AcademicDetailPage type="routines" /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute><AcademicCollectionPage type="exams" /></ProtectedRoute>} />
        <Route path="/exams/create" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="exams" mode="create" /></ProtectedRoute>} />
        <Route path="/exams/edit/:id" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="exams" mode="edit" /></ProtectedRoute>} />
        <Route path="/exams/:id" element={<ProtectedRoute><AcademicDetailPage type="exams" /></ProtectedRoute>} />
        <Route path="/notices" element={<ProtectedRoute><AcademicCollectionPage type="notices" /></ProtectedRoute>} />
        <Route path="/notices/create" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="notices" mode="create" /></ProtectedRoute>} />
        <Route path="/notices/edit/:id" element={<ProtectedRoute roles={["admin", "cr"]}><AcademicCollectionPage type="notices" mode="edit" /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
        <Route path="/contribute" element={<ProtectedRoute><SubmissionFormPage /></ProtectedRoute>} />
        <Route path="/submissions/mine" element={<ProtectedRoute><MySubmissionsPage /></ProtectedRoute>} />
        <Route path="/submissions/review" element={<ProtectedRoute roles={["admin", "cr"]}><ReviewQueuePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute roles={["admin", "cr"]}><NotificationLogsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={["admin"]}><UsersPage /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute roles={["admin"]}><UserDetailPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
