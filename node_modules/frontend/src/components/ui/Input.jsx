import React from "react";
import { cn } from "../../lib/utils.js";

export const Input = React.forwardRef(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      className,
      maxLength,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    const [internal, setInternal] = React.useState(defaultValue || "");
    const controlled = value !== undefined;
    const currentValue = controlled ? value : internal;

    const handleChange = (e) => {
      if (!controlled) setInternal(e.target.value);
      onChange?.(e);
    };

    const hasValue = currentValue != null && String(currentValue).length > 0;

    const showCounter = typeof maxLength === "number";
    const length = currentValue ? String(currentValue).length : 0;

    return (
      <div className="relative w-full">
        <div
          className={cn(
            "group relative flex items-center rounded-md border bg-[var(--bg-surface)] text-[var(--text-body)] transition-all duration-150",
            "border-[var(--border-default)] focus-within:border-[var(--border-focus)] focus-within:shadow-focus",
            error &&
              "border-red-500 focus-within:border-red-500 focus-within:shadow-[0_0_0_3px_rgba(248,113,113,0.35)]",
            "h-10",
            className
          )}
        >
          {leftIcon && (
            <span className="pointer-events-none ml-3 flex items-center text-[var(--text-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "peer h-full w-full bg-transparent px-3 text-sm text-[var(--text-body)] placeholder-transparent outline-none",
              leftIcon && "pl-2",
              rightIcon && "pr-8"
            )}
            value={currentValue}
            onChange={handleChange}
            maxLength={maxLength}
            {...props}
          />
          {rightIcon && (
            <span className="mr-3 flex items-center text-[var(--text-muted)]">
              {rightIcon}
            </span>
          )}
          {label && (
            <label
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 origin-left -translate-y-1/2 text-[13px] text-[var(--text-muted)] transition-all duration-150",
                "peer-focus:-translate-y-3 peer-focus:text-[11px] peer-focus:text-[var(--brand-primary)]",
                hasValue && "-translate-y-3 text-[11px]",
                leftIcon && "left-9"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {showCounter && (
          <div className="mt-1 flex justify-end text-[11px] text-[var(--text-muted)]">
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

Input.displayName = "Input";

export default Input;

