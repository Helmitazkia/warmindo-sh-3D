import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET(request) {
  const db = getDbPool();
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate") || startDate;
    const q = searchParams.get("q");

    connection = await db.getConnection();

    let sql = `
      SELECT o.id, o.order_code, o.table_number, o.customer_name,
             o.total_amount, o.payment_method, o.payment_status,
             o.order_status, o.notes, o.created_at, o.updated_at, o.payment_proof_url
      FROM orders o
      WHERE o.order_status = 'COMPLETED'
    `;
    const params = [];

    if (startDate && endDate) {
      sql += ` AND DATE(o.created_at) >= ? AND DATE(o.created_at) <= ?`;
      params.push(startDate, endDate);
    }

    if (q && q.trim()) {
      const keyword = `%${q.trim()}%`;
      sql += ` AND (o.order_code LIKE ? OR o.customer_name LIKE ? OR o.table_number LIKE ?)`;
      params.push(keyword, keyword, keyword);
    }

    sql += ` ORDER BY o.updated_at DESC, o.created_at DESC LIMIT 100`;

    const [orders] = await connection.execute(sql, params);

    if (orders.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const orderIds = orders.map((o) => o.id);
    const placeholders = orderIds.map(() => "?").join(", ");

    const [items] = await connection.execute(
      `SELECT oi.id, oi.order_id, oi.menu_name, oi.unit_price AS price, oi.quantity, oi.subtotal, oi.selected_toppings, oi.notes
       FROM order_items oi
       WHERE oi.order_id IN (${placeholders})`,
      orderIds
    );

    const data = orders.map((o) => ({
      ...o,
      total_amount: Number(o.total_amount),
      items: items
        .filter((i) => i.order_id === o.id)
        .map((i) => ({
          ...i,
          price: Number(i.price),
          subtotal: Number(i.subtotal),
          toppings: (() => {
            try {
              return i.selected_toppings ? JSON.parse(i.selected_toppings) : [];
            } catch {
              return [];
            }
          })(),
        })),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch completed transactions:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
