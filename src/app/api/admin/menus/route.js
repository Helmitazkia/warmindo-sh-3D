import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const menus = await query(
      `SELECT m.id, m.name, m.price, m.description, m.image_url, m.is_recommended, m.is_available, m.category_id, c.name as categoryName
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
    const { name, category_id, price, description, is_recommended, image_url } = body;
    
    if (!name || !category_id || !price) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO menus (category_id, name, price, description, image_url, is_available, is_recommended, created_at) 
       VALUES (?, ?, ?, ?, ?, 1, ?, NOW())`,
      [category_id, name, price, description || null, image_url || null, is_recommended ? 1 : 0]
    );

    return NextResponse.json({ success: true, data: { id: result.insertId } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, name, category_id, price, description, is_recommended, image_url } = body;

    if (!id || !name || !category_id || !price) {
      return NextResponse.json({ success: false, message: "Field wajib tidak boleh kosong" }, { status: 400 });
    }

    if (image_url) {
      await query(
        `UPDATE menus 
         SET name = ?, category_id = ?, price = ?, description = ?, image_url = ?, is_recommended = ?
         WHERE id = ?`,
        [name, category_id, price, description || null, image_url, is_recommended ? 1 : 0, id]
      );
    } else {
      await query(
        `UPDATE menus 
         SET name = ?, category_id = ?, price = ?, description = ?, is_recommended = ?
         WHERE id = ?`,
        [name, category_id, price, description || null, is_recommended ? 1 : 0, id]
      );
    }

    return NextResponse.json({ success: true, message: "Menu berhasil diperbarui" });
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
