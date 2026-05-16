import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, Flag, ChevronRight } from "lucide-react";
import {
  useModerationQueue,
  useModerationSubmission,
  useApproveSubmission,
  useRejectSubmission,
  useFlagSubmission,
  useStartReview,
} from "../hooks/useModeration.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button } from "../components/ui/Button.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonText, SkeletonBlock } from "../components/ui/Skeleton.jsx";
import { cn, formatRelativeTime, extractYouTubeId } from "../lib/utils.js";

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under review" },
  { value: "flagged", label: "Flagged" },
];

export default function Moderation() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [status, setStatus] = useState("pending");
  const [selectedId, setSelectedId] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const {
    data: queueData,
    isLoading: queueLoading,
    isError: queueError,
    error: queueErrorObj,
    refetch: refetchQueue,
  } = useModerationQueue({
    status,
    page: 1,
    limit: 30,
  });
  const list = queueData?.data || [];
  const selectedIndex = list.findIndex((s) => s.id === selectedId);

  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailError,
    error: detailErrorObj,
    refetch: refetchDetail,
  } = useModerationSubmission(selectedId);
  const submission = detail?.submission;
  const ratings = detail?.ratings || [];
  const flags = detail?.flags || [];

  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const flag = useFlagSubmission();
  const startReview = useStartReview();

  const moderatorId = currentUser?.id || null;

  const handleApprove = useCallback(() => {
    if (!selectedId) return;
    approve.mutate(
      { id: selectedId, moderator_id: moderatorId },
      {
        onSuccess: () => {
          const next = list[selectedIndex + 1];
          setSelectedId(next?.id ?? null);
        },
      }
    );
  }, [selectedId, selectedIndex, list, moderatorId, approve]);

  const handleReject = useCallback(() => {
    if (!rejectModal.id || rejectionReason.trim().length < 20) return;
    reject.mutate(
      {
        id: rejectModal.id,
        rejection_reason: rejectionReason.trim(),
        moderator_id: moderatorId,
      },
      {
        onSuccess: () => {
          setRejectModal({ open: false, id: null });
          setRejectionReason("");
          if (selectedId === rejectModal.id) {
            const next = list[selectedIndex + 1];
            setSelectedId(next?.id ?? null);
          }
        },
      }
    );
  }, [rejectModal.id, rejectionReason, selectedId, selectedIndex, list, moderatorId, reject]);

  const handleFlag = useCallback(() => {
    if (!selectedId) return;
    flag.mutate({ id: selectedId });
  }, [selectedId, flag]);

  useEffect(() => {
    if (!selectedId) return;
    startReview.mutate({ id: selectedId, moderator_id: moderatorId });
  }, [selectedId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest("textarea") || e.target.closest("input")) return;
      if (e.key === "Escape") {
        setSelectedId(null);
        setRejectModal((m) => (m.open ? { ...m, open: false } : m));
        return;
      }
      if (e.key === "a" || e.key === "A") {
        if (selectedId && !approve.isPending) handleApprove();
        return;
      }
      if (e.key === "r" || e.key === "R") {
        if (selectedId) setRejectModal({ open: true, id: selectedId });
        return;
      }
      if (e.key === "j" || e.key === "J") {
        if (list.length && selectedIndex < list.length - 1)
          setSelectedId(list[selectedIndex + 1].id);
        return;
      }
      if (e.key === "k" || e.key === "K") {
        if (selectedIndex > 0) setSelectedId(list[selectedIndex - 1].id);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, selectedIndex, list, handleApprove, approve.isPending]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4" style={{ paddingTop: 56 + 16 }}>
      <PageHeader
        title="Moderation Queue"
        subtitle="Review and approve or reject video submissions. Flow: Pending → Under review → Approved or Rejected."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Moderation" }]}
      />

      {queueError ? (
        <ErrorPanel error={queueErrorObj} onRetry={refetchQueue} />
      ) : (
        <>
      <div className="mb-3 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              setStatus(tab.value);
              setSelectedId(null);
            }}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
              status === tab.value
                ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]">
          <div className="border-b border-[var(--border-default)] px-4 py-3 text-sm font-semibold text-[var(--text-primary)]">
            Submissions ({queueData?.pagination?.total ?? 0})
          </div>
          <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
            {queueLoading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <SkeletonBlock key={i} height={72} />
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  variant="queue-empty"
                  title="Queue empty"
                  description="No submissions in this queue right now. New submissions will appear here when students submit videos."
                />
              </div>
            ) : (
              // NOTE: If this list regularly exceeds ~50 items, consider replacing
              // this map with react-virtual (e.g. @tanstack/react-virtual) to
              // virtualize rows for better performance.
              list.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 border-b border-[var(--border-default)] px-4 py-3 text-left transition-colors last:border-0 hover:bg-[var(--bg-hover)]",
                    selectedId === item.id && "bg-[var(--accent)]/10"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {item.topic?.name ?? "Unknown topic"}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-[var(--text-muted)]">
                      {item.contributor?.name ?? "Unknown"} ·{" "}
                      {formatRelativeTime(item.created_at)}
                    </div>
                  </div>
                  {item.flag_count > 0 && (
                    <span className="flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                      <Flag className="h-3 w-3" />
                      {item.flag_count}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[var(--radius-card)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-card)]">
          {!selectedId ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center text-center text-[var(--text-muted)]">
              <p className="text-sm font-medium text-[var(--text-primary)]">Select a submission from the list</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
                <kbd className="rounded border border-[var(--border-default)] bg-[var(--bg-raised)] px-2 py-1 font-mono">J</kbd>
                <span>/</span>
                <kbd className="rounded border border-[var(--border-default)] bg-[var(--bg-raised)] px-2 py-1 font-mono">K</kbd>
                <span>next/prev</span>
                <kbd className="rounded border border-[var(--border-default)] bg-[var(--bg-raised)] px-2 py-1 font-mono">A</kbd>
                <span>approve</span>
                <kbd className="rounded border border-[var(--border-default)] bg-[var(--bg-raised)] px-2 py-1 font-mono">R</kbd>
                <span>reject</span>
                <kbd className="rounded border border-[var(--border-default)] bg-[var(--bg-raised)] px-2 py-1 font-mono">Esc</kbd>
                <span>clear</span>
              </div>
            </div>
          ) : detailError ? (
            <ErrorPanel error={detailErrorObj} onRetry={refetchDetail} />
          ) : detailLoading ? (
            <div className="space-y-3">
              <SkeletonText width="70%" />
              <SkeletonBlock height={200} />
            </div>
          ) : submission ? (
            <>
              {(() => {
                const videoId = extractYouTubeId(submission.youtube_url);
                return videoId ? (
                  <div className="mb-4 overflow-hidden rounded-xl bg-black">
                    <div className="relative w-full pb-[56.25%]">
                      <iframe
                        title={submission.youtube_title || "Submission video"}
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null;
              })()}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {submission.topic?.name ?? "Topic"}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    {submission.contributor?.name} · {formatRelativeTime(submission.created_at)}
                  </p>
                </div>
                <StatusBadge status={submission.status} />
              </div>
              {submission.youtube_title && (
                <p className="mb-2 text-sm text-[var(--text-body)]">
                  <span className="font-medium">Title:</span> {submission.youtube_title}
                </p>
              )}
              {submission.description && (
                <p className="mb-4 text-sm text-[var(--text-muted)]">
                  {submission.description}
                </p>
              )}
              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApprove}
                  disabled={approve.isPending}
                  loading={approve.isPending}
                >
                  <Check className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setRejectModal({ open: true, id: selectedId })}
                  disabled={reject.isPending}
                >
                  <X className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFlag}
                  disabled={flag.isPending}
                >
                  <Flag className="mr-1 h-4 w-4" />
                  Flag
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/moderation/${selectedId}`)}
                >
                  Full page →
                </Button>
              </div>
              {flags.length > 0 && (
                <div className="mb-2 text-xs font-medium text-[var(--text-muted)]">
                  {flags.length} flag(s)
                </div>
              )}
              {ratings.length > 0 && (
                <div className="text-xs text-[var(--text-muted)]">
                  {ratings.length} rating(s)
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
        </>
      )}

      <Modal
        open={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, id: null });
          setRejectionReason("");
        }}
        title="Reject submission"
      >
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          Provide a reason (min 20 characters). The contributor will be notified.
        </p>
        <Textarea
          label="Rejection reason"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="e.g. Video does not cover the syllabus topic adequately..."
          maxLength={500}
          rows={4}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={() => setRejectModal({ open: false, id: null })}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleReject}
            disabled={rejectionReason.trim().length < 20 || reject.isPending}
            loading={reject.isPending}
          >
            Reject
          </Button>
        </div>
      </Modal>
    </div>
  );
}
