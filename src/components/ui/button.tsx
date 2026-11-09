import type { ButtonHTMLAttributes } from "react";

import { GlassButton } from "@/components/ui/glassyui";
import { cn } from "@/lib/utils";

type ButtonVariant =
  | "default"
  | "destructive"
  | "ghost"
  | "link"
  | "outline"
  | "secondary";

type ButtonSize =
  | "default"
  | "icon"
  | "icon-lg"
  | "icon-sm"
  | "icon-xs"
  | "lg"
  | "sm"
  | "xs";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const sizeProps: Record<
  ButtonSize,
  { className: string; size: "lg" | "md" | "sm" }
> = {
  default: { size: "md", className: "min-h-8 px-3" },
  xs: { size: "sm", className: "h-6 gap-1 px-2 text-xs" },
  sm: { size: "sm", className: "h-7 gap-1 px-2.5 text-xs" },
  lg: { size: "lg", className: "h-9 gap-1.5 px-2.5" },
  icon: { size: "sm", className: "size-8 p-0" },
  "icon-xs": { size: "sm", className: "size-6 p-0" },
  "icon-sm": { size: "sm", className: "size-7 p-0" },
  "icon-lg": { size: "lg", className: "size-9 p-0" },
};

const variantProps: Record<ButtonVariant, "ghost" | "primary" | "prominent" | "soft"> = {
  default: "primary",
  destructive: "ghost",
  ghost: "ghost",
  link: "ghost",
  outline: "soft",
  secondary: "soft",
};

export function Button({
  asChild,
  className,
  size = "default",
  variant = "default",
  ...props
}: ButtonProps) {
  const mappedVariant = variantProps[variant];
  const destructiveClass =
    variant === "destructive"
      ? "text-destructive hover:bg-destructive/20"
      : variant === "link"
        ? "h-auto p-0 text-primary underline-offset-4 hover:underline"
        : "";

  return (
    <GlassButton
      asChild={asChild}
      size={sizeProps[size].size}
      variant={mappedVariant}
      className={cn(sizeProps[size].className, destructiveClass, className)}
      {...props}
    />
  );
}
