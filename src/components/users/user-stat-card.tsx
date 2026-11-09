import type { UserStatCardProps } from "@/types/user-components";
import { GlassPanel } from "@/components/ui/glassyui";

export function UserStatCard({
  label,
  value,
  icon: Icon,
  tone,
}: UserStatCardProps) {
  return (
    <GlassPanel variant="card" className="p-4 text-card-foreground sm:p-5">
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
    </GlassPanel>
  );
}
