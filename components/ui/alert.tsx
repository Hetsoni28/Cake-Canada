"use client";

import { type ReactNode } from "react";
import { AlertCircle, CheckCircle, Info, TriangleAlert, X } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

const CONFIG: Record<
  AlertVariant,
  {
    icon: typeof Info;
    bg: string;
    border: string;
    color: string;
    iconColor: string;
  }
> = {
  info: {
    icon: Info,
    bg: "#e3f2fd",
    border: "#90caf9",
    color: "#1565c0",
    iconColor: "#1976d2",
  },
  success: {
    icon: CheckCircle,
    bg: "#e8f5e9",
    border: "#c8e6c9",
    color: "#2e7d32",
    iconColor: "#388e3c",
  },
  warning: {
    icon: TriangleAlert,
    bg: "#fff8e1",
    border: "#ffe082",
    color: "#f57f17",
    iconColor: "#f9a825",
  },
  error: {
    icon: AlertCircle,
    bg: "#fce4ec",
    border: "#f48fb1",
    color: "#c62828",
    iconColor: "#e53935",
  },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}

export function Alert({
  variant = "info",
  title,
  children,
  onClose,
  style = {},
}: AlertProps) {
  const c = CONFIG[variant];
  const Icon = c.icon;

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 16px",
        borderRadius: 10,
        border: `1px solid ${c.border}`,
        background: c.bg,
        color: c.color,
        fontSize: 14,
        lineHeight: 1.6,
        ...style,
      }}
    >
      <Icon
        size={18}
        style={{ color: c.iconColor, flexShrink: 0, marginTop: 1 }}
      />
      <div style={{ flex: 1 }}>
        {title && (
          <p style={{ fontWeight: 600, margin: "0 0 4px", fontSize: 14 }}>
            {title}
          </p>
        )}
        <div style={{ margin: 0 }}>{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: c.color,
            opacity: 0.7,
            flexShrink: 0,
          }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
