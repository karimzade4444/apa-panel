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
      className="glass-panel h-fit min-w-0 rounded-2xl p-3.5 xl:col-start-2 xl:row-start-1"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {getUserName(user)}
            </h2>
            <p className="truncate text-[0.65rem] text-white/50">
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

      <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3">
        <div>
          <p className="text-[0.65rem] text-white/45">Email</p>
          <p className="mt-0.5 break-all text-xs text-white/85">
            {user.email || "Не указан"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {details.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-start gap-1.5">
              <Icon className="mt-0.5 size-3.5 shrink-0 text-[#e4c477]" />
              <div className="min-w-0">
                <p className="text-[0.62rem] text-white/45">{label}</p>
                <p className="truncate text-xs text-white/85">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {canManageActions && (
        <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-white/10 pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onEdit}
            className="h-auto min-h-9 flex-col gap-1 whitespace-normal border-white/15 bg-white/5 px-1.5 py-1.5 text-[0.62rem] leading-tight text-white hover:bg-white/10"
          >
            <Pencil className="size-3.5" />
            Изменить
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onToggleBlocked}
            className="h-auto min-h-9 flex-col gap-1 whitespace-normal border-white/15 bg-white/5 px-1.5 py-1.5 text-[0.62rem] leading-tight text-white hover:bg-white/10"
          >
            {user.isBlocked ? (
              <Check className="size-3.5" />
            ) : (
              <Ban className="size-3.5" />
            )}
            {user.isBlocked ? "Разблокировать" : "Заблокировать"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={onDelete}
            className="h-auto min-h-9 flex-col gap-1 whitespace-normal px-1.5 py-1.5 text-[0.62rem] leading-tight"
          >
            <Trash2 className="size-3.5" />
            Удалить пользователя
          </Button>
        </div>
      )}
    </motion.aside>
  );
}
