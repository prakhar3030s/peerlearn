import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils.js";

function getPages(current, total) {
  const pages = [];
  const maxVisible = 7;

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i += 1) pages.push(i);
    return pages;
  }

  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);

  if (start > 1) pages.push(1);
  if (start > 2) pages.push("prev-ellipsis");

  for (let i = start; i <= end; i += 1) pages.push(i);

  if (end < total - 1) pages.push("next-ellipsis");
  if (end < total) pages.push(total);

  return pages;
}

export function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = getPages(page, totalPages);

  const go = (p) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange?.(p);
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => go(page - 1)}
        className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--border-default)] px-3 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-raised)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page <= 1}
      >
        <ChevronLeft className="mr-1 h-3 w-3" />
        Prev
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p) =>
          typeof p === "number" ? (
            <button
              key={p}
              type="button"
              onClick={() => go(p)}
              className={cn(
                "inline-flex h-8 min-w-[32px] items-center justify-center rounded-full border px-2 text-xs transition-colors",
                p === page
                  ? "border-transparent bg-[linear-gradient(135deg,#1E4D8C_0%,#2563EB_50%,#6366F1_100%)] text-white"
                  : "border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-body)] hover:bg-[var(--bg-raised)]"
              )}
            >
              {p}
            </button>
          ) : (
            <span
              key={p}
              className="px-1 text-xs text-[var(--text-muted)]"
            >
              ...
            </span>
          )
        )}
      </div>
      <button
        type="button"
        onClick={() => go(page + 1)}
        className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--border-default)] px-3 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-raised)] disabled:cursor-not-allowed disabled:opacity-50"
        disabled={page >= totalPages}
      >
        Next
        <ChevronRight className="ml-1 h-3 w-3" />
      </button>
    </div>
  );
}

export default Pagination;

