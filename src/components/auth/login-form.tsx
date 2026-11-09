"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import { Check, LockKeyhole, Mail, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { isAxiosError } from "axios";

import { login } from "@/api/auth";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/ui/forminput";
import { useGlassToast } from "@/components/ui/glassyui/glass-toaster";
import { saveToken } from "@/lib/cookies";
import { LoginSkeleton } from "./login-skeleton";
import { loginSchema, type LoginFormValues } from "@/validations/login-schema";

function getLoginErrorMessage(error: unknown) {
  if (!isAxiosError(error)) {
    return "Не удалось выполнить вход. Попробуйте позже.";
  }

  const responseData: unknown = error.response?.data;
  if (
    responseData &&
    typeof responseData === "object" &&
    "message" in responseData &&
    typeof responseData.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  if (!error.response) {
    return "Не удалось связаться с сервером. Проверьте подключение и попробуйте снова.";
  }

  if (error.response.status === 401 || error.response.status === 403) {
    return "Сервер отклонил данные входа. Проверьте логин и пароль.";
  }

  return `Ошибка сервера (${error.response.status}). Попробуйте позже.`;
}

export default function LoginForm() {
  const [error, setError] = useState("");
  const toast = useGlassToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();

  const { control, handleSubmit, setValue } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  });
  const loginValue = useWatch({ control, name: "login" });

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onError: (error: unknown) => {
      setError(getLoginErrorMessage(error));
    },
    onSuccess: (res) => {
      const token = res?.data?.accessToken ?? null;

      if (!token) {
        setError("Сервер не вернул токен авторизации");
        return;
      }

      queryClient.removeQueries({ queryKey: ["auth-profile"] });
      queryClient.removeQueries({ queryKey: ["auth-profile-user"] });
      queryClient.removeQueries({ queryKey: ["users"] });
      saveToken(token);
      toast.success("Вход выполнен", {
        description: "Добро пожаловать в панель управления",
      });
      router.push("/");
      router.refresh();
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError("");
    mutate(data);
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      {isPending ? (
        <LoginSkeleton />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="login"
            control={control}
            placeholder="Логин или email"
            autoComplete="username"
            startIcon={<Mail className="h-4 w-4 text-gold-light/80" />}
            endIcon={
              loginValue ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Очистить поле"
                  onClick={() => setValue("login", "", { shouldDirty: true })}
                  className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              ) : null
            }
            className="h-12 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />

          <FormInput
            name="password"
            control={control}
            type="password"
            placeholder="Пароль"
            autoComplete="current-password"
            startIcon={<LockKeyhole className="h-4 w-4 text-gold-light/80" />}
            className="h-12 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
          />

          <div className="flex items-center justify-between pt-1 text-[0.72rem] text-muted-foreground">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border border-gold-light/60 bg-transparent accent-gold-light"
              />
              <span>Запомнить меня</span>
            </label>
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 text-gold-light transition hover:bg-transparent hover:text-primary"
            >
              Забыли пароль?
            </Button>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="group relative mt-2 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_8px_25px_rgba(201,164,92,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/80 hover:shadow-[0_12px_30px_rgba(201,164,92,0.35)] disabled:translate-y-0 disabled:opacity-60"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isPending ? "Выполняется вход..." : "Войти в систему"}
            </span>
          </Button>

          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-gold-light/60 bg-secondary text-gold-light">
              <Check className="h-2.5 w-2.5" />
            </span>
            <span>Безопасный доступ</span>
          </div>
        </form>
      )}
    </motion.div>
  );
}
