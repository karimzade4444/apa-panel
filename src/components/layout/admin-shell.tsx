"use client";

import { motion, useReducedMotion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import {
  BellRing,
  Bell,
  BookOpenText,
  ChevronRight,
  FileText,
  FolderKanban,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  LogOut,
  Mail,
  Megaphone,
  Phone,
  Settings,
  ShieldCheck,
  ScrollText,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { getAccessToken, removeToken } from "@/lib/cookies";

const navigation = [
  { href: "/", label: "Панель управления", icon: LayoutDashboard },
  { href: "/users", label: "Пользователи", icon: UsersRound },
];

const publicationLinks = [
  { label: "Новости", icon: BellRing },
  { label: "Статьи", icon: BookOpenText },
  { label: "Объявления", icon: Megaphone },
];

interface AccessTokenClaims {
  [claim: string]: unknown;
}

function getClaim(claims: AccessTokenClaims | null, ...keys: string[]) {
  if (!claims) return "";
  for (const key of keys) {
    const value = claims[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getProfileName(claims: AccessTokenClaims | null) {
  const firstName = getClaim(
    claims,
    "firstName",
    "FirstName",
    "first_name",
    "given_name",
  );
  const middleName = getClaim(
    claims,
    "middleName",
    "MiddleName",
    "middle_name",
    "patronymic",
  );
  const lastName = getClaim(
    claims,
    "lastName",
    "LastName",
    "last_name",
    "family_name",
    "surname",
  );
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  return (
    fullName ||
    getClaim(
      claims,
      "fullName",
      "FullName",
      "full_name",
      "name",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
    ) ||
    getClaim(
      claims,
      "userName",
      "UserName",
      "username",
      "preferred_username",
      "unique_name",
    ) ||
    "Не указано"
  );
}

function getProfileInitials(name: string) {
  if (name === "Не указано") return "АП";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("ru-RU") ?? "")
    .join("");
}

function getProfileRole(claims: AccessTokenClaims | null) {
  const roleClaim =
    claims?.role ??
    claims?.Role ??
    claims?.roles ??
    claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  const role = Array.isArray(roleClaim)
    ? roleClaim.filter((value): value is string => typeof value === "string").join(", ")
    : typeof roleClaim === "string"
      ? roleClaim
      : "";
  return role ? role.replace(/[_-]+/g, " ") : "Не указана";
}

interface AdminShellProps {
  title: string;
  description: string;
  children: ReactNode;
  showPageHeading?: boolean;
}

export function AdminShell({
  title,
  description,
  children,
  showPageHeading = true,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [publicationsOpen, setPublicationsOpen] = useState(true);
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
  const profileName = getProfileName(profileClaims ?? null);
  const profileInitials = getProfileInitials(profileName);
  const profileEmail = getClaim(
    profileClaims ?? null,
    "email",
    "Email",
    "email_address",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  );
  const profilePhone = getClaim(
    profileClaims ?? null,
    "phoneNumber",
    "PhoneNumber",
    "phone_number",
    "phone",
    "mobile",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/mobilephone",
  );
  const profileAvatar = getClaim(
    profileClaims ?? null,
    "photoUrl",
    "PhotoUrl",
    "photo_url",
    "avatarUrl",
    "AvatarUrl",
    "avatar_url",
    "picture",
  );

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
    removeToken();
    router.replace("/login");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#061a30] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/login/academy-background.jpg')" }}
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

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] gap-3 p-2 sm:gap-4 sm:p-3 lg:gap-5 lg:p-4">
        <aside className="glass-panel hidden w-[204px] shrink-0 flex-col rounded-[26px] p-3 lg:flex xl:w-[212px]">
          <Link href="/" className="flex flex-col items-center px-2 py-2 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl border border-[#d4af62]/35 bg-gradient-to-br from-[#d4af62]/20 to-[#0b2d4d]/80 text-[#e4c477] shadow-[0_0_24px_rgba(212,175,98,0.12)]">
              <Landmark className="size-8" strokeWidth={1.35} />
            </span>
            <span className="mt-2 block text-sm font-semibold tracking-wide text-[#f2d99b]">
              APA Administration
            </span>
            <span className="mt-1 block max-w-[155px] text-[0.65rem] leading-relaxed text-white/55">
              Академия государственного управления
            </span>
          </Link>

          <div className="my-3 h-px bg-white/10" />

          <nav aria-label="Главная навигация" className="space-y-1">
            {navigation.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-xs transition-all ${
                    isActive
                      ? "border border-[#e4c477]/45 bg-gradient-to-r from-[#d4af62]/35 to-[#d4af62]/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.12)]"
                      : "border border-transparent text-white/65 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <Icon
                    className={`size-[18px] ${
                      isActive ? "text-[#e4c477]" : "text-white/50 group-hover:text-white/80"
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
                <FolderKanban className="size-[17px] text-[#e4c477]" />
                <span>Публикации</span>
                <ChevronRight
                  className={`ml-auto size-3.5 transition-transform ${
                    publicationsOpen ? "rotate-90" : ""
                  }`}
                />
              </button>
              {publicationsOpen && (
                <div className="ml-[18px] mt-0.5 space-y-0.5 border-l border-white/15 pl-3">
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
                <Icon className="size-[17px] text-[#e4c477]" />
                {label}
              </div>
            ))}

            <div className="my-2 h-px bg-white/10" />
            <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-white/65">
              <ScrollText className="size-[17px] text-[#e4c477]" />
              Журнал действий
            </div>
            <div className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-white/65">
              <Settings className="size-[17px] text-[#e4c477]" />
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

        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
          <header
            className={`rounded-2xl px-3 py-3 sm:px-5 sm:py-4 ${
              pathname === "/"
                ? "flex min-h-[92px] items-center border border-white/10 bg-[#092745]/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md"
                : "glass-panel"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[#d4af62]/30 bg-[#d4af62]/10 text-[#e4c477] lg:hidden">
                  <Landmark className="size-5" />
                </span>
                <div className="min-w-0">
                  {pathname === "/" ? (
                    <>
                      <h1 className="text-lg font-semibold leading-tight text-white sm:text-2xl">
                        Добро пожаловать,{" "}
                        <span className="text-[#f0c46d]">
                          {profileName !== "Не указано" ? `${profileName}!` : "Администратор!"}
                        </span>
                      </h1>
                      <p className="mt-1 truncate text-xs text-white/80 sm:text-sm">
                        Панель управления сайтом Академии
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="hidden items-center gap-2 text-xs text-white/45 sm:flex">
                        <Link href="/" className="transition hover:text-white/80">
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
                    aria-haspopup="dialog"
                    aria-expanded={profileOpen}
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

                  {profileOpen && (
                    <motion.section
                      role="dialog"
                      aria-label="Профиль администратора"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 top-full z-50 mt-3 w-[min(19rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-[#f2d18a]/45 bg-[linear-gradient(145deg,rgba(30,65,96,0.98),rgba(12,37,63,0.98))] p-4 text-white shadow-[0_22px_60px_rgba(0,0,0,0.55),0_0_28px_rgba(242,209,138,0.14)] backdrop-blur-2xl"
                    >
                      <div className="flex items-center gap-3 border-b border-[#f2d18a]/20 pb-3">
                        {profileAvatar ? (
                          <Image
                            src={profileAvatar}
                            alt=""
                            width={48}
                            height={48}
                            unoptimized
                            className="size-12 shrink-0 rounded-full border-2 border-[#f2d18a]/75 object-cover shadow-[0_0_18px_rgba(242,209,138,0.18)]"
                          />
                        ) : (
                          <span className="flex size-12 aspect-square shrink-0 items-center justify-center rounded-full border-2 border-[#f2d18a]/75 bg-gradient-to-br from-[#f2d18a]/40 to-[#d4af62]/15 text-sm font-semibold text-[#fff1c9] shadow-[0_0_18px_rgba(242,209,138,0.18)]">
                            {profileInitials}
                          </span>
                        )}
                        <div className="min-w-0">
                          <h2 className="truncate text-sm font-semibold text-[#fff1c9]">
                            {profileName}
                          </h2>
                          <p className="mt-0.5 text-xs text-white/70">
                            Данные учётной записи
                          </p>
                        </div>
                      </div>

                      <dl className="mt-3 space-y-3">
                        {[
                          {
                            label: "ФИО",
                            value: profileName,
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
                              <dt className="text-[0.68rem] font-medium text-white/60">{label}</dt>
                              <dd className="mt-0.5 break-words text-xs font-medium text-white">
                                {value}
                              </dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                      {isProfileError && (
                        <p role="alert" className="mt-3 text-xs text-rose-200">
                          Не удалось прочитать данные профиля из токена.
                        </p>
                      )}
                    </motion.section>
                  )}
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
              {navigation.map(({ href, label, icon: Icon }) => {
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
            className="min-w-0 flex-1"
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

          <footer className="px-2 pb-1 text-center text-xs text-white/35 sm:text-left">
            APA Administration <span className="mx-1.5 text-white/20">·</span>
            Академия государственного управления
          </footer>
        </div>
      </div>
    </div>
  );
}
