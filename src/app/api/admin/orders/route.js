import { NextResponse } from "next/server";
import { query, getDbPool } from "@/lib/db";

export async function GET() {
  try {
    // Ambil pesanan yang aktif
    const orders = await query(
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

    const orderIds = orders.map((o) => o.id);
    const items = await query(
      `SELECT id, order_id, menu_name, unit_price, quantity, subtotal, notes 
       FROM order_items 
       WHERE order_id IN (?)`,
      [orderIds.length > 0 ? orderIds : [0]] 
    );

    const data = orders.map((o) => {
      return {
        ...o,
        items: items.filter((i) => i.order_id === o.id),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to fetch admin orders:", error);
    return NextResponse.json(
      { success: false, error: "Database error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { id, action } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ success: false, message: "Invalid request payload" }, { status: 400 });
    }

    let queryStr = "";
    let params = [];

    if (action === "COOKING") {
      queryStr = "UPDATE orders SET order_status = 'COOKING', payment_status = 'PAID' WHERE id = ?";
      params = [id];
    } else if (action === "COMPLETED") {
      queryStr = "UPDATE orders SET order_status = 'COMPLETED' WHERE id = ?";
      params = [id];
    } else {
      return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
    }

    await query(queryStr, params);

    return NextResponse.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
