"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function CartFloatingBar({ totalItems, totalPrice, onOpenCart }) {
  const formatIDR = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          style={{
            position: "fixed",
            bottom: 20,
            left: 16,
            right: 16,
            zIndex: 50,
            maxWidth: 600,
            margin: "0 auto",
          }}
        >
          <div
            onClick={onOpenCart}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              background: "linear-gradient(135deg, #111115 0%, #1f1f27 100%)",
              border: "1px solid rgba(249,115,22,0.4)",
              borderRadius: 20,
              boxShadow: "0 12px 36px rgba(0,0,0,0.6), 0 0 24px rgba(249,115,22,0.25)",
              cursor: "pointer",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
          >
            {/* Left: Cart Icon & Item Count */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <div
                style={{
                  position: "relative",
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
                }}
              >
                🛒
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    background: "#fbbf24",
                    color: "#000",
                    fontWeight: 900,
                    fontSize: "0.68rem",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #111115",
                  }}
                >
                  {totalItems}
                </span>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "0.7rem", color: "#9ca3af", lineHeight: 1.1, whiteSpace: "nowrap" }}>
                  Total Pesanan
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: "#ffffff",
                    fontFamily: "var(--font-poppins), sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatIDR(totalPrice)}
                </div>
              </div>
            </div>

            {/* Right: Checkout Button */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                borderRadius: 999,
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.8rem",
                boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                fontFamily: "var(--font-poppins), sans-serif",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <span>Lihat Pesanan</span>
              <span style={{ fontSize: "0.9rem" }}>→</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
