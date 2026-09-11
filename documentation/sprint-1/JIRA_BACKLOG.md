# 🎯 SPRINT 1 BACKLOG & JIRA TRACKER

- **Sprint Goal:** Fondasi Arsitektur Modular & Modul Customer Self-Order (Dine-in).
- **Sprint Duration:** Sprint 1
- **Status Summary:** `5 / 5 Tasks Completed` ✅ (SPRINT 1 COMPLETED)

---

## 📊 Sprint Board

| Issue Key | Type | Summary / User Story | Story Points | Status |
| :--- | :--- | :--- | :---: | :---: |
| **WSH-01** | `Tech Task` | **Folder Modularization:** Pemisahan komponen ke `@/components/landing` dan `@/components/order` | 3 | `DONE` ✅ |
| **WSH-02** | `Story` | **Mock Data Source:** Mock dataset Kategori, Menu Warmindo, Meja QR di `@/data/menuData.js` | 2 | `DONE` ✅ |
| **WSH-03** | `Story` | **Mobile Catalog View:** Antarmuka menu interaktif `/order` dengan filter kategori & floating cart | 5 | `DONE` ✅ |
| **WSH-04** | `Story` | **Checkout & Payment:** Drawer form data pembeli & pilihan bayar (Tunai / QRIS Upload) | 5 | `DONE` ✅ |
| **WSH-05** | `Story` | **Digital Invoice Screen:** Halaman sukses order dengan ringkasan & link WhatsApp | 3 | `DONE` ✅ |

---

## 📝 Detailed Task Descriptions & Implementation Results

### 🔹 [WSH-01] Folder Modularization — `DONE`
- **Hasil:** Komponen landing page telah dirapikan ke `src/components/landing/` (`Navbar.jsx`, `HeroSection.jsx`, `MenuSection.jsx`, `VibeSection.jsx`, `CTAFooter.jsx`).
- **Validasi:** Halaman landing utama di `/` tetap berjalan normal dengan Nav link tambahan "Self Order Meja".

---

### 🔹 [WSH-02] Mock Data Source — `DONE`
- **Hasil:** Dataset terpusat dibuat di `src/data/menuData.js` berisi daftar kategori (Mie, Minuman, Topping, Snack), menu lengkap dengan foto dan harga, daftar meja 1–6 + VIP, serta metode pembayaran.

---

### 🔹 [WSH-03] Mobile Catalog View (`/order`) — `DONE`
- **Hasil:** Halaman `/order` mobile-first responsif dengan:
  - Deteksi parameter meja otomatis (`/order?table=1`).
  - Modal ganti nomor meja.
  - Search bar interaktif.
  - Filter kategori horizontal pills.
  - Card menu dengan kontrol quantity (+ / -) dan modal input catatan pesanan khusus.
  - Floating sticky cart bar di bawah layar.

---

### 🔹 [WSH-04] Checkout & Payment Drawer — `DONE`
- **Hasil:** Bottom-sheet Drawer dengan:
  - Rincian item pesanan.
  - Form Nama Pemesan, No WhatsApp, dan Jumlah Orang.
  - Pilihan metode bayar: Tunai di Kasir, QRIS (tampil QR code & upload bukti), dan Transfer Bank.

---

### 🔹 [WSH-05] Digital Invoice Screen — `DONE`
- **Hasil:** Halaman invoice sukses dengan kode pesanan unik (contoh: `#WSH-260911-742`), status pembayaran, rincian biaya, tombol kirim struk ke WhatsApp (`wa.me/6285817670115`), dan tombol pesan tambahan.
