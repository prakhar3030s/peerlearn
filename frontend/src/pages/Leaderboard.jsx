import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Crown,
  Medal,
  Award,
  Building2,
  CalendarDays,
  Clock,
  ChevronRight,
  Sprout,
  TrendingUp,
  Heart,
  BookOpen,
  Zap,
  Video,
  Sparkles,
  Trophy,
  Users,
  Target,
} from "lucide-react";
import api from "../lib/axios.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { SkeletonBlock } from "../components/ui/Skeleton.jsx";
import { BADGE_COLORS } from "../lib/config.js";
import { cn } from "../lib/utils.js";

const TIME_OPTIONS = [
  { value: "month", label: "This Month", icon: Clock },
  { value: "semester", label: "This Semester", icon: CalendarDays },
  { value: "all", label: "All Time", icon: Trophy },
];

const PODIUM_META = {
  1: {
    label: "1st",
    pedestal: "h-20 md:h-24",
    pedestalClass:
      "bg-gradient-to-t from-amber-500/50 via-amber-400/25 to-amber-400/5 border-amber-400/40",
    cardBorder: "border-amber-400/60",
    cardGlow: "shadow-[0_8px_40px_rgba(251,191,36,0.22)]",
    iconClass: "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.55)]",
    ring: "ring-amber-400/40 border-amber-400",
    rankBg: "bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950",
  },
  2: {
    label: "2nd",
    pedestal: "h-14 md:h-16",
    pedestalClass:
      "bg-gradient-to-t from-slate-400/40 via-slate-300/20 to-slate-300/5 border-slate-400/30",
    cardBorder: "border-slate-400/50",
    cardGlow: "shadow-[0_8px_32px_rgba(148,163,184,0.18)]",
    iconClass: "text-slate-300",
    ring: "ring-slate-400/30 border-slate-400",
    rankBg: "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900",
  },
  3: {
    label: "3rd",
    pedestal: "h-10 md:h-12",
    pedestalClass:
      "bg-gradient-to-t from-amber-700/45 via-amber-800/20 to-amber-900/5 border-amber-700/35",
    cardBorder: "border-amber-700/50",
    cardGlow: "shadow-[0_8px_28px_rgba(180,83,9,0.16)]",
    iconClass: "text-amber-600",
    ring: "ring-amber-700/30 border-amber-700",
    rankBg: "bg-gradient-to-br from-amber-700 to-amber-900 text-amber-50",
  },
};

const BADGE_DARK = {
  Newcomer: "dark:bg-slate-700/60 dark:text-slate-200",
  Contributor: "dark:bg-indigo-900/50 dark:text-indigo-200",
  Mentor: "dark:bg-emerald-900/50 dark:text-emerald-200",
  Scholar: "dark:bg-sky-900/50 dark:text-sky-200",
  Expert: "dark:bg-purple-900/50 dark:text-purple-200",
  Legend: "dark:bg-amber-900/50 dark:text-amber-200",
};

function useBranches() {
  return useQuery({
    queryKey: ["syllabus", "branches"],
    queryFn: async () => {
      const res = await api.get("/syllabus/branches");
      return res.data?.data ?? [];
    },
    staleTime: 10 * 60 * 1000,
  });
}

function useLeaderboardData(branchFilter, yearFilter, periodFilter) {
  return useQuery({
    queryKey: ["users", "leaderboard", branchFilter, yearFilter, periodFilter],
    queryFn: async () => {
      const params = {};
      if (branchFilter && branchFilter !== "All") params.branch = branchFilter;
      if (yearFilter != null && yearFilter !== "All") params.year = yearFilter;
      if (periodFilter) params.period = periodFilter;
      const res = await api.get("/users/leaderboard", { params });
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
  });
}

function useFilteredLeaderboard(users, timeFilter) {
  return useMemo(() => {
    let list = Array.isArray(users) ? users : [];
    if (timeFilter && timeFilter !== "all") {
      const now = new Date();
      list = list.filter((u) => {
        if (!u.created_at) return true;
        const d = new Date(u.created_at);
        const diffDays = (now - d) / (1000 * 60 * 60 * 24);
        if (timeFilter === "month") return diffDays <= 30;
        if (timeFilter === "semester") return diffDays <= 150;
        return true;
      });
    }
    list = [...list].sort(
      (a, b) => (b.reputation_score || 0) - (a.reputation_score || 0)
    );
    return list.slice(0, 50);
  }, [users, timeFilter]);
}

function getBadge(score = 0) {
  if (score >= 2500) return "Legend";
  if (score >= 1000) return "Expert";
  if (score >= 500) return "Scholar";
  if (score >= 200) return "Mentor";
  if (score >= 50) return "Contributor";
  return "Newcomer";
}

function getBadgeIcon(badgeName) {
  switch (badgeName) {
    case "Legend":
      return Crown;
    case "Expert":
      return Zap;
    case "Scholar":
      return BookOpen;
    case "Mentor":
      return Heart;
    case "Contributor":
      return TrendingUp;
    default:
      return Sprout;
  }
}

function getPeriodLabel(timeFilter) {
  return TIME_OPTIONS.find((o) => o.value === timeFilter)?.label ?? "All Time";
}

function BadgePill({ badge, size = "sm" }) {
  const Icon = getBadgeIcon(badge);
  const colors = BADGE_COLORS[badge] || BADGE_COLORS.Newcomer;
  const dark = BADGE_DARK[badge] || BADGE_DARK.Newcomer;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-semibold rounded-full",
        colors.bg,
        colors.text,
        dark,
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-[12px]"
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {badge}
    </span>
  );
}

function StatsSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} height={280} className="rounded-2xl" />
        ))}
      </div>
      <div className="rounded-2xl border border-[var(--border-default)] overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBlock key={i} height={64} className="rounded-none border-b border-[var(--border-default)] last:border-0" />
        ))}
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [branchFilter, setBranchFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("semester");

  const { data: branches = [] } = useBranches();
  const branchOptions = useMemo(
    () => ["All", ...(branches.map((b) => b.code).filter(Boolean))],
    [branches]
  );

  const { data: users, isLoading, isError, error, refetch } = useLeaderboardData(
    branchFilter,
    yearFilter === "All" ? null : yearFilter,
    timeFilter
  );
  const ranked = useFilteredLeaderboard(users, timeFilter);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  const currentIndex = ranked.findIndex((u) => u.id === currentUser?.id);
  const currentRank = currentIndex >= 0 ? currentIndex + 1 : null;
  const currentUserScore = currentUser?.reputation_score ?? 0;
  const currentUserVideos = currentUser?.approved_videos_count ?? 0;

  const progressToTop10 = useMemo(() => {
    if (currentRank == null || currentRank <= 10) return 100;
    return Math.max(0, 100 - (currentRank - 10) * 2);
  }, [currentRank]);

  const periodLabel = getPeriodLabel(timeFilter);
  const pageSubtitle = `Top contributors · ${periodLabel}${
    branchFilter !== "All" ? ` · ${branchFilter}` : ""
  }${yearFilter !== "All" ? ` · Year ${yearFilter}` : ""}`;

  const layoutClass =
    "mx-auto w-full max-w-5xl px-4 pb-16 md:px-8";
  const layoutStyle = { paddingTop: 56 + 24 };

  if (!isLoading && ranked.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={layoutClass}
        style={layoutStyle}
      >
        <LeaderboardHero
          periodLabel={periodLabel}
          totalCount={0}
        />
        <FilterCard
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          branchOptions={branchOptions}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-10 md:p-14 text-center shadow-[var(--shadow-card)]"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5 ring-1 ring-[var(--accent)]/20"
          >
            <Trophy className="h-12 w-12 text-[var(--accent)]" />
          </motion.div>
          <h2 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
            Be the first on the board
          </h2>
          <p className="mt-2 max-w-md mx-auto text-[15px] leading-relaxed text-[var(--text-muted)]">
            No rankings yet for these filters. Submit a video, earn reputation, and claim the top spot.
          </p>
          <Link to="/submit" className="mt-8 inline-block">
            <Button variant="primary" className="gap-2 shadow-lg shadow-[var(--accent)]/20">
              Submit a video
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={layoutClass}
      style={layoutStyle}
    >
      <LeaderboardHero
        periodLabel={periodLabel}
        totalCount={isLoading ? null : ranked.length}
      />

      <PageHeader
        title="Rankings"
        subtitle={pageSubtitle}
        breadcrumbs={[
          { label: "Browse", href: "/browse" },
          { label: "Leaderboard" },
        ]}
      />

      {currentUser && (
        <YourRankBanner
          rank={currentRank}
          score={currentUserScore}
          videos={currentUserVideos}
          progressToTop10={progressToTop10}
          totalCount={ranked.length}
        />
      )}

      <FilterCard
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        branchOptions={branchOptions}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
      />

      {isError ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <ErrorPanel error={error} onRetry={refetch} />
        </motion.div>
      ) : isLoading ? (
        <div className="mt-8">
          <StatsSkeleton />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <PodiumSection podium={podium} currentUser={currentUser} periodLabel={periodLabel} />
          <RankedList
            rest={rest}
            currentUser={currentUser}
            currentRank={currentRank}
          />
          <FooterCTA />
        </motion.div>
      )}
    </motion.div>
  );
}

function LeaderboardHero({ periodLabel, totalCount }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-2 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[var(--accent)]/12 via-transparent to-amber-500/8"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl"
      />

      <motion.div
        className="relative flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-indigo-700 text-white shadow-lg shadow-[var(--accent)]/30">
            <Trophy className="h-7 w-7" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
              Campus Leaderboard
            </p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-[var(--text-primary)] md:text-3xl">
              Top peer educators
            </h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Earn reputation by sharing quality explanations · {periodLabel}
            </p>
          </div>
        </div>

        {totalCount != null && (
          <div className="flex flex-wrap gap-3 md:justify-end">
            <StatChip
              icon={Users}
              label="Contributors"
              value={String(totalCount)}
            />
            <StatChip
              icon={Target}
              label="Your goal"
              value="Top 10"
              muted
            />
          </div>
        )}
      </motion.div>
    </motion.section>
  );
}

function StatChip({ icon: Icon, label, value, muted }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-4 py-2.5",
        muted
          ? "border-[var(--border-default)] bg-[var(--bg-raised)]/60"
          : "border-[var(--accent)]/25 bg-[var(--accent)]/8"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4",
          muted ? "text-[var(--text-muted)]" : "text-[var(--accent)]"
        )}
      />
      <motion.div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        <p
          className={cn(
            "text-lg font-bold leading-tight",
            muted ? "text-[var(--text-primary)]" : "text-[var(--accent)]"
          )}
        >
          {value}
        </p>
      </motion.div>
    </div>
  );
}

function YourRankBanner({ rank, score, videos, progressToTop10, totalCount }) {
  const inTop10 = rank != null && rank <= 10;
  const nextMilestone = rank != null && rank > 10 ? "Progress to top 10" : null;
  const percentile =
    rank != null && totalCount > 0
      ? Math.max(1, Math.round(((totalCount - rank + 1) / totalCount) * 100))
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
    >
      <RankStatCard
        label="Your rank"
        value={rank != null ? `#${rank}` : "—"}
        highlight
        icon={Medal}
      />
      <RankStatCard label="Reputation" value={`${score}`} suffix="pts" icon={Zap} />
      <RankStatCard
        label="Approved videos"
        value={String(videos)}
        icon={Video}
      />
      {percentile != null ? (
        <RankStatCard
          label="Percentile"
          value={`Top ${percentile}%`}
          icon={TrendingUp}
          badge={inTop10 ? "Top 10" : null}
        />
      ) : (
        <RankStatCard label="Status" value="Unranked" icon={Sprout} />
      )}

      {nextMilestone && (
        <motion.div
          layout
          className="sm:col-span-2 lg:col-span-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 shadow-[var(--shadow-card)]"
        >
          <div className="mb-2 flex justify-between text-xs">
            <span className="font-medium text-[var(--text-muted)]">{nextMilestone}</span>
            <span className="font-semibold text-[var(--accent)]">{progressToTop10}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-raised)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToTop10}%` }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-indigo-400"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function RankStatCard({ label, value, suffix, icon: Icon, highlight, badge }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 shadow-[var(--shadow-card)]",
        highlight
          ? "border-[var(--accent)]/35 bg-gradient-to-br from-[var(--accent)]/12 to-[var(--bg-surface)]"
          : "border-[var(--border-default)] bg-[var(--bg-surface)]"
      )}
    >
      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[var(--accent)]/15 blur-xl"
        />
      )}
      <div className="relative flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
            {value}
            {suffix && (
              <span className="ml-1 text-sm font-medium text-[var(--text-muted)]">
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            highlight ? "bg-[var(--accent)]/20 text-[var(--accent)]" : "bg-[var(--bg-raised)] text-[var(--text-muted)]"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      {badge && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--success)]/15 px-2 py-0.5 text-[11px] font-semibold text-[var(--success)]">
          <Sparkles className="h-3 w-3" />
          {badge}
        </span>
      )}
    </motion.div>
  );
}

function FilterCard({
  branchFilter,
  setBranchFilter,
  branchOptions,
  yearFilter,
  setYearFilter,
  timeFilter,
  setTimeFilter,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-8 rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)] md:p-5"
    >
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        Filters
      </p>
      <div className="flex flex-col gap-5 lg:flex-row lg:flex-wrap lg:items-center lg:gap-8">
        <FilterGroup
          icon={Building2}
          label="Branch"
          options={branchOptions}
          value={branchFilter}
          onChange={setBranchFilter}
          format={(v) => v}
        />
        <FilterGroup
          icon={CalendarDays}
          label="Year"
          options={["All", 1, 2, 3, 4]}
          value={yearFilter}
          onChange={setYearFilter}
          format={(v) => (v === "All" ? "All" : `Y${v}`)}
        />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Period
            </span>
          </div>
          <motion.div layout className="inline-flex flex-wrap rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)]/50 p-1">
            {TIME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = timeFilter === opt.value;
              return (
                <motion.button
                  key={opt.value}
                  type="button"
                  layout
                  onClick={() => setTimeFilter(opt.value)}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                    active
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {opt.label}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function FilterGroup({ icon: Icon, label, options, value, onChange, format }) {
  return (
    <motion.div layout className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          {label}
        </span>
      </div>
      <motion.div layout className="flex flex-wrap gap-1 rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)]/50 p-1">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <motion.button
              key={String(opt)}
              type="button"
              layout
              onClick={() => onChange(opt)}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "rounded-lg px-3 py-2 text-[13px] font-medium transition-colors min-w-[2.5rem]",
                active
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              {format(opt)}
            </motion.button>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

function PodiumCard({ user, rank, isCurrent, isGhost, index }) {
  const meta = PODIUM_META[rank];
  const Icon = rank === 1 ? Crown : rank === 2 ? Medal : Award;
  const approvedCount = user?.approved_videos_count ?? 0;
  const score = user?.reputation_score || 0;
  const badge = getBadge(score);

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (!score || isGhost) return;
    const duration = 900;
    const steps = 24;
    const step = score / steps;
    let current = 0;
    const id = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(id);
      } else setDisplayScore(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(id);
  }, [score, isGhost]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: [0.4, 0, 0.2, 1] }}
      className="flex w-full flex-col items-center"
    >
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className={cn(
          "relative w-full rounded-2xl border-2 bg-[var(--bg-surface)] p-4 md:p-5 overflow-hidden",
          meta.cardBorder,
          meta.cardGlow,
          isCurrent && "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-primary)]"
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-transparent dark:from-white/5"
        />

        <div className="relative flex flex-col items-center text-center">
          <span
            className={cn(
              "mb-3 inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-full px-2 text-[11px] font-bold",
              meta.rankBg
            )}
          >
            {meta.label}
          </span>

          <Icon className={cn("h-9 w-9 md:h-10 md:w-10", meta.iconClass)} strokeWidth={2} />

          {isGhost ? (
            <>
              <motion.div
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-4 h-16 w-16 rounded-full border-2 border-dashed border-[var(--border-default)]"
              />
              <p className="mt-3 text-sm font-medium text-[var(--text-muted)]">
                Unclaimed
              </p>
            </>
          ) : (
            <>
              <div
                className={cn(
                  "mt-4 rounded-full border-2 p-0.5 ring-4",
                  meta.ring
                )}
              >
                <Avatar name={user.name} size="xl" />
              </div>
              <p className="mt-3 text-[15px] font-semibold text-[var(--text-primary)] line-clamp-1">
                {user.name}
                {isCurrent && (
                  <span className="ml-1 text-xs font-medium text-[var(--accent)]">(you)</span>
                )}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--accent)]">
                {displayScore}
                <span className="ml-0.5 text-sm font-semibold text-[var(--text-muted)]">pts</span>
              </p>
              <div className="mt-2">
                <BadgePill badge={badge} />
              </div>
              <p className="mt-2 flex items-center justify-center gap-1 text-[12px] text-[var(--text-muted)]">
                <Video className="h-3.5 w-3.5" />
                {approvedCount} video{approvedCount !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformOrigin: "bottom" }}
        className={cn(
          "mt-0 w-full rounded-b-xl border-x border-b",
          meta.pedestal,
          meta.pedestalClass
        )}
      />
    </motion.div>
  );
}

function PodiumSection({ podium, currentUser, periodLabel }) {
  const p1 = podium[0];
  const p2 = podium[1];
  const p3 = podium[2];

  return (
    <section className="mb-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Podium</h2>
          <p className="text-sm text-[var(--text-muted)]">Top 3 · {periodLabel}</p>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Gold
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Silver
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-700" /> Bronze
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-end sm:gap-4">
        <div className="sm:order-1 sm:pt-8">
          <PodiumCard
            user={p2}
            rank={2}
            isCurrent={p2 && currentUser?.id === p2.id}
            isGhost={!p2}
            index={0}
          />
        </div>
        <motion.div
          className="sm:order-2 sm:-mt-2"
          animate={p1 ? { scale: [1, 1.01, 1] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <PodiumCard
            user={p1}
            rank={1}
            isCurrent={p1 && currentUser?.id === p1.id}
            isGhost={!p1}
            index={1}
          />
        </motion.div>
        <motion.div className="sm:order-3 sm:pt-12">
          <PodiumCard
            user={p3}
            rank={3}
            isCurrent={p3 && currentUser?.id === p3.id}
            isGhost={!p3}
            index={2}
          />
        </motion.div>
      </div>
    </section>
  );
}

function RankedList({ rest, currentUser, currentRank }) {
  const fullRanked = useMemo(
    () => (rest || []).map((u, idx) => ({ ...u, rank: idx + 4 })),
    [rest]
  );

  let yourRow = null;
  if (currentUser) {
    const idx = fullRanked.findIndex((u) => u.id === currentUser.id);
    yourRow = {
      rank: idx >= 0 ? fullRanked[idx].rank : currentRank,
      score: currentUser.reputation_score || 0,
    };
  }

  if (fullRanked.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Full rankings</h2>
        <span className="text-sm text-[var(--text-muted)]">#4 and below</span>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
        <div className="hidden md:grid md:grid-cols-[4rem_1fr_8rem_6rem_7rem_4rem] gap-2 border-b border-[var(--border-default)] bg-[var(--bg-raised)]/80 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
          <span>Rank</span>
          <span>Student</span>
          <span>Program</span>
          <span className="text-right">Points</span>
          <span className="text-right">Badge</span>
          <span className="text-right">Videos</span>
        </div>

        <motion.ul
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.025 } } }}
          className="divide-y divide-[var(--border-default)]"
        >
          {fullRanked.map((user) => {
            const isCurrent = currentUser?.id === user.id;
            const videoCount = user.approved_videos_count ?? 0;
            const score = user.reputation_score || 0;
            const badge = user.badge || getBadge(score);
            const branch =
              user.branch_code ||
              user.branch_name ||
              user.branch?.code ||
              user.branch?.name ||
              "—";
            const year = user.year != null ? `Y${user.year}` : "";
            const isTop10 = user.rank <= 10;

            return (
              <motion.li
                key={user.id}
                variants={{ hidden: { opacity: 0, x: -8 }, visible: { opacity: 1, x: 0 } }}
              >
                <motion.div
                  whileHover={{ backgroundColor: "var(--bg-hover)" }}
                  className={cn(
                    "grid grid-cols-1 gap-3 px-4 py-4 transition-colors md:grid-cols-[4rem_1fr_8rem_6rem_7rem_4rem] md:items-center md:gap-2 md:py-3",
                    isCurrent &&
                      "bg-[var(--accent)]/8 border-l-[3px] border-l-[var(--accent)] md:border-l-[3px]"
                  )}
                >
                  <motion.div className="flex items-center gap-2 md:block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] md:hidden">
                      Rank
                    </span>
                    <motion.div className="flex items-center gap-2">
                      {isTop10 && (
                        <Medal className="h-4 w-4 shrink-0 text-amber-500/90" />
                      )}
                      <span
                        className={cn(
                          "inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg text-sm font-bold tabular-nums",
                          isTop10
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-[var(--bg-raised)] text-[var(--text-primary)]"
                        )}
                      >
                        {user.rank}
                      </span>
                    </motion.div>
                  </motion.div>

                  <motion.div className="flex items-center gap-3 min-w-0">
                    <Avatar name={user.name} size="md" bordered />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-[var(--text-primary)]">
                        {user.name}
                        {isCurrent && (
                          <span className="ml-1.5 text-xs font-medium text-[var(--accent)]">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)] md:hidden">
                        {branch}
                        {year ? ` · ${year}` : ""} · {score} pts
                      </p>
                    </div>
                  </motion.div>

                  <motion.div className="hidden md:block">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-raised)] px-2.5 py-1 text-[13px] text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--text-primary)]">{branch}</span>
                      {year && (
                        <span className="text-[11px] uppercase tracking-wide opacity-80">
                          {year}
                        </span>
                      )}
                    </span>
                  </motion.div>

                  <motion.div className="flex items-center justify-between md:justify-end md:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] md:hidden">
                      Points
                    </span>
                    <span>
                      <span className="text-lg font-bold tabular-nums text-[var(--accent)]">
                        {score}
                      </span>
                      <span className="ml-0.5 text-xs font-medium text-[var(--text-muted)]">
                        pts
                      </span>
                    </span>
                  </motion.div>

                  <motion.div className="flex items-center justify-between md:justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] md:hidden">
                      Badge
                    </span>
                    <BadgePill badge={badge} />
                  </motion.div>

                  <motion.div className="flex items-center justify-between md:justify-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] md:hidden">
                      Videos
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[var(--text-muted)]">
                      <Video className="h-3.5 w-3.5 opacity-70" />
                      {videoCount}
                    </span>
                  </motion.div>
                </motion.div>
              </motion.li>
            );
          })}
        </motion.ul>

        {yourRow && yourRow.rank != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between gap-4 border-t-2 border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/10 to-transparent px-4 py-3.5"
          >
            <span className="text-sm font-medium text-[var(--text-primary)]">
              Your position in this list
            </span>
            <span className="text-sm">
              <strong className="text-[var(--accent)]">#{yourRow.rank}</strong>
              <span className="mx-2 text-[var(--text-muted)]">·</span>
              <strong className="tabular-nums text-[var(--accent)]">{yourRow.score}</strong>
              <span className="text-[var(--text-muted)]"> pts</span>
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mt-12 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
    >
      <div className="relative px-6 py-8 text-center md:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--accent)]/8 via-transparent to-amber-500/8"
        />
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent)]/15"
        >
          <Sparkles className="h-6 w-6 text-[var(--accent)]" />
        </motion.div>
        <p className="relative text-[15px] font-semibold text-[var(--text-primary)]">
          Climb the leaderboard
        </p>
        <p className="relative mt-1 text-sm text-[var(--text-muted)]">
          Share clear explanations and earn reputation from your peers.
        </p>
        <Link to="/submit" className="relative mt-5 inline-block">
          <Button variant="primary" className="gap-2 shadow-lg shadow-[var(--accent)]/20">
            Submit a video
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
