"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { useEffect, useState } from "react";

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
  GlassAvatar,
  GlassButton,
  GlassHeader,
  GlassPopover,
  GlassPopoverContent,
  GlassPopoverTrigger,
  GlassSkeleton,
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
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [date, setDate] = useState("");

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
  const isProfileAvatarLoading =
    isProfileLoading || (canLookupProfile && isProfileUserLoading);
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
          <div className="min-w-0 flex-1 whitespace-normal">
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

            <nav
              aria-label="Мобильная навигация"
              className="mt-4 flex gap-2 overflow-x-auto border-t border-border pt-3 lg:hidden"
            >
              {adminNavigation
                .filter((item) => can(item.permission))
                .map(({ href, label, icon: Icon }) => {
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
        actions={
          <div className="flex shrink-0 items-center justify-end gap-1.5 sm:gap-3">
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
            <GlassPopover open={profileOpen} onOpenChange={setProfileOpen}>
              <GlassPopoverTrigger asChild>
                <GlassButton
                  type="button"
                  variant="ghost"
                  size="md"
                  aria-label="Открыть профиль администратора"
                  aria-busy={isProfileAvatarLoading}
                  className="size-10 rounded-full p-0 hover:bg-accent"
                >
                  {isProfileAvatarLoading ? (
                    <GlassSkeleton
                      variant="circle"
                      className="size-10 shrink-0"
                    />
                  ) : (
                    <GlassAvatar
                      src={profileAvatar ?? undefined}
                      alt={profileFullName}
                      name={
                        profileFullName || profileUserName || "Администратор"
                      }
                      fallback={profileInitials}
                    />
                  )}
                </GlassButton>
              </GlassPopoverTrigger>
              <GlassPopoverContent
                align="end"
                aria-label="Профиль администратора"
                className="w-[min(18rem,calc(100vw-2rem))] p-4 text-popover-foreground"
              >
                {isProfileLoading ||
                (canLookupProfile && isProfileUserLoading && !profileUser) ? (
                  <ProfileSkeleton />
                ) : (
                  <>
                    <div className="flex items-center gap-3 border-b border-border pb-3">
                      <GlassAvatar
                        src={profileAvatar ?? undefined}
                        alt={profileFullName}
                        name={
                          profileFullName || profileUserName || "Администратор"
                        }
                        fallback={profileInitials}
                      />
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
                      <GlassAlert tone="danger" className="mt-3 text-xs">
                        {profileErrorMessage}
                      </GlassAlert>
                    )}
                  </>
                )}
              </GlassPopoverContent>
            </GlassPopover>
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
