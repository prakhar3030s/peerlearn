import React from "react";
import { RefreshCw } from "lucide-react";
import { getErrorMessage, getErrorPanelTitle } from "../lib/errorMessage.js";

/**
 * Branded error panel for query/mutation failures (e.g. Supabase/API unreachable).
 * Use when useQuery isError or when you want to show a retryable error.
 */
export function ErrorPanel({
  error,
  message,
  title,
  onRetry,
  className = "",
}) {
  const displayMessage = message ?? getErrorMessage(error);
  const displayTitle = title ?? getErrorPanelTitle(error);

  return (
    <div
      className={
        "rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-center shadow-sm " +
        className
      }
      role="alert"
    >
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <RefreshCw className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        {displayTitle}
      </h2>
      <p className="mt-1 text-sm text-[var(--text-muted)]">{displayMessage}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-raised)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          aria-label="Retry"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorPanel;
