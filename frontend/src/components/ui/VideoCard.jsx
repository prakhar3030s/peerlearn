import React from "react";
import { Link } from "react-router-dom";
import { Play, Paperclip } from "lucide-react";
import { cn, formatRelativeTime } from "../../lib/utils.js";
import Avatar from "./Avatar.jsx";
import StatusBadge from "./StatusBadge.jsx";
import StarRating from "./StarRating.jsx";
import { SkeletonBlock, SkeletonText } from "./Skeleton.jsx";

export function VideoCard({ submission, loading = false }) {
  if (loading || !submission) {
    return (
      <div className="card-hover overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <SkeletonBlock
          width="100%"
          height={0}
          borderRadius={0}
          className="pb-[56.25%]"
        />
        <div className="space-y-3 p-4">
          <SkeletonText width="80%" />
          <div className="flex items-center gap-2">
            <SkeletonBlock width={32} height={32} borderRadius={999} />
            <div className="flex-1 space-y-1">
              <SkeletonText width="60%" />
              <SkeletonText width="40%" />
            </div>
          </div>
          <SkeletonText width="50%" />
        </div>
      </div>
    );
  }

  const {
    id,
    youtube_thumbnail,
    youtube_title,
    description,
    contributor,
    language,
    drive_url,
    topic,
    ratings,
    created_at,
  } = submission;

  const overall = ratings?.overall;
  const ratingCount = ratings?.count || 0;

  return (
    <Link
      to={`/video/${id}`}
      className="card-hover block overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)]"
    >
      <div className="relative w-full pb-[56.25%] bg-[var(--bg-raised)]">
        {youtube_thumbnail ? (
          <img
            src={youtube_thumbnail}
            alt={youtube_title || "Video thumbnail"}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0">
            <SkeletonBlock width="100%" height="100%" borderRadius={0} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white">
            <Play className="ml-0.5 h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 text-[15px] font-semibold text-[var(--text-primary)]">
          {youtube_title || description}
        </h3>

        <div className="mb-2 flex items-center gap-2">
          <Avatar name={contributor?.name || "Student"} size="sm" bordered />
          <span className="text-[13px] font-medium text-[var(--text-body)]">
            {contributor?.name || "Student"}
          </span>
        </div>

        <div className="mb-2 flex items-center justify-between gap-2">
          {overall != null && ratingCount >= 3 ? (
            <StarRating mode="display" value={overall} count={ratingCount} />
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">
              Not enough ratings yet
            </span>
          )}
          {drive_url && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
              <Paperclip className="h-3 w-3" />
              Notes
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 text-[10px]">
          {language && (
            <span className="rounded-full bg-[var(--bg-raised)] px-2 py-0.5 text-[var(--text-muted)]">
              {language}
            </span>
          )}
          {topic && (
            <span className="truncate text-[11px] text-[var(--text-muted)]">
              {topic.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export const SkeletonCard = React.memo(function SkeletonCard() {
  return <VideoCard loading />;
});

export default React.memo(VideoCard);

