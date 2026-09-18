import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

// Skema tabel expenses di database:
// id, title (VARCHAR), category (VARCHAR), amount (DECIMAL), expense_date (DATE),
// receipt_image_url (VARCHAR), notes (TEXT), created_at (DATETIME)

export async function GET(request) {
  const db = getDbPool();
  try {
    const { searchParams } = new URL(request.url);
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const startDate = searchParams.get("startDate") || today;
    const endDate = searchParams.get("endDate") || startDate;

    // Pemasukan dari pesanan COMPLETED dalam rentang tanggal
    const [incomeRows] = await db.execute(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalIncome,
              COUNT(id) AS totalOrders
       FROM orders
       WHERE DATE(created_at) >= ? AND DATE(created_at) <= ? AND order_status = 'COMPLETED'`,
      [startDate, endDate]
    );

    const totalIncome = Number(incomeRows[0]?.totalIncome) || 0;
    const totalOrders = Number(incomeRows[0]?.totalOrders) || 0;

    // Pengeluaran dalam rentang tanggal — pakai expense_date
    const [expenseRows] = await db.execute(
      `SELECT id, title AS description, category, amount, expense_date, notes, created_at
       FROM expenses
       WHERE DATE(expense_date) >= ? AND DATE(expense_date) <= ?
       ORDER BY expense_date DESC, created_at DESC`,
      [startDate, endDate]
    );

    const totalExpense = expenseRows.reduce((sum, row) => sum + Number(row.amount), 0);

    return NextResponse.json({
      success: true,
      data: {
        startDate,
        endDate,
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        totalOrders,
        expenses: expenseRows.map((e) => ({
          id: e.id,
          description: e.description,
          category: e.category,
          amount: Number(e.amount),
          expense_date: e.expense_date,
          notes: e.notes,
          created_at: e.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
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
    const { amount, description, category = "Operasional", expense_date } = body;

    if (!amount || !description) {
      return NextResponse.json(
        { success: false, message: "amount dan description wajib diisi" },
        { status: 400 }
      );
    }

    const today = expense_date || new Date().toISOString().slice(0, 10);

    await db.execute(
      `INSERT INTO expenses (title, category, amount, expense_date, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [description, category, Number(amount), today]
    );

    return NextResponse.json({ success: true, message: "Pengeluaran berhasil ditambahkan" });
  } catch (error) {
    console.error("Failed to add expense:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
