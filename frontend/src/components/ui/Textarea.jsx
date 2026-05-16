import React from "react";
import { cn } from "../../lib/utils.js";

export const Textarea = React.forwardRef(
  (
    {
      label,
      error,
      className,
      maxLength,
      value,
      defaultValue,
      onChange,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const [internal, setInternal] = React.useState(defaultValue || "");
    const controlled = value !== undefined;
    const currentValue = controlled ? value : internal;
    const textAreaRef = React.useRef(null);

    const setRef = (node) => {
      textAreaRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    };

    const autoGrow = () => {
      const el = textAreaRef.current;
      if (!el) return;
      el.style.height = "auto";
      const newHeight = Math.min(el.scrollHeight, 320);
      el.style.height = `${newHeight}px`;
    };

    React.useEffect(() => {
      autoGrow();
    }, [currentValue]);

    const handleChange = (e) => {
      if (!controlled) setInternal(e.target.value);
      onChange?.(e);
    };

    const showCounter = typeof maxLength === "number";
    const length = currentValue ? String(currentValue).length : 0;
    const ratio = showCounter ? length / maxLength : 0;

    const counterColor =
      ratio >= 1 ? "text-red-600" : ratio >= 0.8 ? "text-amber-600" : "text-[var(--text-muted)]";

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "group relative rounded-md border bg-[var(--bg-surface)] text-[var(--text-body)] transition-all duration-150",
            "border-[var(--border-default)] focus-within:border-[var(--border-focus)] focus-within:shadow-focus",
            error &&
              "border-red-500 focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(248,113,113,0.35)]",
            className
          )}
        >
          {label && (
            <label className="block px-3 pt-2 text-[13px] font-medium text-[var(--text-muted)]">
              {label}
            </label>
          )}
          <textarea
            ref={setRef}
            className="min-h-[80px] w-full resize-y overflow-auto border-0 bg-transparent px-3 pb-2 text-sm text-[var(--text-body)] outline-none resize-y-only"
            style={{ resize: "vertical" }}
            rows={rows}
            value={currentValue}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
        </div>
        {showCounter && (
          <div className={cn("mt-1 flex justify-end text-[11px]", counterColor)}>
            <span>
              {length}/{maxLength}
            </span>
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;

