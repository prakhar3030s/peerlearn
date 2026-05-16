import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CommandPaletteProvider } from "./contexts/CommandPaletteContext.jsx";
import RoleGuard from "./components/RoleGuard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import Navbar from "./components/Navbar.jsx";
import VideoCard from "./components/ui/VideoCard.jsx";
import { SkeletonBlock, SkeletonText } from "./components/ui/Skeleton.jsx";

const VideoPage = lazy(() => import("./pages/VideoPage.jsx"));
const Browse = lazy(() => import("./pages/Browse.jsx"));
const Submit = lazy(() => import("./pages/Submit.jsx"));
const MySubmissions = lazy(() => import("./pages/MySubmissions.jsx"));
const Moderation = lazy(() => import("./pages/Moderation.jsx"));
const ModerationDetail = lazy(() => import("./pages/ModerationDetail.jsx"));
const AdminSyllabus = lazy(() => import("./pages/AdminSyllabus.jsx"));
const AdminLibrary = lazy(() => import("./pages/AdminLibrary.jsx"));
const Leaderboard = lazy(() => import("./pages/Leaderboard.jsx"));
const Progress = lazy(() => import("./pages/Progress.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
import { Button } from "./components/ui/Button.jsx";
import Input from "./components/ui/Input.jsx";
import Textarea from "./components/ui/Textarea.jsx";
import Select, { SelectItem } from "./components/ui/Select.jsx";
import StatusBadge from "./components/ui/StatusBadge.jsx";
import StarRating from "./components/ui/StarRating.jsx";
import EmptyState from "./components/ui/EmptyState.jsx";
import Avatar from "./components/ui/Avatar.jsx";
import ProgressBar from "./components/ui/ProgressBar.jsx";
import Modal from "./components/ui/Modal.jsx";
import Tooltip from "./components/ui/Tooltip.jsx";
import PageHeader from "./components/ui/PageHeader.jsx";
import Pagination from "./components/ui/Pagination.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageWrapper({ children }) {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col px-4"
      style={{ paddingTop: 56 + 16 }}
    >
      {children}
    </div>
  );
}

const Placeholder = ({ title }) => (
  <PageWrapper>
    <h1 className="mb-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">
      {title}
    </h1>
    <p className="text-sm text-slate-600 dark:text-slate-300">
      This screen is a placeholder for future implementation.
    </p>
  </PageWrapper>
);

function FullPageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4" style={{ paddingTop: 56 + 16 }}>
      <div className="mb-6">
        <SkeletonText width="40%" height={28} className="mb-2" />
        <SkeletonText width="60%" height={16} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
            <SkeletonBlock width="100%" height={0} className="pb-[56.25%]" />
            <div className="p-4 space-y-2">
              <SkeletonText width="90%" />
              <SkeletonText width="70%" />
              <SkeletonText width="50%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<FullPageSkeleton />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/browse" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Browse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/browse/:topicId"
          element={
            <ProtectedRoute>
              <Browse />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video/:submissionId"
          element={
            <ProtectedRoute>
              <VideoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <Submit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-submissions"
          element={
            <ProtectedRoute>
              <MySubmissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["moderator", "admin"]}>
                <Moderation />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/moderation/:id"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["moderator", "admin"]}>
                <ModerationDetail />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/syllabus"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["admin"]}>
                <AdminSyllabus />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/library"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["admin"]}>
                <AdminLibrary />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Placeholder title="Search Results" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test"
          element={
            <ProtectedRoute>
              <ComponentTestPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function ComponentTestPage() {
  return (
    <PageWrapper>
      <PageHeader
        title="Component Test"
        subtitle="Visual checklist for core UI components"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Component Test" }]}
      />
      <div className="space-y-8 pb-10">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Buttons
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="danger-ghost">Danger Ghost</Button>
            <Button variant="success">Success</Button>
            <Button variant="primary" loading>
              Loading
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Input &amp; Textarea
            </h2>
            <Input label="Your name" placeholder="Name" />
            <Textarea label="Feedback" maxLength={200} />
          </div>
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Select
            </h2>
            <Select placeholder="Choose an option">
              <SelectItem value="one">Option one</SelectItem>
              <SelectItem value="two">Option two</SelectItem>
            </Select>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Status badges &amp; Ratings
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status="pending" />
            <StatusBadge status="under_review" />
            <StatusBadge status="approved" />
            <StatusBadge status="rejected" />
            <StatusBadge status="flagged" />
            <StatusBadge status="removed" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <StarRating mode="display" value={4.2} count={12} />
            <StarRating mode="interactive" value={3} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Skeletons
          </h2>
          <div className="space-y-2">
            <SkeletonText width="60%" />
            <SkeletonText width="40%" />
            <SkeletonBlock width="100%" height={80} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Avatars &amp; Progress
          </h2>
          <div className="mb-3 flex items-center gap-3">
            <Avatar name="Riya Sharma" size="sm" />
            <Avatar name="Dr. Sharma" size="md" />
            <Avatar name="Admin User" size="lg" />
          </div>
          <ProgressBar value={60} label="Syllabus completion" showPercentage />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Empty States
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <EmptyState
              variant="no-videos"
              title="No videos yet"
              description="Be the first to explain this topic."
              actionLabel="Submit a video"
              onAction={() => {}}
            />
            <EmptyState
              variant="no-results"
              title="No search results"
              description="Try a different keyword or spelling. You can also browse by topic from the Browse page."
              actionLabel="Browse topics"
              onAction={() => window.location.assign("/browse")}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Pagination
          </h2>
          <Pagination page={3} totalPages={10} onChange={() => {}} />
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Video Card
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <VideoCard
              submission={{
                id: "demo1",
                youtube_thumbnail:
                  "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
                youtube_title: "AVL Trees — Balanced Binary Search Trees",
                description: "AVL trees explained with rotations and examples.",
                contributor: { name: "Aarav Mehta" },
                language: "English",
                drive_url: "https://drive.google.com/",
                topic: { name: "AVL Trees" },
                ratings: { overall: 4.5, count: 12 },
                youtube_duration: "8:32",
                created_at: new Date().toISOString(),
              }}
            />
            <VideoCard loading />
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
            Tooltip &amp; Modal
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Tooltip content="Helpful hint">
              <Button variant="secondary" size="sm">
                Hover me
              </Button>
            </Tooltip>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <CommandPaletteProvider>
                <AppLayout />
                <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "var(--bg-surface)",
                    color: "var(--text-body)",
                    borderRadius: "12px",
                    border: "1px solid var(--border-default)",
                    boxShadow:
                      "0 20px 25px rgba(15,23,42,0.08), 0 10px 10px rgba(15,23,42,0.04)",
                  },
                }}
              />
              </CommandPaletteProvider>
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppLayout() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <AnimatedRoutes />;
  }

  return (
    <>
      <Navbar />
      <CommandPalette />
      <main className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-body)]">
        <AnimatedRoutes />
      </main>
    </>
  );
}

export default App;
