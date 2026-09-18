"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, FileText, Check } from "lucide-react";

export default function MenuCustomizationModal({
  isOpen,
  onClose,
  menu,
  availableToppings = [],
  initialSelectedToppings = [],
  initialNote = "",
  initialQty = 1,
  onConfirm,
}) {
  const [qty, setQty] = useState(initialQty);
  const [selectedToppings, setSelectedToppings] = useState(initialSelectedToppings);
  const [note, setNote] = useState(initialNote);

  // Sync state whenever modal opens with a specific menu
  useEffect(() => {
    if (isOpen && menu) {
      setQty(initialQty > 0 ? initialQty : 1);
      setSelectedToppings(initialSelectedToppings || []);
      setNote(initialNote || "");
    }
  }, [isOpen, menu, initialQty, initialSelectedToppings, initialNote]);

  if (!isOpen || !menu) return null;

  // Filter available toppings based on menu.allowToppingIds or menu.allow_toppings
  const allowedIds = Array.isArray(menu.allowToppingIds)
    ? menu.allowToppingIds.map(Number)
    : menu.allow_toppings
      ? String(menu.allow_toppings)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter(Boolean)
      : [];

  const eligibleToppings = availableToppings.filter((top) =>
    allowedIds.includes(Number(top.id))
  );

  const formatIDR = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const toppingSum = selectedToppings.reduce(
    (sum, t) => sum + Number(t.price || 0),
    0
  );
  const unitPrice = Number(menu.price || 0) + toppingSum;
  const totalPrice = unitPrice * qty;

  const toggleTopping = (topping) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((t) => t.id === topping.id);
      if (exists) {
        return prev.filter((t) => t.id !== topping.id);
      } else {
        return [...prev, topping];
      }
    });
  };

  const handleConfirm = () => {
    onConfirm({
      menu,
      quantity: qty,
      toppings: selectedToppings,
      note: note.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(8px)",
          }}
          onClick={onClose}
        >
          {/* Bottom Sheet Sheet Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 500,
              margin: "0 auto",
              maxHeight: "88vh",
              background: "var(--dropdown-bg)",
              color: "var(--text-primary)",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              border: "1px solid var(--border-glass)",
              borderBottom: "none",
              boxShadow: "var(--shadow-card)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                padding: "18px 20px 14px",
                borderBottom: "1px solid var(--border-glass)",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  fontSize: "1.05rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Tambahkan Menu
              </h2>
              <button
                onClick={onClose}
                aria-label="Tutup"
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "var(--theme-toggle-bg, var(--border-glass))",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <X size={17} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              className="hide-scrollbar"
              style={{
                flex: 1,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Product Info Row with Stepper */}
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  padding: "16px 20px",
                  borderBottom: "1px solid var(--border-glass)",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 74,
                    height: 74,
                    borderRadius: 14,
                    overflow: "hidden",
                    background: "var(--bg-card)",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-glass)",
                  }}
                >
                  <img
                    src={menu.image || "/asset/The_Floating_Hero_Object.png"}
                    alt={menu.name}
                    style={{
                      width: "90%",
                      height: "90%",
                      objectFit: "contain",
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "0.98rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 4,
                      lineHeight: 1.25,
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  >
                    {menu.name}
                  </h3>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 800,
                      color: "var(--accent-orange)",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  >
                    {formatIDR(unitPrice)}
                  </div>
                </div>

                {/* Stepper (- 1 +) ala ShopeeFood */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setQty((prev) => Math.max(1, prev - 1))}
                    disabled={qty <= 1}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      border: "1.5px solid var(--accent-orange)",
                      background: "transparent",
                      color: qty <= 1 ? "rgba(234,88,12,0.3)" : "var(--accent-orange)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: qty <= 1 ? "not-allowed" : "pointer",
                      opacity: qty <= 1 ? 0.5 : 1,
                    }}
                  >
                    <Minus size={15} />
                  </button>
                  <span
                    style={{
                      fontSize: "1rem",
                      fontWeight: 800,
                      minWidth: 20,
                      textAlign: "center",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  >
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((prev) => prev + 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 9,
                      border: "none",
                      background: "var(--accent-orange)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      boxShadow: "0 2px 8px rgba(234,88,12,0.3)",
                    }}
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>

              {/* Section Topping (Hanya jika menu mengizinkan topping) */}
              {eligibleToppings.length > 0 && (
                <div>
                  {/* Banner Subheader Bergaris ala ShopeeFood */}
                  <div
                    style={{
                      padding: "10px 20px",
                      background: "var(--bg-secondary)",
                      borderTop: "1px solid var(--border-glass)",
                      borderBottom: "1px solid var(--border-glass)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      PILIHAN TOPPING (Pilih Bebas)
                    </span>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        color: "var(--accent-orange)",
                      }}
                    >
                      {selectedToppings.length} Dipilih
                    </span>
                  </div>

                  {/* List Topping Checkbox Rows */}
                  <div style={{ padding: "4px 0" }}>
                    {eligibleToppings.map((top) => {
                      const isSelected = selectedToppings.some(
                        (t) => t.id === top.id
                      );
                      return (
                        <div
                          key={top.id}
                          onClick={() => toggleTopping(top)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 20px",
                            borderBottom: "1px solid var(--border-glass)",
                            cursor: "pointer",
                            background: isSelected
                              ? "rgba(249,115,22,0.09)"
                              : "transparent",
                            transition: "background 0.15s",
                          }}
                        >
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: isSelected ? 700 : 500,
                                color: "var(--text-primary)",
                              }}
                            >
                              {top.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.78rem",
                                color: "var(--accent-orange)",
                                fontWeight: 700,
                                marginTop: 2,
                              }}
                            >
                              +{formatIDR(top.price)}
                            </span>
                          </div>

                          {/* Custom Checkbox Ala Shopee */}
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              border: isSelected
                                ? "2px solid var(--accent-orange)"
                                : "2px solid var(--border-glass)",
                              background: isSelected ? "var(--accent-orange)" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.15s",
                            }}
                          >
                            {isSelected && (
                              <Check size={15} color="#ffffff" strokeWidth={3} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section Catatan untuk Restoran */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--border-glass)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 8,
                  }}
                >
                  <FileText size={16} style={{ color: "var(--text-muted)" }} />
                  <span
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--text-muted)",
                    }}
                  >
                    Catatan untuk Restoran
                  </span>
                </div>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: pedas sedang, sawi banyak, kuah dipisah..."
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    color: "var(--text-primary)",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Sticky Bottom Action Button */}
            <div
              className="mobile-safe-bottom"
              style={{
                padding: "14px 20px calc(18px + env(safe-area-inset-bottom, 0px))",
                borderTop: "1px solid var(--border-glass)",
                background: "var(--dropdown-bg)",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={handleConfirm}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, var(--accent-orange), #ea580c)",
                  color: "#ffffff",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(234,88,12,0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                Masukkan ke Keranjang - {formatIDR(totalPrice)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
