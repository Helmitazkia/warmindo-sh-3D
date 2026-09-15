import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Get today's expenses and income for simple cashflow
    const today = new Date().toISOString().slice(0, 10);
    
    // Get income from completed orders today
    const incomeRows = await query(
      "SELECT COALESCE(SUM(total_amount), 0) as totalIncome FROM orders WHERE DATE(created_at) = ? AND order_status = 'COMPLETED'",
      [today]
    );
    const totalIncome = Number(incomeRows[0].totalIncome) || 0;

    // Get expenses today
    const expenseRows = await query(
      "SELECT id, amount, description, created_at FROM expenses WHERE DATE(created_at) = ? ORDER BY created_at DESC",
      [today]
    );
    
    const totalExpense = expenseRows.reduce((sum, row) => sum + Number(row.amount), 0);

    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netProfit: totalIncome - totalExpense,
        expenses: expenseRows
      }
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { amount, description } = await request.json();
    if (!amount || !description) {
      return NextResponse.json({ success: false, message: "Invalid payload" }, { status: 400 });
    }

    await query(
      "INSERT INTO expenses (amount, description, created_at) VALUES (?, ?, NOW())",
      [Number(amount), description]
    );

    return NextResponse.json({ success: true, message: "Expense added" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
