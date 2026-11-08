"use client";

import { AlertCircle, Check } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  GlassToast,
  GlassToastClose,
  GlassToastDescription,
  GlassToastProvider as ToastProvider,
  GlassToastTitle,
  GlassToastViewport,
} from "./glass-toast";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  type: "success" | "error";
  open: boolean;
}

interface GlassToastContextValue {
  success: (title: string, options?: { description?: string }) => void;
  error: (title: string) => void;
}

const GlassToastContext = createContext<GlassToastContextValue | null>(null);
const TOAST_DURATION = 5000;
const TOAST_EXIT_DURATION = 250;

export function useGlassToast() {
  const context = useContext(GlassToastContext);

  if (!context) {
    throw new Error("useGlassToast must be used within GlassToaster");
  }

  return context;
}

export function GlassToaster({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);

    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, open: false } : toast,
      ),
    );

    timers.current.set(
      id,
      setTimeout(() => {
        timers.current.delete(id);
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, TOAST_EXIT_DURATION),
    );
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, "id" | "open">) => {
      const id = ++nextId.current;
      setToasts((current) => [...current, { ...toast, id, open: true }]);
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), TOAST_DURATION),
      );
    },
    [dismissToast],
  );

  const value = {
    success: (title: string, options?: { description?: string }) =>
      addToast({ title, description: options?.description, type: "success" }),
    error: (title: string) => addToast({ title, type: "error" }),
  };

  return (
    <GlassToastContext.Provider value={value}>
      <ToastProvider duration={Infinity} swipeDirection="right">
        {children}
        {toasts.length > 0 && (
          <GlassToastViewport aria-label="Уведомления" />
        )}
        {toasts.map((toast) => (
          <GlassToast
            key={toast.id}
            open={toast.open}
            onOpenChange={(open) => {
              if (!open) dismissToast(toast.id);
            }}
          >
            <span
              aria-hidden="true"
              className={
                toast.type === "success"
                  ? "text-emerald-300"
                  : "text-red-300"
              }
            >
              {toast.type === "success" ? (
                <Check className="size-4" />
              ) : (
                <AlertCircle className="size-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <GlassToastTitle>{toast.title}</GlassToastTitle>
              {toast.description && (
                <GlassToastDescription>
                  {toast.description}
                </GlassToastDescription>
              )}
            </div>
            <GlassToastClose />
          </GlassToast>
        ))}
      </ToastProvider>
    </GlassToastContext.Provider>
  );
}
