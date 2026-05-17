import React, {
  useMemo,
  useState,
  useEffect,
} from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  useBranches,
  useSubjectsByBranch,
  useUnitsBySubject,
} from "../hooks/useSyllabus.js";
import {
  useProgress,
  useSetProgress,
} from "../hooks/useProgress.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import ProgressBar, {
  RadialProgress,
} from "../components/ui/ProgressBar.jsx";
import { Button } from "../components/ui/Button.jsx";
import {
  SkeletonText,
  SkeletonBlock,
} from "../components/ui/Skeleton.jsx";
import { cn } from "../lib/utils.js";

const STATUS_OPTIONS = [
  {
    value: "not_started",
    label: "Not Started",
    active:
      "bg-gray-500/10 text-gray-500 border border-gray-500/20",
  },
  {
    value: "in_progress",
    label: "In Progress",
    active:
      "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
  },
  {
    value: "completed",
    label: "Completed",
    active:
      "bg-green-500/10 text-green-600 border border-green-500/20",
  },
];

function SubjectProgress({
  subject,
  byTopic,
  userId,
  setProgress,
  onStats,
}) {
  const { data: units = [], isLoading } =
    useUnitsBySubject(subject?.id);

  const [openUnits, setOpenUnits] = useState({});

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    let inProgress = 0;

    units.forEach((unit) => {
      const topics = Array.isArray(unit.topics)
        ? unit.topics
        : [];

      topics.forEach((topic) => {
        total += 1;

        const s =
          byTopic[topic.id]?.status || "not_started";

        if (s === "completed") completed += 1;
        else if (s === "in_progress") inProgress += 1;
      });
    });

    return {
      total,
      completed,
      inProgress,
      pct: total
        ? Math.round((completed / total) * 100)
        : 0,
    };
  }, [units, byTopic]);

  useEffect(() => {
    if (subject?.id && onStats && !isLoading) {
      onStats(subject.id, stats);
    }
  }, [subject?.id, onStats, isLoading, stats]);

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
        "relative overflow-hidden rounded-[var(--radius-card)]",
        "border border-[var(--border-default)]",
        "bg-[var(--bg-surface)] p-5",
        "shadow-[var(--shadow-card)]",
        "transition-all duration-300",
        "hover:-translate-y-1",
        "hover:scale-[1.01]",
        "hover:border-[var(--accent)]/20",
        "hover:shadow-[var(--shadow-card-hover)]"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[var(--accent)] opacity-80" />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            {subject.name}
          </h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {stats.completed} of {stats.total} topics completed
          </p>
        </div>

        <div className="rounded-full bg-[var(--bg-raised)] px-3 py-1 text-sm font-medium text-[var(--text-primary)]">
          {stats.pct}%
        </div>
      </div>

      <div className="mb-5">
        <ProgressBar value={stats.pct} />
      </div>

      <div className="space-y-3">
        {Array.isArray(units) &&
          units.map((unit) => {
            const unitTopics = Array.isArray(unit.topics)
              ? unit.topics
              : [];

            const unitCompleted = unitTopics.filter(
              (t) =>
                (byTopic[t.id]?.status || "not_started") ===
                "completed"
            ).length;

            const unitTotal = unitTopics.length;

            const unitPct = unitTotal
              ? Math.round((unitCompleted / unitTotal) * 100)
              : 0;

            const isOpen = openUnits[unit.id];

            return (
              <div
                key={unit.id}
                className={cn(
                  "overflow-hidden rounded-2xl border border-[var(--border-default)]",
                  "bg-[var(--bg-raised)]/60",
                  "transition-all duration-300",
                  "hover:border-[var(--accent)]/20",
                  "hover:bg-[var(--bg-raised)]"
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={`Unit ${unit.number}: ${unit.name}`}
                  onClick={() =>
                    setOpenUnits((prev) => ({
                      ...prev,
                      [unit.id]: !prev[unit.id],
                    }))
                  }
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                      Unit {unit.number}: {unit.name}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {unitCompleted}/{unitTotal} topics completed
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-[var(--accent)]">
                      {unitPct}%
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />
                    )}
                  </div>
                </button>

                <div className="px-4 pb-3">
                  <ProgressBar value={unitPct} />
                </div>

                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-2 px-4 pb-4">
                      {unitTopics.map((topic) => {
                        const status =
                          byTopic[topic.id]?.status || "not_started";

                        return (
                          <li
                            key={topic.id}
                            className={cn(
                              "flex items-center justify-between gap-3",
                              "rounded-xl px-3 py-2",
                              "transition-all duration-200",
                              "hover:bg-[var(--bg-surface)]",
                              "hover:translate-x-1"
                            )}
                          >
                            <Link
                              to={`/browse/${topic.id}`}
                              className="truncate text-sm text-[var(--text-body)] transition-colors hover:text-[var(--accent)]"
                            >
                              {topic.name}
                            </Link>

                            <div className="flex items-center gap-1">
                              {STATUS_OPTIONS.map((opt) => {
                                const active = status === opt.value;

                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    aria-pressed={active}
                                    aria-label={`${topic.name}: ${opt.label}`}
                                    disabled={
                                      !userId || setProgress.isPending
                                    }
                                    onClick={() => {
                                      setProgress.mutate({
                                        topic_id: topic.id,
                                        status: opt.value,
                                      });
                                    }}
                                    className={cn(
                                      "rounded-full border px-2.5 py-1 text-[10px] font-medium",
                                      "transition-all duration-200",
                                      active
                                        ? opt.active
                                        : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/30"
                                    )}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
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

  useEffect(() => {
    setSubjectStats({});
  }, [branchId, year]);

  const { data: branches = [], isLoading: branchesLoading } =
    useBranches();

  const { data: subjects = [], isLoading: subjectsLoading } =
    useSubjectsByBranch(branchId, year);

  const { data: byTopic = {} } = useProgress(userId);
  const setProgress = useSetProgress(userId);

  const handleSubjectStats = React.useCallback(
    (subjectId, stats) => {
      setSubjectStats((prev) => ({
        ...prev,
        [subjectId]: stats,
      }));
    },
    []
  );

  const overallStats = useMemo(() => {
    const entries = Object.values(subjectStats);

    const total = entries.reduce(
      (s, e) => s + (e?.total ?? 0),
      0
    );

    const completed = entries.reduce(
      (s, e) => s + (e?.completed ?? 0),
      0
    );

    return {
      total,
      completed,
      pct: total
        ? Math.round((completed / total) * 100)
        : 0,
    };
  }, [subjectStats]);

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-[76px] pb-10">
        <PageHeader
          title="My Progress"
          subtitle="Track your syllabus completion"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Progress" },
          ]}
        />
        <p className="text-sm text-[var(--text-muted)]">
          Sign in to track your progress.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4"
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
              onChange={(e) =>
                setBranchId(e.target.value || null)
              }
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
            onChange={(e) =>
              setYear(
                e.target.value
                  ? Number(e.target.value)
                  : null
              )
            }
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

      {branchId && year ? (
        <>
          <div className="mb-8 flex flex-col gap-6 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-gradient-to-r from-[var(--bg-surface)] to-[var(--bg-raised)] p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.08)] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-6">
              <div className="transition-transform duration-300 hover:scale-105">
                <RadialProgress
                  value={overallStats.pct}
                  size={140}
                  strokeWidth={10}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Overall Progress
                </h2>
                <p className="text-[13px] text-[var(--text-muted)]">
                  {overallStats.completed} / {overallStats.total}{" "}
                  topics · {overallStats.pct}%
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
            <div className="grid gap-4 sm:grid-cols-2">
              <SkeletonBlock
                height={200}
                className="rounded-[var(--radius-card)]"
              />
              <SkeletonBlock
                height={200}
                className="rounded-[var(--radius-card)]"
              />
            </div>
          ) : subjects.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-muted)]">
              No subjects found for this branch and year.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {subjects.map((subject) => (
                <SubjectProgress
                  key={subject.id}
                  subject={subject}
                  byTopic={byTopic}
                  userId={userId}
                  setProgress={setProgress}
                  onStats={handleSubjectStats}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Select Branch & Year
          </h3>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Choose your branch and year to begin tracking your learning
            progress.
          </p>
        </div>
      )}
    </div>
  );
}
