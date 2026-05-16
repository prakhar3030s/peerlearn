import React from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Button } from "./ui/Button.jsx";

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();
  const role = user?.role || "student";
  const navigate = useNavigate();

  if (!allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center px-4 pt-[72px]">
        <div className="max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-6 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Access restricted
          </h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            This area is only available to {allowedRoles.join(" and ")}.
          </p>
          <div className="mt-4 flex justify-center">
            <Button variant="primary" onClick={() => navigate("/browse")}>
              Go to Browse
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
