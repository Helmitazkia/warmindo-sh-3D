# 🏗️ SYSTEM ARCHITECTURE & FLOW DIAGRAMS — SPRINT 2

Dokumen ini berisi diagram alur dan arsitektur sistem berbasis **Mermaid Syntax** khusus untuk modul Admin/Kasir (Sprint 2).

---

## 1. High-Level Admin Architecture

Diagram ini menunjukkan bagaimana Dashboard Admin terhubung dengan entitas data yang telah dibuat pada Sprint 1, serta penambahan modul Pengeluaran (Expense).

```mermaid
flowchart TB
    subgraph AdminLayer ["📱 Admin/Kasir Layer (Mobile-First UI)"]
        subgraph GroupDashboard ["Dashboard Domain"]
            A1["Transaction Dashboard (Pesanan Masuk)"]
            A2["Transaction Details (Approve/Reject)"]
        end

        subgraph GroupMaster ["Master Data Domain"]
            B1["Master Menus (Stok, Harga)"]
            B2["Master Categories"]
            B3["Master Tables"]
        end
        
        subgraph GroupFinance ["Cashflow Domain"]
            C1["Input Pengeluaran (Expense)"]
            C2["Laporan (Pemasukan vs Pengeluaran)"]
        end
    end

    subgraph ServiceLayer ["⚙️ Backend & API Handler"]
        D1["/api/admin/orders"]
        D2["/api/admin/master"]
        D3["/api/admin/finance"]
    end

    subgraph StorageLayer ["💾 Data Store"]
        E1[("Order DB")]
        E2[("Master DB (Menu, dll)")]
        E3[("Expense DB (Baru)")]
    end

    %% Relasi Alur
    A1 --> D1
    A2 --> D1
    B1 --> D2
    B2 --> D2
    B3 --> D2
    C1 --> D3
    C2 --> D3

    D1 <--> E1
    D2 <--> E2
    D3 <--> E1
    D3 <--> E3
```

---

## 2. Cashier Transaction Flowchart (Order Handling)

Alur Kasir dalam menangani pesanan yang masuk dari pelanggan:

```mermaid
flowchart TD
    Start([Notifikasi / Pesanan Masuk]) --> CheckDash[Buka Dashboard Transaksi]
    CheckDash --> ViewList[Lihat List Pesanan (Status: NEW / PENDING)]
    
    ViewList --> ClickDetail[Klik Detail Pesanan Tertentu]
    ClickDetail --> CheckPayment{Metode Pembayaran?}
    
    CheckPayment -- Tunai (Cash) --> WaitCash[Tunggu Pelanggan Bayar ke Kasir]
    WaitCash --> ConfirmCash[Konfirmasi Pembayaran Diterima]
    
    CheckPayment -- QRIS / Transfer --> CheckProof[Lihat Foto Bukti Transfer]
    CheckProof --> VerifyBank{Cek Mutasi Rekening}
    VerifyBank -- Belum Masuk --> Reject[Tandai Belum Lunas / Tolak]
    VerifyBank -- Sudah Masuk --> ConfirmCash
    
    ConfirmCash --> ProcessOrder[Tandai Pesanan "Sedang Dimasak"]
    ProcessOrder --> ServeOrder[Pesanan Disajikan ke Meja]
    ServeOrder --> Finish([Tandai Pesanan "SELESAI"])
```

---

## 3. Simple Cashflow Diagram (Pemasukan vs Pengeluaran)

Alur bagaimana sistem menghitung Laporan Laba Kotor harian untuk Owner:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Kasir/Owner (HP)
    participant Transaksi as Sistem Transaksi (Orders)
    participant Pengeluaran as Sistem Pengeluaran (Expenses)
    participant Laporan as Halaman Laporan

    Admin->>Transaksi: Menyelesaikan Pesanan (Tunai/QRIS) Rp 50.000
    Transaksi->>Transaksi: State Pemasukan Harian = +Rp 50.000
    
    Admin->>Pengeluaran: Beli bahan baku (Telur) Rp 20.000
    Pengeluaran->>Pengeluaran: State Pengeluaran Harian = +Rp 20.000
    
    Admin->>Laporan: Buka Halaman Laporan "Hari Ini"
    Laporan->>Transaksi: Get Total Transaksi Sukses
    Laporan->>Pengeluaran: Get Total Pengeluaran
    
    Laporan-->>Admin: Tampilkan Ringkasan (Masuk: 50rb, Keluar: 20rb, Bersih: 30rb)
```
