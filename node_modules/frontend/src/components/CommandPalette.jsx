import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Inbox, Trophy, BookOpen, Search, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios.js";
import { useCommandPalette } from "../contexts/CommandPaletteContext.jsx";
import { cn } from "../lib/utils.js";

const RECENT_KEY = "peerlearn-recent-searches";
const MAX_RECENT = 5;
const DEBOUNCE_MS = 300;

const QUICK_LINKS = [
  { label: "Browse syllabus", to: "/browse", icon: BookOpen },
  { label: "Submit a Video", to: "/submit", icon: Video },
  { label: "My Submissions", to: "/my-submissions", icon: Inbox },
  { label: "Leaderboard", to: "/leaderboard", icon: Trophy },
];

function getRecentSearches() {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, MAX_RECENT) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(term) {
  if (!term?.trim()) return;
  const recent = getRecentSearches().filter((r) => r !== term.trim());
  recent.unshift(term.trim());
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function CommandPalette() {
  const navigate = useNavigate();
  const { open, closePalette, openPalette } = useCommandPalette();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const {
    data: searchData,
    isLoading: searchLoading,
    isError: searchError,
  } = useQuery({
    queryKey: ["search", "palette", debouncedQuery],
    queryFn: async () => {
      const res = await api.get("/search", {
        params: { q: debouncedQuery, limit: 10 },
      });
      return res.data?.data ?? [];
    },
    enabled: open && debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const recent = useMemo(() => (open ? getRecentSearches() : []), [open]);
  const quickLinks = QUICK_LINKS;
  const searchResults = searchData ?? [];
  const totalItems = quickLinks.length + (debouncedQuery.trim() ? searchResults.length : 0) + (query.trim() ? 0 : recent.length);
  const hasRecent = !query.trim() && recent.length > 0;
  const showQuick = !query.trim();
  const showResults = debouncedQuery.trim().length >= 2;

  const flatItems = useMemo(() => {
    const out = [];
    if (showQuick) quickLinks.forEach((l) => out.push({ type: "quick", ...l }));
    if (hasRecent) recent.forEach((r) => out.push({ type: "recent", term: r }));
    if (showResults) searchResults.forEach((s) => out.push({ type: "result", submission: s }));
    return out;
  }, [showQuick, quickLinks, hasRecent, recent, showResults, searchResults]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    setActiveIndex((i) => (i >= flatItems.length ? Math.max(0, flatItems.length - 1) : i));
  }, [flatItems.length]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || activeIndex < 0) return;
    const child = el.children[activeIndex];
    child?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        openPalette();
        return;
      }
      if (!open) return;
      if (e.key === "Escape") {
        closePalette();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(1, flatItems.length));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + flatItems.length) % Math.max(1, flatItems.length));
        return;
      }
      if (e.key === "Enter" && flatItems[activeIndex]) {
        e.preventDefault();
        selectItem(flatItems[activeIndex]);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, flatItems, activeIndex, closePalette, openPalette]);

  function selectItem(item) {
    if (item.type === "quick") {
      navigate(item.to);
      addRecentSearch(item.label);
    } else if (item.type === "recent") {
      navigate(`/search?q=${encodeURIComponent(item.term)}`);
    } else if (item.type === "result" && item.submission) {
      navigate(`/video/${item.submission.id}`);
      addRecentSearch(item.submission.topic?.name || item.submission.youtube_title);
    }
    closePalette();
  }

  if (!open) return null;

  const subjectName = (s) => s?.topic?.unit?.subject?.name ?? "Subject";
  const unitName = (s) => (s?.topic?.unit ? `Unit ${s.topic.unit.number}` : "");
  const topicName = (s) => s?.topic?.name ?? "Topic";
  const hierarchy = (s) => [subjectName(s), unitName(s), topicName(s)].filter(Boolean).join(" > ");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh] px-4"
      onClick={closePalette}
      role="dialog"
      aria-label="Command palette"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics, subjects..."
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none text-base"
            autoComplete="off"
          />
        </div>
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {showQuick && (
            <div className="px-2 pb-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Quick navigation
              </div>
              {quickLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <button
                    key={link.to + link.label}
                    type="button"
                    onClick={() => selectItem({ type: "quick", ...link })}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                      activeIndex === i
                        ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-50"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-current opacity-90" />
                    {link.label}
                    <ArrowRight className="ml-auto h-3.5 w-3.5 text-current opacity-80" />
                  </button>
                );
              })}
            </div>
          )}
          {hasRecent && (
            <div className="px-2 pb-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Recent searches
              </div>
              {recent.map((term, i) => {
                const idx = quickLinks.length + i;
                return (
                  <button
                    key={term}
                    type="button"
                    onClick={() => selectItem({ type: "recent", term })}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                      activeIndex === idx
                        ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-50"
                        : "text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
                    )}
                  >
                    <Search className="h-4 w-4 shrink-0 text-current opacity-90" />
                    {term}
                  </button>
                );
              })}
            </div>
          )}
          {showResults && (
            <div className="px-2 pb-1">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Results
              </div>
              {searchLoading ? (
                <div className="px-3 py-4 text-sm text-[var(--text-muted)]">Searching…</div>
              ) : searchError ? (
                <div className="px-3 py-4 text-sm text-[var(--text-muted)]">Search temporarily unavailable.</div>
              ) : searchResults.length === 0 ? (
                <div className="px-3 py-4 text-sm text-[var(--text-muted)]">No results.</div>
              ) : (
                searchResults.map((s, i) => {
                  const idx = quickLinks.length + recent.length + i;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectItem({ type: "result", submission: s })}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left text-sm",
                        activeIndex === idx
                          ? "bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-50"
                          : "text-[var(--text-primary)] hover:bg-[var(--bg-raised)]"
                      )}
                    >
                      <span className="font-medium">{topicName(s)}</span>
                      <span className={cn(
                        "text-[11px]",
                        activeIndex === idx ? "text-brand-700 dark:text-brand-200 opacity-90" : "text-[var(--text-muted)]"
                      )}>{hierarchy(s)}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
          {!showQuick && !hasRecent && !showResults && query.trim().length < 2 && (
            <div className="px-4 py-6 text-center text-sm text-[var(--text-muted)]">
              Type at least 2 characters to search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
