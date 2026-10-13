"use client";

import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import React, { createContext, useCallback, useContext, useState } from "react";

export type ToastVariant = "default" | "success" | "warning" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  type?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({
      title,
      description,
      variant,
      type,
      duration = 4500,
    }: Omit<ToastItem, "id">) => {
      const activeVariant: ToastVariant = variant || type || "default";
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, title, description, variant: activeVariant, duration };

      setToasts((prev) => [newToast, ...prev]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          let icon = <Info className="w-5 h-5 text-amber-400 shrink-0" />;
          let borderBg = "border-amber-500/40 bg-slate-900/95 text-slate-100";

          if (t.variant === "success") {
            icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
            borderBg = "border-emerald-500/50 bg-slate-900/95 text-slate-100 shadow-emerald-950/20";
          } else if (t.variant === "error") {
            icon = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
            borderBg = "border-rose-500/50 bg-slate-900/95 text-slate-100 shadow-rose-950/20";
          } else if (t.variant === "warning") {
            icon = <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />;
            borderBg = "border-amber-500/50 bg-slate-900/95 text-slate-100 shadow-amber-950/20";
          } else if (t.variant === "info") {
            icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
            borderBg = "border-sky-500/50 bg-slate-900/95 text-slate-100 shadow-sky-950/20";
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-xl backdrop-blur-md flex items-start justify-between gap-3 transition-all animate-in slide-in-from-bottom-2 fade-in duration-200 ${borderBg}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <div className="text-left space-y-0.5">
                  <h4 className="text-xs font-bold tracking-tight text-white">{t.title}</h4>
                  {t.description && (
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
