import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET() {
  const db = getDbPool();
  try {
    const [rows] = await db.execute(
      `SELECT id, code, name, account_name, account_number, qr_image_url, is_active
       FROM payment_methods
       ORDER BY id ASC`
    );

    return NextResponse.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        account_name: r.account_name || "",
        account_number: r.account_number || "",
        qr_image_url: r.qr_image_url || null,
        is_active: Boolean(r.is_active),
      })),
    });
  } catch (error) {
    console.error("Failed to fetch admin payment methods:", error);
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
    const { code, name, account_name = "", account_number = "", qr_image_url = null, is_active = 1 } = body;

    if (!code?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, message: "Kode dan Nama metode pembayaran wajib diisi." },
        { status: 400 }
      );
    }

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, "_");

    const [result] = await db.execute(
      `INSERT INTO payment_methods (code, name, account_name, account_number, qr_image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [formattedCode, name.trim(), account_name.trim() || null, account_number.trim() || null, qr_image_url || null, is_active ? 1 : 0]
    );

    return NextResponse.json({
      success: true,
      message: "Metode pembayaran berhasil ditambahkan.",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Failed to create payment method:", error);
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
    const { id, code, name, account_name = "", account_number = "", qr_image_url = null, is_active = 1 } = body;

    if (!id || !code?.trim() || !name?.trim()) {
      return NextResponse.json(
        { success: false, message: "ID, Kode, dan Nama metode pembayaran wajib diisi." },
        { status: 400 }
      );
    }

    const formattedCode = code.trim().toUpperCase().replace(/\s+/g, "_");

    await db.execute(
      `UPDATE payment_methods
       SET code = ?, name = ?, account_name = ?, account_number = ?, qr_image_url = ?, is_active = ?
       WHERE id = ?`,
      [formattedCode, name.trim(), account_name.trim() || null, account_number.trim() || null, qr_image_url || null, is_active ? 1 : 0, id]
    );

    return NextResponse.json({
      success: true,
      message: "Metode pembayaran berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Failed to update payment method:", error);
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
    const { id, is_active } = body;

    if (!id || typeof is_active === "undefined") {
      return NextResponse.json(
        { success: false, message: "ID dan status aktif wajib dikirim." },
        { status: 400 }
      );
    }

    await db.execute(
      `UPDATE payment_methods
       SET is_active = ?
       WHERE id = ?`,
      [is_active ? 1 : 0, id]
    );

    return NextResponse.json({
      success: true,
      message: "Status metode pembayaran berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Failed to toggle payment method:", error);
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
        { success: false, message: "ID metode pembayaran wajib dikirim." },
        { status: 400 }
      );
    }

    await db.execute(`DELETE FROM payment_methods WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Metode pembayaran berhasil dihapus.",
    });
  } catch (error) {
    console.error("Failed to delete payment method:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
