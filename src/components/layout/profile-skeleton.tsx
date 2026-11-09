import { GlassSkeleton } from "@/components/ui/glassyui";

export function ProfileSkeleton() {
  return (
    <div role="status" aria-label="Загрузка профиля" aria-busy="true">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <GlassSkeleton variant="circle" className="size-11 shrink-0" />
        <div className="min-w-0 flex-1 space-y-2">
          <GlassSkeleton variant="line" className="h-3.5 w-32 rounded-md" />
          <GlassSkeleton variant="line" className="h-2.5 w-20 rounded-md" />
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {["name", "username", "email", "phone", "role"].map((item) => (
          <div key={item} aria-hidden="true" className="flex gap-2.5">
            <GlassSkeleton
              variant="block"
              className="mt-0.5 size-4 shrink-0 rounded"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <GlassSkeleton variant="line" className="h-2.5 w-16 rounded-md" />
              <GlassSkeleton variant="line" className="h-3 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
