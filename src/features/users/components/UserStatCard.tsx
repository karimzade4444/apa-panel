import type { UserStatCardProps } from "@/features/users/types/user-components";

export function UserStatCard({
  label,
  value,
  icon: Icon,
  tone,
}: UserStatCardProps) {
  return (
    <div
      data-slot="card"
      className="rounded-2xl border border-border bg-card p-4 text-card-foreground sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground sm:text-sm">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
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
