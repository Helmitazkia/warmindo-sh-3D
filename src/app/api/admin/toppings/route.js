import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

// Skema tabel toppings:
// id, name (VARCHAR), price (INT), stock_qty (INT), unit (VARCHAR), status_label (VARCHAR),
// is_available (TINYINT), created_at (DATETIME), updated_at (DATETIME)

const DEFAULT_TOPPINGS = [
  { name: "Telur Ayam", price: 3000, stock_qty: 48, unit: "Butir", status_label: "Siap Saji", is_available: 1 },
  { name: "Kornet Sapi", price: 4000, stock_qty: 12, unit: "Porsi", status_label: "Siap Saji", is_available: 1 },
  { name: "Keju Cheddar", price: 3000, stock_qty: 20, unit: "Porsi", status_label: "Siap Saji", is_available: 1 },
  { name: "Sosis Bakar", price: 3000, stock_qty: 0, unit: "Pcs", status_label: "Stok Habis", is_available: 0 },
  { name: "Sayur Sawi", price: 2000, stock_qty: 4, unit: "Ikat", status_label: "Menipis", is_available: 1 },
  { name: "Bawang Goreng", price: 1500, stock_qty: 50, unit: "Porsi", status_label: "Siap Saji", is_available: 1 },
];

export async function GET() {
  const db = getDbPool();
  try {
    let [rows] = await db.execute(
      `SELECT id, name, price, stock_qty, unit, status_label, is_available, created_at, updated_at
       FROM toppings
       ORDER BY id ASC`
    );

    // Auto-seed data awal jika tabel masih kosong
    if (rows.length === 0) {
      for (const item of DEFAULT_TOPPINGS) {
        await db.execute(
          `INSERT INTO toppings (name, price, stock_qty, unit, status_label, is_available, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [item.name, item.price, item.stock_qty, item.unit, item.status_label, item.is_available]
        );
      }
      const [seededRows] = await db.execute(
        `SELECT id, name, price, stock_qty, unit, status_label, is_available, created_at, updated_at
         FROM toppings
         ORDER BY id ASC`
      );
      rows = seededRows;
    }

    return NextResponse.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        price: Number(r.price) || 0,
        stock_qty: Number(r.stock_qty),
        unit: r.unit || "Porsi",
        status_label: r.status_label || (r.is_available ? "Siap Saji" : "Stok Habis"),
        is_available: Boolean(r.is_available),
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch toppings:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const db = getDbPool();
  try {
    const body = await request.json();
    const { name, price = 0, stock_qty = 0, unit = "Porsi", status_label = "Siap Saji", is_available = 1 } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Nama topping wajib diisi" },
        { status: 400 }
      );
    }

    const [result] = await db.execute(
      `INSERT INTO toppings (name, price, stock_qty, unit, status_label, is_available, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name.trim(), Math.max(0, Number(price) || 0), Number(stock_qty), unit.trim(), status_label.trim(), is_available ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      message: "Topping berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Failed to create topping:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const db = getDbPool();
  try {
    const body = await request.json();
    const { id, name, price = 0, stock_qty = 0, unit = "Porsi", status_label = "Siap Saji", is_available = 1 } = body;

    if (!id || !name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "ID dan Nama topping wajib diisi" },
        { status: 400 }
      );
    }

    await db.execute(
      `UPDATE toppings
       SET name = ?, price = ?, stock_qty = ?, unit = ?, status_label = ?, is_available = ?, updated_at = NOW()
       WHERE id = ?`,
      [name.trim(), Math.max(0, Number(price) || 0), Number(stock_qty), unit.trim(), status_label.trim(), is_available ? 1 : 0, id]
    );

    return NextResponse.json({
      success: true,
      message: "Topping berhasil diperbarui",
    });
  } catch (error) {
    console.error("Failed to update topping:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const db = getDbPool();
  try {
    const body = await request.json();
    const { id, is_available } = body;

    if (!id || typeof is_available === "undefined") {
      return NextResponse.json(
        { success: false, message: "ID dan status ketersediaan wajib dikirim" },
        { status: 400 }
      );
    }

    const status_label = is_available ? "Siap Saji" : "Stok Habis";

    await db.execute(
      `UPDATE toppings
       SET is_available = ?, status_label = ?, updated_at = NOW()
       WHERE id = ?`,
      [is_available ? 1 : 0, status_label, id]
    );

    return NextResponse.json({
      success: true,
      message: "Status topping berhasil diperbarui",
    });
  } catch (error) {
    console.error("Failed to toggle topping:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const db = getDbPool();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID topping wajib dikirim" },
        { status: 400 }
      );
    }

    await db.execute(`DELETE FROM toppings WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Topping berhasil dihapus",
    });
  } catch (error) {
    console.error("Failed to delete topping:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
