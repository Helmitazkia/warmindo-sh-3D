"use client";

import { useState, useEffect } from "react";
import MasterMenuCard from "@/components/admin/MasterMenuCard";
import { Loader2, Plus, Search, CheckSquare, Square, SlidersHorizontal } from "lucide-react";

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    is_recommended: 0,
    imageFile: null,
    imagePreview: null,
  });

  const [kitchenStock, setKitchenStock] = useState([
    { name: "Telur Ayam", status: "Siap Saji (48)", available: true },
    { name: "Kornet Sapi", status: "Siap Saji (12)", available: true },
    { name: "Keju Cheddar", status: "Siap Saji", available: true },
    { name: "Sosis Bakar", status: "Stok Habis", available: false },
    { name: "Sayur Sawi", status: "Menipis (4)", available: true },
    { name: "Bawang Goreng", status: "Siap Saji", available: true },
  ]);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/menus");
      const json = await res.json();
      if (json.success) {
        setMenus(json.data.menus);
        setDbCategories(json.data.categories);
        if (json.data.categories.length > 0) {
          setFormData(prev => ({ ...prev, category_id: prev.category_id || json.data.categories[0].id }));
        }
      }
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchMenus(); }, []);

  const handleOpenAdd = () => {
    setEditingMenuId(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      category_id: dbCategories[0]?.id || "",
      is_recommended: 0,
      imageFile: null,
      imagePreview: null,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (menu) => {
    setEditingMenuId(menu.id);
    setFormData({
      name: menu.name || "",
      price: menu.price || "",
      description: menu.description || "",
      category_id: menu.category_id || dbCategories[0]?.id || "",
      is_recommended: menu.is_recommended ? 1 : 0,
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
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
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
        setFormData({ name: "", price: "", description: "", category_id: dbCategories[0]?.id || "", is_recommended: 0, imageFile: null, imagePreview: null });
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
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p style={{ fontWeight: 800, fontSize: "0.875rem", color: "var(--admin-text)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", display: "inline-block", boxShadow: "0 0 6px #f59e0b", animation: "pulse 2s infinite" }} />
            Stok Cepat Topping
          </p>
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--admin-yellow)", background: "var(--admin-yellow-soft)", padding: "2px 8px", borderRadius: 999, border: "1px solid rgba(245,158,11,0.2)" }}>
            LIVE KITCHEN
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {kitchenStock.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "var(--admin-surface-2)",
                borderRadius: 12,
                border: "1px solid var(--admin-border)",
              }}
            >
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.78rem", color: "var(--admin-text)" }}>{item.name}</p>
                <p style={{ fontSize: "0.65rem", color: item.available ? "var(--admin-green)" : "var(--admin-red)", marginTop: 1, fontWeight: 600 }}>
                  {item.status}
                </p>
              </div>
              <button
                onClick={() => {
                  const newStock = [...kitchenStock];
                  newStock[idx].available = !newStock[idx].available;
                  setKitchenStock(newStock);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: item.available ? "var(--accent-orange)" : "var(--admin-text-muted)" }}
              >
                {item.available ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
            </div>
          ))}
        </div>
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
    </div>
  );
}
