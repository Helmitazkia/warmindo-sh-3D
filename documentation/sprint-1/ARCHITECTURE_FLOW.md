# 🏗️ SYSTEM ARCHITECTURE & FLOW DIAGRAMS — SPRINT 1

Dokumen ini berisi diagram alur dan arsitektur sistem berbasis **Mermaid Syntax**. Anda dapat menyalin (*copy-paste*) kode diagram di bawah ke tools online seperti:
- 👉 [Mermaid Live Editor](https://mermaid.live/)
- 👉 [Eraser.io](https://www.eraser.io/)
- 👉 GitHub / Notion Markdown Viewer

---

## 1. High-Level System Architecture

Diagram ini menunjukkan pembagian modul antara Landing Page, Modul Self-Order Pelanggan, dan Backend/State.

```mermaid
flowchart TB
    subgraph ClientLayer ["📱 Frontend Layer (Next.js App Router)"]
        subgraph GroupLanding ["(landing) Domain"]
            A1["Landing Page (Warmindo 3D)"]
            A2["SEO & Local Business Profile"]
            A3["Review Showcase"]
        end

        subgraph GroupOrder ["(customer-order) Domain"]
            B1["QR Table Resolver (/order?table=X)"]
            B2["Mobile Catalog & Filter"]
            B3["Cart State (Zustand / React State)"]
            B4["Checkout Modal (Cash / QRIS)"]
            B5["Order Success & Digital Receipt"]
        end
    end

    subgraph ServiceLayer ["⚙️ Service & API Layer (Next.js Route Handlers)"]
        C1["/api/menus (Katalog Menu)"]
        C2["/api/orders (Submit Pesanan)"]
        C3["/api/upload (Bukti Transfer/QRIS)"]
    end

    subgraph StorageLayer ["💾 Data & Media Store"]
        D1[("Order & Menu State / DB")]
        D2[("Receipt / Public Assets")]
    end

    %% Relasi Alur
    B1 --> B2
    B2 <--> B3
    B3 --> B4
    B4 --> B5

    B2 -.-> C1
    B5 -.-> C2
    B4 -.-> C3

    C1 --> D1
    C2 --> D1
    C3 --> D2
```

---

## 2. Customer Order Flowchart (End-to-End User Journey)

Alur lengkap langkah demi langkah dari saat pelanggan duduk di meja sampai pesanan terkirim:

```mermaid
flowchart TD
    Start([Pelanggan Duduk di Meja]) --> ScanQR[Scan Barcode QR di Meja]
    ScanQR --> OpenURL[Buka URL: /order?table=X]
    OpenURL --> CheckTable{Nomor Meja Valid?}
    
    CheckTable -- Tidak --> FallbackTable[Pilih / Masukkan Nomor Meja Manual]
    CheckTable -- Ya --> ShowCatalog[Tampilkan Katalog Menu Mobile]
    FallbackTable --> ShowCatalog

    ShowCatalog --> SelectMenu[Pilih Menu & Atur Quantity]
    SelectMenu --> AddCart[Tambahkan ke Keranjang]
    
    AddCart --> CheckCart{Mau Tambah Lagi?}
    CheckCart -- Ya --> SelectMenu
    CheckCart -- No/Checkout --> OpenCheckout[Buka Halaman / Drawer Checkout]

    OpenCheckout --> FillForm[Isi Data: Nama, No WhatsApp, Jumlah Orang]
    FillForm --> ChoosePayment{Pilih Metode Pembayaran}

    ChoosePayment -- Bayar di Tempat (Tunai) --> SubmitCash[Submit Pesanan: Status PENDING KASIR]
    ChoosePayment -- QRIS / Transfer --> ShowQRIS[Tampilkan QRIS Toko & Total Nominal]
    
    ShowQRIS --> UploadProof[Upload Foto Bukti Pembayaran]
    UploadProof --> SubmitQRIS[Submit Pesanan: Status PENDING VERIFIKASI]

    SubmitCash --> OrderSuccess[Halaman Sukses & Invoice Digital]
    SubmitQRIS --> OrderSuccess

    OrderSuccess --> SendWA[Trigger Tombol: Kirim Ringkasan ke WhatsApp]
    SendWA --> End([Menunggu Makanan Disajikan])
```

---

## 3. Sequence Diagram (Interaksi Komponen & State)

Menunjukkan bagaimana data mengalir antara Browser Pelanggan, Frontend Component, dan Backend State:

```mermaid
sequenceDiagram
    autonumber
    actor C as Pelanggan (HP)
    participant UI as Order Page (/order)
    participant State as Cart & Form State
    participant API as Order API Handler
    participant WA as WhatsApp App

    C->>UI: Buka link dari QR Meja (/order?table=1)
    UI->>State: Inisialisasi Table ID = 1
    UI->>C: Render Menu (Makanan, Minuman, Topping)
    
    C->>UI: Klik Tambah Menu (e.g. Mie Nyemek + Es Matcha)
    UI->>State: Update Cart (Items, Subtotal)
    State-->>UI: Update Floating Cart Badge
    
    C->>UI: Klik Tombol "Checkout"
    UI->>C: Tampilkan Form (Nama, No WA, Metode Bayar)
    
    C->>UI: Input Form & Pilih "Bayar di Kasir / QRIS"
    C->>UI: Klik "Konfirmasi Pesanan"
    
    UI->>API: POST /api/orders (Payload: items, customerInfo, table)
    API-->>UI: Response Success (Order ID: #WSH-001)
    
    UI->>State: Clear Cart
    UI->>C: Tampilkan Halaman Sukses & Nota
    
    C->>UI: Klik "Kirim Nota ke WhatsApp"
    UI->>WA: Open wa.me link dengan template teks nota
```
