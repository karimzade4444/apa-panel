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
import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

const publicationTitle = "Главное объявление Академии";

const stats = [
  {
    title: "Пользователи",
    key: "users",
    icon: UsersRound,
    color: "text-[#f2d18a]",
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
    color: "text-[#f2d18a]",
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
}: {
  title: string;
  value: string;
  icon: (typeof stats)[number]["icon"];
  color: string;
  glow: string;
  index: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.38 }}
      className="glass-panel relative min-h-[88px] overflow-hidden rounded-[16px] p-3 sm:min-h-[96px] sm:p-3.5"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#09223e]/85 text-[#e7c477] shadow-[0_8px_24px_rgba(0,0,0,0.28)]">
          <Icon className="size-5" strokeWidth={1.8} />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold leading-none tracking-tight text-white">
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-white/85">{title}</p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-6 overflow-hidden opacity-70">
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
        className={`pointer-events-none absolute -bottom-6 right-0 h-10 w-2/3 bg-gradient-to-t ${glow} to-transparent opacity-10 blur-xl`}
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
    <section className="glass-panel flex min-h-0 flex-col overflow-hidden rounded-[18px] p-3.5 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white sm:text-base">
          <Activity className="size-[18px] text-sky-200" />
          Статистика пользователей
        </h2>
        <span className="rounded-full border border-white/15 bg-white/[0.08] px-3 py-1 text-[0.68rem] text-white/70">
          {users.length ? "Загруженный список" : "Нет данных"}
        </span>
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-3 gap-3 sm:gap-5">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className="flex min-w-0 flex-col items-center justify-end"
          >
            <span className="mb-2 text-xs font-medium tabular-nums text-white/80">
              {metric.value}
            </span>
            <div className="relative flex h-[76px] w-full items-end justify-center border-b border-l border-white/20 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_24px,rgba(255,255,255,0.08)_25px)] sm:h-[96px]">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: users.length ? `${Math.max((metric.value / max) * 88, 5)}%` : "4%" }}
                transition={{ duration: 0.65, delay: 0.12 + index * 0.1 }}
                className={`w-[45%] max-w-12 rounded-t-[5px] ${metric.color} shadow-[0_0_16px_rgba(98,174,255,0.18)]`}
              />
            </div>
            <span className="mt-2 max-w-full truncate text-center text-[0.65rem] text-white/60 sm:text-xs">
              {metric.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-2 border-t border-white/10 pt-2 text-[0.62rem] text-white/40">
        Показатели рассчитаны по записям, полученным от API.
      </p>
    </section>
  );
}

function LatestPublication() {
  return (
    <section className="glass-panel flex min-h-0 flex-col overflow-hidden rounded-[18px] p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white sm:text-base">
          <Megaphone className="size-[18px] text-sky-200" />
          Последняя публикация
        </h2>
        <span className="text-xs font-medium text-sky-200">Всего 1</span>
      </div>

      <article className="mt-3 flex min-w-0 flex-1 items-start gap-3 border-b border-white/10 pb-3">
        <div
          aria-hidden="true"
          className="relative flex h-[56px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-200/30 bg-cover bg-center shadow-[0_4px_18px_rgba(0,0,0,0.25)] sm:h-[64px] sm:w-[88px]"
          style={{ backgroundImage: "url('/images/login/academy-background.jpg')" }}
        >
          <span className="absolute inset-0 bg-[#0b2b4d]/35" />
          <Megaphone className="relative size-7 text-[#f2d18a] drop-shadow-lg" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-white">
            {publicationTitle}
          </p>
          <p className="mt-2 text-xs text-sky-200">Объявление</p>
          <p className="mt-1 text-[0.68rem] text-white/45">
            Главная публикация Академии
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-[0.62rem] text-emerald-200">
          Главное
        </span>
      </article>

      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-[0.65rem]">
        <span className="truncate text-white/45">В главном блоке отображается одна запись</span>
        <span className="flex shrink-0 items-center gap-1 font-medium text-sky-200">
          <Check className="size-3" />
          1 публикация
        </span>
      </div>
    </section>
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
    <section className="glass-panel flex min-h-0 items-center gap-3 overflow-hidden rounded-[16px] p-3 sm:p-3.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-300/10">
        <Icon className="size-[18px] text-sky-200" />
      </span>
      <div className="min-w-0">
        <h2 className="truncate text-xs font-semibold text-white/90">{title}</h2>
        <p className="mt-0.5 truncate text-[0.65rem] text-white/50">{subtitle}</p>
      </div>
    </section>
  );
}

function AcademyCard() {
  return (
    <section
      className="glass-panel relative flex min-h-0 flex-col justify-end overflow-hidden rounded-[16px] border-[#e4c477]/30 bg-cover bg-center p-3.5"
      
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#081e36]/95 via-[#0b2947]/70 to-[#0b2947]/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#061a30]/70 via-transparent to-white/[0.04]" />
      <div className="relative z-10 max-w-[290px]">
        <p className="text-xs leading-relaxed text-white/90">
          Академия государственного управления при Президенте Республики
          Таджикистан
        </p>
        <Link
          href="/users"
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-[#f2d18a]/40 bg-[#e1bb6e] px-3 py-1.5 text-[0.68rem] font-semibold text-[#10243a] shadow-lg transition hover:bg-[#f2d18a]"
        >
          Пользователи
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
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
    users: isLoading ? "…" : isError ? "—" : (data?.total ?? 0).toLocaleString("ru-RU"),
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
              />
            ))}
          </div>

          {isError && (
            <div
              role="alert"
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300/20 bg-rose-400/10 px-4 py-2 text-xs text-rose-100"
            >
              <span>Не удалось получить статистику пользователей.</span>
              <Button
                type="button"
                variant="ghost"
                disabled={isRefetching}
                onClick={() => void refetch()}
                className="h-auto rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white hover:bg-white/10"
              >
                {isRefetching ? "Загрузка..." : "Повторить"}
              </Button>
            </div>
          )}
        </div>

        <div className="grid min-h-[220px] gap-3 lg:min-h-0 xl:grid-cols-[1.08fr_0.92fr]">
          <PublicationChart users={users} />
          <LatestPublication />
        </div>

        <div className="grid min-h-[100px] gap-3 sm:grid-cols-2 xl:grid-cols-[0.95fr_1.2fr_1fr] lg:min-h-0">
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
