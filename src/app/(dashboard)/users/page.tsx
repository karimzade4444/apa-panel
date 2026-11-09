"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CircleAlert,
  Eye,
  Search,
  ShieldCheck,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useGlassToast } from "@/components/ui/glassyui/glass-toaster";

import {
  deleteUser,
  getUsers,
  setUserBlocked,
} from "@/api/users";
import { UserStatsSkeleton } from "@/components/skeletons/user-stats-skeleton";
import { UserTableSkeleton } from "@/components/skeletons/user-table-skeleton";
import { PermissionAction } from "@/config/permissions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  GlassAlert,
  GlassBadge,
  GlassPanel,
  GlassPagination,
  GlassScrollArea,
  GlassSelect,
  GlassSelectContent,
  GlassSelectItem,
  GlassSelectTrigger,
  GlassSelectValue,
  GlassSkeleton,
} from "@/components/ui/glassyui";
import { Input } from "@/components/ui/input";
import { useCan } from "@/hooks/use-can";
import { getActorIdentifiers } from "@/lib/auth";
import {
  formatDate,
  formatRole,
  getApiErrorMessage,
  getRoleLevel,
  getUserName,
  isCurrentUser,
} from "@/lib/user-utils";
import { UserAvatar } from "@/components/users/user-avatar";
import { UserDetailsPanel } from "@/components/users/user-details-panel";
import { UserStatCard } from "@/components/users/user-stat-card";
import { roleOptions } from "@/types/user-management";
import type { User } from "@/types/user";

const emptyUsers: User[] = [];
const USER_PAGE_SIZE = 4;

export default function UsersPage() {
  const router = useRouter();
  const toast = useGlassToast();
  const shouldReduceMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusConfirmation, setStatusConfirmation] = useState<{
    user: User;
    isBlocked: boolean;
  } | null>(null);

  const {
    can,
    claims: profileClaims,
    isError: isProfileError,
    isLoading: isProfileLoading,
    role: actorRole,
  } = useCan();
  const actorLevel =
    roleOptions.find((role) => role.value === actorRole)?.level ?? 0;
  const assignableRoles = can(PermissionAction.AssignUserRole)
    ? roleOptions.filter((role) => role.level < actorLevel)
    : [];
  const canCreateUsers =
    can(PermissionAction.CreateUser) &&
    can(PermissionAction.AssignUserRole);
  const canViewUsers = can(PermissionAction.ViewUsers);
  const actorIdentifiers = getActorIdentifiers(profileClaims);

  const refreshUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["users"] });
  const blockMutation = useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      setUserBlocked(id, isBlocked),
    onSuccess: async (_, variables) => {
      await refreshUsers();
      setStatusConfirmation(null);
      toast.success(
        variables.isBlocked
          ? "Пользователь заблокирован"
          : "Пользователь разблокирован",
      );
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      await refreshUsers();
      setSelectedId(null);
      setPage(1);
      toast.success("Пользователь удалён");
    },
    onError: (error: unknown) => toast.error(getApiErrorMessage(error)),
  });
  const isMutating =
    blockMutation.isPending ||
    deleteMutation.isPending;

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300,
    );
    return () => window.clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["users", debouncedSearch, page, USER_PAGE_SIZE],
    queryFn: () => getUsers(debouncedSearch, page, USER_PAGE_SIZE),
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
  const pageSize = data?.pageSize || USER_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const firstUserIndex = data?.total ? (page - 1) * pageSize + 1 : 0;
  const lastUserIndex = Math.min(page * pageSize, data?.total ?? 0);

  const selectedUser =
    filteredUsers.find((user) => user.id === selectedId) ?? null;
  const activeCount = users.filter((user) => !user.isBlocked).length;
  const blockedCount = users.length - activeCount;
  const adminCount = users.filter((user) => /admin/i.test(user.role)).length;
  const canManageSelectedUser =
    !!selectedUser &&
    can(PermissionAction.UpdateUser) &&
    can(PermissionAction.BlockUser) &&
    can(PermissionAction.DeleteUser) &&
    !isCurrentUser(selectedUser, actorIdentifiers) &&
    getRoleLevel(selectedUser.role) < actorLevel;
  const handleDeleteSelectedUser = () => {
    if (!selectedUser || !can(PermissionAction.DeleteUser)) {
      toast.error("Недостаточно прав для удаления пользователя.");
      return;
    }
    if (
      isCurrentUser(selectedUser, actorIdentifiers) ||
      getRoleLevel(selectedUser.role) >= actorLevel
    ) {
      toast.error("Недостаточно прав для удаления этого пользователя.");
      return;
    }
    if (
      window.confirm(`Удалить пользователя «${getUserName(selectedUser)}»?`)
    ) {
      deleteMutation.mutate(selectedUser.id);
    }
  };

  const handleToggleBlocked = (user: User) => {
    if (
      !can(PermissionAction.BlockUser) ||
      isCurrentUser(user, actorIdentifiers) ||
      getRoleLevel(user.role) >= actorLevel
    ) {
      toast.error("Недостаточно прав для изменения статуса пользователя.");
      return;
    }
    setStatusConfirmation({ user, isBlocked: !user.isBlocked });
  };

  const confirmStatusChange = () => {
    if (!statusConfirmation) return;

    const { user, isBlocked } = statusConfirmation;
    if (
      !can(PermissionAction.BlockUser) ||
      isCurrentUser(user, actorIdentifiers) ||
      getRoleLevel(user.role) >= actorLevel
    ) {
      setStatusConfirmation(null);
      toast.error("Недостаточно прав для изменения статуса пользователя.");
      return;
    }

    blockMutation.mutate({ id: user.id, isBlocked });
  };
  const statusConfirmationUserName = statusConfirmation
    ? getUserName(statusConfirmation.user)
    : "";

  if (isProfileLoading) {
    return (
      <GlassPanel
        aria-label="Проверка прав доступа"
        aria-busy="true"
        className="min-h-48 p-6"
      >
        <GlassSkeleton variant="block" className="h-6 w-40" />
        <GlassSkeleton variant="block" className="mt-4 h-20 w-full" />
      </GlassPanel>
    );
  }

  if (!canViewUsers) {
    return (
      <GlassPanel
        role="alert"
        className="flex min-h-48 items-center justify-center p-6 text-center"
      >
        <div>
          <ShieldCheck className="mx-auto size-8 text-primary" />
          <h2 className="mt-3 font-semibold text-foreground">Нет доступа</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isProfileError
              ? "Не удалось проверить права доступа."
              : "Нет доступа к просмотру пользователей."}
          </p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <>
      <div className="space-y-5 lg:grid lg:min-h-0 lg:flex-1 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-4 lg:space-y-0">
        <div className="space-y-3">
          {isLoading ? (
            <UserStatsSkeleton />
          ) : (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4"
            >
              <UserStatCard
                label="Всего пользователей"
                value={data?.total.toLocaleString("ru-RU") ?? "0"}
                icon={UsersRound}
                tone="bg-sky-100 text-sky-800 dark:bg-sky-300/10 dark:text-sky-200"
              />
              <UserStatCard
                label="Активны в списке"
                value={activeCount.toLocaleString("ru-RU")}
                icon={UserRoundCheck}
                tone="bg-emerald-100 text-emerald-800 dark:bg-emerald-300/10 dark:text-emerald-200"
              />
              <UserStatCard
                label="Администраторы в списке"
                value={adminCount.toLocaleString("ru-RU")}
                icon={ShieldCheck}
                tone="bg-amber-100 text-amber-800 dark:bg-amber-300/10 dark:text-primary"
              />
              <UserStatCard
                label="Заблокированы в списке"
                value={blockedCount.toLocaleString("ru-RU")}
                icon={UserRoundX}
                tone="bg-rose-100 text-rose-800 dark:bg-rose-300/10 dark:text-rose-200"
              />
            </motion.div>
          )}

          {isError && (
            <GlassAlert
              tone="danger"
              className="flex flex-wrap items-center justify-between gap-3 text-sm"
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
                className="border-rose-200/20 bg-muted text-muted-foreground hover:bg-accent"
              >
                {isRefetching ? (
                  <GlassSkeleton
                    variant="line"
                    className="h-3 w-14 bg-muted"
                  />
                ) : (
                  "Повторить"
                )}
              </Button>
            </GlassAlert>
          )}
        </div>

        <div
          style={
            {
              "--user-details-width": selectedUser ? "280px" : "0px",
              "--user-details-gap": selectedUser ? "1rem" : "0px",
            } as CSSProperties
          }
          className="grid min-h-0 grid-cols-1 gap-y-4 transition-[grid-template-columns,column-gap] duration-300 ease-out lg:grid-rows-[minmax(0,1fr)] xl:gap-x-(--user-details-gap) xl:grid-cols-[minmax(0,1fr)_var(--user-details-width)]"
        >
          <GlassPanel
            role="region"
            aria-label="Список пользователей"
            className="users-table-panel flex min-h-0 min-w-0 flex-col overflow-hidden xl:col-start-1 xl:row-start-1"
          >
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 xl:flex-row xl:items-center">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                    setSelectedId(null);
                  }}
                  placeholder="Поиск по имени, email или ID..."
                  aria-label="Поиск пользователей"
                  className="h-10 border-border bg-muted pl-10 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
                />
              </label>
              <div className="grid grid-cols-2 gap-2 xl:w-72.5">
                <GlassSelect
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value);
                    setPage(1);
                    setSelectedId(null);
                  }}
                >
                  <GlassSelectTrigger
                    aria-label="Фильтр по роли"
                    className="h-10 w-full text-xs"
                  >
                    <GlassSelectValue placeholder="Все роли" />
                  </GlassSelectTrigger>
                  <GlassSelectContent>
                    <GlassSelectItem value="all">Все роли</GlassSelectItem>
                    {roles.map((role) => (
                      <GlassSelectItem key={role} value={role}>
                        {formatRole(role)}
                      </GlassSelectItem>
                    ))}
                  </GlassSelectContent>
                </GlassSelect>
                <GlassSelect
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setPage(1);
                    setSelectedId(null);
                  }}
                >
                  <GlassSelectTrigger
                    aria-label="Фильтр по статусу"
                    className="h-10 w-full text-xs"
                  >
                    <GlassSelectValue placeholder="Все статусы" />
                  </GlassSelectTrigger>
                  <GlassSelectContent>
                    <GlassSelectItem value="all">Все статусы</GlassSelectItem>
                    <GlassSelectItem value="active">Активные</GlassSelectItem>
                    <GlassSelectItem value="blocked">
                      Заблокированные
                    </GlassSelectItem>
                  </GlassSelectContent>
                </GlassSelect>
              </div>
              {canCreateUsers && (
                <Button
                  type="button"
                  disabled={!assignableRoles.length}
                  onClick={() => router.push("/users/create")}
                  className="h-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary"
                >
                  Добавить пользователя
                </Button>
              )}
            </div>

            <GlassScrollArea
              aria-busy={isLoading}
              scrollbars="both"
              className="min-h-0 flex-1"
            >
              <table className="w-full min-w-190 border-separate border-spacing-x-0 border-spacing-y-1.5 px-2 text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th scope="col" className="px-5 py-3 font-medium">
                      Пользователь
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Email
                    </th>
                    <th scope="col" className="px-4 py-3 text-center font-medium">
                      Роль
                    </th>
                    <th scope="col" className="px-4 py-3 text-center font-medium">
                      Статус
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Регистрация
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-medium">
                      Детали
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <UserTableSkeleton />
                  ) : filteredUsers.length ? (
                    filteredUsers.map((user) => {
                      const isSelected = selectedUser?.id === user.id;
                      const rowCellClass = `border-y-2 border-l-2 border-border bg-card/70 transition-colors group-hover:bg-accent ${
                        isSelected ? "border-primary/50 bg-muted" : ""
                      }`;
                      return (
                        <tr
                          key={user.id}
                          className="group"
                          data-selected={isSelected || undefined}
                        >
                          <td className={`${rowCellClass} rounded-l-xl px-5 py-3.5`}>
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
                                <p className="max-w-47.5 truncate font-medium text-foreground">
                                  {getUserName(user)}
                                </p>
                                <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
                                  ID: {user.id}
                                </p>
                              </div>
                            </button>
                          </td>
                          <td className={`${rowCellClass} max-w-50 truncate px-4 py-3.5 text-xs text-foreground`}>
                            {user.email || "—"}
                          </td>
                          <td className={`${rowCellClass} px-4 py-3.5 text-center`}>
                            <GlassBadge tone="neutral">
                              {formatRole(user.role)}
                            </GlassBadge>
                          </td>
                          <td className={`${rowCellClass} px-4 py-3.5 text-center`}>
                            <GlassBadge
                              tone={user.isBlocked ? "red" : "green"}
                              dot
                            >
                              {user.isBlocked ? "Заблокирован" : "Активен"}
                            </GlassBadge>
                          </td>
                          <td className={`${rowCellClass} whitespace-nowrap px-4 py-3.5 text-xs text-muted-foreground`}>
                            {formatDate(user.createdAt)}
                          </td>
                          <td className={`${rowCellClass} rounded-r-xl border-r-2 px-4 py-3.5 text-right`}>
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
                              className="text-muted-foreground hover:bg-accent hover:text-primary"
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
                        <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                          <UsersRound className="size-5" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-foreground">
                          Пользователи не найдены
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Измените запрос или выберите другие фильтры.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </GlassScrollArea>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <span>
                {isLoading ? (
                  <span className="inline-flex items-center gap-1">
                    Показано{" "}
                    <GlassSkeleton
                      variant="line"
                      className="h-3 w-8 rounded-sm"
                    />{" "}
                    пользователей
                  </span>
                ) : (
                  <>
                    Показано {firstUserIndex}–{lastUserIndex} из{" "}
                    {data?.total.toLocaleString("ru-RU") ?? "—"} пользователей
                  </>
                )}
              </span>
              {pageCount > 1 && (
                <GlassPagination
                  aria-label="Страницы пользователей"
                  page={page}
                  pageCount={pageCount}
                  previousLabel="Предыдущая страница пользователей"
                  nextLabel="Следующая страница пользователей"
                  onPageChange={(nextPage) => {
                    setSelectedId(null);
                    setPage(nextPage);
                  }}
                />
              )}
            </div>
          </GlassPanel>

          <AnimatePresence initial={false}>
            {selectedUser && (
              <UserDetailsPanel
                key={selectedUser.id}
                user={selectedUser}
                onClose={() => setSelectedId(null)}
                reduceMotion={shouldReduceMotion ?? false}
                canManageActions={canManageSelectedUser}
                isPending={isMutating}
                onEdit={() =>
                  router.push(
                    `/users/${encodeURIComponent(selectedUser.id)}/edit`,
                  )
                }
                onToggleBlocked={() => handleToggleBlocked(selectedUser)}
                onDelete={handleDeleteSelectedUser}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <AlertDialog
        open={statusConfirmation !== null}
        onOpenChange={(open) => {
          if (!open && !blockMutation.isPending) setStatusConfirmation(null);
        }}
      >
        <AlertDialogContent className="text-popover-foreground">
          <AlertDialogHeader>
            <span className="mb-1 flex size-11 items-center justify-center rounded-2xl border border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-200/20 dark:bg-amber-300/10 dark:text-primary">
              <AlertCircle className="size-5" />
            </span>
            <AlertDialogTitle>
              {statusConfirmation?.isBlocked
                ? "Заблокировать пользователя?"
                : "Разблокировать пользователя?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {statusConfirmation?.isBlocked
                ? `Пользователь «${statusConfirmationUserName}» потеряет доступ к системе.`
                : `Пользователю «${statusConfirmationUserName}» снова будет доступна система.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              disabled={blockMutation.isPending}
              onClick={() => setStatusConfirmation(null)}
              className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Отмена
            </Button>
            <Button
              type="button"
              disabled={blockMutation.isPending}
              onClick={confirmStatusChange}
              className={
                statusConfirmation?.isBlocked
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary"
              }
            >
              {blockMutation.isPending
                ? "Выполняется..."
                : statusConfirmation?.isBlocked
                  ? "Заблокировать"
                  : "Разблокировать"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
