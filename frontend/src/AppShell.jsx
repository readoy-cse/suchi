import { Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthProvider.jsx";
import { AuthPage } from "./features/auth/AuthPage.jsx";
import { AcademicCollectionPage } from "./features/academics/AcademicCollectionPage.jsx";
import { NotificationLogsPage } from "./features/notifications/NotificationLogsPage.jsx";
import { EventsPage, MySubmissionsPage, ReviewQueuePage, SubmissionFormPage } from "./features/submissions/SubmissionPages.jsx";
import { useAuth } from "./features/auth/useAuth.js";
import { UsersPage } from "./features/users/UsersPage.jsx";
import { WorkspaceLayout } from "./layouts/WorkspaceLayout.jsx";

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

function DashboardPage() {
  const { user } = useAuth();
  const dashboardCopy = {
    admin: { title: "Admin workspace", description: "Manage accounts and keep the class workspace running." },
    cr: { title: "CR workspace", description: "Your class representative workspace is ready." },
    student: { title: "Your academic home", description: "Your Suchi account is ready. Class updates will appear here as they are published." },
  }[user.role];

  return (
    <WorkspaceLayout>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a75a3b]">{user.role} account</p>
        <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">{dashboardCopy.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#63756d]">{dashboardCopy.description}</p>
        <section className="mt-10 border-y border-[#d8ddd5] py-6" aria-labelledby="account-heading">
          <h2 className="text-lg font-semibold" id="account-heading">Account</h2>
          <dl className="mt-5 grid gap-5 sm:grid-cols-3">
            <div><dt className="text-xs uppercase tracking-[0.12em] text-[#849189]">Name</dt><dd className="mt-1 text-sm font-medium">{user.name}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-[#849189]">Email</dt><dd className="mt-1 break-all text-sm font-medium">{user.email}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.12em] text-[#849189]">Account status</dt><dd className="mt-1 text-sm font-medium">{user.isActive ? "Active" : "Inactive"}</dd></div>
          </dl>
        </section>
        {user.role === "admin" && (
          <section className="mt-8 border-b border-[#d8ddd5] py-6" aria-labelledby="admin-tools-heading">
            <h2 className="text-lg font-semibold" id="admin-tools-heading">Administration</h2>
            <p className="mt-2 text-sm text-[#63756d]">Review accounts and assign student or CR access.</p>
            <Link className="mt-4 inline-flex rounded-lg bg-[#17392f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245444] focus:outline-none focus:ring-2 focus:ring-[#a75a3b]" to="/users">Manage users</Link>
          </section>
        )}
      </main>
    </WorkspaceLayout>
  );
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
        <Route path="/routines" element={<ProtectedRoute><AcademicCollectionPage type="routines" /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute><AcademicCollectionPage type="exams" /></ProtectedRoute>} />
        <Route path="/notices" element={<ProtectedRoute><AcademicCollectionPage type="notices" /></ProtectedRoute>} />
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