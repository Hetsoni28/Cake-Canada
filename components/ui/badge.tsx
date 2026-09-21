"use client";

import { type ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "outline";

const VARIANT_STYLES: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "var(--cream)",
    color: "var(--espresso)",
    border: "1px solid var(--border)",
  },
  success: {
    background: "#e8f5e9",
    color: "#2e7d32",
    border: "1px solid #c8e6c9",
  },
  warning: {
    background: "#fff8e1",
    color: "#f57f17",
    border: "1px solid #ffe082",
  },
  error: {
    background: "#fce4ec",
    color: "#c62828",
    border: "1px solid #f48fb1",
  },
  info: {
    background: "#e3f2fd",
    color: "#1565c0",
    border: "1px solid #90caf9",
  },
  outline: {
    background: "transparent",
    color: "var(--espresso)",
    border: "1px solid var(--border)",
  },
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  style?: React.CSSProperties;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  dot = false,
  style = {},
}: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: dot ? 6 : 0,
        padding: size === "sm" ? "3px 8px" : "5px 12px",
        borderRadius: 20,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 600,
        letterSpacing: 0.4,
        whiteSpace: "nowrap",
        ...VARIANT_STYLES[variant],
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: VARIANT_STYLES[variant].color as string,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}

// ─── Order status badge ────────────────────────────────────────
const ORDER_STATUS_MAP: Record<string, BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PREPARING: "info",
  READY: "success",
  DELIVERED: "success",
  CANCELLED: "error",
  REFUNDED: "outline",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={ORDER_STATUS_MAP[status] ?? "default"} dot>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}

// ─── Payment status badge ──────────────────────────────────────
const PAYMENT_STATUS_MAP: Record<string, BadgeVariant> = {
  PENDING: "warning",
  PAID: "success",
  FAILED: "error",
  REFUNDED: "outline",
};

export function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={PAYMENT_STATUS_MAP[status] ?? "default"} size="sm">
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
