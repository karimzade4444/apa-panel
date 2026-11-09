import { Activity } from "lucide-react";

import { GlassSkeleton } from "./glass-skeleton";

export function PublicationChartSkeleton() {
  return (
    <section
      role="status"
      aria-label="Загрузка статистики пользователей"
      aria-busy="true"
      className="glass-panel flex min-h-0 flex-col overflow-hidden rounded-[18px] p-3.5 sm:p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white sm:text-base">
          <Activity className="size-4.5 text-sky-200" />
          Статистика пользователей
        </h2>
        <GlassSkeleton variant="line" className="h-5 w-24 rounded-full" />
      </div>

      <div className="mt-3 grid min-h-0 flex-1 grid-cols-3 gap-3 sm:gap-5">
        {["active", "admins", "blocked"].map((item) => (
          <div
            key={item}
            aria-hidden="true"
            className="flex min-w-0 flex-col items-center justify-end"
          >
            <GlassSkeleton variant="line" className="mb-2 h-3 w-8 rounded-md" />
            <div className="relative flex h-19 w-full items-end justify-center border-b border-l border-white/20 sm:h-24">
              <GlassSkeleton className="h-2/3 w-[45%] max-w-12 rounded-t-[5px] rounded-b-none" />
            </div>
            <GlassSkeleton variant="line" className="mt-2 h-3 w-20 rounded-md" />
          </div>
        ))}
      </div>

      <div className="mt-2 border-t border-white/10 pt-2">
        <GlassSkeleton variant="line" className="h-2.5 w-3/4 rounded-md" />
      </div>
    </section>
  );
}
