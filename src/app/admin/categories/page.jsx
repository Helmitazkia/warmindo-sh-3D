"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Layers, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Hash, 
  Utensils, 
  ArrowUpDown,
  AlertCircle
} from "lucide-react";

export default function MasterCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    display_order: 1,
    is_active: 1,
  });

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        showToast(json.message || "Gagal memuat kategori");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan jaringan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Helper auto-slugify
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    const nextOrder = categories.length > 0 
      ? Math.max(...categories.map(c => Number(c.display_order) || 0)) + 1 
      : 1;
    setFormData({
      name: "",
      slug: "",
      display_order: nextOrder,
      is_active: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      display_order: cat.display_order,
      is_active: cat.is_active ? 1 : 0,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    // Auto-fill slug if adding new or if slug was untouched
    if (!editingId) {
      setFormData(prev => ({ ...prev, name: val, slug: generateSlug(val) }));
    } else {
      setFormData(prev => ({ ...prev, name: val }));
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const newStatus = currentStatus ? 0 : 1;
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories(categories.map(c => c.id === id ? { ...c, is_active: newStatus } : c));
        showToast(newStatus ? "Kategori diaktifkan" : "Kategori dinonaktifkan", "success");
      } else {
        showToast(json.message || "Gagal mengubah status");
      }
    } catch (error) {
      console.error(error);
      showToast("Kesalahan jaringan");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast("Nama kategori tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    const isEdit = !!editingId;
    const url = "/api/admin/categories";
    const method = isEdit ? "PUT" : "POST";
    const payload = {
      ...(isEdit ? { id: editingId } : {}),
      name: formData.name.trim(),
      slug: formData.slug.trim() || generateSlug(formData.name),
      display_order: Number(formData.display_order) || 0,
      is_active: formData.is_active ? 1 : 0,
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
        showToast(isEdit ? "Kategori berhasil diperbarui!" : "Kategori baru berhasil ditambahkan!", "success");
        fetchCategories();
      } else {
        showToast(json.message || "Gagal menyimpan kategori");
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
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setDeleteConfirmId(null);
        showToast("Kategori berhasil dihapus", "success");
        fetchCategories();
      } else {
        showToast(json.message || "Gagal menghapus kategori");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalActive = categories.filter(c => c.is_active === 1 || c.is_active === true).length;
  const totalMenus = categories.reduce((acc, c) => acc + (Number(c.total_menus) || 0), 0);

  return (
    <div style={{ position: "relative" }}>
      {/* Toast Notification */}
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
          🏷️ Master Kategori
        </h1>
        <p style={{ fontSize: "0.78rem", color: "var(--admin-text-muted)", marginTop: 2 }}>
          Atur kelompok menu katalog produk, slug URL, dan urutan tampil.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)", borderRadius: 16, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", fontWeight: 700 }}>Total Kategori</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--admin-text)", marginTop: 2 }}>
            {categories.length}
          </div>
        </div>
        <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)", borderRadius: 16, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 700 }}>Aktif</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#10b981", marginTop: 2 }}>
            {totalActive}
          </div>
        </div>
        <div style={{ background: "var(--admin-card-bg)", border: "1px solid var(--admin-border)", borderRadius: 16, padding: "12px", textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "#f97316", fontWeight: 700 }}>Total Produk</div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#f97316", marginTop: 2 }}>
            {totalMenus}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div
        style={{
          position: "relative",
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
          placeholder="Cari kategori atau slug..."
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

      {/* List Categories */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Loader2 className="animate-spin" size={30} style={{ color: "var(--accent-orange)" }} />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 20px", background: "var(--admin-card-bg)", borderRadius: 18, border: "1px dashed var(--admin-border)" }}>
          <Layers size={36} style={{ color: "var(--admin-text-muted)", margin: "0 auto 10px" }} />
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--admin-text)" }}>Tidak ada kategori</p>
          <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", marginTop: 4 }}>
            {searchQuery ? "Coba kata kunci pencarian lain." : "Klik tombol '+ Tambah Kategori' untuk membuat kategori baru."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 80 }}>
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              style={{
                background: "var(--admin-card-bg)",
                border: "1px solid var(--admin-border)",
                borderRadius: 18,
                padding: "14px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                transition: "transform 0.15s ease",
              }}
            >
              {/* Info Kiri */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <span
                    style={{
                      background: cat.is_active ? "rgba(16,185,129,0.12)" : "rgba(156,163,175,0.15)",
                      color: cat.is_active ? "#10b981" : "var(--admin-text-muted)",
                      fontSize: "0.65rem",
                      fontWeight: 800,
                      padding: "3px 8px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {cat.is_active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                    {cat.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                  <span
                    style={{
                      background: "var(--admin-surface-2)",
                      color: "var(--admin-text-muted)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 8,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <ArrowUpDown size={10} /> Urutan #{cat.display_order}
                  </span>
                  <span
                    style={{
                      background: "rgba(249,115,22,0.12)",
                      color: "#f97316",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 8,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Utensils size={10} /> {cat.total_menus || 0} Menu
                  </span>
                </div>

                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--admin-text)" }}>
                  {cat.name}
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                  <Hash size={12} /> slug: <code style={{ color: "var(--accent-orange)", fontWeight: 600 }}>{cat.slug}</code>
                </div>
              </div>

              {/* Aksi Kanan */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                {/* Switch Aktif / Nonaktif */}
                <button
                  onClick={() => handleToggleActive(cat.id, cat.is_active)}
                  title={cat.is_active ? "Nonaktifkan kategori" : "Aktifkan kategori"}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 999,
                    background: cat.is_active ? "#10b981" : "var(--admin-surface-2)",
                    border: "1px solid var(--admin-border)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                    padding: 2,
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fff",
                      transform: cat.is_active ? "translateX(20px)" : "translateX(0px)",
                      transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleOpenEdit(cat)}
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
                  title="Ubah Kategori"
                >
                  <Edit3 size={15} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirmId(cat.id)}
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
                  title="Hapus Kategori"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
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
        <Plus size={18} /> Tambah Kategori
      </button>

      {/* Modal Tambah / Edit */}
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
              maxWidth: 500,
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
                {editingId ? "✏️ Ubah Kategori Menu" : "🏷️ Tambah Kategori Baru"}
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

            {/* Form Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Paket Hemat, Cemilan Pedas"
                    value={formData.name}
                    onChange={handleNameChange}
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
                    Slug URL (Unik) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: paket-hemat"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    style={{
                      width: "100%",
                      background: "var(--admin-input-bg)",
                      border: "1px solid var(--admin-border)",
                      borderRadius: 12,
                      padding: "12px",
                      fontSize: "0.85rem",
                      color: "var(--admin-text)",
                      fontFamily: "monospace",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "var(--admin-text-muted)", marginTop: 4, display: "block" }}>
                    Digunakan untuk filter katalog dan tautan.
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Urutan Tampil (Display Order)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: e.target.value }))}
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
                    Nomor lebih kecil akan tampil lebih awal di tab katalog pesanan pelanggan.
                  </span>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Status Kategori
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <label
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "12px",
                        borderRadius: 12,
                        border: formData.is_active === 1 ? "1px solid #10b981" : "1px solid var(--admin-border)",
                        background: formData.is_active === 1 ? "rgba(16,185,129,0.1)" : "var(--admin-input-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="is_active"
                        checked={formData.is_active === 1}
                        onChange={() => setFormData(prev => ({ ...prev, is_active: 1 }))}
                        style={{ accentColor: "#10b981" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>🟢 Aktif</span>
                    </label>
                    <label
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "12px",
                        borderRadius: 12,
                        border: formData.is_active === 0 ? "1px solid var(--admin-border)" : "1px solid var(--admin-border)",
                        background: formData.is_active === 0 ? "var(--admin-surface-2)" : "var(--admin-input-bg)",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="is_active"
                        checked={formData.is_active === 0}
                        onChange={() => setFormData(prev => ({ ...prev, is_active: 0 }))}
                        style={{ accentColor: "#f97316" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>⚪ Nonaktif</span>
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
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingId ? "Simpan Perubahan" : "Simpan Kategori")}
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
              <h4 style={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--admin-text)" }}>Hapus Kategori?</h4>
              <p style={{ fontSize: "0.8rem", color: "var(--admin-text-muted)", marginTop: 6, lineHeight: 1.4 }}>
                Pastikan tidak ada produk menu yang terhubung dengan kategori ini sebelum dihapus.
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
