"use client";

import "./styles/liquid.css";

import clsx from "clsx";
import { forwardRef, useId, type ReactNode } from "react";

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      className,
      id,
      label,
      hint,
      startIcon,
      endIcon,
      type = "text",
      "aria-describedby": describedBy,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? `lg-input-${generatedId}`;
    const hintId = `${inputId}-hint`;

    const descriptionIds = [describedBy, hint ? hintId : null]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="flex w-full flex-col gap-2 text-foreground">
        {label && (
          <label htmlFor={inputId} className="font-medium select-none">
            {label}
          </label>
        )}

        <div className="relative w-full">
          {startIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground [&_svg]:text-current">
              {startIcon}
            </span>
          )}

          <input
            {...props}
            id={inputId}
            ref={ref}
            type={type}
            aria-describedby={descriptionIds || undefined}
            data-lg-refraction="none"
            className={clsx(
              "lg-input w-full",
              "bg-background text-foreground caret-foreground",
              "placeholder:text-muted-foreground",
              "border-border",
              "dark:text-foreground",
              startIcon && "pl-10",
              endIcon && "pr-10",
              className,
            )}
          />

          {endIcon && (
            <span className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-muted-foreground [&_svg]:text-current">
              {endIcon}
            </span>
          )}
        </div>

        {hint && (
          <span id={hintId} className="text-xs text-muted-foreground">
            {hint}
          </span>
        )}
      </div>
    );
  },
);

GlassInput.displayName = "GlassInput";
