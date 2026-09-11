# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) — SPRINT 1

## 📌 1. Project Overview
- **Project Name:** Warmindo SH — Smart Self-Order & Micro-POS System
- **Sprint:** Sprint 1
- **Sprint Goal:** Membangun fondasi arsitektur bersih (modular) dan modul **Customer Self-Order (Dine-In)** berbasis Scan QR meja yang mobile-friendly, lengkap dengan pemilihan menu, form checkout, opsi pembayaran (Tunai/QRIS), dan struk ringkas.
- **Target User:** 
  1. Pelanggan Meja (Dine-in Customer) yang ingin memesan mandiri tanpa menunggu kasir mencatat manual.
  2. Kasir/Owner yang menerima pesanan yang sudah terstruktur.

---

## 🎯 2. Problem Statement & Solution

| Problem | Solution di Sprint 1 |
| :--- | :--- |
| Kasir harus bolak-balik mencatat menu pesanan pelanggan secara manual saat jam ramai. | Pelanggan cukup scan QR di meja (`/order?table=1`), langsung melihat katalog menu di HP, dan mengirim pesanan. |
| Pelanggan sering bingung total harga dan menu apa saja yang tersedia. | Antarmuka katalog menu interaktif dengan kalkulasi subtotal keranjang belanja secara real-time. |
| Data identitas pelanggan (Nama & No WA) tidak pernah tercatat untuk kebutuhan retensi/marketing. | Form checkout mewajibkan input Nama & No WhatsApp untuk pengiriman struk digital dan basis data pelanggan. |

---

## 📦 3. Feature Scope (Sprint 1)

### A. In-Scope (Dikerjakan di Sprint 1)
1. **Clean Route Architecture:**
   - Memisahkan domain landing page `(landing)` dan modul order `(order)` agar tidak saling bentrok.
2. **Dynamic Table Resolver:**
   - Mendukung parameter URL meja (`/order?table=1` atau `/order?table=VIP-2`).
3. **Mobile-First Menu Catalog:**
   - Tab filter kategori (*Semua, Mie Khas, Minuman Segar, Topping, Snack*).
   - Card menu dengan foto produk, harga, dan tombol add-to-cart (+ / -).
   - Sticky floating cart indicator dengan ringkasan total item & harga.
4. **Checkout & Customer Information:**
   - Drawer/Modal Checkout.
   - Form Data Pelanggan: Nama, No WhatsApp, Jumlah Orang (pax).
   - Catatan khusus pesanan (misal: "Pedas level 3, jangan pakai sawi").
   - Metode Pembayaran:
     - **Bayar di Tempat (Tunai di Kasir)**
     - **QRIS / Transfer** (menampilkan QR code statis & area upload foto bukti transfer).
5. **Success Order Screen & Digital Receipt:**
   - Halaman status pesanan dengan Order ID unik (contoh: `#WSH-0824`).
   - Tombol cepat kirim ringkasan nota ke WhatsApp.

### B. Out-of-Scope (Disimpan untuk Sprint 2 & Selanjutnya)
- Dashboard Kasir Real-time & WebSocket / Polling Order Receiver *(Sprint 2)*.
- Pencatatan Buku Kas & Pengeluaran Toko *(Sprint 3)*.
- Integrasi Database MySQL/PostgreSQL permanen & Admin Master Data CRUD *(Sprint 4)*.

---

## 🗄️ 4. Data Structures (Mock Entities)

```typescript
// Entitas Menu
interface MenuItem {
  id: string;
  name: string;
  category: "mie" | "minuman" | "topping" | "snack";
  price: number;
  image: string;
  description: string;
  isAvailable: boolean;
}

// Entitas Pesanan (Order)
interface Order {
  id: string;
  orderCode: string; // e.g. WSH-202609-001
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  items: {
    menuId: string;
    name: string;
    price: number;
    qty: number;
    notes?: string;
  }[];
  totalAmount: number;
  paymentMethod: "CASH" | "QRIS" | "TRANSFER";
  paymentProofUrl?: string;
  paymentStatus: "PENDING" | "PAID";
  orderStatus: "NEW" | "COOKING" | "COMPLETED";
  createdAt: string;
}
```

---

## ✅ 5. Acceptance Criteria (Definisi Selesai)
1. Pelanggan dapat membuka URL `/order?table=3` dan nomor meja 3 otomatis terdeteksi.
2. Pelanggan dapat menambah, mengurangi, dan menghapus item dari keranjang.
3. Form checkout memvalidasi input wajib (Nama & No WhatsApp).
4. Saat memilih metode QRIS, QR code tampil dan input bukti transfer dapat diisi.
5. Setelah klik "Pesan Sekarang", muncul halaman sukses pesanan dengan ringkasan lengkap dan tombol WhatsApp.
