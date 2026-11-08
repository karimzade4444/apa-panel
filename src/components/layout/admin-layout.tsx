"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "./admin-shell";

const routeDetails: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Панель управления",
    description: "Обзор системы управления Академией",
  },
  "/users": {
    title: "Пользователи",
    description: "Управление пользователями системы",
  },
};

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const details = routeDetails[pathname] ?? routeDetails["/"];

  return (
    <AdminShell
      title={details.title}
      description={details.description}
      showPageHeading={pathname !== "/"}
      fitViewport
    >
      {children}
    </AdminShell>
  );
}
