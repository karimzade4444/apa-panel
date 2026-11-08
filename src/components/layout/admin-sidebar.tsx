"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Bell,
  BellRing,
  BookOpenText,
  ChevronRight,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Settings,
  UsersRound,
} from "lucide-react";

import type { AdminSidebarProps } from "./admin-sidebar.types";

export const adminNavigation = [
  { href: "/", label: "Панель управления", icon: LayoutDashboard },
  { href: "/users", label: "Пользователи", icon: UsersRound },
];

const publicationLinks = [
  { label: "Новости", icon: BellRing },
  { label: "Статьи", icon: BookOpenText },
  { label: "Объявления", icon: Megaphone },
];

export function AdminSidebar({ pathname, fitViewport }: AdminSidebarProps) {
  const [publicationsOpen, setPublicationsOpen] = useState(true);

  return (
    <aside
      className={`glass-panel scrollbar-none hidden w-51 shrink-0 flex-col overflow-y-auto rounded-[26px] p-3 lg:flex xl:w-53 ${
        fitViewport ? "lg:min-h-0" : ""
      }`}
    >
      <Link
        href="/"
        className="flex flex-col items-center px-2 py-2 text-center"
      >
        <Image
          src="/images/academy-logo.png"
          alt="Логотип Академии государственного управления"
          width={168}
          height={126}
          priority
          className="h-29 w-full max-w-42 object-contain drop-shadow-[0_4px_14px_rgba(242,193,78,0.25)]"
        />
        <span className="mt-2 block text-sm font-semibold tracking-wide text-[#f2d99b]">
          APA Administration
        </span>
        <span className="mt-1 block max-w-38.75 text-[0.65rem] leading-relaxed text-white/55">
          Академия государственного управления
        </span>
      </Link>

      <div className="my-3 h-px bg-white/10" />

      <nav aria-label="Главная навигация" className="space-y-1">
        {adminNavigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs transition-all ${
                isActive
                  ? "border border-[#e4c477]/45 bg-linear-to-r from-gold-light/35 to-gold-light/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.12)]"
                  : "border border-transparent text-white/65 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <Icon
                className={`size-4.5 ${
                  isActive
                    ? "text-[#e4c477]"
                    : "text-white/50 group-hover:text-white/80"
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}

        <div className="pt-0.5">
          <button
            type="button"
            aria-expanded={publicationsOpen}
            onClick={() => setPublicationsOpen((open) => !open)}
            className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2.5 text-left text-xs text-white/65 transition hover:bg-white/[0.07] hover:text-white"
          >
            <FolderKanban className="size-4.25 text-[#e4c477]" />
            <span>Публикации</span>
            <ChevronRight
              className={`ml-auto size-3.5 transition-transform ${
                publicationsOpen ? "rotate-90" : ""
              }`}
            />
          </button>
          {publicationsOpen && (
            <div className="ml-4.5 mt-0.5 space-y-0.5 border-l border-white/15 pl-3">
              {publicationLinks.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-2 py-1.5 text-[0.68rem] text-white/50"
                >
                  <Icon className="size-3.5 text-white/40" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="my-2 h-px bg-white/10" />
        {[
          { label: "Академия", icon: GraduationCap },
          { label: "Обращения", icon: Bell },
          { label: "Структура сайта", icon: FolderKanban },
          { label: "Медиафайлы", icon: FileText },
          { label: "Документы", icon: ScrollText },
        ].map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-white/65"
          >
            <Icon className="size-4.25 text-[#e4c477]" />
            {label}
          </div>
        ))}

        <div className="my-2 h-px bg-white/10" />
        <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-white/65">
          <ScrollText className="size-4.25 text-[#e4c477]" />
          Журнал действий
        </div>
        <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-white/65">
          <Settings className="size-4.25 text-[#e4c477]" />
          Настройки
        </div>
      </nav>

      <div className="mt-auto px-1 pb-1 pt-3">
        <div className="h-px bg-white/10" />
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.65rem] text-white/65">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
          Система работает
        </div>
      </div>
    </aside>
  );
}
