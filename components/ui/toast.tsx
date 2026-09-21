"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { CheckCircle, AlertCircle, Info, TriangleAlert, X } from "lucide-react";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, typeof Info> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: TriangleAlert,
};

const COLORS: Record<
  ToastVariant,
  { bg: string; border: string; color: string; icon: string }
> = {
  success: {
    bg: "#fff",
    border: "#c8e6c9",
    color: "var(--espresso)",
    icon: "#388e3c",
  },
  error: {
    bg: "#fff",
    border: "#f48fb1",
    color: "var(--espresso)",
    icon: "#e53935",
  },
  info: {
    bg: "#fff",
    border: "#90caf9",
    color: "var(--espresso)",
    icon: "#1976d2",
  },
  warning: {
    bg: "#fff",
    border: "#ffe082",
    color: "var(--espresso)",
    icon: "#f9a825",
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const Icon = ICONS[toast.variant];
  const c = COLORS[toast.variant];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      className="toast-item"
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 10,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.color,
        boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        minWidth: 280,
        maxWidth: 400,
        animation: "toast-in 0.25s ease",
      }}
    >
      <Icon size={18} style={{ color: c.icon, flexShrink: 0, marginTop: 1 }} />
      <p style={{ flex: 1, margin: 0, fontSize: 14, lineHeight: 1.5 }}>
        {toast.message}
      </p>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "var(--taupe)",
          flexShrink: 0,
        }}
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    [],
  );

  const value: ToastContextValue = {
    toast: add,
    success: (m) => add(m, "success"),
    error: (m) => add(m, "error"),
    info: (m) => add(m, "info"),
    warning: (m) => add(m, "warning"),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — bottom right */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: toasts.length ? "auto" : "none",
        }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
