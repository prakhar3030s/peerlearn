import React from "react";
import { cn } from "../../lib/utils.js";

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

const gradients = [
  "from-brand-500 via-brand-400 to-accent-500",
  "from-accent-500 via-accent-400 to-brand-500",
  "from-emerald-500 via-emerald-400 to-brand-500",
  "from-blue-500 via-indigo-500 to-accent-500",
  "from-fuchsia-500 via-pink-500 to-amber-400",
  "from-sky-500 via-cyan-500 to-emerald-400",
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function Avatar({ src, name = "", size = "md", bordered = false, className }) {
  const dimension = sizeMap[size] || sizeMap.md;
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");

  const idx = hashString(name || "peerlearn") % gradients.length;
  const gradientClass = gradients[idx];

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full text-xs font-semibold text-white",
        bordered && "ring-2 ring-[var(--bg-surface)]",
        className
      )}
      style={{ width: dimension, height: dimension }}
    >
      {src ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img
          src={src}
          alt={name || "Avatar"}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr",
            gradientClass
          )}
        >
          <span className="text-[11px]">{initials || "PL"}</span>
        </div>
      )}
    </div>
  );
}

export default Avatar;

