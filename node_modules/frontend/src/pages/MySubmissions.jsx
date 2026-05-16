import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Clock, CheckCircle2, XCircle, Flag, Filter, Pencil } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useMySubmissions, setSubmitDraft } from "../hooks/useSubmissions.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import StarRating from "../components/ui/StarRating.jsx";
import Tooltip from "../components/ui/Tooltip.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import Modal from "../components/ui/Modal.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import { cn, formatRelativeTime } from "../lib/utils.js";

const FILTERS = ["all", "approved", "pending", "rejected", "flagged"];

function StatsRow({ submissions }) {
  const total = submissions.length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const pending = submissions.filter((s) =>
    ["pending", "under_review"].includes(s.status)
  ).length;
  const rejected = submissions.filter((s) => s.status === "rejected").length;

  const cards = [
    {
      label: "Total Submitted",
      value: total,
      icon: Play,
      color: "text-brand-600",
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Rejected",
      value: rejected,
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)]">
              {card.label}
            </span>
            <card.icon className={cn("h-4 w-4", card.color)} />
          </div>
          <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MySubmissions() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const contributorParam = params.get("contributor");

  const isReadOnly = Boolean(contributorParam);

  const userId = isReadOnly ? contributorParam : currentUser?.id;
  const { data: submissions = [], isLoading, isError, error, refetch } = useMySubmissions(userId);

  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [reasonModal, setReasonModal] = useState(null);

  const filtered = useMemo(() => {
    let list = submissions;
    if (isReadOnly) {
      list = list.filter((s) => s.status === "approved");
    }
    if (filter === "approved") list = list.filter((s) => s.status === "approved");
    if (filter === "pending")
      list = list.filter((s) =>
        ["pending", "under_review"].includes(s.status)
      );
    if (filter === "rejected") list = list.filter((s) => s.status === "rejected");
    if (filter === "flagged") list = list.filter((s) => s.status === "flagged");

    if (sort === "newest") {
      list = [...list].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sort === "oldest") {
      list = [...list].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (sort === "status") {
      const order = ["pending", "under_review", "approved", "rejected", "flagged", "removed"];
      list = [...list].sort(
        (a, b) => order.indexOf(a.status) - order.indexOf(b.status)
      );
    }
    return list;
  }, [submissions, filter, sort, isReadOnly]);

  const handleResubmit = (submission) => {
    setSubmitDraft({
      youtube_url: submission.youtube_url,
      drive_url: submission.drive_url,
      year: "",
      branch_id: "",
      subject_id: "",
      unit_id: "",
      topic_id: submission.topic_id,
      language: submission.language || "English",
      description: submission.description,
      contributor_name: currentUser?.name || "",
      contributor_email: currentUser?.email || "",
    });
    navigate(`/submit?topicId=${submission.topic_id}`);
  };

  const title = isReadOnly
    ? "Videos by Contributor"
    : "My Submissions";

  const subtitle = isReadOnly
    ? `${filtered.length} approved videos`
    : `${submissions.length} videos submitted`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="mx-auto max-w-5xl px-4 pt-[76px] pb-10"
    >
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          !isReadOnly && (
            <Button variant="primary" onClick={() => navigate("/submit")}>
              Submit New Video
            </Button>
          )
        }
      />

      {isError ? (
        <ErrorPanel error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-3">
          <StatsRow submissions={[]} />
          <div className="mt-4 space-y-2">
            <div className="h-16 rounded-xl bg-[var(--bg-raised)]" />
            <div className="h-16 rounded-xl bg-[var(--bg-raised)]" />
          </div>
        </div>
      ) : submissions.length === 0 && !isReadOnly ? (
        <EmptyState
          variant="no-submissions"
          title="You haven't submitted any videos yet"
          description="Share your explanations and help your juniors understand tough topics."
          actionLabel="Submit Your First Video"
          onAction={() => navigate("/submit")}
        />
      ) : (
        <>
          <StatsRow submissions={submissions} />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface)] px-2 py-1">
              {FILTERS.map((key) => {
                const label =
                  key === "all"
                    ? "All"
                    : key === "approved"
                    ? "Approved"
                    : key === "pending"
                    ? "Pending"
                    : key === "rejected"
                    ? "Rejected"
                    : "Flagged";
                const count =
                  key === "all"
                    ? submissions.length
                    : submissions.filter((s) =>
                        key === "pending"
                          ? ["pending", "under_review"].includes(s.status)
                          : s.status === key
                      ).length;

                return (
                  <button
                    key={key}
                    type="button"
                    className={cn(
                      "rounded-full px-2 py-0.5",
                      filter === key
                        ? "bg-brand-50 text-brand-700"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-raised)]"
                    )}
                    onClick={() => setFilter(key)}
                  >
                    {label}{" "}
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-[var(--text-muted)]" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] px-2 py-1 text-xs text-[var(--text-body)]"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="status">By status</option>
              </select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-6 text-xs text-[var(--text-muted)]">
              No submissions for this filter.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {/* NOTE: If this list regularly exceeds ~50 items, consider replacing
                  this map with react-virtual (e.g. @tanstack/react-virtual) to
                  virtualize rows for better performance. */}
              {filtered.map((s) => {
                const date = new Date(s.created_at);
                const rating = s.ratings?.overall;
                const count = s.ratings?.count || 0;
                const status = s.status;
                const awaiting = ["pending", "under_review"].includes(status);
                const isFlagged = status === "flagged";

                return (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-xs"
                  >
                    <div className="relative h-[68px] w-[120px] flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-raised)]">
                      {s.youtube_thumbnail ? (
                        <img
                          src={s.youtube_thumbnail}
                          alt="Thumbnail"
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--text-muted)]">
                          <Play className="h-5 w-5" />
                        </div>
                      )}
                      <div className="absolute left-1 top-1">
                        <StatusBadge status={status} />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex justify-between gap-2">
                        <div>
                          <div className="text-[14px] font-semibold text-[var(--text-primary)]">
                            {s.topic?.name || "Topic"}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            {s.topic?.unit?.subject?.name || ""}{" "}
                            {s.topic?.unit && `· Unit ${s.topic.unit.number}`}
                          </div>
                        </div>
                      </div>
                      <div className="line-clamp-2 text-[11px] text-[var(--text-body)]">
                        {s.description}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                        <Tooltip
                          content={date.toLocaleString()}
                        >
                          <span>{formatRelativeTime(s.created_at)}</span>
                        </Tooltip>
                        <span>· {s.language}</span>
                      </div>
                    </div>
                    <div className="flex w-44 flex-col items-end justify-between gap-2">
                      <StatusBadge status={status} />
                      {status === "approved" && rating && count >= 3 && (
                        <div className="mt-1 text-right">
                          <StarRating
                            mode="display"
                            value={rating}
                            count={count}
                          />
                        </div>
                      )}
                      {status === "rejected" && (
                        <div className="flex flex-col gap-1">
                          {s.rejection_reason && (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => setReasonModal(s)}
                            >
                              View moderator feedback
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            size="xs"
                            onClick={() => handleResubmit(s)}
                            leftIcon={<Pencil className="h-3 w-3" />}
                          >
                            Edit & resubmit
                          </Button>
                        </div>
                      )}
                      {(awaiting || isFlagged) && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleResubmit(s)}
                          leftIcon={<Pencil className="h-3 w-3" />}
                        >
                          Edit & resubmit
                        </Button>
                      )}
                      {awaiting && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                          <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-amber-500" />
                          Pending / Under review
                        </span>
                      )}
                      {isFlagged && (
                        <Tooltip content="Your video was flagged by the community and is being re-reviewed.">
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700">
                            <Flag className="h-3 w-3" />
                            Flagged for review
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}

      {reasonModal && (
        <Modal
          open={Boolean(reasonModal)}
          onOpenChange={(open) => !open && setReasonModal(null)}
          title="Moderator feedback"
        >
          <p className="mb-2 text-xs text-[var(--text-muted)]">
            Your submission was rejected. Use this feedback to improve and resubmit.
          </p>
          <div className="space-y-3 text-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Rejection reason
            </div>
            <blockquote className="rounded-lg border-l-2 border-brand-500 bg-[var(--bg-raised)] px-3 py-2 text-[var(--text-body)]">
              {reasonModal.rejection_reason}
            </blockquote>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReasonModal(null)}
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                const s = reasonModal;
                setReasonModal(null);
                handleResubmit(s);
              }}
            >
              Edit & resubmit
            </Button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}

