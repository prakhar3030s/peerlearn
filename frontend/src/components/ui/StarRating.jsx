import React from "react";
import { Star } from "lucide-react";
import { cn } from "../../lib/utils.js";

export function StarRating({
  mode = "display",
  value = 0,
  count = 0,
  onChange,
  max = 5,
}) {
  const [hovered, setHovered] = React.useState(null);
  const interactive = mode === "interactive";
  const size = interactive ? 20 : 16;

  if (mode === "display" && count < 3) {
    return null;
  }

  const effective = interactive && hovered != null ? hovered : value;

  const handleClick = (index) => {
    if (!interactive || !onChange) return;
    onChange(index);
  };

  const groupLabel =
    mode === "interactive" ? "Rate this video from 1 to 5 stars" : undefined;

  return (
    <div
      className="inline-flex items-center gap-1"
      {...(interactive && {
        role: "radiogroup",
        "aria-label": groupLabel,
      })}
    >
      <div className="flex items-center">
        {Array.from({ length: max }).map((_, idx) => {
          const index = idx + 1;
          const filled = effective >= index;
          const isChecked = index === Math.round(effective);
          return (
            <button
              key={index}
              type="button"
              className={cn(
                "relative flex items-center justify-center p-0.5 transition-transform duration-150",
                interactive && "cursor-pointer"
              )}
              {...(interactive && {
                role: "radio",
                "aria-checked": isChecked,
                tabIndex: isChecked || index === 1 ? 0 : -1,
              })}
              onMouseEnter={
                interactive ? () => setHovered(index) : undefined
              }
              onMouseLeave={interactive ? () => setHovered(null) : undefined}
              onClick={() => handleClick(index)}
            >
              <Star
                className={cn(
                  filled
                    ? "text-amber-500"
                    : interactive
                    ? "text-slate-400 dark:text-slate-500"
                    : "text-[var(--border-default)]",
                  interactive && filled && "animate-bounceIn"
                )}
                style={{ width: size, height: size }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
      {mode === "display" && (
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <span className="font-semibold text-[var(--text-primary)]">
            {value.toFixed(1)}
          </span>
          <span>({count})</span>
        </div>
      )}
    </div>
  );
}

export default React.memo(StarRating);
