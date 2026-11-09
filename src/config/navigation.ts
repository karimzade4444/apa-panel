import {
  LayoutDashboard,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { PermissionAction } from "./permissions";

export interface NavigationItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: PermissionAction;
}

export const adminNavigation: NavigationItem[] = [
  {
    href: "/",
    label: "Панель управления",
    icon: LayoutDashboard,
    permission: PermissionAction.ViewDashboard,
  },
  {
    href: "/users",
    label: "Пользователи",
    icon: UsersRound,
    permission: PermissionAction.ViewUsers,
  },
];
