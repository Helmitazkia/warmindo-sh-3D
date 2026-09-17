import { NextResponse } from "next/server";
import { getDbPool } from "@/lib/db";

const DEFAULT_PAYMENT_METHODS = [
  {
    code: "CASH",
    name: "Bayar di Tempat (Tunai ke Kasir)",
    account_name: null,
    account_number: null,
    qr_image_url: null,
    is_active: 1,
  },
  {
    code: "QRIS",
    name: "QRIS (GoPay, OVO, Dana, BCA, dll)",
    account_name: "WARMINDO SH OFFICIAL",
    account_number: "NMID: ID1020039281920",
    qr_image_url: "/asset/Diorama_3D_bergaya_Cute___Cozy.png",
    is_active: 1,
  },
  {
    code: "TRANSFER",
    name: "Transfer Bank BCA",
    account_name: "WARMINDO SH BOGOR",
    account_number: "827-192-8391",
    qr_image_url: null,
    is_active: 1,
  },
];

export async function GET() {
  const db = getDbPool();
  try {
    let [rows] = await db.execute(
      `SELECT id, code, name, account_name, account_number, qr_image_url, is_active
       FROM payment_methods
       ORDER BY id ASC`
    );

    // Auto-seed default methods if empty
    if (rows.length === 0) {
      for (const pm of DEFAULT_PAYMENT_METHODS) {
        await db.execute(
          `INSERT INTO payment_methods (code, name, account_name, account_number, qr_image_url, is_active)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [pm.code, pm.name, pm.account_name, pm.account_number, pm.qr_image_url, pm.is_active]
        );
      }
      const [seeded] = await db.execute(
        `SELECT id, code, name, account_name, account_number, qr_image_url, is_active
         FROM payment_methods
         ORDER BY id ASC`
      );
      rows = seeded;
    }

    // Return only active payment methods for customers
    const activeMethods = rows
      .filter((r) => Boolean(r.is_active))
      .map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        accountName: r.account_name,
        accountNumber: r.account_number,
        qrImageUrl: r.qr_image_url,
        isActive: Boolean(r.is_active),
      }));

    return NextResponse.json({
      success: true,
      data: activeMethods,
    });
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
