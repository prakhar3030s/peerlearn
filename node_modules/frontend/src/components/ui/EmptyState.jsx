import React from "react";
import { cn } from "../../lib/utils.js";
import { Button } from "./Button.jsx";

function Illustration({ variant }) {
  const common = "h-20 w-20 sm:h-24 sm:w-24 text-brand-500 dark:text-brand-400";

  if (variant === "no-results") {
    return (
      <div className={common} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <circle cx="28" cy="28" r="14" fill="none" stroke="currentColor" strokeWidth="2" />
        <line
          x1="38"
          y1="38"
          x2="50"
          y2="50"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      </div>
    );
  }

  if (variant === "no-submissions") {
    return (
      <div className={common} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect
          x="14"
          y="10"
          width="36"
          height="44"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M22 22h20M22 30h16M22 38h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M26 14h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      </div>
    );
  }

  if (variant === "queue-empty") {
    return (
      <div className={common} aria-hidden="true">
      <svg viewBox="0 0 64 64" className="h-full w-full">
        <rect
          x="10"
          y="16"
          width="44"
          height="32"
          rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <polyline
          points="16,24 24,32 32,24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22 36h20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      </div>
    );
  }

  // no-videos
  return (
    <div className={common} aria-hidden="true">
    <svg viewBox="0 0 64 64" className="h-full w-full">
      <rect
        x="10"
        y="18"
        width="44"
        height="28"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <polygon
        points="28,24 40,32 28,40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 50h32"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  variant = "no-videos",
  className,
}) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-md flex-col items-center gap-5 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-8 py-10 text-center shadow-sm",
        className
      )}
    >
      <Illustration variant={variant} />
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-sm leading-relaxed text-[var(--text-muted)]">
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button size="md" variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

