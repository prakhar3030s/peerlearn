import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Upload, Search } from "lucide-react";
import api from "../lib/axios.js";
import { toastSuccess, toastErrorFromError } from "../lib/toast.js";
import PageHeader from "../components/ui/PageHeader.jsx";
import ErrorPanel from "../components/ErrorPanel.jsx";
import { Button } from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Modal from "../components/ui/Modal.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import { SkeletonText, SkeletonBlock } from "../components/ui/Skeleton.jsx";
import { cn } from "../lib/utils.js";

const SYLLABUS_KEY = "syllabus";

function flattenTree(branches, query = "") {
  const q = query.trim().toLowerCase();
  const out = [];
  function walk(branch, path = []) {
    const branchMatch = !q || branch.name?.toLowerCase().includes(q) || branch.code?.toLowerCase().includes(q);
    (branch.subjects || []).forEach((sub) => {
      const subPath = [...path, sub.name];
      const subMatch = !q || sub.name?.toLowerCase().includes(q);
      (sub.units || []).forEach((unit) => {
        const unitPath = [...subPath, `Unit ${unit.number}`];
        (unit.topics || []).forEach((topic) => {
          const topicMatch = !q || topic.name?.toLowerCase().includes(q);
          const match = branchMatch || subMatch || topicMatch;
          if (match) {
            out.push({
              branch,
              subject: sub,
              unit,
              topic,
              path: [...unitPath, topic.name].join(" → "),
            });
          }
        });
      });
    });
  }
  (branches || []).forEach((b) => walk(b));
  return out;
}

function countNodes(branches) {
  let branchesCount = 0,
    subjectsCount = 0,
    unitsCount = 0,
    topicsCount = 0;
  (branches || []).forEach((b) => {
    branchesCount += 1;
    (b.subjects || []).forEach((s) => {
      subjectsCount += 1;
      (s.units || []).forEach((u) => {
        unitsCount += 1;
        topicsCount += (u.topics || []).length;
      });
    });
  });
  return { branchesCount, subjectsCount, unitsCount, topicsCount };
}

export default function AdminSyllabus() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [bulkError, setBulkError] = useState("");
  const location = useLocation();

  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", SYLLABUS_KEY],
    queryFn: async () => {
      const res = await api.get("/admin/syllabus");
      return res.data?.data ?? [];
    },
  });

  const bulkImport = useMutation({
    mutationFn: async (items) => {
      const res = await api.post("/admin/bulk-import", items);
      return res.data;
    },
    onSuccess: (data) => {
      toastSuccess(`Created ${data?.data?.created ?? 0} topics, skipped ${data?.data?.skipped ?? 0}.`);
      setBulkOpen(false);
      setBulkText("");
      setBulkError("");
      queryClient.invalidateQueries({ queryKey: ["admin", SYLLABUS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SYLLABUS_KEY] });
    },
    onError: (err) => {
      toastErrorFromError(err);
      setBulkError(err?.response?.data?.message || err?.response?.data?.error || "Bulk import failed.");
    },
  });

  const stats = useMemo(() => countNodes(branches), [branches]);
  const flat = useMemo(() => flattenTree(branches, search), [branches, search]);

  const toggle = (key) => {
    setExpanded((e) => ({ ...e, [key]: !e[key] }));
  };

  const handleBulkSubmit = () => {
    setBulkError("");
    let items = [];
    try {
      const parsed = JSON.parse(bulkText);
      items = Array.isArray(parsed) ? parsed : parsed?.items ?? [];
    } catch {
      setBulkError("Invalid JSON. Provide an array of objects.");
      return;
    }
    if (items.length === 0) {
      setBulkError("Array is empty.");
      return;
    }
    bulkImport.mutate({ items });
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4" style={{ paddingTop: 56 + 16 }}>
      <PageHeader
        title="Admin Syllabus Manager"
        subtitle="Manage branches, subjects, units, and topics"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Admin", href: "/admin/syllabus" }, { label: "Syllabus" }]}
      />

      <div className="mb-4 flex gap-2 text-sm">
        <Link
          to="/admin/syllabus"
          className={cn(
            "rounded-full px-3 py-1.5 border border-[var(--border-default)] hover:bg-[var(--bg-hover)]",
            location.pathname === "/admin/syllabus"
              ? "text-[var(--text-primary)] bg-[var(--bg-hover)]"
              : "text-[var(--text-muted)]"
          )}
        >
          Syllabus
        </Link>
        <Link
          to="/admin/library"
          className={cn(
            "rounded-full px-3 py-1.5 border border-[var(--border-default)] hover:bg-[var(--bg-hover)]",
            location.pathname === "/admin/library"
              ? "text-[var(--text-primary)] bg-[var(--bg-hover)]"
              : "text-[var(--text-muted)]"
          )}
        >
          Library
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] py-2 pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <Button variant="primary" size="sm" onClick={() => setBulkOpen(true)}>
          <Upload className="mr-1 h-4 w-4" />
          Bulk import
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-sm">
        <span className="text-[var(--text-muted)]">
          Branches: <strong className="text-[var(--text-primary)]">{stats.branchesCount}</strong>
        </span>
        <span className="text-[var(--text-muted)]">
          Subjects: <strong className="text-[var(--text-primary)]">{stats.subjectsCount}</strong>
        </span>
        <span className="text-[var(--text-muted)]">
          Units: <strong className="text-[var(--text-primary)]">{stats.unitsCount}</strong>
        </span>
        <span className="text-[var(--text-muted)]">
          Topics: <strong className="text-[var(--text-primary)]">{stats.topicsCount}</strong>
        </span>
      </div>

      {isError ? (
        <ErrorPanel error={error} onRetry={refetch} />
      ) : isLoading ? (
        <div className="space-y-2">
          <SkeletonBlock height={48} />
          <SkeletonBlock height={48} />
          <SkeletonText width="70%" />
        </div>
      ) : search ? (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--text-primary)]">
            Search results ({flat.length})
          </h3>
          <ul className="space-y-1 text-sm text-[var(--text-body)]">
            {flat.slice(0, 100).map((row, i) => (
              <li key={i}>{row.path}</li>
            ))}
            {flat.length > 100 && (
              <li className="text-[var(--text-muted)]">… and {flat.length - 100} more</li>
            )}
          </ul>
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-2">
          {(branches || []).map((branch) => {
            const bKey = `b-${branch.id}`;
            const isBranchOpen = expanded[bKey] ?? true;
            return (
              <div key={branch.id} className="rounded-lg">
                <button
                  type="button"
                  onClick={() => toggle(bKey)}
                  className="flex w-full items-center gap-2 py-2 px-2 text-left text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded"
                >
                  {isBranchOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  {branch.name} ({branch.code})
                </button>
                {isBranchOpen &&
                  (branch.subjects || []).map((sub) => {
                    const sKey = `s-${sub.id}`;
                    const isSubOpen = expanded[sKey] ?? false;
                    return (
                      <div key={sub.id} className="ml-4 border-l border-[var(--border-default)] pl-2">
                        <button
                          type="button"
                          onClick={() => toggle(sKey)}
                          className="flex w-full items-center gap-2 py-1.5 px-1 text-left text-sm text-[var(--text-body)] hover:bg-[var(--bg-hover)] rounded"
                        >
                          {isSubOpen ? (
                            <ChevronDown className="h-3 w-3 shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 shrink-0" />
                          )}
                          {sub.name} (Year {sub.year})
                        </button>
                        {isSubOpen &&
                          (sub.units || []).map((unit) => (
                            <div key={unit.id} className="ml-4 border-l border-[var(--border-default)] pl-2">
                              <div className="py-1 text-xs font-medium text-[var(--text-muted)]">
                                Unit {unit.number}: {unit.name}
                              </div>
                              <ul className="ml-2 space-y-0.5 text-sm text-[var(--text-body)]">
                                {(unit.topics || []).map((t) => (
                                  <li key={t.id}>• {t.name}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={bulkOpen} onClose={() => { setBulkOpen(false); setBulkError(""); }} title="Bulk import topics">
        <p className="mb-2 text-sm text-[var(--text-muted)]">
          Paste a JSON array of objects with: branch, year, subject, unit, unitName, topic, isImportant (optional).
        </p>
        <Textarea
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          placeholder='[{"branch":"CSE","year":2,"subject":"DS","unit":1,"unitName":"Intro","topic":"Arrays","isImportant":true}]'
          rows={8}
          className="font-mono text-sm"
        />
        {bulkError && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{bulkError}</p>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setBulkOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleBulkSubmit}
            disabled={bulkImport.isPending || !bulkText.trim()}
            loading={bulkImport.isPending}
          >
            Import
          </Button>
        </div>
      </Modal>
    </div>
  );
}
