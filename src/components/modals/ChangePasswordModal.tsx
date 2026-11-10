"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

import { changePassword } from "@/api/auth";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/validations/change-password-schema";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FormInput from "../ui/forminput";
import { useGlassToast } from "../ui/glassyui/glass-toaster";
import { useRouter } from "next/router";
import { removeToken } from "@/lib/cookies";


interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
}: ChangePasswordModalProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formValues, setFormValues] = useState<ChangePasswordFormValues | null>(
    null,
  );

  const [success, setSuccess] = useState("");
  const [requestError, setRequestError] = useState("");
  const toast = useGlassToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const mutation = useMutation({
    mutationFn: changePassword,

    onSuccess: () => {
      setConfirmOpen(false);

      setFormValues(null);
      setRequestError("");
      reset();

      toast.success("Пароль успешно изменён", {
        description: "Ваш пароль успешно обновлён.",
      });
      removeToken();

      // Очищаем кеш React Query
      queryClient.clear();

      // Закрываем модалку
      onOpenChange(false);

      // Перенаправляем пользователя на страницу входа
      router.replace("/login");
    },

    onError: (error: unknown) => {
      setConfirmOpen(false);

      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setRequestError(
        message || "Не удалось изменить пароль. Проверьте текущий пароль.",
      );
      toast.error("Не удалось изменить пароль");
    },
  });

  // Пользователь отправил форму
  const handleFormSubmit = (values: ChangePasswordFormValues) => {
    setSuccess("");
    setRequestError("");
    setFormValues(values);
    setConfirmOpen(true);
  };

  // Пользователь подтвердил смену пароля
  const handleConfirm = () => {
    if (!formValues || mutation.isPending) return;

    mutation.mutate({
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
    });
  };

  // Закрытие основной модалки
  const handleClose = (nextOpen: boolean) => {
    if (mutation.isPending) return;

    onOpenChange(nextOpen);

    if (!nextOpen) {
      reset();
      setSuccess("");
      setRequestError("");
      setFormValues(null);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Смена пароля</DialogTitle>

            <DialogDescription>
              Для смены пароля сначала подтвердите текущий пароль.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="mt-5 space-y-4"
          >
            {/* Текущий пароль */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Текущий пароль</label>

              <FormInput
                control={control}
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Введите текущий пароль"
                aria-invalid={!!errors.currentPassword}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />

            </div>

            {/* Новый пароль */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Новый пароль</label>

              <FormInput
                control={control}
                name="newPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Введите новый пароль"
                aria-invalid={!!errors.newPassword}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />

           
            </div>

            {/* Подтверждение нового пароля */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Повторите новый пароль
              </label>

              <FormInput
                control={control}
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Повторите новый пароль"
                aria-invalid={!!errors.confirmPassword}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            {/* Сообщение об успехе */}
            {success && (
              <p role="status" className="text-sm text-green-600">
                {success}
              </p>
            )}

            {/* Ошибка от сервера */}
            {requestError && (
              <p role="alert" className="text-sm text-destructive">
                {requestError}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => handleClose(false)}
              >
                Отмена
              </Button>

              <Button type="submit" disabled={mutation.isPending}>
                Продолжить
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Дополнительное подтверждение */}
      <AlertDialog
        open={confirmOpen}
        onOpenChange={(nextOpen) => {
          if (!mutation.isPending) {
            setConfirmOpen(nextOpen);
          }
        }}
      >
        <AlertDialogContent className="max-w-md p-6">
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердить смену пароля?</AlertDialogTitle>

            <AlertDialogDescription>
              Вы действительно хотите изменить пароль своей учётной записи? Это
              действие отправит запрос на сервер.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setConfirmOpen(false)}
            >
              Отмена
            </Button>

            <Button
              type="button"
              disabled={mutation.isPending}
              onClick={handleConfirm}
            >
              {mutation.isPending ? "Изменение..." : "Подтвердить"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
