import { NextResponse } from "next/server";
import { query, getDbPool } from "@/lib/db";

export async function POST(request) {
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    const body = await request.json();
    const {
      tableNumber,
      customerName,
      customerPhone,
      guestCount = 1,
      items = [],
      paymentMethod = "CASH",
      paymentProofUrl = null,
      tableNotes = "",
    } = body;

    // 1. Validation
    if (!customerName?.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama Pemesan wajib diisi." },
        { status: 400 }
      );
    }

    if (!customerPhone?.trim() || customerPhone.length < 9) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp aktif wajib diisi." },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Keranjang pesanan masih kosong." },
        { status: 400 }
      );
    }

    // 2. Validate Table & Capacity
    const formattedTable = String(tableNumber).trim();
    const [tableRows] = await connection.execute(
      "SELECT id, table_number, capacity, status FROM tables WHERE table_number = ? OR table_number = ? OR id = ? LIMIT 1",
      [formattedTable, `Meja ${formattedTable}`, formattedTable]
    );

    let tableId = null;
    let actualTableName = `Meja ${formattedTable}`;
    let tableCapacity = 4;

    if (tableRows && tableRows.length > 0) {
      tableId = tableRows[0].id;
      actualTableName = tableRows[0].table_number;
      tableCapacity = Number(tableRows[0].capacity) || 4;

      // Validate capacity
      if (Number(guestCount) > tableCapacity) {
        return NextResponse.json(
          {
            success: false,
            message: `Kapasitas ${actualTableName} maksimal untuk ${tableCapacity} orang. (Pesanan Anda: ${guestCount} orang). Silakan pilih meja yang lebih besar atau diskusikan dengan staf.`,
          },
          { status: 400 }
        );
      }
    }

    // 3. Begin Transaction
    await connection.beginTransaction();

    // 4. Create or Update Customer record
    const [existingCustomer] = await connection.execute(
      "SELECT id, total_orders, total_spent FROM customers WHERE phone = ? LIMIT 1",
      [customerPhone.trim()]
    );

    let customerId = null;
    const orderTotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);

    if (existingCustomer && existingCustomer.length > 0) {
      customerId = existingCustomer[0].id;
      await connection.execute(
        `UPDATE customers 
         SET name = ?, total_orders = total_orders + 1, total_spent = total_spent + ?, last_visit_at = NOW() 
         WHERE id = ?`,
        [customerName.trim(), orderTotal, customerId]
      );
    } else {
      const [insertCust] = await connection.execute(
        `INSERT INTO customers (name, phone, total_orders, total_spent, last_visit_at, created_at)
         VALUES (?, ?, 1, ?, NOW(), NOW())`,
        [customerName.trim(), customerPhone.trim(), orderTotal]
      );
      customerId = insertCust.insertId;
    }

    // 5. Generate Order Code
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderCode = `WSH-${datePrefix}-${randomSuffix}`;

    // 6. Insert Order
    const paymentStatus = paymentMethod === "CASH" ? "UNPAID" : (paymentProofUrl ? "UNPAID" : "UNPAID");
    const [orderResult] = await connection.execute(
      `INSERT INTO orders 
       (order_code, table_id, table_number, customer_id, customer_name, customer_phone, guest_count, total_amount, payment_method, payment_status, payment_proof_url, order_status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, NOW())`,
      [
        orderCode,
        tableId,
        actualTableName,
        customerId,
        customerName.trim(),
        customerPhone.trim(),
        Number(guestCount),
        orderTotal,
        paymentMethod,
        paymentStatus,
        paymentProofUrl || null,
        tableNotes || null,
      ]
    );

    const orderId = orderResult.insertId;

    // 7. Insert Order Items
    for (const item of items) {
      const menuId = !isNaN(Number(item.id)) ? Number(item.id) : null;
      const subtotal = Number(item.price) * Number(item.qty);
      const rawToppings = item.toppings || item.selected_toppings || item.selectedToppings;
      const toppingsJson = rawToppings && Array.isArray(rawToppings) && rawToppings.length > 0
        ? JSON.stringify(rawToppings)
        : (typeof rawToppings === "string" && rawToppings.trim() !== "" ? rawToppings : null);

      await connection.execute(
        `INSERT INTO order_items 
         (order_id, menu_id, menu_name, unit_price, quantity, subtotal, selected_toppings, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          menuId,
          item.name,
          Number(item.price),
          Number(item.qty),
          subtotal,
          toppingsJson,
          item.notes || null,
        ]
      );
    }

    // 8. Commit Transaction
    await connection.commit();

    return NextResponse.json({
      success: true,
      data: {
        orderId,
        orderCode,
        tableNumber: actualTableName.replace(/^Meja\s+/i, ""),
        tableFullName: actualTableName,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        guestCount: Number(guestCount),
        totalAmount: orderTotal,
        paymentMethod,
        paymentStatus,
        items,
        tableNotes,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Failed to process order:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan pesanan ke database.", error: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
