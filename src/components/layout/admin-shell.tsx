"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

import { AdminSidebar } from "./admin-sidebar";
import AdminTopbar from "./admin-topbar";
import type { AdminShellProps } from "./admin-shell.types";

export function AdminShell({
  title,
  description,
  children,
  showPageHeading = true,
  fitViewport = false,
}: AdminShellProps) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={`relative w-full overflow-hidden text-white ${
        fitViewport ? "min-h-screen lg:h-dvh lg:min-h-0" : "min-h-screen"
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 bg-cover bg-center"
      />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -left-40 top-1/3 h-96 w-96 rounded-full bg-sky-400/10 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed -right-40 bottom-0 h-96 w-96 rounded-full bg-amber-300/10 blur-[120px]"
      />

      <div
        className={`relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] gap-3 p-2 sm:gap-4 sm:p-3 lg:gap-5 lg:p-4 ${
          fitViewport ? "lg:h-full lg:min-h-0" : ""
        }`}
      >
        <AdminSidebar pathname={pathname} fitViewport={fitViewport} />

        <div
          className={`flex min-w-0 flex-1 flex-col gap-3 sm:gap-4 ${
            fitViewport ? "lg:min-h-0" : ""
          }`}
        >
          <AdminTopbar title={title} description={description} />

          <motion.main
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`min-w-0 flex-1 ${
              fitViewport
                ? "lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden"
                : ""
            }`}
          >
            {showPageHeading && (
              <div className="mb-4 px-1 sm:px-2">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {title}
                </h1>
                <p className="mt-1 text-sm text-white/55">{description}</p>
              </div>
            )}
            {children}
          </motion.main>

          <footer
            className={`px-2 pb-1 text-center text-xs text-white/35 sm:text-left ${fitViewport ? "lg:hidden" : ""}`}
          >
            APA Administration <span className="mx-1.5 text-white/20">·</span>
            Академия государственного управления
          </footer>
        </div>
      </div>
    </div>
  );
}
