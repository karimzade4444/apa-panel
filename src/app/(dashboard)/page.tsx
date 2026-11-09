"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "motion/react";
import {
  Activity,
  ArrowRight,
  BookOpenText,
  Check,
  Mail,
  Megaphone,
  MessageCircle,
  Newspaper,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { getUsers } from "@/api/users";
import { PublicationChartSkeleton } from "@/components/skeletons/publication-chart-skeleton";
import { Button } from "@/components/ui/button";
import {
  GlassAlert,
  GlassBadge,
  GlassPanel,
  GlassSkeleton,
} from "@/components/ui/glassyui";
import type { User } from "@/types/user";

const publicationTitle = "Главное объявление Академии";

const stats = [
  {
    title: "Пользователи",
    key: "users",
    icon: UsersRound,
    color: "text-primary",
    glow: "from-[#f2c56b]/80",
  },
  {
    title: "Новости",
    key: "news",
    icon: Newspaper,
    color: "text-sky-200",
    glow: "from-sky-300/80",
  },
  {
    title: "Статьи",
    key: "articles",
    icon: BookOpenText,
    color: "text-blue-200",
    glow: "from-blue-300/80",
  },
  {
    title: "Обращения",
    key: "requests",
    icon: Mail,
    color: "text-primary",
    glow: "from-[#f2c56b]/80",
  },
] as const;

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  glow,
  index,
  reduceMotion,
  loading,
}: {
  title: string;
  value: string;
  icon: (typeof stats)[number]["icon"];
  color: string;
  glow: string;
  index: number;
  reduceMotion: boolean;
  loading: boolean;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.38 }}
      className="relative isolate min-h-22 overflow-hidden p-3 sm:min-h-24 sm:p-3.5"
    >
      <GlassPanel aria-hidden className="absolute inset-0 z-0" />
      <div className="relative z-10 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card text-primary shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          {loading ? (
            <GlassSkeleton
              variant="line"
              className="h-6 w-14 rounded-md"
            />
          ) : (
            <p className="text-2xl font-semibold leading-none tracking-tight text-foreground">
              {value}
            </p>
          )}
          <p className="mt-1 truncate text-xs text-muted-foreground">{title}</p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 h-6 overflow-hidden opacity-70">
        <svg
          aria-hidden="true"
          viewBox="0 0 240 34"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <path
            d="M0 26 C24 23 25 29 45 21 S72 25 93 16 S122 26 143 14 S169 19 186 12 S218 18 240 4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className={color}
          />
        </svg>
      </div>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -bottom-6 right-0 z-10 h-10 w-2/3 bg-linear-to-t ${glow} to-transparent opacity-10 blur-xl`}
      />
    </motion.article>
  );
}

function PublicationChart({ users }: { users: User[] }) {
  const active = users.filter((user) => !user.isBlocked).length;
  const blocked = users.filter((user) => user.isBlocked).length;
  const admin = users.filter((user) => /admin/i.test(user.role)).length;
  const metrics = [
    { label: "Активные", value: active, color: "bg-sky-400" },
    { label: "Администраторы", value: admin, color: "bg-amber-300" },
    { label: "Заблокированы", value: blocked, color: "bg-blue-300" },
  ];
  const max = Math.max(...metrics.map((metric) => metric.value), 1);

  return (
    <GlassPanel role="region" aria-label="Статистика пользователей" className="flex min-h-0 flex-col overflow-hidden p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
          <Activity className="size-4.5 text-sky-200" />
          Статистика пользователей
        </h2>
        <GlassBadge tone="neutral">
          {users.length ? "Загруженный список" : "Нет данных"}
        </GlassBadge>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-3 gap-3 sm:gap-5">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="flex min-w-0 flex-col items-center justify-end"
          >
            <span className="mb-2 text-xs font-medium tabular-nums text-muted-foreground">
              {metric.value}
            </span>
            <div className="relative flex h-19 w-full items-end justify-center border-b border-l border-border bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_24px,rgba(255,255,255,0.08)_25px)] sm:h-24">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: users.length ? `${Math.max((metric.value / max) * 88, 5)}%` : "4%" }}
                transition={{ duration: 0.65, delay: 0.12 + index * 0.1 }}
                className={`w-[45%] max-w-12 rounded-t-[5px] ${metric.color} shadow-[0_0_16px_rgba(98,174,255,0.18)]`}
              />
            </div>
            <span className="mt-2 max-w-full truncate text-center text-[0.65rem] text-muted-foreground sm:text-xs">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 border-t border-border pt-2 text-[0.62rem] text-muted-foreground">
        Показатели рассчитаны по записям, полученным от API.
      </p>
    </GlassPanel>
  );
}

function LatestPublication() {
  return (
    <GlassPanel role="region" aria-label="Последняя публикация" className="flex min-h-0 flex-col overflow-hidden p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground sm:text-base">
          <Megaphone className="size-4.5 text-sky-200" />
          Последняя публикация
        </h2>
        <span className="text-xs font-medium text-sky-200">Всего 1</span>
      </div>

      <article className="mt-3 flex min-w-0 flex-1 items-start gap-3 border-b border-border pb-3">
        <div
          aria-hidden="true"
          className="relative flex h-14 w-19 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-200/30 bg-cover bg-center shadow-[0_4px_18px_rgba(0,0,0,0.25)] sm:h-16 sm:w-22"
          style={{ backgroundImage: "url('/images/login/academy-background.jpg')" }}
        >
          <span className="absolute inset-0 bg-[#0b2b4d]/35" />
          <Megaphone className="relative size-7 text-primary drop-shadow-lg" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
            {publicationTitle}
          </p>
          <p className="mt-2 text-xs text-sky-200">Объявление</p>
          <p className="mt-1 text-[0.68rem] text-muted-foreground">
            Главная публикация Академии
          </p>
        </div>
        <GlassBadge tone="green" className="shrink-0 text-[0.62rem]">
          Главное
        </GlassBadge>
      </article>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-[0.65rem]">
        <span className="truncate text-muted-foreground">В главном блоке отображается одна запись</span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-sky-200">
          <Check className="size-3" />
          1 публикация
        </span>
      </div>
    </GlassPanel>
  );
}

function EmptyPanel({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: typeof Mail;
}) {
  return (
    <GlassPanel role="region" aria-label={title} className="flex min-h-0 items-center gap-3 overflow-hidden p-3 sm:p-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-300/10">
        <Icon className="size-4.5 text-sky-200" />
      </span>
      <div className="min-w-0">
        <h2 className="truncate text-xs font-semibold text-foreground">{title}</h2>
        <p className="mt-0.5 truncate text-[0.65rem] text-muted-foreground">{subtitle}</p>
      </div>
    </GlassPanel>
  );
}

function AcademyCard() {
  return (
    <GlassPanel
      role="region"
      aria-label="Академия государственного управления"
      className="relative flex min-h-0 flex-col justify-end overflow-hidden border-primary/30 bg-cover bg-center p-3.5"
    >
      <div className="absolute inset-0 bg-linear-to-r from-[#081e36]/95 via-[#0b2947]/70 to-[#0b2947]/25" />
      <div className="absolute inset-0 bg-linear-to-t from-[#061a30]/70 via-transparent to-white/4" />
      <div className="relative z-10 max-w-72.5">
        <p className="text-xs leading-relaxed text-foreground">
          Академия государственного управления при Президенте Республики
          Таджикистан
        </p>
        <Link
          href="/users"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#f2d18a]/40 bg-primary px-3 py-1.5 text-[0.68rem] font-semibold text-primary-foreground shadow-lg transition hover:bg-primary"
        >
          Пользователи
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </GlassPanel>
  );
}

export default function DashboardPage() {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const { data, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers(""),
  });
  const users = data?.items ?? [];

  const statValues = {
    users: isError ? "—" : (data?.total ?? 0).toLocaleString("ru-RU"),
    news: "—",
    articles: "—",
    requests: "—",
  };

  return (
      <div className="scrollbar-none space-y-3 overflow-y-auto sm:space-y-4 lg:grid lg:h-full lg:min-h-0 lg:flex-1 lg:grid-rows-[auto_minmax(0,1fr)_minmax(0,0.48fr)] lg:gap-3 lg:space-y-0 lg:overflow-hidden">
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.key}
                title={stat.title}
                value={statValues[stat.key]}
                icon={stat.icon}
                color={stat.color}
                glow={stat.glow}
                index={index}
                reduceMotion={shouldReduceMotion}
                loading={stat.key === "users" && isLoading}
              />
            ))}
          </div>

          {isError && (
            <GlassAlert
              tone="danger"
              className="flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <span>Не удалось получить статистику пользователей.</span>
              <Button
                type="button"
                variant="ghost"
                disabled={isRefetching}
                onClick={() => void refetch()}
                className="h-auto rounded-lg border border-border bg-muted px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent"
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

        <div className="grid min-h-55 gap-3 lg:min-h-0 xl:grid-cols-[1.08fr_0.92fr]">
          {isLoading ? (
            <PublicationChartSkeleton />
          ) : (
            <PublicationChart users={users} />
          )}
          <LatestPublication />
        </div>

        <div className="grid min-h-25 gap-3 sm:grid-cols-2 xl:grid-cols-[0.95fr_1.2fr_1fr] lg:min-h-0">
          <EmptyPanel
            title="Обращения граждан"
            subtitle="Модуль обращений пока не подключён к панели."
            icon={MessageCircle}
          />
          <EmptyPanel
            title="Последние действия"
            subtitle="Журнал действий появится после подключения соответствующего раздела."
            icon={Activity}
          />
          <AcademyCard />
        </div>

      </div>
  );
}
