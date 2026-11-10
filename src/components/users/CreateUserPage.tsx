"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  motion, useReducedMotion } from "motion/react"; 
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CircleAlert,
  ImageIcon,
  LoaderCircle,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Controller, useForm } from "react-hook-form";

import { createUser } from "@/api/users";
import { Button } from "@/components/ui/button";
import {
  GlassAlert,
  GlassAvatar,
  GlassBadge,
  GlassPanel,
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
  GlassSkeleton,
} from "@/components/ui/glassyui";
import FormInput from "@/components/ui/forminput";
import { useGlassToast } from "@/components/ui/glassyui/glass-toaster";
import { PermissionAction } from "@/config/permissions";
import { useCan } from "@/hooks/use-can";
import { cn } from "@/lib/utils";
import { getApiErrorMessage, getInitials } from "@/lib/user-utils";
import { emptyUserForm, roleOptions } from "@/types/user-management";
import type { UserFormValues } from "@/types/user-management";
import type { CreateUserData } from "@/types/user";

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/;

export default function CreateUserPage() {
  const router = useRouter();
  const toast = useGlassToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const {
    can,
    isError: isProfileError,
    isLoading: isProfileLoading,
    role,
  } = useCan();
  const actorLevel =
    roleOptions.find((option) => option.value === role)?.level ?? 0;
  const assignableRoles = roleOptions.filter(
    (option) => option.level < actorLevel,
  );
  const canCreate =
    can(PermissionAction.CreateUser) && can(PermissionAction.AssignUserRole);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<UserFormValues>({
    defaultValues: {
      ...emptyUserForm,
      role: assignableRoles[assignableRoles.length - 1]?.value ?? "Editor",
    },
  });
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const previewName =
    [firstName, lastName].filter(Boolean).join(" ") || "Новый пользователь";

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const mutation = useMutation({
    mutationFn: (data: CreateUserData) => createUser(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Пользователь создан");
      router.push("/users");
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });

  const updatePhoto = (file: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const nextPreviewUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextPreviewUrl;
    setPhotoFile(file);
    setPhotoPreviewUrl(nextPreviewUrl);
  };

  const acceptPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Выберите изображение в формате JPG, PNG или WebP.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      toast.error("Размер изображения не должен превышать 10 МБ.");
      return;
    }
    updatePhoto(file);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (mutation.isPending) return;
    acceptPhoto(event.dataTransfer.files?.[0]);
  };

  const onSubmit = (values: UserFormValues) => {
    const selectedRole = roleOptions.find(
      (option) => option.value === values.role,
    );
    if (
      !can(PermissionAction.CreateUser) ||
      !can(PermissionAction.AssignUserRole) ||
      !selectedRole ||
      selectedRole.level >= actorLevel
    ) {
      toast.error("Недостаточно прав для создания пользователя с этой ролью.");
      return;
    }

    const data: CreateUserData = {
      userName: values.userName.trim(),
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      middleName: values.middleName.trim(),
      lastName: values.lastName.trim(),
      role: values.role,
      password: values.password,
      ...(photoFile ? { photo: photoFile } : {}),
    };
    mutation.mutate(data);
  };

  if (isProfileLoading) {
    return (
      
      <GlassPanel
        aria-label="Проверка прав доступа"
        aria-busy="true"
        className="min-h-72 p-6"
      >
        <GlassSkeleton variant="block" className="h-7 w-56" />
        <GlassSkeleton variant="block" className="mt-6 h-48 w-full" />
      </GlassPanel>
    );
  }

  if (!canCreate || !assignableRoles.length) {
    return (
      <GlassAlert tone="danger" className="flex items-start gap-3 p-5">
        <CircleAlert className="mt-0.5 size-5 shrink-0" />
        <div>
          <h2 className="font-semibold">Нет доступа</h2>
          <p className="mt-1 text-sm">
            {isProfileError
              ? "Не удалось проверить ваши права доступа."
              : "У вас нет разрешения создавать пользователей или назначать им роли."}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/users")}
            className="mt-4"
          >
            <ArrowLeft className="size-4" />К списку пользователей
          </Button>
        </div>
      </GlassAlert>
    );
  }

  return (
    <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
    <GlassPanel className="flex min-h-0 flex-1 flex-col gap-4 p-4 max-xl:overflow-y-auto">
      {/* Шапка */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <GlassAvatar
            alt={previewName}
            name={previewName}
            src={photoPreviewUrl ?? undefined}
            size="lg"
            className="size-12 shrink-0 border border-border"
            fallback={
              getInitials(previewName) || <UserRound className="size-5" />
            }
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {previewName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Заполните данные профиля и настройте доступ
            </p>
          </div>
          <GlassBadge tone="green">Новая учетная запись</GlassBadge>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/users")}
          className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="size-4" />
          Назад к списку
        </Button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.8fr)] xl:grid-rows-1"
      >
        {/* Левая колонка */}
        <div className="flex min-h-0 flex-col gap-4">
          <GlassPanel className="p-5 xl:flex-1">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserRound className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">Личные данные</h2>
                <p className="text-xs text-muted-foreground">
                  Укажите имя и контактную информацию
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormInput<UserFormValues>
                  control={control}
                  name="firstName"
                  label="Имя"
                  autoComplete="given-name"
                  placeholder="Введите имя"
                  rules={{
                    required: "Введите имя.",
                    minLength: {
                      value: 2,
                      message: "Имя должно содержать не менее 2 символов.",
                    },
                  }}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <FormInput<UserFormValues>
                  control={control}
                  name="lastName"
                  label="Фамилия"
                  autoComplete="family-name"
                  placeholder="Введите фамилию"
                  rules={{
                    required: "Введите фамилию.",
                    minLength: {
                      value: 2,
                      message: "Фамилия должна содержать не менее 2 символов.",
                    },
                  }}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
              <FormInput<UserFormValues>
                control={control}
                name="middleName"
                label="Отчество"
                autoComplete="additional-name"
                placeholder="Необязательно"
              />
              <div>
                <FormInput<UserFormValues>
                  control={control}
                  name="email"
                  label="Электронная почта"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  rules={{
                    required: "Введите электронную почту.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Введите корректный адрес электронной почты.",
                    },
                  }}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="p-5 xl:flex-1">
            <div className="mb-4 flex items-center gap-3 border-b border-border pb-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-foreground">
                  Учетная запись
                </h2>
                <p className="text-xs text-muted-foreground">
                  Логин, роль и пароль для входа в систему
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <FormInput<UserFormValues>
                  control={control}
                  name="userName"
                  label="Имя пользователя"
                  autoComplete="username"
                  placeholder="Латиница, цифры, . _ -"
                  maxLength={50}
                  rules={{
                    required: "Введите имя пользователя.",
                    minLength: { value: 3, message: "Минимум 3 символа." },
                    maxLength: { value: 50, message: "Максимум 50 символов." },
                    pattern: {
                      value: USERNAME_PATTERN,
                      message:
                        "Используйте латинские буквы, цифры, точку, дефис или подчеркивание.",
                    },
                  }}
                />
                {errors.userName && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.userName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Роль пользователя
                </label>
                <Controller
                  control={control}
                  name="role"
                  rules={{ required: "Выберите роль пользователя." }}
                  render={({ field }) => (
                    <GlassSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <GlassSelectTrigger
                        aria-label="Роль пользователя"
                        className="h-10 w-full"
                      >
                        <GlassSelectValue placeholder="Выберите роль" />
                      </GlassSelectTrigger>
                      <GlassSelectContent>
                        {assignableRoles.map((option) => (
                          <GlassSelectItem
                            key={option.value}
                            value={option.value}
                          >
                            {option.label}
                          </GlassSelectItem>
                        ))}
                      </GlassSelectContent>
                    </GlassSelect>
                  )}
                />
                {errors.role && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.role.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <FormInput<UserFormValues>
                  control={control}
                  name="password"
                  label="Первоначальный пароль"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Не менее 8 символов"
                  rules={{
                    required: "Задайте пароль пользователя.",
                    minLength: {
                      value: 8,
                      message: "Пароль должен содержать не менее 8 символов.",
                    },
                  }}
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Правая колонка */}
        <div className="flex min-h-0 flex-col gap-4">
          <GlassPanel
            preset="showcase"
            refraction="soft"
            className="p-5 xl:flex-1"
          >
            <section className="flex flex-col items-center justify-center text-center xl:h-full">
              <h2 className="font-semibold text-foreground">Фото профиля</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Нажмите на фото или перетащите файл
              </p>

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

              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault(); // без этого drop не сработает
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                aria-label="Выбрать фото: нажмите или перетащите файл"
                className={cn(
                  "group relative my-4 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-ring",
                  isDragging &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <GlassAvatar
                  alt={`Фото профиля: ${previewName}`}
                  name={previewName}
                  src={photoPreviewUrl ?? undefined}
                  size="xl"
                  className="pointer-events-none size-28 border border-border xl:size-32"
                  fallback={
                    getInitials(previewName) || (
                      <UserRound className="size-10" />
                    )
                  }
                />
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/55 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                    isDragging && "opacity-100",
                  )}
                >
                  <Camera className="size-6" />
                  {isDragging
                    ? "Отпустите файл"
                    : photoFile
                      ? "Заменить фото"
                      : "Выбрать фото"}
                </span>
              </button>

              <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-left">
                <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                <span
                  title={photoFile?.name}
                  className="min-w-0 flex-1 break-all text-sm font-medium text-foreground"
                >
                  {photoFile?.name ?? "Фото не добавлено"}
                </span>
                {photoFile && (
                  <button
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() => updatePhoto(null)}
                    aria-label="Убрать выбранное фото"
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                JPG, PNG или WebP · до 10 МБ
              </p>
            </section>
          </GlassPanel>

          <GlassPanel className="shrink-0 space-y-3 p-5">
            <p className="text-sm text-muted-foreground">
              Пользователь сможет войти в систему сразу после создания.
            </p>
            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row xl:flex-col">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <UserRoundPlus className="size-4" />
                    Создать пользователя
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={mutation.isPending}
                onClick={() => router.push("/users")}
                className="w-full border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Отмена
              </Button>
            </div>
          </GlassPanel>
        </div>
      </form>
    </GlassPanel>
    </motion.div>
  );
}
