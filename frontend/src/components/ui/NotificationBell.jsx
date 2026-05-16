import React from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Inbox, CheckCircle2, XCircle, Flag } from "lucide-react";
import { cn, formatRelativeTime } from "../../lib/utils.js";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  useNotifications,
  useMarkAllRead,
  useMarkRead,
} from "../../hooks/useNotifications.js";

function groupNotifications(notifications) {
  const groups = { Today: [], "This Week": [], Earlier: [] };
  const now = new Date();

  notifications.forEach((n) => {
    const created = new Date(n.created_at);
    const diffMs = now.getTime() - created.getTime();
    const diffDay = diffMs / (1000 * 60 * 60 * 24);

    if (diffDay < 1) groups.Today.push(n);
    else if (diffDay < 7) groups["This Week"].push(n);
    else groups.Earlier.push(n);
  });

  return groups;
}

export function NotificationBell() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const { data: notifications = [] } = useNotifications(currentUser?.id);
  const markAll = useMarkAllRead(currentUser?.id);
  const [selectedId, setSelectedId] = React.useState(null);
  const markSingle = useMarkRead(selectedId, currentUser?.id);
  const [justMarkedAll, setJustMarkedAll] = React.useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const prevUnreadRef = React.useRef(unreadCount);
  const [badgeBump, setBadgeBump] = React.useState(false);

  React.useEffect(() => {
    if (unreadCount > prevUnreadRef.current) {
      setBadgeBump(true);
      const t = setTimeout(() => setBadgeBump(false), 400);
      return () => clearTimeout(t);
    }
    prevUnreadRef.current = unreadCount;
    return undefined;
  }, [unreadCount]);

  const handleMarkAll = () => {
    if (!currentUser?.id || unreadCount === 0) return;
    setJustMarkedAll(true);
    markAll.mutate(undefined, {
      onSettled: () => {
        setTimeout(() => setJustMarkedAll(false), 250);
      },
    });
  };

  const handleClickNotification = (n) => {
    setSelectedId(n.id);
    markSingle.mutate();

    if (
      n.type === "submission_approved" ||
      n.type === "submission_rejected" ||
      n.type === "submission_flagged"
    ) {
      navigate("/my-submissions");
    } else if (n.type === "new_submission") {
      navigate("/moderation");
    }
  };

  const groups = groupNotifications(notifications);

  const getIconForType = (type) => {
    switch (type) {
      case "submission_received":
        return <Inbox className="h-3.5 w-3.5 text-sky-500" />;
      case "submission_approved":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />;
      case "submission_rejected":
        return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      case "submission_flagged":
        return <Flag className="h-3.5 w-3.5 text-amber-500" />;
      case "new_submission":
        return <Bell className="h-3.5 w-3.5 text-brand-500" />;
      default:
        return <Inbox className="h-3.5 w-3.5 text-[var(--text-muted)]" />;
    }
  };

  return (
    <div className="relative">
      <style>
        {`
        @keyframes notif-badge-bounce {
          0% { transform: scale(0.5); }
          60% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes notif-dot-pulse {
          0% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.5; }
        }
        .notif-dot-unread {
          animation: notif-dot-pulse 1.2s ease-in-out infinite;
        }
        .notif-dot-fade-out {
          transition: opacity 0.25s ease-out, transform 0.25s ease-out;
          opacity: 0;
          transform: scale(0.6);
        }
      `}
      </style>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--bg-raised)] focus-visible:shadow-focus"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
            animate={badgeBump ? { scale: [0.5, 1.2, 1] } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            {unreadCount}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 shadow-xl z-50"
            aria-live="polite"
          >
            <div className="mb-2 flex items-center justify-between px-1 text-xs text-[var(--text-muted)]">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-[11px] text-brand-600 hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>
            {notifications.length === 0 && (
              <div className="px-2 py-4 text-center text-xs text-[var(--text-muted)]">
                <Bell className="mx-auto mb-1 h-4 w-4 text-[var(--text-muted)]" />
                <div>You're all caught up</div>
              </div>
            )}
            {["Today", "This Week", "Earlier"].map((section) => {
              const items = groups[section];
              if (!items || items.length === 0) return null;
              return (
                <div key={section} className="mb-2">
                  <div className="px-2 pb-1 text-[11px] font-medium text-[var(--text-muted)]">
                    {section}
                  </div>
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                      visible: {
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                    className="space-y-1"
                  >
                    {items.map((n) => (
                      <motion.button
                        key={n.id}
                        type="button"
                        onClick={() => handleClickNotification(n)}
                        variants={{
                          hidden: { opacity: 0, y: 6 },
                          visible: { opacity: 1, y: 0 },
                        }}
                        className={cn(
                          "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                          n.read
                            ? "bg-transparent"
                            : "border-l-2 border-l-brand-500 bg-[var(--bg-raised)]"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 h-2 w-2 rounded-full bg-brand-500",
                            !n.read && "notif-dot-unread",
                            justMarkedAll && "notif-dot-fade-out"
                          )}
                        />
                        <div className="mt-0.5">
                          {getIconForType(n.type)}
                        </div>
                        <div className="flex flex-1 flex-col">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {n.title}
                          </span>
                          {n.message && (
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {n.message}
                            </span>
                          )}
                          <span className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                            {formatRelativeTime(n.created_at)}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default NotificationBell;

