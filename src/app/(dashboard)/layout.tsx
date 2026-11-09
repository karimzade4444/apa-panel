import { DashboardHeaderProvider } from "@/components/layout/header-provider";
import { Suspense, type ReactNode } from "react";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardHeaderProvider>{children}</DashboardHeaderProvider>
    </Suspense>
  );
}
