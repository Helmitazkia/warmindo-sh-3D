import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const menus = await query(
      `SELECT m.id, m.name, m.price, m.is_available, c.name as categoryName
       FROM menus m
       JOIN categories c ON m.category_id = c.id
       ORDER BY c.display_order ASC, m.name ASC`
    );
    return NextResponse.json({ success: true, data: menus });
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
