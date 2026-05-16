import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, X, Flag, ExternalLink } from "lucide-react";
import {
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
import { SkeletonText, SkeletonBlock } from "../components/ui/Skeleton.jsx";
import { cn, formatRelativeTime, extractYouTubeId } from "../lib/utils.js";

export default function ModerationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: detail, isLoading, isError, error, refetch } = useModerationSubmission(id);
  const submission = detail?.submission;
  const ratings = detail?.ratings || [];
  const flags = detail?.flags || [];
  const revisionHistory = detail?.revision_history || [];

  const approve = useApproveSubmission();
  const reject = useRejectSubmission();
  const flag = useFlagSubmission();
  const startReview = useStartReview();

  const moderatorId = currentUser?.id || null;

  useEffect(() => {
    if (id && moderatorId) startReview.mutate({ id, moderator_id: moderatorId });
  }, [id, moderatorId]);

  const handleApprove = useCallback(() => {
    if (!id) return;
    approve.mutate(
      { id, moderator_id: moderatorId },
      { onSuccess: () => navigate("/moderation") }
    );
  }, [id, moderatorId, approve, navigate]);

  const handleReject = useCallback(() => {
    if (!id || rejectionReason.trim().length < 20) return;
    reject.mutate(
      {
        id,
        rejection_reason: rejectionReason.trim(),
        moderator_id: moderatorId,
      },
      {
        onSuccess: () => {
          setRejectModal(false);
          setRejectionReason("");
          navigate("/moderation");
        },
      }
    );
  }, [id, rejectionReason, moderatorId, reject, navigate]);

  const ytid = submission?.youtube_url
    ? extractYouTubeId(submission.youtube_url)
    : null;

  if (!id) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-4" style={{ paddingTop: 56 + 16 }}>
      <PageHeader
        title="Review submission"
        subtitle={submission?.topic?.name ?? id}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Moderation", href: "/moderation" },
          { label: "Review" },
        ]}
      />

      <div className="mb-4">
        <Link
          to="/moderation"
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to queue
        </Link>
      </div>

      {isError ? (
        <ErrorPanel error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-4">
          <SkeletonBlock height={240} />
          <SkeletonText width="80%" />
          <SkeletonText width="60%" />
        </div>
      ) : !submission ? (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-[var(--text-muted)]">
          Submission not found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-semibold text-[var(--text-primary)]">
                  {submission.youtube_title || "Untitled"}
                </h1>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  {submission.contributor?.name} · {formatRelativeTime(submission.created_at)}
                </p>
              </div>
              <StatusBadge status={submission.status} />
            </div>

            {ytid && (
              <div className="mb-4 overflow-hidden rounded-xl bg-black">
                <div className="relative w-full pb-[56.25%]">
                  <iframe
                    title={submission.youtube_title || "Submission video"}
                    src={`https://www.youtube-nocookie.com/embed/${ytid}?rel=0&modestbranding=1`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="mt-2">
                  <a
                    href={submission.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline dark:text-brand-400"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in YouTube
                  </a>
                </div>
              </div>
            )}

            {submission.description && (
              <p className="mb-4 text-sm text-[var(--text-body)]">
                {submission.description}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={handleApprove}
                disabled={approve.isPending}
                loading={approve.isPending}
              >
                <Check className="mr-1 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => setRejectModal(true)}
                disabled={reject.isPending}
              >
                <X className="mr-1 h-4 w-4" />
                Reject
              </Button>
              <Button
                variant="secondary"
                onClick={() => flag.mutate({ id })}
                disabled={flag.isPending}
              >
                <Flag className="mr-1 h-4 w-4" />
                Flag
              </Button>
            </div>
          </div>

          {flags.length > 0 && (
            <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                Flags ({flags.length})
              </h3>
              <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                {flags.map((f) => (
                  <li key={f.id}>
                    {f.reason ?? "No reason"} — {formatRelativeTime(f.created_at)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {ratings.length > 0 && (
            <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                Ratings ({ratings.length})
              </h3>
              <ul className="space-y-1 text-sm text-[var(--text-muted)]">
                {ratings.slice(0, 10).map((r) => (
                  <li key={r.id}>
                    Clarity: {r.clarity_score} · Usefulness: {r.usefulness_score}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {revisionHistory.length > 0 && (
            <section className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                Revision history
              </h3>
              <p className="text-sm text-[var(--text-muted)]">
                {revisionHistory.length} previous submission(s) for this topic by same contributor.
              </p>
            </section>
          )}
        </div>
      )}

      <Modal
        open={rejectModal}
        onClose={() => {
          setRejectModal(false);
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
          <Button variant="ghost" onClick={() => setRejectModal(false)}>
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
