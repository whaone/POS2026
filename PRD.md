# Product Requirements Document (PRD)
# Sistem POS Modular Berbasis Monolith

> **Versi:** 2.1 (Consolidated Final — Online Web App)
> **Arsitektur:** Modular Monolith (adaptasi dari konsep microservices)
> **Stack:** SvelteKit + NestJS (TypeScript) + PostgreSQL + Redis
> **Dokumen terkait:** `SRS.md` (kebutuhan rinci ber-ID), `Sequence_Diagram.md` (alur sistem), `Backend.md`, `Frontend.md`

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
15. Matriks Ketertelusuran (Fitur PRD → Kebutuhan SRS)

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

> Detail kebutuhan ber-ID (FR-*) ada di `SRS.md` §3. Setiap butir di bawah **ditautkan** ke ID kebutuhan SRS
> (`FR-*`), aturan bisnis (`BR-*`), dan/atau use case (`UC-*`) untuk menjaga ketertelusuran (anti-drift).

### 9.1 POS Kasir & Checkout (Online)
- **Multi-Session & Cash Control:** saldo awal modal saat buka shift; rekonsiliasi kas sistem vs fisik saat tutup shift (deteksi fraud). → `FR-CSH-01..04`, `BR-07`, `UC-03`
- **Tab Transaksi Multi-Pelanggan:** kasir dapat membuka beberapa transaksi sekaligus dalam tab terpisah (mirip tab browser), **maksimal 10 tab aktif** per sesi kasir. Tiap tab menyimpan state sendiri (item, pelanggan, diskon/voucher, salesperson, catatan). Lihat Bagian 10.3. → `FR-SAL-18..23`, `BR-15`, `BR-16`, `UC-08`
- **Put On Hold (Parkir Tagihan):** tahan transaksi A, layani B, lanjutkan A. Saat di-hold, transaksi **tetap berada di tab-nya** dengan status *On Hold* (melengkapi parkir tagihan jangka panjang). → `FR-SAL-04`, `FR-SAL-21`, `FR-SAL-22`, `UC-02`
- **Split Payment:** Tunai + QRIS + Kartu + Cheque + Bank Transfer + Voucher dalam satu transaksi. → `FR-SAL-03`, `FR-SAL-12`, `FR-PRC-06`, `UC-01`
- **Sales Return**, penjualan **Credit/Paid/Partially Paid**, Taxes/Discounts/Shipping. → `FR-SAL-10`, `FR-SAL-11`, `FR-SAL-16`, `BR-13`
- **Fully-AJAX, Keyboard Shortcuts, Walk-In/Quick Add Customer**, commission agent per transaksi. → `FR-SAL-13`, `FR-SAL-14`, `FR-SAL-15`
- **Idempotent:** setiap transaksi memakai `idempotency_key` agar aman terhadap retry jaringan (tidak dobel). → `FR-SAL-09`, `NFR-REL-01`
- Cetak struk & buka cash drawer. → `FR-SAL-06`, `FR-CFG-04`, `FR-CFG-05`

### 9.2 Inventory, Catalog & Stok
- Produk **single & variable**, enable/disable stock management. → `FR-PRD-01`, `FR-PRD-02`, `FR-INV-01`
- **Brand, Category, Unit, Tax Rate & Group Taxes**, **Selling Price Group**. → `FR-PRD-03`, `FR-PRD-08`
- **Expiry + alert**, **low stock alert**, **SKU predefined/auto**, **IMEI/Serial/Lot**. → `FR-PRD-04`, `FR-PRD-05`, `FR-PRD-06`
- **Cetak barcode & label**, **import CSV**. → `FR-PRD-07`, `FR-PRD-09`
- **Real-time stock checking** antar cabang (WebSocket). → `FR-INV-03`, `FR-INV-04`, `AC-09`
- **Stock Adjustment** (increase/decrease + alasan & audit) dan **Stock Transfer** (In Transit → Completed, ACID). → `FR-STK-01..06`, `FR-INV-06`, `BR-05`, `UC-05`, `AC-06`

### 9.3 Customer, Pricing & Promosi
- Customer profiling dari layar POS; **loyalty points** (tukar potongan). → `FR-CRM-01`, `FR-CRM-02`, `FR-CRM-03`, `BR-01`
- **Pricelist per kategori** (Grosir/Retail) & selling price group. → `FR-CRM-04`, `FR-PRC-01`, `BR-06`
- **Conditional discounts** (Beli 2 Gratis 1, dll.), **automated markdown** (Happy Hour/expiry). → `FR-PRC-02`, `FR-PRC-03`, `BR-12`
- **Voucher fisik** (lihat Bagian 10). → `FR-PRC-04..08`, `BR-02`, `BR-03`

### 9.4 Booking & Reservasi
- Reservasi meja/staf/slot + **UI Kalender**, dipantau dari POS. → `FR-BOK-01`, `FR-BOK-02`
- **Pre-Order / Click & Collect** dari aplikasi eksternal (tahan stok). → `FR-BOK-03`, `FR-BOK-04`, `FR-INV-05`, `UC-06`
- **Deposit/DP** terintegrasi kas (potong total saat pelunasan). → `FR-BOK-05`, `BR-08`, `AC-10`

### 9.5 Purchasing & Contact
- Purchase: Add/Edit/Delete/View/Print, **purchase return**, kredit/partial, **payment reminder**, taxes/discounts/shipping, lot & expiry, upload dokumen, quick add product. → `FR-PUR-01..09`, `BR-13`, `UC-04`, `AC-07`
- Contact sebagai **Supplier/Customer/keduanya**, pay terms & payment alerts, riwayat transaksi. → `FR-SUP-01..04`

### 9.6 Business Management & Staf
- **Multiple Business**, lokasi/store front/**warehouse**, currency/timezone/financial year/profit margin/tax registration. → `FR-BIZ-01..05`, `BR-10`
- **User management lanjutan**, **roles & permissions**, **user matrix**, predefined roles (Admin & Cashier), assign lokasi ke role, cashier per lokasi. → `FR-HRM-01..03`, `FR-HRM-07`, `FR-AUT-02`, `FR-AUT-03`, `BR-11`
- **Commission agent**, **staff salary**, **expense management**. → `FR-HRM-04`, `FR-HRM-05`, `FR-HRM-06`, `FR-SAL-15`

### 9.7 Akuntansi (Payment Account)
- **List Account** (kas/bank/e-wallet); saldo ter-update otomatis dari transaksi. → `FR-ACC-01`, `FR-ACC-02`, `BR-14`, `AC-08`
- **Balance Sheet, Trial Balance, Cash Flow, Payment Account Report**. → `FR-ACC-03`, `FR-ACC-04`, `FR-ACC-05`, `FR-ACC-06`

### 9.8 Pengaturan & Hardware
- **Fully customizable invoice layout** (multi-template). → `FR-CFG-01`
- **Barcode setting** (format label, simbologi EAN-13/Code128). → `FR-CFG-02`
- **Barcode scanner USB/Bluetooth (HID)** & **thermal printer ESC/POS** + cash drawer. → `FR-CFG-03`, `FR-CFG-04`, `FR-CFG-05`, `AC-12`

### 9.9 Reporting & Analitik
- P&L, Purchase & Sell, Stock, Trending Product, Tax, Expenses, Suppliers & Customers, Cash Register, Salesperson/Commission Agent. → `FR-RPT-01`, `FR-RPT-06..10`
- **Filter & chart**, ekspor, **Product Performance** (Fast/Slow Moving), **Salesperson Analytics**. → `FR-RPT-02`, `FR-RPT-03`, `FR-RPT-05`, `FR-RPT-11`

---

## 10. Deep-Dive Fitur Unggulan

### 10.1 Voucher Fisik (Physical Voucher)
> **Ketertelusuran:** `FR-PRC-04..08`, `BR-02`, `BR-03`, `NFR-SEC-02`, `UC-01`, `UC-07`, `AC-01`, `AC-02`, `E-VOUCHER-409`

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
> **Ketertelusuran:** `FR-SCN-01..05`, `FR-SAL-02`, `NFR-COMPAT-01`, `UC-01`; HTTPS wajib (SRS §2.5, §6.4)
- Kamera HP dipakai langsung di web app (`getUserMedia` + `BarcodeDetector` API, fallback ZXing-js).
- Mendukung 1D (EAN/UPC) & 2D (QR/QRIS); tanpa hardware tambahan.
- Integrasi: lookup produk (Inventory), tambah item (Checkout), validasi voucher (Pricing), ambil pre-order (Booking).
- Catatan: butuh HTTPS (syarat akses kamera di browser); sediakan input manual fallback; umpan balik visual + beep.

### 10.3 Tab Transaksi Multi-Pelanggan (Multi-Tab Checkout)
> **Ketertelusuran:** `FR-SAL-18..23`, `BR-15`, `BR-16`, `FR-SAL-04`, `NFR-USAB-01`, `UC-02`, `UC-08`, `AC-03`, `AC-03b`, `E-TAB-409`

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

| Kategori | Kebutuhan | ID SRS |
|---|---|---|
| Performa | Operasi POS (online) < 200 ms; validasi voucher online < 1 dtk | `NFR-PERF-01`, `NFR-PERF-02` |
| Performa | Listing/laporan dengan pagination & index (query wajar < 2 dtk) | `NFR-PERF-03` |
| Ketersediaan | Target uptime server >= 99,5%; failover/redundansi | `NFR-AVAIL-01`, `NFR-AVAIL-02` |
| Skalabilitas | Backend horizontal (replika stateless di balik LB); PostgreSQL read replica; Redis | `NFR-SCAL-01`, `NFR-SCAL-02` |
| Keamanan | JWT/OAuth2, RBAC, HTTPS wajib, enkripsi data sensitif, audit trail | `NFR-SEC-01`, `NFR-SEC-03`, `NFR-SEC-04` |
| Integritas | Operasi keuangan & stok ACID; redemption voucher atomik; transaksi idempotent | `NFR-DATA-01`, `NFR-SEC-02`, `NFR-REL-01` |
| Usabilitas | UI kasir user-friendly, alur checkout minim langkah; tab transaksi (maks 10) untuk melayani pelanggan paralel | `NFR-USAB-01` |
| Kompatibilitas | Browser modern; BarcodeDetector + fallback; ESC/POS printer | `NFR-COMPAT-01` |
| Maintainability | Modular boundary dijaga; siap migrasi microservices | `NFR-MAINT-01` |
| Portabilitas | Web app responsif lintas perangkat (opsi bungkus native) | `NFR-PORT-01` |
| Lokalisasi | Mata uang, zona waktu, & format sesuai pengaturan bisnis | `NFR-LOC-01` |

> Detail lengkap (NFR-*) ada di `SRS.md` §9.

---

## 12. Rencana Rilis & Fase

> Pembagian fase usulan untuk eksekusi bertahap (dapat disesuaikan).

### Fase 1 — MVP POS Inti
- Auth & RBAC dasar, Business & lokasi, katalog produk dasar. → `FR-AUT-01..02`, `FR-BIZ-01..05`, `FR-HRM-01..03`, `FR-INV-01`, `FR-PRD-01`
- Checkout + split payment (Tunai/QRIS/Kartu), cetak struk, cash control. → `FR-SAL-01..09`, `FR-SAL-12`, `FR-CSH-01..04`, `FR-CFG-04`
- Tab transaksi multi-pelanggan (maks 10 tab) + parkir tagihan. → `FR-SAL-18..23`, `BR-15`, `BR-16`
- Scan barcode smartphone (kamera in-app browser). → `FR-SCN-01..05`
- Inventory dasar + real-time stock. → `FR-INV-02..06`

### Fase 2 — Retail & Promo
- Voucher fisik, CRM & loyalty, pricelist & diskon bersyarat, markdown. → `FR-PRC-01..08`, `FR-CRM-01..04`, `BR-01..03`, `BR-06`, `BR-12`
- Purchasing + contact (supplier), purchase return, payment reminder. → `FR-PUR-01..09`, `FR-SUP-01..04`, `BR-13`
- Stock adjustment & transfer, manajemen produk lanjutan (IMEI/Serial/Lot, CSV, label). → `FR-STK-01..06`, `FR-PRD-02..09`

### Fase 3 — Back-Office & Keuangan
- Booking/reservasi, pre-order, DP. → `FR-BOK-01..06`, `BR-08`
- Akuntansi (payment account, balance sheet, trial balance, cash flow). → `FR-ACC-01..06`, `BR-14`
- Expense & payroll, commission agent. → `FR-HRM-04..06`, `FR-SAL-15`
- Laporan lengkap + dashboard analitik. → `FR-RPT-01..11`
- Kustomisasi invoice, barcode setting, dukungan thermal printer ESC/POS & scanner HID. → `FR-CFG-01..05`

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

> Setiap item ditautkan ke ID kebutuhan SRS untuk ketertelusuran. Tanda `[x]` = tercakup dalam spesifikasi (bukan status implementasi; status implementasi dilacak di `docs/PLAN.md`).

**POS Inti & Pembayaran**
- [x] POS Web App (SvelteKit, online) dengan transaksi idempotent (anti-dobel saat retry) — `FR-SAL-09`, `NFR-REL-01`
- [x] Multi-Session & Cash Control (deteksi fraud) — `FR-CSH-01..04`, `BR-07`
- [x] Tab Transaksi Multi-Pelanggan (maks 10 tab; pelanggan yang di-hold tetap di tabnya) — `FR-SAL-18..23`, `BR-15`, `BR-16`
- [x] Put On Hold (Parkir Tagihan) — `FR-SAL-04`, `FR-SAL-21`, `FR-SAL-22`
- [x] Split Payment (Tunai + QRIS + Kartu + Cheque + Bank Transfer + Voucher) — `FR-SAL-03`, `FR-SAL-12`, `FR-PRC-06`
- [x] Sales Return, Penjualan Kredit/Partial, Taxes/Discounts/Shipping — `FR-SAL-10`, `FR-SAL-11`, `FR-SAL-16`, `BR-13`
- [x] Fully-AJAX POS, Keyboard Shortcuts, Walk-In/Quick Add Customer — `FR-SAL-13`, `FR-SAL-14`
- [x] Commission Agent per transaksi — `FR-SAL-15`, `FR-HRM-04`
- [x] Cetak struk & buka cash drawer — `FR-SAL-06`, `FR-CFG-04`, `FR-CFG-05`

**Scan & Hardware**
- [x] Scan Barcode via Smartphone (kamera in-app browser) — `FR-SCN-01..05`
- [x] Barcode Scanner USB/Bluetooth (HID) — `FR-CFG-03`
- [x] Thermal Printer ESC/POS — `FR-CFG-04`
- [x] Fully Customizable Invoice Layout & Barcode Setting — `FR-CFG-01`, `FR-CFG-02`

**Produk & Stok**
- [x] Produk Single & Variable, Enable/Disable Stock Management — `FR-PRD-01`, `FR-PRD-02`
- [x] Brand, Category, Unit, Tax Rate & Group Taxes, Selling Price Group — `FR-PRD-03`, `FR-PRD-08`
- [x] Expiry + Low Stock & Expiry Alerts — `FR-PRD-04`
- [x] SKU Predefined/Auto, IMEI/Serial/Lot Number — `FR-PRD-05`, `FR-PRD-06`
- [x] Cetak Barcode & Label, Import Produk CSV — `FR-PRD-07`, `FR-PRD-09`
- [x] Real-time Stock Checking antar cabang — `FR-INV-03`, `FR-INV-04`
- [x] Stock Adjustment (alasan & audit) — `FR-STK-01`, `FR-STK-02`, `FR-STK-06`
- [x] Stock Transfer antar lokasi (In Transit → Completed) — `FR-STK-03..05`, `FR-INV-06`, `BR-05`

**CRM, Promo & Voucher**
- [x] Customer Profiling, Loyalty Points — `FR-CRM-01..03`, `BR-01`
- [x] Pricelists & Per-Customer Discounts (Grosir/Retail) — `FR-PRC-01`, `FR-CRM-04`, `BR-06`
- [x] Conditional Discounts (Beli 2 Gratis 1, dll.) — `FR-PRC-02`
- [x] Automated Price Markdown (Happy Hour / kedaluwarsa) — `FR-PRC-03`, `BR-12`
- [x] Voucher Fisik (single-use, bisa digabung pembayaran lain) — `FR-PRC-04..08`, `BR-02`, `BR-03`

**Booking**
- [x] Reservasi meja/staf + UI Kalender — `FR-BOK-01`, `FR-BOK-02`
- [x] Pre-Order / Click & Collect (tahan stok) — `FR-BOK-03`, `FR-BOK-04`, `FR-INV-05`
- [x] Deposit / DP terintegrasi kas — `FR-BOK-05`, `BR-08`

**Pembelian & Kontak**
- [x] Purchase: Add/Edit/Delete/View/Print, Purchase Return — `FR-PUR-01`, `FR-PUR-02`
- [x] Kredit/Paid/Partial, Multiple Payment, Payment Reminder — `FR-PUR-03`, `FR-PUR-04`, `BR-13`
- [x] Tax/Discount/Shipping, Lot & Expiry, Upload Dokumen, Quick Add Product — `FR-PUR-05..08`
- [x] Kontak Supplier/Customer/keduanya, Pay Terms & Payment Alerts — `FR-SUP-01..04`

**Bisnis, Staf & Keuangan**
- [x] Multiple Business + Lokasi/Store Front/Warehouse — `FR-BIZ-01`, `FR-BIZ-02`
- [x] Currency, Time Zone, Financial Year, Profit Margin, Tax Registration — `FR-BIZ-03`, `FR-BIZ-04`
- [x] User Management lanjutan, Permissions & Roles, User Matrix — `FR-HRM-01`, `FR-HRM-07`, `FR-AUT-02`
- [x] Predefined Roles (Admin & Cashier), Assign lokasi ke role, Cashier per lokasi — `FR-HRM-02`, `FR-HRM-03`
- [x] Staff Salary & Expense Management — `FR-HRM-05`, `FR-HRM-06`
- [x] Akuntansi: Payment Account, Balance Sheet, Trial Balance, Cash Flow, Payment Account Report — `FR-ACC-01..06`, `BR-14`

**Laporan**
- [x] Laporan lengkap (P&L, Purchase/Sell, Stock, Trending, Tax, Expenses, Supplier/Customer, Cash Register, Salesperson) dengan filter & chart — `FR-RPT-01`, `FR-RPT-06..11`
- [x] Product Performance (Fast/Slow Moving), Salesperson Analytics — `FR-RPT-02`, `FR-RPT-03`

---

## 15. Matriks Ketertelusuran (Fitur PRD → Kebutuhan SRS)

> Matriks ringkas tingkat-PRD. Pemetaan rinci PRD→SRS juga dipelihara di `SRS.md` §11; acceptance criteria di `SRS.md` §10.
> Aturan anti-drift: **setiap fitur PRD wajib memiliki ≥1 ID kebutuhan SRS**. Fitur tanpa ID = indikasi scope creep.

| # | Fitur PRD (§) | FR Terkait | BR/NFR Terkait | Use Case | Acceptance |
|---|---|---|---|---|---|
| 1 | Checkout & Split Payment (§9.1, §10.1) | FR-SAL-01..09, FR-SAL-12, FR-PRC-06 | BR-04, NFR-DATA-01 | UC-01 | AC-01 |
| 2 | Idempotency Transaksi (§9.1) | FR-SAL-09 | NFR-REL-01 | UC-01 | AC-05 |
| 3 | Tab Transaksi Multi-Pelanggan (§10.3) | FR-SAL-18..23 | BR-15, BR-16, NFR-USAB-01 | UC-08 | AC-03b |
| 4 | Put On Hold / Parkir Tagihan (§9.1) | FR-SAL-04, FR-SAL-21, FR-SAL-22 | BR-16 | UC-02 | AC-03 |
| 5 | Cash Control & Rekonsiliasi (§9.1) | FR-CSH-01..04 | BR-07 | UC-03 | AC-04 |
| 6 | Sales Return & Kredit/Partial (§9.1) | FR-SAL-10, FR-SAL-11, FR-SAL-16 | BR-13 | — | — |
| 7 | Inventory & Real-time Stock (§9.2) | FR-INV-01..06 | BR-05 | — | AC-09 |
| 8 | Manajemen Produk Lanjutan (§9.2) | FR-PRD-01..09 | — | — | — |
| 9 | Stock Adjustment & Transfer (§9.2) | FR-STK-01..06 | BR-05, NFR-DATA-01 | UC-05 | AC-06 |
| 10 | Customer, Loyalty & Pricing (§9.3) | FR-CRM-01..04, FR-PRC-01 | BR-01, BR-06 | — | — |
| 11 | Diskon Bersyarat & Markdown (§9.3) | FR-PRC-02, FR-PRC-03 | BR-12 | — | — |
| 12 | Voucher Fisik (§10.1) | FR-PRC-04..08 | BR-02, BR-03, NFR-SEC-02 | UC-07 | AC-02 |
| 13 | Booking, Pre-Order & DP (§9.4) | FR-BOK-01..06, FR-INV-05 | BR-08 | UC-06 | AC-10 |
| 14 | Purchasing & Purchase Return (§9.5) | FR-PUR-01..09 | BR-13 | UC-04 | AC-07 |
| 15 | Contact (Supplier/Customer) (§9.5) | FR-SUP-01..04 | — | — | — |
| 16 | Business Management & Settings (§9.6) | FR-BIZ-01..05 | BR-10 | — | — |
| 17 | HR: Roles, User Matrix, Komisi, Expense (§9.6) | FR-HRM-01..07, FR-SAL-15 | BR-11 | — | AC-11 |
| 18 | Auth & RBAC (§9.6) | FR-AUT-01..03 | BR-10, BR-11, NFR-SEC-04 | — | AC-11 |
| 19 | Akuntansi / Payment Account (§9.7) | FR-ACC-01..06 | BR-14 | — | AC-08 |
| 20 | Invoice, Barcode & Hardware (§9.8) | FR-CFG-01..05 | — | — | AC-12 |
| 21 | Scan Barcode Smartphone (§10.2) | FR-SCN-01..05, FR-SAL-02 | NFR-COMPAT-01 | UC-01 | — |
| 22 | Reporting & Analitik (§9.9) | FR-RPT-01..11 | — | — | — |
| 23 | Non-Functional (§11) | — | NFR-PERF/AVAIL/SCAL/SEC/REL/DATA/USAB/COMPAT/MAINT/PORT/LOC-* | — | — |

---

> **Dokumen pendamping:**
> - `SRS.md` — Software Requirements Specification (kebutuhan fungsional & non-fungsional ber-ID, IEEE 830).
> - `Sequence_Diagram.md` — sequence diagram (Mermaid) untuk alur-alur utama sistem (termasuk tab transaksi multi-pelanggan).
> - `Frontend.md` — UI/UX Requirement 
> - `Backend.md` — Alur-alur dll.