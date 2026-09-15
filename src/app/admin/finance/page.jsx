"use client";

import { useState, useEffect } from "react";
import {
  Loader2, Plus, TrendingUp, TrendingDown, Wallet,
  Receipt, X, Calendar, AlertCircle,
} from "lucide-react";

export default function FinanceDashboard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFinance = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/expenses");
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchFinance(); }, []);

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), description }),
      });
      const json = await res.json();
      if (json.success) {
        setAmount(""); setDescription(""); setIsModalOpen(false); fetchFinance();
      } else { alert(json.message); }
    } catch (error) { alert("Terjadi kesalahan."); }
    finally { setIsSubmitting(false); }
  };

  if (isLoading || !data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent-orange)" }} />
      </div>
    );
  }

  const isProfit = data.netProfit >= 0;
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      {/* Date chip */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", color: "var(--admin-text-muted)", marginBottom: 14 }}>
        <Calendar size={14} /> {today}
      </div>

      {/* P&L Card */}
      <div
        style={{
          background: "var(--admin-card-bg)",
          border: "1px solid var(--admin-card-border)",
          borderRadius: 20,
          padding: 20,
          marginBottom: 14,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--admin-text-sub)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
          Laporan Keuangan (P&amp;L)
        </p>

        {[
          { label: "Pendapatan Penjualan", value: `Rp ${data.totalIncome.toLocaleString("id-ID")}`, color: "var(--admin-text)" },
          { label: "Harga Pokok Penjualan", value: `-Rp ${data.totalExpense.toLocaleString("id-ID")}`, color: "var(--admin-red)" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>{row.label}</span>
            <span style={{ fontWeight: 700, fontSize: "0.875rem", color: row.color, fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
          </div>
        ))}

        <div style={{ height: 1, background: "var(--admin-border)", margin: "10px 0" }} />

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--admin-text)" }}>Laba Kotor</span>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", fontVariantNumeric: "tabular-nums" }}>
            Rp {(data.totalIncome - data.totalExpense).toLocaleString("id-ID")}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>Diskon + Pajak</span>
          <span style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-red)", fontVariantNumeric: "tabular-nums" }}>-Rp 0</span>
        </div>

        <div style={{ height: 1, background: "var(--admin-border)", margin: "10px 0" }} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 14px",
            borderRadius: 14,
            background: isProfit ? "var(--admin-green-soft)" : "var(--admin-red-soft)",
            border: `1px solid ${isProfit ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          <span style={{ fontWeight: 800, fontSize: "0.875rem", color: isProfit ? "var(--admin-green)" : "var(--admin-red)" }}>
            LABA BERSIH
          </span>
          <span style={{ fontWeight: 900, fontSize: "1.35rem", color: isProfit ? "var(--admin-green)" : "var(--admin-red)", fontVariantNumeric: "tabular-nums" }}>
            Rp {data.netProfit.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Metrics 2x2 — same card style as OrderItemCard */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { icon: TrendingUp, label: "Pemasukan", value: `Rp ${data.totalIncome.toLocaleString("id-ID")}`, bg: "var(--admin-green-soft)", color: "var(--admin-green)" },
          { icon: TrendingDown, label: "Pengeluaran", value: `Rp ${data.totalExpense.toLocaleString("id-ID")}`, bg: "var(--admin-red-soft)", color: "var(--admin-red)" },
          { icon: Receipt, label: "Total Transaksi", value: `${data.totalOrders ?? 0} pesanan`, bg: "var(--admin-surface-2)", color: "var(--admin-text-muted)" },
          { icon: Wallet, label: "Rata-rata / Transaksi", value: `Rp ${data.totalOrders ? Math.round(data.totalIncome / data.totalOrders).toLocaleString("id-ID") : 0}`, bg: "var(--admin-yellow-soft)", color: "var(--admin-yellow)" },
        ].map(({ icon: Icon, label, value, bg, color }, i) => (
          <div
            key={i}
            style={{
              background: "var(--admin-card-bg)",
              border: "1px solid var(--admin-card-border)",
              borderRadius: 16,
              padding: 14,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Icon size={18} style={{ color }} />
            </div>
            <p style={{ fontSize: "0.68rem", color: "var(--admin-text-muted)", marginBottom: 4, fontWeight: 600 }}>{label}</p>
            <p style={{ fontWeight: 900, fontSize: "0.95rem", color: "var(--admin-text)", fontVariantNumeric: "tabular-nums" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Expense List */}
      <div
        style={{
          background: "var(--admin-card-bg)",
          border: "1px solid var(--admin-card-border)",
          borderRadius: 20,
          padding: 16,
          marginBottom: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)" }}>Pengeluaran Hari Ini</p>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--admin-text-muted)", background: "var(--admin-surface-2)", padding: "3px 8px", borderRadius: 999 }}>
            {data.expenses.length} item
          </span>
        </div>

        {data.expenses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ color: "var(--admin-text-muted)", fontSize: "0.875rem" }}>Belum ada pengeluaran hari ini.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {data.expenses.map((exp, i) => (
              <div
                key={exp.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i < data.expenses.length - 1 ? "1px solid var(--admin-border)" : "none",
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--admin-red-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <AlertCircle size={17} style={{ color: "var(--admin-red)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.875rem", color: "var(--admin-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {exp.description}
                  </p>
                  <p style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: 1 }}>
                    {new Date(exp.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </p>
                </div>
                <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-red)", fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                  -Rp {Number(exp.amount).toLocaleString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsModalOpen(true)}
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
        }}
      >
        <Plus size={20} /> Input Pengeluaran
      </button>

      {/* Expense Modal */}
      {isModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 640, background: "var(--admin-header-bg)", border: "1px solid var(--admin-border)", borderRadius: "24px 24px 0 0", overflow: "hidden", boxShadow: "0 -20px 60px rgba(0,0,0,0.4)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>Input Pengeluaran</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Nominal (Rp)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "0.875rem", color: "var(--admin-text-muted)", fontWeight: 600 }}>Rp</span>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 14, padding: "12px 14px 12px 44px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                    placeholder="25000"
                    onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--admin-border)")}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Keterangan</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 14, padding: "12px 14px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                  placeholder="Beli telur 1 kg"
                  onFocus={(e) => (e.target.style.borderColor = "#f97316")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--admin-border)")}
                />
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-ghost" style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ flex: 1, justifyContent: "center", padding: "12px" }}>
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
