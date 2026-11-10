"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CircleAlert,
  ImageIcon,
  LoaderCircle,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Controller, useForm } from "react-hook-form";

import { getUser, updateUser } from "@/api/users";
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
import { getActorIdentifiers } from "@/lib/auth";
import { resolveApiAssetUrl } from "@/lib/api-assets";
import { cn } from "@/lib/utils";
import {
  formatRole,
  getApiErrorMessage,
  getInitials,
  getRoleLevel,
  getUserName,
  isCurrentUser,
} from "@/lib/user-utils";
import { roleOptions } from "@/types/user-management";
import type { UserFormValues } from "@/types/user-management";
import type { UserWriteData } from "@/types/user";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const USERNAME_PATTERN = /^[A-Za-z0-9._-]{3,50}$/;

interface EditUserPageProps {
  userId: string;
}

export default function EditUserPage({ userId }: EditUserPageProps) {
  const router = useRouter();
  const toast = useGlassToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const {
    can,
    claims,
    isError: isProfileError,
    isLoading: isProfileLoading,
    role,
  } = useCan();
  const actorLevel =
    roleOptions.find((option) => option.value === role)?.level ?? 0;
  const hasEditPermission =
    can(PermissionAction.UpdateUser) && can(PermissionAction.AssignUserRole);
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    defaultValues: {
      userName: "",
      email: "",
      firstName: "",
      lastName: "",
      middleName: "",
      role: "Editor",
      password: "",
    },
  });
  const {
    data: user,
    isError: isUserError,
    isLoading: isUserLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUser(userId),
    enabled: hasEditPermission && !isProfileLoading && !isProfileError,
  });

  useEffect(() => {
    if (!user) return;
    const editableRole = roleOptions.find(
      (option) => option.value === user.role,
    )?.value;
    const availableRoles = roleOptions.filter(
      (option) => option.level < actorLevel,
    );
    reset({
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName ?? "",
      role:
        editableRole ??
        availableRoles[availableRoles.length - 1]?.value ??
        "Editor",
      password: "",
    });
  }, [actorLevel, reset, user]);

  useEffect(
    () => () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    },
    [],
  );

  const editableRoles = roleOptions.filter(
    (option) => option.level < actorLevel || option.value === user?.role,
  );
  const isSelf = user
    ? isCurrentUser(user, getActorIdentifiers(claims))
    : false;
  const canEditThisUser =
    !!user && !isSelf && getRoleLevel(user.role) < actorLevel;

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserWriteData }) =>
      updateUser(id, data),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["users"] }),
        queryClient.invalidateQueries({ queryKey: ["user", userId] }),
      ]);
      toast.success("Данные пользователя обновлены");
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
      toast.error("Размер изображения не должен превышать 5 МБ.");
      return;
    }
    updatePhoto(file);
    setRemovePhoto(false);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (mutation.isPending) return;
    acceptPhoto(event.dataTransfer.files?.[0]);
  };

  const onSubmit = (values: UserFormValues) => {
    if (!user || !canEditThisUser) {
      toast.error("Недостаточно прав для изменения этого пользователя.");
      return;
    }
    const selectedRole = roleOptions.find(
      (option) => option.value === values.role,
    );
    if (
      !can(PermissionAction.UpdateUser) ||
      !can(PermissionAction.AssignUserRole) ||
      !selectedRole ||
      selectedRole.level > actorLevel
    ) {
      toast.error("Недостаточно прав для назначения этой роли.");
      return;
    }

    const fullName = [
      values.firstName.trim(),
      values.middleName.trim(),
      values.lastName.trim(),
    ]
      .filter(Boolean)
      .join(" ");
    const data: UserWriteData = {
      userName: values.userName.trim(),
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      middleName: values.middleName.trim(),
      lastName: values.lastName.trim(),
      fullName,
      role: values.role,
      ...(values.password ? { password: values.password } : {}),
      ...(photoFile ? { photo: photoFile } : {}),
      removePhoto,
    };
    mutation.mutate({ id: user.id, data });
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

  if (isProfileError || !hasEditPermission) {
    return (
      <GlassAlert tone="danger" className="flex items-start gap-3 p-5">
        <CircleAlert className="mt-0.5 size-5 shrink-0" />
        <div>
          <h2 className="font-semibold">Нет доступа</h2>
          <p className="mt-1 text-sm">
            {isProfileError
              ? "Не удалось проверить ваши права доступа."
              : "У вас нет разрешения изменять данные пользователей."}
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

  if (isUserLoading) {
    return (
      <GlassPanel
        aria-label="Загрузка пользователя"
        aria-busy="true"
        className="min-h-72 p-6"
      >
        <GlassSkeleton variant="block" className="h-7 w-64" />
        <GlassSkeleton variant="block" className="mt-6 h-56 w-full" />
      </GlassPanel>
    );
  }

  if (isUserError || !user) {
    return (
      <GlassAlert tone="danger" className="flex items-start gap-3 p-5">
        <CircleAlert className="mt-0.5 size-5 shrink-0" />
        <div>
          <h2 className="font-semibold">Не удалось загрузить пользователя</h2>
          <p className="mt-1 text-sm">
            {userError
              ? getApiErrorMessage(userError)
              : "Пользователь не найден."}
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

  if (!canEditThisUser) {
    return (
      <GlassAlert tone="danger" className="flex items-start gap-3 p-5">
        <CircleAlert className="mt-0.5 size-5 shrink-0" />
        <div>
          <h2 className="font-semibold">Изменение недоступно</h2>
          <p className="mt-1 text-sm">
            Нельзя изменить собственную учетную запись или учетную запись с
            равной либо более высокой ролью.
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

  const originalPhotoUrl = resolveApiAssetUrl(user.photoUrl);
  const photoSource =
    photoPreviewUrl ?? (!removePhoto ? originalPhotoUrl || null : null);
  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const userName =
    [firstName, lastName].filter(Boolean).join(" ") || getUserName(user);

  return (
    // Контейнер на всю высоту <main>. Скролл включается только ниже 1280px,
    // где две колонки физически не помещаются.
    <GlassPanel className="flex min-h-0 flex-1 flex-col gap-4 p-4 max-xl:overflow-y-auto">
      {/* Шапка */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <GlassAvatar
            alt={userName}
            name={userName}
            src={photoSource ?? undefined}
            size="lg"
            className="size-12 shrink-0 border border-border"
            fallback={getInitials(userName) || <UserRound className="size-5" />}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {userName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              ID: {user.id}
            </p>
          </div>
          <GlassBadge tone={user.isBlocked ? "red" : "green"}>
            {user.isBlocked ? "Заблокирован" : "Активен"}
          </GlassBadge>
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
                  Укажите актуальные имя и контактную информацию
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
                        {editableRoles.map((option) => (
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
                  label="Новый пароль"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Оставьте пустым, чтобы не менять пароль"
                  rules={{
                    // Пароль необязателен: проверяем длину, только если он введён
                    validate: (value) =>
                      !value ||
                      value.length >= 8 ||
                      "Пароль должен содержать не менее 8 символов.",
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
                aria-label="Выбрать новое фото пользователя"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) acceptPhoto(file);
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
                  alt={`Фото профиля: ${userName}`}
                  name={userName}
                  src={photoSource ?? undefined}
                  size="xl"
                  className="pointer-events-none size-28 border border-border xl:size-32"
                  fallback={
                    getInitials(userName) || <UserRound className="size-10" />
                  }
                />
                <span
                  className={cn(
                    "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/55 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                    isDragging && "opacity-100",
                  )}
                >
                  <Camera className="size-6" />
                  {isDragging ? "Отпустите файл" : "Изменить фото"}
                </span>
              </button>

              <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-left">
                <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                <span
                  title={photoFile?.name}
                  className="min-w-0 flex-1 break-all text-sm font-medium text-foreground"
                >
                  {photoFile?.name ??
                    (removePhoto
                      ? "Фото будет удалено"
                      : user.photoUrl
                        ? "Текущее фото профиля"
                        : "Фото не добавлено")}
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

              {!photoFile && user.photoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  disabled={mutation.isPending}
                  onClick={() => setRemovePhoto((removed) => !removed)}
                  className="mt-3 w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                  {removePhoto
                    ? "Восстановить текущее фото"
                    : "Удалить текущее фото"}
                </Button>
              ) : null}

              <p className="mt-3 text-xs text-muted-foreground">
                JPG, PNG или WebP · до 5 МБ
              </p>
            </section>
          </GlassPanel>

          <GlassPanel className="shrink-0 space-y-3 p-5">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Текущая роль</span>
              <span className="font-medium text-foreground">
                {formatRole(user.role)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-sm">
              <span className="text-muted-foreground">Статус доступа</span>
              <span className="font-medium text-foreground">
                {user.isBlocked ? "Заблокирован" : "Активен"}
              </span>
            </div>
            <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row xl:flex-col">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Сохранить изменения
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
  );
}
