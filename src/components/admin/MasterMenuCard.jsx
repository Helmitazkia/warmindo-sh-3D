"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Settings2, Edit2, ChefHat } from "lucide-react";

export default function MasterMenuCard({ menu, onToggleAvailable }) {
  const [isLoading, setIsLoading] = useState(false);
  const isAvailable = !!menu.is_available;

  const handleToggle = async () => {
    setIsLoading(true);
    await onToggleAvailable(menu.id, !isAvailable);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 14,
        background: "var(--admin-card-bg)",
        border: `1px solid ${isAvailable ? "var(--admin-card-border)" : "rgba(239,68,68,0.2)"}`,
        borderRadius: 16,
        transition: "all 0.2s",
        opacity: isAvailable ? 1 : 0.7,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          flexShrink: 0,
          overflow: "hidden",
          background: "var(--admin-surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {menu.image_url ? (
          <img src={menu.image_url} alt={menu.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ChefHat size={22} style={{ color: "var(--admin-text-muted)" }} />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontWeight: 700,
            fontSize: "0.875rem",
            color: "var(--admin-text)",
            textDecoration: isAvailable ? "none" : "line-through",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 2,
          }}
        >
          {menu.name}
        </p>
        <p style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginBottom: 4 }}>
          {menu.categoryName}
        </p>
        <p
          style={{
            fontWeight: 800,
            fontSize: "0.875rem",
            background: "linear-gradient(135deg, #fbbf24, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Rp {Number(menu.price).toLocaleString("id-ID")}
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "6px 12px",
          borderRadius: 999,
          border: "none",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: "0.72rem",
          transition: "all 0.2s",
          background: isAvailable ? "var(--admin-green-soft)" : "var(--admin-red-soft)",
          color: isAvailable ? "var(--admin-green)" : "var(--admin-red)",
        }}
      >
        {isAvailable ? <CheckCircle2 size={14} /> : <Circle size={14} />}
        {isAvailable ? "Tersedia" : "Habis"}
      </button>
    </div>
  );
}
