import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const sql = `
      SELECT 
        t.id, 
        t.table_number, 
        t.capacity, 
        t.status,
        COALESCE(SUM(CASE WHEN o.order_status IN ('PENDING', 'COOKING') THEN o.guest_count ELSE 0 END), 0) AS occupied_guests,
        COUNT(CASE WHEN o.order_status IN ('PENDING', 'COOKING') THEN o.id ELSE NULL END) AS active_orders_count
      FROM tables t
      LEFT JOIN orders o ON (
        o.table_id = t.id 
        OR o.table_number = t.table_number 
        OR o.table_number = REPLACE(t.table_number, 'Meja ', '')
      )
      GROUP BY t.id, t.table_number, t.capacity, t.status
      ORDER BY t.id ASC
    `;

    const tables = await query(sql);

    return NextResponse.json({
      success: true,
      data: tables.map((t) => {
        const capacity = Number(t.capacity) || 4;
        const occupied = Number(t.occupied_guests) || 0;
        const remaining = Math.max(0, capacity - occupied);

        return {
          id: String(t.id),
          name: t.table_number,
          tableNumber: t.table_number.replace(/^Meja\s+/i, ""),
          capacity,
          occupied,
          remaining,
          formattedRemaining: remaining < 10 ? `0${remaining}` : `${remaining}`,
          activeOrdersCount: Number(t.active_orders_count) || 0,
          status: remaining === 0 ? "FULL" : t.status,
        };
      }),
    });
  } catch (error) {
    console.error("Failed to fetch tables with occupancy from database:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed", message: error.message },
      { status: 500 }
    );
  }
}
