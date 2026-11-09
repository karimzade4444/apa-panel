import { GlassSkeleton } from "./glass-skeleton";

interface UserTableSkeletonProps {
  rows?: number;
}

export function UserTableSkeleton({ rows = 5 }: UserTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        <tr key={row} aria-hidden="true">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <GlassSkeleton variant="circle" className="size-10 shrink-0" />
              <div className="min-w-0 flex-1 space-y-2">
                <GlassSkeleton variant="line" className="h-3 w-28 rounded-md" />
                <GlassSkeleton variant="line" className="h-2.5 w-20 rounded-md" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <GlassSkeleton variant="line" className="h-3 w-32 rounded-md" />
          </td>
          <td className="px-4 py-4">
            <GlassSkeleton variant="line" className="h-6 w-20 rounded-full" />
          </td>
          <td className="px-4 py-4">
            <GlassSkeleton variant="line" className="h-6 w-16 rounded-full" />
          </td>
          <td className="px-4 py-4">
            <GlassSkeleton variant="line" className="h-3 w-24 rounded-md" />
          </td>
          <td className="px-4 py-4 text-right">
            <GlassSkeleton
              variant="block"
              className="ml-auto size-8 rounded-lg"
            />
          </td>
        </tr>
      ))}
    </>
  );
}
