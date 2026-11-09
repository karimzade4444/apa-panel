"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { GlassProvider } from "@/components/ui/glassyui/glass-provider";
import { GlassToaster } from "@/components/ui/glassyui/glass-toaster";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [client] = useState(
    new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    }),
  );
  return (
    <QueryClientProvider client={client}>
      <GlassProvider defaultTheme="dark">
        <GlassToaster>{children}</GlassToaster>
      </GlassProvider>
    </QueryClientProvider>
  );
}
