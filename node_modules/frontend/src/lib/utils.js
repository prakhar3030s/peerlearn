import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/embed/")[1];
      }
      const shortsMatch = parsed.pathname.match(/\/shorts\/([^/?]+)/);
      if (shortsMatch) return shortsMatch[1];
    }
  } catch {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
    );
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeThumbnail(urlOrId) {
  const id =
    urlOrId && urlOrId.includes("http")
      ? extractYouTubeId(urlOrId)
      : urlOrId;
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function formatDuration(isoDuration) {
  if (!isoDuration) return "";
  const match = isoDuration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/
  );
  if (!match) return "";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");

  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatRelativeTime(dateInput) {
  if (!dateInput) return "";
  const date =
    dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60)
    return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
  if (diffHr < 24)
    return diffHr === 1 ? "1 hour ago" : `${diffHr} hours ago`;
  if (diffDay < 7)
    return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;

  const weeks = Math.round(diffDay / 7);
  if (weeks < 5)
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;

  const months = Math.round(diffDay / 30);
  if (months < 12)
    return months === 1 ? "1 month ago" : `${months} months ago`;

  const years = Math.round(diffDay / 365);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}

export function calculateRatingScore(clarity, usefulness) {
  const c = Number(clarity) || 0;
  const u = Number(usefulness) || 0;
  const score = c * 0.6 + u * 0.4;
  return Math.round(score * 10) / 10;
}

