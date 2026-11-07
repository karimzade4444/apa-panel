import type { ReactNode } from "react";

export interface AdminShellProps {
  title: string;
  description: string;
  children: ReactNode;
  showPageHeading?: boolean;
  fitViewport?: boolean;
}

export interface AdminSidebarProps {
  pathname: string;
  fitViewport: boolean;
}
