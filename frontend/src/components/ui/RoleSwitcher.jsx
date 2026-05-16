import React from "react";
import { User } from "lucide-react";
import { cn } from "../../lib/utils.js";
import { useRole } from "../../contexts/RoleContext.jsx";

export function RoleSwitcher() {
  const { role, roles, setRole } = useRole();
  const [open, setOpen] = React.useState(false);

  if (!import.meta.env.DEV) return null;

  const current = roles.find((r) => r.id === role);

  return (
    <div className="fixed bottom-4 left-4 z-[1400]">
      <div
        className={cn(
          "rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)]/90 px-3 py-1.5 shadow-lg backdrop-blur-md"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-xs text-[var(--text-body)]"
        >
          <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />
          <span className="font-semibold capitalize">{current?.label}</span>
        </button>
        {open && (
          <div className="mt-2 w-52 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 text-xs shadow-xl animate-slideUp">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full flex-col items-start rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[var(--bg-raised)]",
                  r.id === role && "bg-[var(--bg-raised)]"
                )}
              >
                <span className="font-semibold">{r.label}</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {r.id === "student" &&
                    "Browse and submit videos as a student"}
                  {r.id === "moderator" &&
                    "Review and manage student submissions"}
                  {r.id === "admin" &&
                    "Administer syllabus and platform settings"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RoleSwitcher;

