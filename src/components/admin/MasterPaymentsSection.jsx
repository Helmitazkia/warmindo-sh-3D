"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
  QrCode,
  Banknote,
  CreditCard,
  Wallet,
  Maximize2,
  Upload,
  X,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterPaymentsSection({ showToast }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewQrUrl, setPreviewQrUrl] = useState(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    account_name: "",
    account_number: "",
    qr_image_url: "",
    is_active: true,
    qrFile: null,
    qrPreview: null,
  });

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/payment-methods");
      const json = await res.json();
      if (json.success) {
        setPaymentMethods(json.data);
      } else {
        showToast(json.message || "Gagal memuat metode pembayaran");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleToggleActive = async (id, is_active) => {
    try {
      const res = await fetch("/api/admin/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active }),
      });
      const json = await res.json();
      if (json.success) {
        setPaymentMethods((prev) =>
          prev.map((pm) => (pm.id === id ? { ...pm, is_active } : pm))
        );
        showToast("Status metode pembayaran diperbarui", "success");
      } else {
        showToast(json.message || "Gagal memperbarui status");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan koneksi");
    }
  };

  const handleOpenAdd = () => {
    setEditingPaymentId(null);
    setForm({
      code: "",
      name: "",
      account_name: "",
      account_number: "",
      qr_image_url: "",
      is_active: true,
      qrFile: null,
      qrPreview: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pm) => {
    setEditingPaymentId(pm.id);
    setForm({
      code: pm.code,
      name: pm.name,
      account_name: pm.account_name || "",
      account_number: pm.account_number || "",
      qr_image_url: pm.qr_image_url || "",
      is_active: pm.is_active,
      qrFile: null,
      qrPreview: pm.qr_image_url || null,
    });
    setIsModalOpen(true);
  };

  const handleQrFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({
        ...prev,
        qrFile: file,
        qrPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      showToast("Kode dan Nama metode pembayaran wajib diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedQrUrl = form.qr_image_url;

      // Upload file baru jika ada
      if (form.qrFile) {
        const uploadData = new FormData();
        uploadData.append("file", form.qrFile);
        uploadData.append("folder", "payment-methods");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          uploadedQrUrl = uploadJson.url;
        } else {
          showToast(`Gagal upload QR: ${uploadJson.message}`);
          setIsSubmitting(false);
          return;
        }
      }

      const isEdit = !!editingPaymentId;
      const url = "/api/admin/payment-methods";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...(isEdit ? { id: editingPaymentId } : {}),
        code: form.code.trim(),
        name: form.name.trim(),
        account_name: form.account_name.trim(),
        account_number: form.account_number.trim(),
        qr_image_url: uploadedQrUrl || null,
        is_active: form.is_active ? 1 : 0,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        showToast(isEdit ? "Metode pembayaran diperbarui!" : "Metode pembayaran baru ditambahkan!", "success");
        fetchPayments();
      } else {
        showToast(json.message || "Gagal menyimpan data");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/payment-methods?id=${paymentToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setPaymentToDelete(null);
        setIsModalOpen(false);
        showToast("Metode pembayaran berhasil dihapus", "success");
        fetchPayments();
      } else {
        showToast(json.message || "Gagal menghapus metode pembayaran");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan server");
    } finally {
      setIsDeleting(false);
    }
  };

  const activeCount = paymentMethods.filter((p) => p.is_active).length;

  const getPaymentVisual = (pm) => {
    const code = (pm.code || "").toUpperCase();
    const name = (pm.name || "").toLowerCase();

    if (code.includes("QRIS") || name.includes("qris")) {
      return {
        type: "QRIS",
        badgeText: "QRIS",
        badgeBg: "linear-gradient(135deg, #f97316, #ea580c)",
        badgeColor: "#ffffff",
        badgeShadow: "0 2px 6px rgba(249,115,22,0.3)",
        icon: <QrCode size={24} style={{ color: "#f97316" }} />,
        codeTagColor: "#f97316",
        codeTagBg: "rgba(249,115,22,0.12)",
        codeTagBorder: "rgba(249,115,22,0.25)",
        fallbackSub: "Scan QRIS Interaktif",
      };
    }

    if (code.includes("CASH") || code.includes("TUNAI") || name.includes("tunai") || name.includes("cash")) {
      return {
        type: "CASH",
        badgeText: "TUNAI",
        badgeBg: "linear-gradient(135deg, #10b981, #059669)",
        badgeColor: "#ffffff",
        badgeShadow: "0 2px 6px rgba(16,185,129,0.3)",
        icon: <Banknote size={24} style={{ color: "#10b981" }} />,
        codeTagColor: "#10b981",
        codeTagBg: "rgba(16,185,129,0.12)",
        codeTagBorder: "rgba(16,185,129,0.25)",
        fallbackSub: "Uang Pas / Kasir Langsung",
      };
    }

    if (
      code.includes("BANK") ||
      code.includes("BCA") ||
      code.includes("BRI") ||
      code.includes("BNI") ||
      code.includes("MANDIRI") ||
      code.includes("TRANSFER") ||
      name.includes("transfer") ||
      name.includes("bank")
    ) {
      return {
        type: "TRANSFER",
        badgeText: "BANK",
        badgeBg: "linear-gradient(135deg, #3b82f6, #2563eb)",
        badgeColor: "#ffffff",
        badgeShadow: "0 2px 6px rgba(59,130,246,0.3)",
        icon: <CreditCard size={24} style={{ color: "#3b82f6" }} />,
        codeTagColor: "#3b82f6",
        codeTagBg: "rgba(59,130,246,0.12)",
        codeTagBorder: "rgba(59,130,246,0.25)",
        fallbackSub: "Transfer Rekening Bank",
      };
    }

    return {
      type: "OTHER",
      badgeText: code || "PAY",
      badgeBg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
      badgeColor: "#ffffff",
      badgeShadow: "0 2px 6px rgba(139,92,246,0.3)",
      icon: <Wallet size={24} style={{ color: "#8b5cf6" }} />,
      codeTagColor: "#8b5cf6",
      codeTagBg: "rgba(139,92,246,0.12)",
      codeTagBorder: "rgba(139,92,246,0.25)",
      fallbackSub: "Metode Pembayaran",
    };
  };

  const countQRIS = paymentMethods.filter(
    (p) => (p.code || "").toUpperCase().includes("QRIS") || (p.name || "").toLowerCase().includes("qris")
  ).length;

  const countCash = paymentMethods.filter(
    (p) =>
      (p.code || "").toUpperCase().includes("CASH") ||
      (p.code || "").toUpperCase().includes("TUNAI") ||
      (p.name || "").toLowerCase().includes("tunai") ||
      (p.name || "").toLowerCase().includes("cash")
  ).length;

  const countTransfer = paymentMethods.filter(
    (p) =>
      (p.code || "").toUpperCase().includes("BANK") ||
      (p.code || "").toUpperCase().includes("BCA") ||
      (p.code || "").toUpperCase().includes("BRI") ||
      (p.code || "").toUpperCase().includes("BNI") ||
      (p.code || "").toUpperCase().includes("MANDIRI") ||
      (p.code || "").toUpperCase().includes("TRANSFER") ||
      (p.name || "").toLowerCase().includes("transfer") ||
      (p.name || "").toLowerCase().includes("bank")
  ).length;

  const filterTabs = [
    { id: "Semua", label: "Semua", count: paymentMethods.length },
    { id: "QRIS", label: "QRIS", count: countQRIS },
    { id: "Tunai", label: "Tunai", count: countCash },
    { id: "Transfer", label: "Transfer", count: countTransfer },
    { id: "Aktif", label: "Aktif", count: activeCount },
  ].filter((f) => f.id === "Semua" || f.count > 0);

  const filteredPayments = paymentMethods.filter((pm) => {
    const code = (pm.code || "").toUpperCase();
    const name = (pm.name || "").toLowerCase();
    const accName = (pm.account_name || "").toLowerCase();
    const accNum = (pm.account_number || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchSearch =
      !query ||
      code.toLowerCase().includes(query) ||
      name.includes(query) ||
      accName.includes(query) ||
      accNum.includes(query);

    let matchFilter = true;
    if (activeFilter === "Aktif") {
      matchFilter = !!pm.is_active;
    } else if (activeFilter === "Nonaktif") {
      matchFilter = !pm.is_active;
    } else if (activeFilter === "QRIS") {
      matchFilter = code.includes("QRIS") || name.includes("qris");
    } else if (activeFilter === "Tunai") {
      matchFilter = code.includes("CASH") || code.includes("TUNAI") || name.includes("tunai") || name.includes("cash");
    } else if (activeFilter === "Transfer") {
      matchFilter =
        code.includes("BANK") ||
        code.includes("BCA") ||
        code.includes("BRI") ||
        code.includes("BNI") ||
        code.includes("MANDIRI") ||
        code.includes("TRANSFER") ||
        name.includes("transfer") ||
        name.includes("bank");
    }

    return matchSearch && matchFilter;
  });

  return (
    <div>
      {/* Summary Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #059669, #10b981)",
          borderRadius: 20,
          padding: "18px 20px",
          marginBottom: 16,
          color: "#fff",
        }}
      >
        <p style={{ fontSize: "0.75rem", fontWeight: 600, opacity: 0.85, marginBottom: 4 }}>
          Master Metode Pembayaran
        </p>
        <p suppressHydrationWarning style={{ fontSize: "1.8rem", fontWeight: 900, fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>
          {activeCount} Metode Aktif
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Total Opsi", value: paymentMethods.length },
            { label: "Aktif di Kasir", value: activeCount },
            { label: "Dinonaktifkan", value: paymentMethods.length - activeCount, highlight: true },
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
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: stat.highlight && stat.value > 0 ? "#fef08a" : "#fff" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search Bar — same style as Kelola Produk */}
      <div style={{ position: "relative", marginBottom: 12 }}>
        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <Search size={17} style={{ color: "var(--admin-text-muted)" }} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari metode pembayaran..."
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
        <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
          <SlidersHorizontal size={17} style={{ color: "var(--admin-text-muted)" }} />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          marginBottom: 14,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="hide-scrollbar"
      >
        {filterTabs.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveFilter(cat.id)}
            style={{
              flexShrink: 0,
              padding: "7px 16px",
              borderRadius: 999,
              border: `1px solid ${activeFilter === cat.id ? "#10b981" : "var(--admin-border)"}`,
              background: activeFilter === cat.id ? "rgba(16,185,129,0.12)" : "var(--admin-card-bg)",
              color: activeFilter === cat.id ? "#10b981" : "var(--admin-text-muted)",
              fontWeight: 700,
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {cat.label} ({cat.count})
          </button>
        ))}
      </div>

      {/* Payment Methods List Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)", margin: 0 }}>
          Daftar Metode Pembayaran
        </p>
        <p style={{ fontSize: "0.72rem", color: "var(--admin-text-sub)", margin: 0 }}>
          {filteredPayments.length} metode ditemukan
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
          <Loader2 className="animate-spin" size={28} style={{ color: "#10b981" }} />
        </div>
      ) : filteredPayments.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--admin-text-muted)" }}>
          <p style={{ fontSize: "0.9rem" }}>Tidak ada metode pembayaran ditemukan.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 90 }}>
          {filteredPayments.map((pm) => {
            const visual = getPaymentVisual(pm);
            return (
              <div
                key={pm.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: 14,
                  background: "var(--admin-card-bg)",
                  border: `1px solid ${pm.is_active ? "var(--admin-card-border)" : "rgba(239,68,68,0.2)"}`,
                  borderRadius: 16,
                  transition: "all 0.2s",
                  opacity: pm.is_active ? 1 : 0.75,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                }}
              >
                {/* Left Column: Tiny Label + Visual Icon / QR thumbnail */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {/* Tiny Badge above thumbnail */}
                  <span
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: 800,
                      lineHeight: 1,
                      padding: "2px 6px",
                      borderRadius: 6,
                      background: pm.is_active ? visual.badgeBg : "rgba(239,68,68,0.15)",
                      color: pm.is_active ? visual.badgeColor : "#ef4444",
                      marginBottom: 4,
                      whiteSpace: "nowrap",
                      boxShadow: pm.is_active ? visual.badgeShadow : "none",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {pm.is_active ? visual.badgeText : "OFF"}
                  </span>

                  {/* Thumbnail / Payment Icon */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pm.qr_image_url) {
                        setPreviewQrUrl(pm.qr_image_url);
                      } else {
                        handleOpenEdit(pm);
                      }
                    }}
                    title={pm.qr_image_url ? "Klik untuk melihat QRIS" : "Klik untuk ubah metode"}
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 14,
                      flexShrink: 0,
                      overflow: "hidden",
                      background: "var(--admin-surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      border: "1.5px solid var(--admin-border)",
                      position: "relative",
                    }}
                  >
                    {pm.qr_image_url ? (
                      <>
                        <img
                          src={pm.qr_image_url}
                          alt={pm.name}
                          style={{ width: "100%", height: "100%", objectFit: "contain", background: "#fff", padding: 3 }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 2,
                            right: 2,
                            background: "rgba(0,0,0,0.65)",
                            color: "#fff",
                            borderRadius: 4,
                            padding: "2px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Maximize2 size={8} />
                        </div>
                      </>
                    ) : (
                      visual.icon
                    )}
                  </div>
                </div>

                {/* Info - Click to Edit */}
                <div
                  onClick={() => handleOpenEdit(pm)}
                  style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                  title="Klik untuk ubah metode pembayaran"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: "var(--admin-text)",
                        textDecoration: pm.is_active ? "none" : "line-through",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        margin: 0,
                      }}
                    >
                      {pm.name}
                    </p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        fontWeight: 800,
                        color: visual.codeTagColor,
                        background: visual.codeTagBg,
                        padding: "1px 6px",
                        borderRadius: 5,
                        border: `1px solid ${visual.codeTagBorder}`,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 2,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {pm.code}
                    </span>
                    {pm.account_name ? (
                      <p style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pm.account_name}
                      </p>
                    ) : (
                      <p style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", margin: 0 }}>
                        {pm.is_active ? "● Tampil di Kasir & Order" : "○ Disembunyikan"}
                      </p>
                    )}
                  </div>

                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      backgroundImage: pm.is_active
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : "linear-gradient(135deg, #9ca3af, #6b7280)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      margin: 0,
                      letterSpacing: "0.02em",
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {pm.account_number ? pm.account_number : visual.fallbackSub}
                  </p>
                </div>

                {/* Actions: Edit & Status Pill Toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(pm)}
                    title="Ubah Metode Pembayaran"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      border: "1px solid var(--admin-border)",
                      background: "var(--admin-surface-2)",
                      color: "var(--admin-text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <Pencil size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(pm.id, !pm.is_active);
                    }}
                    title={pm.is_active ? "Klik untuk nonaktifkan" : "Klik untuk aktifkan"}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "6px 11px",
                      borderRadius: 999,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      transition: "all 0.2s",
                      background: pm.is_active ? "var(--admin-green-soft)" : "var(--admin-red-soft)",
                      color: pm.is_active ? "var(--admin-green)" : "var(--admin-red)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pm.is_active ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    {pm.is_active ? "Aktif" : "Nonaktif"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB Tambah Metode Bayar */}
      <button
        onClick={handleOpenAdd}
        className="mobile-fab"
        style={{
          position: "fixed",
          padding: "16px 24px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #059669, #10b981)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "0.95rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(16,185,129,0.4)",
          zIndex: 40,
        }}
      >
        <Plus size={20} /> Tambah Metode Bayar
      </button>

      {/* Modal Tambah / Edit Metode Pembayaran */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 640,
              maxHeight: "90dvh",
              background: "var(--admin-header-bg)",
              border: "1px solid var(--admin-border)",
              borderRadius: "24px 24px 0 0",
              overflow: "hidden",
              boxShadow: "0 -20px 60px rgba(0,0,0,0.4)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "linear-gradient(135deg, #059669, #10b981)",
                flexShrink: 0,
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>
                {editingPaymentId ? "✏️ Ubah Metode Pembayaran" : "💳 Tambah Metode Pembayaran Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Nama Metode Pembayaran *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: QRIS All Payment / Transfer BCA"
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                    style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                      Kode Unik *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="CASH / QRIS / BCA / DANA"
                      value={form.code}
                      onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none", textTransform: "uppercase" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                      Atas Nama Akun / Toko
                    </label>
                    <input
                      type="text"
                      placeholder="WARMINDO SH OFFICIAL"
                      value={form.account_name}
                      onChange={(e) => setForm((prev) => ({ ...prev, account_name: e.target.value }))}
                      style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Nomor Rekening / NMID QRIS
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 827-192-8391 atau NMID: ID1020039281920"
                    value={form.account_number}
                    onChange={(e) => setForm((prev) => ({ ...prev, account_number: e.target.value }))}
                    style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                  />
                </div>

                {/* Upload QR Image */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Upload Foto Barcode QRIS (Opsional)
                  </label>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    {form.qrPreview ? (
                      <div style={{ position: "relative", width: 72, height: 72, borderRadius: 12, overflow: "hidden", border: "1px solid var(--admin-border)", background: "#fff", flexShrink: 0 }}>
                        <img src={form.qrPreview} alt="QR Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                        <button
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, qrFile: null, qrPreview: null, qr_image_url: "" }))}
                          style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "rgba(239,68,68,0.9)", color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div style={{ width: 72, height: 72, borderRadius: 12, border: "2px dashed var(--admin-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--admin-text-muted)", flexShrink: 0 }}>
                        <QrCode size={24} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrFileChange}
                        style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", width: "100%" }}
                      />
                      <span style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", display: "block", marginTop: 4 }}>
                        File disimpan ke folder <code>public/uploads/payment-methods/</code>.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Toggle */}
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Status Ketersediaan
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 12, border: form.is_active ? "1px solid #10b981" : "1px solid var(--admin-border)", background: form.is_active ? "rgba(16,185,129,0.1)" : "var(--admin-input-bg)", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="is_active_payment"
                        checked={form.is_active}
                        onChange={() => setForm((prev) => ({ ...prev, is_active: true }))}
                        style={{ accentColor: "#10b981" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>✅ Aktif (Tampil)</span>
                    </label>
                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 12, border: !form.is_active ? "1px solid #ef4444" : "1px solid var(--admin-border)", background: !form.is_active ? "rgba(239,68,68,0.1)" : "var(--admin-input-bg)", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="is_active_payment"
                        checked={!form.is_active}
                        onChange={() => setForm((prev) => ({ ...prev, is_active: false }))}
                        style={{ accentColor: "#ef4444" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>❌ Nonaktif</span>
                    </label>
                  </div>
                </div>

                <div className="mobile-safe-bottom" style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  {editingPaymentId && (
                    <button
                      type="button"
                      onClick={() => setPaymentToDelete({ id: editingPaymentId, name: form.name })}
                      style={{ padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)", background: "var(--admin-red-soft)", color: "var(--admin-red)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  )}
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid var(--admin-border)", background: "var(--admin-surface-2)", color: "var(--admin-text-muted)", fontWeight: 700, cursor: "pointer" }}>
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingPaymentId ? "Simpan Perubahan" : "Tambah Metode")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Dialog Hapus Metode Pembayaran */}
      <AnimatePresence>
        {paymentToDelete && (
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
            onClick={() => !isDeleting && setPaymentToDelete(null)}
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
                <Trash2 size={26} />
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--admin-text)", marginBottom: 8 }}>
                Hapus Metode Pembayaran?
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", lineHeight: 1.45, marginBottom: 20 }}>
                Yakin ingin menghapus opsi pembayaran <strong>{paymentToDelete.name}</strong>? Pelanggan tidak akan bisa memilih metode ini lagi.
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setPaymentToDelete(null)}
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
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: 12,
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Fullscreen Preview Modal */}
      <AnimatePresence>
        {previewQrUrl && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 130,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setPreviewQrUrl(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: "20px",
                maxWidth: 320,
                width: "100%",
                textAlign: "center",
                boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              }}
            >
              <h4 style={{ color: "#000", fontWeight: 800, marginBottom: 12, fontSize: "1rem" }}>
                Preview QRIS
              </h4>
              <img
                src={previewQrUrl}
                alt="Preview QRIS"
                style={{ width: "100%", height: "auto", maxHeight: 300, objectFit: "contain", borderRadius: 12 }}
              />
              <button
                type="button"
                onClick={() => setPreviewQrUrl(null)}
                style={{
                  marginTop: 16,
                  width: "100%",
                  padding: "10px",
                  borderRadius: 12,
                  border: "none",
                  background: "#10b981",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
