"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Settings2, Edit2, ChefHat } from "lucide-react";

export default function MasterMenuCard({ menu, onToggleAvailable, onEdit }) {
  const [isLoading, setIsLoading] = useState(false);
  const isAvailable = !!menu.is_available;
  const imageUrl = menu.image_url || menu.image;
  const isRecommended = Boolean(menu.is_recommended || menu.isRecommended);
  const toppingIds = menu.allow_toppings
    ? String(menu.allow_toppings)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    : [];
  const hasToppings = toppingIds.length > 0;

  const handleToggle = async (e) => {
    e.stopPropagation();
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
        opacity: isAvailable ? 1 : 0.75,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Left Column: Tiny Label + Image */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {/* Tiny Favorit Label above the image */}
        <span
          style={{
            fontSize: "0.58rem",
            fontWeight: 800,
            lineHeight: 1,
            padding: "2px 6px",
            borderRadius: 6,
            background: isRecommended ? "linear-gradient(135deg, #f97316, #ea580c)" : "transparent",
            color: isRecommended ? "#ffffff" : "transparent",
            visibility: isRecommended ? "visible" : "hidden",
            marginBottom: 4,
            whiteSpace: "nowrap",
            boxShadow: isRecommended ? "0 2px 6px rgba(249,115,22,0.3)" : "none",
            letterSpacing: "0.02em",
          }}
        >
          ★ Favorit
        </span>

        {/* Product Image (Completely Unobstructed) */}
        <div
          onClick={() => onEdit && onEdit(menu)}
          title="Klik gambar untuk edit menu"
          style={{
            width: 54,
            height: 54,
            borderRadius: 14,
            flexShrink: 0,
            overflow: "hidden",
            background: "var(--admin-surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "1.5px solid var(--admin-border)",
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={menu.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <ChefHat size={22} style={{ color: "var(--admin-text-muted)" }} />
          )}
        </div>
      </div>

      {/* Info - Click to Edit */}
      <div
        onClick={() => onEdit && onEdit(menu)}
        style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
        title="Klik untuk ubah data menu"
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <p
            style={{
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "var(--admin-text)",
              textDecoration: isAvailable ? "none" : "line-through",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {menu.name}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)" }}>
            {menu.categoryName}
          </p>
          {hasToppings && (
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                color: "#f97316",
                background: "rgba(249,115,22,0.12)",
                padding: "1px 6px",
                borderRadius: 5,
                border: "1px solid rgba(249,115,22,0.25)",
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              🍳 {toppingIds.length} Topping
            </span>
          )}
        </div>
        <p
          style={{
            fontWeight: 800,
            fontSize: "0.875rem",
            backgroundImage: "linear-gradient(135deg, #fbbf24, #f97316)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Rp {Number(menu.price).toLocaleString("id-ID")}
        </p>
      </div>

      {/* Actions: Edit & Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onEdit && onEdit(menu)}
          title="Ubah Data Menu"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            border: "1px solid var(--admin-border)",
            background: "var(--admin-surface-2)",
            color: "var(--admin-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          <Edit2 size={13} />
        </button>

        <button
          onClick={handleToggle}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 11px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "0.72rem",
            transition: "all 0.2s",
            background: isAvailable ? "var(--admin-green-soft)" : "var(--admin-red-soft)",
            color: isAvailable ? "var(--admin-green)" : "var(--admin-red)",
            whiteSpace: "nowrap",
          }}
        >
          {isAvailable ? <CheckCircle2 size={13} /> : <Circle size={13} />}
          {isAvailable ? "Tersedia" : "Habis"}
        </button>
      </div>
    </div>
  );
}
