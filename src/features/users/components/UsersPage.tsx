"use client";

import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Eye,
  Search,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  UserRoundX,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getUsers } from "@/api/requests/users";
import { AdminShell } from "@/components/layout/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { User } from "@/types/userstypes";

const emptyUsers: User[] = [];

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
}: {
  user: User;
  onClose: () => void;
  reduceMotion: boolean;
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
    </motion.aside>
  );
}

export default function UsersPage() {
  const shouldReduceMotion = useReducedMotion();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["users", debouncedSearch],
    queryFn: () => getUsers(debouncedSearch),
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
              <div className="grid grid-cols-2 gap-2">
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
            </div>

            <div className="scrollbar-none min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-white/45">
                    <th scope="col" className="px-5 py-3 font-medium">Пользователь</th>
                    <th scope="col" className="px-4 py-3 font-medium">Email</th>
                    <th scope="col" className="px-4 py-3 font-medium">Роль</th>
                    <th scope="col" className="px-4 py-3 font-medium">Статус</th>
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
                          <td className="px-4 py-3.5">
                            <span className="inline-flex max-w-[150px] items-center truncate rounded-full border border-sky-200/15 bg-sky-300/10 px-2.5 py-1 text-[0.7rem] text-sky-100">
                              {formatRole(user.role)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] ${
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
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdminShell>
  );
}
