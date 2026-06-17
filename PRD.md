# Product Requirements Document (PRD)
# Sistem POS Modular Berbasis Monolith

> **Versi:** 2.1 (Consolidated Final — Online Web App)
> **Arsitektur:** Modular Monolith (adaptasi dari konsep microservices)
> **Stack:** SvelteKit + NestJS (TypeScript) + PostgreSQL + Redis
> **Dokumen terkait:** `srs-pos-monolith.md` (kebutuhan rinci), `sequence-diagrams.md` (alur sistem)

---

## Daftar Isi
1. Ringkasan Eksekutif
2. Latar Belakang & Pernyataan Masalah
3. Tujuan, Sasaran & Non-Goals
4. Metrik Keberhasilan (KPI)
5. Target Pengguna & Persona
6. Keputusan Arsitektur: Mengapa Monolith
7. Arsitektur Sistem & Tech Stack
8. Pemetaan Modul Domain
9. Lingkup Fungsional (per Modul)
10. Deep-Dive Fitur Unggulan (Voucher, Scan Smartphone & Tab Transaksi)
11. Kebutuhan Non-Fungsional
12. Rencana Rilis & Fase (MVP -> Lanjutan)
13. Asumsi, Ketergantungan & Risiko
14. Ringkasan Fitur (Checklist)

---

## 1. Ringkasan Eksekutif

Sistem **Point of Sale (POS)** berbasis web yang **modular namun dideploy sebagai satu aplikasi tunggal (Modular Monolith)**: satu codebase, satu proses deployment, satu database utama — tetapi secara internal dipisah rapi menjadi **modul-modul domain independen** dengan boundary yang jelas, sehingga tetap bisa dipecah ke microservices di masa depan (strangler pattern).

Sistem ini menggabungkan kapabilitas POS operasional, manajemen multi-bisnis & multi-cabang, pembelian (purchasing), CRM & loyalty, promo engine, booking/reservasi, akuntansi dasar, serta laporan lengkap — semuanya dalam satu aplikasi yang mudah dikelola tim kecil hingga menengah.

Front-end dibangun sebagai **web app SvelteKit (online)** yang berkomunikasi langsung ke backend NestJS via REST/WebSocket. Sistem mengandalkan koneksi jaringan saat operasi (bukan offline-first/PWA).

**Sorotan kapabilitas:**
- POS kasir berbasis **web app SvelteKit (online)** dengan UI cepat dan responsif.
- **Tab transaksi multi-pelanggan** (mirip tab browser, maksimal 10 tab) — pelanggan yang di-hold **tetap berada di tabnya**.
- **Multi-Business, multi-cabang, multi-gudang** dalam satu back-end.
- **Split payment** (Tunai, QRIS, Kartu, Cheque, Bank Transfer, Voucher).
- **Voucher fisik** single-use sebagai pengurang nilai belanja.
- **Scan barcode via kamera smartphone** (langsung di browser, tanpa hardware tambahan).
- **Manajemen produk lanjutan** (single/variable, IMEI/Serial/Lot, expiry, SKU, label, CSV).
- **Purchasing** + purchase return, kredit/partial, payment reminder.
- **CRM & Loyalty**, pricelist per kategori, diskon bersyarat, markdown otomatis.
- **Booking/reservasi**, pre-order/Click & Collect, deposit (DP).
- **Stock adjustment & transfer** antar lokasi.
- **Akuntansi**: payment account, balance sheet, trial balance, cash flow.
- **Dukungan hardware**: barcode scanner (HID) & thermal printer ESC/POS.
- **Laporan lengkap** dengan filter & chart.

---

## 2. Latar Belakang & Pernyataan Masalah

Konsep awal sistem dirancang sebagai microservices untuk skalabilitas & integrasi ekosistem eksternal. Namun microservices membawa kompleksitas tinggi: distributed transaction, banyak service untuk dideploy, kebutuhan DevOps & tim besar, serta konsistensi data yang sulit dijaga pada operasi keuangan/stok.

**Masalah yang dipecahkan PRD ini:**
- Bisnis ritel/F&B/jasa membutuhkan POS lengkap yang **cepat dirilis, andal, dan murah dikelola**, tanpa overhead microservices.
- Operasi kasir harus **cepat dan responsif** saat online, dengan latensi rendah ke backend.
- Data keuangan, stok, dan voucher harus **konsisten (ACID)** — sulit dicapai bila terpecah di banyak service.

**Solusi:** Modular Monolith yang mempertahankan **semua fitur** konsep microservices, tetapi dengan kompleksitas operasional jauh lebih rendah, sambil menjaga jalur migrasi ke microservices bila bisnis tumbuh.

---

## 3. Tujuan, Sasaran & Non-Goals

### 3.1 Tujuan Bisnis
- Menyediakan platform POS multi-bisnis siap pakai untuk ritel, F&B, dan jasa.
- Menurunkan biaya operasional & deployment dibanding arsitektur microservices.
- Mempercepat time-to-market fitur baru lewat satu codebase.

### 3.2 Sasaran Produk
- POS kasir cepat & responsif (operasi inti < 200 ms saat online).
- Konsistensi keuangan & stok terjamin (transaksi ACID).
- Modularitas internal yang menjaga jalur migrasi ke microservices.

### 3.3 Non-Goals (di luar lingkup saat ini)
- Bukan platform e-commerce storefront publik (fokus pada operasi POS & back-office).
- Tidak menggantikan ERP penuh; akuntansi yang disediakan bersifat dasar (payment account, neraca, arus kas).
- Tidak mencakup hardware payment terminal proprietary tertentu (integrasi via gateway pihak ketiga).

---

## 4. Metrik Keberhasilan (KPI)

| Kategori | Metrik | Target |
|---|---|---|
| Performa | Latensi operasi POS (online) | < 200 ms |
| Performa | Validasi voucher online | < 1 detik |
| Keandalan | Transaksi tidak ganda saat retry jaringan | 100% (idempotent) |
| Ketersediaan | Target uptime server | >= 99,5% |
| Akurasi | Selisih kas terdeteksi saat tutup shift | 100% terlaporkan |
| Integritas | Voucher single-use tidak terpakai ganda | 0 kasus (dijamin DB) |
| Adopsi | Waktu pelatihan kasir baru | < 1 jam (UI user-friendly) |

---

## 5. Target Pengguna & Persona

| Persona | Peran | Kebutuhan Utama |
|---|---|---|
| **Kasir** | Operator transaksi | Checkout cepat, tab transaksi multi-pelanggan, parkir tagihan, split payment, scan |
| **Supervisor / Manajer Toko** | Pengawas cabang | Approval void/diskon, laporan cabang, kelola shift |
| **Admin / Owner** | Pemilik multi-bisnis | Kelola produk/harga/promo/voucher, multi-cabang, laporan global, akuntansi |
| **Staf Gudang** | Pengelola stok | Stock adjustment, transfer antar lokasi, terima pembelian |
| **Pelanggan** | Konsumen | Terdaftar di CRM, booking, loyalty, voucher |
| **Supplier** | Pemasok | Terkait pembelian, hutang & pay terms |
| **Commission Agent** | Salesperson berkomisi | Ditautkan ke penjualan untuk perhitungan komisi |
| **Sistem Eksternal** | Aplikasi pihak ketiga | Kirim booking/pre-order via API |

---

## 6. Keputusan Arsitektur: Mengapa Monolith

| Aspek | Microservices | Modular Monolith (dipilih) |
|---|---|---|
| Deployment | Banyak service, kompleks | 1 aplikasi, sederhana |
| Komunikasi antar-modul | Lewat jaringan (API/Broker) | Pemanggilan in-process |
| Transaksi data | Distributed (rumit) | 1 DB, ACID (konsisten) |
| Biaya & tim | Tim besar + DevOps kuat | Tim kecil cukup |
| Skalabilitas | Per-service | Scale seluruh app (replika di balik LB) |

> **Prinsip kunci:** Tidak ada fitur yang dikurangi dari konsep microservices. Yang berubah hanya cara penyusunan internal & deployment. Setiap "microservice" menjadi **modul domain** dalam satu aplikasi.

---

## 7. Arsitektur Sistem & Tech Stack

### 7.1 Struktur Lapisan (Layered + Modular)

```
+-----------------------------------------------------------+
|  POS Web App (Kasir)  | Web Admin Dashboard | 3rd-Party App |
|  (SvelteKit, online)  |                     |               |
+-----------+---------------+-------------------+------------+
            |   HTTPS / REST / WebSocket          |
+-----------v-------------------------------------v----------+
|            API LAYER (pengganti API Gateway)               |
|   Routing - Auth/JWT - Rate Limit - Validasi - Versioning  |
+------------------------------------------------------------+
|                   APPLICATION / SERVICE LAYER              |
|   Orkestrasi use-case lintas modul (mis. Checkout)         |
+------------------------------------------------------------+
|                  MODUL DOMAIN (in-process)                 |
|  Sales | Inventory/Catalog | Customer | Pricing | Booking  |
|  Purchasing | Contact | HR & Staff | Business/Settings     |
|  Accounting | Reporting                                    |
|         <-> komunikasi via Domain Events (in-memory)       |
+------------------------------------------------------------+
|              INFRASTRUCTURE / DATA ACCESS LAYER            |
|   Repository - ORM - Cache (Redis) - Job Queue             |
+------------------------------------------------------------+
|         DATABASE TUNGGAL (PostgreSQL) + Redis              |
+------------------------------------------------------------+
```

### 7.2 Pengganti API Gateway
**API Layer + Middleware**: autentikasi (JWT/OAuth2), rate limiting, RBAC, routing. Di depannya cukup **reverse proxy (Nginx)** untuk load balancing antar replika.

### 7.3 Pengganti Message Broker
- **In-process Domain Events:** mis. `TransactionCompleted` dipublish modul Sales, didengar Inventory (potong stok), Customer (poin), Accounting (posting), Reporting — tanpa jaringan.
- **Background Job Queue (Redis):** tugas berat/non-blocking (reminder, generate laporan, agregasi data) agar kasir tidak terbeban.
- Bila kelak butuh broker nyata, modul event siap di-swap ke RabbitMQ/Kafka tanpa ubah logika domain.

### 7.4 Tech Stack — Keputusan

**Frontend: SvelteKit** (dibanding React/Vue) — bundle terkecil, performa tertinggi (compiler tanpa Virtual DOM), routing & SSR bawaan; ideal untuk UI kasir yang ringan dan responsif di perangkat spek terbatas. Dibangun sebagai **web app online** (bukan PWA/offline-first).

**Backend: NestJS + TypeScript** — cepat (Node.js non-blocking, opsi Fastify adapter), fleksibel (arsitektur modular cocok dengan modular-monolith), stabil (enterprise-grade). Bahasa sama dengan frontend untuk shared types.

```
Frontend  : SvelteKit (web app online, SSR/SPA)
Backend   : NestJS + TypeScript (modular monolith)
Database  : PostgreSQL (1 DB, skema per modul)
Cache/Job : Redis (cache + background queue)
Real-time : WebSocket (cek stok & antrean booking)
Bahasa    : TypeScript end-to-end (shared types FE<->BE)
```

### 7.5 Multi-Tenancy
- **Multi-Business** dan **Multi-Branch/Warehouse** via kolom `business_id` & `branch_id` (shared schema, row-level tenancy). Data tersekat per bisnis.

---

## 8. Pemetaan Modul Domain

| Modul | Asal Konsep | Tanggung Jawab Utama |
|---|---|---|
| **Sales / Checkout** | Transaction Service | Split payment, keranjang, tab transaksi multi-pelanggan, parkir tagihan, pajak, sales return, kredit/partial, komisi |
| **Inventory & Catalog** | Inventory Service | Produk single/variable, unit, brand, group tax, SKU, IMEI/Serial/Lot, expiry, label, CSV, stok multi-lokasi, adjustment & transfer |
| **Customer (CRM & Loyalty)** | CRM Service | Poin, profil, keanggotaan, kategori harga |
| **Pricing & Promotion** | Pricing Engine | Pricelist, selling price group, diskon bersyarat, markdown, voucher |
| **Booking & Scheduling** | Booking Service | Reservasi, kalender, pre-order, DP, reminder |
| **Purchasing** | Baru | Pembelian, penerimaan, purchase return, pembayaran supplier, reminder |
| **Contact** | Baru | Supplier/Customer, pay terms, payment alert, riwayat transaksi |
| **HR & Staff** | Baru | Roles & permissions, user matrix, commission agent, gaji, expense |
| **Business & Settings** | Baru | Multi-business, lokasi/warehouse, currency/timezone/financial year/pajak, invoice layout, barcode setting, hardware |
| **Accounting / Payment Account** | Baru | Daftar akun, balance sheet, trial balance, cash flow, payment account report |
| **Reporting & Analytics** | Reporting Service | Dashboard performa, laba-rugi, laporan lengkap |

---

## 9. Lingkup Fungsional (per Modul)

> Detail kebutuhan ber-ID (FR-*) ada di `srs-pos-monolith.md`. Bagian ini ringkasan naratif.

### 9.1 POS Kasir & Checkout (Online)
- **Multi-Session & Cash Control:** saldo awal modal saat buka shift; rekonsiliasi kas sistem vs fisik saat tutup shift (deteksi fraud).
- **Tab Transaksi Multi-Pelanggan:** kasir dapat membuka beberapa transaksi sekaligus dalam tab terpisah (mirip tab browser), **maksimal 10 tab aktif** per sesi kasir. Tiap tab menyimpan state sendiri (item, pelanggan, diskon/voucher, salesperson, catatan). Lihat Bagian 10.3.
- **Put On Hold (Parkir Tagihan):** tahan transaksi A, layani B, lanjutkan A. Saat di-hold, transaksi **tetap berada di tab-nya** dengan status *On Hold* (melengkapi parkir tagihan jangka panjang).
- **Split Payment:** Tunai + QRIS + Kartu + Cheque + Bank Transfer + Voucher dalam satu transaksi.
- **Sales Return**, penjualan **Credit/Paid/Partially Paid**, Taxes/Discounts/Shipping.
- **Fully-AJAX, Keyboard Shortcuts, Walk-In/Quick Add Customer**, commission agent per transaksi.
- **Idempotent:** setiap transaksi memakai `idempotency_key` agar aman terhadap retry jaringan (tidak dobel).
- Cetak struk & buka cash drawer.

### 9.2 Inventory, Catalog & Stok
- Produk **single & variable**, enable/disable stock management.
- **Brand, Category, Unit, Tax Rate & Group Taxes**, **Selling Price Group**.
- **Expiry + alert**, **low stock alert**, **SKU predefined/auto**, **IMEI/Serial/Lot**.
- **Cetak barcode & label**, **import CSV**.
- **Real-time stock checking** antar cabang (WebSocket).
- **Stock Adjustment** (increase/decrease + alasan & audit) dan **Stock Transfer** (In Transit -> Completed, ACID).

### 9.3 Customer, Pricing & Promosi
- Customer profiling dari layar POS; **loyalty points** (tukar potongan).
- **Pricelist per kategori** (Grosir/Retail) & selling price group.
- **Conditional discounts** (Beli 2 Gratis 1, dll.), **automated markdown** (Happy Hour/expiry).
- **Voucher fisik** (lihat Bagian 10).

### 9.4 Booking & Reservasi
- Reservasi meja/staf/slot + **UI Kalender**, dipantau dari POS.
- **Pre-Order / Click & Collect** dari aplikasi eksternal (tahan stok).
- **Deposit/DP** terintegrasi kas (potong total saat pelunasan).

### 9.5 Purchasing & Contact
- Purchase: Add/Edit/Delete/View/Print, **purchase return**, kredit/partial, **payment reminder**, taxes/discounts/shipping, lot & expiry, upload dokumen, quick add product.
- Contact sebagai **Supplier/Customer/keduanya**, pay terms & payment alerts, riwayat transaksi.

### 9.6 Business Management & Staf
- **Multiple Business**, lokasi/store front/**warehouse**, currency/timezone/financial year/profit margin/tax registration.
- **User management lanjutan**, **roles & permissions**, **user matrix**, predefined roles (Admin & Cashier), assign lokasi ke role, cashier per lokasi.
- **Commission agent**, **staff salary**, **expense management**.

### 9.7 Akuntansi (Payment Account)
- **List Account** (kas/bank/e-wallet); saldo ter-update otomatis dari transaksi.
- **Balance Sheet, Trial Balance, Cash Flow, Payment Account Report**.

### 9.8 Pengaturan & Hardware
- **Fully customizable invoice layout** (multi-template).
- **Barcode setting** (format label, simbologi EAN-13/Code128).
- **Barcode scanner USB/Bluetooth (HID)** & **thermal printer ESC/POS** + cash drawer.

### 9.9 Reporting & Analitik
- P&L, Purchase & Sell, Stock, Trending Product, Tax, Expenses, Suppliers & Customers, Cash Register, Salesperson/Commission Agent.
- **Filter & chart**, ekspor, **Product Performance** (Fast/Slow Moving), **Salesperson Analytics**.

---

## 10. Deep-Dive Fitur Unggulan

### 10.1 Voucher Fisik (Physical Voucher)
Kupon/kartu bernilai (kode unik/barcode/QR) yang **mengurangi nilai belanja**.

- **Single-use:** sekali ditebus -> status `redeemed` permanen, tanpa sisa saldo.
- **Bisa digabung dengan metode pembayaran lain** (komponen dalam split payment).
- **Jenis:** Fixed Amount & Percentage (opsional max discount).
- **Aturan:** masa berlaku, min. belanja, cakupan cabang/produk, `is_stackable` (default false).
- **Anti-fraud:** redemption **atomik** (lock baris), `voucher_id` UNIQUE di `voucher_redemption` menjamin single-use di level DB. Validasi & redemption dilakukan online secara real-time terhadap backend.

```
voucher(id, code [unik], type[fixed|percent], value, max_discount,
        min_purchase, branch_scope, product_scope, start_date, expiry_date,
        status[active|redeemed|expired|void], is_stackable, batch_id, created_at)
voucher_redemption(id, voucher_id [UNIQUE], transaction_id, branch_id,
        cashier_id, amount_used, redeemed_at)
```

### 10.2 Scan Barcode via Smartphone (Opsi A — Kamera In-App Browser)
- Kamera HP dipakai langsung di web app (`getUserMedia` + `BarcodeDetector` API, fallback ZXing-js).
- Mendukung 1D (EAN/UPC) & 2D (QR/QRIS); tanpa hardware tambahan.
- Integrasi: lookup produk (Inventory), tambah item (Checkout), validasi voucher (Pricing), ambil pre-order (Booking).
- Catatan: butuh HTTPS (syarat akses kamera di browser); sediakan input manual fallback; umpan balik visual + beep.

### 10.3 Tab Transaksi Multi-Pelanggan (Multi-Tab Checkout)

Antarmuka kasir menyediakan **bar tab** di layar POS (mirip tab browser). Setiap tab mewakili **satu transaksi/keranjang aktif** milik satu pelanggan, sehingga kasir dapat melayani beberapa pelanggan secara paralel tanpa kehilangan konteks.

**Perilaku inti:**
- **Maksimal 10 tab aktif** per sesi kasir. Bila sudah 10, kasir harus menyelesaikan, menutup, atau memarkir salah satu tab sebelum membuka tab baru.
- Setiap tab **menyimpan state-nya sendiri** secara terisolasi: daftar item & qty, pelanggan, diskon/voucher, salesperson/komisi, catatan, dan pajak. Berpindah tab **tidak mempengaruhi** tab lain.
- **Pelanggan yang di-hold tetap berada di tab-nya** dengan status *On Hold*. Tab tidak hilang — kasir bisa pindah ke tab lain dan kembali lagi kapan saja untuk melanjutkan.
- **Indikator per tab:** nama/label pelanggan (atau "Walk-In"), jumlah item, total sementara, dan status (*Active* / *On Hold*).
- **Persistensi:** saat tab di-hold, state-nya dipersist ke backend agar aman terhadap refresh browser/ganti perangkat dan dapat dipulihkan saat sesi kasir dibuka kembali. Tab baru yang masih kosong cukup di sisi klien hingga ada item pertama.
- **Menutup tab:** bila masih ada item yang belum di-checkout, sistem meminta konfirmasi (Selesaikan pembayaran / Parkir tagihan / Buang).
- **Setelah checkout selesai**, tab otomatis ditutup (atau di-reset menjadi tab kosong baru).

**Hubungan dengan Parkir Tagihan (FR-SAL-04):**
- **Tab** = transaksi yang sedang berjalan atau *On Hold* **dalam sesi kasir saat ini** (cepat diakses, ada di bar tab).
- **Parkir Tagihan** = penyimpanan tagihan **jangka lebih panjang / lintas sesi & lintas kasir** (mis. pelanggan kembali besok). Tab dapat **diturunkan (demote)** menjadi parkir tagihan untuk mengosongkan slot tab, dan parkir tagihan dapat **diangkat kembali (resume)** menjadi tab aktif.

**Batasan & catatan:**
- Tab bersifat **per sesi kasir/cash register** (bukan global lintas perangkat secara bersamaan).
- Operasi checkout per tab tetap **idempotent** (memakai `idempotency_key`) untuk mencegah transaksi dobel saat retry jaringan.

---

## 11. Kebutuhan Non-Fungsional (Ringkasan)

| Kategori | Kebutuhan |
|---|---|
| Performa | Operasi POS (online) < 200 ms; validasi voucher online < 1 dtk |
| Ketersediaan | Target uptime server >= 99,5% |
| Skalabilitas | Backend horizontal (replika stateless di balik LB); PostgreSQL read replica; Redis |
| Keamanan | JWT/OAuth2, RBAC, HTTPS wajib, enkripsi data sensitif, audit trail |
| Integritas | Operasi keuangan & stok ACID; redemption voucher atomik; transaksi idempotent |
| Usabilitas | UI kasir user-friendly, alur checkout minim langkah; tab transaksi (maks 10) untuk melayani pelanggan paralel |
| Kompatibilitas | Browser modern; BarcodeDetector + fallback; ESC/POS printer |
| Maintainability | Modular boundary dijaga; siap migrasi microservices |

> Detail lengkap (NFR-*) ada di `srs-pos-monolith.md`.

---

## 12. Rencana Rilis & Fase

> Pembagian fase usulan untuk eksekusi bertahap (dapat disesuaikan).

### Fase 1 — MVP POS Inti
- Auth & RBAC dasar, Business & lokasi, katalog produk dasar.
- Checkout + split payment (Tunai/QRIS/Kartu), cetak struk, cash control.
- Tab transaksi multi-pelanggan (maks 10 tab) + parkir tagihan.
- Scan barcode smartphone (kamera in-app browser).
- Inventory dasar + real-time stock.

### Fase 2 — Retail & Promo
- Voucher fisik, CRM & loyalty, pricelist & diskon bersyarat, markdown.
- Purchasing + contact (supplier), purchase return, payment reminder.
- Stock adjustment & transfer, manajemen produk lanjutan (IMEI/Serial/Lot, CSV, label).

### Fase 3 — Back-Office & Keuangan
- Booking/reservasi, pre-order, DP.
- Akuntansi (payment account, balance sheet, trial balance, cash flow).
- Expense & payroll, commission agent.
- Laporan lengkap + dashboard analitik.
- Kustomisasi invoice, barcode setting, dukungan thermal printer ESC/POS & scanner HID.

---

## 13. Asumsi, Ketergantungan & Risiko

### Asumsi
- Perangkat kasir memiliki kamera (untuk scan smartphone) & **koneksi internet stabil** saat operasi.
- Gateway pembayaran (QRIS/Kartu) tersedia via pihak ketiga.

### Ketergantungan
- PostgreSQL, Redis, reverse proxy (Nginx), HTTPS/sertifikat.
- Library: BarcodeDetector/ZXing-js, driver ESC/POS.

### Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
|---|---|---|
| Monolith membesar sulit dikelola | Sedang | Jaga modular boundary; siap strangler ke microservices |
| Ketergantungan koneksi internet (tanpa offline) | Tinggi | Koneksi/redundansi jaringan andal, UX retry yang jelas, idempotency key anti-dobel |
| Kompatibilitas scan barcode antar-browser | Sedang | BarcodeDetector + fallback ZXing-js + input manual |
| Skala trafik tinggi | Sedang | Replika stateless, read replica, cache Redis |
| Keamanan voucher (fraud) | Tinggi | Redemption atomik, UNIQUE constraint, audit trail |

---

## 14. Ringkasan Fitur (Checklist)

**POS Inti & Pembayaran**
- [x] POS Web App (SvelteKit, online) dengan transaksi idempotent (anti-dobel saat retry)
- [x] Multi-Session & Cash Control (deteksi fraud)
- [x] Tab Transaksi Multi-Pelanggan (maks 10 tab; pelanggan yang di-hold tetap di tabnya)
- [x] Put On Hold (Parkir Tagihan)
- [x] Split Payment (Tunai + QRIS + Kartu + Cheque + Bank Transfer + Voucher)
- [x] Sales Return, Penjualan Kredit/Partial, Taxes/Discounts/Shipping
- [x] Fully-AJAX POS, Keyboard Shortcuts, Walk-In/Quick Add Customer
- [x] Commission Agent per transaksi
- [x] Cetak struk & buka cash drawer

**Scan & Hardware**
- [x] Scan Barcode via Smartphone (kamera in-app browser)
- [x] Barcode Scanner USB/Bluetooth (HID)
- [x] Thermal Printer ESC/POS
- [x] Fully Customizable Invoice Layout & Barcode Setting

**Produk & Stok**
- [x] Produk Single & Variable, Enable/Disable Stock Management
- [x] Brand, Category, Unit, Tax Rate & Group Taxes, Selling Price Group
- [x] Expiry + Low Stock & Expiry Alerts
- [x] SKU Predefined/Auto, IMEI/Serial/Lot Number
- [x] Cetak Barcode & Label, Import Produk CSV
- [x] Real-time Stock Checking antar cabang
- [x] Stock Adjustment (alasan & audit)
- [x] Stock Transfer antar lokasi (In Transit -> Completed)

**CRM, Promo & Voucher**
- [x] Customer Profiling, Loyalty Points
- [x] Pricelists & Per-Customer Discounts (Grosir/Retail)
- [x] Conditional Discounts (Beli 2 Gratis 1, dll.)
- [x] Automated Price Markdown (Happy Hour / kedaluwarsa)
- [x] Voucher Fisik (single-use, bisa digabung pembayaran lain)

**Booking**
- [x] Reservasi meja/staf + UI Kalender
- [x] Pre-Order / Click & Collect (tahan stok)
- [x] Deposit / DP terintegrasi kas

**Pembelian & Kontak**
- [x] Purchase: Add/Edit/Delete/View/Print, Purchase Return
- [x] Kredit/Paid/Partial, Multiple Payment, Payment Reminder
- [x] Tax/Discount/Shipping, Lot & Expiry, Upload Dokumen, Quick Add Product
- [x] Kontak Supplier/Customer/keduanya, Pay Terms & Payment Alerts

**Bisnis, Staf & Keuangan**
- [x] Multiple Business + Lokasi/Store Front/Warehouse
- [x] Currency, Time Zone, Financial Year, Profit Margin, Tax Registration
- [x] User Management lanjutan, Permissions & Roles, User Matrix
- [x] Predefined Roles (Admin & Cashier), Assign lokasi ke role, Cashier per lokasi
- [x] Staff Salary & Expense Management
- [x] Akuntansi: Payment Account, Balance Sheet, Trial Balance, Cash Flow, Payment Account Report

**Laporan**
- [x] Laporan lengkap (P&L, Purchase/Sell, Stock, Trending, Tax, Expenses, Supplier/Customer, Cash Register, Salesperson) dengan filter & chart
- [x] Product Performance (Fast/Slow Moving), Salesperson Analytics

---

> **Dokumen pendamping:**
> - `SRS.md` — Software Requirements Specification (kebutuhan fungsional & non-fungsional ber-ID, IEEE 830).
> - `Sequence_Diagram.md` — sequence diagram (Mermaid) untuk alur-alur utama sistem (termasuk tab transaksi multi-pelanggan).
> - `Frontend.md` — UI/UX Requirement 
> - `Backend.md` — Alur-alur dll.