# Sequence Diagrams — FULL
# Sistem POS Modular Berbasis Monolith
 
> **Versi:** 2.0 (Full, Consolidated)
> Mengacu pada: `srs-pos-monolith.md` (v2.0), `prd-pos-monolith.md` (v2.0), `backend-spec-pos-monolith.md`
> Notasi: Mermaid `sequenceDiagram` (dapat dirender langsung di GitHub/editor Markdown)
>
> Komponen yang terlibat (modul dalam monolith):
> - **POS PWA** : front-end kasir (offline-first) | **Admin Dashboard** : back-office
> - **API Layer** : pengganti API Gateway (auth, routing, RBAC)
> - **Auth** : autentikasi & otorisasi | **Business** : multi-business & settings
> - **Sales** : Checkout | **Pricing** : Promotion & Voucher | **Inventory** : stok & katalog
> - **Customer** : CRM & Loyalty | **Booking** : reservasi & DP | **Purchasing** : pembelian
> - **Contact** : supplier/customer | **HRM** : staf/expense/komisi | **Accounting** : payment account
> - **CashControl** : shift/kas | **Reporting** : laporan
> - **EventBus** : Domain Events in-process | **JobQueue** : Redis background queue
> - **WS** : WebSocket Gateway | **DB** : PostgreSQL | **IDB** : IndexedDB
 
---
 
## Daftar Isi
 
**A. Autentikasi & Konteks**
1. Login & RBAC
2. Pemilihan Business / Lokasi (Tenant Context)
 
**B. Penjualan & Kasir**
3. Checkout Split Payment + Voucher
4. Validasi & Redemption Voucher (anti pemakaian ganda)
5. Put On Hold (Parkir Tagihan)
6. Cash Control: Buka & Tutup Shift
7. Penjualan Kredit/Partial + Payment Reminder
8. Sales Return
9. Penjualan dengan Commission Agent
10. Cetak Struk ESC/POS + Cash Drawer
 
**C. Loyalty, Promo & Voucher**
11. Loyalty Points: Perolehan & Penukaran
12. Penerapan Diskon Bersyarat & Price Markdown
13. Generate Voucher Batch (Admin)
 
**D. Produk & Stok**
14. Buat Produk Variable & Import CSV
15. Cetak Barcode & Label
16. Real-time Stock Checking Antar Cabang
17. Stock Adjustment
18. Stock Transfer (In Transit -> Completed)
19. Alert Low Stock & Expiry (Background Job)
 
**E. Pembelian & Kontak**
20. Pembelian (Purchase) & Penerimaan Stok
21. Purchase Return
22. Pembayaran Supplier & Contact Ledger
 
**F. Booking**
23. Reservasi Meja/Staf + Pemantauan Kalender
24. Pre-Order / Click & Collect (Stock Hold)
25. Booking dengan Deposit (DP) & Pelunasan
 
**G. Scan & Offline**
26. Scan Barcode via Smartphone (Opsi A)
27. Sinkronisasi Transaksi Offline
 
**H. Keuangan & Laporan**
28. Pencatatan Pengeluaran (Expense)
29. Posting ke Payment Account & Cash Flow
30. Generate Laporan (Background Job)
 
**I. Administrasi Pengguna**
31. Manajemen User, Role & Permission (User Matrix)
 
---
 
# A. Autentikasi & Konteks
 
## 1. Login & RBAC
 
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant PWA as POS PWA / Admin
    participant API as API Layer
    participant AUT as Auth
    participant DB as PostgreSQL
 
    User->>PWA: Input email & password
    PWA->>API: POST /auth/login
    API->>AUT: validateCredentials(email, password)
    AUT->>DB: SELECT user + roles + permissions
    alt Kredensial valid
        AUT->>AUT: buat access + refresh token (JWT)
        AUT-->>PWA: 200 {accessToken, refreshToken, permissions}
        PWA->>PWA: simpan token + render menu sesuai permission
    else Tidak valid
        AUT-->>PWA: 401 Unauthorized
    end
 
    Note over PWA,API: Request berikutnya
    PWA->>API: GET /resource (Authorization: Bearer)
    API->>AUT: verifyToken + PermissionsGuard
    alt Token & izin OK
        API-->>PWA: 200 data
    else Token expired
        PWA->>API: POST /auth/refresh
        API-->>PWA: token baru
    else Tanpa izin
        API-->>PWA: 403 Forbidden
    end
```
 
---
 
## 2. Pemilihan Business / Lokasi (Tenant Context)
 
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant PWA as POS PWA / Admin
    participant API as API Layer
    participant BIZ as Business
    participant DB as PostgreSQL
 
    User->>PWA: Pilih business & lokasi aktif
    PWA->>API: POST /context {businessId, locationId}
    API->>BIZ: setContext(businessId, locationId)
    BIZ->>DB: validasi user berhak atas business/lokasi
    alt Berhak
        BIZ-->>PWA: konteks aktif (disisipkan ke token/headers)
        Note over PWA,API: TenantInterceptor menyaring query by business_id
    else Tidak berhak
        BIZ-->>PWA: 403 akses lokasi ditolak
    end
```
 
---
 
# B. Penjualan & Kasir
 
## 3. Checkout dengan Split Payment + Voucher
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant API as API Layer
    participant SAL as Sales
    participant PRC as Pricing
    participant INV as Inventory
    participant CUS as Customer
    participant BUS as EventBus
    participant DB as PostgreSQL
 
    Kasir->>PWA: Scan/tambah item ke keranjang
    PWA->>API: POST /cart/items
    API->>SAL: addItem(cart, product)
    SAL->>PRC: getFinalPrice(item, customer)
    PRC->>DB: ambil pricelist & promo
    PRC-->>SAL: harga final + diskon
    SAL-->>PWA: keranjang terupdate (subtotal, pajak, total)
 
    Kasir->>PWA: Masukkan voucher (scan/ketik)
    PWA->>API: POST /checkout/apply-voucher
    API->>PRC: validateVoucher(code, cart, branch)
    PRC->>DB: cek status=active, expiry, min_purchase
    alt Voucher valid
        PRC-->>SAL: potongan voucher (komponen pembayaran)
        SAL-->>PWA: total setelah voucher
    else Voucher invalid/expired/terpakai
        PRC-->>PWA: tolak (alasan)
    end
 
    Kasir->>PWA: Bayar (Voucher + QRIS + Tunai)
    PWA->>API: POST /checkout/pay (split payment)
    API->>SAL: processPayment(payments[])
    SAL->>DB: BEGIN TRANSACTION
    SAL->>PRC: redeemVoucher(code) [atomik]
    PRC->>DB: insert voucher_redemption (UNIQUE voucher_id)
    PRC->>DB: update voucher.status = redeemed
    SAL->>DB: simpan transaksi + detail pembayaran
    SAL->>DB: COMMIT
    SAL->>BUS: publish TransactionCompleted
    BUS-->>INV: potong stok
    BUS-->>CUS: tambah loyalty points
    BUS-->>SAL: cetak struk
    SAL-->>PWA: transaksi sukses + struk
    PWA-->>Kasir: Tampilkan struk & kembalian
```
 
---
 
## 4. Validasi & Redemption Voucher (Anti Pemakaian Ganda)
 
```mermaid
sequenceDiagram
    autonumber
    participant PWA as POS PWA
    participant API as API Layer
    participant PRC as Pricing
    participant DB as PostgreSQL
 
    PWA->>API: POST /voucher/validate {code}
    API->>PRC: validateVoucher(code)
    PRC->>DB: SELECT voucher WHERE code=?
    alt Tidak ditemukan / status != active / expired
        PRC-->>PWA: 400 Voucher tidak berlaku
    else Valid
        PRC->>PRC: cek min_purchase, branch_scope, is_stackable
        PRC-->>PWA: 200 voucher OK (nilai potongan)
    end
 
    Note over PWA,DB: Saat pembayaran final
    PWA->>API: POST /voucher/redeem {code, transactionId}
    API->>PRC: redeemVoucher(code, txId)
    PRC->>DB: BEGIN
    PRC->>DB: SELECT ... FOR UPDATE (lock baris voucher)
    alt Masih active
        PRC->>DB: INSERT voucher_redemption (UNIQUE voucher_id)
        PRC->>DB: UPDATE voucher SET status=redeemed
        PRC->>DB: COMMIT
        PRC-->>API: sukses
    else Sudah redeemed (race)
        PRC->>DB: ROLLBACK
        PRC-->>API: 409 Voucher sudah dipakai
    end
```
 
---
 
## 5. Put On Hold (Parkir Tagihan)
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant API as API Layer
    participant SAL as Sales
    participant DB as PostgreSQL
 
    Kasir->>PWA: Klik "Hold" untuk Pelanggan A
    PWA->>API: POST /cart/hold {cartA}
    API->>SAL: holdCart(cartA)
    SAL->>DB: simpan cart status=on_hold
    SAL-->>PWA: cartA tertahan (ticket #A)
 
    Kasir->>PWA: Buat transaksi baru Pelanggan B
    PWA->>PWA: keranjang baru (cartB)
    Note over Kasir,PWA: Layani & selesaikan Pelanggan B
 
    Kasir->>PWA: Resume ticket #A
    PWA->>API: GET /cart/hold/A
    API->>SAL: resumeCart(A)
    SAL->>DB: ambil cartA (status=active)
    SAL-->>PWA: cartA dipulihkan
    Kasir->>PWA: Lanjutkan pembayaran A
```
 
---
 
## 6. Cash Control: Buka & Tutup Shift (Deteksi Fraud)
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant API as API Layer
    participant CSH as CashControl
    participant DB as PostgreSQL
 
    Kasir->>PWA: Buka shift + saldo awal (Rp200.000)
    PWA->>API: POST /shift/open {openingBalance}
    API->>CSH: openShift(kasir, 200000)
    CSH->>DB: simpan shift (status=open)
    CSH-->>PWA: shift dibuka
 
    Note over Kasir,DB: Selama shift: semua kas tunai dicatat
 
    Kasir->>PWA: Tutup shift + input kas fisik
    PWA->>API: POST /shift/close {countedCash}
    API->>CSH: closeShift(shiftId, countedCash)
    CSH->>DB: hitung kas sistem (saldo awal + penjualan tunai - refund)
    CSH->>CSH: selisih = countedCash - kasSistem
    alt selisih == 0
        CSH-->>PWA: shift seimbang
    else selisih != 0
        CSH->>DB: catat selisih (flag audit/fraud)
        CSH-->>PWA: PERINGATAN selisih kas
    end
```
 
---
 
## 7. Penjualan Kredit / Partial + Payment Reminder
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant API as API Layer
    participant SAL as Sales
    participant CON as Contact
    participant JOB as JobQueue
    participant DB as PostgreSQL
    actor Pelanggan
 
    Kasir->>PWA: Checkout, pilih bayar sebagian (Partial)
    PWA->>API: POST /checkout/pay {paid < total, term}
    API->>SAL: processPayment(partial)
    SAL->>DB: simpan transaksi (status=partially_paid)
    SAL->>CON: catat piutang + pay terms (jatuh tempo)
    CON->>DB: simpan saldo piutang pelanggan
    SAL-->>PWA: struk (tertera sisa & jatuh tempo)
 
    Note over JOB,DB: Penjadwalan reminder (background)
    JOB->>DB: cek piutang mendekati/lewat jatuh tempo
    JOB-->>Pelanggan: kirim payment alert (notifikasi/email)
 
    Note over Pelanggan,DB: Pelunasan kemudian
    Pelanggan->>PWA: Bayar sisa tagihan
    PWA->>API: POST /contacts/{id}/payments
    API->>CON: recordPayment(amount)
    CON->>DB: update piutang (lunas/berkurang)
    CON-->>PWA: kuitansi pembayaran
```
 
---
 
## 8. Sales Return (Retur Penjualan)
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant API as API Layer
    participant SAL as Sales
    participant INV as Inventory
    participant CSH as CashControl
    participant BUS as EventBus
    participant DB as PostgreSQL
 
    Kasir->>PWA: Pilih transaksi & item yang diretur
    PWA->>API: POST /sales/{id}/return
    API->>SAL: createSalesReturn(items, reason)
    SAL->>DB: BEGIN
    SAL->>INV: kembalikan stok item retur
    INV->>DB: tambah stok lokasi
    SAL->>CSH: proses refund (tunai/kredit nota)
    CSH->>DB: catat kas keluar / store credit
    SAL->>DB: simpan sales_return + relasi transaksi asal
    SAL->>DB: COMMIT
    SAL->>BUS: publish SalesReturned (update laporan)
    SAL-->>PWA: retur sukses + bukti retur
```
 
---
 
## 9. Penjualan dengan Commission Agent
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant API as API Layer
    participant SAL as Sales
    participant HRM as HR & Staff
    participant BUS as EventBus
    participant DB as PostgreSQL
 
    Kasir->>PWA: Pilih commission agent pada transaksi
    PWA->>API: POST /checkout/pay {commissionAgentId}
    API->>SAL: processPayment(... , agentId)
    SAL->>DB: simpan transaksi + agentId
    SAL->>BUS: publish TransactionCompleted {agentId, total}
    BUS-->>HRM: hitung komisi agent
    HRM->>DB: akumulasi komisi (utk laporan/payout)
    SAL-->>PWA: transaksi sukses
    Note over HRM,DB: Commission Agent Report (FR-RPT-10) membaca akumulasi ini
```
 
---
 
## 10. Cetak Struk ESC/POS + Cash Drawer
 
```mermaid
sequenceDiagram
    autonumber
    participant SAL as Sales
    participant PWA as POS PWA
    participant CFG as Business/Settings
    participant PRN as Thermal Printer (ESC/POS)
 
    SAL-->>PWA: transaksi sukses (data struk)
    PWA->>CFG: ambil invoice template + device config
    CFG-->>PWA: layout + target printer
    PWA->>PWA: render struk -> perintah ESC/POS
    PWA->>PRN: kirim via WebUSB/WebBluetooth/bridge
    alt Pembayaran tunai
        PWA->>PRN: perintah kick-out (buka cash drawer)
    end
    PRN-->>PWA: status cetak
    alt Printer tidak terjangkau
        PWA-->>PWA: peringatan + opsi cetak ulang
    end
```
 
---
 
# C. Loyalty, Promo & Voucher
 
## 11. Loyalty Points: Perolehan & Penukaran
 
```mermaid
sequenceDiagram
    autonumber
    participant SAL as Sales
    participant BUS as EventBus
    participant CUS as Customer
    participant DB as PostgreSQL
    actor Kasir
    participant PWA as POS PWA
 
    Note over SAL,DB: Perolehan poin (setelah transaksi)
    SAL->>BUS: TransactionCompleted {customerId, total}
    BUS-->>CUS: addPoints(total)
    CUS->>CUS: poin = floor(total / 10000)
    CUS->>DB: update saldo poin pelanggan
 
    Note over Kasir,DB: Penukaran poin di transaksi berikut
    Kasir->>PWA: Tukar poin jadi potongan
    PWA->>CUS: redeemPoints(customerId, jumlah)
    CUS->>DB: cek saldo poin >= jumlah
    alt Cukup
        CUS->>DB: kurangi poin
        CUS-->>PWA: nilai potongan diterapkan
    else Tidak cukup
        CUS-->>PWA: tolak penukaran
    end
```
 
---
 
## 12. Penerapan Diskon Bersyarat & Price Markdown
 
```mermaid
sequenceDiagram
    autonumber
    participant SAL as Sales
    participant PRC as Pricing
    participant DB as PostgreSQL
 
    SAL->>PRC: getFinalPrice(cart, customer, now)
    PRC->>DB: ambil pricelist + price group customer
    PRC->>DB: ambil diskon bersyarat aktif & markdown
    PRC->>PRC: evaluasi rule (Beli 2 Gratis 1, diskon barang ke-2, min belanja)
    PRC->>PRC: cek markdown (jam/Happy Hour, mendekati expiry)
    alt Markdown aktif
        PRC->>PRC: turunkan harga otomatis
    end
    PRC-->>SAL: harga final per item + diskon teragregasi
    Note over PRC,SAL: Stacking dengan voucher hanya bila is_stackable=true
```
 
---
 
## 13. Generate Voucher Batch (Admin)
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant PRC as Pricing
    participant DB as PostgreSQL
 
    Admin->>WEB: Buat batch voucher (jenis, nilai, jumlah, masa berlaku, scope)
    WEB->>API: POST /vouchers {batchConfig, count}
    API->>PRC: generateBatch(config, count)
    loop sejumlah count
        PRC->>PRC: generate kode unik
        PRC->>DB: INSERT voucher (status=active, batch_id)
    end
    PRC-->>WEB: daftar kode + QR siap cetak
    Admin->>WEB: Cetak voucher fisik (kode/QR)
    Note over PRC,DB: code UNIQUE; siap divalidasi di kasir (lihat #4)
```
 
---
 
# D. Produk & Stok
 
## 14. Buat Produk Variable & Import CSV
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant PRD as Product
    participant DB as PostgreSQL
 
    Note over Admin,DB: A. Produk variable
    Admin->>WEB: Buat produk variable (atribut: ukuran/warna)
    WEB->>API: POST /products {type=variable, variations[]}
    API->>PRD: createProduct + variations
    PRD->>PRD: generate SKU (auto) bila kosong
    PRD->>DB: simpan product + product_variation + harga per price group
    PRD-->>WEB: produk tersimpan
 
    Note over Admin,DB: B. Import massal CSV
    Admin->>WEB: Upload file CSV produk
    WEB->>API: POST /products/import (file)
    API->>PRD: parseAndValidate(rows)
    alt Semua baris valid
        PRD->>DB: bulk insert produk
        PRD-->>WEB: ringkasan: N produk diimpor
    else Ada baris invalid
        PRD-->>WEB: laporan error per baris (lewati/koreksi)
    end
```
 
---
 
## 15. Cetak Barcode & Label
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant PRD as Product
    participant CFG as Business/Settings
    participant DB as PostgreSQL
 
    Admin->>WEB: Pilih produk & jumlah label
    WEB->>API: POST /products/barcodes/print {items}
    API->>CFG: ambil barcode setting (ukuran, simbologi, field)
    CFG->>DB: SELECT barcode_setting
    API->>PRD: render label (nama, harga, SKU, barcode)
    PRD-->>WEB: lembar label siap cetak (PDF/preview)
    Admin->>WEB: Cetak ke printer label
```
 
---
 
## 16. Real-time Stock Checking Antar Cabang
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant WS as WebSocket Gateway
    participant INV as Inventory
    participant DB as PostgreSQL
 
    Kasir->>PWA: Cek stok produk X di cabang lain
    PWA->>WS: subscribe stock:productX
    WS->>INV: getStockAllBranches(X)
    INV->>DB: SELECT stok WHERE product=X GROUP BY branch
    INV-->>WS: stok per cabang/gudang
    WS-->>PWA: push data stok real-time
 
    Note over INV,WS: Saat ada transaksi di cabang manapun
    INV->>WS: emit stockChanged(X, branch)
    WS-->>PWA: update stok otomatis (live)
```
 
---
 
## 17. Stock Adjustment (Penyesuaian Stok)
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant INV as Inventory
    participant BUS as EventBus
    participant DB as PostgreSQL
 
    Admin->>WEB: Buat adjustment (item, qty, tipe, alasan)
    WEB->>API: POST /stock-adjustments
    API->>INV: createAdjustment(items, type, reason)
    INV->>DB: BEGIN
    alt Increase
        INV->>DB: tambah stok lokasi
    else Decrease
        INV->>DB: kurangi stok lokasi (cegah negatif)
    end
    INV->>DB: catat adjustment + alasan + user (audit)
    INV->>DB: catat nilai kerugian (opsional)
    INV->>DB: COMMIT
    INV->>BUS: publish StockAdjusted (update laporan stok)
    INV-->>WEB: adjustment tersimpan
```
 
---
 
## 18. Stock Transfer Antar Lokasi (In Transit -> Completed)
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant INV as Inventory
    participant DB as PostgreSQL
 
    Admin->>WEB: Buat transfer (lokasi asal, tujuan, item, qty)
    WEB->>API: POST /stock-transfers
    API->>INV: createTransfer(from, to, items)
    INV->>DB: BEGIN
    INV->>DB: kurangi stok lokasi asal
    INV->>DB: simpan transfer (status=in_transit)
    INV->>DB: COMMIT
    INV-->>WEB: transfer dibuat (In Transit)
 
    Note over Admin,DB: Barang tiba di lokasi tujuan
    Admin->>WEB: Konfirmasi penerimaan
    WEB->>API: POST /stock-transfers/{id}/receive
    API->>INV: receiveTransfer(id)
    INV->>DB: BEGIN
    INV->>DB: tambah stok lokasi tujuan
    INV->>DB: update transfer (status=completed)
    INV->>DB: COMMIT
    INV-->>WEB: transfer selesai (Completed)
```
 
---
 
## 19. Alert Low Stock & Expiry (Background Job)
 
```mermaid
sequenceDiagram
    autonumber
    participant CRON as Scheduler
    participant JOB as JobQueue
    participant INV as Inventory
    participant BUS as EventBus
    participant DB as PostgreSQL
    actor Admin
 
    CRON->>JOB: jalankan job stock-alerts (harian)
    JOB->>INV: scanThresholds()
    INV->>DB: cari stok <= reorder_level
    INV->>DB: cari produk mendekati expiry_date
    alt Ada item terdeteksi
        INV->>BUS: publish LowStockDetected / ExpiryNearing
        BUS-->>Admin: notifikasi (dashboard/email)
    end
    INV-->>JOB: selesai
```
 
---
 
# E. Pembelian & Kontak
 
## 20. Pembelian (Purchase) & Penerimaan Stok
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant PUR as Purchasing
    participant CON as Contact
    participant INV as Inventory
    participant BUS as EventBus
    participant DB as PostgreSQL
 
    Admin->>WEB: Buat purchase (pilih supplier, item, lot, expiry)
    WEB->>API: POST /purchases
    API->>CON: cek supplier & pay terms
    CON-->>API: data supplier
    API->>PUR: createPurchase(items, taxes, discount, shipping)
    PUR->>DB: BEGIN
    PUR->>DB: simpan purchase (status=received)
    PUR->>BUS: publish PurchaseReceived
    BUS-->>INV: tambah stok (lot & expiry) per lokasi
    INV->>DB: update stok + catat lot/expiry
    PUR->>DB: catat hutang (Credit/Partial) bila belum lunas
    PUR->>DB: COMMIT
    PUR-->>WEB: purchase tersimpan + dokumen terlampir
    Note over PUR,DB: Job terjadwal -> payment reminder bila jatuh tempo
```
 
---
 
## 21. Purchase Return (Retur ke Supplier)
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant PUR as Purchasing
    participant INV as Inventory
    participant DB as PostgreSQL
 
    Admin->>WEB: Buat purchase return (pilih purchase & item)
    WEB->>API: POST /purchases/{id}/return
    API->>PUR: createReturn(items)
    PUR->>DB: BEGIN
    PUR->>INV: kurangi stok (barang keluar/retur)
    INV->>DB: update stok lokasi
    PUR->>DB: sesuaikan saldo hutang / catat kredit nota
    PUR->>DB: COMMIT
    PUR-->>WEB: retur tercatat + penyesuaian hutang
```
 
---
 
## 22. Pembayaran Supplier & Contact Ledger
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant CON as Contact
    participant ACC as Accounting
    participant BUS as EventBus
    participant DB as PostgreSQL
 
    Admin->>WEB: Bayar hutang supplier (pilih purchase)
    WEB->>API: POST /contacts/{id}/payments {amount, accountId}
    API->>CON: recordPayment(supplierId, amount)
    CON->>DB: BEGIN
    CON->>DB: kurangi saldo hutang (contact_ledger)
    CON->>BUS: publish PaymentMade {accountId, amount}
    BUS-->>ACC: posting kas keluar (update saldo akun)
    ACC->>DB: jurnal + saldo akun
    CON->>DB: COMMIT
    CON-->>WEB: pembayaran tercatat + sisa hutang
```
 
---
 
# F. Booking
 
## 23. Reservasi Meja/Staf + Pemantauan Kalender
 
```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan
    participant CH as Kanal (PWA/Eksternal)
    participant API as API Layer
    participant BOK as Booking
    participant WS as WebSocket Gateway
    participant DB as PostgreSQL
    actor Kasir
    participant PWA as POS PWA
 
    Pelanggan->>CH: Pilih meja/staf + slot waktu
    CH->>API: POST /bookings {resource, startTime, endTime}
    API->>BOK: createBooking(...)
    BOK->>DB: cek bentrok slot
    alt Slot tersedia
        BOK->>DB: simpan booking (status=confirmed)
        BOK->>WS: emit booking:queue (update)
        WS-->>PWA: antrean booking ter-update (live)
        BOK-->>CH: booking terkonfirmasi
    else Bentrok
        BOK-->>CH: slot tidak tersedia
    end
 
    Kasir->>PWA: Buka UI Kalender Booking
    PWA->>API: GET /bookings/calendar
    API->>BOK: getCalendar(range)
    BOK-->>PWA: daftar reservasi (tampilan kalender)
```
 
---
 
## 24. Pre-Order / Click & Collect dengan Stock Hold (dari Sistem Eksternal)
 
```mermaid
sequenceDiagram
    autonumber
    participant EXT as Aplikasi Eksternal
    participant API as API Layer
    participant BOK as Booking
    participant INV as Inventory
    participant BUS as EventBus
    participant DB as PostgreSQL
    actor Kasir
    participant PWA as POS PWA
 
    EXT->>API: POST /preorder {items, pickupTime}
    API->>BOK: createPreOrder(payload)
    BOK->>INV: holdStock(items)
    INV->>DB: kurangi available, tambah held
    INV-->>BOK: stok ditahan
    BOK->>DB: simpan pre-order (status=reserved)
    BOK->>BUS: publish PreOrderCreated
    BOK-->>EXT: konfirmasi + kode pickup (QR)
 
    Note over Kasir,PWA: Saat pelanggan datang ambil
    Kasir->>PWA: Scan QR pickup
    PWA->>API: POST /preorder/collect {code}
    API->>BOK: collect(code)
    BOK->>INV: convertHoldToSale(items)
    INV->>DB: kurangi held (stok keluar)
    BOK-->>PWA: pesanan siap diproses checkout
```
 
---
 
## 25. Booking dengan Deposit (DP) & Pelunasan
 
```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan
    participant PWA as POS PWA
    participant API as API Layer
    participant BOK as Booking
    participant CSH as CashControl
    participant SAL as Sales
    participant DB as PostgreSQL
 
    Pelanggan->>PWA: Buat reservasi + bayar DP
    PWA->>API: POST /booking {slot, dpAmount}
    API->>BOK: createBooking(slot, dp)
    BOK->>CSH: catatDP(dpAmount)
    CSH->>DB: simpan kas masuk (DP)
    BOK->>DB: simpan booking (status=confirmed, dp=dpAmount)
    BOK-->>PWA: booking terkonfirmasi
 
    Note over Pelanggan,DB: Saat hari-H / pelunasan
    Pelanggan->>PWA: Checkout pesanan booking
    PWA->>API: POST /checkout/from-booking {bookingId}
    API->>SAL: buildCart(bookingId)
    SAL->>BOK: getDeposit(bookingId)
    BOK-->>SAL: dpAmount
    SAL->>SAL: total tagihan - DP = sisa bayar
    SAL-->>PWA: tampilkan sisa tagihan
    Pelanggan->>PWA: Bayar sisa
    PWA->>API: POST /checkout/pay
    API->>SAL: processPayment()
    SAL->>DB: simpan transaksi (DP + pelunasan)
    SAL-->>PWA: lunas + struk
```
 
---
 
# G. Scan & Offline
 
## 26. Scan Barcode via Smartphone (Opsi A - Kamera In-App PWA)
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant CAM as Kamera HP
    participant PWA as POS PWA
    participant DET as BarcodeDetector / ZXing
    participant API as API Layer
    participant INV as Inventory
 
    Kasir->>PWA: Buka mode scan
    PWA->>CAM: getUserMedia (minta izin kamera)
    alt Izin diberikan
        CAM-->>PWA: stream video
        PWA->>DET: decode frame
        DET-->>PWA: kode barcode terdeteksi
        PWA->>PWA: beep + highlight (umpan balik)
        PWA->>API: GET /product/by-barcode/{code}
        API->>INV: lookup(code)
        INV-->>PWA: data produk
        PWA-->>Kasir: produk masuk keranjang
    else Izin ditolak / kamera tidak ada
        PWA-->>Kasir: fallback input manual kode
    end
```
 
---
 
## 27. Sinkronisasi Transaksi Offline (Offline-First)
 
```mermaid
sequenceDiagram
    autonumber
    actor Kasir
    participant PWA as POS PWA
    participant IDB as IndexedDB
    participant SW as Service Worker
    participant API as API Layer
    participant SAL as Sales
    participant PRC as Pricing
    participant DB as PostgreSQL
 
    Note over Kasir,IDB: Kondisi OFFLINE
    Kasir->>PWA: Lakukan transaksi (termasuk voucher)
    PWA->>IDB: simpan transaksi (status=pending)
    PWA->>IDB: tandai voucher = pending_validation
    PWA-->>Kasir: struk sementara
 
    Note over SW,DB: Koneksi pulih -> ONLINE
    SW->>IDB: ambil transaksi pending
    SW->>API: POST /sync/transactions {batch, idempotencyKey}
    API->>SAL: syncTransactions(batch)
    SAL->>DB: cek idempotencyKey (hindari dobel)
    SAL->>PRC: verifikasi voucher (final)
    alt Voucher masih valid
        PRC->>DB: redeem voucher
        SAL->>DB: simpan transaksi (committed)
        SAL-->>SW: sukses
        SW->>IDB: tandai transaksi synced
    else Voucher sudah terpakai di tempat lain (konflik)
        PRC-->>SAL: konflik voucher
        SAL-->>SW: 409 konflik
        SW->>IDB: tandai transaksi conflict (review manual)
    end
```
 
---
 
# H. Keuangan & Laporan
 
## 28. Pencatatan Pengeluaran (Expense Management)
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant HRM as HR & Staff
    participant CSH as CashControl
    participant BUS as EventBus
    participant DB as PostgreSQL
 
    Admin->>WEB: Input expense (kategori, jumlah, lokasi)
    WEB->>API: POST /expenses
    API->>HRM: createExpense(category, amount, location)
    HRM->>DB: BEGIN
    HRM->>DB: simpan expense
    HRM->>CSH: catat kas keluar (bila tunai)
    CSH->>DB: update mutasi kas/register
    HRM->>DB: COMMIT
    HRM->>BUS: publish ExpenseRecorded (update P&L)
    HRM-->>WEB: expense tercatat
```
 
---
 
## 29. Posting Pembayaran ke Payment Account & Cash Flow
 
```mermaid
sequenceDiagram
    autonumber
    participant SAL as Sales
    participant PUR as Purchasing
    participant HRM as HR (Expense)
    participant BUS as EventBus
    participant ACC as Accounting
    participant DB as PostgreSQL
    actor Admin
    participant WEB as Admin Dashboard
 
    Note over SAL,ACC: Setiap transaksi memicu posting ke akun
    SAL->>BUS: PaymentReceived {accountId, amount}
    PUR->>BUS: PaymentMade {accountId, amount}
    HRM->>BUS: ExpenseRecorded {accountId, amount}
    BUS-->>ACC: postEntry(account, debit/kredit)
    ACC->>DB: catat jurnal + update saldo akun
 
    Note over Admin,DB: Lihat laporan keuangan
    Admin->>WEB: Buka Balance Sheet / Trial Balance / Cash Flow
    WEB->>ACC: getReport(type, period)
    ACC->>DB: agregasi saldo & mutasi akun
    ACC-->>WEB: Balance Sheet / Trial Balance / Cash Flow / Payment Account Report
```
 
---
 
## 30. Generate Laporan (Background Job)
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant RPT as Reporting
    participant JOB as JobQueue
    participant DB as PostgreSQL
 
    Admin->>WEB: Minta laporan (jenis, filter, periode)
    WEB->>API: GET /reports/{type}?filter
    alt Laporan ringan
        API->>RPT: query langsung
        RPT->>DB: agregasi data
        RPT-->>WEB: hasil + chart
    else Laporan berat
        API->>JOB: enqueue report-generation
        API-->>WEB: 202 (diproses), tampilkan progres
        JOB->>RPT: build report
        RPT->>DB: agregasi (read replica)
        RPT-->>JOB: file/cache siap
        JOB-->>WEB: notifikasi selesai + unduhan
    end
```
 
---
 
# I. Administrasi Pengguna
 
## 31. Manajemen User, Role & Permission (User Matrix)
 
```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant WEB as Admin Dashboard
    participant API as API Layer
    participant HRM as HR & Staff
    participant DB as PostgreSQL
 
    Admin->>WEB: Buka User Matrix (user x permission)
    WEB->>API: GET /users/{id}/matrix
    API->>HRM: getMatrix(userId)
    HRM->>DB: ambil roles, permissions, lokasi user
    HRM-->>WEB: matriks izin tercentang
 
    Admin->>WEB: Ubah role/permission + assign lokasi
    WEB->>API: PATCH /users/{id}/matrix {roles, permissions, locations}
    API->>HRM: updateMatrix(...)
    HRM->>DB: BEGIN
    HRM->>DB: update user_role, role_permission, user_location
    HRM->>DB: COMMIT
    HRM-->>WEB: izin diperbarui
    Note over HRM,WEB: Predefined roles (Admin & Cashier) tidak dapat dihapus
```
 