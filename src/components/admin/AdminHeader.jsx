"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Bell, Sun, Moon, ShoppingBag, LayoutGrid, BarChart3, X, ChefHat, Layers, QrCode, Receipt } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Pesanan Aktif", path: "/admin", icon: ShoppingBag, desc: "Kelola antrean pesanan masuk" },
  { name: "Riwayat Transaksi", path: "/admin/transactions", icon: Receipt, desc: "Daftar pesanan selesai" },
  { name: "Kelola Produk", path: "/admin/master", icon: LayoutGrid, desc: "Stok & ketersediaan menu" },
  { name: "Master Kategori", path: "/admin/categories", icon: Layers, desc: "Grup menu & urutan katalog" },
  { name: "Master Meja & QR", path: "/admin/tables", icon: QrCode, desc: "Kapasitas meja & cetak QR" },
  { name: "Laporan Keuangan", path: "/admin/finance", icon: BarChart3, desc: "Pemasukan & pengeluaran" },
];

const pageTitles = {
  "/admin": "Pesanan Aktif",
  "/admin/transactions": "Riwayat Transaksi",
  "/admin/master": "Kelola Produk",
  "/admin/categories": "Master Kategori",
  "/admin/tables": "Master Meja & QR",
  "/admin/finance": "Laporan Keuangan",
};

export default function AdminHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setTheme] = useState("dark");
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Admin";

  // Sync theme from localStorage on mount (same as OrderHeader)
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

  return (
    <>
      {/* Sticky Top Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--admin-header-bg)",
          borderBottom: "1px solid var(--admin-border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {/* Left: Hamburger + Logo + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu navigasi"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--admin-border)",
                background: "var(--admin-surface)",
                color: "var(--admin-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <Menu size={18} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 4px 10px rgba(249,115,22,0.35)",
                }}
              >
                <ChefHat size={16} color="#fff" />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--admin-text)", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                  {pageTitle}
                </div>
                <div style={{ fontSize: "0.66rem", color: "var(--admin-text-muted)", lineHeight: 1, whiteSpace: "nowrap" }}>
                  Warmindo SH • Admin
                </div>
              </div>
            </div>
          </div>

          {/* Right: Theme Toggle + Bell */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--admin-border)",
                background: "var(--admin-surface)",
                color: "var(--admin-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: "1px solid var(--admin-border)",
                background: "var(--admin-surface)",
                color: "var(--admin-text-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Bell size={18} />
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#f97316",
                  border: "1.5px solid var(--admin-header-bg)",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 50,
                background: "rgba(0,0,0,0.5)",
                backdropFilter: "blur(4px)",
              }}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              style={{
                position: "fixed",
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 51,
                width: 280,
                background: "var(--admin-header-bg)",
                borderRight: "1px solid var(--admin-border)",
                display: "flex",
                flexDirection: "column",
                boxShadow: "4px 0 40px rgba(0,0,0,0.3)",
              }}
            >
              {/* Drawer Header */}
              <div
                style={{
                  padding: "20px 20px 16px",
                  borderBottom: "1px solid var(--admin-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "linear-gradient(135deg, #f97316, #ea580c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 12px rgba(249,115,22,0.3)",
                    }}
                  >
                    <ChefHat size={20} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1rem", color: "var(--admin-text)" }}>Warmindo SH</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)" }}>Admin & Kasir Dashboard</div>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    border: "1px solid var(--admin-border)",
                    background: "var(--admin-surface)",
                    color: "var(--admin-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Nav Links */}
              <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--admin-text-sub)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px 10px" }}>
                  Menu Utama
                </div>
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setDrawerOpen(false)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 12px",
                        borderRadius: 14,
                        marginBottom: 4,
                        textDecoration: "none",
                        background: isActive ? "var(--admin-pill-bg)" : "transparent",
                        border: isActive ? `1px solid ${theme === "dark" ? "rgba(249,115,22,0.2)" : "rgba(234,88,12,0.15)"}` : "1px solid transparent",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: isActive ? "var(--accent-orange)" : "var(--admin-surface-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: isActive ? "0 4px 12px rgba(249,115,22,0.3)" : "none",
                        }}
                      >
                        <Icon size={18} color={isActive ? "#fff" : "var(--admin-text-muted)"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: isActive ? "var(--admin-pill-text)" : "var(--admin-text)" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: 1 }}>
                          {item.desc}
                        </div>
                      </div>
                      {isActive && (
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-orange)", flexShrink: 0 }} />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div
                style={{
                  padding: "16px",
                  borderTop: "1px solid var(--admin-border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderRadius: 14,
                    background: "var(--admin-surface-2)",
                    border: "1px solid var(--admin-border)",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #f97316, #ea580c)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      flexShrink: 0,
                    }}
                  >
                    K
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--admin-text)" }}>Kasir Utama</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)" }}>Warmindo SH • Tebet Barat</div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
