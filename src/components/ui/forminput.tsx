"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
  type RegisterOptions,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlassInput } from "@/components/ui/glassyui";

interface FormInputProps<T extends FieldValues> extends Omit<
  ComponentProps<"input">,
  "name" | "type" | "value" | "defaultValue"
> {
  name: Path<T>;
  control: Control<T>;
  type?: ComponentProps<"input">["type"];
  label?: string;
  hint?: string;
  rules?: RegisterOptions<T, Path<T>>;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const FormInput = <T extends FieldValues>({
  control,
  name,
  label,
  hint,
  placeholder,
  type,
  className,
  rules,
  startIcon,
  endIcon,
  ...props
}: FormInputProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const hasEndContent = endIcon != null || isPassword;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className="min-w-0">
          <div className="relative">
            <GlassInput
              {...props}
              {...field}
              id={props.id ?? `form-${name}`}
              label={label}
              hint={hint}
              type={isPassword ? (showPassword ? "text" : "password") : type}
              value={field.value ?? ""}
              placeholder={placeholder}
              aria-invalid={Boolean(fieldState.error)}
              className={cn(
                "h-10 w-full border-border bg-muted text-foreground placeholder:text-muted-foreground focus-visible:ring-ring",
                startIcon && "pl-10",
                hasEndContent && (endIcon && isPassword ? "pr-20" : "pr-10"),
                className,
              )}
            />
            {(startIcon || hasEndContent) && (
              <span
                className={cn(
                  "absolute z-10 flex items-center gap-0.5",
                  label || hint ? "bottom-2 right-2" : "right-2 top-1/2 -translate-y-1/2",
                  !label && !hint && startIcon && "right-auto left-4",
                )}
              >
                {startIcon}
                {endIcon}
                {isPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </span>
            )}
          </div>

          {fieldState.error && (
            <p className="mt-1 text-xs text-destructive" role="alert">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default FormInput;
