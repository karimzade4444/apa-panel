"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { KeyRound } from "lucide-react";

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

interface ChangePasswordModalProps {
  onOpen?: () => void;
}

export function ChangePasswordModal({ onOpen }: ChangePasswordModalProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [formValues, setFormValues] = useState<ChangePasswordFormValues | null>(
    null,
  );
  const [success, setSuccess] = useState("");
  const [requestError, setRequestError] = useState("");

  const {
    register,
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
      setSuccess("Пароль успешно изменён.");
      setRequestError("");
      setFormValues(null);
      reset();
    },

    onError: (error: unknown) => {
      setConfirmOpen(false);

      const message = isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message
        : undefined;

      setRequestError(
        message || "Не удалось изменить пароль. Проверьте текущий пароль.",
      );
    },
  });

  const handleFormSubmit = (values: ChangePasswordFormValues) => {
    setSuccess("");
    setRequestError("");
    setFormValues(values);
    setConfirmOpen(true);
    
  };
  

  const handleConfirm = () => {
    if (!formValues) return;

    mutation.mutate({
      currentPassword: formValues.currentPassword,
      newPassword: formValues.newPassword,
    });
  };

  const handleClose = (nextOpen: boolean) => {
    if (mutation.isPending) return;

    setOpen(nextOpen);

    if (!nextOpen) {
      reset();
      setSuccess("");
      setFormValues(null);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => {
          onOpen?.();
          setOpen(true);
        }}
      >
        <KeyRound className="mr-2 size-4" />
        Сменить пароль
      </Button>

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
            <div className="space-y-2">
              <label className="text-sm font-medium">Текущий пароль</label>
              <input
                {...register("currentPassword")}
                type="password"
                autoComplete="current-password"
                placeholder="Введите текущий пароль"
                aria-invalid={!!errors.currentPassword}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Новый пароль</label>
              <input
                {...register("newPassword")}
                type="password"
                autoComplete="new-password"
                placeholder="Введите новый пароль"
                aria-invalid={!!errors.newPassword}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Повторите новый пароль
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                autoComplete="new-password"
                placeholder="Повторите новый пароль"
                aria-invalid={!!errors.confirmPassword}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {success && (
              <p role="status" className="text-sm text-foreground">
                {success}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                Отмена
              </Button>

              <Button type="submit">Продолжить</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
