"use client";

import { useReducedMotion } from "motion/react";
import {
  Camera,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { GlassAvatar } from "@/components/ui/glassyui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormInput from "@/components/ui/forminput";
import type { UserFormDialogProps } from "@/types/user-components";
import { getProfileInitials } from "@/lib/auth";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function UserFormDialog({
  formMode,
  formRole,
  formRoleOptions,
  control,
  isMutating,
  photoFile,
  existingPhotoUrl,
  onClose,
  onPhotoChange,
  onRoleChange,
  onSubmit,
}: UserFormDialogProps) {
  const shouldReduceMotion = useReducedMotion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(true);
  const [photoError, setPhotoError] = useState("");
  const firstName = useWatch({ control, name: "firstName" });
  const lastName = useWatch({ control, name: "lastName" });
  const [photoPreview, setPhotoPreview] = useState<{
    file: File;
    url: string;
  } | null>(null);
  const previewName =
    [firstName, lastName].filter(Boolean).join(" ") || "Новый пользователь";

  useEffect(() => {
    if (!photoFile) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoPreview({ file: photoFile, url: reader.result });
      }
    };
    reader.readAsDataURL(photoFile);
    return () => reader.abort();
  }, [photoFile]);

  const acceptPhoto = (file?: File) => {
    setPhotoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Выберите изображение в формате JPG, PNG или WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError("Размер изображения не должен превышать 5 МБ.");
      return;
    }
    onPhotoChange(file);
  };

  const previewUrl = photoPreview?.file === photoFile ? photoPreview.url : null;
  const photoSource = previewUrl || existingPhotoUrl;
  const isBusy = isMutating;

  const requestClose = useCallback(() => {
    if (isBusy || !dialogOpen) return;
    setDialogOpen(false);
    closeTimerRef.current = window.setTimeout(
      onClose,
      shouldReduceMotion ? 0 : 340,
    );
  }, [dialogOpen, isBusy, onClose, shouldReduceMotion]);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) requestClose();
      }}
    >
      <DialogContent className="max-h-[92dvh] max-w-4xl overflow-hidden p-0 text-card-foreground">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Закрыть форму пользователя"
          disabled={isBusy}
          onClick={requestClose}
          className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground transition hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </Button>

        <div className="scrollbar-none max-h-[92dvh] overflow-y-auto">
          <div className="relative overflow-hidden border-b border-border px-6 pb-5 pt-6 sm:px-8 sm:pt-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-20 size-56 rounded-full bg-[#d4af62]/10 blur-[80px]"
            />
            <DialogHeader className="relative pr-12">
              <span className="mb-1 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-primary">
                <ShieldCheck className="size-3.5" />
                Управление доступом
              </span>
              <DialogTitle className="text-xl font-semibold text-foreground sm:text-2xl">
                {formMode === "create"
                  ? "Новый пользователь"
                  : "Редактирование профиля"}
              </DialogTitle>
              <DialogDescription className="max-w-xl text-sm leading-relaxed text-muted-foreground">
                {formMode === "create"
                  ? "Заполните данные учетной записи и при желании добавьте фотографию."
                  : "Обновите данные пользователя. Пароль можно оставить пустым."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={onSubmit}>
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[230px_minmax(0,1fr)]">
              <section className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    Фото профиля
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Перетащите изображение или выберите его на устройстве.
                  </p>
                </div>

                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={(event) => {
                    if (
                      !event.currentTarget.contains(event.relatedTarget as Node)
                    ) {
                      setIsDragging(false);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    acceptPhoto(event.dataTransfer.files[0]);
                  }}
                  className={`relative flex min-h-57.5 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed p-4 text-center transition ${
                    isDragging
                      ? "border-[#f2d18a] bg-[#d4af62]/15"
                      : "border-border bg-muted hover:border-[#d4af62]/55 hover:bg-accent"
                  }`}
                >
                  {photoSource ? (
                    <div className="absolute inset-0">
                      <Image
                        src={photoSource}
                        alt={`Фото: ${previewName}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="230px"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#061a30]/95 via-[#061a30]/20 to-[#061a30]/10" />
                      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-left">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {previewName}
                          </p>
                          <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground">
                            {photoFile?.name ?? "Текущее фото профиля"}
                          </p>
                        </div>
                        {photoFile && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Удалить выбранное фото"
                            onClick={() => {
                              onPhotoChange(null);
                              setPhotoError("");
                            }}
                            className="shrink-0 rounded-full bg-popover text-popover-foreground hover:bg-accent"
                          >
                            <X className="size-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <GlassAvatar
                        name={previewName}
                        size="xl"
                        className="size-20 border border-border text-primary"
                        fallback={
                          previewName !== "Новый пользователь" ? (
                            getProfileInitials(previewName)
                          ) : (
                            <UserRound className="size-8" />
                          )
                        }
                      />
                      <span className="mt-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <ImagePlus className="size-4 text-primary" />
                        Добавить фото
                      </span>
                      <span className="mt-1.5 text-xs text-muted-foreground">
                        JPG, PNG или WebP · до 10 МБ
                      </span>
                    </div>
                  )}
                  {isDragging && (
                    <div className="absolute inset-0 flex items-center justify-center bg-popover text-sm font-medium text-popover-foreground">
                      Отпустите файл, чтобы добавить фото
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Выбрать фото пользователя"
                  onChange={(event) => {
                    acceptPhoto(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-border bg-muted text-muted-foreground hover:border-[#d4af62]/45 hover:bg-accent hover:text-accent-foreground"
                >
                  {photoSource ? (
                    <Camera className="size-4" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  {photoSource ? "Изменить фото" : "Выбрать файл"}
                </Button>
                {photoError && (
                  <p
                    role="alert"
                    className="text-xs leading-relaxed text-rose-700 dark:text-rose-200"
                  >
                    {photoError}
                  </p>
                )}
              </section>

              <section className="min-w-0 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs text-foreground">
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
                      className="h-10 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-foreground">
                    Email
                    <FormInput
                      name="email"
                      control={control}
                      required
                      type="email"
                      autoComplete="email"
                      placeholder="Введите email"
                      className="h-10 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-foreground">
                    Имя
                    <FormInput
                      name="firstName"
                      control={control}
                      required
                      placeholder="Введите имя"
                      className="h-10 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-foreground">
                    Отчество (необязательно)
                    <FormInput
                      name="middleName"
                      control={control}
                      placeholder="Введите отчество"
                      className="h-10 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-foreground">
                    Фамилия
                    <FormInput
                      name="lastName"
                      control={control}
                      required
                      placeholder="Введите фамилию"
                      className="h-10 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </label>
                  <label className="space-y-1.5 text-xs text-foreground">
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
                      className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {formRoleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-xs text-foreground sm:col-span-2">
                    Пароль
                    {formMode === "edit" &&
                      " (оставьте пустым, чтобы не менять)"}
                    <FormInput
                      name="password"
                      control={control}
                      required={formMode === "create"}
                      type="password"
                      autoComplete={
                        formMode === "create" ? "new-password" : "off"
                      }
                      minLength={8}
                      placeholder={
                        formMode === "create"
                          ? "Придумайте пароль"
                          : "Введите новый пароль"
                      }
                      className="h-10 border-border bg-muted text-foreground placeholder:text-muted-foreground"
                    />
                  </label>
                </div>
              </section>
            </div>

            <DialogFooter className="border-t border-border bg-muted px-5 py-4 sm:px-7">
              <Button
                type="button"
                variant="ghost"
                disabled={isBusy}
                onClick={requestClose}
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isBusy || !formRoleOptions.length}
                className="min-w-32 bg-primary text-primary-foreground shadow-[0_6px_20px_rgba(225,187,110,0.18)] hover:bg-primary"
              >
                {isBusy ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Сохранение...
                  </>
                ) : formMode === "create" ? (
                  "Создать пользователя"
                ) : (
                  "Сохранить изменения"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
