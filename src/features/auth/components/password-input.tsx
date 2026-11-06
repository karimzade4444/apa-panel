"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Input } from "@/components/ui/input";

interface PasswordInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  showLabel?: boolean;
}

export default function PasswordInput<T extends FieldValues>({
  name,
  control,
  placeholder = "Пароль",
  className,
  inputClassName,
  iconClassName,
  showLabel = false,
}: PasswordInputProps<T>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="relative">
          <span
            className={`pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#d4af62]/80 ${
              iconClassName ?? ""
            }`}
          >
            <LockKeyhole className="h-4 w-4" />
          </span>

          <Input
            {...field}
            type={showPassword ? "text" : "password"}
            value={field.value ?? ""}
            placeholder={placeholder}
            className={[
              "h-12 rounded-xl border border-white/10 bg-white/6 text-sm text-white placeholder:text-white/35 focus-visible:border-gold-light focus-visible:ring-gold-light/20",
              className,
              inputClassName,
            ]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={Boolean(fieldState.error)}
          />

          <button
            type="button"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>

          {!showLabel && fieldState.error && (
            <p className="mt-1 text-xs text-red-400">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  );
}
