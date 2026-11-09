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
  Megaphone,
  ScrollText,
  Settings,
} from "lucide-react";

import { adminNavigation } from "@/config/navigation";
import { GlassPanel } from "@/components/ui/glassyui";
import { useCan } from "@/hooks/use-can";
import type { AdminSidebarProps } from "./admin-sidebar.types";

const publicationLinks = [
  { label: "Новости", icon: BellRing },
  { label: "Статьи", icon: BookOpenText },
  { label: "Объявления", icon: Megaphone },
];

export function AdminSidebar({ pathname, fitViewport }: AdminSidebarProps) {
  const [publicationsOpen, setPublicationsOpen] = useState(true);
  const { can } = useCan();
  const visibleNavigation = adminNavigation.filter((item) =>
    can(item.permission),
  );

  return (
    <GlassPanel
      role="complementary"
      aria-label="Главная навигация"
      className={`scrollbar-none hidden w-51 shrink-0 flex-col overflow-y-auto p-3 lg:flex xl:w-53 ${
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
        <span className="mt-2 block text-sm font-semibold tracking-wide text-primary">
          APA Administration
        </span>
        <span className="mt-1 block max-w-38.75 text-[0.65rem] leading-relaxed text-muted-foreground">
          Академия государственного управления
        </span>
      </Link>

      <div className="my-3 h-px bg-muted" />

      <nav aria-label="Главная навигация" className="space-y-1">
        {visibleNavigation.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs transition-all ${
                isActive
                  ? "border border-primary/45 bg-linear-to-r from-gold-light/35 to-gold-light/10 text-accent-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.12)]"
                  : "border border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon
                className={`size-4.5 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-accent-foreground"
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
            className="group flex w-full items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2.5 text-left text-xs text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
          >
            <FolderKanban className="size-4.25 text-primary" />
            <span>Публикации</span>
            <ChevronRight
              className={`ml-auto size-3.5 transition-transform ${
                publicationsOpen ? "rotate-90" : ""
              }`}
            />
          </button>
          {publicationsOpen && (
            <div className="ml-4.5 mt-0.5 space-y-0.5 border-l border-border pl-3">
              {publicationLinks.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-2 py-1.5 text-[0.68rem] text-muted-foreground"
                >
                  <Icon className="size-3.5 text-muted-foreground" />
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="my-2 h-px bg-muted" />
        {[
          { label: "Академия", icon: GraduationCap },
          { label: "Обращения", icon: Bell },
          { label: "Структура сайта", icon: FolderKanban },
          { label: "Медиафайлы", icon: FileText },
          { label: "Документы", icon: ScrollText },
        ].map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-muted-foreground"
          >
            <Icon className="size-4.25 text-primary" />
            {label}
          </div>
        ))}

        <div className="my-2 h-px bg-muted" />
        <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-muted-foreground">
          <ScrollText className="size-4.25 text-primary" />
          Журнал действий
        </div>
        <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-muted-foreground">
          <Settings className="size-4.25 text-primary" />
          Настройки
        </div>
      </nav>

      <div className="mt-auto px-1 pb-1 pt-3">
        <div className="h-px bg-muted" />
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.65rem] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.75)]" />
          Система работает
        </div>
      </div>
    </GlassPanel>
  );
}
