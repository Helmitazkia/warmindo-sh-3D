import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// Helper: generate clean URL slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// GET: Ambil semua kategori beserta jumlah menu terkait
export async function GET() {
  try {
    const categories = await query(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.display_order, 
        c.is_active, 
        COUNT(m.id) AS total_menus
      FROM categories c
      LEFT JOIN menus m ON m.category_id = c.id
      GROUP BY c.id, c.name, c.slug, c.display_order, c.is_active
      ORDER BY c.display_order ASC, c.id ASC
    `);

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET Categories Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Tambah kategori baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, slug, display_order, is_active } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ success: false, message: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const finalSlug = slugify(slug || name);
    if (!finalSlug) {
      return NextResponse.json({ success: false, message: "Slug kategori tidak valid" }, { status: 400 });
    }

    // Cek duplikasi slug
    const existing = await query("SELECT id FROM categories WHERE slug = ?", [finalSlug]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: `Slug '${finalSlug}' sudah digunakan. Gunakan slug lain.` }, { status: 400 });
    }

    const orderNum = Number(display_order) || 0;
    const activeVal = is_active === false || is_active === 0 ? 0 : 1;

    const result = await query(
      "INSERT INTO categories (name, slug, display_order, is_active) VALUES (?, ?, ?, ?)",
      [name.trim(), finalSlug, orderNum, activeVal]
    );

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil ditambahkan",
      data: { id: result.insertId, name: name.trim(), slug: finalSlug, display_order: orderNum, is_active: activeVal }
    });
  } catch (error) {
    console.error("POST Category Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Perbarui kategori
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, slug, display_order, is_active } = body;

    if (!id || !name || name.trim() === "") {
      return NextResponse.json({ success: false, message: "ID dan Nama kategori wajib diisi" }, { status: 400 });
    }

    const finalSlug = slugify(slug || name);
    if (!finalSlug) {
      return NextResponse.json({ success: false, message: "Slug kategori tidak valid" }, { status: 400 });
    }

    // Cek duplikasi slug di kategori lain
    const duplicate = await query("SELECT id FROM categories WHERE slug = ? AND id != ?", [finalSlug, id]);
    if (duplicate.length > 0) {
      return NextResponse.json({ success: false, message: `Slug '${finalSlug}' sudah digunakan oleh kategori lain.` }, { status: 400 });
    }

    const orderNum = Number(display_order) || 0;
    const activeVal = is_active === false || is_active === 0 ? 0 : 1;

    await query(
      "UPDATE categories SET name = ?, slug = ?, display_order = ?, is_active = ? WHERE id = ?",
      [name.trim(), finalSlug, orderNum, activeVal, id]
    );

    return NextResponse.json({ success: true, message: "Kategori berhasil diperbarui" });
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Quick toggle status aktif/nonaktif
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID kategori diperlukan" }, { status: 400 });
    }

    const activeVal = is_active === true || is_active === 1 ? 1 : 0;
    await query("UPDATE categories SET is_active = ? WHERE id = ?", [activeVal, id]);

    return NextResponse.json({ success: true, message: `Status kategori berhasil diubah menjadi ${activeVal ? 'Aktif' : 'Nonaktif'}` });
  } catch (error) {
    console.error("PATCH Category Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Hapus kategori (dengan validasi relasi menu)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID kategori diperlukan" }, { status: 400 });
    }

    // Proteksi: Cek apakah masih ada menu yang terhubung
    const linkedMenus = await query("SELECT COUNT(*) AS total FROM menus WHERE category_id = ?", [id]);
    const totalLinked = linkedMenus[0]?.total || 0;

    if (totalLinked > 0) {
      return NextResponse.json({
        success: false,
        message: `Kategori tidak dapat dihapus karena masih memiliki ${totalLinked} produk menu. Pindahkan atau hapus menu tersebut terlebih dahulu.`
      }, { status: 400 });
    }

    await query("DELETE FROM categories WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
