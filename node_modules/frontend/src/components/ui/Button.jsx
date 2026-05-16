import React from "react";
import { cn } from "../../lib/utils.js";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-semibold border text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)] disabled:cursor-not-allowed disabled:opacity-60 select-none";

const sizeClasses = {
  xs: "h-6 px-2 text-[11px]",
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-5 text-[15px]",
  xl: "h-14 px-7 text-[16px]",
};

const variantClasses = {
  primary:
    "border-transparent text-white bg-[var(--accent)] shadow-md hover:bg-[var(--accent-hover)] hover:-translate-y-[1px] hover:shadow-lg hover:shadow-[var(--accent)]/25 active:translate-y-0 active:scale-[0.99]",
  secondary:
    "bg-[var(--bg-surface)] border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] hover:border-[var(--border-default)] hover:-translate-y-[1px] hover:shadow-sm active:translate-y-0 active:scale-[0.99]",
  ghost:
    "bg-transparent border-transparent text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]",
  danger:
    "bg-[var(--danger)] border-[var(--danger)] text-white hover:opacity-90 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-[0.99]",
  "danger-ghost":
    "bg-transparent border-transparent text-[var(--danger)] hover:bg-red-500/10 hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.99]",
  success:
    "bg-[var(--success)] border-[var(--success)] text-white hover:opacity-90 hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:scale-[0.99]",
};

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--border-default)] border-t-white"
      aria-hidden="true"
    />
  );
}

export const Button = React.forwardRef(
  (
    {
      children,
      className,
      variant = "primary",
      size = "md",
      leftIcon,
      rightIcon,
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          isDisabled && "hover:translate-y-0 hover:shadow-none",
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <>
            {leftIcon && (
              <span className="inline-flex items-center justify-center">
                {leftIcon}
              </span>
            )}
            <span>{children}</span>
            {rightIcon && (
              <span className="inline-flex items-center justify-center">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;

