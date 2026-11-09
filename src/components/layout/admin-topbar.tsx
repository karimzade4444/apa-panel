"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import {
  Bell,
  Landmark,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { getUsers } from "@/api/users";
import ThemeToggle from "@/components/ThemeToggle";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  GlassAlert,
  GlassHeader,
} from "@/components/ui/glassyui";
import {
  getActorIdentifiers,
  getClaim,
  getProfileAvatar,
  getProfileEmail,
  getProfileFirstName,
  getProfileFullName,
  getProfileInitials,
  getProfilePhone,
  getProfileRole,
  getProfileUserName,
} from "@/lib/auth";
import { resolveApiAssetUrl } from "@/lib/api-assets";
import { removeToken } from "@/lib/cookies";
import { WelcomeSkeleton } from "@/components/skeletons/welcome-skeleton";
import { adminNavigation } from "@/config/navigation";
import { useCan } from "@/hooks/use-can";
import { ProfileSkeleton } from "./profile-skeleton";

export default function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [date, setDate] = useState("");
  const profileRef = useRef<HTMLDivElement>(null);

  const {
    can,
    claims: profileClaims,
    isError: isProfileError,
    isLoading: isProfileLoading,
    role,
  } = useCan();
  const claims = profileClaims ?? null;
  const profileIdentifiers = getActorIdentifiers(claims);
  const profileLookupTerm =
    getProfileUserName(claims) ||
    getProfileEmail(claims) ||
    getClaim(
      claims,
      "sub",
      "id",
      "userId",
      "user_id",
      "uid",
      "nameid",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
    );
  const canLookupProfile = Boolean(role);
  const {
    data: profileUsers,
    isError: isProfileUserError,
    isLoading: isProfileUserLoading,
  } = useQuery({
    queryKey: ["auth-profile-user", profileLookupTerm],
    queryFn: () => getUsers(profileLookupTerm),
    enabled: canLookupProfile && Boolean(profileLookupTerm),
    retry: false,
    staleTime: Infinity,
  });
  const profileUser =
    profileUsers?.items.find((user) =>
      [user.id, user.userName, user.email, user.fullName]
        .filter(Boolean)
        .some((value) =>
          profileIdentifiers.includes(value.trim().toLowerCase()),
        ),
    ) ?? null;
  const profileFullName =
    profileUser?.fullName?.trim() ||
    [profileUser?.firstName, profileUser?.middleName, profileUser?.lastName]
      .filter(Boolean)
      .join(" ") ||
    getProfileFullName(claims);
  const profileFirstName =
    profileUser?.firstName?.trim() || getProfileFirstName(claims);
  const isGreetingLoading =
    isProfileLoading ||
    (canLookupProfile && isProfileUserLoading && !getProfileFirstName(claims));
  const profileInitials = getProfileInitials(profileFullName);
  const profileUserName = profileUser?.userName || getProfileUserName(claims);
  const profileEmail = profileUser?.email || getProfileEmail(claims);
  const profilePhone = profileUser?.phoneNumber || getProfilePhone(claims);
  const profileAvatar = resolveApiAssetUrl(
    profileUser?.photoUrl || getProfileAvatar(claims),
  );
  const profileRole = getProfileRole(claims);
  const profileErrorMessage = isProfileError
    ? "Не удалось прочитать профиль из токена."
    : isProfileUserError && !profileUser
      ? "Не удалось загрузить данные профиля."
      : "";

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
    queryClient.removeQueries({ queryKey: ["auth-profile-user"] });
    queryClient.removeQueries({ queryKey: ["users"] });
    removeToken();
    router.replace("/login");
  };

  return (
    <>
      <GlassHeader
        position="static"
        className="z-50 h-auto min-h-23 max-w-none rounded-2xl"
        brand={
          <div className="w-full whitespace-normal">
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-gold-light/30 bg-gold-light/10 text-primary lg:hidden">
              <Landmark className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h1
                aria-busy={isGreetingLoading}
                className="text-lg font-semibold leading-tight text-foreground sm:text-2xl"
              >
                Добро пожаловать,{" "}
                {isGreetingLoading ? (
                  <WelcomeSkeleton />
                ) : (
                  <span className="text-primary">
                    {profileFirstName
                      ? `${profileFirstName}!`
                      : "Администратор!"}
                  </span>
                )}
              </h1>
              <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                Панель управления сайтом Академии
              </p>
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs capitalize text-muted-foreground">{date}</p>
            </div>
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Уведомления"
              className="relative text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Bell className="size-4.5" />
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
                className="size-10 rounded-full p-0 hover:bg-accent"
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
                  <span className="flex size-10 aspect-square items-center justify-center rounded-full border-2 border-[#f2d18a]/80 bg-linear-to-br from-[#f2d18a]/45 via-gold-light/30 to-[#173c5d] text-xs font-semibold text-primary shadow-[0_0_20px_rgba(242,209,138,0.3)]">
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
                    className="absolute right-0 top-full z-9999 mt-3 w-[min(18rem,calc(100vw-2rem))] origin-top-right rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-[var(--glass-blur)]"
                  >
                    {isProfileLoading ||
                    (canLookupProfile && isProfileUserLoading && !profileUser) ? (
                      <ProfileSkeleton />
                    ) : (
                      <>
                    <div className="flex items-center gap-3 border-b border-border pb-3">
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
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-[#f2d18a]/70 bg-gold-light/20 text-xs font-semibold text-primary">
                          {profileInitials}
                        </span>
                      )}
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-primary">
                          {profileFullName}
                        </h2>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {profileRole}
                        </p>
                      </div>
                    </div>

                    <dl className="mt-3 space-y-3">
                      {[
                        {
                          label: "ФИО",
                          value: profileFullName,
                          icon: UsersRound,
                        },
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
                          value: profileRole,
                          icon: ShieldCheck,
                        },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-start gap-2.5">
                          <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
                          <div className="min-w-0">
                            <dt className="text-[0.68rem] text-muted-foreground">
                              {label}
                            </dt>
                            <dd className="mt-0.5 wrap-break-word text-xs font-medium text-foreground">
                              {value}
                            </dd>
                          </div>
                        </div>
                      ))}
                    </dl>
                    {profileErrorMessage && (
                      <GlassAlert
                        tone="danger"
                        className="mt-3 text-xs"
                      >
                        {profileErrorMessage}
                      </GlassAlert>
                    )}
                      </>
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
              onClick={() => setLogoutConfirmOpen(true)}
              className="text-muted-foreground hover:bg-accent hover:text-primary"
            >
              <LogOut className="size-4.5" />
            </Button>
          </div>
        </div>

        <nav
          aria-label="Мобильная навигация"
          className="mt-4 flex gap-2 overflow-x-auto border-t border-border pt-3 lg:hidden"
        >
          {adminNavigation.filter((item) => can(item.permission)).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                  isActive
                    ? "bg-gold-light/20 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
          </div>
        }
      />

      <AlertDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
      >
        <AlertDialogContent className="p-6 text-muted-foreground">
          <AlertDialogHeader>
            <span className="mb-1 flex size-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 text-primary">
              <LogOut className="size-5" />
            </span>
            <AlertDialogTitle className="text-lg text-foreground">
              Выйти из аккаунта?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              Вы действительно хотите завершить текущий сеанс?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
              className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Остаться
            </Button>
            <Button
              type="button"
              onClick={() => {
                setLogoutConfirmOpen(false);
                window.setTimeout(handleLogout, 300);
              }}
              className="gap-2 bg-primary font-semibold text-primary-foreground hover:bg-primary"
            >
              <LogOut className="size-4" />
              Выйти
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
