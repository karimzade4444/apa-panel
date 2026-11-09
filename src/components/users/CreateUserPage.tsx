"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Camera,
  CircleAlert,
  LoaderCircle,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { createUser } from "@/api/users";
import { Button } from "@/components/ui/button";
import {
  GlassAlert,
  GlassAvatar,
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
import { getApiErrorMessage } from "@/lib/user-utils";
import {
  emptyUserForm,
  roleOptions,
} from "@/types/user-management";
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
  const { can, isError: isProfileError, isLoading: isProfileLoading, role } =
    useCan();
  const actorLevel =
    roleOptions.find((option) => option.value === role)?.level ?? 0;
  const assignableRoles = roleOptions.filter(
    (option) => option.level < actorLevel,
  );
  const canCreate =
    can(PermissionAction.CreateUser) &&
    can(PermissionAction.AssignUserRole);
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
            <ArrowLeft className="size-4" />
            К списку пользователей
          </Button>
        </div>
      </GlassAlert>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="mx-auto max-w-6xl space-y-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <UserRoundPlus className="size-4" />
              Новая учетная запись
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Заполните данные профиля, настройте доступ и при необходимости
              добавьте фото.
            </p>
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
          className="min-w-0"
        >
          <GlassPanel preset="showcase" refraction="soft" className="p-4 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
              <section className="space-y-3">
                <div>
                  <h2 className="font-semibold text-foreground">Фото профиля</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG, PNG или WebP · до 10 МБ
                  </p>
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
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Нажмите, чтобы выбрать фото пользователя"
                  className="group relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted transition hover:border-primary/60 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                  {photoPreviewUrl ? (
                    <Image
                      src={photoPreviewUrl}
                      alt={`Предпросмотр фото: ${previewName}`}
                      fill
                      unoptimized
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <GlassAvatar
                      alt={`Инициалы: ${previewName}`}
                      name={previewName}
                      size="xl"
                      className="size-24 border border-border text-primary"
                      fallback={<UserRound className="size-9" />}
                    />
                  )}
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-background/80 px-2 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
                    <Camera className="size-4" />
                    {photoFile ? "Заменить фото" : "Выбрать фото"}
                  </span>
                </button>
                <p className="truncate text-center text-xs text-muted-foreground">
                  {photoFile?.name ?? "Нажмите на фото"}
                </p>
                {photoFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={mutation.isPending}
                    onClick={() => updatePhoto(null)}
                    className="w-full text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Убрать фото
                  </Button>
                )}
              </section>

              <div className="min-w-0">
              <div className="mb-5 flex items-center gap-3 border-b border-border pb-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-foreground">Данные пользователя</h2>
                  <p className="text-xs text-muted-foreground">
                    Учетная запись, личные данные и права доступа
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                  <FormInput<UserFormValues>
                    control={control}
                    name="userName"
                    label="Имя пользователя"
                    autoComplete="username"
                    placeholder="Латиница, цифры, . _ -"
                    maxLength={50}
                    rules={{
                      required: "Введите имя пользователя.",
                      minLength: {
                        value: 3,
                        message: "Минимум 3 символа.",
                      },
                      maxLength: {
                        value: 50,
                        message: "Максимум 50 символов.",
                      },
                      pattern: {
                        value: USERNAME_PATTERN,
                        message:
                          "Используйте латинские буквы, цифры, точку, дефис или подчеркивание.",
                      },
                    }}
                  />
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
                  <FormInput<UserFormValues>
                    control={control}
                    name="middleName"
                    label="Отчество"
                    autoComplete="additional-name"
                    placeholder="Необязательно"
                  />

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
                          className="w-full"
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
                  </div>
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
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={mutation.isPending}
                  onClick={() => router.push("/users")}
                  className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="min-w-44"
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
              </div>
              </div>
            </div>
          </GlassPanel>
        </form>
      </div>
    </div>
  );
}
