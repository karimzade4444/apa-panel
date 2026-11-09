import { motion } from "motion/react";
import {
  Ban,
  CalendarDays,
  Check,
  Pencil,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UserRoundX,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glassyui";
import { formatDate, formatRole, getUserName } from "@/lib/user-utils";
import type { UserDetailsPanelProps } from "@/types/user-components";
import { UserAvatar } from "./user-avatar";

export function UserDetailsPanel({
  user,
  onClose,
  reduceMotion,
  onEdit,
  onToggleBlocked,
  onDelete,
  isPending,
  canManageActions,
}: UserDetailsPanelProps) {
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
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 20 }}
      transition={{
        duration: reduceMotion ? 0.12 : 0.22,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative isolate h-fit min-w-0 p-3.5 xl:col-start-2 xl:row-start-1"
    >
      <GlassPanel aria-hidden className="absolute inset-0 -z-10" />
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-foreground">
              {getUserName(user)}
            </h2>
            <p className="truncate text-[0.65rem] text-muted-foreground">
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
          className="shrink-0 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-3 space-y-2.5 border-t border-border pt-3">
        <div>
          <p className="text-[0.65rem] text-muted-foreground">Email</p>
          <p className="mt-0.5 break-all text-xs text-foreground">
            {user.email || "Не указан"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-start gap-1.5">
              <Icon className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-[0.62rem] text-muted-foreground">{label}</p>
                <p className="truncate text-xs text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canManageActions && (
        <div className="mt-3 space-y-2 border-t border-border pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onEdit}
              className="h-auto min-h-10 flex-col gap-1 whitespace-normal border-border bg-muted px-2 py-1.5 text-xs leading-tight text-muted-foreground hover:bg-accent"
            >
              <Pencil className="size-3.5" />
              Изменить
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onToggleBlocked}
              className="h-auto min-h-10 flex-col gap-1 whitespace-normal border-border bg-muted px-2 py-1.5 text-xs leading-tight text-muted-foreground hover:bg-accent"
            >
              {user.isBlocked ? (
                <Check className="size-3.5" />
              ) : (
                <Ban className="size-3.5" />
              )}
              {user.isBlocked ? "Разблокировать" : "Заблокировать"}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={onDelete}
            className="h-10 w-full border border-rose-600/60 bg-transparent px-3 text-xs font-medium text-rose-700 hover:border-rose-700 hover:bg-transparent hover:text-rose-800 dark:border-rose-400/60 dark:text-rose-300 dark:hover:border-rose-300 dark:hover:bg-transparent dark:hover:text-rose-200"
          >
            <Trash2 className="size-3.5" />
            Удалить пользователя
          </Button>
        </div>
      )}
    </motion.aside>
  );
}
