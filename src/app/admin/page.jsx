"use client";

import { useState, useEffect } from "react";
import AdminOrderCard from "@/components/admin/AdminOrderCard";
import { Loader2, RefreshCw, X, FileText, Clock, Printer, CheckCircle2, ChefHat, ShoppingBag, Ban } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const statusConfig = {
  PENDING: { label: "Baru Masuk", bg: "var(--admin-yellow-soft)", text: "var(--admin-yellow)" },
  COOKING: { label: "Sedang Diproses", bg: "var(--admin-pill-bg)", text: "var(--admin-pill-text)" },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const json = await res.json();
      if (json.success) setOrders(json.data);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, action) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const json = await res.json();
      if (json.success) {
        if (action === "COMPLETED" || action === "CANCELLED") {
          setOrders((prev) => prev.filter((o) => o.id !== id));
          if (selectedOrder?.id === id) setSelectedOrder(null);
        } else if (action === "COOKING") {
          setOrders((prev) => prev.map((o) => o.id === id ? { ...o, order_status: "COOKING" } : o));
          if (selectedOrder?.id === id) setSelectedOrder((prev) => ({ ...prev, order_status: "COOKING" }));
        }
      } else { alert(json.message); }
    } catch (e) { console.error(e); }
  };

  const filteredOrders = filterStatus === "ALL" ? orders : orders.filter((o) => o.order_status === filterStatus);

  const OrderDetailPanel = ({ order, onClose, isModal = false }) => (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      {/* Panel header – orange gradient */}
      <div
        style={{
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "#fff",
          padding: "16px 20px",
          flexShrink: 0,
          borderRadius: isModal ? "24px 24px 0 0" : "18px 18px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "2px 8px", borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Order Digital
              </span>
              <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>#{order.order_code}</span>
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: 900, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {order.table_number}
            </h2>
            <p style={{ fontSize: "0.85rem", opacity: 0.9, marginTop: 2 }}>{order.customer_name}</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", opacity: 0.85 }}>
            <Clock size={12} />
            {new Date(order.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB • Makan di Tempat
          </div>
          {statusConfig[order.order_status] && (
            <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: 999 }}>
              {statusConfig[order.order_status].label}
            </span>
          )}
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
          Daftar Pesanan
        </p>

        {order.items.map((item, idx) => (
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
              {item.notes && (
                <p style={{ fontSize: "0.75rem", color: "var(--admin-yellow)", marginTop: 2 }}>
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
              background: "var(--admin-yellow-soft)",
              border: "1px solid rgba(245,158,11,0.2)",
              borderRadius: 14,
            }}
          >
            <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--admin-yellow)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              ⚠ Catatan Khusus
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

      {/* Total & Action Buttons */}
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
            <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Total Tagihan</p>
            <p style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--admin-text)", fontVariantNumeric: "tabular-nums" }}>
              Rp {Number(order.total_amount).toLocaleString("id-ID")}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--admin-green)", fontWeight: 600 }}>{order.payment_method}</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 12, border: "1px solid var(--admin-border)", background: "var(--admin-surface-2)", color: "var(--admin-text-muted)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
            <Printer size={15} /> Cetak
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {order.order_status === "PENDING" && (
            <>
              <button
                onClick={() => handleUpdateStatus(order.id, "COOKING")}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(135deg, #f97316, #ea580c)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  boxShadow: "0 6px 20px rgba(249,115,22,0.35)",
                  transition: "transform 0.15s",
                }}
              >
                <ChefHat size={20} /> Kirim ke Dapur
              </button>

              <button
                onClick={() => setOrderToCancel(order)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 14,
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  background: "var(--admin-red-soft)",
                  color: "var(--admin-red)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s",
                }}
              >
                <Ban size={16} /> Batalkan Pesanan (Cancel)
              </button>
            </>
          )}
          {order.order_status === "COOKING" && (
            <button
              onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #10b981, #059669)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 6px 20px rgba(16,185,129,0.3)",
                transition: "transform 0.15s",
              }}
            >
              <CheckCircle2 size={20} /> Selesai & Sajikan
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const filterTabs = [
    { key: "ALL", label: `Semua (${orders.length})` },
    { key: "PENDING", label: `Baru (${orders.filter((o) => o.order_status === "PENDING").length})` },
    { key: "COOKING", label: `Diproses (${orders.filter((o) => o.order_status === "COOKING").length})` },
  ];

  return (
    <div>
      {/* Filter tabs + refresh */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" }} className="hide-scrollbar">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              flexShrink: 0,
              padding: "8px 16px",
              borderRadius: 999,
              border: `1px solid ${filterStatus === tab.key ? "var(--accent-orange)" : "var(--admin-border)"}`,
              background: filterStatus === tab.key ? "var(--admin-pill-bg)" : "var(--admin-card-bg)",
              color: filterStatus === tab.key ? "var(--admin-pill-text)" : "var(--admin-text-muted)",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={fetchOrders}
          style={{
            marginLeft: "auto",
            flexShrink: 0,
            width: 38,
            height: 38,
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
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} style={{ color: isLoading ? "var(--accent-orange)" : undefined }} />
        </button>
      </div>

      {/* Order List */}
      {isLoading && orders.length === 0 ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 className="animate-spin" size={32} style={{ color: "var(--accent-orange)" }} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🍜</div>
          <p style={{ fontWeight: 700, color: "var(--admin-text-muted)", fontSize: "0.95rem" }}>Belum ada pesanan aktif</p>
          <p style={{ fontSize: "0.8rem", color: "var(--admin-text-sub)", marginTop: 4 }}>Pesanan baru akan muncul di sini</p>
        </div>
      ) : (
        <div>
          <AnimatePresence>
            {filteredOrders.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrder?.id === order.id}
                onSelect={() => setSelectedOrder(order)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal (Bottom Sheet) */}
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
                <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} isModal />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Dialog Konfirmasi Batalkan Pesanan */}
      <AnimatePresence>
        {orderToCancel && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 120,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => !isCancelling && setOrderToCancel(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%",
                maxWidth: 360,
                background: "var(--admin-card-bg)",
                border: "1px solid var(--admin-card-border)",
                borderRadius: 24,
                padding: "24px 20px",
                textAlign: "center",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--admin-red-soft)",
                  color: "var(--admin-red)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  boxShadow: "0 0 20px rgba(239,68,68,0.2)",
                }}
              >
                <Ban size={28} />
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: 8 }}>
                Batalkan Pesanan?
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", lineHeight: 1.45, marginBottom: 20 }}>
                Apakah Anda yakin ingin membatalkan pesanan untuk <strong>{orderToCancel.table_number}</strong> ({orderToCancel.customer_name})? Status order akan diubah menjadi <span style={{ color: "var(--admin-red)", fontWeight: 700 }}>CANCELLED</span>.
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => setOrderToCancel(null)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: "1px solid var(--admin-border)",
                    background: "var(--admin-surface-2)",
                    color: "var(--admin-text)",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={async () => {
                    setIsCancelling(true);
                    await handleUpdateStatus(orderToCancel.id, "CANCELLED");
                    setIsCancelling(false);
                    setOrderToCancel(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    boxShadow: "0 4px 14px rgba(239,68,68,0.35)",
                  }}
                >
                  {isCancelling ? <Loader2 className="animate-spin" size={16} /> : "Ya, Batalkan"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
