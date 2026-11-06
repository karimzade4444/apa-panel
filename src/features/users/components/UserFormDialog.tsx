"use client";

import { motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import FormInput from "@/components/ui/forminput";
import type { UserFormDialogProps } from "@/features/users/types/user-components";

export function UserFormDialog({
  formMode,
  formRole,
  formRoleOptions,
  control,
  isMutating,
  onClose,
  onRoleChange,
  onSubmit,
}: UserFormDialogProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020d18]/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isMutating) onClose();
      }}
    >
      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 12, scale: 0.98 }
        }
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, y: 8, scale: 0.98 }
        }
        transition={{ duration: 0.2 }}
        className="glass-panel max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl p-5 sm:p-6"
      >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2
              id="user-form-title"
              className="text-lg font-semibold text-white"
            >
              {formMode === "create"
                ? "Создать пользователя"
                : "Изменить пользователя"}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Закрыть форму пользователя"
              disabled={isMutating}
              onClick={onClose}
              className="text-white/60 hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </Button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-xs text-white/65">
                Имя пользователя
                <FormInput
                  name="userName"
                  control={control}
                  required
                  minLength={3}
                  maxLength={50}
                  pattern="[A-Za-z0-9._-]{3,50}"
                  title="От 3 до 50 латинских букв, цифр, точек, дефисов или подчёркиваний"
                  autoComplete="username"
                  placeholder="Логин (латиница, цифры, . _ -)"
                  className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/40"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/65">
                Email
                <FormInput
                  name="email"
                  control={control}
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="Введите email"
                  className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/40"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/65">
                Имя
                <FormInput
                  name="firstName"
                  control={control}
                  required
                  placeholder="Введите имя"
                  className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/40"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/65">
                Отчество (необязательно)
                <FormInput
                  name="middleName"
                  control={control}
                  placeholder="Введите отчество"
                  className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/40"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/65">
                Фамилия
                <FormInput
                  name="lastName"
                  control={control}
                  required
                  placeholder="Введите фамилию"
                  className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/40"
                />
              </label>
              <label className="space-y-1.5 text-xs text-white/65">
                Роль
                <select
                  required
                  value={formRole}
                  onChange={(event) => {
                    const nextRole = formRoleOptions.find(
                      (role) => role.value === event.target.value,
                    )?.value;
                    if (nextRole) onRoleChange(nextRole);
                  }}
                  className="h-9 w-full rounded-lg border border-white/10 bg-[#102b46] px-3 text-sm text-white outline-none focus:border-[#d4af62]/50"
                >
                  {formRoleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-xs text-white/65 sm:col-span-2">
                Пароль
                {formMode === "edit" &&
                  " (оставьте пустым, чтобы не менять)"}
                <FormInput
                  name="password"
                  control={control}
                  required={formMode === "create"}
                  type="password"
                  autoComplete={formMode === "create" ? "new-password" : "off"}
                  minLength={8}
                  placeholder={
                    formMode === "create"
                      ? "Придумайте пароль"
                      : "Введите новый пароль"
                  }
                  className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/40"
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isMutating}
                onClick={onClose}
                className="text-white/70 hover:bg-white/10 hover:text-white"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isMutating || !formRoleOptions.length}
                className="bg-[#e1bb6e] text-[#10243a] hover:bg-[#f2d18a]"
              >
                {isMutating
                  ? "Сохранение..."
                  : formMode === "create"
                    ? "Создать"
                    : "Сохранить"}
              </Button>
            </div>
          </form>
      </motion.section>
    </motion.div>
  );
}
