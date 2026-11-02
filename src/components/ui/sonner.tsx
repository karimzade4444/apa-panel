"use client";

import { Check } from "lucide-react";
import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      closeButton
      position="top-right"
      theme="dark"
      toastOptions={{
        classNames: {
          toast: "login-glass-toast",
          title: "login-glass-toast-title",
          description: "login-glass-toast-description",
          closeButton: "login-glass-toast-close",
        },
      }}
      icons={{
        success: (
          <span className="flex h-8 w-8 items-center  justify-center rounded-full border border-[#d4af62]/40 bg-[#d4af62]/15 text-[#f2d99b]">
            <Check aria-hidden="true" className="h-4 w-4" />
          </span>
        ),
      }}
    />
  );
}
