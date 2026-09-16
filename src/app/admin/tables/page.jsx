"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  QrCode, 
  Edit3, 
  Trash2, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Copy,
  Printer,
  X,
  Flame
} from "lucide-react";

export default function MasterTablesPage() {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // QR Modal
  const [qrModalTable, setQrModalTable] = useState(null);

  const [formData, setFormData] = useState({
    table_number: "",
    capacity: 4,
    status: "AVAILABLE",
  });

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/tables");
      const json = await res.json();
      if (json.success) {
        setTables(json.data);
      } else {
        showToast(json.message || "Gagal memuat meja");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan jaringan saat memuat data meja");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    const nextNumber = tables.length > 0
      ? `Meja ${String(tables.length + 1).padStart(2, "0")}`
      : "Meja 01";

    setFormData({
      table_number: nextNumber,
      capacity: 4,
      status: "AVAILABLE",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t.id);
    setFormData({
      table_number: t.table_number,
      capacity: t.capacity,
      status: t.status,
    });
    setIsModalOpen(true);
  };

  const handleStatusChangeQuick = async (id, newStatus) => {
    try {
      const res = await fetch("/api/admin/tables", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTables(tables.map(t => t.id === id ? { ...t, status: newStatus } : t));
        showToast(`Status meja berhasil diubah ke ${newStatus}`, "success");
      } else {
        showToast(json.message || "Gagal mengubah status meja");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.table_number.trim()) {
      showToast("Nomor meja tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    const isEdit = !!editingId;
    const url = "/api/admin/tables";
    const method = isEdit ? "PUT" : "POST";
    const payload = {
      ...(isEdit ? { id: editingId } : {}),
      table_number: formData.table_number.trim(),
      capacity: Number(formData.capacity) || 4,
      status: formData.status,
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        showToast(isEdit ? "Data meja berhasil diperbarui!" : "Meja baru berhasil ditambahkan!", "success");
        fetchTables();
      } else {
        showToast(json.message || "Gagal menyimpan meja");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/tables?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirmId(null);
        showToast("Meja berhasil dihapus", "success");
        fetchTables();
      } else {
        showToast(json.message || "Gagal menghapus meja");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const copyOrderLink = (cleanNum) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/order?table=${cleanNum}`;
    navigator.clipboard.writeText(url);
    showToast("Tautan order meja berhasil disalin!", "success");
  };

  const filteredTables = tables.filter(t => {
    const matchesSearch = t.table_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const countAvailable = tables.filter(t => t.status === "AVAILABLE").length;
  const countOccupied = tables.filter(t => t.status === "OCCUPIED").length;
  const countReserved = tables.filter(t => t.status === "RESERVED").length;

  return (
    <div style={{ position: "relative" }}>
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 14,
            background: toast.type === "success" ? "#10b981" : "#ef4444",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      )}

      {/* Header Info */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--admin-text)", letterSpacing: "-0.02em" }}>
          🪑 Master Meja & QR
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginTop: 2 }}>
          Kelola nomor meja, kapasitas kursi, status keterisian, dan cetak QR Code pesanan pelanggan.
        </p>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 16 }}>
        <div 
          onClick={() => setStatusFilter("ALL")}
          style={{ 
            background: statusFilter === "ALL" ? "var(--admin-pill-bg)" : "var(--admin-card-bg)", 
            border: `1px solid ${statusFilter === "ALL" ? "var(--accent-orange)" : "var(--admin-border)"}`, 
            borderRadius: 14, padding: "10px 6px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" 
          }}
        >
          <div style={{ fontSize: "0.65rem", color: "var(--admin-text-muted)", fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--admin-text)", marginTop: 1 }}>{tables.length}</div>
        </div>

        <div 
          onClick={() => setStatusFilter("AVAILABLE")}
          style={{ 
            background: statusFilter === "AVAILABLE" ? "rgba(16,185,129,0.15)" : "var(--admin-card-bg)", 
            border: `1px solid ${statusFilter === "AVAILABLE" ? "#10b981" : "var(--admin-border)"}`, 
            borderRadius: 14, padding: "10px 6px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" 
          }}
        >
          <div style={{ fontSize: "0.65rem", color: "#10b981", fontWeight: 700 }}>Tersedia</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#10b981", marginTop: 1 }}>{countAvailable}</div>
        </div>

        <div 
          onClick={() => setStatusFilter("OCCUPIED")}
          style={{ 
            background: statusFilter === "OCCUPIED" ? "rgba(239,68,68,0.15)" : "var(--admin-card-bg)", 
            border: `1px solid ${statusFilter === "OCCUPIED" ? "#ef4444" : "var(--admin-border)"}`, 
            borderRadius: 14, padding: "10px 6px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" 
          }}
        >
          <div style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: 700 }}>Terisi</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#ef4444", marginTop: 1 }}>{countOccupied}</div>
        </div>

        <div 
          onClick={() => setStatusFilter("RESERVED")}
          style={{ 
            background: statusFilter === "RESERVED" ? "rgba(245,158,11,0.15)" : "var(--admin-card-bg)", 
            border: `1px solid ${statusFilter === "RESERVED" ? "#f59e0b" : "var(--admin-border)"}`, 
            borderRadius: 14, padding: "10px 6px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" 
          }}
        >
          <div style={{ fontSize: "0.65rem", color: "#f59e0b", fontWeight: 700 }}>Booking</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#f59e0b", marginTop: 1 }}>{countReserved}</div>
        </div>
      </div>

      {/* Search Input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--admin-card-bg)",
          border: "1px solid var(--admin-border)",
          borderRadius: 14,
          padding: "0 14px",
          height: 44,
          marginBottom: 16,
        }}
      >
        <Search size={16} style={{ color: "var(--admin-text-muted)", marginRight: 10 }} />
        <input
          type="text"
          placeholder="Cari nomor meja (contoh: Meja 02)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--admin-text)",
            fontSize: "0.85rem",
          }}
        />
      </div>

      {/* List Tables */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 className="animate-spin" size={30} style={{ color: "var(--accent-orange)" }} />
        </div>
      ) : filteredTables.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px", background: "var(--admin-card-bg)", borderRadius: 18, border: "1px dashed var(--admin-border)" }}>
          <Users size={36} style={{ color: "var(--admin-text-muted)", margin: "0 auto 10px" }} />
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--admin-text)" }}>Tidak ada meja ditemukan</p>
          <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: 4 }}>
            {searchQuery ? "Coba kata kunci pencarian lain." : "Klik tombol '+ Tambah Meja' untuk menambahkan meja baru."}
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12, paddingBottom: 80 }}>
          {filteredTables.map((t) => {
            const statusConfig = {
              AVAILABLE: { label: "Tersedia", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
              OCCUPIED: { label: "Terisi Tamu", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
              RESERVED: { label: "Dipesan", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
            }[t.status] || { label: t.status, color: "#9ca3af", bg: "rgba(156,163,175,0.12)" };

            return (
              <div
                key={t.id}
                style={{
                  background: "var(--admin-card-bg)",
                  border: "1px solid var(--admin-border)",
                  borderRadius: 18,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                }}
              >
                {/* Atas: Nomor Meja & Status Badge */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "var(--admin-text)" }}>
                      {t.table_number}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={12} /> Kapasitas: <strong>{t.capacity} Kursi</strong>
                    </div>
                  </div>

                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChangeQuick(t.id, e.target.value)}
                    style={{
                      background: statusConfig.bg,
                      color: statusConfig.color,
                      border: `1px solid ${statusConfig.color}40`,
                      borderRadius: 10,
                      padding: "4px 8px",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <option value="AVAILABLE">🟢 Tersedia</option>
                    <option value="OCCUPIED">🔴 Terisi</option>
                    <option value="RESERVED">🟡 Booking</option>
                  </select>
                </div>

                {/* Tengah: Statistik Okupansi & Pesanan */}
                <div style={{ display: "flex", gap: 8, background: "var(--admin-surface-2)", padding: "8px 12px", borderRadius: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--admin-text-muted)" }}>Tamu Aktif</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--admin-text)" }}>
                      {t.occupied_guests} <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--admin-text-muted)" }}>/ {t.capacity}</span>
                    </div>
                  </div>
                  <div style={{ width: 1, background: "var(--admin-border)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.65rem", color: "var(--admin-text-muted)" }}>Pesanan Berjalan</div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: t.active_orders_count > 0 ? "#f97316" : "var(--admin-text)" }}>
                      {t.active_orders_count > 0 ? `🔥 ${t.active_orders_count} Pesanan` : "Nihil"}
                    </div>
                  </div>
                </div>

                {/* Bawah: Tombol Aksi */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 4 }}>
                  {/* Tombol QR Code */}
                  <button
                    onClick={() => setQrModalTable(t)}
                    style={{
                      flex: 1,
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid var(--admin-border)",
                      background: "rgba(249,115,22,0.1)",
                      color: "#f97316",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      cursor: "pointer",
                    }}
                  >
                    <QrCode size={14} /> Cetak QR
                  </button>

                  {/* Tombol Edit */}
                  <button
                    onClick={() => handleOpenEdit(t)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: "1px solid var(--admin-border)",
                      background: "var(--admin-surface-2)",
                      color: "var(--admin-text)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    title="Ubah Meja"
                  >
                    <Edit3 size={14} />
                  </button>

                  {/* Tombol Hapus */}
                  <button
                    onClick={() => setDeleteConfirmId(t.id)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: "1px solid rgba(239,68,68,0.2)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#ef4444",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                    title="Hapus Meja"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB Tambah Meja */}
      <button
        onClick={handleOpenAdd}
        className="mobile-fab"
        style={{
          position: "fixed",
          right: 20,
          bottom: 24,
          padding: "14px 22px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "0.9rem",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(249,115,22,0.4)",
          zIndex: 40,
        }}
      >
        <Plus size={18} /> Tambah Meja
      </button>

      {/* Modal QR Code Meja */}
      {qrModalTable && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(5px)",
            padding: 20,
          }}
          onClick={() => setQrModalTable(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              background: "#ffffff",
              color: "#111827",
              borderRadius: 24,
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Cetak Card */}
            <div style={{ background: "linear-gradient(135deg, #f97316, #ea580c)", padding: "20px 20px 16px", color: "#fff" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                WARMINDO SH
              </div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: 900, marginTop: 4 }}>
                {qrModalTable.table_number}
              </h2>
              <p style={{ fontSize: "0.75rem", opacity: 0.9, marginTop: 2 }}>
                Scan untuk pesan makanan & minuman langsung
              </p>
            </div>

            {/* Area Gambar QR */}
            <div style={{ padding: 24 }}>
              {(() => {
                const origin = typeof window !== "undefined" ? window.location.origin : "https://warmindo-sh.duckdns.org";
                const orderUrl = `${origin}/order?table=${qrModalTable.clean_number}`;
                const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(orderUrl)}&margin=10`;

                return (
                  <div>
                    <div
                      style={{
                        padding: 12,
                        background: "#fff",
                        border: "2px dashed #e5e7eb",
                        borderRadius: 18,
                        display: "inline-block",
                      }}
                    >
                      <img
                        src={qrImageSrc}
                        alt={`QR Code ${qrModalTable.table_number}`}
                        style={{ width: 200, height: 200, display: "block" }}
                      />
                    </div>

                    <div style={{ marginTop: 14, fontSize: "0.72rem", color: "#6b7280", wordBreak: "break-all" }}>
                      URL: <strong>{orderUrl}</strong>
                    </div>

                    <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                      <button
                        onClick={() => copyOrderLink(qrModalTable.clean_number)}
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 12,
                          border: "1px solid #d1d5db",
                          background: "#f3f4f6",
                          color: "#374151",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          cursor: "pointer",
                        }}
                      >
                        <Copy size={14} /> Salin Link
                      </button>

                      <a
                        href={orderUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          flex: 1,
                          padding: "10px",
                          borderRadius: 12,
                          background: "linear-gradient(135deg, #f97316, #ea580c)",
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.78rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          textDecoration: "none",
                        }}
                      >
                        <ExternalLink size={14} /> Buka Order
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Tutup Modal */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #f3f4f6", background: "#f9fafb" }}>
              <button
                onClick={() => setQrModalTable(null)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  color: "#6b7280",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Meja */}
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
              maxWidth: 480,
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
            {/* Header Modal */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                flexShrink: 0,
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#fff" }}>
                {editingId ? "✏️ Ubah Data Meja" : "🪑 Tambah Meja Baru"}
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
                ✕
              </button>
            </div>

            {/* Form */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Nomor / Nama Meja *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Meja 06, VIP 01, Meja Bar"
                    value={formData.table_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
                    style={{
                      width: "100%",
                      background: "var(--admin-input-bg)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: 12,
                      padding: "12px",
                      fontSize: "0.9rem",
                      color: "var(--admin-text)",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: 4, display: "block" }}>
                    Nomor meja akan terdeteksi di URL pesanan pelanggan (misal: /order?table=06).
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Kapasitas Kursi (Pax) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    style={{
                      width: "100%",
                      background: "var(--admin-input-bg)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: 12,
                      padding: "12px",
                      fontSize: "0.9rem",
                      color: "var(--admin-text)",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Status Ketersediaan
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px",
                        borderRadius: 12,
                        border: formData.status === "AVAILABLE" ? "1px solid #10b981" : "1px solid var(--admin-border)",
                        background: formData.status === "AVAILABLE" ? "rgba(16,185,129,0.12)" : "var(--admin-input-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === "AVAILABLE"}
                        onChange={() => setFormData(prev => ({ ...prev, status: "AVAILABLE" }))}
                        style={{ accentColor: "#10b981" }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--admin-text)", fontWeight: 700 }}>🟢 Tersedia</span>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px",
                        borderRadius: 12,
                        border: formData.status === "OCCUPIED" ? "1px solid #ef4444" : "1px solid var(--admin-border)",
                        background: formData.status === "OCCUPIED" ? "rgba(239,68,68,0.12)" : "var(--admin-input-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === "OCCUPIED"}
                        onChange={() => setFormData(prev => ({ ...prev, status: "OCCUPIED" }))}
                        style={{ accentColor: "#ef4444" }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--admin-text)", fontWeight: 700 }}>🔴 Terisi</span>
                    </label>

                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px",
                        borderRadius: 12,
                        border: formData.status === "RESERVED" ? "1px solid #f59e0b" : "1px solid var(--admin-border)",
                        background: formData.status === "RESERVED" ? "rgba(245,158,11,0.12)" : "var(--admin-input-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={formData.status === "RESERVED"}
                        onChange={() => setFormData(prev => ({ ...prev, status: "RESERVED" }))}
                        style={{ accentColor: "#f59e0b" }}
                      />
                      <span style={{ fontSize: "0.75rem", color: "var(--admin-text)", fontWeight: 700 }}>🟡 Booking</span>
                    </label>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: 12,
                      border: "1px solid var(--admin-border)",
                      background: "var(--admin-surface-2)",
                      color: "var(--admin-text-muted)",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      flex: 1,
                      padding: "14px",
                      borderRadius: 12,
                      border: "none",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      color: "#fff",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? "Simpan Perubahan" : "Simpan Meja")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Konfirmasi Hapus */}
      {deleteConfirmId && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            padding: 20,
          }}
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 380,
              background: "var(--admin-header-bg)",
              border: "1px solid var(--admin-border)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "rgba(239,68,68,0.12)",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <Trash2 size={24} />
              </div>
              <h4 style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--admin-text)" }}>Hapus Meja?</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginTop: 6, lineHeight: 1.4 }}>
                Meja yang masih memiliki pesanan aktif tidak dapat dihapus demi integritas data pesanan.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "1px solid var(--admin-border)",
                  background: "var(--admin-surface-2)",
                  color: "var(--admin-text)",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: 12,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
