"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Ban,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Eye,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { isAxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createUser,
  deleteUser,
  getUsers,
  setUserBlocked,
  updateUser,
  type CreateUserData,
  type UserWriteData,
} from "@/api/requests/users";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import FormInput from "@/components/ui/forminput";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/cookies";
import type { User } from "@/types/userstypes";

const emptyUsers: User[] = [];
const roleOptions = [
  { value: "SuperAdmin", label: "Суперадминистратор", level: 3 },
  { value: "Admin", label: "Администратор", level: 2 },
  { value: "Editor", label: "Редактор", level: 1 },
] as const;

type UserRole = (typeof roleOptions)[number]["value"];
type UserFormValues = Omit<UserWriteData, "fullName" | "password"> & {
  password: string;
};

const emptyForm: UserFormValues = {
  userName: "",
  email: "",
  firstName: "",
  lastName: "",
  middleName: "",
  role: "Editor",
  password: "",
};

function getActorRole(claims: Record<string, unknown> | null): UserRole | null {
  const roleClaim =
    claims?.role ??
    claims?.Role ??
    claims?.roles ??
    claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const claimsList = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
  let actorRole: UserRole | null = null;
  for (const claim of claimsList) {
    if (typeof claim !== "string") continue;
    const normalized = claim.toLowerCase().replace(/[^a-z]/g, "");
    const role = roleOptions.find(
      (option) => option.value.toLowerCase() === normalized,
    );
    if (
      role &&
      role.level >
        (roleOptions.find((option) => option.value === actorRole)?.level ?? 0)
    ) {
      actorRole = role.value;
    }
  }
  return actorRole;
}

function getRoleLevel(roleValue: string) {
  const normalized = roleValue.toLowerCase().replace(/[^a-z]/g, "");
  return (
    roleOptions.find((role) => role.value.toLowerCase() === normalized)?.level ??
    0
  );
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const responseData: unknown = error.response?.data;
    if (
      responseData &&
      typeof responseData === "object" &&
      "errors" in responseData &&
      responseData.errors &&
      typeof responseData.errors === "object"
    ) {
      const validationMessages = Object.values(responseData.errors)
        .flatMap((fieldErrors) =>
          Array.isArray(fieldErrors)
            ? fieldErrors.flatMap((fieldError) =>
                fieldError &&
                typeof fieldError === "object" &&
                "message" in fieldError &&
                typeof fieldError.message === "string"
                  ? [fieldError.message]
                  : [],
              )
            : [],
        )
        .filter((message, index, messages) => messages.indexOf(message) === index);
      if (validationMessages.length) return validationMessages.join(" ");
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "message" in responseData &&
      typeof responseData.message === "string" &&
      responseData.message.trim()
    ) {
      return responseData.message;
    }
    if (
      responseData &&
      typeof responseData === "object" &&
      "detail" in responseData &&
      typeof responseData.detail === "string" &&
      responseData.detail.trim()
    ) {
      return responseData.detail;
    }
    if (!error.response) return "Не удалось связаться с сервером.";
    return `Ошибка сервера (${error.response.status}).`;
  }
  return "Не удалось выполнить операцию.";
}

function getUserName(user: User) {
  return (
    user.fullName ||
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.userName
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru-RU") ?? "")
    .join("");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatRole(role: string) {
  return role.replace(/[_-]+/g, " ").trim() || "Не указана";
}

function UserAvatar({ user, size = "md" }: { user: User; size?: "md" | "lg" }) {
  const name = getUserName(user);
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-[#d4af62]/30 to-sky-400/20 font-semibold text-[#f2d99b] ${
        size === "lg" ? "size-14 text-sm" : "size-9 text-xs"
      }`}
    >
      {getInitials(name) || <UserRound className="size-4" />}
    </span>
  );
}

function UserStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof UsersRound;
  tone: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-white/55 sm:text-sm">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function UserDetails({
  user,
  onClose,
  reduceMotion,
  onEdit,
  onToggleBlocked,
  onDelete,
  isPending,
  canManageActions,
}: {
  user: User;
  onClose: () => void;
  reduceMotion: boolean;
  onEdit: () => void;
  onToggleBlocked: () => void;
  onDelete: () => void;
  isPending: boolean;
  canManageActions: boolean;
}) {
  const details = [
    { icon: ShieldCheck, label: "Роль", value: formatRole(user.role) },
    {
      icon: CalendarDays,
      label: "Зарегистрирован",
      value: formatDate(user.createdAt),
    },
    {
      icon: user.isBlocked ? UserRoundX : UserRoundCheck,
      label: "Статус",
      value: user.isBlocked ? "Заблокирован" : "Активен",
    },
  ];

  return (
    <motion.aside
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 16, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="glass-panel h-fit rounded-2xl p-5 xl:sticky xl:top-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <UserAvatar user={user} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-white">{getUserName(user)}</h2>
            <p className="mt-1 truncate text-xs text-white/50">
              ID: {user.id}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Закрыть сведения о пользователе"
          onClick={onClose}
          className="shrink-0 text-white/50 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-5 space-y-4 border-t border-white/10 pt-4">
        <div>
          <p className="text-xs text-white/45">Email</p>
          <p className="mt-1 break-all text-sm text-white/85">
            {user.email || "Не указан"}
          </p>
        </div>
        {details.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-[#e4c477]" />
            <div className="min-w-0">
              <p className="text-xs text-white/45">{label}</p>
              <p className="mt-1 text-sm text-white/85">{value}</p>
            </div>
          </div>
        ))}
      </div>
      {canManageActions && (
        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onEdit}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            <Pencil className="size-4" />
            Изменить
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onToggleBlocked}
            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            {user.isBlocked ? (
              <Check className="size-4" />
            ) : (
              <Ban className="size-4" />
            )}
            {user.isBlocked ? "Разблокировать" : "Заблокировать"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onDelete}
            className="col-span-2"
          >
            <Trash2 className="size-4" />
            Удалить пользователя
          </Button>
        </div>
      )}
    </motion.aside>
  );
}

export default function UsersPage() {
  const shouldReduceMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const { control, handleSubmit, reset, setValue } = useForm<UserFormValues>({
    defaultValues: emptyForm,
  });
  const formRole = useWatch({ control, name: "role" });

  const { data: profileClaims } = useQuery({
    queryKey: ["auth-profile"],
    queryFn: () => {
      const token = getAccessToken();
      return token ? jwtDecode<Record<string, unknown>>(token) : null;
    },
    retry: false,
    staleTime: Infinity,
  });
  const actorRole = getActorRole(profileClaims ?? null);
  const actorLevel =
    roleOptions.find((role) => role.value === actorRole)?.level ?? 0;
  const assignableRoles = roleOptions.filter(
    (role) => role.level < actorLevel,
  );
  const canManageUsers = actorRole === "SuperAdmin" || actorRole === "Admin";

  const refreshUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });
  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => createUser(data),
    onSuccess: async () => {
      await refreshUsers();
      setFormMode(null);
      toast.success("Пользователь создан");
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserWriteData }) =>
      updateUser(id, data),
    onSuccess: async () => {
      await refreshUsers();
      setFormMode(null);
      toast.success("Данные пользователя обновлены");
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });
  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      setUserBlocked(id, isBlocked),
    onSuccess: async (_, variables) => {
      await refreshUsers();
      toast.success(
        variables.isBlocked ? "Пользователь заблокирован" : "Пользователь разблокирован",
      );
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await refreshUsers();
      setSelectedId(null);
      toast.success("Пользователь удалён");
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    blockMutation.isPending ||
    deleteMutation.isPending;

  const openCreateForm = () => {
    reset({
      ...emptyForm,
      role: assignableRoles[assignableRoles.length - 1]?.value ?? "Editor",
    });
    setFormMode("create");
  };
  const openEditForm = (user: User) => {
    const editableRoles = roleOptions.filter(
      (role) => role.level < actorLevel || role.value === user.role,
    );
    reset({
      userName: user.userName,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      role: editableRoles.some((role) => role.value === user.role)
        ? (user.role as UserRole)
        : (editableRoles[editableRoles.length - 1]?.value ?? "Editor"),
      password: "",
    });
    setFormMode("edit");
  };
  const handleUserFormSubmit = (values: UserFormValues) => {
    const roleLevel = getRoleLevel(values.role);
    if (
      !canManageUsers ||
      (formMode === "create" && roleLevel >= actorLevel) ||
      (formMode === "edit" && roleLevel > actorLevel)
    ) {
      toast.error("Недостаточно прав для назначения этой роли.");
      return;
    }
    const { password, ...userData } = values;
    const fullName = [
      values.firstName.trim(),
      values.middleName.trim(),
      values.lastName.trim(),
    ]
      .filter(Boolean)
      .join(" ");
    const data: UserWriteData = {
      ...userData,
      fullName,
      ...(password ? { password } : {}),
    };
    if (formMode === "create") {
      if (!password) {
        toast.error("Укажите пароль пользователя.");
        return;
      }
      const createData: CreateUserData = {
        userName: data.userName,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        role: data.role,
        password,
      };
      createMutation.mutate(createData);
    } else if (formMode === "edit" && selectedUser) {
      updateMutation.mutate({ id: selectedUser.id, data });
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["users", debouncedSearch],
    queryFn: () => getUsers(debouncedSearch),
    enabled: canManageUsers,
  });

  const users = data?.items ?? emptyUsers;
  const roles = useMemo(
    () => Array.from(new Set(users.map((user) => user.role).filter(Boolean))),
    [users],
  );
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && !user.isBlocked) ||
      (statusFilter === "blocked" && user.isBlocked);
    return matchesRole && matchesStatus;
  });
  const selectedUser =
    filteredUsers.find((user) => user.id === selectedId) ?? null;
  const activeCount = users.filter((user) => !user.isBlocked).length;
  const blockedCount = users.length - activeCount;
  const adminCount = users.filter((user) => /admin/i.test(user.role)).length;
  const canManageSelectedUser =
    !!selectedUser &&
    canManageUsers &&
    getRoleLevel(selectedUser.role) < actorLevel;
  const formRoleOptions =
    formMode === "create"
      ? assignableRoles
      : roleOptions.filter(
          (role) =>
            role.level < actorLevel || role.value === selectedUser?.role,
        );

  const handleDeleteSelectedUser = () => {
    if (!selectedUser) return;
    if (window.confirm(`Удалить пользователя «${getUserName(selectedUser)}»?`)) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  if (!canManageUsers) {
    return (
      <AdminShell
        title="Пользователи"
        description="Управление пользователями системы"
        fitViewport
      >
        <section
          role="alert"
          className="glass-panel flex min-h-48 items-center justify-center rounded-2xl p-6 text-center"
        >
          <div>
            <ShieldCheck className="mx-auto size-8 text-[#e4c477]" />
            <h2 className="mt-3 font-semibold text-white">Нет доступа</h2>
            <p className="mt-1 text-sm text-white/55">
              Раздел пользователей доступен только администраторам.
            </p>
          </div>
        </section>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      title="Пользователи"
      description="Управление пользователями системы"
      fitViewport
    >
      <div className="space-y-5 lg:grid lg:min-h-0 lg:flex-1 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4 lg:space-y-0">
        <div className="space-y-3">
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4"
          >
            <UserStat
              label="Всего пользователей"
              value={data ? data.total.toLocaleString("ru-RU") : isLoading ? "—" : "0"}
              icon={UsersRound}
              tone="bg-sky-300/10 text-sky-200"
            />
            <UserStat
              label="Активны в списке"
              value={isLoading ? "—" : activeCount.toLocaleString("ru-RU")}
              icon={UserRoundCheck}
              tone="bg-emerald-300/10 text-emerald-200"
            />
            <UserStat
              label="Администраторы в списке"
              value={isLoading ? "—" : adminCount.toLocaleString("ru-RU")}
              icon={ShieldCheck}
              tone="bg-amber-300/10 text-[#f2d99b]"
            />
            <UserStat
              label="Заблокированы в списке"
              value={isLoading ? "—" : blockedCount.toLocaleString("ru-RU")}
              icon={UserRoundX}
              tone="bg-rose-300/10 text-rose-200"
            />
          </motion.div>

          {isError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100"
            >
              <span className="flex items-center gap-2">
                <CircleAlert className="size-4" />
                Не удалось загрузить список пользователей.
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={isRefetching}
                onClick={() => void refetch()}
                className="border-rose-200/20 bg-white/5 text-white hover:bg-white/10"
              >
                {isRefetching ? "Загрузка..." : "Повторить"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid min-h-0 gap-5 lg:grid-rows-[minmax(0,1fr)] 2xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="glass-panel flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:p-5 xl:flex-row xl:items-center">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Поиск по имени, email или ID..."
                  aria-label="Поиск пользователей"
                  className="h-10 border-white/10 bg-white/[0.05] pl-10 text-sm text-white placeholder:text-white/40 focus-visible:border-[#d4af62]/50 focus-visible:ring-[#d4af62]/20"
                />
              </label>
              <div className="grid grid-cols-2 gap-2 xl:w-[290px]">
                <label className="relative">
                  <span className="sr-only">Фильтр по роли</span>
                  <select
                    value={roleFilter}
                    onChange={(event) => setRoleFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-[#102b46]/80 py-2 pl-3 pr-9 text-xs text-white outline-none transition focus:border-[#d4af62]/50"
                  >
                    <option value="all" className="bg-[#102b46]">
                      Все роли
                    </option>
                    {roles.map((role) => (
                      <option key={role} value={role} className="bg-[#102b46]">
                        {formatRole(role)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-white/45" />
                </label>
                <label className="relative">
                  <span className="sr-only">Фильтр по статусу</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-white/10 bg-[#102b46]/80 py-2 pl-3 pr-9 text-xs text-white outline-none transition focus:border-[#d4af62]/50"
                  >
                    <option value="all" className="bg-[#102b46]">
                      Все статусы
                    </option>
                    <option value="active" className="bg-[#102b46]">
                      Активные
                    </option>
                    <option value="blocked" className="bg-[#102b46]">
                      Заблокированные
                    </option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-white/45" />
                </label>
              </div>
              {canManageUsers && (
                <Button
                  type="button"
                  disabled={!assignableRoles.length}
                  onClick={openCreateForm}
                  className="h-10 shrink-0 bg-[#e1bb6e] text-[#10243a] hover:bg-[#f2d18a]"
                >
                  <Plus className="size-4" />
                  Добавить пользователя
                </Button>
              )}
            </div>

            <div className="scrollbar-none min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/45">
                    <th scope="col" className="px-5 py-3 font-medium">Пользователь</th>
                    <th scope="col" className="px-4 py-3 font-medium">Email</th>
                    <th scope="col" className="px-4 py-3 text-center font-medium">Роль</th>
                    <th scope="col" className="px-4 py-3 text-center font-medium">Статус</th>
                    <th scope="col" className="px-4 py-3 font-medium">Регистрация</th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">Детали</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.07]">
                  {isLoading ? (
                    Array.from({ length: 5 }, (_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 6 }, (_, cell) => (
                          <td key={cell} className="px-4 py-4">
                            <span className="block h-4 animate-pulse rounded bg-white/[0.08]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredUsers.length ? (
                    filteredUsers.map((user) => {
                      const isSelected = selectedUser?.id === user.id;
                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors hover:bg-white/[0.04] ${
                            isSelected ? "bg-white/[0.05]" : ""
                          }`}
                        >
                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              aria-expanded={isSelected}
                              onClick={() =>
                                setSelectedId((current) =>
                                  current === user.id ? null : user.id,
                                )
                              }
                              className="flex items-center gap-3 text-left"
                            >
                              <UserAvatar user={user} />
                              <div className="min-w-0">
                                <p className="max-w-[190px] truncate font-medium text-white/90">
                                  {getUserName(user)}
                                </p>
                                <p className="mt-0.5 text-[0.7rem] text-white/40">
                                  ID: {user.id}
                                </p>
                              </div>
                            </button>
                          </td>
                          <td className="max-w-[200px] truncate px-4 py-3.5 text-xs text-white/65">
                            {user.email || "—"}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="mx-auto inline-flex max-w-[150px] items-center truncate rounded-full border border-sky-200/15 bg-sky-300/10 px-2.5 py-1 text-[0.7rem] text-sky-100">
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`mx-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] ${
                                user.isBlocked
                                  ? "border-rose-300/20 bg-rose-300/10 text-rose-200"
                                  : "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                              }`}
                            >
                              <span
                                className={`size-1.5 rounded-full ${
                                  user.isBlocked ? "bg-rose-300" : "bg-emerald-300"
                                }`}
                              />
                              {user.isBlocked ? "Заблокирован" : "Активен"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3.5 text-xs text-white/60">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Подробнее: ${getUserName(user)}`}
                              aria-pressed={isSelected}
                              onClick={() =>
                                setSelectedId((current) =>
                                  current === user.id ? null : user.id,
                                )
                              }
                              aria-expanded={isSelected}
                              className="text-white/55 hover:bg-white/10 hover:text-[#f2d99b]"
                            >
                              <Eye className="size-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-white/[0.06] text-white/45">
                          <UsersRound className="size-5" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-white/80">
                          Пользователи не найдены
                        </p>
                        <p className="mt-1 text-xs text-white/45">
                          Измените запрос или выберите другие фильтры.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-5 py-3 text-xs text-white/45">
              <span>
                Показано {filteredUsers.length} из{" "}
                {data?.total.toLocaleString("ru-RU") ?? "—"} пользователей
              </span>
              <span>
                {data && data.total > users.length
                  ? `Список API загружен: ${users.length} записей`
                  : "Все найденные записи"}
              </span>
            </div>
          </section>

          <AnimatePresence>
            {selectedUser && (
              <UserDetails
                key={selectedUser.id}
                user={selectedUser}
                onClose={() => setSelectedId(null)}
                reduceMotion={shouldReduceMotion ?? false}
                canManageActions={canManageSelectedUser}
                isPending={isMutating}
                onEdit={() => openEditForm(selectedUser)}
                onToggleBlocked={() =>
                  blockMutation.mutate({
                    id: selectedUser.id,
                    isBlocked: !selectedUser.isBlocked,
                  })
                }
                onDelete={handleDeleteSelectedUser}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {formMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020d18]/75 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !isMutating) {
                setFormMode(null);
              }
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="user-form-title"
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="glass-panel max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-2xl p-5 sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 id="user-form-title" className="text-lg font-semibold text-white">
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
                  onClick={() => setFormMode(null)}
                  className="text-white/60 hover:bg-white/10 hover:text-white"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <form onSubmit={handleSubmit(handleUserFormSubmit)} className="space-y-4">
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
                      onChange={(event) =>
                        setValue("role", event.target.value, {
                          shouldDirty: true,
                        })
                      }
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
                    Пароль{formMode === "edit" ? " (оставьте пустым, чтобы не менять)" : ""}
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
                      className="border-white/10 bg-white/[0.05] text-white placeholder:text-white/40"
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={isMutating}
                    onClick={() => setFormMode(null)}
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
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
