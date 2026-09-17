"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderItemCard({
  item,
  cartQty,
  onAddToCart,
  onRemoveFromCart,
  itemNote,
  onUpdateNote,
  availableToppings = [],
  selectedToppings = [],
  onToggleTopping,
  onOpenCustomization,
}) {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [tempNote, setTempNote] = useState(itemNote || "");

  const formatIDR = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const allowedToppingIds = Array.isArray(item.allowToppingIds)
    ? item.allowToppingIds
    : item.allow_toppings
      ? String(item.allow_toppings)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter(Boolean)
      : [];
  const hasToppingOptions = allowedToppingIds.length > 0;

  const toppingTotal = (selectedToppings || []).reduce((sum, t) => sum + Number(t.price || 0), 0);
  const currentUnitPrice = Number(item.price || 0) + toppingTotal;

  const handleSaveNote = () => {
    onUpdateNote(item.id, tempNote);
    setShowNoteModal(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: "flex",
          gap: 12,
          padding: "12px 14px",
          background: "var(--bg-card)",
          border: cartQty > 0 ? "1px solid rgba(249,115,22,0.4)" : "1px solid var(--border-glass)",
          borderRadius: 18,
          boxShadow: cartQty > 0 ? "0 8px 24px rgba(249,115,22,0.12)" : "var(--shadow-card)",
          position: "relative",
          overflow: "hidden",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      >
        {/* Product Image Area */}
        <div
          style={{
            position: "relative",
            width: 86,
            height: 86,
            flexShrink: 0,
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Image
            src={item.image}
            alt={item.name}
            width={86}
            height={86}
            style={{
              width: "90%",
              height: "90%",
              objectFit: "contain",
              filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))",
            }}
          />
          {item.isRecommended && (
            <div
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#fff",
                fontSize: "0.6rem",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: 6,
                letterSpacing: "0.02em",
              }}
            >
              ★ Favorit
            </div>
          )}
        </div>

        {/* Product Info & Action */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 4,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                  lineHeight: 1.25,
                }}
              >
                {item.name} {item.isSpicy && "🌶️"}
              </h3>
            </div>

            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                lineHeight: 1.35,
                marginBottom: 6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {item.description}
            </p>

            {/* Note Preview if added */}
            {itemNote && (
              <div
                onClick={() => setShowNoteModal(true)}
                style={{
                  fontSize: "0.7rem",
                  color: "#fbbf24",
                  background: "rgba(251,191,36,0.1)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 6,
                  cursor: "pointer",
                }}
              >
                <span>✏️ Catatan: &quot;{itemNote}&quot;</span>
              </div>
            )}

            {/* Rincian Topping Terpilih jika sudah ada di keranjang */}
            {selectedToppings && selectedToppings.length > 0 && (
              <div
                onClick={() => onOpenCustomization && onOpenCustomization(item)}
                title="Klik untuk ubah topping"
                style={{
                  fontSize: "0.68rem",
                  color: "#f97316",
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.25)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  marginBottom: 6,
                  cursor: "pointer",
                }}
              >
                <span>🍳 +{selectedToppings.map((t) => t.name).join(", ")}</span>
              </div>
            )}
          </div>

          {/* Bottom row: Price & Action Buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
              marginTop: 4,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.92rem",
                  background: "linear-gradient(135deg, #fbbf24, #f97316)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "var(--font-poppins), sans-serif",
                  whiteSpace: "nowrap",
                }}
              >
                {formatIDR(currentUnitPrice)}
              </span>
              {toppingTotal > 0 && (
                <span style={{ fontSize: "0.62rem", color: "var(--text-muted)" }}>
                  (termasuk topping)
                </span>
              )}
            </div>

            {/* Cart Controller (+ / -) */}
            {cartQty > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {/* Note Button */}
                <button
                  onClick={() => setShowNoteModal(true)}
                  title="Tambah Catatan Rasa"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: "1px solid var(--border-glass)",
                    background: itemNote ? "rgba(251,191,36,0.2)" : "rgba(255,255,255,0.05)",
                    color: itemNote ? "#fbbf24" : "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  📝
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "rgba(249,115,22,0.12)",
                    border: "1px solid rgba(249,115,22,0.35)",
                    borderRadius: 999,
                    padding: "3px 5px",
                    gap: 2,
                  }}
                >
                  <button
                    onClick={() => onRemoveFromCart(item)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(255,255,255,0.12)",
                      color: "var(--text-primary)",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  >
                    -
                  </button>
                  <span
                    style={{
                      width: 24,
                      textAlign: "center",
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      color: "#f97316",
                    }}
                  >
                    {cartQty}
                  </span>
                  <button
                    onClick={() => {
                      if (hasToppingOptions && onOpenCustomization) {
                        onOpenCustomization(item);
                      } else {
                        onAddToCart(item);
                      }
                    }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: "none",
                      background: "linear-gradient(135deg, #f97316, #ea580c)",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(249,115,22,0.4)",
                      flexShrink: 0,
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ) : hasToppingOptions ? (
              <button
                onClick={() => onOpenCustomization ? onOpenCustomization(item) : onAddToCart(item)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 14px",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  border: "none",
                  borderRadius: 999,
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.76rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
                  transition: "transform 0.15s",
                  fontFamily: "var(--font-poppins), sans-serif",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <span>+ Topping</span>
              </button>
            ) : (
              <button
                onClick={() => onAddToCart(item)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "6px 14px",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  border: "none",
                  borderRadius: 999,
                  color: "#ffffff",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
                  transition: "transform 0.15s",
                  fontFamily: "var(--font-poppins), sans-serif",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <span>+ Tambah</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Item Note Modal */}
      <AnimatePresence>
        {showNoteModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 110,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowNoteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--dropdown-bg)",
                border: "1px solid var(--border-glass)",
                borderRadius: 20,
                padding: 24,
                width: "100%",
                maxWidth: 380,
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                📝 Catatan Pesanan
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              >
                {item.name}
              </p>

              <textarea
                rows={3}
                placeholder="Contoh: Pedas level 3, jangan pakai daun bawang, kuah sedikit..."
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 12,
                  border: "1px solid var(--border-glass)",
                  background: "var(--bg-card)",
                  color: "var(--text-primary)",
                  fontSize: "0.85rem",
                  outline: "none",
                  marginBottom: 16,
                  resize: "none",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              />

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowNoteModal(false)}
                  className="btn-ghost"
                  style={{ flex: 1, justifyContent: "center", padding: "10px" }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveNote}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center", padding: "10px" }}
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
