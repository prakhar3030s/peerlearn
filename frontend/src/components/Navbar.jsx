import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Search, X, LogOut } from "lucide-react";
import { cn } from "../lib/utils.js";
import NotificationBell from "./ui/NotificationBell.jsx";
import DarkModeToggle from "./ui/DarkModeToggle.jsx";
import Avatar from "./ui/Avatar.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useCommandPalette } from "../contexts/CommandPaletteContext.jsx";

const NAV_HEIGHT = 56;

export function Navbar() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { openPalette } = useCommandPalette();
  const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const kbdHint = isMac ? "⌘K" : "Ctrl+K";

  const role = currentUser?.role || "student";
  const isStudent = role === "student";
  const isModerator = role === "moderator";
  const isAdmin = role === "admin";

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const links = [
    { to: "/browse", label: "Browse", show: true },
    { to: "/submit", label: "Submit", show: isStudent },
    { to: "/my-submissions", label: "My Submissions", show: isStudent },
    { to: "/progress", label: "Progress", show: isStudent },
    { to: "/leaderboard", label: "Leaderboard", show: true },
    { to: "/moderation", label: "Moderation", show: isModerator || isAdmin },
    { to: "/admin/syllabus", label: "Admin", show: isAdmin },
  ].filter((l) => l.show);

  return (
    <header
      className="glass-nav fixed inset-x-0 top-0 z-40"
      style={{ height: NAV_HEIGHT }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link to="/browse" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/favicon.svg" alt="PeerLearn" className="h-8 w-8" />
            <span className="hidden sm:inline text-sm font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">PeerLearn</span>
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "relative rounded-full px-3 py-2 text-[13px] font-medium transition-all duration-200",
                    isActive
                      ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <span className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-[var(--accent)]" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openPalette}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-all hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
            aria-label="Search (opens command palette)"
          >
            <Search className="h-4 w-4" />
            <span className="absolute -bottom-0.5 right-0 rounded bg-[var(--bg-surface)] px-1 text-[9px] font-medium text-[var(--text-muted)] ring-1 ring-[var(--border-default)]">
              {kbdHint}
            </span>
          </button>
          <DarkModeToggle className="hidden md:inline-flex" />
          <NotificationBell />
          <div className="relative hidden items-center gap-2 md:flex">
            <Avatar
              name={currentUser?.name || "User"}
              size="md"
              bordered
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-[var(--text-primary)]">
                {currentUser?.name || "User"}
              </span>
              <span
                className={cn(
                  "inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                  role === "admin" && "bg-amber-500/20 text-amber-400",
                  role === "moderator" && "bg-[var(--accent)]/20 text-[var(--accent)]",
                  role === "student" && "bg-emerald-500/20 text-emerald-400"
                )}
              >
                {role}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 h-full w-full bg-black/40"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <div className="pointer-events-none flex h-full">
            <div className="pointer-events-auto relative flex h-full w-72 max-w-[80%] flex-col bg-[var(--bg-surface)] shadow-2xl transition-transform duration-200 ease-[var(--ease-decel)] translate-x-0">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] px-4 py-3">
                <Link to="/browse" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-brand-500 via-brand-400 to-accent-500" />
                  <span className="text-sm font-bold text-gradient">PeerLearn</span>
                </Link>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col justify-between px-4 py-3">
                <div>
                  <div className="mb-4 flex items-center gap-3">
                    <Avatar
                      name={currentUser?.name || "Student"}
                      size="md"
                      bordered
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {currentUser?.name || "Guest"}
                      </span>
                      <span
                        className={cn(
                          "mt-0.5 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          role === "admin" && "bg-amber-500/20 text-amber-400",
                          role === "moderator" && "bg-[var(--accent)]/20 text-[var(--accent)]",
                          role === "student" && "bg-emerald-500/20 text-emerald-400"
                        )}
                      >
                        {role}
                      </span>
                    </div>
                  </div>
                  <nav className="space-y-1">
                    {links.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                          cn(
                            "flex h-12 items-center rounded-md px-3 text-sm font-medium",
                            isActive
                              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "text-[var(--text-muted)] hover:bg-[var(--bg-raised)]"
                          )
                        }
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </NavLink>
                    ))}
                    <button
                      type="button"
                      onClick={() => { handleLogout(); setOpen(false); }}
                      className="flex h-12 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--bg-raised)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </nav>
                </div>
                <div className="mt-6 border-t border-[var(--border-default)] pt-3">
                  <DarkModeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
