import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import api from "../lib/axios.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import { SkeletonBlock } from "../components/ui/Skeleton.jsx";
import { cn, formatRelativeTime } from "../lib/utils.js";

function useAdminLibrary(q) {
  return useQuery({
    queryKey: ["admin", "library", { q }],
    queryFn: async () => {
      const res = await api.get("/admin/library", {
        params: q ? { q } : {},
      });
      return res.data?.data ?? [];
    },
    staleTime: 60_000,
  });
}

export default function AdminLibrary() {
  const [search, setSearch] = useState("");
  const {
    data: submissions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminLibrary(search.trim() || undefined);

  return (
    <div
      className="mx-auto w-full max-w-5xl px-4"
      style={{ paddingTop: 56 + 16 }}
    >
      <PageHeader
        title="Library"
        subtitle="All videos across branches, with search and filters."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Admin", href: "/admin/syllabus" },
          { label: "Library" },
        ]}
      />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by title, student, subject, or unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
      </div>

      {isError ? (
        <ErrorPanel error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          <SkeletonBlock height={56} />
          <SkeletonBlock height={56} />
          <SkeletonBlock height={56} />
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden text-sm">
          <table className="w-full">
            <thead className="border-b border-[var(--border-default)] bg-[var(--bg-hover)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Student
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Subject / Unit / Topic
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => {
                const subj = s.topic?.unit?.subject;
                const unitName = s.topic?.unit?.name;
                return (
                  <tr
                    key={s.id}
                    className="border-b border-[var(--border-default)] last:border-0 hover:bg-[var(--bg-hover)]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--text-primary)] truncate max-w-[220px]">
                        {s.youtube_title || "Untitled video"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[140px]">
                        {s.contributor?.name || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-[260px] text-[var(--text-muted)]">
                        {subj?.name || "—"}
                        {unitName && ` • ${unitName}`}
                        {s.topic?.name && ` • ${s.topic.name}`}
                      </div>
                    </td>
                    <td className="px-4 py-3 capitalize text-[var(--text-muted)]">
                      {s.status}
                    </td>
                    <td className="px-4 py-3 text-right text-[var(--text-muted)]">
                      {formatRelativeTime(s.created_at)}
                    </td>
                  </tr>
                );
              })}
              {submissions.length === 0 && !isLoading && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-[var(--text-muted)]"
                    colSpan={5}
                  >
                    No videos found for this search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

