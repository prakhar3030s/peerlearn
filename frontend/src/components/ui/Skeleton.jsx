import React from "react";
import { cn } from "../../lib/utils.js";

export function SkeletonText({ width = "100%", height = 12, className }) {
  return (
    <div
      className={cn("skeleton rounded-full", className)}
      style={{ width, height }}
    />
  );
}

export function SkeletonBlock({
  width = "100%",
  height = 80,
  borderRadius = 8,
  className,
}) {
  return (
    <div
      className={cn("skeleton", className)}
      style={{ width, height, borderRadius }}
    />
  );
}

export default { SkeletonText, SkeletonBlock };

