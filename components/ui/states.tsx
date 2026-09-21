"use client";

import { type ReactNode } from "react";
import {
  ShoppingBag,
  Search,
  Heart,
  Package,
  Inbox,
  ImageOff,
} from "lucide-react";

type EmptyVariant =
  | "cart"
  | "search"
  | "wishlist"
  | "orders"
  | "general"
  | "images";

const ICONS: Record<EmptyVariant, typeof ShoppingBag> = {
  cart: ShoppingBag,
  search: Search,
  wishlist: Heart,
  orders: Package,
  general: Inbox,
  images: ImageOff,
};

interface EmptyStateProps {
  variant?: EmptyVariant;
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  style?: React.CSSProperties;
}

export function EmptyState({
  variant = "general",
  title,
  description,
  action,
  icon,
  style = {},
}: EmptyStateProps) {
  const Icon = ICONS[variant];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "60px 32px",
        ...style,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "var(--cream)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        {icon ?? (
          <Icon size={32} style={{ color: "var(--taupe)", opacity: 0.6 }} />
        )}
      </div>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 18,
          fontFamily: "var(--font-heading)",
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: "0 0 24px",
            color: "var(--taupe)",
            fontSize: 14,
            maxWidth: 320,
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────
interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: React.CSSProperties;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We ran into an unexpected issue. Please try again.",
  onRetry,
  style = {},
}: ErrorStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "60px 32px",
        ...style,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#fce4ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
          fontSize: 32,
        }}
      >
        ⚠️
      </div>
      <h3
        style={{
          margin: "0 0 8px",
          fontSize: 18,
          fontFamily: "var(--font-heading)",
          fontWeight: 500,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          margin: "0 0 24px",
          color: "var(--taupe)",
          fontSize: 14,
          maxWidth: 320,
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
      {onRetry && (
        <button className="btn btn-dark" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Loading State ─────────────────────────────────────────────
interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

export function LoadingState({
  message = "Loading...",
  size = "md",
  style = {},
}: LoadingStateProps) {
  const sizes = { sm: 24, md: 36, lg: 48 };
  const s = sizes[size];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "60px 32px",
        gap: 16,
        ...style,
      }}
    >
      <div
        style={{
          width: s,
          height: s,
          borderRadius: "50%",
          border: `3px solid var(--border)`,
          borderTopColor: "var(--espresso)",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {message && (
        <p style={{ color: "var(--taupe)", fontSize: 14, margin: 0 }}>
          {message}
        </p>
      )}
    </div>
  );
}
