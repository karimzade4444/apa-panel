"use client";

import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { GlassPanel } from "@/components/ui/glassyui/glass-panel";
import { usePreferences } from "@/components/ui/glassyui/glass-provider";

type Props = { className?: string };

export default function ThemeToggle({ className = "" }: Props) {
  const { preferences, setPreferences } = usePreferences();
  const shouldReduceMotion = useReducedMotion();
  const dark = preferences.theme === "dark";

  const toggle = () => {
    const theme = dark ? "light" : "dark";
    setPreferences({ theme });
    document.documentElement.classList.toggle("dark", theme === "dark");
  };

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: -6, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <GlassPanel
        variant="pill"
        preset="control"
        elevation="raised"
        interactive
        className="size-10 shrink-0 rounded-full p-0"
      >
        <motion.button
          type="button"
          aria-label={
            dark ? "Переключить на светлую тему" : "Переключить на тёмную тему"
          }
          onClick={toggle}
          className="flex size-full items-center justify-center rounded-full text-white/75 transition-colors hover:text-[#f2d18a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2d18a]/80 focus-visible:ring-inset"
          whileHover={shouldReduceMotion ? undefined : { scale: 1.06 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={dark ? "dark" : "light"}
              aria-hidden="true"
              initial={
                shouldReduceMotion
                  ? false
                  : { opacity: 0, scale: 0.6, rotate: -45 }
              }
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={
                shouldReduceMotion
                  ? undefined
                  : { opacity: 0, scale: 0.6, rotate: 45 }
              }
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex"
            >
              {dark ? (
                <Sun className="size-[1.125rem]" />
              ) : (
                <Moon className="size-[1.125rem]" />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </GlassPanel>
    </motion.div>
  );
}
