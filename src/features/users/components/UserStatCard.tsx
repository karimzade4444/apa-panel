import type { UserStatCardProps } from "@/features/users/types/user-components";

export function UserStatCard({ label, value, icon: Icon, tone }: UserStatCardProps) {
  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-white/55 sm:text-sm">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
