"use client";

import { Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  PENDING: { label: "Baru Masuk", bg: "var(--admin-yellow-soft)", text: "var(--admin-yellow)", dot: "#f59e0b" },
  COOKING: { label: "Diproses Dapur", bg: "var(--admin-pill-bg)", text: "var(--admin-pill-text)", dot: "#f97316" },
  COMPLETED: { label: "Selesai", bg: "var(--admin-green-soft)", text: "var(--admin-green)", dot: "#10b981" },
};

export default function AdminOrderCard({ order, isSelected, onSelect }) {
  const status = statusConfig[order.order_status] || statusConfig.PENDING;
  const timeString = new Date(order.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 16,
        background: isSelected ? "var(--admin-pill-bg)" : "var(--admin-card-bg)",
        border: `1px solid ${isSelected ? "var(--accent-orange)" : "var(--admin-card-border)"}`,
        borderRadius: 18,
        boxShadow: isSelected
          ? "0 8px 24px rgba(249,115,22,0.12)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        cursor: "pointer",
        marginBottom: 10,
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Orange left accent bar when selected */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "linear-gradient(to bottom, #f97316, #fbbf24)",
            borderRadius: "18px 0 0 18px",
          }}
        />
      )}

      {/* Table Number Badge */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: isSelected
            ? "linear-gradient(135deg, #f97316, #ea580c)"
            : "var(--admin-surface-2)",
          boxShadow: isSelected ? "0 4px 14px rgba(249,115,22,0.35)" : "none",
          transition: "all 0.2s",
        }}
      >
        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 800,
            textTransform: "uppercase",
            color: isSelected ? "rgba(255,255,255,0.8)" : "var(--admin-text-muted)",
            letterSpacing: "0.05em",
          }}
        >
          Meja
        </span>
        <span
          style={{
            fontSize: "1.4rem",
            fontWeight: 900,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            color: isSelected ? "#fff" : "var(--admin-text)",
            textAlign: "center",
          }}
        >
          {order.table_number?.replace(/meja/i, '').trim()}
        </span>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--admin-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {order.customer_name}
          </p>
        </div>
        <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {order.items?.length ?? 0} item • Rp {Number(order.total_amount).toLocaleString("id-ID")}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: "0.68rem",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 999,
              background: status.bg,
              color: status.text,
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.dot, display: "inline-block" }} />
            {status.label}
          </span>
          <span style={{ fontSize: "0.7rem", color: "var(--admin-text-sub)", display: "flex", alignItems: "center", gap: 3 }}>
            <Clock size={10} /> {timeString}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isSelected ? "var(--accent-orange)" : "var(--admin-surface-2)",
          color: isSelected ? "#fff" : "var(--admin-text-muted)",
          transition: "all 0.2s",
        }}
      >
        <ChevronRight size={18} />
      </div>
    </motion.div>
  );
}
