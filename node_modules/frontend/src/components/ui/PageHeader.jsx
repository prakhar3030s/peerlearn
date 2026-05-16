import React from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils.js";

export function PageHeader({ title, subtitle, breadcrumbs = [], actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border-default)] pb-4">
      {breadcrumbs.length > 0 && (
        <nav className="flex flex-wrap items-center gap-1 text-xs text-[var(--text-muted)]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label + idx}>
              {idx > 0 && (
                <ChevronRight className="h-3 w-3 text-[var(--text-muted)]" />
              )}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-[var(--accent)] hover:underline"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className={cn("flex flex-wrap gap-2", actions.className)}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;

