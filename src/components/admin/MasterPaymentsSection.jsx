"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, CheckSquare, Square, Pencil, Trash2, QrCode, Upload, X, AlertTriangle, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterPaymentsSection({ showToast }) {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        <p style={{ fontSize: "0.75rem", fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>
          Master Metode Pembayaran
        </p>
        <p style={{ fontSize: "1.6rem", fontWeight: 900, marginBottom: 12 }}>
          {activeCount} Metode Aktif
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { label: "Total Opsi", value: paymentMethods.length },
            { label: "Aktif di Pelanggan", value: activeCount },
            { label: "Dinonaktifkan", value: paymentMethods.length - activeCount, highlight: true },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 12,
                padding: "8px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "0.6rem", fontWeight: 600, opacity: 0.85, marginBottom: 2 }}>{stat.label}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: 900, color: stat.highlight && stat.value > 0 ? "#fef08a" : "#fff" }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* List Payment Methods */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)" }}>
          Daftar Metode Pembayaran ({paymentMethods.length})
        </p>
        <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)" }}>
          Aktifkan / nonaktifkan kapan saja
        </span>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "50px 0" }}>
          <Loader2 className="animate-spin" size={28} style={{ color: "#10b981" }} />
        </div>
      ) : paymentMethods.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 16px", color: "var(--admin-text-muted)" }}>
          <p>Belum ada metode pembayaran.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 90 }}>
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              style={{
                background: "var(--admin-card-bg)",
                border: `1px solid ${pm.is_active ? "var(--admin-card-border)" : "rgba(239,68,68,0.25)"}`,
                borderRadius: 16,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                opacity: pm.is_active ? 1 : 0.75,
                transition: "all 0.2s",
              }}
            >
              {/* Left Info */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: pm.code === "QRIS" ? "rgba(249,115,22,0.15)" : pm.code === "CASH" ? "rgba(16,185,129,0.15)" : "rgba(59,130,246,0.15)",
                      color: pm.code === "QRIS" ? "#f97316" : pm.code === "CASH" ? "#10b981" : "#3b82f6",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {pm.code}
                  </span>
                  <h4 style={{ fontWeight: 800, fontSize: "0.88rem", color: "var(--admin-text)", margin: 0 }}>
                    {pm.name}
                  </h4>
                </div>

                {(pm.account_number || pm.account_name) && (
                  <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", margin: "2px 0 4px" }}>
                    {pm.account_name && <span>{pm.account_name} • </span>}
                    <strong style={{ color: "var(--admin-text)" }}>{pm.account_number}</strong>
                  </p>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: pm.is_active ? "var(--admin-green)" : "var(--admin-red)" }}>
                    {pm.is_active ? "● Tampil di Kasir/Order" : "○ Disembunyikan"}
                  </span>
                  {pm.qr_image_url && (
                    <button
                      type="button"
                      onClick={() => setPreviewQrUrl(pm.qr_image_url)}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        color: "#10b981",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      <QrCode size={12} /> Lihat QRIS
                    </button>
                  )}
                </div>
              </div>

              {/* Right Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(pm)}
                  title="Ubah Metode"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    border: "1px solid var(--admin-border)",
                    background: "var(--admin-surface-2)",
                    color: "var(--admin-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Pencil size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleActive(pm.id, !pm.is_active)}
                  title={pm.is_active ? "Nonaktifkan" : "Aktifkan"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: pm.is_active ? "#10b981" : "var(--admin-text-muted)",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {pm.is_active ? <CheckSquare size={22} /> : <Square size={22} />}
                </button>
              </div>
            </div>
          ))}
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
