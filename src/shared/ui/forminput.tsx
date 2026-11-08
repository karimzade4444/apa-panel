"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface IFormInput<T extends FieldValues> extends Omit<
  ComponentProps<"input">,
  "name" | "type" | "value" | "defaultValue"
> {
  name: Path<T>;
  control: Control<T>;
  type?: ComponentProps<"input">["type"];
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

const FormInput = <T extends FieldValues>({
  control,
  name,
  placeholder,
  type,
  className,
  startIcon,
  endIcon,
  ...props
}: IFormInput<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const hasEndContent = endIcon != null || isPassword;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div>
          <div className="relative">
            <Input
              {...props}
              {...field}
              type={isPassword ? (showPassword ? "text" : "password") : type}
              value={field.value ?? ""}
              placeholder={placeholder}
              aria-invalid={Boolean(fieldState.error)}
              className={cn(
                "border border-black/30",
                startIcon && "pl-10",
                hasEndContent && (endIcon && isPassword ? "pr-20" : "pr-10"),
                className,
              )}
            />

            {startIcon && (
              <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                {startIcon}
              </span>
            )}

            {hasEndContent && (
              <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5">
                {endIcon}
                {isPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={
                      showPassword ? "Скрыть пароль" : "Показать пароль"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {fieldState.error && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

export default FormInput;
