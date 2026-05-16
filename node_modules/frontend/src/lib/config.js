export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const APP_NAME = "PeerLearn";

export const MIN_RATINGS_FOR_PUBLIC_SCORE = 3;

export const FLAG_THRESHOLD = 2;

export const MAX_SUBMISSION_DESCRIPTION = 500;

export const REPUTATION_THRESHOLDS = {
  Newcomer: 0,
  Contributor: 50,
  Mentor: 200,
  Scholar: 500,
  Expert: 1000,
  Legend: 2500,
};

export const BADGE_COLORS = {
  Newcomer: { bg: "bg-slate-100", text: "text-slate-700" },
  Contributor: { bg: "bg-indigo-50", text: "text-indigo-700" },
  Mentor: { bg: "bg-emerald-50", text: "text-emerald-700" },
  Scholar: { bg: "bg-sky-50", text: "text-sky-700" },
  Expert: { bg: "bg-purple-50", text: "text-purple-700" },
  Legend: { bg: "bg-amber-50", text: "text-amber-700" },
};

export const REJECTION_REASON_TEMPLATES = [
  "Content does not match the tagged topic",
  "Audio or video quality is insufficient",
  "Explanation contains factual inaccuracies",
  "Not aligned with the official syllabus",
  "Video is too long — should focus on one concept",
  "Duplicate of a higher-rated existing explanation",
  "Notes link is broken or inaccessible",
];

