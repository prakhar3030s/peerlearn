import React from "react";
import { SunMedium, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext.jsx";
import { cn } from "../../lib/utils.js";

export function DarkModeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition-all duration-150 hover:bg-[var(--bg-raised)] focus-visible:shadow-focus",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className={cn(
          "absolute transition-all duration-200",
          isDark
            ? "scale-0 opacity-0"
            : "scale-100 opacity-100"
        )}
      >
        <SunMedium className="h-4 w-4" />
      </span>
      <span
        className={cn(
          "absolute transition-all duration-200",
          isDark
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0"
        )}
      >
        <Moon className="h-4 w-4" />
      </span>
    </button>
  );
}

export default DarkModeToggle;

