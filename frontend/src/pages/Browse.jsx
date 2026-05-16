import React from "react";
import { Link, useSearchParams, useParams, useNavigate } from "react-router-dom";
import {
  ArrowDownAZ,
  Clock,
  Eye,
  Home,
  ChevronRight,
  Sparkles,
  BookOpen,
  Video,
  TrendingUp,
  X,
  Command,
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import VideoCard from "../components/ui/VideoCard.jsx";
import Pagination from "../components/ui/Pagination.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import Select, { SelectItem } from "../components/ui/Select.jsx";
import { SkeletonBlock, SkeletonText } from "../components/ui/Skeleton.jsx";
import { useTopic } from "../hooks/useSyllabus.js";
import { useSubmissions } from "../hooks/useSubmissions.js";
import { useCommandPalette } from "../contexts/CommandPaletteContext.jsx";
import { cn } from "../lib/utils.js";

const SORT_OPTIONS = [
  { value: "rating", label: "Highest rated", icon: ArrowDownAZ },
  { value: "recent", label: "Most recent", icon: Clock },
  { value: "views", label: "Most viewed", icon: Eye },
];

const BROWSE_HINT_DISMISSED_KEY = "peerlearn-browse-hint-dismissed";

function TopicSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonText width="50%" height={28} />
      <SkeletonText width="40%" />
      <SkeletonBlock height={120} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBlock key={i} height={220} />
        ))}
      </div>
    </div>
  );
}

function buildBreadcrumbs(topic) {
  if (!topic || !topic.unit || !topic.unit.subject || !topic.unit.subject.branch) {
    return [
      { label: "Home", href: "/" },
      { label: "Browse", href: "/browse" },
    ];
  }

  const unit = topic.unit;
  const subject = unit.subject;
  const branch = subject.branch;

  return [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: branch.code || branch.name || "Branch" },
    { label: `Year ${subject.year}` },
    { label: subject.name },
    { label: `Unit ${unit.number}: ${unit.name}` },
    { label: topic.name },
  ];
}

function BrowseBreadcrumb({ items }) {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-[15px] font-medium text-[var(--text-muted)]"
      aria-label="Breadcrumb"
    >
      {items.map((item, idx) => (
        <React.Fragment key={item.label + idx}>
          {idx > 0 && (
            <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]/70" />
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-[var(--accent)] hover:underline"
            >
              {item.label === "Home" ? (
                <span className="inline-flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </span>
              ) : (
                item.label
              )}
            </Link>
          ) : (
            <span className="text-[var(--text-primary)]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

function SuggestedCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex flex-col items-start rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 text-left shadow-[var(--shadow-card)]",
        "transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-[var(--shadow-card-hover)]"
      )}
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]/20">
        <Icon className="h-5 w-5" strokeWidth={2} />
      </div>
      <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="mt-1 text-[13px] text-[var(--text-muted)]">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-[var(--accent)]">
        Select in sidebar
        <ChevronRight className="h-4 w-4" />
      </span>
    </button>
  );
}

export default function Browse() {
  const { topicId: topicIdFromPath } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { openPalette } = useCommandPalette();

  const [hintDismissed, setHintDismissed] = React.useState(() =>
    Boolean(typeof window !== "undefined" && window.localStorage?.getItem(BROWSE_HINT_DISMISSED_KEY))
  );

  const topicId = topicIdFromPath || searchParams.get("topic") || null;
  const page = Number(searchParams.get("page") || 1);
  const sort = searchParams.get("sort") || "rating";
  const validSort = SORT_OPTIONS.some((o) => o.value === sort) ? sort : "rating";

  const {
    data: topic,
    isLoading: topicLoading,
    isError: topicError,
    error: topicErrorObj,
    refetch: refetchTopic,
  } = useTopic(topicId);

  const {
    data: submissionsResponse,
    isLoading: videosLoading,
    isError: videosError,
    error: videosErrorObj,
    refetch: refetchVideos,
  } = useSubmissions(
    topicId
      ? {
          topicId,
          page,
          limit: 12,
          sort: validSort,
        }
      : {}
  );

  const submissions = topicId ? submissionsResponse?.data || [] : [];
  const pagination = topicId ? submissionsResponse?.pagination : null;

  const videoCount =
    topic?.video_count ??
    pagination?.total ??
    (Array.isArray(submissions) ? submissions.length : 0);

  const handlePageChange = (nextPage) => {
    const params = new URLSearchParams(searchParams);
    if (nextPage && nextPage !== 1) {
      params.set("page", String(nextPage));
    } else {
      params.delete("page");
    }
    setSearchParams(params, { replace: false });
  };

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    params.delete("page");
    setSearchParams(params, { replace: false });
  };

  const dismissHint = () => {
    setHintDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage?.setItem(BROWSE_HINT_DISMISSED_KEY, "1");
    }
  };

  const hasTopicSelected = Boolean(topicId);
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const searchShortcut = isMac ? "⌘K" : "Ctrl+K";

  return (
    <div
      className="mx-auto flex w-full max-w-[1600px]"
      style={{ paddingTop: 56 + 16 }}
    >
      <Sidebar />
      <div className="flex-1 px-8 pb-14 pt-4 md:px-12 lg:px-16">
        {!hasTopicSelected && (
          <>
            <BrowseBreadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Browse" },
              ]}
            />

            <section className="mt-10">
              <h1 className="text-[2.5rem] font-bold leading-tight tracking-tight text-[var(--text-primary)] md:text-[2.75rem]">
                Discover Peer Explanations
              </h1>
              <p className="mt-3 max-w-xl text-[18px] font-medium leading-relaxed text-[var(--text-body)]">
                Student-created videos tailored to your syllabus — faster
                understanding from peers who’ve been there.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1.5 text-[13px] font-semibold text-[var(--accent)]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Peer videos
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-raised)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-muted)]">
                  <Video className="h-3.5 w-3.5" />
                  Syllabus-aligned
                </span>
                <button
                  type="button"
                  onClick={openPalette}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-muted)] transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                >
                  <Command className="h-3.5 w-3.5" />
                  {searchShortcut} to search
                </button>
              </div>

              {!hintDismissed && (
                <div className="relative mt-8 max-w-lg rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 pr-10 text-[15px] text-[var(--text-body)] shadow-[var(--shadow-card)]">
                  <button
                    type="button"
                    onClick={dismissHint}
                    className="absolute right-3 top-3 rounded-lg p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <p className="font-medium text-[var(--text-primary)]">
                    How to find videos
                  </p>
                  <p className="mt-1">
                    Select a <strong>branch</strong> and <strong>year</strong> in
                    the sidebar, then drill to a <strong>subject → unit →
                    topic</strong>. Approved videos for that topic appear here
                    with ratings.
                  </p>
                </div>
              )}

              <div className="mt-12">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Suggested starting points
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <SuggestedCard
                    icon={BookOpen}
                    title="Pick a branch"
                    description="Choose your branch in the left panel to see subjects and units."
                    onClick={() => {}}
                  />
                  <SuggestedCard
                    icon={TrendingUp}
                    title="Explore by year"
                    description="Filter by Year 1–4 to match your current semester."
                    onClick={() => {}}
                  />
                  <SuggestedCard
                    icon={Video}
                    title="Watch & learn"
                    description="Select a topic to see peer explanations with ratings."
                    onClick={() => {}}
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {hasTopicSelected && (
          <>
            {topicError ? (
              <ErrorPanel error={topicErrorObj} onRetry={refetchTopic} />
            ) : topicLoading && !topic ? (
              <TopicSkeleton />
            ) : (
              <>
                <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border-default)] pb-6">
                  <BrowseBreadcrumb items={buildBreadcrumbs(topic)} />
                  <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
                      {topic?.name || "Topic"}
                    </h1>
                    <p className="mt-1 text-[15px] text-[var(--text-muted)]">
                      {topic?.unit && topic.unit.subject
                        ? `Unit ${topic.unit.number}: ${topic.unit.name} · ${
                            topic.unit.subject.name
                          } · ${topic.unit.subject.branch?.code || ""}`
                        : "Videos aligned with your syllabus"}
                    </p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 text-[14px] text-[var(--text-muted)]">
                  <span>
                    <strong className="text-[var(--text-primary)]">
                      {videoCount}
                    </strong>{" "}
                    {videoCount === 1 ? "video" : "videos"} available for this
                    topic.
                  </span>
                  {topic?.is_important && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[12px] font-semibold text-amber-400">
                      ⭐ Important for exams
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-[var(--text-muted)]">Sort:</span>
                    <Select
                      value={validSort}
                      onValueChange={handleSortChange}
                      className="min-w-[180px]"
                      aria-label="Sort videos"
                    >
                      {SORT_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <SelectItem key={opt.value} value={opt.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-3.5 w-3.5" />
                              {opt.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </Select>
                  </div>
                </div>

                {videosError ? (
                  <ErrorPanel error={videosErrorObj} onRetry={refetchVideos} />
                ) : videosLoading && !submissions.length ? (
                  <TopicSkeleton />
                ) : submissions.length === 0 ? (
                  <EmptyState
                    variant="no-videos"
                    title="No videos yet"
                    description="Be the first to explain this topic. Submit a short video and help your peers learn."
                    actionLabel="Submit Video"
                    onAction={() =>
                      navigate(
                        `/submit${topicId ? `?topicId=${topicId}` : ""}`
                      )
                    }
                  />
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {submissions.map((submission) => (
                        <VideoCard
                          key={submission.id}
                          submission={submission}
                        />
                      ))}
                    </div>
                    {pagination && pagination.total > pagination.limit && (
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          page={pagination.page}
                          totalPages={Math.max(
                            1,
                            Math.ceil(pagination.total / pagination.limit)
                          )}
                          onChange={handlePageChange}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
