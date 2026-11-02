"use client";

import { motion } from "motion/react";

export function LoginSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" />
      <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" />
      <div className="h-10 w-full animate-pulse rounded-xl bg-[#d4af62]/20" />
      <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
    </motion.div>
  );
}
