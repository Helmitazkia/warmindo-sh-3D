"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const WA_STORE_NUMBER = "6285817670115";

export default function OrderSuccessView({ order, onResetOrder }) {
  const formatIDR = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Get Initials from customer name (e.g. "Hardi Rama" -> "HR")
  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "WS";
  };

  // Format date like "11 September 2026, 14.20 WIB"
  const formatDateTime = (dateStr) => {
    try {
      const date = dateStr ? new Date(dateStr) : new Date();
      return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch {
      return "11 September 2026, 14.20";
    }
  };

  // Generate formatted WhatsApp message text
  const generateWAMessage = () => {
    const itemsList = (order.items || [])
      .map(
        (i) =>
          `• ${i.name} x${i.qty} (${formatIDR(i.subtotal || i.price * i.qty)})${i.notes ? `\n  - Catatan: ${i.notes}` : ""}`
      )
      .join("\n");

    const message = `*🍜 RINCIAN TRANSAKSI WARMINDO SH*
----------------------------------------
*ID Transaksi:* ${order.orderCode}
*Meja:* Meja ${order.tableNumber}
*Nama Pelanggan:* ${order.customerName}
*No. WhatsApp:* ${order.customerPhone}
*Jumlah:* ${order.guestCount || 1} Orang (Pax)
*Waktu:* ${formatDateTime(order.createdAt)}
*Metode Bayar:* ${order.paymentMethod === "CASH" ? "Bayar di Kasir (Tunai)" : "QRIS / Transfer"}

*Daftar Pesanan:*
${itemsList}

*TOTAL TAGIHAN:* ${formatIDR(order.totalAmount)}
${order.tableNotes ? `*Catatan Meja:* ${order.tableNotes}\n` : ""}----------------------------------------
Mohon segera diproses ya Kak! Terima kasih 🙏`;

    return `https://wa.me/${WA_STORE_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: 420,
        margin: "10px auto 40px",
        fontFamily: "var(--font-poppins), sans-serif",
      }}
    >
      {/* Top Navigation Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          padding: "0 4px",
        }}
      >
        <button
          onClick={onResetOrder}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-primary)",
            fontSize: "1.2rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>←</span>
        </button>
        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--text-primary)" }}>
          Rincian Transaksi
        </div>
        <div style={{ fontSize: "1.2rem", color: "var(--text-muted)" }}>•••</div>
      </div>

      {/* ── BANK JAGO STYLE TICKET RECEIPT CARD (THEME ADAPTIVE) ── */}
      <div
        style={{
          background: "var(--bg-card)",
          color: "var(--text-primary)",
          borderRadius: 24,
          padding: "24px 20px",
          boxShadow: "var(--shadow-card)",
          position: "relative",
          overflow: "hidden",
          border: "1px solid var(--border-glass)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Card Header: Customer Info & Avatar Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-poppins), sans-serif",
                fontWeight: 800,
                fontSize: "1.1rem",
                color: "var(--text-primary)",
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
              }}
            >
              {order.customerName || "Pelanggan Warmindo"}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
              Dine-In • {order.customerPhone}
            </div>
          </div>

          {/* Orange Initials Circle */}
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #f59e0b, #ea580c)",
                color: "#ffffff",
                fontWeight: 900,
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(249,115,22,0.4)",
              }}
            >
              {getInitials(order.customerName)}
            </div>
            {/* Small noodle icon badge */}
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#0284c7",
                color: "#fff",
                fontSize: "0.6rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--bg-card)",
              }}
            >
              🍜
            </div>
          </div>
        </div>

        {/* ── TICKET NOTCH / CUTOUT LINE ── */}
        <div style={{ position: "relative", margin: "20px -20px 24px" }}>
          {/* Left Cutout Notch */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 24,
              borderRadius: "0 14px 14px 0",
              background: "var(--bg-primary)",
              borderTop: "1px solid var(--border-glass)",
              borderRight: "1px solid var(--border-glass)",
              borderBottom: "1px solid var(--border-glass)",
              zIndex: 3,
            }}
          />
          {/* Dashed line */}
          <div
            style={{
              borderTop: "2px dashed var(--border-glass)",
              margin: "0 22px",
            }}
          />
          {/* Right Cutout Notch */}
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              width: 14,
              height: 24,
              borderRadius: "14px 0 0 14px",
              background: "var(--bg-primary)",
              borderTop: "1px solid var(--border-glass)",
              borderLeft: "1px solid var(--border-glass)",
              borderBottom: "1px solid var(--border-glass)",
              zIndex: 3,
            }}
          />
        </div>

        {/* Big Total Amount */}
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: "1.85rem",
              color: "var(--text-primary)",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {formatIDR(order.totalAmount)}
          </div>
          <div
            style={{
              fontSize: "0.78rem",
              color: "#34d399",
              fontWeight: 700,
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span>●</span>
            <span>
              {order.paymentMethod === "CASH"
                ? "Bayar di Kasir (Menunggu Pembayaran)"
                : "QRIS / Transfer (Menunggu Verifikasi)"}
            </span>
          </div>
        </div>

        {/* Transaction Meta Info Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* ID Transaksi */}
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>ID Transaksi</div>
            <div
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "0.92rem",
                color: "var(--text-primary)",
                marginTop: 2,
                wordBreak: "break-all",
              }}
            >
              {order.orderCode}
            </div>
          </div>

          {/* Lokasi / Meja & Metode Bayar */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tempat Duduk</div>
              <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--accent-orange)", marginTop: 2 }}>
                Meja {order.tableNumber} ({order.guestCount || 1} Pax)
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Metode Bayar</div>
              <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)", marginTop: 2 }}>
                {order.paymentMethod === "CASH" ? "💵 Tunai di Kasir" : "📱 QRIS / Bank"}
              </div>
            </div>
          </div>

          {/* Tanggal dan Waktu */}
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Tanggal dan waktu</div>
            <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)", marginTop: 2 }}>
              {formatDateTime(order.createdAt)}
            </div>
          </div>

          {/* Rincian Menu Pesanan */}
          <div
            style={{
              marginTop: 6,
              paddingTop: 14,
              borderTop: "1px solid var(--border-glass)",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginBottom: 10,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Daftar Pesanan ({order.items?.length || 0} Item)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(order.items || []).map((item, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {item.name} <span style={{ color: "var(--accent-orange)" }}>x{item.qty}</span>
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: "0.72rem", color: "#fbbf24", marginTop: 1 }}>
                        ✏️ &quot;{item.notes}&quot;
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    {formatIDR(item.subtotal || item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Need Help Link */}
      <div style={{ textAlign: "center", margin: "24px 0 20px" }}>
        <a
          href={generateWAMessage()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--text-primary)",
            fontWeight: 800,
            fontSize: "0.9rem",
            textDecoration: "underline",
            textDecorationColor: "var(--accent-orange)",
            textUnderlineOffset: 4,
          }}
        >
          Saya Butuh Bantuan
        </a>
      </div>

      {/* ── BOTTOM ACTION BUTTONS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12 }}>
        {/* Left: Pesan Tambahan */}
        <button
          onClick={onResetOrder}
          style={{
            padding: "16px 12px",
            borderRadius: 16,
            border: "1.5px solid var(--border-glass)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontWeight: 800,
            fontSize: "0.88rem",
            cursor: "pointer",
            fontFamily: "var(--font-poppins), sans-serif",
            transition: "all 0.2s",
          }}
        >
          Pesan Tambahan
        </button>

        {/* Right: Bagikan / Kirim WA Button */}
        <a
          href={generateWAMessage()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "16px 16px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "0.92rem",
            textDecoration: "none",
            boxShadow: "0 6px 20px rgba(249,115,22,0.4)",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          <span style={{ fontSize: "1.1rem" }}>💬</span>
          <span>Bagikan ke WA</span>
        </a>
      </div>

      {/* Home Link */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <Link
          href="/"
          style={{
            fontSize: "0.82rem",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          ← Kembali ke Halaman Utama Warmindo SH
        </Link>
      </div>
    </motion.div>
  );
}
