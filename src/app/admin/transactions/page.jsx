"use client";

import { useState, useEffect } from "react";
import {
  Loader2, RefreshCw, X, FileText, Clock, Printer,
  Search, Calendar, CheckCircle2, SlidersHorizontal,
  ChevronRight, Receipt, ArrowUpDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CompletedTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter Tanggal
  const getTodayStr = () => new Date().toISOString().slice(0, 10);
  const [filterPreset, setFilterPreset] = useState("all"); // all, today, 7days, month, custom
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [customRange, setCustomRange] = useState({
    startDate: getTodayStr(),
    endDate: getTodayStr(),
  });

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      let url = `/api/admin/transactions?`;
      if (dateRange.startDate && dateRange.endDate) {
        url += `startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&`;
      }
      if (searchQuery.trim()) {
        url += `q=${encodeURIComponent(searchQuery.trim())}&`;
      }
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [dateRange]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchTransactions();
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleSelectPreset = (preset) => {
    setFilterPreset(preset);
    const today = new Date();
    const todayStr = getTodayStr();

    if (preset === "all") {
      setDateRange({ startDate: "", endDate: "" });
    } else if (preset === "today") {
      setDateRange({ startDate: todayStr, endDate: todayStr });
    } else if (preset === "7days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);
      setDateRange({
        startDate: sevenDaysAgo.toISOString().slice(0, 10),
        endDate: todayStr,
      });
    } else if (preset === "month") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const y = firstDay.getFullYear();
      const m = String(firstDay.getMonth() + 1).padStart(2, "0");
      const d = String(firstDay.getDate()).padStart(2, "0");
      setDateRange({
        startDate: `${y}-${m}-${d}`,
        endDate: todayStr,
      });
    } else if (preset === "custom") {
      setDateRange(customRange);
    }
  };

  const handleApplyCustomDate = (e) => {
    e.preventDefault();
    if (customRange.startDate > customRange.endDate) {
      alert("Tanggal mulai tidak boleh melebihi tanggal akhir");
      return;
    }
    setDateRange(customRange);
  };

  const totalOmset = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0);

  const cashCount = transactions.filter((t) => {
    const m = (t.payment_method || "").toLowerCase();
    return m.includes("tunai") || m.includes("cash");
  }).length;

  const qrisCount = transactions.filter((t) => {
    const m = (t.payment_method || "").toLowerCase();
    return m.includes("qris");
  }).length;

  const transferCount = transactions.filter((t) => {
    const m = (t.payment_method || "").toLowerCase();
    return m.includes("transfer") || m.includes("bank");
  }).length;

  const OrderDetailPanel = ({ order, onClose }) => (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Panel header – green-emerald gradient for completed orders */}
      <div
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          color: "#fff",
          padding: "16px 20px",
          flexShrink: 0,
          borderRadius: "24px 24px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Transaksi Selesai
              </span>
              <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>#{order.order_code}</span>
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {order.table_number}
            </h2>
            <p style={{ fontSize: "0.85rem", opacity: 0.95, marginTop: 2 }}>{order.customer_name}</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", opacity: 0.9 }}>
            <Clock size={12} />
            {new Date(order.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })},{" "}
            {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
          </div>
          <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "rgba(255,255,255,0.25)", padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
            <CheckCircle2 size={12} /> Selesai &amp; Lunas
          </span>
        </div>
      </div>

      {/* Items */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          background: "var(--admin-bg)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
        className="hide-scrollbar"
      >
        <p style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--admin-text-sub)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
          Rincian Pesanan ({order.items?.length ?? 0} Menu)
        </p>

        {order.items?.map((item, idx) => (
          <div
            key={idx}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "12px 14px",
              background: "var(--admin-card-bg)",
              border: "1px solid var(--admin-card-border)",
              borderRadius: 14,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: "var(--admin-pill-bg)",
                color: "var(--admin-pill-text)",
                fontWeight: 800,
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {item.quantity}x
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--admin-text)" }}>{item.menu_name}</p>
              {item.toppings && item.toppings.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
                  {item.toppings.map((top, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        background: "rgba(16,185,129,0.12)",
                        color: "#10b981",
                        border: "1px solid rgba(16,185,129,0.25)",
                        padding: "2px 6px",
                        borderRadius: 6,
                      }}
                    >
                      +{top.name}
                    </span>
                  ))}
                </div>
              )}
              {item.notes && (
                <p style={{ fontSize: "0.75rem", color: "var(--admin-yellow)", marginTop: 4 }}>
                  📝 {item.notes}
                </p>
              )}
            </div>
            <p style={{ fontWeight: 800, fontSize: "0.85rem", color: "var(--admin-text)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
              Rp {((item.price || 0) * item.quantity).toLocaleString("id-ID")}
            </p>
          </div>
        ))}

        {order.notes && (
          <div
            style={{
              padding: "12px 14px",
              background: "var(--admin-surface-2)",
              border: "1px solid var(--admin-border)",
              borderRadius: 14,
            }}
          >
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--admin-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Catatan Order
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--admin-text)" }}>{order.notes}</p>
          </div>
        )}

        {order.payment_proof_url && (
          <div
            style={{
              padding: "14px",
              background: "var(--admin-green-soft)",
              border: "1px solid rgba(16,185,129,0.2)",
              borderRadius: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: 6 }}>
                <FileText size={16} style={{ color: "var(--admin-green)" }} /> Bukti Pembayaran
              </p>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "var(--admin-green-soft)", color: "var(--admin-green)", padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(16,185,129,0.2)" }}>
                ✓ Terverifikasi
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img src={order.payment_proof_url} alt="Bukti Transfer" style={{ width: 56, height: 72, objectFit: "cover", borderRadius: 10, flexShrink: 0, border: "1px solid var(--admin-card-border)" }} />
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 2 }}>{order.payment_method}</p>
                <p style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--admin-text)", fontVariantNumeric: "tabular-nums" }}>
                  Rp {Number(order.total_amount).toLocaleString("id-ID")}
                </p>
                <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.72rem", color: "var(--accent-orange)", fontWeight: 600, textDecoration: "none", marginTop: 2, display: "block" }}>
                  Lihat Layar Penuh →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Total & Action */}
      <div
        className="mobile-safe-bottom"
        style={{
          background: "var(--admin-header-bg)",
          borderTop: "1px solid var(--admin-border)",
          padding: "14px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Total Pembayaran</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--admin-green)", fontVariantNumeric: "tabular-nums" }}>
              Rp {Number(order.total_amount).toLocaleString("id-ID")}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>
              Metode: {order.payment_method} • Status: {order.payment_status}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 12, border: "1px solid var(--admin-border)", background: "var(--admin-surface-2)", color: "var(--admin-text)", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer" }}
          >
            <Printer size={16} /> Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Summary Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #10b981, #059669)",
          borderRadius: 20,
          padding: "18px 20px",
          marginBottom: 14,
          color: "#fff",
          boxShadow: "0 8px 24px rgba(16,185,129,0.25)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Total Omset Selesai
          </p>
          <span style={{ fontSize: "0.68rem", fontWeight: 800, background: "rgba(255,255,255,0.25)", padding: "3px 10px", borderRadius: 999 }}>
            {transactions.length} Transaksi
          </span>
        </div>
        <p style={{ fontSize: "1.85rem", fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1.1, marginBottom: 12 }}>
          Rp {totalOmset.toLocaleString("id-ID")}
        </p>

        {/* Total Metode Pembayaran Yang Dipakai (Mirip Total Nilai Produk Aktif) */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Cash / Tunai", value: cashCount },
            { label: "QRIS", value: qrisCount },
            { label: "Transfer Bank", value: transferCount },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.18)",
                borderRadius: 12,
                padding: "8px 4px",
                textAlign: "center",
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: "0.62rem", fontWeight: 600, opacity: 0.9, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Search size={17} style={{ color: "var(--admin-text-muted)" }} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari no meja, nama pembeli, atau kode order..."
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
          onFocus={(e) => (e.target.style.borderColor = "#10b981")}
          onBlur={(e) => (e.target.style.borderColor = "var(--admin-border)")}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--admin-text-muted)", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Tanggal Pills */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 12 }} className="hide-scrollbar">
        {[
          { key: "all", label: "Semua Tanggal" },
          { key: "today", label: "Hari Ini" },
          { key: "7days", label: "7 Hari Terakhir" },
          { key: "month", label: "Bulan Ini" },
          { key: "custom", label: "Kustom" },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => handleSelectPreset(p.key)}
            style={{
              flexShrink: 0,
              padding: "7px 14px",
              borderRadius: 999,
              border: `1px solid ${filterPreset === p.key ? "#10b981" : "var(--admin-border)"}`,
              background: filterPreset === p.key ? "rgba(16,185,129,0.15)" : "var(--admin-card-bg)",
              color: filterPreset === p.key ? "#10b981" : "var(--admin-text-muted)",
              fontWeight: 700,
              fontSize: "0.78rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={fetchTransactions}
          title="Refresh data"
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "1px solid var(--admin-border)",
            background: "var(--admin-card-bg)",
            color: "var(--admin-text-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} style={{ color: isLoading ? "#10b981" : undefined }} />
        </button>
      </div>

      {/* Custom Date Form (Responsive Mobile Layout) */}
      {filterPreset === "custom" && (
        <form
          onSubmit={handleApplyCustomDate}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "12px 14px",
            background: "var(--admin-card-bg)",
            border: "1px solid var(--admin-card-border)",
            borderRadius: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--admin-text-muted)", display: "block", marginBottom: 3 }}>Dari</span>
              <input
                type="date"
                value={customRange.startDate}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, startDate: e.target.value }))}
                style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 8, padding: "8px", fontSize: "0.78rem", color: "var(--admin-text)", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--admin-text-muted)", display: "block", marginBottom: 3 }}>Sampai</span>
              <input
                type="date"
                value={customRange.endDate}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, endDate: e.target.value }))}
                style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 8, padding: "8px", fontSize: "0.78rem", color: "var(--admin-text)", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "0.82rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            Terapkan Filter
          </button>
        </form>
      )}

      {/* List Transaksi Selesai (Sama dengan UI/UX Pesanan Aktif) */}
      {isLoading && transactions.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "#10b981" }} />
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🧾</div>
          <p style={{ fontWeight: 700, color: "var(--admin-text-muted)", fontSize: "0.95rem" }}>Tidak ada riwayat transaksi</p>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-text-sub)", marginTop: 4 }}>
            {searchQuery ? "Coba ganti kata kunci pencarian" : "Pesanan yang selesai akan otomatis tercatat di sini"}
          </p>
        </div>
      ) : (
        <div>
          <AnimatePresence>
            {transactions.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              const dateObj = new Date(order.created_at);
              const dateStr = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
              const timeStr = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  onClick={() => setSelectedOrder(order)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: isSelected ? "rgba(16,185,129,0.1)" : "var(--admin-card-bg)",
                    border: `1px solid ${isSelected ? "#10b981" : "var(--admin-card-border)"}`,
                    borderRadius: 16,
                    boxShadow: isSelected
                      ? "0 8px 24px rgba(16,185,129,0.15)"
                      : "0 2px 12px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    marginBottom: 10,
                    transition: "all 0.2s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Left green bar */}
                  {isSelected && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 4,
                        background: "linear-gradient(to bottom, #10b981, #059669)",
                        borderRadius: "16px 0 0 16px",
                      }}
                    />
                  )}

                  {/* Table Badge */}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      flexShrink: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isSelected
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "var(--admin-surface-2)",
                      boxShadow: isSelected ? "0 4px 14px rgba(16,185,129,0.35)" : "none",
                      transition: "all 0.2s",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.58rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        color: isSelected ? "rgba(255,255,255,0.9)" : "var(--admin-text-muted)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      Meja
                    </span>
                    <span
                      style={{
                        fontSize: "1.2rem",
                        fontWeight: 900,
                        lineHeight: 1,
                        fontVariantNumeric: "tabular-nums",
                        color: isSelected ? "#fff" : "var(--admin-text)",
                        textAlign: "center",
                      }}
                    >
                      {order.table_number?.replace(/meja/i, "").trim()}
                    </span>
                  </div>

                  {/* Order Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                      <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--admin-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {order.customer_name}
                      </p>
                      <span style={{ fontSize: "0.68rem", color: "var(--admin-text-sub)", fontVariantNumeric: "tabular-nums" }}>
                        #{order.order_code}
                      </span>
                    </div>

                    <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {order.items?.length ?? 0} item • Rp {Number(order.total_amount).toLocaleString("id-ID")} • {order.payment_method}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          padding: "2px 7px",
                          borderRadius: 999,
                          background: "var(--admin-green-soft)",
                          color: "var(--admin-green)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                        Selesai
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "var(--admin-text-sub)", display: "flex", alignItems: "center", gap: 3, whiteSpace: "nowrap" }}>
                        <Clock size={10} /> {dateStr}, {timeStr}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isSelected ? "#10b981" : "var(--admin-surface-2)",
                      color: isSelected ? "#fff" : "var(--admin-text-muted)",
                      transition: "all 0.2s",
                    }}
                  >
                    <ChevronRight size={16} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Modal Detail Transaksi (Bottom Sheet) */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              height: "100dvh",
              zIndex: 100,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 640,
                maxHeight: "85dvh",
                background: "var(--admin-bg)",
                borderRadius: "24px 24px 0 0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 -20px 60px rgba(0,0,0,0.4)",
              }}
            >
              {/* Drag handle */}
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px", flexShrink: 0, background: "var(--admin-bg)" }}>
                <div style={{ width: 40, height: 4, borderRadius: 999, background: "var(--admin-border)" }} />
              </div>
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
