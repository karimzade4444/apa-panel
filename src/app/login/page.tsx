"use client";

import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/forminput";
import { useState } from "react";
import { login } from "@/api/requests/auth";
import { saveToken } from "@/lib/cookies";

type LoginFormValues = {
  login: string;
  password: string;
};

const LogIn = () => {
  const [error, setError] = useState("");
  const { control, handleSubmit } = useForm<LoginFormValues>();

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onError: () => {
      setError("Неверный логин или пароль");
    },
    onSuccess: (res) => {
      const token = res?.data?.accessToken ?? null;
      if (token) {
        saveToken(token);
      }
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError("");
    mutate(data);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 md:px-10">
      <div className="flex w-full max-w-4xl items-center justify-center gap-10">
        {/* Левая колонка с логотипом (скрыта на мобильных) */}
        <div className="hidden w-1/2 flex-col justify-center md:flex">
          <h1 className="text-5xl font-black text-gray-900 dark:text-white">
            APA
          </h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Система управления и аналитики
          </p>
        </div>

        {/* Правая колонка с формой входа */}
        <div className="w-full md:w-1/2">
          <div className="rounded-4xl border bg-white/70 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10 md:p-10">
            <h1 className="text-3xl font-black dark:text-white md:text-4xl">
              Добро пожаловать
            </h1>

            <p className="mt-3 text-gray-500 dark:text-gray-400">
              Войдите в свой аккаунт
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <FormInput name="login" control={control} placeholder="Login" />

              <FormInput
                name="password"
                control={control}
                placeholder="Password"
                type="password"
              />

              {error && (
                <p className="pl-3 text-sm font-medium text-red-500">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isPending}
                className="h-12 w-full cursor-pointer rounded-xl bg-primary text-lg font-bold text-white transition duration-300 hover:bg-primary/70 disabled:opacity-50"
              >
                {isPending ? "Вход..." : "Войти"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
