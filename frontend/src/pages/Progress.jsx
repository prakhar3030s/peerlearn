import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Zap } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useBranches, useSubjectsByBranch, useUnitsBySubject } from "../hooks/useSyllabus.js";
import { useProgress, useSetProgress } from "../hooks/useProgress.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar, { RadialProgress } from "../components/ui/ProgressBar.jsx";
import { Button } from "../components/ui/Button.jsx";
import { SkeletonText, SkeletonBlock } from "../components/ui/Skeleton.jsx";
import { cn } from "../lib/utils.js";

const STATUS_OPTIONS = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

function SubjectProgress({
  subject,
  branchId,
  year,
  byTopic,
  userId,
  setProgress,
  onStats,
}) {
  const { data: units = [], isLoading } = useUnitsBySubject(subject?.id);
  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;
    (units || []).forEach((unit) => {
      (unit.topics || []).forEach((topic) => {
        total += 1;
        const s = byTopic[topic.id]?.status || "not_started";
        if (s === "completed") completed += 1;
        else if (s === "in_progress") inProgress += 1;
      });
    });
    return { total, completed, inProgress, pct: total ? Math.round((completed / total) * 100) : 0 };
  }, [units, byTopic]);

  React.useEffect(() => {
    if (subject?.id && onStats && !isLoading) onStats(subject.id, stats);
  }, [subject?.id, onStats, isLoading, stats.total, stats.completed]);

  if (!subject) return null;
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
        <SkeletonText width="40%" />
        <SkeletonBlock height={8} className="mt-2" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] bg-[var(--bg-surface)] p-5 transition-all duration-200",
        "shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--accent)]/20 border border-[var(--border-default)]"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">
          {subject.name}
        </h3>
        <span className="rounded-full bg-[var(--bg-raised)] px-2.5 py-0.5 text-[13px] font-medium text-[var(--text-muted)]">
          {stats.completed}/{stats.total} topics
        </span>
      </div>
      <ProgressBar
        value={stats.pct}
        showPercentage
        size="md"
        className="mb-4"
      />
      <div className="space-y-3">
        {(units || []).map((unit) => {
          const unitTopics = unit.topics || [];
          const unitCompleted = unitTopics.filter(
            (t) => (byTopic[t.id]?.status || "not_started") === "completed"
          ).length;
          const unitTotal = unitTopics.length;
          const unitPct = unitTotal ? Math.round((unitCompleted / unitTotal) * 100) : 0;
          return (
            <div
              key={unit.id}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)]/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-[var(--text-primary)]">
                  Unit {unit.number}: {unit.name}
                </span>
                <span className="text-[var(--text-muted)]">
                  {unitCompleted}/{unitTotal}
                </span>
              </div>
              <ProgressBar value={unitPct} size="sm" className="mb-2" />
              <ul className="mt-2 space-y-1.5">
                {unitTopics.map((topic) => {
                  const status = byTopic[topic.id]?.status || "not_started";
                  return (
                    <li
                      key={topic.id}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <Link
                        to={`/browse/${topic.id}`}
                        className="truncate text-[var(--text-body)] hover:text-[var(--accent)] hover:underline"
                      >
                        {topic.name}
                      </Link>
                      <select
                        value={status}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (userId && v) setProgress.mutate({ topic_id: topic.id, status: v });
                        }}
                        disabled={!userId || setProgress.isPending}
                        className={cn(
                          "rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1 text-[11px] font-medium",
                          status === "completed" && "text-[var(--success)] border-[var(--success)]/30",
                          status === "in_progress" && "text-[var(--warning)] border-[var(--warning)]/30"
                        )}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Progress() {
  const { user: currentUser } = useAuth();
  const userId = currentUser?.id;
  const [branchId, setBranchId] = useState(null);
  const [year, setYear] = useState(null);
  const [subjectStats, setSubjectStats] = useState({});

  React.useEffect(() => {
    setSubjectStats({});
  }, [branchId, year]);

  const { data: branches = [], isLoading: branchesLoading } = useBranches();
  const { data: subjects = [], isLoading: subjectsLoading } = useSubjectsByBranch(
    branchId,
    year
  );
  const { data: byTopic = {} } = useProgress(userId);
  const setProgress = useSetProgress(userId);

  const handleSubjectStats = React.useCallback((subjectId, stats) => {
    setSubjectStats((prev) => ({ ...prev, [subjectId]: stats }));
  }, []);

  const overallStats = useMemo(() => {
    const entries = Object.values(subjectStats);
    const total = entries.reduce((s, e) => s + (e?.total ?? 0), 0);
    const completed = entries.reduce((s, e) => s + (e?.completed ?? 0), 0);
    return {
      total,
      completed,
      pct: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [subjectStats]);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === branchId),
    [branches, branchId]
  );

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-[76px] pb-10">
        <PageHeader
          title="My Progress"
          subtitle="Track your syllabus completion"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Progress" }]}
        />
        <p className="text-sm text-[var(--text-muted)]">
          Sign in to track your progress.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-5xl px-4"
      style={{ paddingTop: 56 + 16 }}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Topic Completion"
          subtitle="Track your progress through the syllabus."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Browse", href: "/browse" },
            { label: "Progress" },
          ]}
        />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] font-medium text-[var(--text-muted)]">
            Branch · Year
          </span>
          {branchesLoading ? (
            <SkeletonBlock width={100} height={36} />
          ) : (
            <select
              value={branchId ?? ""}
              onChange={(e) => setBranchId(e.target.value || null)}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] font-medium text-[var(--text-primary)]"
            >
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code || b.name}
                </option>
              ))}
            </select>
          )}
          <select
            value={year ?? ""}
            onChange={(e) => setYear(e.target.value ? Number(e.target.value) : null)}
            className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] font-medium text-[var(--text-primary)]"
          >
            <option value="">Year</option>
            {[1, 2, 3, 4].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {branchId && year && (
        <>
          <div className="mb-8 flex flex-col gap-6 rounded-[var(--radius-card)] bg-[var(--bg-surface)] p-6 shadow-[var(--shadow-card)] border border-[var(--border-default)] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <RadialProgress value={overallStats.pct} size={140} strokeWidth={10} />
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Overall Progress
                </h2>
                <p className="text-[13px] text-[var(--text-muted)]">
                  {overallStats.completed} / {overallStats.total} topics · {overallStats.pct}%
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-raised)] px-4 py-2">
                <Zap className="h-4 w-4 text-[var(--warning)]" />
                <span className="text-[13px] font-medium text-[var(--text-primary)]">
                  Streak: <strong>0</strong> days
                </span>
              </div>
              <Link to="/browse">
                <Button variant="primary" size="sm">
                  Quick jump to next topic
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {subjectsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              <SkeletonBlock height={200} className="rounded-[var(--radius-card)]" />
              <SkeletonBlock height={200} className="rounded-[var(--radius-card)]" />
            </div>
          ) : subjects.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-muted)]">
              No subjects for this branch and year. Select another combination.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {subjects.map((subject) => (
                <SubjectProgress
                  key={subject.id}
                  subject={subject}
                  branchId={branchId}
                  year={year}
                  byTopic={byTopic}
                  userId={userId}
                  setProgress={setProgress}
                  onStats={handleSubjectStats}
                />
              ))}
            </div>
          )}
        </>
      )}

      {(!branchId || !year) && (
        <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-muted)]">
          Select a branch and year to see your progress.
        </p>
      )}
    </div>
  );
}
