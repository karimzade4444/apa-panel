"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

interface LoginCardProps {
  children: ReactNode;
}

export default function LoginCard({ children }: LoginCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !ref.current) return;

    const bounds = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--mx", `${e.clientX - bounds.left}px`);
    ref.current.style.setProperty("--my", `${e.clientY - bounds.top}px`);
  };

  return (
    <motion.section
      ref={ref}
      onMouseMove={onMove}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 35, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group/card relative isolate w-full overflow-hidden rounded-[30px] border border-white/20 bg-white/8 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-[30px] sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{
          background:
            "radial-gradient(320px circle at var(--mx,50%) var(--my,0%), rgba(212,175,98,0.18), transparent 70%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-[30px] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.02),rgba(201,164,92,0.04))]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[15%] top-0 h-px w-[70%] bg-linear-to-r from-transparent via-[#f1d18b] to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-16 -z-10 h-52 w-52 rounded-full bg-gold-light/10 blur-[80px]"
      />

      <div className="relative z-10">{children}</div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/2 -z-10 h-32 w-3/4 -translate-x-1/2 rounded-full bg-gold-light/10 blur-[70px]"
      />
    </motion.section>
  );
}
