"use client";

import clsx from "clsx";
import type { HTMLAttributes } from "react";

export type GlassSkeletonVariant = "block" | "circle" | "line" | "text";

export type GlassSkeletonProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  variant?: GlassSkeletonVariant;
  lines?: number;
};

export function GlassSkeleton({
  variant = "block",
  lines = 3,
  className,
  ...props
}: GlassSkeletonProps) {
  if (variant !== "text") {
    return (
      <div
        {...props}
        aria-hidden="true"
        data-variant={variant}
        className={clsx("lg-skeleton", className)}
      />
    );
  }

  return (
    <div
      {...props}
      aria-hidden="true"
      className={clsx("lg-skeleton-text", className)}
    >
      {Array.from({ length: Math.max(1, Math.floor(lines)) }, (_, index) => (
        <div key={index} className="lg-skeleton" />
      ))}
    </div>
  );
}
