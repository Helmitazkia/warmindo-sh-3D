import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET: Ambil semua daftar meja beserta statistik okupansi & order aktif
export async function GET() {
  try {
    const sql = `
      SELECT 
        t.id, 
        t.table_number, 
        t.qr_code_token,
        t.capacity, 
        t.status,
        t.created_at,
        COALESCE(SUM(CASE WHEN o.order_status IN ('PENDING', 'COOKING') THEN o.guest_count ELSE 0 END), 0) AS occupied_guests,
        COUNT(CASE WHEN o.order_status IN ('PENDING', 'COOKING') THEN o.id ELSE NULL END) AS active_orders_count
      FROM tables t
      LEFT JOIN orders o ON (
        o.table_id = t.id 
        OR o.table_number = t.table_number 
        OR o.table_number = REPLACE(t.table_number, 'Meja ', '')
      )
      GROUP BY t.id, t.table_number, t.qr_code_token, t.capacity, t.status, t.created_at
      ORDER BY t.id ASC
    `;

    const rows = await query(sql);

    const tables = rows.map((t) => {
      const capacity = Number(t.capacity) || 4;
      const occupied = Number(t.occupied_guests) || 0;
      const cleanNum = t.table_number.replace(/^Meja\s+/i, "").trim();

      return {
        id: t.id,
        table_number: t.table_number,
        clean_number: cleanNum,
        capacity,
        occupied_guests: occupied,
        remaining_capacity: Math.max(0, capacity - occupied),
        active_orders_count: Number(t.active_orders_count) || 0,
        status: t.status || "AVAILABLE",
        qr_code_token: t.qr_code_token,
        created_at: t.created_at,
      };
    });

    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    console.error("GET Admin Tables Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Tambah meja baru
export async function POST(request) {
  try {
    const body = await request.json();
    const { table_number, capacity, status } = body;

    if (!table_number || table_number.trim() === "") {
      return NextResponse.json({ success: false, message: "Nomor meja wajib diisi" }, { status: 400 });
    }

    const trimmedNumber = table_number.trim();

    // Cek duplikasi nomor meja
    const existing = await query("SELECT id FROM tables WHERE table_number = ?", [trimmedNumber]);
    if (existing.length > 0) {
      return NextResponse.json({ success: false, message: `Nomor meja '${trimmedNumber}' sudah ada.` }, { status: 400 });
    }

    const cap = Number(capacity) > 0 ? Number(capacity) : 4;
    const validStatus = ["AVAILABLE", "OCCUPIED", "RESERVED"].includes(status) ? status : "AVAILABLE";
    const token = `table_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const result = await query(
      "INSERT INTO tables (table_number, qr_code_token, capacity, status, created_at) VALUES (?, ?, ?, ?, NOW())",
      [trimmedNumber, token, cap, validStatus]
    );

    return NextResponse.json({
      success: true,
      message: "Meja baru berhasil ditambahkan",
      data: { id: result.insertId, table_number: trimmedNumber, capacity: cap, status: validStatus }
    });
  } catch (error) {
    console.error("POST Admin Table Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PUT: Perbarui data meja
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, table_number, capacity, status } = body;

    if (!id || !table_number || table_number.trim() === "") {
      return NextResponse.json({ success: false, message: "ID dan Nomor meja wajib diisi" }, { status: 400 });
    }

    const trimmedNumber = table_number.trim();

    // Cek duplikasi nomor meja di ID lain
    const duplicate = await query("SELECT id FROM tables WHERE table_number = ? AND id != ?", [trimmedNumber, id]);
    if (duplicate.length > 0) {
      return NextResponse.json({ success: false, message: `Nomor meja '${trimmedNumber}' sudah digunakan meja lain.` }, { status: 400 });
    }

    const cap = Number(capacity) > 0 ? Number(capacity) : 4;
    const validStatus = ["AVAILABLE", "OCCUPIED", "RESERVED"].includes(status) ? status : "AVAILABLE";

    await query(
      "UPDATE tables SET table_number = ?, capacity = ?, status = ?, updated_at = NOW() WHERE id = ?",
      [trimmedNumber, cap, validStatus, id]
    );

    return NextResponse.json({ success: true, message: "Data meja berhasil diperbarui" });
  } catch (error) {
    console.error("PUT Admin Table Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH: Ubah status cepat meja (AVAILABLE / OCCUPIED / RESERVED)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "ID dan status diperlukan" }, { status: 400 });
    }

    const validStatus = ["AVAILABLE", "OCCUPIED", "RESERVED"].includes(status) ? status : "AVAILABLE";
    await query("UPDATE tables SET status = ?, updated_at = NOW() WHERE id = ?", [validStatus, id]);

    return NextResponse.json({ success: true, message: `Status meja berhasil diubah menjadi ${validStatus}` });
  } catch (error) {
    console.error("PATCH Admin Table Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Hapus meja (proteksi pesanan aktif)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID meja diperlukan" }, { status: 400 });
    }

    // Ambil data meja untuk nama meja
    const tableRow = await query("SELECT table_number FROM tables WHERE id = ?", [id]);
    if (tableRow.length === 0) {
      return NextResponse.json({ success: false, message: "Meja tidak ditemukan" }, { status: 404 });
    }

    const tableName = tableRow[0].table_number;
    const cleanNum = tableName.replace(/^Meja\s+/i, "").trim();

    // Cek apakah ada pesanan yang sedang aktif di meja ini (PENDING atau COOKING)
    const activeOrders = await query(
      `SELECT COUNT(*) AS total FROM orders 
       WHERE (table_id = ? OR table_number = ? OR table_number = ?)
         AND order_status IN ('PENDING', 'COOKING')`,
      [id, tableName, cleanNum]
    );

    const activeCount = activeOrders[0]?.total || 0;
    if (activeCount > 0) {
      return NextResponse.json({
        success: false,
        message: `Tidak dapat menghapus ${tableName} karena masih ada ${activeCount} pesanan aktif yang sedang diproses.`
      }, { status: 400 });
    }

    await query("DELETE FROM tables WHERE id = ?", [id]);

    return NextResponse.json({ success: true, message: `${tableName} berhasil dihapus` });
  } catch (error) {
    console.error("DELETE Admin Table Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
