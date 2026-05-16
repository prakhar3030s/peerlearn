import React from "react";
import { cn } from "../../lib/utils.js";

const sizeHeight = {
  sm: 4,
  md: 8,
  lg: 12,
};

export function ProgressBar({
  value = 0,
  label,
  showPercentage = false,
  size = "md",
  className,
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const height = sizeHeight[size] || sizeHeight.md;

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="mb-1 flex items-center justify-between text-xs text-[var(--text-muted)]">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="font-medium text-[var(--text-primary)]">
              {clamped.toFixed(0)}%
            </span>
          )}
        </div>
      )}
      <div
        className="w-full overflow-hidden rounded-full bg-[var(--bg-raised)]"
        style={{ height }}
      >
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

/** Circular radial progress for gamified dashboards */
export function RadialProgress({ value = 0, size = 120, strokeWidth = 8, className }) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--bg-raised)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <span className="absolute text-xl font-bold text-[var(--text-primary)]">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

export default ProgressBar;

