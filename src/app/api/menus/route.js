import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // 1. Fetch Categories
    const categories = await query(
      "SELECT id, name, slug, display_order FROM categories WHERE is_active = 1 ORDER BY display_order ASC"
    );

    // 2. Fetch Menus
    const menus = await query(
      `SELECT m.id, m.category_id AS categoryId, c.name AS categoryName, c.slug AS categorySlug,
              m.name, m.price, m.description, m.image_url AS image, m.is_available AS isAvailable,
              m.is_recommended AS isRecommended, m.allow_toppings AS allowToppings
       FROM menus m
       JOIN categories c ON m.category_id = c.id
       WHERE m.is_available = 1
       ORDER BY m.is_recommended DESC, m.id ASC`
    );

    return NextResponse.json({
      success: true,
      data: {
        categories: [
          { id: "all", name: "Semua", slug: "all" },
          ...categories.map((c) => ({
            id: c.slug,
            dbId: c.id,
            name: c.name,
            slug: c.slug,
          })),
        ],
        menus: menus.map((m) => ({
          id: String(m.id),
          name: m.name,
          categoryId: m.categorySlug,
          categoryDbId: m.categoryId,
          categoryName: m.categoryName,
          price: Number(m.price),
          description: m.description || "",
          image: m.image || "/asset/The_Floating_Hero_Object.png",
          isRecommended: Boolean(m.isRecommended),
          allow_toppings: m.allowToppings || "",
          allowToppings: m.allowToppings || "",
          allowToppingIds: m.allowToppings
            ? String(m.allowToppings)
                .split(",")
                .map((id) => Number(id.trim()))
                .filter(Boolean)
            : [],
          isSpicy: m.name.toLowerCase().includes("chili") || m.name.toLowerCase().includes("nyemek") || m.name.toLowerCase().includes("dok"),
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch menus from database:", error);
    return NextResponse.json(
      { success: false, error: "Database connection failed", message: error.message },
      { status: 500 }
    );
  }
}
