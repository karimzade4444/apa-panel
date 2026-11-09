import { GlassSkeleton } from "./glass-skeleton";

export function WelcomeSkeleton() {
  return (
    <GlassSkeleton
      variant="line"
      className="inline-block h-5 w-28 align-middle sm:h-7 sm:w-36"
    />
  );
}
