import React from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Code2,
  Cpu,
  CircuitBoard,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils.js";
import {
  useBranches,
  useSubjectsByBranch,
  useUnitsBySubject,
} from "../hooks/useSyllabus.js";

const SIDEBAR_WIDTH = 300;

function getBranchIcon(branch, index) {
  const name = (branch?.name || "").toLowerCase();
  const code = (branch?.code || "").toLowerCase();
  const combined = `${name} ${code}`;
  if (
    combined.includes("computer") ||
    combined.includes("cse") ||
    combined.includes("cs ")
  )
    return Code2;
  if (
    combined.includes("electronics") ||
    combined.includes("ece") ||
    combined.includes("communication")
  )
    return CircuitBoard;
  if (combined.includes("electrical") || combined.includes("eee"))
    return Cpu;
  if (combined.includes("mechanical") || combined.includes("civil"))
    return GraduationCap;
  return BookOpen;
}

export function Sidebar() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const { data: branches = [] } = useBranches();
  const [activeBranch, setActiveBranch] = React.useState(null);
  const [activeYear, setActiveYear] = React.useState(null);
  const [activeSubject, setActiveSubject] = React.useState(null);

  React.useEffect(() => {
    const branch = params.get("branch");
    const year = params.get("year");
    const subjectId = params.get("subject");
    if (branch) setActiveBranch(branch);
    if (year) setActiveYear(Number(year));
    if (subjectId) setActiveSubject(subjectId);
  }, [params]);

  const { data: subjects = [] } = useSubjectsByBranch(activeBranch, activeYear);
  const { data: units = [] } = useUnitsBySubject(activeSubject);

  const currentTopicId = React.useMemo(() => {
    const fromQuery = params.get("topic");
    if (fromQuery) return fromQuery;
    const match = location.pathname.match(/^\/browse\/([^/]+)/);
    return match ? match[1] : null;
  }, [params, location.pathname]);

  const handleTopicClick = (topicId) => {
    navigate(`/browse/${topicId}`);
  };

  return (
    <aside
      className="hidden h-[calc(100vh-56px)] flex-shrink-0 border-r border-[var(--border-default)] md:block"
      style={{
        width: SIDEBAR_WIDTH,
        background: "var(--sidebar-bg, var(--bg-surface))",
      }}
    >
      <div className="flex h-full flex-col overflow-y-auto">
        <div className="px-4 pt-4 pb-2 text-[13px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Syllabus
        </div>
        <div className="space-y-0.5 px-3 pb-6">
          {branches.map((branch, branchIndex) => {
            const isOpen = activeBranch === branch.id;
            const Icon = getBranchIcon(branch, branchIndex);
            const isFirst = branchIndex === 0;

            return (
              <div key={branch.id} className="rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setActiveBranch((prev) =>
                      prev === branch.id ? null : branch.id
                    )
                  }
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg border-l-2 py-2.5 pr-2 pl-3 text-left transition-colors duration-200",
                    "border-l-transparent text-[15px] font-semibold text-[var(--text-primary)]",
                    "hover:bg-[var(--bg-hover)] hover:border-l-[var(--accent)]",
                    isOpen &&
                      "bg-[var(--bg-hover)] border-l-[var(--accent)]"
                  )}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                      strokeWidth={2}
                    />
                    <span className="truncate">{branch.name}</span>
                    {isFirst && (
                      <span className="shrink-0 rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--accent)]">
                        Start here
                      </span>
                    )}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.25,
                        ease: [0.4, 0, 0.2, 1],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="mt-1 space-y-1 pl-4 pb-2">
                        <div className="flex flex-wrap gap-1.5">
                          {[1, 2, 3, 4].map((y) => (
                            <button
                              type="button"
                              key={y}
                              onClick={() => setActiveYear(y)}
                              className={cn(
                                "rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors",
                                activeYear === y
                                  ? "bg-[var(--accent)]/15 text-[var(--accent)]"
                                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]"
                              )}
                            >
                              Year {y}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1">
                          {subjects.map((subject) => {
                            const subjectOpen = activeSubject === subject.id;
                            return (
                              <div key={subject.id} className="rounded-lg">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setActiveSubject((prev) =>
                                      prev === subject.id ? null : subject.id
                                    )
                                  }
                                  className={cn(
                                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-[13px] font-medium text-[var(--text-body)] transition-colors hover:bg-[var(--bg-hover)]",
                                    subjectOpen && "bg-[var(--bg-hover)] text-[var(--text-primary)]"
                                  )}
                                >
                                  <span className="truncate">
                                    {subject.name}
                                  </span>
                                  {subjectOpen ? (
                                    <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                  )}
                                </button>
                                <AnimatePresence initial={false}>
                                  {subjectOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        ease: [0.4, 0, 0.2, 1],
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-1 space-y-2 pl-2">
                                        {units.map((unit) => (
                                          <div key={unit.id}>
                                            <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)] px-2 py-0.5">
                                              Unit {unit.number}: {unit.name}
                                            </div>
                                            <div className="mt-1 space-y-0.5">
                                              {unit.topics?.map((topic) => {
                                                const activeTopic =
                                                  currentTopicId === topic.id;
                                                return (
                                                  <button
                                                    key={topic.id}
                                                    type="button"
                                                    onClick={() =>
                                                      handleTopicClick(topic.id)
                                                    }
                                                    className={cn(
                                                      "flex w-full items-center justify-between gap-1 rounded-md border-l-2 py-1.5 pl-2.5 pr-2 text-left text-[12px] transition-colors",
                                                      activeTopic
                                                        ? "border-l-[var(--accent)] bg-[var(--accent)]/10 font-semibold text-[var(--text-primary)]"
                                                        : "border-l-transparent text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:border-l-[var(--accent)]/50 hover:text-[var(--text-body)]"
                                                    )}
                                                  >
                                                    <span className="truncate">
                                                      {topic.name}
                                                    </span>
                                                    {topic.video_count > 0 && (
                                                      <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
                                                        <Play className="h-2.5 w-2.5" />
                                                        {topic.video_count}
                                                      </span>
                                                    )}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
