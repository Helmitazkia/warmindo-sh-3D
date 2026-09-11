"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function OrderHeader({
  tableNumber,
  setTableNumber,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = [],
  tables = [],
}) {
  const [showTableModal, setShowTableModal] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") || "dark";
    setTheme(storedTheme);
    document.documentElement.setAttribute("data-theme", storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const currentTable = tables.find(
    (t) =>
      String(t.tableNumber) === String(tableNumber) ||
      String(t.id) === String(tableNumber) ||
      t.name === `Meja ${tableNumber}`
  );

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--nav-bg-scrolled)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderBottom: "1px solid var(--border-glass)",
          padding: "12px 16px 0",
        }}
      >
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          {/* Top Row: Logo, Table Badge & Theme Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 10,
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Link href="/" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg, #f97316, #dc2626)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    boxShadow: "0 4px 12px rgba(249,115,22,0.4)",
                  }}
                >
                  🍜
                </div>
              </Link>
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-poppins), sans-serif",
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    lineHeight: 1.1,
                    color: "var(--text-primary)",
                  }}
                >
                  Warmindo SH
                </h1>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  Self-Order Dine In
                </span>
              </div>
            </div>

            {/* Right Action: Table Badge + Theme Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Table Badge Selector */}
              <button
                onClick={() => setShowTableModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  background: "rgba(249,115,22,0.15)",
                  border: "1px solid rgba(249,115,22,0.35)",
                  borderRadius: 999,
                  color: "#f97316",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                <span>🪑</span>
                {/* <span>
                  {tableNumber
                    ? `Meja ${tableNumber}${currentTable ? ` (Sisa ${currentTable.formattedRemaining || currentTable.remaining})` : ""}`
                    : "Pilih Meja"}
                </span> */}
                <span>
                  {tableNumber
                    ? `Meja ${tableNumber}`
                    : "Pilih Meja"}
                </span>
                <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>▼</span>
              </button>

              {/* Dark / Light Mode Toggle Button */}
              <button
                onClick={toggleTheme}
                title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
                aria-label="Toggle theme"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: "1px solid var(--border-glass)",
                  background: "var(--theme-toggle-bg)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.05rem",
                  color: "var(--text-primary)",
                  transition: "transform 0.15s",
                }}
              >
                {theme === "dark" ? "☀️" : "🌙"}
              </button>
            </div>
          </div>

          {/* Toggleable Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden", marginBottom: 10 }}
              >
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.9rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    🔍
                  </span>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Ketik nama makanan atau minuman..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "9px 36px 9px 36px",
                      borderRadius: 12,
                      border: "1px solid var(--accent-orange)",
                      background: "var(--bg-card)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      outline: "none",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  />
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      padding: 4,
                    }}
                  >
                    ✕
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clean Category Navigation Bar with Search, Menu Dropdown & Text Tabs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingBottom: 2,
            }}
          >
            {/* Left Action Buttons: Search Icon & Menu List Dropdown Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, paddingRight: 4 }}>
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                title="Cari Menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: isSearchOpen ? "1px solid var(--accent-orange)" : "1px solid var(--border-glass)",
                  background: isSearchOpen ? "rgba(249,115,22,0.15)" : "var(--bg-card)",
                  color: isSearchOpen ? "var(--accent-orange)" : "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  transition: "all 0.2s",
                }}
              >
                🔍
              </button>

              {/* Menu List [ ☰ ] Dropdown Toggle */}
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                title="Pilih Kategori Menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  border: showCategoryMenu ? "1px solid #3b82f6" : "1px solid var(--border-glass)",
                  background: showCategoryMenu ? "rgba(59,130,246,0.15)" : "var(--bg-card)",
                  color: showCategoryMenu ? "#3b82f6" : "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: "1rem",
                  transition: "all 0.2s",
                }}
              >
                ☰
              </button>
            </div>

            {/* Right: Scrollable Category Text Tabs with Underline */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                overflowX: "auto",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                paddingLeft: 4,
                paddingRight: 10,
              }}
            >
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                const cleanName = cat.name.replace(/^[^\w\s]+/, "").trim().toUpperCase();

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowCategoryMenu(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "10px 4px 10px",
                      position: "relative",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontFamily: "var(--font-poppins), sans-serif",
                      fontWeight: 800,
                      fontSize: "0.88rem",
                      letterSpacing: "0.04em",
                      color: isActive ? "#3b82f6" : "var(--text-muted)",
                      transition: "color 0.2s ease",
                    }}
                  >
                    <span>{cleanName}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeCategoryUnderline"
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 3,
                          borderRadius: "3px 3px 0 0",
                          background: "#3b82f6",
                          boxShadow: "0 0 8px rgba(59,130,246,0.6)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Category Dropdown Modal from [ ☰ ] button */}
      <AnimatePresence>
        {showCategoryMenu && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 95,
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              padding: "80px 20px 20px",
            }}
            onClick={() => setShowCategoryMenu(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "var(--dropdown-bg)",
                border: "1px solid var(--border-glass)",
                borderRadius: 20,
                padding: "20px 16px",
                width: "100%",
                maxWidth: 380,
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: "1px solid var(--border-glass)",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>
                  📂 Daftar Kategori Menu
                </div>
                <button
                  onClick={() => setShowCategoryMenu(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowCategoryMenu(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        borderRadius: 14,
                        border: isSelected ? "1.5px solid #3b82f6" : "1px solid var(--border-glass)",
                        background: isSelected ? "rgba(59,130,246,0.15)" : "var(--bg-card)",
                        color: isSelected ? "#3b82f6" : "var(--text-primary)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font-poppins), sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      <span>{cat.name}</span>
                      {isSelected && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change Table Modal with Live Occupancy & Capacity */}
      <AnimatePresence>
        {showTableModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
            onClick={() => setShowTableModal(false)}
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
                maxWidth: 420,
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-poppins), sans-serif",
                  fontWeight: 800,
                  fontSize: "1.2rem",
                  color: "var(--text-primary)",
                  marginBottom: 4,
                }}
              >
                🪑 Pilih Meja Tempat Duduk
              </h3>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: 18,
                }}
              >
                Kapasitas & sisa kursi dihitung otomatis dari pesanan aktif.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 10,
                  marginBottom: 20,
                  maxHeight: "55vh",
                  overflowY: "auto",
                }}
              >
                {tables.map((t) => {
                  const isCurrent =
                    String(tableNumber) === String(t.tableNumber) ||
                    String(tableNumber) === String(t.id) ||
                    `Meja ${tableNumber}` === t.name;

                  const isFull = t.remaining === 0;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTableNumber(t.tableNumber || t.id);
                        setShowTableModal(false);
                      }}
                      style={{
                        padding: "12px",
                        borderRadius: 14,
                        border: isCurrent
                          ? "2px solid #f97316"
                          : isFull
                            ? "1px solid rgba(239,68,68,0.3)"
                            : "1px solid var(--border-glass)",
                        background: isCurrent
                          ? "rgba(249,115,22,0.18)"
                          : isFull
                            ? "rgba(239,68,68,0.08)"
                            : "var(--bg-card)",
                        color: isCurrent ? "#f97316" : "var(--text-primary)",
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "var(--font-poppins), sans-serif",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        {t.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          color: isFull ? "#ef4444" : "#34d399",
                          marginTop: 4,
                        }}
                      >
                        {isFull
                          ? "Penuh (0 Kursi)"
                          : `Sisa ${t.formattedRemaining || t.remaining} Kursi (Maks ${t.capacity})`}
                      </div>
                      {t.activeOrdersCount > 0 && (
                        <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginTop: 2 }}>
                          Sedang ada {t.occupied} orang
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowTableModal(false)}
                className="btn-ghost"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
