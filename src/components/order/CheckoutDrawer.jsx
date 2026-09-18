"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { paymentMethods as defaultPaymentMethods } from "@/data/menuData";

export default function CheckoutDrawer({
  isOpen,
  onClose,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  itemNotes,
  tableNumber,
  tables = [],
  onSubmitOrder,
}) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [tableNotes, setTableNotes] = useState("");
  const [paymentMethodList, setPaymentMethodList] = useState(defaultPaymentMethods);
  const [selectedPayment, setSelectedPayment] = useState("CASH");
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/payment-methods");
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          setPaymentMethodList(json.data);
          // Default selection to first active method if CASH not present
          const hasCash = json.data.some((p) => p.code === "CASH");
          setSelectedPayment(hasCash ? "CASH" : json.data[0].code);
        }
      } catch (err) {
        console.warn("Using fallback payment methods:", err);
      }
    }
    fetchPayments();
  }, []);

  const formatIDR = (num) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Find table info, total capacity & remaining available seats
  const currentTableInfo = tables.find(
    (t) =>
      String(t.tableNumber) === String(tableNumber) ||
      String(t.id) === String(tableNumber) ||
      t.name === `Meja ${tableNumber}`
  );
  const totalCapacity = currentTableInfo?.capacity || 4;
  const remainingSeats = currentTableInfo?.remaining !== undefined ? currentTableInfo.remaining : totalCapacity;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentProofFile(file);
      setPaymentProofPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!customerName.trim()) {
      setErrorMsg("Mohon isi Nama Pemesan terlebih dahulu.");
      return;
    }

    if (!customerPhone.trim() || customerPhone.length < 9) {
      setErrorMsg("Mohon masukkan Nomor WhatsApp aktif untuk pengiriman struk.");
      return;
    }

    if (remainingSeats === 0) {
      setErrorMsg(
        `Meja ${tableNumber} saat ini sedang penuh. Silakan pilih meja lain yang masih tersedia.`
      );
      return;
    }

    if (Number(guestCount) > remainingSeats) {
      setErrorMsg(
        `Meja ${tableNumber} saat ini hanya tersisa ${remainingSeats} kursi (Kapasitas maksimal: ${totalCapacity} orang). Jumlah yang Anda masukkan: ${guestCount} orang.`
      );
      return;
    }

    const isCashPayment = selectedPayment === "CASH";
    if (!isCashPayment && !paymentProofFile) {
      setErrorMsg("Mohon upload bukti transfer / screenshot pembayaran QRIS.");
      return;
    }

    setIsSubmitting(true);

    // Upload payment proof file terlebih dahulu (jika non-cash)
    let uploadedProofUrl = null;
    if (paymentProofFile && !isCashPayment) {
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", paymentProofFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadForm,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          uploadedProofUrl = uploadJson.url;
        } else {
          setErrorMsg(`Upload bukti gagal: ${uploadJson.message}`);
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        setErrorMsg("Upload bukti pembayaran gagal. Coba lagi.");
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      tableNumber: tableNumber || "1",
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      guestCount: Number(guestCount),
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.quantity,
        toppings: item.toppings || [],
        notes: itemNotes[item.id] || "",
        subtotal: item.price * item.quantity,
      })),
      totalAmount: totalPrice,
      paymentMethod: selectedPayment,
      paymentProofUrl: uploadedProofUrl,
      tableNotes: tableNotes.trim(),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!json.success) {
        setErrorMsg(json.message || "Gagal menyimpan pesanan ke database.");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onSubmitOrder(json.data);
    } catch (err) {
      console.error("Order submit network error:", err);
      setErrorMsg("Koneksi ke database gagal. Pastikan MySQL XAMPP sedang berjalan.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 600,
              maxHeight: "90vh",
              background: "var(--dropdown-bg)",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              border: "1px solid var(--border-glass)",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
              overflow: "hidden",
            }}
          >
            {/* Header Drawer */}
            <div
              style={{
                padding: "20px 20px 14px",
                borderBottom: "1px solid var(--border-glass)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "var(--font-poppins), sans-serif",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    color: "var(--text-primary)",
                  }}
                >
                  🛒 Keranjang Pesanan
                </h2>
                <span style={{ fontSize: "0.8rem", color: "#f97316", fontWeight: 700 }}>
                  🪑 Meja {tableNumber || "1"} (Sisa {remainingSeats} dari Maks {totalCapacity} Orang)
                </span>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  color: "var(--text-muted)",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Cart Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Rincian Menu ({cartItems.length} Item)
                </h3>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "var(--bg-card)",
                      borderRadius: 14,
                      border: "1px solid var(--border-glass)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={44}
                        height={44}
                        style={{ objectFit: "contain" }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                          {item.name}
                        </div>
                        {item.toppings && item.toppings.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "3px 0" }}>
                            {item.toppings.map((t, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: "0.68rem",
                                  color: "#f97316",
                                  background: "rgba(249,115,22,0.12)",
                                  border: "1px solid rgba(249,115,22,0.25)",
                                  borderRadius: 4,
                                  padding: "1px 5px",
                                  fontWeight: 600,
                                }}
                              >
                                +{t.name} ({formatIDR(t.price)})
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ fontSize: "0.8rem", color: "#f97316", fontWeight: 700 }}>
                          {formatIDR(item.price)}
                        </div>
                        {itemNotes[item.id] && (
                          <div style={{ fontSize: "0.72rem", color: "#fbbf24" }}>
                            ✏️ &quot;{itemNotes[item.id]}&quot;
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button
                        onClick={() => onRemoveFromCart(item)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: "none",
                          background: "rgba(255,255,255,0.1)",
                          color: "var(--text-primary)",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 800, minWidth: 20, textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onAddToCart(item)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          border: "none",
                          background: "linear-gradient(135deg, #f97316, #ea580c)",
                          color: "#fff",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Identity Form */}
              <div
                style={{
                  background: "var(--bg-card)",
                  padding: 16,
                  borderRadius: 16,
                  border: "1px solid var(--border-glass)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>
                  📋 Informasi Pemesan (Dine-in)
                </h3>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    Nama Pemesan *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Helmi / Budi"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-glass)",
                      background: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "0.88rem",
                      outline: "none",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                      No WhatsApp (Untuk Struk) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="085817670115"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: "1px solid var(--border-glass)",
                        background: "rgba(0,0,0,0.2)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                        outline: "none",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                      Jumlah Orang (Maks {remainingSeats})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={remainingSeats}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 12,
                        border: Number(guestCount) > remainingSeats ? "1px solid #ef4444" : "1px solid var(--border-glass)",
                        background: "rgba(0,0,0,0.2)",
                        color: "var(--text-primary)",
                        fontSize: "0.88rem",
                        outline: "none",
                        fontFamily: "var(--font-poppins), sans-serif",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
                    Catatan Meja Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Minta tisu dan mangkuk kecil"
                    value={tableNotes}
                    onChange={(e) => setTableNotes(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--border-glass)",
                      background: "rgba(0,0,0,0.2)",
                      color: "var(--text-primary)",
                      fontSize: "0.85rem",
                      outline: "none",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  />
                </div>
              </div>

              {/* Payment Method Selector (Dinamis dari Database) */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <h3 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                  💳 Metode Pembayaran
                </h3>

                {paymentMethodList.map((pm) => {
                  const methodCode = pm.code || pm.id;
                  const isSelected = selectedPayment === methodCode;
                  const isCash = methodCode === "CASH";
                  const methodIcon = isCash ? "💵" : (methodCode === "QRIS" ? "📱" : "🏦");

                  return (
                    <div
                      key={pm.id || methodCode}
                      onClick={() => setSelectedPayment(methodCode)}
                      style={{
                        padding: "14px",
                        borderRadius: 14,
                        border: isSelected ? "2px solid #f97316" : "1px solid var(--border-glass)",
                        background: isSelected ? "rgba(249,115,22,0.12)" : "var(--bg-card)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "1.3rem" }}>{pm.icon || methodIcon}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                              {pm.name}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                              {pm.description || (isCash ? "Bayar langsung ke kasir saat makanan datang" : `Transfer / scan melalui ${pm.name}`)}
                            </div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={isSelected}
                          onChange={() => setSelectedPayment(methodCode)}
                          style={{ accentColor: "#f97316" }}
                        />
                      </div>

                      {/* QRIS / Transfer Box */}
                      {isSelected && !isCash && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          style={{
                            marginTop: 14,
                            paddingTop: 14,
                            borderTop: "1px dashed rgba(249,115,22,0.3)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 12,
                          }}
                        >
                          <div style={{ textAlign: "center", background: "#ffffff", padding: 14, borderRadius: 14 }}>
                            {(pm.accountName || pm.account_name) && (
                              <div style={{ color: "#000", fontWeight: 800, fontSize: "0.9rem", marginBottom: 6 }}>
                                {pm.accountName || pm.account_name}
                              </div>
                            )}
                            {(pm.qrImageUrl || pm.qr_image_url || pm.qrImage) && (
                              <img
                                src={pm.qrImageUrl || pm.qr_image_url || pm.qrImage}
                                alt={pm.name}
                                style={{ margin: "0 auto", borderRadius: 8, maxHeight: 180, maxWidth: "100%", objectFit: "contain", display: "block" }}
                              />
                            )}
                            {(pm.accountNumber || pm.account_number) && (
                              <div style={{ color: "#4b5563", fontSize: "0.75rem", marginTop: 6, fontWeight: 600 }}>
                                {pm.accountNumber || pm.account_number}
                              </div>
                            )}
                            <div style={{ color: "#ea580c", fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>
                              Total: {formatIDR(totalPrice)}
                            </div>
                          </div>

                          <div>
                            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)", display: "block", marginBottom: 6 }}>
                              📤 Upload Bukti Transfer / Screenshot Pembayaran *
                            </label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              style={{
                                width: "100%",
                                padding: "8px",
                                background: "rgba(255,255,255,0.05)",
                                border: "1px dashed var(--border-glass)",
                                borderRadius: 10,
                                fontSize: "0.8rem",
                                color: "var(--text-muted)",
                              }}
                            />
                            {paymentProofPreview && (
                              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ fontSize: "0.75rem", color: "#34d399", display: "flex", alignItems: "center", gap: 4 }}>
                                  <span>✅ Bukti pembayaran terpilih</span>
                                </div>
                                <img
                                  src={paymentProofPreview}
                                  alt="Bukti Pembayaran"
                                  style={{ width: 100, height: 140, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-glass)" }}
                                />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    padding: "12px 14px",
                    background: "rgba(239,68,68,0.15)",
                    border: "1px solid rgba(239,68,68,0.4)",
                    borderRadius: 12,
                    color: "#fca5a5",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  ⚠️ {errorMsg}
                </div>
              )}
            </div>

            {/* Footer Summary & Submit Button */}
            <div
              style={{
                padding: "16px 20px 24px",
                borderTop: "1px solid var(--border-glass)",
                background: "var(--bg-primary)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total Pembayaran</div>
                  <div
                    style={{
                      fontFamily: "var(--font-poppins), sans-serif",
                      fontWeight: 800,
                      fontSize: "1.3rem",
                      color: "#fbbf24",
                    }}
                  >
                    {formatIDR(totalPrice)}
                  </div>
                </div>

                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {selectedPayment === "CASH" ? "💵 Bayar di Kasir" : "📱 Transfer / QRIS"}
                </span>
              </div>

              <button
                disabled={isSubmitting || cartItems.length === 0}
                onClick={handleSubmit}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "16px",
                  fontSize: "1rem",
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                }}
              >
                {isSubmitting ? (
                  <span>⏳ Menyimpan Pesanan ke Database...</span>
                ) : (
                  <span>🚀 Konfirmasi & Pesan Sekarang</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
