"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import {
  Bell,
  ChevronRight,
  Landmark,
  LogOut,
  Mail,
  Phone,
  UsersRound,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { AdminSidebar, adminNavigation } from "@/components/layout/admin-sidebar";
import type { AdminShellProps } from "@/components/layout/admin-shell.types";
import {
  getProfileAvatar,
  getProfileEmail,
  getProfileFullName,
  getProfileInitials,
  getProfilePhone,
  getProfileRole,
  getProfileUserName,
  type AccessTokenClaims,
} from "@/lib/auth/claims";
import { getAccessToken, removeToken } from "@/lib/cookies";

export function AdminShell({
  title,
  description,
  children,
  showPageHeading = true,
  fitViewport = false,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const [profileOpen, setProfileOpen] = useState(false);
  const [date, setDate] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);
  const {
    data: profileClaims,
    isError: isProfileError,
  } = useQuery({
    queryKey: ["auth-profile"],
    queryFn: () => {
      const token = getAccessToken();
      return token ? jwtDecode<AccessTokenClaims>(token) : null;
    },
    retry: false,
    staleTime: Infinity,
  });
  const profileFullName = getProfileFullName(profileClaims ?? null);
  const visibleNavigation = adminNavigation;
  const profileInitials = getProfileInitials(profileFullName);
  const profileUserName = getProfileUserName(profileClaims ?? null);
  const profileEmail = getProfileEmail(profileClaims ?? null);
  const profilePhone = getProfilePhone(profileClaims ?? null);
  const profileAvatar = getProfileAvatar(profileClaims ?? null);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      setDate(
        `${new Intl.DateTimeFormat("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now)} · ${new Intl.DateTimeFormat("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(now)}`,
      );
    };
    const timer = window.setTimeout(updateDate, 0);
    const interval = window.setInterval(updateDate, 60_000);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!profileOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  const handleLogout = () => {
    queryClient.removeQueries({ queryKey: ["auth-profile"] });
    queryClient.removeQueries({ queryKey: ["users"] });
    removeToken();
    router.replace("/login");
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#061a30] text-white ${
        fitViewport ? "min-h-screen lg:h-dvh lg:min-h-0" : "min-h-screen"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/login/academy-background.jpg')",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(115deg,rgba(3,18,35,0.88),rgba(7,33,60,0.74)_50%,rgba(3,18,35,0.9)),radial-gradient(ellipse_at_top_right,rgba(67,139,201,0.24),transparent_45%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-40 top-1/3 h-96 w-96 rounded-full bg-sky-400/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-40 bottom-0 h-96 w-96 rounded-full bg-amber-300/10 blur-[120px]"
      />

      <div
        className={`relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] gap-3 p-2 sm:gap-4 sm:p-3 lg:gap-5 lg:p-4 ${
          fitViewport ? "lg:h-full lg:min-h-0" : ""
        }`}
      >
        <AdminSidebar pathname={pathname} fitViewport={fitViewport} />

        <div
          className={`flex min-w-0 flex-1 flex-col gap-3 sm:gap-4 ${
            fitViewport ? "lg:min-h-0" : ""
          }`}
        >
          <header
            className={`relative z-50 rounded-2xl px-3 py-3 sm:px-5 sm:py-4 ${
              pathname === "/"
                ? "flex min-h-[92px] items-center border border-white/10 bg-[#092745]/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
                : "glass-panel"
            }`}
          >
            <div className="flex w-full items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#d4af62]/30 bg-[#d4af62]/10 text-[#e4c477] lg:hidden">
                  <Landmark className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div>
                    {pathname === "/" ? (
                      <>
                        <h1 className="text-lg font-semibold leading-tight text-white sm:text-2xl">
                          Добро пожаловать,{" "}
                          <span className="text-[#f0c46d]">
                            {profileFullName !== "Не указано"
                              ? `${profileFullName}!`
                              : "Администратор!"}
                          </span>
                        </h1>
                        <p className="mt-1 truncate text-xs text-white/80 sm:text-sm">
                          Панель управления сайтом Академии
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="hidden items-center gap-2 text-xs text-white/45 sm:flex">
                          <Link
                            href="/"
                            className="transition hover:text-white/80"
                          >
                            Главная
                          </Link>
                          <ChevronRight className="size-3" />
                          <span className="text-white/70">{title}</span>
                        </div>
                        <p className="truncate text-sm font-medium text-white/75 sm:mt-1">
                          {description}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-xs capitalize text-white/70">{date}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Уведомления"
                  className="relative text-white/70 hover:bg-white/10 hover:text-white"
                >
                  <Bell className="size-[18px]" />
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#e4c477] ring-2 ring-[#17324d]" />
                </Button>
                <div ref={profileRef} className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Открыть профиль администратора"
                    aria-expanded={profileOpen}
                    aria-controls="admin-profile-popover"
                    onClick={() => setProfileOpen((open) => !open)}
                    className="size-10 rounded-full p-0 hover:bg-white/10"
                  >
                    {profileAvatar ? (
                      <Image
                        src={profileAvatar}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="size-10 rounded-full border-2 border-[#f2d18a]/80 object-cover shadow-[0_0_20px_rgba(242,209,138,0.3)]"
                      />
                    ) : (
                      <span className="flex size-10 aspect-square items-center justify-center rounded-full border-2 border-[#f2d18a]/80 bg-gradient-to-br from-[#f2d18a]/45 via-[#d4af62]/30 to-[#173c5d] text-xs font-semibold text-[#fff1c9] shadow-[0_0_20px_rgba(242,209,138,0.3)]">
                        {profileInitials}
                      </span>
                    )}
                  </Button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.section
                        id="admin-profile-popover"
                        role="region"
                        aria-label="Профиль администратора"
                        initial={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { opacity: 0, y: -8, scale: 0.97 }
                        }
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : { opacity: 0, y: -5, scale: 0.98 }
                        }
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute right-0 top-full z-[9999] mt-3 w-[min(18rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-[#f2d18a]/45 bg-[linear-gradient(145deg,rgba(30,65,96,0.995),rgba(8,29,51,0.995))] p-4 text-white shadow-[0_24px_65px_rgba(0,0,0,0.7),0_0_26px_rgba(242,209,138,0.16)] backdrop-blur-2xl"
                      >
                        <div className="flex items-center gap-3 border-b border-white/15 pb-3">
                          {profileAvatar ? (
                            <Image
                              src={profileAvatar}
                              alt=""
                              width={44}
                              height={44}
                              unoptimized
                              className="size-11 shrink-0 rounded-full border-2 border-[#f2d18a]/70 object-cover"
                            />
                          ) : (
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[#f2d18a]/70 bg-[#d4af62]/20 text-xs font-semibold text-[#fff1c9]">
                              {profileInitials}
                            </span>
                          )}
                          <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-[#fff1c9]">
                              {profileFullName}
                            </h2>
                            <p className="mt-0.5 text-xs text-white/60">
                              {getProfileRole(profileClaims ?? null)}
                            </p>
                          </div>
                        </div>

                        <dl className="mt-3 space-y-3">
                          {[
                            { label: "ФИО", value: profileFullName, icon: UsersRound },
                            {
                              label: "Имя пользователя",
                              value: profileUserName || "Не указано в токене",
                              icon: UsersRound,
                            },
                            {
                              label: "Почта",
                              value: profileEmail || "Не указана в токене",
                              icon: Mail,
                            },
                            {
                              label: "Номер телефона",
                              value: profilePhone || "Не указан в токене",
                              icon: Phone,
                            },
                            {
                              label: "Роль",
                              value: getProfileRole(profileClaims ?? null),
                              icon: ShieldCheck,
                            },
                          ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="flex items-start gap-2.5">
                              <Icon className="mt-0.5 size-4 shrink-0 text-[#f2d18a]" />
                              <div className="min-w-0">
                                <dt className="text-[0.68rem] text-white/55">
                                  {label}
                                </dt>
                                <dd className="mt-0.5 break-words text-xs font-medium text-white/90">
                                  {value}
                                </dd>
                              </div>
                            </div>
                          ))}
                        </dl>
                        {isProfileError && (
                          <p role="alert" className="mt-3 text-xs text-rose-200">
                            Не удалось прочитать профиль из токена.
                          </p>
                        )}
                      </motion.section>
                    )}
                  </AnimatePresence>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Выйти из аккаунта"
                  onClick={handleLogout}
                  className="text-white/70 hover:bg-white/10 hover:text-[#f2d18a]"
                >
                  <LogOut className="size-[18px]" />
                </Button>
              </div>
            </div>

            <nav
              aria-label="Мобильная навигация"
              className="mt-4 flex gap-2 overflow-x-auto border-t border-white/10 pt-3 lg:hidden"
            >
              {visibleNavigation.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                      isActive
                        ? "bg-[#d4af62]/20 text-[#f2d99b]"
                        : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <motion.main
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`min-w-0 flex-1 ${
              fitViewport ? "lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden" : ""
            }`}
          >
            {showPageHeading && (
              <div className="mb-4 px-1 sm:px-2">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-white/55">{description}</p>
              </div>
            )}
            {children}
          </motion.main>

          <footer className={`px-2 pb-1 text-center text-xs text-white/35 sm:text-left ${fitViewport ? "lg:hidden" : ""}`}>
            APA Administration <span className="mx-1.5 text-white/20">·</span>
            Академия государственного управления
          </footer>
        </div>
      </div>
    </div>
  );
}
