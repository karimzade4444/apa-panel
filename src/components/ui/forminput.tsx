import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input } from "./input";
import type { ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface IFormInput<T extends FieldValues> extends ComponentProps<"input"> {
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
}

const FormInput = <T extends FieldValues>({
  control,
  name,
  placeholder,
  type,
  className,
  ...props
}: IFormInput<T>) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <>
          <div className="relative">
            <Input
              {...field}
              {...props}
              type={isPassword ? (showPassword ? "text" : "password") : type}
              placeholder={placeholder}
              aria-invalid={!!fieldState.error}
              className={`border border-black/30 ${
                isPassword ? "pr-10" : ""
              } ${className ?? ""}`}
            />

            {isPassword && (
              <button
                type="button"
                onPointerDown={() => setShowPassword(true)}
                onPointerUp={() => setShowPassword(false)}
                onPointerLeave={() => setShowPassword(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}
          </div>

          <p className="text-sm text-red-500">{fieldState.error?.message}</p>
        </>
      )}
    />
  );
};

export default FormInput;
