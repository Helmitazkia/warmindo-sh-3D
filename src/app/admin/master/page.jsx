"use client";

import { useState, useEffect } from "react";
import MasterMenuCard from "@/components/admin/MasterMenuCard";
import { Loader2, Plus, Search, CheckSquare, Square, SlidersHorizontal } from "lucide-react";

export default function MasterDataDashboard() {
  const [menus, setMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");

  const [kitchenStock, setKitchenStock] = useState([
    { name: "Telur Ayam", status: "Siap Saji (48)", available: true },
    { name: "Kornet Sapi", status: "Siap Saji (12)", available: true },
    { name: "Keju Cheddar", status: "Siap Saji", available: true },
    { name: "Sosis Bakar", status: "Stok Habis", available: false },
    { name: "Sayur Sawi", status: "Menipis (4)", available: true },
    { name: "Bawang Goreng", status: "Siap Saji", available: true },
  ]);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/menus");
      const json = await res.json();
      if (json.success) setMenus(json.data);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleToggleAvailable = async (id, is_available) => {
    try {
      const res = await fetch("/api/admin/menus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_available }),
      });
      const json = await res.json();
      if (json.success) {
        setMenus(menus.map((m) => m.id === id ? { ...m, is_available: is_available ? 1 : 0 } : m));
      } else { alert("Gagal update menu"); }
    } catch (error) { console.error(error); }
  };

  const categories = ["Semua", ...new Set(menus.map((m) => m.categoryName))];

  const filteredMenus = menus.filter((m) => {
    const matchCat = activeCategory === "Semua" || m.categoryName === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const availableCount = menus.filter((m) => m.is_available).length;

  return (
    <div>
      {/* Summary Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          borderRadius: 20,
          padding: "18px 20px",
          marginBottom: 16,
          color: "#fff",
        }}
      >
        <p style={{ fontSize: "0.75rem", fontWeight: 600, opacity: 0.85, marginBottom: 4 }}>
          Total Nilai Produk Aktif
        </p>
        <p style={{ fontSize: "1.8rem", fontWeight: 900, fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>
          Rp {menus.filter((m) => m.is_available).reduce((a, m) => a + Number(m.price), 0).toLocaleString("id-ID")}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Total Menu", value: menus.length },
            { label: "Tersedia", value: availableCount },
            { label: "Habis", value: menus.length - availableCount, highlight: true },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.18)",
                borderRadius: 12,
                padding: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.6rem", fontWeight: 600, opacity: 0.8, marginBottom: 2 }}>{stat.label}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: stat.highlight && stat.value > 0 ? "#fde68a" : "#fff" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar — same style as OrderHeader */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Search size={17} style={{ color: "var(--admin-text-muted)" }} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama menu..."
          style={{
            width: "100%",
            background: "var(--admin-card-bg)",
            border: "1px solid var(--admin-border)",
            borderRadius: 14,
            padding: "12px 42px 12px 42px",
            fontSize: "0.875rem",
            color: "var(--admin-text)",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#f97316")}
          onBlur={(e) => (e.target.style.borderColor = "var(--admin-border)")}
        />
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
          <SlidersHorizontal size={17} style={{ color: "var(--admin-text-muted)" }} />
        </div>
      </div>

      {/* Category Filter Pills — same style as OrderHeader category tabs */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 16 }} className="hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              flexShrink: 0,
              padding: "7px 16px",
              borderRadius: 999,
              border: `1px solid ${activeCategory === cat ? "var(--accent-orange)" : "var(--admin-border)"}`,
              background: activeCategory === cat ? "var(--admin-pill-bg)" : "var(--admin-card-bg)",
              color: activeCategory === cat ? "var(--admin-pill-text)" : "var(--admin-text-muted)",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cat} {cat !== "Semua" ? `(${menus.filter((m) => m.categoryName === cat).length})` : `(${menus.length})`}
          </button>
        ))}
      </div>

      {/* Live Kitchen Stock */}
      <div
        style={{
          background: "var(--admin-card-bg)",
          border: "1px solid var(--admin-card-border)",
          borderRadius: 18,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 6px #f59e0b", animation: "pulse 2s infinite" }} />
            Stok Cepat Topping
          </p>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--admin-yellow)", background: "var(--admin-yellow-soft)", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(245,158,11,0.2)" }}>
            LIVE KITCHEN
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {kitchenStock.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "var(--admin-surface-2)",
                borderRadius: 12,
                border: "1px solid var(--admin-border)",
              }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--admin-text)" }}>{item.name}</p>
                <p style={{ fontSize: "0.65rem", color: item.available ? "var(--admin-green)" : "var(--admin-red)", marginTop: 1, fontWeight: 600 }}>
                  {item.status}
                </p>
              </div>
              <button
                onClick={() => {
                  const newStock = [...kitchenStock];
                  newStock[idx].available = !newStock[idx].available;
                  setKitchenStock(newStock);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: item.available ? "var(--accent-orange)" : "var(--admin-text-muted)" }}
              >
                {item.available ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)" }}>Katalog Menu</p>
        <p style={{ fontSize: "0.72rem", color: "var(--admin-text-sub)" }}>{filteredMenus.length} menu ditemukan</p>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
          <Loader2 className="animate-spin" size={28} style={{ color: "var(--accent-orange)" }} />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 80 }}>
          {filteredMenus.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "var(--admin-text-muted)", fontSize: "0.9rem" }}>Tidak ada menu ditemukan</p>
            </div>
          ) : (
            filteredMenus.map((menu) => (
              <MasterMenuCard key={menu.id} menu={menu} onToggleAvailable={handleToggleAvailable} />
            ))
          )}
        </div>
      )}

      {/* FAB Tambah Menu */}
      <button
        style={{
          position: "fixed",
          bottom: 24,
          right: "calc(50% - 304px)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 20px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "0.875rem",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(249,115,22,0.4)",
          zIndex: 30,
          transition: "transform 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Plus size={20} /> Tambah Menu
      </button>
    </div>
  );
}
