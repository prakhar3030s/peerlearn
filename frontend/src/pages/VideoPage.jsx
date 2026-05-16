import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flag,
  ExternalLink,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Star,
  TrendingUp,
} from "lucide-react";
import { useSubmission, useRelatedSubmissions, useCreateRating, useCreateFlag } from "../hooks/useSubmissions.js";
import { useSubmissionRatings, useUserRating } from "../hooks/useRatings.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import { cn, extractYouTubeId, formatRelativeTime } from "../lib/utils.js";
import { Button } from "../components/ui/Button.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import StarRating from "../components/ui/StarRating.jsx";
import { SkeletonBlock, SkeletonText } from "../components/ui/Skeleton.jsx";
import Modal from "../components/ui/Modal.jsx";
import Select, { SelectItem } from "../components/ui/Select.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import { toastError, toastSuccess } from "../lib/toast.js";

function useMockViews(id) {
  return useMemo(() => {
    if (!id) return 0;
    try {
      const slice = id.slice(-4);
      const num = Number.parseInt(slice, 16);
      // 200–2000
      return (num % 1800) + 200;
    } catch {
      return 0;
    }
  }, [id]);
}

function ContributorCard({ contributor, createdAt }) {
  if (!contributor) return null;

  const score = contributor.reputation_score || 0;
  let badge = "Newcomer";
  if (score >= 2500) badge = "Legend";
  else if (score >= 1000) badge = "Expert";
  else if (score >= 500) badge = "Scholar";
  else if (score >= 200) badge = "Mentor";
  else if (score >= 50) badge = "Contributor";

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 shadow-md">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Contributor
      </div>
      <div className="flex items-center gap-3">
        <Avatar name={contributor.name} size="lg" bordered />
        <div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            {contributor.name}
          </div>
          <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            Student
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
          <Star className="h-3 w-3" />
          <span>{score} reputation points</span>
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
          {badge}
        </span>
      </div>
      {(contributor.year || contributor.branch) && (
        <div className="mt-2 text-xs text-[var(--text-muted)]">
          {[contributor.year && `${contributor.year} Year`, (contributor.branch?.code || contributor.branch?.name || contributor.branch) && (contributor.branch?.code || contributor.branch?.name || contributor.branch)]
            .filter(Boolean)
            .join(" · ")}
        </div>
      )}
      <button
        type="button"
        className="mt-3 text-xs font-medium text-brand-600 hover:underline"
      >
        View all videos by this contributor
      </button>
      <div className="mt-3 border-t border-[var(--border-default)] pt-3 text-[11px] text-[var(--text-muted)]">
        Submitted {formatRelativeTime(createdAt)}
      </div>
    </div>
  );
}

function NotesPanel({ driveUrl }) {
  if (!driveUrl) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-xs text-[var(--text-muted)]">
        <div className="mb-1 font-semibold">Study Notes &amp; Materials</div>
        <p>No notes attached for this video.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
        Study Notes &amp; Materials
      </div>
      <Button
        as="a"
        href={driveUrl}
        target="_blank"
        rel="noreferrer"
        variant="secondary"
        className="mb-2 w-full justify-center"
        leftIcon={<ExternalLink className="h-4 w-4" />}
      >
        Open Notes in Google Drive
      </Button>
      <p className="text-[11px] text-[var(--text-muted)]">
        Contributor-provided study materials — opens in a new tab.
      </p>
    </div>
  );
}

function TopicInfoCard({ topic, unit, subject, branch, videoCount }) {
  if (!topic || !unit || !subject || !branch) return null;

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-xs">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Topic Context
      </div>
      <div className="text-sm font-semibold text-[var(--text-primary)]">
        {topic.name}
      </div>
      <div className="mt-1 text-[11px] text-[var(--text-muted)]">
        Unit {unit.number} — {unit.name}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-[11px] text-[var(--text-muted)]">
        <span>{subject.name}</span>
        <span className="rounded-full bg-[var(--bg-raised)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
          {branch.code}
        </span>
      </div>
      {topic.is_important && (
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
          ⭐ Important for Exams
        </div>
      )}
      <div className="mt-3 text-[11px] text-[var(--text-muted)]">
        {videoCount} videos available for this topic.
      </div>
      <Link
        to={`/browse/${topic.id}`}
        className="mt-2 inline-flex items-center text-[11px] font-medium text-brand-600 hover:underline"
      >
        Browse all
        <ChevronRight className="ml-0.5 h-3 w-3" />
      </Link>
    </div>
  );
}

function SharePanel({ url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toastSuccess("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toastError("Could not copy link");
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(`Check out this explanation: ${url}`);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noreferrer");
  };

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-xs">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        <Share2 className="h-3 w-3" />
        <span>Share</span>
      </div>
      <Button
        variant="secondary"
        className="mb-2 w-full justify-center"
        onClick={handleCopy}
        leftIcon={
          copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />
        }
      >
        {copied ? "Copied!" : "Copy Link"}
      </Button>
      <Button
        variant="ghost"
        className="w-full justify-center text-emerald-600 hover:bg-emerald-50"
        onClick={handleWhatsApp}
      >
        Share on WhatsApp
      </Button>
    </div>
  );
}

function RelatedList({ topicId, currentId }) {
  const { data, isLoading } = useRelatedSubmissions(topicId, currentId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <SkeletonBlock width={120} height={68} borderRadius={8} />
            <div className="flex-1 space-y-2">
              <SkeletonText width="80%" />
              <SkeletonText width="60%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-xs text-[var(--text-muted)]">
        No other explanations for this topic yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((s) => {
        const videoId = extractYouTubeId(s.youtube_url);
        const thumb = s.youtube_thumbnail;
        return (
          <Link
            key={s.id}
            to={`/video/${s.id}`}
            className="flex gap-3 rounded-lg border border-transparent bg-transparent p-1 text-xs transition-all hover:border-[var(--border-default)] hover:bg-[var(--bg-raised)]"
          >
            <div className="relative h-[68px] w-[120px] overflow-hidden rounded-lg bg-[var(--bg-raised)]">
              {thumb ? (
                <img
                  src={thumb}
                  alt={s.youtube_title || "Video thumbnail"}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="skeleton h-full w-full" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <div className="line-clamp-2 text-[13px] font-semibold text-[var(--text-primary)]">
                {s.youtube_title || s.description}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {s.contributor?.name || "Contributor"}
              </div>
              {s.ratings?.overall && s.ratings.count >= 3 && (
                <div className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                  <Star className="h-3 w-3 text-amber-500" />
                  <span>{s.ratings.overall.toFixed(1)}</span>
                  <span>({s.ratings.count})</span>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function VideoPage() {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const role = currentUser?.role ?? "student";

  const {
    data: submission,
    isLoading,
    isError,
    error,
    refetch,
  } = useSubmission(submissionId);

  const { data: ratingsData } = useSubmissionRatings(submissionId);
  const { data: userRatingData } = useUserRating(
    currentUser?.id,
    submissionId
  );

  const [clarity, setClarity] = useState(null);
  const [usefulness, setUsefulness] = useState(null);
  const [showEditRating, setShowEditRating] = useState(false);
  const [optimisticRatings, setOptimisticRatings] = useState(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [flagDetails, setFlagDetails] = useState("");
  const [hasFlagged, setHasFlagged] = useState(false);

  const createRating = useCreateRating(submissionId);
  const createFlag = useCreateFlag(submissionId, currentUser?.id);

  const views = useMockViews(submissionId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [submissionId]);

  useEffect(() => {
    if (submission?.youtube_title) {
      document.title = `${submission.youtube_title} — PeerLearn`;
    } else if (submission) {
      document.title = "Video — PeerLearn";
    }
    return () => {
      document.title = "PeerLearn";
    };
  }, [submission]);

  useEffect(() => {
    if (userRatingData && !showEditRating) {
      setClarity(userRatingData.clarity_score);
      setUsefulness(userRatingData.usefulness_score);
    }
  }, [userRatingData, showEditRating]);

  const community = optimisticRatings || ratingsData;

  const handleSubmitRating = async () => {
    if (!currentUser?.id || !clarity || !usefulness) return;
    const prev = ratingsData;
    const isUpdate = Boolean(userRatingData);
    if (prev) {
      const sumClarity = prev.ratings.reduce(
        (acc, r) => acc + Number(r.clarity_score || 0),
        0
      );
      const sumUsefulness = prev.ratings.reduce(
        (acc, r) => acc + Number(r.usefulness_score || 0),
        0
      );
      const count = isUpdate ? prev.count : prev.count + 1;
      const oldClarity = isUpdate ? (userRatingData?.clarity_score ?? 0) : 0;
      const oldUsefulness = isUpdate ? (userRatingData?.usefulness_score ?? 0) : 0;
      const newSumClarity = sumClarity - oldClarity + clarity;
      const newSumUsefulness = sumUsefulness - oldUsefulness + usefulness;
      const newAvgClarity = newSumClarity / count;
      const newAvgUsefulness = newSumUsefulness / count;
      const overall =
        Math.round((newAvgClarity * 0.6 + newAvgUsefulness * 0.4) * 10) / 10;
      setOptimisticRatings({
        ratings: prev.ratings,
        count,
        averages: {
          clarity: Number(newAvgClarity.toFixed(2)),
          usefulness: Number(newAvgUsefulness.toFixed(2)),
          overall: count >= 3 ? overall : null,
        },
      });
    }

    try {
      await createRating.mutateAsync({
        student_id: currentUser.id,
        submission_id: submissionId,
        clarity_score: clarity,
        usefulness_score: usefulness,
      });
      setShowEditRating(false);
    } catch {
      setOptimisticRatings(null);
    }
  };

  const handleSubmitFlag = async () => {
    if (!currentUser?.id || !flagReason) {
      toastError("Please select a reason");
      return;
    }
    setHasFlagged(true);
    setFlagModalOpen(false);
    try {
      await createFlag.mutateAsync({
        student_id: currentUser.id,
        submission_id: submissionId,
        reason: flagReason,
      });
    } catch {
      setHasFlagged(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="mx-auto max-w-5xl px-4 pt-[76px] pb-10"
      >
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <SkeletonBlock
              width="100%"
              height={0}
              borderRadius={16}
              className="pb-[56.25%]"
            />
            <div className="mt-4 space-y-2">
              <SkeletonText width="40%" />
              <SkeletonText width="70%" />
            </div>
            <div className="mt-4 space-y-3">
              <SkeletonBlock width="100%" height={80} borderRadius={16} />
              <SkeletonText width="90%" />
              <SkeletonText width="80%" />
              <SkeletonText width="60%" />
            </div>
          </div>
          <div className="space-y-4">
            <SkeletonBlock width="100%" height={140} borderRadius={16} />
            <SkeletonBlock width="100%" height={120} borderRadius={16} />
          </div>
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="mx-auto max-w-2xl px-4 pt-[76px] pb-10"
      >
        <ErrorPanel error={error} onRetry={refetch} />
      </motion.div>
    );
  }

  if (!submission) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="flex min-h-screen items-center justify-center px-4 pt-[76px] pb-10"
      >
        <div className="max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-center shadow-xl">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Flag className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Video not found
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            The video you are looking for may have been removed or never
            existed.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button variant="primary" onClick={() => navigate("/browse")}>
              Browse Videos
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  const videoId = extractYouTubeId(submission.youtube_url);
  const topic = submission.topic?.unit?.subject ? submission.topic : null;
  const unit = topic?.unit;
  const subject = unit?.subject;
  const branch = subject?.branch;

  const breadcrumb = topic
    ? [
        { label: branch?.name, href: "/browse" },
        { label: subject?.name, href: "/browse" },
        { label: unit?.name, href: "/browse" },
        { label: topic.name },
      ]
    : [];

  const language = submission.language || "English";

  const canRate = role === "student" && currentUser;

  const showRatingForm =
    canRate && (!userRatingData || showEditRating || (!clarity && !usefulness));

  const overall = community?.averages?.overall;

  const ratingCount = community?.count || 0;

  const url = window.location.href;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="mx-auto max-w-5xl px-4 pt-[76px] pb-10"
    >
      <PageHeader
        title={submission.youtube_title || "Video Explanation"}
        subtitle={subject?.name}
        breadcrumbs={breadcrumb}
      />
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl bg-black md:rounded-2xl">
            {videoId ? (
              <div className="relative w-full pb-[56.25%]">
                <iframe
                  title={submission.youtube_title || "PeerLearn video"}
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&color=white`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <SkeletonBlock
                width="100%"
                height={0}
                borderRadius={16}
                className="pb-[56.25%]"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="rounded-full bg-[var(--bg-raised)] px-2 py-0.5 text-[var(--text-muted)]">
                {language}
              </span>
              {topic && (
                <Link
                  to={`/browse/${topic.id}`}
                  className="rounded-full bg-[var(--bg-raised)] px-2 py-0.5 text-[var(--text-muted)] hover:text-brand-600"
                >
                  {topic.name}
                </Link>
              )}
              <span className="rounded-full bg-[var(--bg-raised)] px-2 py-0.5 text-[var(--text-muted)]">
                {formatRelativeTime(submission.created_at)}
              </span>
              <span className="rounded-full bg-[var(--bg-raised)] px-2 py-0.5 text-[var(--text-muted)]">
                {views.toLocaleString()} views (approx.)
              </span>
            </div>

            {canRate && (
              <div className="mt-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6">
                {showRatingForm ? (
                  <>
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-[var(--text-primary)]">
                        Rate this explanation
                      </h3>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Help the community by rating this content
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Clarity Rating */}
                      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-hover)] p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <label className="block font-medium text-[var(--text-primary)]">
                              How clear is this explanation?
                            </label>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              Is the content easy to understand? Does it explain concepts well?
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-1">
                            <StarRating
                              mode="interactive"
                              value={clarity || 0}
                              onChange={setClarity}
                            />
                          </div>
                          {clarity && (
                            <span className="text-xs font-semibold text-blue-600">
                              {clarity === 5 && "Very clear"}
                              {clarity === 4 && "Clear"}
                              {clarity === 3 && "Moderate"}
                              {clarity === 2 && "Unclear"}
                              {clarity === 1 && "Very unclear"}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Usefulness Rating */}
                      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-hover)] p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <label className="block font-medium text-[var(--text-primary)]">
                              How useful is this content?
                            </label>
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                              Does this help you learn? Is it relevant to the topic?
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex gap-1">
                            <StarRating
                              mode="interactive"
                              value={usefulness || 0}
                              onChange={setUsefulness}
                            />
                          </div>
                          {usefulness && (
                            <span className="text-xs font-semibold text-green-600">
                              {usefulness === 5 && "Very useful"}
                              {usefulness === 4 && "Useful"}
                              {usefulness === 3 && "Somewhat useful"}
                              {usefulness === 2 && "Limited use"}
                              {usefulness === 1 && "Not useful"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center justify-between">
                      {userRatingData && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEditRating(false)}
                        >
                          Cancel
                        </Button>
                      )}
                      <div className="ml-auto flex gap-2">
                        <Button
                          size="sm"
                          loading={createRating.isLoading}
                          disabled={!clarity || !usefulness}
                          onClick={handleSubmitRating}
                        >
                          {userRatingData ? "Update Rating" : "Submit Rating"}
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">
                        ✓ You rated this explanation
                      </div>
                      {userRatingData && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-[var(--text-muted)]">
                              Clarity
                            </span>
                            <StarRating
                              mode="display"
                              value={userRatingData.clarity_score}
                              count={3}
                            />
                            <span className="text-xs font-semibold text-blue-600">
                              {userRatingData.clarity_score}/5
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-[var(--text-muted)]">
                              Usefulness
                            </span>
                            <StarRating
                              mode="display"
                              value={userRatingData.usefulness_score}
                              count={3}
                            />
                            <span className="text-xs font-semibold text-green-600">
                              {userRatingData.usefulness_score}/5
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowEditRating(true)}
                    >
                      Edit Rating
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Community rating
              </div>
              {!showRatingForm && canRate && !userRatingData ? (
                <div className="space-y-3">
                  {overall != null && ratingCount >= 3 ? (
                    <div className="space-y-3 pb-3 border-b border-[var(--border-default)]">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                          <div className="text-3xl font-bold text-amber-500">
                            {overall.toFixed(1)}
                          </div>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < Math.round(overall)
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-[var(--border-default)]"
                                )}
                              />
                            ))}
                          </div>
                          <div className="mt-1 text-xs text-[var(--text-muted)]">
                            out of 5
                          </div>
                        </div>
                        <div className="flex-1 space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--text-muted)]">Clarity</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i < Math.round(community.averages.clarity)
                                        ? "fill-blue-500 text-blue-500"
                                        : "text-[var(--border-default)]"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="w-8 text-right font-semibold text-[var(--text-primary)]">
                                {community.averages.clarity.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[var(--text-muted)]">Usefulness</span>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={cn(
                                      "h-3 w-3",
                                      i < Math.round(community.averages.usefulness)
                                        ? "fill-green-500 text-green-500"
                                        : "text-[var(--border-default)]"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="w-8 text-right font-semibold text-[var(--text-primary)]">
                                {community.averages.usefulness.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        Based on {ratingCount} rating{ratingCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                  ) : null}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowEditRating(true)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Rate this video
                  </Button>
                </div>
              ) : overall != null && ratingCount >= 3 ? (
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className="text-3xl font-bold text-amber-500">
                        {overall.toFixed(1)}
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3 w-3",
                              i < Math.round(overall)
                                ? "fill-amber-500 text-amber-500"
                                : "text-[var(--border-default)]"
                            )}
                          />
                        ))}
                      </div>
                      <div className="mt-1 text-xs text-[var(--text-muted)]">
                        out of 5
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Clarity</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < Math.round(community.averages.clarity)
                                    ? "fill-blue-500 text-blue-500"
                                    : "text-[var(--border-default)]"
                                )}
                              />
                            ))}
                          </div>
                          <span className="w-8 text-right font-semibold text-[var(--text-primary)]">
                            {community.averages.clarity.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Usefulness</span>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-3 w-3",
                                  i < Math.round(community.averages.usefulness)
                                    ? "fill-green-500 text-green-500"
                                    : "text-[var(--border-default)]"
                                )}
                              />
                            ))}
                          </div>
                          <span className="w-8 text-right font-semibold text-[var(--text-primary)]">
                            {community.averages.usefulness.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rating Count and Formula */}
                  <div className="border-t border-[var(--border-default)] pt-3 text-xs">
                    <div className="mb-2 flex items-center justify-between text-[var(--text-muted)]">
                      <span>{ratingCount} rating{ratingCount !== 1 ? "s" : ""}</span>
                      <span className="opacity-70">⭐ Based on community feedback</span>
                    </div>
                    <div className="rounded bg-[var(--bg-hover)] px-2 py-1.5 font-mono text-[10px] text-[var(--text-muted)]">
                      Score = Clarity (60%) + Usefulness (40%)
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                  <div className="text-xs text-amber-700 dark:text-amber-400">
                    <div className="font-semibold mb-1">No ratings yet</div>
                    <p>Be one of the first to rate this explanation. Community rating will be displayed after at least 3 ratings.</p>
                  </div>
                  {canRate && !showRatingForm && !userRatingData && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => setShowEditRating(true)}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Rate this video
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-sm">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                About this video
              </div>
              <p className="whitespace-pre-line text-[var(--text-body)] leading-relaxed">
                {submission.description}
              </p>
            </div>

            <div className="mt-4">
              <div className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
                More explanations for this topic
              </div>
              <RelatedList
                topicId={submission.topic_id || topic?.id}
                currentId={submission.id}
              />
            </div>

            {role === "student" && (
              <div className="mt-6 text-xs text-[var(--text-muted)]">
                {hasFlagged ? (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <Check className="h-3 w-3" />
                    You have reported this video.
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFlagModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-red-600"
                  >
                    <Flag className="h-3 w-3" />
                    Report an issue with this video
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 md:sticky md:top-[76px]">
          <ContributorCard
            contributor={submission.contributor}
            createdAt={submission.created_at}
          />
          <NotesPanel driveUrl={submission.drive_url} />
          <TopicInfoCard
            topic={submission.topic}
            unit={unit}
            subject={subject}
            branch={branch}
            videoCount={submission.topic_video_count || 0}
          />
          <SharePanel url={url} />
        </div>
      </div>

      <Modal
        open={flagModalOpen}
        onOpenChange={setFlagModalOpen}
        title="Report this video"
      >
        <div className="space-y-3 text-sm">
          <Select
            value={flagReason}
            onValueChange={setFlagReason}
            placeholder="Select a reason"
          >
            <SelectItem value="Inaccurate or incorrect content">
              Inaccurate or incorrect content
            </SelectItem>
            <SelectItem value="Wrong topic tag">Wrong topic tag</SelectItem>
            <SelectItem value="Poor audio or video quality">
              Poor audio or video quality
            </SelectItem>
            <SelectItem value="Inappropriate content">
              Inappropriate content
            </SelectItem>
            <SelectItem value="Duplicate of a better-rated video">
              Duplicate of a better-rated video
            </SelectItem>
            <SelectItem value="Broken video link">
              Broken video link
            </SelectItem>
          </Select>
          <Textarea
            label="Additional details (optional)"
            maxLength={300}
            rows={3}
            value={flagDetails}
            onChange={(e) => setFlagDetails(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFlagModalOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger-ghost"
            size="sm"
            loading={createFlag.isLoading}
            onClick={handleSubmitFlag}
          >
            Submit Report
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}
