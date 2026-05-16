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
  Home,
} from "lucide-react";
import api from "../lib/axios.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import Avatar from "../components/ui/Avatar.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import { SkeletonBlock } from "../components/ui/Skeleton.jsx";
import { cn } from "../lib/utils.js";

const TIME_OPTIONS = [
  { value: "month", label: "This Month", icon: Clock },
  { value: "semester", label: "This Semester", icon: CalendarDays },
  { value: "all", label: "All Time", icon: CalendarDays },
];
const YEAR_OPTIONS = [null, 1, 2, 3, 4];

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
    case "Legend": return Crown;
    case "Expert": return Zap;
    case "Scholar": return BookOpen;
    case "Mentor": return Heart;
    case "Contributor": return TrendingUp;
    default: return Sprout;
  }
}

function StatsSkeleton() {
  return (
    <div className="space-y-8 py-8">
      <div className="flex justify-center gap-6">
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} width={200} height={240} className="rounded-2xl" />
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBlock key={i} height={56} className="rounded-xl" />
        ))}
      </div>
    </div>
  );
}

const podiumGradients = {
  1: "from-amber-400/30 via-amber-500/10 to-transparent",
  2: "from-slate-300/25 via-slate-400/10 to-transparent",
  3: "from-amber-700/25 via-amber-800/10 to-transparent",
};

const podiumRings = {
  1: "ring-amber-400/60 shadow-amber-400/20",
  2: "ring-slate-400/50 shadow-slate-400/20",
  3: "ring-amber-600/50 shadow-amber-600/20",
};

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

  if (!isLoading && ranked.length === 0) {
    return (
      <div
        className="mx-auto w-full max-w-5xl px-6 md:px-12"
        style={{ paddingTop: 56 + 24 }}
      >
        <Breadcrumb />
        <header className="mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
            Campus Leaderboard
          </h1>
          <p className="mt-2 text-[18px] font-medium text-[var(--text-muted)]">
            Top contributors this semester
          </p>
        </header>
        <div className="mt-8">
          <FilterBar
            branchFilter={branchFilter}
            setBranchFilter={setBranchFilter}
            branchOptions={branchOptions}
            yearFilter={yearFilter}
            setYearFilter={setYearFilter}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center shadow-[var(--shadow-card)]"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/10">
            <Sparkles className="h-10 w-10 text-[var(--accent)]" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[var(--text-primary)]">
            Be the first in your branch
          </h2>
          <p className="mt-2 max-w-md mx-auto text-[15px] text-[var(--text-muted)]">
            Submit a video and earn points. Your name could be right here.
          </p>
          <Link to="/submit">
            <button
              type="button"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:bg-[var(--accent-hover)] hover:shadow-[var(--accent)]/30"
            >
              Submit a video
              <ChevronRight className="h-4 w-4" />
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-5xl px-6 pb-16 md:px-12"
      style={{ paddingTop: 56 + 24 }}
    >
      <Breadcrumb />
      <header className="mt-8">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
          Campus Leaderboard
        </h1>
        <p className="mt-2 text-[18px] font-medium text-[var(--text-muted)]">
          Top contributors this semester
        </p>
      </header>

      {currentUser && (
        <YourRankBanner
          rank={currentRank}
          score={currentUserScore}
          videos={currentUserVideos}
          progressToTop10={progressToTop10}
        />
      )}

      <div className="mt-8">
        <FilterBar
          branchFilter={branchFilter}
          setBranchFilter={setBranchFilter}
          branchOptions={branchOptions}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />
      </div>

      {isError ? (
        <div className="mt-10">
          <ErrorPanel error={error} onRetry={refetch} />
        </div>
      ) : isLoading ? (
        <StatsSkeleton />
      ) : (
        <>
          <PodiumSection podium={podium} currentUser={currentUser} />
          <RankedList
            rest={rest}
            currentUser={currentUser}
            currentRank={currentRank}
          />
          <FooterCTA />
        </>
      )}
    </div>
  );
}

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1 text-[15px] font-medium text-[var(--text-muted)]">
      <Link to="/" className="inline-flex items-center gap-1 hover:text-[var(--accent)] hover:underline">
        <Home className="h-4 w-4" />
        Home
      </Link>
      <ChevronRight className="h-4 w-4 text-[var(--text-muted)]/70" />
      <span className="text-[var(--text-primary)]">Leaderboard</span>
    </nav>
  );
}

function YourRankBanner({ rank, score, videos, progressToTop10 }) {
  const inTop10 = rank != null && rank <= 10;
  const nextMilestone = rank != null && rank > 10 ? "Climb to top 10 for Gold Badge!" : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-r from-[var(--accent)]/15 to-[var(--accent)]/5 px-5 py-4 shadow-[0_0_24px_rgba(99,102,241,0.12)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[15px] font-medium text-[var(--text-primary)]">
            Your Rank:{" "}
            <strong className="text-[var(--accent)]">
              {rank != null ? `#${rank}` : "—"}
            </strong>
          </span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="text-[15px] font-semibold text-[var(--text-primary)]">
            {score} pts
          </span>
          <span className="text-[var(--text-muted)]">•</span>
          <span className="text-[15px] text-[var(--text-muted)]">
            {videos} approved {videos === 1 ? "video" : "videos"}
          </span>
        </div>
        {inTop10 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)]/15 px-3 py-1 text-[13px] font-semibold text-[var(--success)]">
            <Sparkles className="h-3.5 w-3.5" />
            In top 10
          </span>
        )}
      </div>
      {nextMilestone && (
        <div className="mt-3">
          <div className="mb-1.5 flex justify-between text-[12px]">
            <span className="text-[var(--text-muted)]">{nextMilestone}</span>
            <span className="font-medium text-[var(--text-primary)]">{progressToTop10}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-raised)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToTop10}%` }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-[var(--accent)]"
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

function FilterBar({
  branchFilter,
  setBranchFilter,
  branchOptions,
  yearFilter,
  setYearFilter,
  timeFilter,
  setTimeFilter,
}) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Building2 className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="text-[13px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Branch
        </span>
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-0.5">
          {branchOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setBranchFilter(opt)}
              className={cn(
                "rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                branchFilter === opt
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <CalendarDays className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="text-[13px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Year
        </span>
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-0.5">
          {["All", 1, 2, 3, 4].map((opt) => (
            <button
              key={String(opt)}
              type="button"
              onClick={() => setYearFilter(opt)}
              className={cn(
                "rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                yearFilter === opt
                  ? "bg-[var(--accent)] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Clock className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="text-[13px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Time
        </span>
        <div className="flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-0.5">
          {TIME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeFilter(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                  timeFilter === opt.value
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PodiumCard({ user, rank, variant, isCurrent, isGhost, index }) {
  const Icon = rank === 1 ? Crown : rank === 2 ? Medal : Award;
  const gradient = podiumGradients[rank];
  const ring = podiumRings[rank];
  const approvedCount = user?.approved_videos_count ?? 0;
  const score = user?.reputation_score || 0;
  const badge = getBadge(score);

  const [displayScore, setDisplayScore] = useState(0);
  useEffect(() => {
    if (!score) return;
    const duration = 800;
    const steps = 20;
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
  }, [score]);

  const label = rank === 1 ? "1st" : rank === 2 ? "2nd" : "3rd";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "relative flex flex-col items-center rounded-2xl border-2 bg-[var(--bg-surface)] p-5 overflow-hidden",
        rank === 1 && "border-amber-400/50 shadow-[0_0_32px_rgba(251,191,36,0.15)]",
        rank === 2 && "border-slate-400/40 shadow-[0_0_24px_rgba(148,163,184,0.12)]",
        rank === 3 && "border-amber-600/40 shadow-[0_0_24px_rgba(180,83,9,0.12)]",
        isCurrent && "ring-2 ring-[var(--accent)]",
        variant === "tall" && "md:py-8 md:px-6 md:min-w-[220px]"
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-b pointer-events-none", gradient)} aria-hidden />
      <div className="relative flex h-14 w-14 items-center justify-center md:h-16 md:w-16">
        <Icon
          className={cn(
            "h-10 w-10 md:h-12 md:w-12",
            rank === 1 && "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
            rank === 2 && "text-slate-300",
            rank === 3 && "text-amber-600"
          )}
          strokeWidth={2}
        />
      </div>
      <span className="relative mt-1 text-[11px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        {label} Place
      </span>
      {isGhost ? (
        <>
          <div className="relative mt-3 h-16 w-16 rounded-full border-2 border-dashed border-[var(--border-default)]" />
          <div className="relative mt-3 text-[14px] font-medium text-[var(--text-muted)]">
            — Unclaimed —
          </div>
        </>
      ) : (
        <>
          <div
            className={cn(
              "relative mt-3 rounded-full border-2 p-0.5 ring-4",
              rank === 1 && "border-amber-400 bg-amber-500/10 ring-amber-400/30",
              rank === 2 && "border-slate-400 bg-slate-500/10 ring-slate-400/20",
              rank === 3 && "border-amber-600 bg-amber-700/10 ring-amber-600/20"
            )}
          >
            <Avatar name={user.name} size="xl" />
          </div>
          <div className="relative mt-3 text-center">
            <div className="text-[15px] font-semibold text-[var(--text-primary)]">
              {user.name}
              {isCurrent && (
                <span className="ml-1 text-xs font-medium text-[var(--accent)]">(you)</span>
              )}
            </div>
            <div className="mt-1 text-xl font-bold text-[var(--accent)] md:text-2xl">
              {displayScore} pts
            </div>
            <span className="mt-1.5 inline-flex rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-[12px] font-semibold text-[var(--accent)]">
              {badge}
            </span>
            <div className="mt-1.5 flex items-center justify-center gap-1 text-[12px] text-[var(--text-muted)]">
              <Video className="h-3.5 w-3.5" />
              {approvedCount} video{approvedCount !== 1 ? "s" : ""}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

function PodiumSection({ podium, currentUser }) {
  const p1 = podium[0];
  const p2 = podium[1];
  const p3 = podium[2];

  return (
    <div className="mt-12 mb-10">
      <h2 className="mb-6 text-[13px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        Top 3 this semester
      </h2>
      <div className="flex flex-wrap items-end justify-center gap-4 md:gap-8">
        <div className="order-1 md:order-1 w-[min(100%,200px)] md:w-[200px] md:min-w-0">
          <PodiumCard
            user={p2}
            rank={2}
            variant="short"
            isCurrent={p2 && currentUser?.id === p2.id}
            isGhost={!p2}
            index={0}
          />
        </div>
        <div className="order-0 md:order-2 w-[min(100%,220px)] md:w-[240px] md:-mt-6">
          <PodiumCard
            user={p1}
            rank={1}
            variant="tall"
            isCurrent={p1 && currentUser?.id === p1.id}
            isGhost={!p1}
            index={1}
          />
        </div>
        <div className="order-2 md:order-3 w-[min(100%,200px)] md:w-[200px] md:min-w-0">
          <PodiumCard
            user={p3}
            rank={3}
            variant="short"
            isCurrent={p3 && currentUser?.id === p3.id}
            isGhost={!p3}
            index={2}
          />
        </div>
      </div>
    </div>
  );
}

function RankedList({ rest, currentUser, currentRank }) {
  const fullRanked = useMemo(
    () => (rest || []).map((u, idx) => ({ ...u, rank: idx + 4 })),
    [rest]
  );

  let yourRow = null;
  if (currentUser) {
    const all = [...fullRanked].sort(
      (a, b) => (b.reputation_score || 0) - (a.reputation_score || 0)
    );
    const idx = all.findIndex((u) => u.id === currentUser.id);
    yourRow = {
      rank: idx >= 0 ? idx + 1 : currentRank,
      score: currentUser.reputation_score || 0,
    };
  }

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden shadow-[var(--shadow-card)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)] bg-[var(--bg-hover)]">
              <th className="w-16 px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Rank
              </th>
              <th className="px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Student
              </th>
              <th className="px-4 py-3.5 text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Branch / Year
              </th>
              <th className="px-4 py-3.5 text-right text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Reputation
              </th>
              <th className="px-4 py-3.5 text-right text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Badge
              </th>
              <th className="w-20 px-4 py-3.5 text-right text-[12px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Videos
              </th>
            </tr>
          </thead>
          <motion.tbody
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.03 } },
            }}
          >
            {fullRanked.map((user, i) => {
              const isCurrent = currentUser?.id === user.id;
              const videoCount = user.approved_videos_count ?? 0;
              const score = user.reputation_score || 0;
              const badge = user.badge || getBadge(score);
              const BadgeIcon = getBadgeIcon(badge);
              const branch =
                user.branch_code ||
                user.branch_name ||
                user.branch?.code ||
                user.branch?.name ||
                "—";
              const year = user.year != null ? `Year ${user.year}` : "";
              const isTop10 = user.rank <= 10;

              return (
                <motion.tr
                  key={user.id}
                  variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                  className={cn(
                    "group border-b border-[var(--border-default)] transition-colors last:border-0 hover:bg-[var(--bg-hover)] hover:shadow-[0_-1px_0_0_var(--border-default)]",
                    isCurrent && "bg-[var(--accent)]/10 border-l-4 border-l-[var(--accent)]"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isTop10 && (
                        <Medal className="h-4 w-4 shrink-0 text-amber-500/80" />
                      )}
                      <span className="text-[15px] font-bold text-[var(--text-primary)]">
                        #{user.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="md" bordered />
                      <div>
                        <span className="text-[15px] font-semibold text-[var(--text-primary)]">
                          {user.name}
                          {isCurrent && (
                            <span className="ml-1.5 text-xs font-medium text-[var(--accent)]">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-raised)] px-2.5 py-1 text-[13px] text-[var(--text-muted)]">
                      <span className="font-medium">{branch}</span>
                      {year && (
                        <span className="text-[11px] uppercase tracking-wide">{year}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[18px] font-bold text-[var(--accent)]">
                      {score}
                    </span>
                    <span className="ml-1 text-[13px] font-medium text-[var(--text-muted)]">pts</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-2.5 py-1 text-[12px] font-semibold text-[var(--accent)]">
                      <BadgeIcon className="h-3.5 w-3.5" />
                      {badge}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-[14px] font-medium text-[var(--text-muted)]">
                    {videoCount}
                  </td>
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {yourRow && yourRow.rank != null && (
        <div className="border-t-2 border-[var(--accent)]/20 bg-[var(--accent)]/5 px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-[var(--text-primary)]">
              Your rank: <strong className="text-[var(--accent)]">#{yourRow.rank}</strong>
            </span>
            <span className="text-[15px] font-bold text-[var(--accent)]">
              {yourRow.score} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function FooterCTA() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mt-12 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-6 py-6 text-center shadow-[var(--shadow-card)]"
    >
      <p className="text-[15px] font-medium text-[var(--text-primary)]">
        Not on the board yet? Submit your first video and start climbing.
      </p>
      <Link to="/submit" className="mt-4 inline-block">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition hover:bg-[var(--accent-hover)] hover:shadow-[var(--accent)]/30"
        >
          Submit now
          <ChevronRight className="h-4 w-4" />
        </button>
      </Link>
    </motion.div>
  );
}
