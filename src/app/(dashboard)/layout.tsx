"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { AdminShell } from "@/widgets/header/admin-shell";

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

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const details = routeDetails[pathname] ?? routeDetails["/"];
  const isDashboardHome = pathname === "/";

  return (
    <AdminShell
      title={details.title}
      description={details.description}
      showPageHeading={!isDashboardHome}
      fitViewport
    >
      {children}
    </AdminShell>
  );
}
