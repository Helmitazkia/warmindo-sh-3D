import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET() {
  const db = getDbPool();
  let connection;
  try {
    connection = await db.getConnection();

    // Ambil pesanan aktif
    const [orders] = await connection.execute(
      `SELECT o.id, o.order_code, o.table_number, o.customer_name,
              o.total_amount, o.payment_method, o.payment_status,
              o.order_status, o.notes, o.created_at, o.payment_proof_url
       FROM orders o
       WHERE o.order_status IN ('PENDING', 'COOKING')
       ORDER BY o.created_at ASC`
    );

    if (orders.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Ambil items untuk semua pesanan aktif
    // Gunakan format placeholder manual untuk IN clause agar kompatibel dengan mysql2
    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => "?").join(", ");

    const [items] = await connection.execute(
      `SELECT oi.id, oi.order_id, oi.menu_name, oi.unit_price AS price, oi.quantity, oi.subtotal, oi.notes
       FROM order_items oi
       WHERE oi.order_id IN (${placeholders})`,
      orderIds
    );

    // Gabungkan items ke masing-masing order
    const data = orders.map((o) => ({
      ...o,
      total_amount: Number(o.total_amount),
      items: items
        .filter((i) => i.order_id === o.id)
        .map((i) => ({
          ...i,
          price: Number(i.price),
          subtotal: Number(i.subtotal),
        })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return NextResponse.json(
      { success: false, error: "Database error", message: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function PATCH(request) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json(
        { success: false, message: "Invalid request payload" },
        { status: 400 }
      );
    }

    let sql = "";
    let params = [];

    if (action === "COOKING") {
      sql = "UPDATE orders SET order_status = 'COOKING', payment_status = 'PAID' WHERE id = ?";
      params = [id];
    } else if (action === "COMPLETED") {
      sql = "UPDATE orders SET order_status = 'COMPLETED', updated_at = NOW() WHERE id = ?";
      params = [id];
    } else if (action === "CANCELLED") {
      sql = "UPDATE orders SET order_status = 'CANCELLED', updated_at = NOW() WHERE id = ?";
      params = [id];
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid action" },
        { status: 400 }
      );
    }

    const db = getDbPool();
    await db.execute(sql, params);

    return NextResponse.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
