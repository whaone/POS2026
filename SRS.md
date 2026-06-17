 
# Software Requirements Specification (SRS) — FULL
# Sistem POS Modular Berbasis Monolith
 
> **Versi:** 2.0 (Full)
> **Mengacu pada:** `prd-pos-monolith.md` (v2.0), `frontend-spec-pos-monolith.md`, `backend-spec-pos-monolith.md`, `sequence-diagrams.md`
> **Standar acuan:** IEEE 830
> **Stack:** SvelteKit (PWA) + NestJS (TypeScript) + PostgreSQL + Redis
 
---
 
## Daftar Isi
1. Pendahuluan
2. Deskripsi Umum
3. Kebutuhan Fungsional (per Modul)
4. Use Case Rinci (Alur Utama)
5. Business Rules (Aturan Bisnis)
6. Kebutuhan Antarmuka Eksternal
7. Kebutuhan Data (Logical Model & Data Dictionary)
8. Penanganan Error & Validasi
9. Kebutuhan Non-Fungsional
10. Acceptance Criteria (Kriteria Penerimaan)
11. Matriks Ketertelusuran
12. Lampiran: Glosarium & State Diagram
 
---
 
## 1. Pendahuluan
 
### 1.1 Tujuan
Dokumen ini mendefinisikan kebutuhan perangkat lunak (fungsional & non-fungsional) untuk **Sistem POS Modular Berbasis Monolith** secara lengkap. Ditujukan untuk pengembang, arsitek, QA, manajer proyek, dan pemangku kepentingan bisnis sebagai acuan implementasi, pengujian, dan validasi.
 
### 1.2 Ruang Lingkup Produk
Sistem **Point of Sale (POS)** berbasis web (PWA) dengan arsitektur **Modular Monolith**. Mencakup:
- Operasi kasir offline-first (transaksi, parkir tagihan, split payment, cash control).
- Inventory multi-cabang & real-time stock + manajemen produk lanjutan (single/variable, unit, brand, group tax, SKU, IMEI/Serial/Lot, expiry, label, import CSV).
- CRM, loyalty points, dan promo engine.
- Voucher fisik single-use.
- Booking/reservasi, pre-order, deposit (DP).
- Scan barcode via kamera smartphone.
- Business management (multi-business, lokasi/warehouse, currency/timezone/financial year/pajak).
- Pembelian (purchasing) + purchase return & pembayaran supplier.
- Manajemen kontak (supplier & customer) dengan pay terms & payment alert.
- Manajemen staf (roles & permissions, user matrix, commission agent, gaji, expense).
- Penjualan lanjutan (sales return, kredit/partial, multi metode bayar, keyboard shortcut).
- Manajemen stok lanjutan (stock adjustment & transfer antar lokasi).
- Akuntansi / payment account (list account, balance sheet, trial balance, cash flow).
- Pengaturan & hardware (invoice layout, barcode setting, scanner & thermal printer ESC/POS).
- Reporting & analitik lengkap dengan filter & chart.
 
### 1.3 Definisi, Akronim, Singkatan
| Istilah | Penjelasan |
|---|---|
| POS | Point of Sale |
| PWA | Progressive Web App |
| SRS | Software Requirements Specification |
| DP | Down Payment / uang muka |
| Split Payment | Pembayaran dengan beberapa metode dalam satu transaksi |
| Put On Hold | Parkir tagihan (menahan transaksi sementara) |
| Voucher | Kupon fisik bernilai yang mengurangi nilai belanja |
| Domain Event | Event internal in-process antar modul |
| QRIS | Quick Response Code Indonesian Standard |
| Idempotent | Operasi yang aman diulang tanpa efek ganda |
| RBAC | Role-Based Access Control |
| HID | Human Interface Device (mode input keyboard untuk scanner) |
| ESC/POS | Protokol perintah printer thermal |
| SKU | Stock Keeping Unit |
| ACID | Atomicity, Consistency, Isolation, Durability |
| Tenant | Konteks isolasi data per Business |
 
### 1.4 Referensi
- `prd-pos-monolith.md` (PRD v2.0 Consolidated Final)
- `frontend-spec-pos-monolith.md`, `backend-spec-pos-monolith.md`, `sequence-diagrams.md`
- IEEE Std 830-1998
 
### 1.5 Gambaran Umum Dokumen
Bagian 2 deskripsi umum; Bagian 3 kebutuhan fungsional ber-ID; Bagian 4 use case rinci; Bagian 5 business rules; Bagian 6 antarmuka eksternal; Bagian 7 kebutuhan data; Bagian 8 penanganan error; Bagian 9 NFR; Bagian 10 acceptance criteria; Bagian 11 traceability; Bagian 12 lampiran.
 
---
 
## 2. Deskripsi Umum
 
### 2.1 Perspektif Produk
Aplikasi tunggal (monolith) dengan modul domain internal yang dipisah rapi. Front-end PWA berkomunikasi ke backend via REST/WebSocket melalui satu API Layer (pengganti API Gateway). Komunikasi antar-modul in-process melalui Domain Events; tugas berat lewat background job queue (Redis).
 
### 2.2 Fungsi Utama Produk
- Transaksi penjualan & checkout (split payment, voucher, pajak, sales return, kredit/partial).
- Parkir tagihan (multi-transaksi paralel).
- Cash control per shift.
- Manajemen produk & stok multi-gudang/cabang (single/variable, SKU, IMEI/Serial/Lot, expiry, label, CSV, adjustment, transfer).
- CRM, loyalty, pricelist, selling price group & diskon bersyarat.
- Voucher fisik single-use.
- Booking/reservasi, pre-order, DP.
- Scan barcode via smartphone.
- Business management (multi-business, lokasi/warehouse, currency/timezone/financial year/pajak).
- Pembelian + purchase return & pembayaran supplier.
- Manajemen kontak (supplier/customer) + pay terms & payment alert.
- Manajemen staf (roles & permissions, user matrix, commission agent, gaji, expense).
- Akuntansi (payment account, balance sheet, trial balance, cash flow).
- Pengaturan & hardware (invoice layout, barcode setting, scanner, thermal ESC/POS).
- Reporting & analitik lengkap.
 
### 2.3 Karakteristik Pengguna (User Classes)
| Aktor | Deskripsi | Hak Akses Utama |
|---|---|---|
| Kasir | Operator transaksi di toko | Buka/tutup shift, transaksi, parkir tagihan, voucher, scan |
| Supervisor / Manajer Toko | Pengawas cabang | Approval void/diskon, laporan cabang, kelola shift |
| Admin / Owner | Pemilik multi-cabang | Kelola produk, harga, promo, voucher, multi-branch, laporan global, akuntansi |
| Staf Gudang | Pengelola stok gudang/cabang | Stock adjustment, transfer antar lokasi, terima pembelian |
| Pelanggan | Konsumen | (Tidak langsung) terdaftar di CRM, booking eksternal |
| Supplier | Pemasok barang | (Tidak langsung) terkait pembelian, hutang & pay terms |
| Commission Agent / Salesperson | Agen/staf berkomisi | Ditautkan ke penjualan untuk perhitungan komisi |
| Sistem Eksternal | Aplikasi pihak ketiga | Kirim data booking/pre-order via API |
 
### 2.4 Lingkungan Operasi
- Front-end: browser modern (Chrome/Edge/Safari) di tablet, PC, smartphone; mode kiosk.
- Backend: Node.js (NestJS) di server Linux; PostgreSQL; Redis.
- Jaringan: online & offline (PWA offline-first dengan IndexedDB).
 
### 2.5 Batasan Desain & Implementasi
- Akses kamera/WebUSB (scan & print) wajib **HTTPS**.
- Satu database relasional utama (PostgreSQL) — konsistensi **ACID**.
- Modul tidak boleh mengakses tabel modul lain langsung (jaga boundary).
- TypeScript end-to-end; shared types FE<->BE.
 
### 2.6 Asumsi & Ketergantungan
- Perangkat kasir memiliki kamera untuk scan smartphone (Opsi A).
- Gateway pembayaran (QRIS/Kartu) tersedia via integrasi pihak ketiga.
- Saat offline, validasi voucher final dilakukan ketika kembali online.
- Tersedia Redis untuk cache & job queue.
 
---
 
## 3. Kebutuhan Fungsional (per Modul)
 
> Notasi ID: `FR-<MODUL>-<nomor>`. Prioritas: H (High), M (Medium), L (Low).
 
### 3.1 Modul Sales / Checkout
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-SAL-01 | Menampilkan keranjang & menghitung subtotal, pajak, total real-time. | H |
| FR-SAL-02 | Menambah item via scan barcode atau input manual. | H |
| FR-SAL-03 | Mendukung **split payment** (Tunai, QRIS, Kartu, Cheque, Bank Transfer, Voucher) dalam satu transaksi. | H |
| FR-SAL-04 | **Put On Hold**: menahan transaksi aktif, buat transaksi baru, lalu lanjutkan yang tertahan. | H |
| FR-SAL-05 | Menghitung pajak sesuai konfigurasi (mis. PPN) per item/transaksi. | H |
| FR-SAL-06 | Menerbitkan struk (cetak/digital) setelah transaksi sukses. | H |
| FR-SAL-07 | Mem-publish event `TransactionCompleted` (potong stok, poin, posting akun, laporan). | H |
| FR-SAL-08 | Menolak pembayaran bila total dibayar kurang dari tagihan (kecuali parkir/DP/kredit). | H |
| FR-SAL-09 | Transaksi **idempotent** terhadap retry saat sinkronisasi offline. | H |
| FR-SAL-10 | **Sales Return** dengan penyesuaian stok & kas otomatis. | H |
| FR-SAL-11 | Penjualan **Credit/Paid/Partially Paid** dan pencatatan piutang. | H |
| FR-SAL-12 | Metode bayar **Cash, Credit Card, Cheque, Bank Transfer** (selain QRIS & Voucher). | H |
| FR-SAL-13 | POS **fully-AJAX** + **keyboard shortcuts**. | M |
| FR-SAL-14 | **Walk-In / Quick Add Customer** dari layar POS. | M |
| FR-SAL-15 | Menetapkan **commission agent** per transaksi. | M |
| FR-SAL-16 | Mendukung **Discounts & Shipping Charges** pada penjualan. | M |
| FR-SAL-17 | Operasi **Edit, Delete, View, Print** transaksi (dengan kontrol akses). | M |
 
### 3.2 Modul Cash Control (Shift)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-CSH-01 | Kasir memasukkan **saldo awal modal** saat buka shift. | H |
| FR-CSH-02 | Mencatat semua mutasi kas (penjualan tunai, DP, refund, expense). | H |
| FR-CSH-03 | Saat tutup shift, menghitung **kas sistem vs fisik** & menampilkan selisih (fraud). | H |
| FR-CSH-04 | Menyimpan riwayat shift untuk audit. | M |
 
### 3.3 Modul Inventory & Catalog
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-INV-01 | Mengelola produk (CRUD), kategori, barcode. | H |
| FR-INV-02 | Memotong stok otomatis saat `TransactionCompleted`. | H |
| FR-INV-03 | Mendukung stok multi-gudang/multi-cabang. | H |
| FR-INV-04 | Cek stok cabang/gudang lain **real-time** (WebSocket). | H |
| FR-INV-05 | **Stock hold** untuk pre-order/booking. | H |
| FR-INV-06 | Mencegah stok negatif & lock baris saat update konkuren. | H |
 
### 3.4 Modul Customer (CRM & Loyalty)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-CRM-01 | Mendaftar/mencari pelanggan dari layar POS. | H |
| FR-CRM-02 | Menambah loyalty points otomatis (mis. 1 poin/Rp10.000). | H |
| FR-CRM-03 | Menukar poin sebagai potongan harga transaksi berikutnya. | H |
| FR-CRM-04 | Kategori pelanggan (Grosir/Retail) untuk pricelist. | H |
 
### 3.5 Modul Pricing & Promotion (termasuk Voucher)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-PRC-01 | Menentukan harga final berdasarkan pricelist & kategori pelanggan. | H |
| FR-PRC-02 | Diskon bersyarat (Beli 2 Gratis 1, diskon barang kedua, min. belanja). | H |
| FR-PRC-03 | Price markdown otomatis (jam/Happy Hour, mendekati kedaluwarsa). | M |
| FR-PRC-04 | Validasi **voucher fisik**: keaslian, status `active`, masa berlaku, min. belanja, scope. | H |
| FR-PRC-05 | Voucher **single-use**; setelah dipakai status `redeemed` permanen (UNIQUE di DB). | H |
| FR-PRC-06 | Voucher dapat **digabung dengan metode pembayaran lain** (split payment). | H |
| FR-PRC-07 | Penggabungan voucher dengan promo lain via flag `is_stackable` (default false). | M |
| FR-PRC-08 | Redemption voucher **atomik** (mencegah pemakaian ganda/race condition). | H |
 
### 3.6 Modul Booking & Scheduling
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-BOK-01 | Membuat reservasi meja/staf/slot waktu. | H |
| FR-BOK-02 | Memantau antrean booking & UI kalender dari layar POS. | H |
| FR-BOK-03 | Pre-order/Click & Collect dari aplikasi eksternal via API. | H |
| FR-BOK-04 | Menahan stok pre-order hingga diambil/dibatalkan. | H |
| FR-BOK-05 | Mencatat **DP** & memotong total tagihan dengan DP saat pelunasan. | H |
| FR-BOK-06 | Mengirim reminder booking (background job). | M |
 
### 3.7 Modul Reporting & Analytics
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-RPT-01 | Dashboard penjualan & laba-rugi. | H |
| FR-RPT-02 | Analisis performa produk (Fast/Slow Moving). | M |
| FR-RPT-03 | Performa penjualan per kasir (salesperson analytics). | M |
| FR-RPT-04 | Laporan redemption & liability voucher beredar. | M |
| FR-RPT-05 | Laporan multi-cabang difilter per cabang/periode. | M |
| FR-RPT-06 | **Profit & Loss Report**. | H |
| FR-RPT-07 | **Purchase & Sell Report** dan **Stock Reports**. | H |
| FR-RPT-08 | **Tax Report** dan **Expenses Report**. | M |
| FR-RPT-09 | **Supplier & Customer Report** dan **Cash Register Report**. | M |
| FR-RPT-10 | **Commission Agent / Salesperson Report**. | M |
| FR-RPT-11 | Semua laporan mendukung **filter, chart, ekspor**. | M |
 
### 3.8 Modul Scan Barcode (Smartphone - Opsi A)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-SCN-01 | Mengakses kamera (getUserMedia) untuk memindai barcode 1D/2D. | H |
| FR-SCN-02 | Decode via BarcodeDetector API dengan fallback ZXing-js. | H |
| FR-SCN-03 | Hasil scan diteruskan ke modul terkait (Inventory/Checkout/Voucher/Booking). | H |
| FR-SCN-04 | Input manual fallback bila kamera tidak tersedia/ditolak. | H |
| FR-SCN-05 | Umpan balik visual & audio saat scan berhasil. | M |
 
### 3.9 Modul Offline & Sinkronisasi
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-OFF-01 | POS beroperasi offline (transaksi, parkir tagihan) via IndexedDB. | H |
| FR-OFF-02 | Menyinkronkan transaksi offline saat koneksi pulih. | H |
| FR-OFF-03 | Sinkronisasi idempotent & menangani konflik (voucher terpakai di tempat lain). | H |
| FR-OFF-04 | Voucher offline ditandai "pending" & diverifikasi ulang saat sync. | H |
 
### 3.10 Modul Autentikasi & Otorisasi
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-AUT-01 | Autentikasi pengguna (JWT/OAuth2) via API Layer. | H |
| FR-AUT-02 | RBAC (kasir/supervisor/admin) granular. | H |
| FR-AUT-03 | Aksi sensitif (void, diskon manual) memerlukan approval supervisor. | M |
 
### 3.11 Modul Manajemen Produk Lanjutan
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-PRD-01 | Produk **single & variable** (varian). | H |
| FR-PRD-02 | **Enable/disable stock management** per produk. | M |
| FR-PRD-03 | Mengelola **Brand, Category, Unit, Tax Rate & Group Taxes**. | H |
| FR-PRD-04 | **Produk dengan expiry** + **alert expiry & low-stock**. | H |
| FR-PRD-05 | **SKU predefined atau auto-generate**. | M |
| FR-PRD-06 | Pelacakan **IMEI/Serial Number** & **Lot Number**. | M |
| FR-PRD-07 | **Cetak barcode & label** produk. | M |
| FR-PRD-08 | **Selling Price Group** (beberapa daftar harga jual). | M |
| FR-PRD-09 | **Import produk via CSV**. | M |
 
### 3.12 Modul Pembelian (Purchasing)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-PUR-01 | **Add, Edit, Delete, View, Print** pembelian. | H |
| FR-PUR-02 | **Purchase Return** + penyesuaian stok & hutang. | H |
| FR-PUR-03 | Status **Credit, Paid, Partially Paid** + multiple payment. | H |
| FR-PUR-04 | **Payment reminder** hutang supplier (background job). | M |
| FR-PUR-05 | **Taxes, Discounts, Shipping Charges** pada pembelian. | M |
| FR-PUR-06 | Menyimpan **Lot Number & Expiry** saat penerimaan. | H |
| FR-PUR-07 | **Upload dokumen** pembelian. | L |
| FR-PUR-08 | **Quick Add Product** dari layar pembelian. | M |
| FR-PUR-09 | Penerimaan menambah stok via event/transaksi ACID. | H |
 
### 3.13 Modul Kontak (Supplier & Customer)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-SUP-01 | Kontak sebagai **Supplier, Customer, atau keduanya**. | H |
| FR-SUP-02 | **Pay Terms** & **Payment Alerts** (jatuh tempo). | M |
| FR-SUP-03 | Detail pembayaran (rekening, tempo, limit kredit). | M |
| FR-SUP-04 | **Riwayat transaksi beli & jual** per kontak. | M |
 
### 3.14 Modul Business Management & Settings
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-BIZ-01 | **Multiple Business** dalam satu instalasi. | H |
| FR-BIZ-02 | **Lokasi**: store front & **warehouse** + transfer stok antar lokasi. | H |
| FR-BIZ-03 | **Currency, Time Zone, Financial Year** per bisnis. | H |
| FR-BIZ-04 | **Profit margin default** & **detail registrasi pajak** (Tax ID). | M |
| FR-BIZ-05 | Pengaturan tersekat per bisnis (data isolation). | H |
 
### 3.15 Modul Staf, Peran & Pengeluaran (HR)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-HRM-01 | **User management lanjutan** + **Permissions & Roles** granular. | H |
| FR-HRM-02 | **Predefined Roles** (Admin & Cashier) + role kustom. | M |
| FR-HRM-03 | **Assign lokasi** ke role/user + **cashier per lokasi**. | H |
| FR-HRM-04 | **Commission agent** & perhitungan komisi. | M |
| FR-HRM-05 | **Staff Salary** (gaji). | L |
| FR-HRM-06 | **Expense Management** terhubung kas & laporan. | M |
| FR-HRM-07 | **User Matrix** (matriks izin user x role/permission). | M |
 
### 3.16 Modul Manajemen Stok Lanjutan (Adjustment & Transfer)
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-STK-01 | **Stock Adjustment** (Increase/Decrease) + **alasan wajib**. | H |
| FR-STK-02 | Mencatat **nilai kerugian** (opsional) pada adjustment. | L |
| FR-STK-03 | **Stock Transfer** antar lokasi, status **In Transit -> Completed**. | H |
| FR-STK-04 | Transfer mengurangi stok asal & menambah tujuan secara **ACID**. | H |
| FR-STK-05 | Transfer mendukung **shipping charges** opsional. | L |
| FR-STK-06 | Semua adjustment & transfer tercatat untuk **audit**. | H |
 
### 3.17 Modul Akuntansi & Payment Account
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-ACC-01 | Mengelola daftar **Payment Account** (kas/bank/e-wallet). | H |
| FR-ACC-02 | Pembayaran ditautkan ke akun & memperbarui saldo otomatis. | H |
| FR-ACC-03 | **Balance Sheet**. | M |
| FR-ACC-04 | **Trial Balance**. | M |
| FR-ACC-05 | **Cash Flow** per periode. | M |
| FR-ACC-06 | **Payment Account Report** (mutasi & saldo). | M |
 
### 3.18 Modul Pengaturan: Invoice, Barcode & Hardware
| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-CFG-01 | **Fully Customizable Invoice Layout** multi-template. | M |
| FR-CFG-02 | **Barcode Setting** (format label, simbologi EAN-13/Code128). | M |
| FR-CFG-03 | Dukungan **barcode scanner USB/Bluetooth (HID)**. | H |
| FR-CFG-04 | Cetak ke **thermal printer ESC/POS** (USB/jaringan/Bluetooth). | H |
| FR-CFG-05 | Membuka **cash drawer** via kick-out printer saat transaksi tunai. | M |
 
---
 
## 4. Use Case Rinci (Alur Utama)
 
> Format: Aktor, Prakondisi, Alur Utama, Alur Alternatif/Exception, Pascakondisi. Lihat juga `sequence-diagrams.md`.
 
### UC-01: Checkout dengan Split Payment + Voucher
- **Aktor:** Kasir
- **Prakondisi:** Shift terbuka; produk ada di keranjang; user punya izin `sale.create`.
- **Alur Utama:**
  1. Kasir menambah item (scan/manual); sistem menghitung harga sesuai pricelist pelanggan (FR-PRC-01).
  2. Kasir memasukkan voucher; sistem memvalidasi (FR-PRC-04).
  3. Kasir memilih split payment (Voucher + QRIS + Tunai) (FR-SAL-03).
  4. Sistem membuka DB transaction: redeem voucher atomik (FR-PRC-08), simpan transaksi, COMMIT.
  5. Publish `TransactionCompleted` -> potong stok, tambah poin, posting kas (FR-SAL-07).
  6. Cetak struk + buka cash drawer (FR-SAL-06, FR-CFG-05).
- **Alur Alternatif:**
  - 2a. Voucher invalid/expired/terpakai -> tampilkan alasan, lanjut tanpa voucher.
  - 3a. Total bayar < tagihan -> tolak (FR-SAL-08), kecuali kredit/DP.
  - Offline -> simpan ke IndexedDB (FR-OFF-01), voucher `pending` (FR-OFF-04).
- **Pascakondisi:** Stok berkurang, poin bertambah, kas tercatat, voucher `redeemed`.
 
### UC-02: Put On Hold & Resume
- **Aktor:** Kasir
- **Prakondisi:** Ada keranjang aktif.
- **Alur:** Kasir Hold cart A -> sistem simpan `held_cart` -> layani B -> Resume A (FR-SAL-04).
- **Pascakondisi:** Cart A pulih utuh.
 
### UC-03: Tutup Shift & Rekonsiliasi Kas
- **Aktor:** Kasir/Supervisor
- **Prakondisi:** Shift terbuka.
- **Alur:** Input kas fisik -> sistem hitung kas sistem -> selisih dihitung (FR-CSH-03).
- **Exception:** Selisih != 0 -> flag audit, perlu catatan.
- **Pascakondisi:** Shift `closed`, riwayat tersimpan.
 
### UC-04: Penerimaan Pembelian (Purchase)
- **Aktor:** Admin/Staf Gudang
- **Alur:** Pilih supplier & item (lot/expiry) -> simpan purchase -> `PurchaseReceived` -> stok bertambah, hutang tercatat (FR-PUR-01/06/09).
- **Pascakondisi:** Stok & hutang ter-update; reminder dijadwalkan bila kredit.
 
### UC-05: Stock Transfer Antar Lokasi
- **Aktor:** Staf Gudang
- **Alur:** Buat transfer (asal->tujuan) status `in_transit` (stok asal berkurang) -> konfirmasi terima -> `completed` (stok tujuan bertambah) (FR-STK-03/04).
- **Exception:** Stok asal tidak cukup -> tolak.
 
### UC-06: Pre-Order / Click & Collect
- **Aktor:** Sistem Eksternal, Kasir
- **Alur:** Eksternal kirim pre-order via API -> stok di-hold (FR-BOK-03/04) -> pelanggan datang -> scan QR pickup -> konversi ke checkout (potong DP, FR-BOK-05).
 
### UC-07: Sinkronisasi Transaksi Offline
- **Aktor:** Sistem (Service Worker)
- **Alur:** Koneksi pulih -> kirim batch + `idempotencyKey` -> server cek duplikat (FR-OFF-03) -> verifikasi voucher final.
- **Exception:** Voucher sudah terpakai -> 409 konflik -> tandai review.
 
### UC-08: Generate & Redeem Voucher Batch
- **Aktor:** Admin (generate), Kasir (redeem)
- **Alur:** Admin generate batch voucher (jenis/nilai/scope) -> cetak kode/QR -> kasir redeem saat checkout (single-use, atomik).
 
---
 
## 5. Business Rules (Aturan Bisnis)
| ID | Aturan |
|---|---|
| BR-01 | Loyalty points = floor(total_belanja / 10.000) poin (konfigurable per bisnis). |
| BR-02 | Voucher bersifat single-use; tidak ada sisa saldo; dijamin UNIQUE di `voucher_redemption`. |
| BR-03 | Voucher dapat digabung metode pembayaran lain; penggabungan dengan promo lain hanya bila `is_stackable=true`. |
| BR-04 | Total pembayaran harus >= total tagihan, kecuali transaksi kredit/partial atau memakai DP. |
| BR-05 | Stok tidak boleh negatif; operasi yang menyebabkan negatif ditolak. |
| BR-06 | Harga grosir < harga retail untuk produk yang sama (via price group). |
| BR-07 | Saat tutup shift, selisih kas (fisik - sistem) wajib dicatat; selisih != 0 memunculkan flag audit. |
| BR-08 | DP mengurangi total tagihan saat pelunasan booking. |
| BR-09 | Pajak dihitung per item berdasarkan tax/tax group produk. |
| BR-10 | Data tersekat per `business_id`; pengguna hanya mengakses bisnis/lokasi yang diizinkan. |
| BR-11 | Aksi sensitif (void, diskon manual, hapus transaksi) memerlukan approval/izin supervisor. |
| BR-12 | Price markdown otomatis aktif sesuai jadwal (jam/Happy Hour) atau kedekatan expiry. |
| BR-13 | Penjualan kredit menambah piutang kontak; pembelian kredit menambah hutang. |
| BR-14 | Setiap pembayaran tunai/transfer memperbarui saldo payment account terkait. |
 
---
 
## 6. Kebutuhan Antarmuka Eksternal
 
### 6.1 Antarmuka Pengguna
- POS PWA: layar transaksi, keranjang, pembayaran, parkir tagihan, kalender booking, cash register.
- Admin Dashboard: manajemen bisnis/produk/harga/promo/voucher/kontak/akuntansi, laporan multi-cabang.
- Responsif tablet/desktop/smartphone; mode kiosk & offline. (Detail menu: `frontend-spec-pos-monolith.md`.)
 
### 6.2 Antarmuka Perangkat Keras
- Kamera perangkat (scan barcode 1D/2D).
- **Barcode scanner USB/Bluetooth (HID)** sebagai input keyboard.
- Printer struk (USB/Bluetooth/jaringan), termasuk **thermal printer ESC/POS**.
- **Cash drawer** (kick-out via printer).
 
### 6.3 Antarmuka Perangkat Lunak / API
- REST API versioned (`/api/v1`) untuk CRUD & transaksi. (Daftar endpoint: `backend-spec-pos-monolith.md`.)
- WebSocket untuk real-time (cek stok, antrean booking).
- API masuk dari sistem eksternal (booking/pre-order).
- Integrasi payment gateway (QRIS/Kartu).
 
### 6.4 Antarmuka Komunikasi
- HTTPS (wajib PWA, kamera, WebUSB).
- Domain Events in-process (antar modul).
- Redis queue untuk background jobs.
 
---
 
## 7. Kebutuhan Data (Logical Model & Data Dictionary)
 
### 7.1 Entitas Utama (ringkasan)
Business, Location, User, Role, Permission, Product, ProductVariation, Stock, StockSerial, StockAdjustment, StockTransfer, Discount, Markdown, Voucher, VoucherRedemption, Customer, LoyaltyAccount, Sale, SaleItem, SalePayment, SalesReturn, HeldCart, Purchase, PurchaseItem, PurchasePayment, PurchaseReturn, Contact, ContactLedger, Booking, PreOrder, Account, JournalEntry, JournalLine, Shift, CashMovement, Expense. (Skema kolom lengkap: `backend-spec-pos-monolith.md` Bagian 9.)
 
### 7.2 Data Dictionary (atribut kunci terpilih)
| Entitas | Atribut kunci | Tipe | Catatan |
|---|---|---|---|
| Voucher | code | string unik | indexed; basis validasi |
| Voucher | status | enum(active/redeemed/expired/void) | single-use |
| VoucherRedemption | voucher_id | FK **UNIQUE** | menjamin single-use di DB |
| Sale | idempotency_key | string **UNIQUE** | anti-dobel saat sync |
| Sale | status | enum(paid/partial/credit/held) | |
| Stock | qty, qty_held | integer | qty_held untuk pre-order |
| StockTransfer | status | enum(in_transit/completed) | |
| Account | balance | decimal | diupdate via journal |
| Shift | difference | decimal | fisik - sistem (fraud) |
| Contact | type | enum(supplier/customer/both) | |
 
### 7.3 Integritas & Retensi
- Constraint UNIQUE: `voucher.code`, `voucher_redemption.voucher_id`, `sale.idempotency_key`.
- Transaksi ACID untuk: checkout, redeem voucher, stock transfer, purchase receive, sales/purchase return.
- Retensi: transaksi & jurnal disimpan minimal sesuai financial year + kebijakan audit (≥ 5 tahun disarankan).
- Audit trail: aksi sensitif menyertakan `created_by`, timestamp, alasan.
 
---
 
## 8. Penanganan Error & Validasi
| Kode | Kondisi | Respons Sistem |
|---|---|---|
| E-VAL-400 | Input DTO tidak valid | 400 + detail field (class-validator) |
| E-AUTH-401 | Token hilang/expired | 401 + minta login ulang |
| E-PERM-403 | Tidak punya permission | 403 + pesan akses ditolak |
| E-VOUCHER-409 | Voucher sudah `redeemed` (race/sync) | 409 + tolak redemption; tandai konflik |
| E-STOCK-409 | Stok tidak cukup / negatif | 409 + tolak operasi |
| E-SYNC-409 | Duplikat idempotency_key | Skip (idempotent), kembalikan status existing |
| E-PAY-422 | Total bayar < tagihan (non-kredit) | 422 + tolak pembayaran |
| E-NET-OFFLINE | Tidak ada koneksi | Mode offline: simpan lokal, tandai pending |
| E-HW-PRINT | Printer tidak terjangkau | Peringatan + opsi cetak ulang/lewati |
| E-SRV-500 | Kegagalan tak terduga | 500 + log; rollback transaksi |
 
Prinsip: validasi berlapis (frontend + backend); operasi keuangan/stok selalu dalam transaksi sehingga gagal -> rollback penuh.
 
---
 
## 9. Kebutuhan Non-Fungsional
| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-PERF-01 | Performa | Respons UI checkout < 200 ms (operasi lokal). |
| NFR-PERF-02 | Performa | Validasi voucher online < 1 detik. |
| NFR-PERF-03 | Performa | Listing/laporan dengan pagination & index; query < 2 detik untuk dataset wajar. |
| NFR-AVAIL-01 | Ketersediaan | POS fungsi inti penuh saat offline. |
| NFR-AVAIL-02 | Ketersediaan | Target uptime server ≥ 99,5%. |
| NFR-SCAL-01 | Skalabilitas | Backend horizontal (replika stateless di balik LB). |
| NFR-SCAL-02 | Skalabilitas | PostgreSQL read replica + Redis cache untuk beban baca. |
| NFR-SEC-01 | Keamanan | JWT/OAuth2, enkripsi data sensitif, HTTPS wajib. |
| NFR-SEC-02 | Keamanan | Redemption voucher atomik & anti pemakaian ganda. |
| NFR-SEC-03 | Keamanan | Audit trail untuk cash control, void, diskon, voucher, adjustment. |
| NFR-SEC-04 | Keamanan | RBAC granular & isolasi data per tenant. |
| NFR-REL-01 | Keandalan | Transaksi idempotent; tanpa double-charge saat retry/sync. |
| NFR-DATA-01 | Konsistensi | Operasi keuangan & stok memakai transaksi ACID. |
| NFR-USAB-01 | Usabilitas | UI kasir user-friendly; pelatihan kasir < 1 jam. |
| NFR-COMPAT-01 | Kompatibilitas | Browser modern; BarcodeDetector + fallback; ESC/POS. |
| NFR-MAINT-01 | Maintainability | Modular boundary; siap migrasi microservices (strangler). |
| NFR-PORT-01 | Portabilitas | PWA dapat dibungkus native (Capacitor) bila perlu. |
| NFR-LOC-01 | Lokalisasi | Mendukung mata uang, zona waktu, & format sesuai pengaturan bisnis. |
 
---
 
## 10. Acceptance Criteria (Kriteria Penerimaan)
| Ref | Kriteria Lulus |
|---|---|
| AC-01 (UC-01) | Checkout split payment + voucher menghasilkan total benar, voucher jadi `redeemed`, stok & poin ter-update, struk tercetak. |
| AC-02 (FR-PRC-05) | Voucher yang sama tidak bisa dipakai kedua kali (uji race/sync -> 409). |
| AC-03 (FR-SAL-04) | Cart yang di-hold dapat di-resume utuh setelah melayani transaksi lain. |
| AC-04 (FR-CSH-03) | Tutup shift menampilkan selisih kas akurat (fisik vs sistem). |
| AC-05 (FR-OFF-01/03) | Transaksi dibuat offline tersinkron tanpa duplikat (idempotent). |
| AC-06 (FR-STK-04) | Stock transfer: jumlah total stok lintas lokasi tetap konsisten saat transit & setelah completed. |
| AC-07 (FR-PUR-09) | Penerimaan pembelian menambah stok & mencatat hutang sesuai status pembayaran. |
| AC-08 (FR-ACC-02) | Pembayaran tunai/transfer memperbarui saldo payment account & muncul di cash flow. |
| AC-09 (FR-INV-04) | Cek stok cabang lain menampilkan angka real-time (terupdate saat ada transaksi). |
| AC-10 (FR-BOK-05) | Pelunasan booking memotong DP dari total tagihan dengan benar. |
| AC-11 (FR-AUT-02) | Menu & aksi tampil sesuai permission; akses tanpa izin ditolak (403). |
| AC-12 (FR-CFG-04) | Struk tercetak ke thermal printer ESC/POS sesuai template invoice. |
 
---
 
## 11. Matriks Ketertelusuran (PRD -> SRS)
| Fitur PRD | Kebutuhan SRS Terkait |
|---|---|
| Multi-Session & Cash Control | FR-CSH-01..04 |
| Put On Hold | FR-SAL-04 |
| Split Payment | FR-SAL-03/12, FR-PRC-06 |
| Operasional inti (scan, struk, sync) | FR-SAL-02/06, FR-SCN-*, FR-OFF-* |
| Booking & Reservasi | FR-BOK-01..02 |
| Pre-Order / Click & Collect | FR-BOK-03..04 |
| Deposit / DP | FR-BOK-05 |
| Customer Profiling | FR-CRM-01 |
| Loyalty Points | FR-CRM-02..03 |
| Pricelists & Per-Customer Discount | FR-PRC-01, FR-CRM-04 |
| Conditional Discounts | FR-PRC-02 |
| Automated Markdown | FR-PRC-03 |
| Multi-Branch | FR-INV-03, FR-RPT-05 |
| Real-time Stock Checking | FR-INV-04 |
| Product Performance | FR-RPT-02 |
| Salesperson Analytics | FR-RPT-03 |
| Voucher Fisik | FR-PRC-04..08 |
| Scan Barcode Smartphone | FR-SCN-01..05 |
| Business Management & Settings | FR-BIZ-01..05 |
| Product Management Lanjutan | FR-PRD-01..09 |
| Purchasing | FR-PUR-01..09 |
| Suppliers & Customers (Contacts) | FR-SUP-01..04 |
| Staff/Salesperson/Cashier | FR-HRM-01..07, FR-SAL-15 |
| Roles & Permissions / User Matrix | FR-HRM-01..03/07, FR-AUT-02 |
| Commission Agent | FR-HRM-04, FR-SAL-15, FR-RPT-10 |
| Staff Salary & Expense | FR-HRM-05..06, FR-RPT-08 |
| Sales Return | FR-SAL-10 |
| Kredit/Partial Sale | FR-SAL-11 |
| Metode Bayar (Cash/CC/Cheque/Bank) | FR-SAL-12 |
| Keyboard Shortcut & Fully-AJAX | FR-SAL-13 |
| Walk-In / Quick Add Customer | FR-SAL-14 |
| Laporan Lengkap | FR-RPT-06..11 |
| Stock Adjustment | FR-STK-01..02, FR-STK-06 |
| Stock Transfer | FR-STK-03..05 |
| Payment Account / Akuntansi | FR-ACC-01..06 |
| Invoice Layout / Barcode Setting | FR-CFG-01..02 |
| Barcode Scanner & Thermal ESC/POS | FR-CFG-03..05 |
 
---
 
## 12. Lampiran
 
### 12.1 Glosarium Tambahan
- **Strangler Pattern:** strategi migrasi bertahap monolith -> microservices tanpa rewrite total.
- **Optimistic UI:** UI memperbarui tampilan lebih dulu sebelum konfirmasi server (untuk kecepatan POS).
- **Outbox:** antrean transaksi offline yang menunggu sinkronisasi.
 
### 12.2 State: Voucher
```
active --(redeem sukses)--> redeemed (final)
active --(lewat expiry)---> expired
active --(dibatalkan)-----> void
```
 
### 12.3 State: Sale
```
held --(resume + bayar)--> paid
(baru) --(bayar penuh)---> paid
(baru) --(bayar sebagian)-> partial --(pelunasan)--> paid
(baru) --(tempo)---------> credit  --(pelunasan)--> paid
```
 
### 12.4 State: Stock Transfer
```
in_transit --(diterima)--> completed
```
 
### 12.5 State: Shift
```
open --(tutup + rekonsiliasi)--> closed
```
 