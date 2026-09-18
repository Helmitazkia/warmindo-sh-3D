import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { unlink } from "fs/promises";
import path from "path";

/**
 * Hapus file lama dari disk secara aman jika tidak dipakai oleh menu lain
 */
async function safeDeleteOldAsset(oldUrl, currentMenuId) {
  if (!oldUrl || typeof oldUrl !== "string") return;

  try {
    // 1. Cek apakah gambar ini masih dipakai oleh menu lain
    const inUse = await query(
      "SELECT id FROM menus WHERE image_url = ? AND id != ?",
      [oldUrl, currentMenuId]
    );
    if (inUse && inUse.length > 0) {
      return; // Jangan hapus jika masih dipakai menu lain
    }

    // 2. Hapus jika berasal dari folder /asset/
    if (oldUrl.startsWith("/asset/")) {
      const filename = path.basename(oldUrl);
      const filePath = path.join(process.cwd(), "public", "asset", filename);
      await unlink(filePath);
      console.log(`[Asset Cleanup] Berhasil menghapus gambar menu lama: ${filename}`);
    } 
    // 3. Hapus jika berasal dari folder /uploads/
    else if (oldUrl.startsWith("/uploads/")) {
      const filename = path.basename(oldUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", "payment-proofs", filename);
      await unlink(filePath);
      console.log(`[Upload Cleanup] Berhasil menghapus file lama: ${filename}`);
    }
  } catch (err) {
    // Jika file tidak ditemukan di disk, jangan lempar error yang membatalkan transaksi
    console.warn(`[Asset Cleanup Warning]: ${err.message}`);
  }
}

export async function GET() {
  try {
    const menus = await query(
      `SELECT m.id, m.name, m.price, m.description, m.image_url, m.is_recommended, m.allow_toppings, m.is_available, m.category_id, c.name as categoryName
       FROM menus m
       JOIN categories c ON m.category_id = c.id
       ORDER BY c.display_order ASC, m.name ASC`
    );
    const categories = await query(
      "SELECT id, name FROM categories ORDER BY display_order ASC"
    );
    return NextResponse.json({ success: true, data: { menus, categories } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, category_id, price, description, is_recommended, allow_toppings = null, image_url } = body;
    
    if (!name || !category_id || !price) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const cleanAllowToppings = allow_toppings && typeof allow_toppings === "string" && allow_toppings.trim() !== ""
      ? allow_toppings.trim()
      : (Array.isArray(allow_toppings) && allow_toppings.length > 0 ? allow_toppings.join(",") : null);

    const result = await query(
      `INSERT INTO menus (category_id, name, price, description, image_url, is_available, is_recommended, allow_toppings, created_at) 
       VALUES (?, ?, ?, ?, ?, 1, ?, ?, NOW())`,
      [category_id, name, price, description || null, image_url || null, is_recommended ? 1 : 0, cleanAllowToppings]
    );

    return NextResponse.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, category_id, price, description, is_recommended, allow_toppings = null, image_url } = body;

    if (!id || !name || !category_id || !price) {
      return NextResponse.json({ success: false, message: "Field wajib tidak boleh kosong" }, { status: 400 });
    }

    const cleanAllowToppings = allow_toppings && typeof allow_toppings === "string" && allow_toppings.trim() !== ""
      ? allow_toppings.trim()
      : (Array.isArray(allow_toppings) && allow_toppings.length > 0 ? allow_toppings.join(",") : null);

    // Ambil data menu sebelum diupdate untuk mendapatkan URL gambar lama
    const existing = await query("SELECT image_url FROM menus WHERE id = ?", [id]);
    const oldImageUrl = existing[0]?.image_url;

    if (image_url) {
      await query(
        `UPDATE menus 
         SET name = ?, category_id = ?, price = ?, description = ?, image_url = ?, is_recommended = ?, allow_toppings = ?
         WHERE id = ?`,
        [name, category_id, price, description || null, image_url, is_recommended ? 1 : 0, cleanAllowToppings, id]
      );

      // Jika ada gambar baru yang berbeda dari gambar lama, hapus gambar lama dari folder asset
      if (oldImageUrl && oldImageUrl !== image_url) {
        await safeDeleteOldAsset(oldImageUrl, id);
      }
    } else {
      await query(
        `UPDATE menus 
         SET name = ?, category_id = ?, price = ?, description = ?, is_recommended = ?, allow_toppings = ?
         WHERE id = ?`,
        [name, category_id, price, description || null, is_recommended ? 1 : 0, cleanAllowToppings, id]
      );
    }

    return NextResponse.json({ success: true, message: "Menu berhasil diperbarui" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID menu diperlukan" }, { status: 400 });
    }

    const existing = await query("SELECT image_url FROM menus WHERE id = ?", [id]);
    const oldImageUrl = existing[0]?.image_url;

    await query("DELETE FROM menus WHERE id = ?", [id]);

    if (oldImageUrl) {
      await safeDeleteOldAsset(oldImageUrl, id);
    }

    return NextResponse.json({ success: true, message: "Menu berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, is_available } = await request.json();
    await query("UPDATE menus SET is_available = ? WHERE id = ?", [is_available ? 1 : 0, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
