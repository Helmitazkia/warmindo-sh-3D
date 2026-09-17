import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

export async function GET() {
  const db = getDbPool();
  try {
    const [rows] = await db.execute(
      `SELECT id, name, price, stock_qty, unit, status_label, is_available
       FROM toppings
       WHERE is_available = 1 AND stock_qty > 0
       ORDER BY id ASC`
    );

    return NextResponse.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        price: Number(r.price) || 0,
        stock_qty: Number(r.stock_qty),
        unit: r.unit || "Porsi",
        status_label: r.status_label || "Siap Saji",
      })),
    });
  } catch (error) {
    console.error("Failed to fetch public toppings:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
