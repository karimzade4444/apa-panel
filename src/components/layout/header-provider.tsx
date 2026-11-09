"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";

const routeDetails: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Панель управления",
    description: "Обзор системы управления Академией",
  },
  "/users": {
    title: "Пользователи",
    description: "Управление пользователями системы",
  },
  "/users/create": {
    title: "Создание пользователя",
    description: "Добавление новой учетной записи в систему",
  },
};

export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const details =
    routeDetails[pathname] ??
    (pathname.endsWith("/edit")
      ? {
          title: "Редактирование пользователя",
          description: "Изменение данных учетной записи",
        }
      : routeDetails["/"]);

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
