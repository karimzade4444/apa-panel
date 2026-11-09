import { GlassSkeleton } from "./glass-skeleton";

const cards = ["users", "active", "admins", "blocked"];

export function UserStatsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Загрузка статистики пользователей"
      aria-busy="true"
      className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4"
    >
      {cards.map((card) => (
        <div
          key={card}
          aria-hidden="true"
          className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted p-4 sm:p-5"
        >
          <div className="min-w-0 flex-1 space-y-3">
            <GlassSkeleton variant="line" className="h-3 w-28 rounded-md" />
            <GlassSkeleton variant="line" className="h-7 w-16 rounded-md" />
          </div>
          <GlassSkeleton variant="block" className="size-10 shrink-0 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
