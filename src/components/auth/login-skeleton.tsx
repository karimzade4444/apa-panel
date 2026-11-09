"use client";

import { motion } from "motion/react";
import { GlassSkeleton } from "@/components/skeletons/glass-skeleton";

export function LoginSkeleton() {
  return (
    <motion.div
      role="status"
      aria-label="Выполняется вход"
      aria-busy="true"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <GlassSkeleton variant="block" className="h-12 w-full rounded-xl" />
      <GlassSkeleton variant="block" className="h-12 w-full rounded-xl" />
      <GlassSkeleton
        variant="block"
        className="h-10 w-full rounded-xl bg-[#d4af62]/20"
      />
      <GlassSkeleton variant="line" className="h-3 w-2/3" />
    </motion.div>
  );
}
