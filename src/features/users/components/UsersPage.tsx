"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronDown,
  CircleAlert,
  Eye,
  Plus,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
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
import { Input } from "@/components/ui/input";
import {
  getActorIdentifiers,
  getEffectiveRole,
  type AccessTokenClaims,
} from "@/lib/auth/claims";
import { getAccessToken } from "@/lib/cookies";
import {
  formatDate,
  formatRole,
  getApiErrorMessage,
  getRoleLevel,
  getUserName,
  isCurrentUser,
} from "@/features/users/lib/user-utils";
import { UserAvatar } from "@/features/users/components/UserAvatar";
import { UserDetailsPanel } from "@/features/users/components/UserDetailsPanel";
import { UserFormDialog } from "@/features/users/components/UserFormDialog";
import { UserStatCard } from "@/features/users/components/UserStatCard";
import { emptyUserForm, roleOptions } from "@/features/users/types/user-management";
import type {
  UserFormValues,
  UserRole,
} from "@/features/users/types/user-management";
import type { User } from "@/types/userstypes";

const emptyUsers: User[] = [];

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
    defaultValues: emptyUserForm,
  });
  const formRole = useWatch({ control, name: "role" });

  const { data: profileClaims } = useQuery({
    queryKey: ["auth-profile"],
    queryFn: () => {
      const token = getAccessToken();
      return token ? jwtDecode<AccessTokenClaims>(token) : null;
    },
    retry: false,
    staleTime: Infinity,
  });
  const actorRole = getEffectiveRole(profileClaims ?? null);
  const actorLevel =
    roleOptions.find((role) => role.value === actorRole)?.level ?? 0;
  const assignableRoles = roleOptions.filter(
    (role) => role.level < actorLevel,
  );
  const canManageUsers = actorRole === "SuperAdmin" || actorRole === "Admin";
  const canViewUsers = canManageUsers || actorRole === "Editor";
  const actorIdentifiers = getActorIdentifiers(profileClaims ?? null);

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
      ...emptyUserForm,
      role: assignableRoles[assignableRoles.length - 1]?.value ?? "Editor",
    });
    setFormMode("create");
  };
  const openEditForm = (user: User) => {
    if (isCurrentUser(user, actorIdentifiers)) {
      toast.error("Нельзя изменять собственную учетную запись.");
      return;
    }
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
      (formMode === "edit" &&
        !!selectedUser &&
        isCurrentUser(selectedUser, actorIdentifiers)) ||
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
    enabled: canViewUsers,
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
    !isCurrentUser(selectedUser, actorIdentifiers) &&
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

  if (!canViewUsers) {
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
              Нет доступа к просмотру пользователей.
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
            <UserStatCard
              label="Всего пользователей"
              value={data ? data.total.toLocaleString("ru-RU") : isLoading ? "—" : "0"}
              icon={UsersRound}
              tone="bg-sky-300/10 text-sky-200"
            />
            <UserStatCard
              label="Активны в списке"
              value={isLoading ? "—" : activeCount.toLocaleString("ru-RU")}
              icon={UserRoundCheck}
              tone="bg-emerald-300/10 text-emerald-200"
            />
            <UserStatCard
              label="Администраторы в списке"
              value={isLoading ? "—" : adminCount.toLocaleString("ru-RU")}
              icon={ShieldCheck}
              tone="bg-amber-300/10 text-[#f2d99b]"
            />
            <UserStatCard
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

        <div
          style={
            {
              "--user-details-width": selectedUser ? "280px" : "0px",
              "--user-details-gap": selectedUser ? "1rem" : "0px",
            } as CSSProperties
          }
          className="grid min-h-0 grid-cols-1 gap-y-4 transition-[grid-template-columns,column-gap] duration-300 ease-out lg:grid-rows-[minmax(0,1fr)] xl:gap-x-[var(--user-details-gap)] xl:grid-cols-[minmax(0,1fr)_var(--user-details-width)]"
        >
          <section className="glass-panel flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl xl:col-start-1 xl:row-start-1">
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

          <AnimatePresence initial={false}>
            {selectedUser && (
              <UserDetailsPanel
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
          <UserFormDialog
            formMode={formMode}
            formRole={formRole}
            formRoleOptions={formRoleOptions}
            control={control}
            isMutating={isMutating}
            onClose={() => setFormMode(null)}
            onRoleChange={(role) => setValue("role", role, { shouldDirty: true })}
            onSubmit={handleSubmit(handleUserFormSubmit)}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
