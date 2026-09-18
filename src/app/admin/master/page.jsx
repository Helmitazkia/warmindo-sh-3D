"use client";

import { useState, useEffect } from "react";
import MasterMenuCard from "@/components/admin/MasterMenuCard";
import { Loader2, Plus, Search, CheckSquare, Square, SlidersHorizontal, Pencil, Trash2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MasterDataDashboard() {
  const [menus, setMenus] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Modal Menu states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    is_recommended: 0,
    selectedToppingIds: [],
    imageFile: null,
    imagePreview: null,
  });


  // Topping CRUD & Stock states
  const [toppings, setToppings] = useState([]);
  const [isLoadingToppings, setIsLoadingToppings] = useState(true);
  const [isToppingModalOpen, setIsToppingModalOpen] = useState(false);
  const [editingToppingId, setEditingToppingId] = useState(null);
  const [isSubmittingTopping, setIsSubmittingTopping] = useState(false);
  const [toppingToDelete, setToppingToDelete] = useState(null);
  const [isDeletingTopping, setIsDeletingTopping] = useState(false);
  const [toppingForm, setToppingForm] = useState({
    name: "",
    price: "",
    stock_qty: 0,
    unit: "Porsi",
    status_label: "Siap Saji",
    is_available: true,
  });

  const fetchToppings = async () => {
    setIsLoadingToppings(true);
    try {
      const res = await fetch("/api/admin/toppings");
      const json = await res.json();
      if (json.success) {
        setToppings(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingToppings(false);
    }
  };

  const handleToggleTopping = async (id, is_available) => {
    try {
      const res = await fetch("/api/admin/toppings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_available }),
      });
      const json = await res.json();
      if (json.success) {
        setToppings((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, is_available, status_label: is_available ? (t.stock_qty > 5 ? "Siap Saji" : "Menipis") : "Stok Habis" }
              : t
          )
        );
        showToast("Status stok topping diperbarui", "success");
      } else {
        showToast("Gagal update status topping");
      }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const handleOpenAddTopping = () => {
    setEditingToppingId(null);
    setToppingForm({
      name: "",
      price: "",
      stock_qty: 10,
      unit: "Porsi",
      status_label: "Siap Saji",
      is_available: true,
    });
    setIsToppingModalOpen(true);
  };

  const handleOpenEditTopping = (topping) => {
    setEditingToppingId(topping.id);
    setToppingForm({
      name: topping.name,
      price: topping.price !== undefined && topping.price !== null ? topping.price : "",
      stock_qty: topping.stock_qty,
      unit: topping.unit || "Porsi",
      status_label: topping.status_label || "Siap Saji",
      is_available: topping.is_available,
    });
    setIsToppingModalOpen(true);
  };

  const handleSubmitTopping = async (e) => {
    e.preventDefault();
    if (!toppingForm.name.trim()) {
      showToast("Nama topping wajib diisi");
      return;
    }
    setIsSubmittingTopping(true);
    try {
      const isEdit = !!editingToppingId;
      const url = "/api/admin/toppings";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...(isEdit ? { id: editingToppingId } : {}),
        name: toppingForm.name.trim(),
        price: Number(toppingForm.price) || 0,
        stock_qty: Number(toppingForm.stock_qty) || 0,
        unit: toppingForm.unit.trim() || "Porsi",
        status_label: toppingForm.status_label.trim() || "Siap Saji",
        is_available: toppingForm.is_available ? 1 : 0,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setIsToppingModalOpen(false);
        showToast(isEdit ? "Topping berhasil diubah!" : "Topping baru berhasil ditambahkan!", "success");
        fetchToppings();
      } else {
        showToast(json.message || "Gagal menyimpan topping");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan koneksi");
    } finally {
      setIsSubmittingTopping(false);
    }
  };

  const confirmDeleteTopping = async () => {
    if (!toppingToDelete) return;
    setIsDeletingTopping(true);
    try {
      const res = await fetch(`/api/admin/toppings?id=${toppingToDelete.id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setToppingToDelete(null);
        setIsToppingModalOpen(false);
        showToast("Topping berhasil dihapus dari stok", "success");
        fetchToppings();
      } else {
        showToast(json.message || "Gagal menghapus topping");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan server");
    } finally {
      setIsDeletingTopping(false);
    }
  };

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/menus");
      const json = await res.json();
      if (json.success) {
        setMenus(json.data.menus);
        setDbCategories(json.data.categories);
        if (json.data.categories.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: prev.category_id || json.data.categories[0].id }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchToppings();
  }, []);

  const handleOpenAdd = () => {
    setEditingMenuId(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      category_id: dbCategories[0]?.id || "",
      is_recommended: 0,
      selectedToppingIds: [],
      imageFile: null,
      imagePreview: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu) => {
    const initialToppingIds = menu.allow_toppings
      ? String(menu.allow_toppings)
          .split(",")
          .map((id) => Number(id.trim()))
          .filter(Boolean)
      : [];
    setEditingMenuId(menu.id);
    setFormData({
      name: menu.name || "",
      price: menu.price || "",
      description: menu.description || "",
      category_id: menu.category_id || dbCategories[0]?.id || "",
      is_recommended: menu.is_recommended ? 1 : 0,
      selectedToppingIds: initialToppingIds,
      imageFile: null,
      imagePreview: menu.image_url || null,
    });
    setIsModalOpen(true);
  };

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
        showToast("Status menu berhasil diperbarui", "success");
      } else { showToast("Gagal update menu"); }
    } catch (error) {
      console.error(error);
      showToast("Terjadi kesalahan jaringan");
    }
  };

  const categories = ["Semua", ...new Set(menus.map((m) => m.categoryName))];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let finalImageUrl = formData.imagePreview;

    if (formData.imageFile) {
      try {
        const uploadForm = new FormData();
        uploadForm.append("file", formData.imageFile);
        const uploadRes = await fetch("/api/upload/menu", { method: "POST", body: uploadForm });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          finalImageUrl = uploadJson.url;
        } else {
          showToast("Gagal upload gambar: " + uploadJson.message);
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        showToast("Terjadi kesalahan saat upload gambar");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const isEdit = !!editingMenuId;
      const url = "/api/admin/menus";
      const method = isEdit ? "PUT" : "POST";
      const payload = {
        ...(isEdit ? { id: editingMenuId } : {}),
        name: formData.name,
        category_id: formData.category_id,
        price: formData.price,
        description: formData.description,
        is_recommended: formData.is_recommended,
        allow_toppings: formData.selectedToppingIds && formData.selectedToppingIds.length > 0 ? formData.selectedToppingIds.join(",") : null,
        image_url: finalImageUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        setEditingMenuId(null);
        setFormData({ name: "", price: "", description: "", category_id: dbCategories[0]?.id || "", is_recommended: 0, selectedToppingIds: [], imageFile: null, imagePreview: null });
        showToast(isEdit ? "Data menu berhasil diperbarui!" : "Berhasil menambah menu baru!", "success");
        fetchMenus();
      } else {
        showToast("Gagal menyimpan menu: " + json.message);
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMenus = menus.filter((m) => {
    const matchCat = activeCategory === "Semua" || m.categoryName === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const availableCount = menus.filter((m) => m.is_available).length;

  return (
    <div>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed",
          top: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          borderRadius: 8,
          background: toast.type === "success" ? "#ecfdf5" : "#fef2f2",
          border: `1px solid ${toast.type === "success" ? "#34d399" : "#fca5a5"}`,
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
          color: toast.type === "success" ? "#065f46" : "#991b1b",
          minWidth: 320,
        }}>
          {toast.type === "success" ? (
            <CheckSquare size={20} style={{ color: "#10b981", flexShrink: 0 }} />
          ) : (
            <div style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: "#ef4444", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "bold" }}>!</div>
          )}
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600 }}>
              {toast.type === "success" ? "Berhasil" : "Terjadi Kesalahan"}
            </p>
            <p style={{ margin: 0, fontSize: "0.8rem", opacity: 0.9 }}>{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.6 }}>✕</button>
        </div>
      )}

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
        <p suppressHydrationWarning style={{ fontSize: "1.8rem", fontWeight: 900, fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>
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
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: 6, margin: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 6px #f59e0b", animation: "pulse 2s infinite", flexShrink: 0 }} />
              Stok Cepat Topping
            </p>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--admin-yellow)", background: "var(--admin-yellow-soft)", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(245,158,11,0.2)", flexShrink: 0 }}>
              LIVE KITCHEN
            </span>
          </div>
          <button
            onClick={handleOpenAddTopping}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "5px 10px",
              borderRadius: 8,
              border: "1px solid var(--accent-orange)",
              background: "var(--admin-pill-bg)",
              color: "var(--admin-pill-text)",
              fontSize: "0.72rem",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Plus size={13} /> Tambah Topping
          </button>
        </div>

        {isLoadingToppings ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
            <Loader2 className="animate-spin" size={20} style={{ color: "var(--accent-orange)" }} />
          </div>
        ) : toppings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "14px 0", color: "var(--admin-text-muted)", fontSize: "0.8rem" }}>
            Belum ada stok topping. Klik Tambah Topping untuk mengisi.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, width: "100%", boxSizing: "border-box" }}>
            {toppings.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  background: "var(--admin-surface-2)",
                  borderRadius: 12,
                  border: `1px solid ${item.is_available ? "var(--admin-border)" : "rgba(239,68,68,0.3)"}`,
                  opacity: item.is_available ? 1 : 0.75,
                  minWidth: 0,
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div style={{ minWidth: 0, flex: 1, paddingRight: 4, overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 3, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.76rem", color: "var(--admin-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                      {item.name}
                    </p>
                    <button
                      onClick={() => handleOpenEditTopping(item)}
                      title="Ubah topping"
                      style={{ background: "none", border: "none", padding: 1, cursor: "pointer", color: "var(--admin-text-muted)", display: "flex", alignItems: "center", flexShrink: 0 }}
                    >
                      <Pencil size={11} />
                    </button>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "#f97316" }}>
                      {item.price > 0 ? `+Rp ${Number(item.price).toLocaleString("id-ID")}` : "Gratis"}
                    </span>
                    <span style={{ fontSize: "0.55rem", color: "var(--admin-text-muted)" }}>•</span>
                    <p style={{ fontSize: "0.62rem", color: item.is_available ? "var(--admin-green)" : "var(--admin-red)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>
                      {item.status_label || (item.is_available ? "Siap Saji" : "Stok Habis")} ({item.stock_qty} {item.unit})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleTopping(item.id, !item.is_available)}
                  title={item.is_available ? "Klik untuk tandai habis" : "Klik untuk tandai siap saji"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: item.is_available ? "var(--accent-orange)" : "var(--admin-text-muted)", flexShrink: 0, padding: 0, display: "flex", alignItems: "center" }}
                >
                  {item.is_available ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
              </div>
            ))}
          </div>
        )}
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
              <MasterMenuCard
                key={menu.id}
                menu={menu}
                onToggleAvailable={handleToggleAvailable}
                onEdit={handleOpenEdit}
              />
            ))
          )}
        </div>
      )}

      {/* FAB Tambah Menu */}
      <button
        onClick={handleOpenAdd}
        className="mobile-fab"
        style={{
          position: "fixed",
          padding: "16px 24px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          color: "#fff",
          fontWeight: 800,
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
          boxShadow: "0 10px 25px rgba(249,115,22,0.4)",
          zIndex: 40,
        }}
      >
        <Plus size={20} /> Tambah Menu
      </button>

      {/* Modal Tambah / Edit Menu */}
      {isModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 640, maxHeight: "90dvh", background: "var(--admin-header-bg)", border: "1px solid var(--admin-border)", borderRadius: "24px 24px 0 0", overflow: "hidden", boxShadow: "0 -20px 60px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #f97316, #ea580c)", flexShrink: 0 }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>
                {editingMenuId ? "✏️ Ubah Data Menu" : "🍜 Tambah Menu Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Plus size={16} style={{ transform: "rotate(45deg)" }} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Nama Menu *</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Kategori *</label>
                    <select required value={formData.category_id} onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))} style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}>
                      {dbCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Harga (Rp) *</label>
                    <input type="number" required value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Deskripsi</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none", resize: "vertical" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Gambar Menu</label>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px dashed var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.85rem", color: "var(--admin-text-muted)", outline: "none" }} />
                  {formData.imagePreview && (
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12 }}>
                      <img src={formData.imagePreview} alt="Preview" style={{ height: 80, width: 80, borderRadius: 10, objectFit: "cover", border: "1px solid var(--admin-border)" }} />
                      <span style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>
                        {formData.imageFile ? "Gambar baru siap diunggah" : "Gambar saat ini"}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>Menu Favorit? (is_recommended)</label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 12, border: formData.is_recommended === 1 ? "1px solid #f97316" : "1px solid var(--admin-border)", background: formData.is_recommended === 1 ? "rgba(249,115,22,0.1)" : "var(--admin-input-bg)", cursor: "pointer" }}>
                      <input type="radio" name="is_recommended" checked={formData.is_recommended === 1} onChange={() => setFormData(prev => ({ ...prev, is_recommended: 1 }))} style={{ accentColor: "#f97316" }} />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>🌟 Ya, Favorit</span>
                    </label>
                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 12, border: formData.is_recommended === 0 ? "1px solid var(--admin-border)" : "1px solid var(--admin-border)", background: formData.is_recommended === 0 ? "var(--admin-surface-2)" : "var(--admin-input-bg)", cursor: "pointer" }}>
                      <input type="radio" name="is_recommended" checked={formData.is_recommended === 0} onChange={() => setFormData(prev => ({ ...prev, is_recommended: 0 }))} style={{ accentColor: "#f97316" }} />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>Biasa</span>
                    </label>
                  </div>
                </div>

                {/* Checklist Pilihan Topping Dinamis dari Tabel Toppings */}
                <div style={{ background: "var(--admin-surface-2)", padding: 14, borderRadius: 14, border: "1px solid var(--admin-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--admin-text)", display: "flex", alignItems: "center", gap: 6 }}>
                      <span>🍳 Pilihan Topping yang Diizinkan</span>
                    </label>
                    <span style={{ fontSize: "0.7rem", fontWeight: 800, color: (formData.selectedToppingIds || []).length > 0 ? "#f97316" : "var(--admin-text-muted)" }}>
                      {(formData.selectedToppingIds || []).length} dipilih
                    </span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", marginBottom: 10 }}>
                    Centang topping apa saja yang bisa dipilih pelanggan untuk menu ini (kosongkan jika menu ini seperti minuman/snack tanpa topping):
                  </p>

                  {toppings.length === 0 ? (
                    <p style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)", fontStyle: "italic" }}>
                      Belum ada topping di master data stok.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                      {toppings.map((top) => {
                        const isChecked = (formData.selectedToppingIds || []).includes(top.id);
                        return (
                          <label
                            key={top.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 10px",
                              borderRadius: 10,
                              background: isChecked ? "rgba(249,115,22,0.12)" : "var(--admin-input-bg)",
                              border: isChecked ? "1px solid #f97316" : "1px solid var(--admin-border)",
                              cursor: "pointer",
                              transition: "all 0.15s",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData((prev) => {
                                  const currentIds = prev.selectedToppingIds || [];
                                  const nextIds = checked
                                    ? [...currentIds, top.id]
                                    : currentIds.filter((id) => id !== top.id);
                                  return { ...prev, selectedToppingIds: nextIds };
                                });
                              }}
                              style={{ accentColor: "#f97316", width: 15, height: 15, cursor: "pointer" }}
                            />
                            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: isChecked ? 700 : 500, color: "var(--admin-text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {top.name}
                              </span>
                              <span style={{ fontSize: "0.68rem", color: "#f97316", fontWeight: 700 }}>
                                +Rp {Number(top.price).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mobile-safe-bottom" style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid var(--admin-border)", background: "var(--admin-surface-2)", color: "var(--admin-text-muted)", fontWeight: 700, cursor: "pointer" }}>
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmitting} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (editingMenuId ? "Simpan Perubahan" : "Simpan Menu")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah / Edit Topping */}
      {isToppingModalOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 65, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsToppingModalOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 640, maxHeight: "90dvh", background: "var(--admin-header-bg)", border: "1px solid var(--admin-border)", borderRadius: "24px 24px 0 0", overflow: "hidden", boxShadow: "0 -20px 60px rgba(0,0,0,0.4)", display: "flex", flexDirection: "column" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "linear-gradient(135deg, #f97316, #ea580c)", flexShrink: 0 }}>
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem", color: "#fff" }}>
                {editingToppingId ? "✏️ Ubah Data Topping" : "🍳 Tambah Topping Baru"}
              </h3>
              <button onClick={() => setIsToppingModalOpen(false)} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
              <form onSubmit={handleSubmitTopping} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Nama Topping / Ekstra *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Telur Bebek, Bakso Sapi"
                    value={toppingForm.name}
                    onChange={(e) => setToppingForm((prev) => ({ ...prev, name: e.target.value }))}
                    style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Harga Tambahan per Porsi (Rp) *
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", fontWeight: 700, color: "var(--admin-text-muted)" }}>Rp</span>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      placeholder="0 (Gratis) atau misal 2000"
                      value={toppingForm.price}
                      onChange={(e) => setToppingForm((prev) => ({ ...prev, price: e.target.value }))}
                      style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px 12px 12px 40px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                    />
                  </div>
                  <span style={{ fontSize: "0.72rem", color: "var(--admin-text-muted)", marginTop: 4, display: "block" }}>
                    Biaya tambahan yang dikenakan ke pelanggan saat memilih topping ini.
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                      Jumlah Stok *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={toppingForm.stock_qty}
                      onChange={(e) => setToppingForm((prev) => ({ ...prev, stock_qty: e.target.value }))}
                      style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                      Satuan *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Porsi / Butir / Pcs / Ikat"
                      value={toppingForm.unit}
                      onChange={(e) => setToppingForm((prev) => ({ ...prev, unit: e.target.value }))}
                      style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Label Status Dapur
                  </label>
                  <select
                    value={toppingForm.status_label}
                    onChange={(e) => setToppingForm((prev) => ({ ...prev, status_label: e.target.value }))}
                    style={{ width: "100%", background: "var(--admin-input-bg)", border: "1px solid var(--admin-border)", borderRadius: 12, padding: "12px", fontSize: "0.9rem", color: "var(--admin-text)", outline: "none" }}
                  >
                    <option value="Siap Saji">Siap Saji</option>
                    <option value="Menipis">Menipis</option>
                    <option value="Stok Habis">Stok Habis</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "var(--admin-text-muted)", marginBottom: 6 }}>
                    Ketersediaan Langsung
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 12, border: toppingForm.is_available ? "1px solid #10b981" : "1px solid var(--admin-border)", background: toppingForm.is_available ? "rgba(16,185,129,0.1)" : "var(--admin-input-bg)", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="is_available_topping"
                        checked={toppingForm.is_available}
                        onChange={() => setToppingForm((prev) => ({ ...prev, is_available: true }))}
                        style={{ accentColor: "#10b981" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>✅ Tersedia</span>
                    </label>
                    <label style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "12px", borderRadius: 12, border: !toppingForm.is_available ? "1px solid #ef4444" : "1px solid var(--admin-border)", background: !toppingForm.is_available ? "rgba(239,68,68,0.1)" : "var(--admin-input-bg)", cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="is_available_topping"
                        checked={!toppingForm.is_available}
                        onChange={() => setToppingForm((prev) => ({ ...prev, is_available: false }))}
                        style={{ accentColor: "#ef4444" }}
                      />
                      <span style={{ fontSize: "0.85rem", color: "var(--admin-text)", fontWeight: 600 }}>❌ Stok Habis</span>
                    </label>
                  </div>
                </div>

                <div className="mobile-safe-bottom" style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  {editingToppingId && (
                    <button
                      type="button"
                      onClick={() => setToppingToDelete({ id: editingToppingId, name: toppingForm.name })}
                      style={{ padding: "14px 18px", borderRadius: 12, border: "1px solid rgba(239,68,68,0.3)", background: "var(--admin-red-soft)", color: "var(--admin-red)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  )}
                  <button type="button" onClick={() => setIsToppingModalOpen(false)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "1px solid var(--admin-border)", background: "var(--admin-surface-2)", color: "var(--admin-text-muted)", fontWeight: 700, cursor: "pointer" }}>
                    Batal
                  </button>
                  <button type="submit" disabled={isSubmittingTopping} style={{ flex: 1, padding: "14px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #f97316, #ea580c)", color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
                    {isSubmittingTopping ? <Loader2 className="animate-spin" size={18} /> : (editingToppingId ? "Simpan Topping" : "Tambah Topping")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modern Dialog Konfirmasi Hapus Topping */}
      <AnimatePresence>
        {toppingToDelete && (
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
            onClick={() => !isDeletingTopping && setToppingToDelete(null)}
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
                Hapus Topping dari Stok?
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--admin-text-muted)", lineHeight: 1.45, marginBottom: 20 }}>
                Yakin ingin menghapus <strong>{toppingToDelete.name}</strong> dari daftar stok topping dapur? Data yang dihapus tidak dapat dipulihkan.
              </p>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  disabled={isDeletingTopping}
                  onClick={() => setToppingToDelete(null)}
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
                  disabled={isDeletingTopping}
                  onClick={confirmDeleteTopping}
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
                  {isDeletingTopping ? <Loader2 className="animate-spin" size={16} /> : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
