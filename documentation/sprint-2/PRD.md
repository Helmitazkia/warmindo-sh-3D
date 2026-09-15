# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD) — SPRINT 2

## 📌 1. Project Overview
- **Project Name:** Warmindo SH — Smart Self-Order & Micro-POS System
- **Sprint:** Sprint 2
- **Sprint Goal:** Membangun Dashboard Kasir/Admin (Micro-POS) yang sangat *simple* dan *mobile-friendly* khusus untuk pelaku UMKM F&B. Mencakup manajemen master data (Meja, Kategori, Menu), pemantauan transaksi pesanan, detail transaksi, serta pencatatan pengeluaran harian.
- **Target User:** 
  1. Kasir / Admin Toko yang memantau pesanan masuk dan menyelesaikan transaksi.
  2. Owner (Pemilik) yang ingin memantau laba kotor (Pemasukan vs Pengeluaran) secara ringkas lewat layar handphone.

---

## 🎯 2. Problem Statement & Solution

| Problem | Solution di Sprint 2 |
| :--- | :--- |
| Kasir kesulitan memantau pesanan yang masuk dari pelanggan (Dine-in) secara real-time. | **Dashboard Transaksi** yang super simpel dan fokus pada pesanan aktif, mudah dibaca di layar HP. |
| Owner butuh update stok, harga menu, atau nomor meja dengan cepat tanpa harus buka laptop. | **Maintenance Data Master** (Menu, Kategori, Meja) dengan UI minimalis, form ringkas, langsung dari HP. |
| Pelaku UMKM F&B tidak suka sistem akuntansi yang ribet, tapi butuh tahu pengeluaran harian (belanja bahan, dll). | Fitur **Input Pengeluaran** yang simpel (Hanya nominal dan keterangan) + Perbandingan Pemasukan & Pengeluaran berdasarkan rentang tanggal. |
| Tampilan sistem admin/POS bawaan seringkali terlalu kompleks dengan banyak tombol kecil. | **Mobile-First Admin UI**. Tombol besar, teks jelas, navigasi bottom-bar atau sidebar sederhana, menghindari kerumitan. |

---

## 📦 3. Feature Scope (Sprint 2)

### A. In-Scope (Dikerjakan di Sprint 2)
1. **Admin Layout & Navigation:**
   - Navigasi khusus Admin (Mobile-first, mungkin berupa Bottom Navigation atau Hamburger Menu sederhana).
   - Akses dibatasi (Simulasi login admin / route protection dasar).
2. **Maintenance Data Master:**
   - **Master Tables:** Tambah/Edit/Hapus Nomor Meja.
   - **Master Categories:** Tambah/Edit/Hapus Kategori Menu.
   - **Master Menus:** Tambah/Edit/Hapus Menu (termasuk status "Habis/Tersedia" dengan satu kali tap).
3. **Dashboard Transaksi:**
   - List pesanan masuk berdasarkan status (Misal: *Baru*, *Diproses*, *Selesai*).
   - Detail pesanan (Lihat pesanan per meja, catatan khusus pelanggan, status pembayaran).
   - Tombol aksi cepat: "Terima Pesanan", "Selesaikan Pesanan".
4. **Keuangan & Pengeluaran (Cashflow Simple):**
   - **Input Pengeluaran:** Form sederhana (Tanggal, Nominal, Keterangan belanja).
   - **Laporan Ringkas:** Perbandingan Pemasukan (Total Transaksi Selesai) VS Pengeluaran dalam rentang tanggal tertentu (Hari ini, Minggu ini, Bulan ini).

### B. Out-of-Scope (Disimpan untuk Sprint Selanjutnya)
- Manajemen Inventori Bahan Baku otomatis (Recipe Management).
- Cetak Struk Fisik Thermal Bluetooth (sementara fokus digital/WhatsApp).
- Laporan analitik grafik kompleks.

---

## 🗄️ 4. Data Structures (Mock Entities)

```typescript
// Entitas Pengeluaran (Expense)
interface Expense {
  id: string;
  date: string; // Tanggal pengeluaran
  amount: number; // Nominal
  description: string; // Keterangan (e.g., "Beli sawi dan telur")
  recordedBy: string; // Nama kasir/admin
}

// Tambahan pada Entitas Order untuk Dashboard Admin
interface AdminOrderView extends Order {
  cashierNotes?: string;
  isVerified: boolean; // Jika pembayaran QRIS sudah dicek mutasinya
}
```

---

## ✅ 5. Acceptance Criteria (Definisi Selesai)
1. Admin dapat masuk ke rute `/admin` atau `/dashboard` dengan tampilan layar HP yang pas dan tidak terpotong.
2. Admin dapat mematikan ketersediaan (toggle "Habis") sebuah menu dengan cepat dari Master Menus, dan seketika hilang dari halaman `/order` pelanggan.
3. Dashboard Transaksi menampilkan daftar pesanan baru. Admin bisa klik untuk lihat detail dan klik "Selesai".
4. Admin bisa mencatat pengeluaran "Beli Gas Rp 20.000".
5. Di halaman Laporan, Admin bisa melihat "Total Pemasukan Hari Ini Rp 150.000, Total Pengeluaran Rp 20.000, Bersih Rp 130.000".
