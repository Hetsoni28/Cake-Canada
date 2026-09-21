"use client";

import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  default?: string;
  onChange?: (id: string) => void;
  children: (activeId: string) => ReactNode;
  variant?: "underline" | "pill";
}

export function Tabs({
  tabs,
  default: defaultTab,
  onChange,
  children,
  variant = "underline",
}: TabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  function select(id: string) {
    setActive(id);
    onChange?.(id);
  }

  return (
    <div>
      {/* Tab bar */}
      <div
        role="tablist"
        style={{
          display: "flex",
          gap: variant === "underline" ? 0 : 6,
          borderBottom:
            variant === "underline" ? "1px solid var(--border)" : "none",
          marginBottom: 24,
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => select(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: variant === "underline" ? "10px 18px" : "8px 16px",
                background:
                  variant === "pill"
                    ? isActive
                      ? "var(--espresso)"
                      : "transparent"
                    : "none",
                border:
                  variant === "pill"
                    ? `1px solid ${isActive ? "var(--espresso)" : "var(--border)"}`
                    : "none",
                borderBottom:
                  variant === "underline"
                    ? isActive
                      ? "2px solid var(--espresso)"
                      : "2px solid transparent"
                    : "none",
                borderRadius: variant === "pill" ? 20 : 0,
                color:
                  variant === "pill"
                    ? isActive
                      ? "#fff"
                      : "var(--taupe)"
                    : isActive
                      ? "var(--espresso)"
                      : "var(--taupe)",
                fontWeight: isActive ? 600 : 400,
                fontSize: 14,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
                marginBottom: variant === "underline" ? -1 : 0,
              }}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.25)"
                      : "var(--cream)",
                    color:
                      isActive && variant === "pill"
                        ? "#fff"
                        : "var(--espresso)",
                    borderRadius: 10,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div role="tabpanel">{children(active)}</div>
    </div>
  );
}
