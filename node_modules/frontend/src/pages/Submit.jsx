import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Youtube, FileText, Link2, Tags, FileEdit, Eye } from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { extractYouTubeId } from "../lib/utils.js";
import { useBranches, useSubjectsByBranch, useUnitsBySubject, useTopicsByUnit } from "../hooks/useSyllabus.js";
import { useCreateSubmission, getSubmitDraft, setSubmitDraft } from "../hooks/useSubmissions.js";
import { useAuth } from "../contexts/AuthContext.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Textarea from "../components/ui/Textarea.jsx";
import Select, { SelectItem } from "../components/ui/Select.jsx";
import ProgressBar from "../components/ui/ProgressBar.jsx";

const DRAFT_BANNER_KEY = "peerlearn-submit-banner-hide";
const UNLISTED_HINT_KEY = "peerlearn-submit-unlisted-hide";

const INITIAL_DATA = {
  youtube_url: "",
  drive_url: "",
  year: "",
  branch_id: "",
  subject_id: "",
  unit_id: "",
  topic_id: "",
  language: "English",
  description: "",
  contributor_name: "",
  contributor_email: "",
};

const STEP_LABELS = ["Video Link", "Classify", "Describe", "Review"];

function useStepDraft() {
  const [formData, setFormData] = useState(() => {
    const draft = getSubmitDraft();
    return draft || INITIAL_DATA;
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaving(true);
    setSaved(false);
    const id = setTimeout(() => {
      setSubmitDraft(formData);
      setSaving(false);
      setSaved(true);
      const clearId = setTimeout(() => setSaved(false), 1500);
      return () => clearTimeout(clearId);
    }, 1000);
    return () => clearTimeout(id);
  }, [formData]);

  return { formData, setFormData, saving, saved };
}

const STEP_ICONS = [Link2, Tags, FileEdit, Eye];

function StepIndicator({ step }) {
  return (
    <div className="sticky top-[56px] z-20 border-b border-[var(--border-default)] bg-[var(--bg-primary)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex flex-1 items-center gap-2">
          {STEP_LABELS.map((label, index) => {
            const idx = index + 1;
            const completed = step > idx;
            const isCurrent = step === idx;
            const Icon = STEP_ICONS[index];
            return (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={
                      completed
                        ? "flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--success)] text-white shadow-sm"
                        : isCurrent
                        ? "flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-md shadow-[var(--accent)]/25"
                        : "flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)]"
                    }
                  >
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={2.5} />
                    ) : Icon ? (
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      idx
                    )}
                  </div>
                  <span
                    className={
                      isCurrent
                        ? "text-[11px] font-semibold text-[var(--accent)]"
                        : "text-[11px] font-medium text-[var(--text-muted)]"
                    }
                  >
                    {label}
                  </span>
                </div>
                {idx < STEP_LABELS.length && (
                  <div className="mt-0.5 h-1 flex-1 overflow-hidden rounded-full bg-[var(--bg-raised)] mx-1">
                    <div
                      className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500 ease-out"
                      style={{
                        width:
                          step > idx ? "100%" : step === idx ? "50%" : "0%",
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Submit() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const { formData, setFormData, saving, saved } = useStepDraft();
  const [errors, setErrors] = useState({});
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const [showUnlistedHint, setShowUnlistedHint] = useState(
    () => !window.localStorage.getItem(UNLISTED_HINT_KEY)
  );
  const [submitted, setSubmitted] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const topicFromQuery = queryParams.get("topicId");

  useEffect(() => {
    const draft = getSubmitDraft();
    if (draft && !window.localStorage.getItem(DRAFT_BANNER_KEY)) {
      setShowDraftBanner(true);
    }
    if (!draft && topicFromQuery) {
      setFormData((prev) => ({ ...prev, topic_id: topicFromQuery }));
      setStep(2);
    }
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      contributor_name: currentUser?.name || prev.contributor_name,
      contributor_email: currentUser?.email || prev.contributor_email,
    }));
  }, [currentUser]);

  const videoId = useMemo(
    () => extractYouTubeId(formData.youtube_url),
    [formData.youtube_url]
  );

  const { data: branches = [] } = useBranches();
  const { data: subjects = [] } = useSubjectsByBranch(
    formData.branch_id,
    formData.year ? Number(formData.year) : undefined
  );
  const { data: units = [] } = useUnitsBySubject(formData.subject_id);
  const { data: topics = [] } = useTopicsByUnit(formData.unit_id);

  const createSubmission = useCreateSubmission({
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!videoId) {
      newErrors.youtube_url = "Please enter a valid YouTube URL";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const required = [
      "year",
      "branch_id",
      "subject_id",
      "unit_id",
      "topic_id",
      "language",
    ];
    const newErrors = {};
    required.forEach((key) => {
      if (!formData[key]) newErrors[key] = "This field is required";
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.description || formData.description.length < 30) {
      newErrors.description =
        "Please provide at least 30 characters describing your explanation.";
    }
    if (!formData.contributor_name || formData.contributor_name.length < 2) {
      newErrors.contributor_name = "Please enter your name.";
    }
    if (
      !formData.contributor_email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contributor_email)
    ) {
      newErrors.contributor_email = "Please enter a valid email address.";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    setStep((s) => Math.min(4, s + 1));
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const [guidelinesChecked, setGuidelinesChecked] = useState(false);

  const handleSubmit = () => {
    if (!guidelinesChecked) return;
    createSubmission.mutate({
      youtube_url: formData.youtube_url,
      drive_url: formData.drive_url || null,
      topic_id: formData.topic_id,
      description: formData.description,
      contributor_id: currentUser?.id,
      language: formData.language,
    });
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="mx-auto max-w-2xl px-4 pt-[76px] pb-10 text-center"
      >
        <div className="relative mx-auto mb-6 h-16 w-16 rounded-full bg-emerald-50">
          <svg
            viewBox="0 0 52 52"
            className="absolute inset-3 stroke-emerald-600"
          >
            <circle
              cx="26"
              cy="26"
              r="24"
              fill="none"
              strokeWidth="2"
              className="opacity-10"
            />
            <path
              d="M16 26l6 6 14-14"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: 0,
                animation: "check-draw 0.6s ease-out forwards",
              }}
            />
          </svg>
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                top: "50%",
                left: "50%",
                background:
                  i % 2 === 0 ? "#2563EB" : i % 3 === 0 ? "#F59E0B" : "#22C55E",
                transformOrigin: "0 0",
                animation: "confetti-burst 0.8s ease-out forwards",
                animationDelay: `${i * 40}ms`,
              }}
            />
          ))}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-brand-600">
          Your video is submitted!
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          It&apos;s now in the review queue. You&apos;ll be notified when a
          moderator reviews it — usually within 72 hours.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
          ⏳ +20 pts pending approval
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setSubmitted(false);
              setFormData(INITIAL_DATA);
              setStep(1);
            }}
          >
            Submit Another Video
          </Button>
          <Button variant="primary" onClick={() => navigate("/my-submissions")}>
            View My Submissions
          </Button>
        </div>
        <div className="mt-6 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-left text-xs text-[var(--text-muted)]">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            What happens next?
          </div>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Moderator reviews your video.</li>
            <li>
              It gets approved or you receive clear feedback to improve and
              resubmit.
            </li>
            <li>
              Once approved, you earn reputation points and your video goes live
              for juniors.
            </li>
          </ol>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="mx-auto max-w-5xl px-4 pt-[76px] pb-10"
    >
      <PageHeader
        title="Submit a Video"
        subtitle="Share your explanation and help juniors understand faster."
      />
      <StepIndicator step={step} />
      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <div>
          {showDraftBanner && (
            <div className="mb-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <div className="mb-1 flex items-center gap-2">
                <Info className="h-3.5 w-3.5" />
                <span>You have an unsaved draft.</span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  variant="secondary"
                  onClick={() => setShowDraftBanner(false)}
                >
                  Continue Draft
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    setSubmitDraft(null);
                    setFormData(INITIAL_DATA);
                    setShowDraftBanner(false);
                    window.localStorage.setItem(DRAFT_BANNER_KEY, "1");
                  }}
                >
                  Start Fresh
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {saving && <span>Saving draft…</span>}
          {!saving && saved && (
            <span className="inline-flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Draft saved
            </span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                <Input
                  label="YouTube Video URL"
                  value={formData.youtube_url}
                  onChange={(e) =>
                    updateField("youtube_url", e.target.value.trim())
                  }
                  error={errors.youtube_url}
                  leftIcon={<Youtube className="h-4 w-4 text-red-500" />}
                  placeholder="Paste your YouTube video URL here"
                  onBlur={validateStep1}
                />
                {videoId && (
                  <div className="mt-2 flex gap-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-raised)] p-3">
                    <div className="relative h-20 w-36 overflow-hidden rounded-lg bg-[var(--bg-surface)]">
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                        alt="YouTube thumbnail"
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center text-xs">
                      <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                        ✓ Valid YouTube video detected
                      </div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">
                        Video ID: {videoId}
                      </div>
                    </div>
                  </div>
                )}

                <Input
                  label="Study Notes (Optional)"
                  value={formData.drive_url}
                  onChange={(e) =>
                    updateField("drive_url", e.target.value.trim())
                  }
                  leftIcon={<FileText className="h-4 w-4 text-brand-500" />}
                  placeholder="Paste Google Drive link to notes, PDFs, or diagrams"
                />
                <p className="text-[11px] text-[var(--text-muted)]">
                  Share notes, PDFs, diagrams, or revision guides. Set sharing
                  to &apos;Anyone with link&apos; before submitting.
                </p>

                {showUnlistedHint && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                    <div className="flex-1">
                      Make sure your YouTube video is set to Unlisted before
                      submitting. Public videos are fine too — but never submit
                      private videos as they cannot be reviewed.
                    </div>
                    <button
                      type="button"
                      className="ml-2 text-[10px] font-medium"
                      onClick={() => {
                        setShowUnlistedHint(false);
                        window.localStorage.setItem(UNLISTED_HINT_KEY, "1");
                      }}
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="primary"
                    onClick={goNext}
                    disabled={!videoId}
                  >
                    Continue to Classify →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Select
                    label="Year"
                    placeholder="Select academic year"
                    value={formData.year}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        year: v,
                        branch_id: "",
                        subject_id: "",
                        unit_id: "",
                        topic_id: "",
                      }))
                    }
                    error={errors.year}
                  >
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </Select>

                  <Select
                    label="Branch"
                    placeholder={
                      formData.year ? "Select branch" : "Select year first"
                    }
                    value={formData.branch_id}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        branch_id: v,
                        subject_id: "",
                        unit_id: "",
                        topic_id: "",
                      }))
                    }
                    error={errors.branch_id}
                  >
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Subject"
                    placeholder={
                      formData.branch_id ? "Select subject" : "Select branch first"
                    }
                    value={formData.subject_id}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        subject_id: v,
                        unit_id: "",
                        topic_id: "",
                      }))
                    }
                    error={errors.subject_id}
                  >
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Unit"
                    placeholder={
                      formData.subject_id ? "Select unit" : "Select subject first"
                    }
                    value={formData.unit_id}
                    onValueChange={(v) =>
                      setFormData((prev) => ({
                        ...prev,
                        unit_id: v,
                        topic_id: "",
                      }))
                    }
                    error={errors.unit_id}
                  >
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        Unit {u.number} — {u.name}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Topic"
                    placeholder={
                      formData.unit_id ? "Select topic" : "Select unit first"
                    }
                    value={formData.topic_id}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, topic_id: v }))
                    }
                    error={errors.topic_id}
                  >
                    {topics.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                        {t.is_important && " ⭐ Exam Important"}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    label="Language"
                    placeholder="Select language"
                    value={formData.language}
                    onValueChange={(v) =>
                      setFormData((prev) => ({ ...prev, language: v }))
                    }
                    error={errors.language}
                  >
                    {[
                      "English",
                      "Hindi",
                      "Tamil",
                      "Telugu",
                      "Kannada",
                      "Marathi",
                      "Bengali",
                      "Gujarati",
                    ].map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button variant="ghost" onClick={goBack}>
                    ← Back
                  </Button>
                  <Button variant="primary" onClick={goNext}>
                    Continue to Describe →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="space-y-3 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4">
                  <Textarea
                    label="Describe your explanation"
                    value={formData.description}
                    onChange={(e) =>
                      updateField("description", e.target.value)
                    }
                    maxLength={500}
                    error={errors.description}
                    placeholder="What does this video cover? What approach did you take? What will students understand after watching?"
                  />
                  <Input
                    label="Your Name"
                    value={formData.contributor_name}
                    onChange={(e) =>
                      updateField("contributor_name", e.target.value)
                    }
                    error={errors.contributor_name}
                  />
                  <Input
                    label="Your Email"
                    value={formData.contributor_email}
                    onChange={(e) =>
                      updateField("contributor_email", e.target.value)
                    }
                    error={errors.contributor_email}
                  />
                  <div className="mt-4 flex justify-between">
                    <Button variant="ghost" onClick={goBack}>
                      ← Back
                    </Button>
                    <Button variant="primary" onClick={goNext}>
                      Continue to Review →
                    </Button>
                  </div>
                </div>
                <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-xs">
                  <Accordion.Root type="single" collapsible defaultValue="tips">
                    <Accordion.Item value="tips">
                      <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between text-left text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                          Tips for a great submission
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="mt-2 space-y-1 text-[12px] text-[var(--text-muted)]">
                        <ul className="list-disc space-y-1 pl-4">
                          <li>Keep it under 10 minutes.</li>
                          <li>Focus on one concept only.</li>
                          <li>Use a whiteboard or screen recording.</li>
                          <li>Speak clearly at a moderate pace.</li>
                          <li>Make sure audio is not muffled.</li>
                        </ul>
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="space-y-4 rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 text-sm">
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      Video preview
                    </div>
                    <div className="mt-2 overflow-hidden rounded-xl bg-[var(--bg-raised)]">
                      {videoId ? (
                        <div className="relative w-full pb-[56.25%]">
                          <img
                            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                            alt="Video thumbnail"
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="h-32" />
                      )}
                    </div>
                    {videoId && (
                      <div className="mt-1 font-mono text-[11px] text-[var(--text-muted)]">
                        Video ID: {videoId}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-between gap-2 md:w-40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStep(1)}
                    >
                      Change Video
                    </Button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-muted)]">
                      Classification
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setStep(2)}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="grid gap-2 text-xs md:grid-cols-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Year</span>
                      <span className="font-medium">{formData.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Language</span>
                      <span className="font-medium">
                        {formData.language}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-muted)]">
                      Description &amp; contributor
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setStep(3)}
                    >
                      Edit
                    </Button>
                  </div>
                  <p className="text-xs text-[var(--text-body)]">
                    {formData.description}
                  </p>
                  <div className="mt-2 text-[11px] text-[var(--text-muted)]">
                    {formData.contributor_name} · {formData.contributor_email}
                  </div>
                </div>

                <div className="mt-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-xs">
                  <div className="font-semibold text-[var(--text-muted)]">
                    Notes
                  </div>
                  {formData.drive_url ? (
                    <div className="mt-1 inline-flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Notes attached — Google Drive link provided.
                    </div>
                  ) : (
                    <div className="mt-1 text-[var(--text-muted)]">
                      No notes attached.
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2 rounded-xl border border-[var(--border-default)] bg-[var(--bg-raised)] px-3 py-2 text-xs">
                  <input
                    id="guidelines"
                    type="checkbox"
                    className="mt-0.5 h-3.5 w-3.5"
                    checked={guidelinesChecked}
                    onChange={(e) => setGuidelinesChecked(e.target.checked)}
                  />
                  <label htmlFor="guidelines" className="text-[var(--text-body)]">
                    I confirm that this video is my own explanation, is set to
                    Unlisted or Public on YouTube, and follows the PeerLearn
                    community guidelines.
                  </label>
                </div>

                <div className="mt-2 flex justify-between">
                  <Button variant="ghost" onClick={goBack}>
                    ← Back
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    loading={createSubmission.isLoading}
                    disabled={!guidelinesChecked || createSubmission.isLoading}
                    onClick={handleSubmit}
                  >
                    Submit for Review
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

