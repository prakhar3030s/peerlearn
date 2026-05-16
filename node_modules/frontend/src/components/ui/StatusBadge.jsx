import React from "react";
import { Check, Flag, X } from "lucide-react";
import { cn } from "../../lib/utils.js";

const base =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold";

const styles = {
  pending: "bg-amber-100 text-amber-800",
  under_review: "bg-blue-100 text-blue-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
  flagged: "bg-amber-100 text-amber-800",
  removed: "bg-slate-100 text-slate-500 line-through",
};

export function StatusBadge({ status, className }) {
  const icon =
    status === "approved" ? (
      <Check className="h-3 w-3" />
    ) : status === "rejected" ? (
      <X className="h-3 w-3" />
    ) : status === "flagged" ? (
      <Flag className="h-3 w-3" />
    ) : (
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "pending"
            ? "bg-amber-500 animate-pulseDot"
            : status === "under_review"
            ? "bg-blue-500"
            : "bg-slate-400"
        )}
      />
    );

  const labelMap = {
    pending: "Pending",
    under_review: "Under review",
    approved: "Approved",
    rejected: "Rejected",
    flagged: "Flagged",
    removed: "Removed",
  };

  const ariaLabel = `Status: ${labelMap[status] || status}`;

  return (
    <span
      className={cn(base, styles[status] || styles.pending, className)}
      role="status"
      aria-label={ariaLabel}
    >
      {icon}
      <span>{labelMap[status] || status}</span>
    </span>
  );
}

export default React.memo(StatusBadge);

