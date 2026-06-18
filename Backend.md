# Backend Specification
# Sistem POS Modular Berbasis Monolith

> **Versi:** 1.1 (Online Web App)
> **Stack Backend:** NestJS + TypeScript + PostgreSQL + Redis (modular monolith)
> **ORM:** Drizzle ORM (TypeScript-first, type-safe; skema per modul, satu database PostgreSQL)
> **Dokumen terkait:** `prd-pos-monolith.md`, `srs-pos-monolith.md`, `sequence-diagrams.md`, `frontend-spec-pos-monolith.md`
> **Tujuan:** Merinci modul-modul Backend, arsitektur, endpoint API, event domain, skema database, jobs, auth, dan integrasi.

---

## Daftar Isi
1. Prinsip & Arsitektur Backend
2. Daftar Modul NestJS
3. Anatomi Sebuah Modul (Layer)
4. Cross-Cutting: Auth, RBAC, Multi-Tenancy
5. Domain Events (In-Process Event Bus)
6. Background Jobs (Redis Queue)
7. WebSocket (Real-time)
8. Endpoint API per Modul
9. Skema Database (ERD per Modul)
10. Idempotency & Keandalan Transaksi
11. Struktur Folder Backend
12. Checklist Pekerjaan Backend

---

## 1. Prinsip & Arsitektur Backend

- **Modular Monolith:** satu aplikasi NestJS, banyak modul domain dengan boundary jelas.
- **In-process communication:** modul berkomunikasi via **service interface** & **Domain Events** (bukan jaringan).
- **Satu database (PostgreSQL):** transaksi **ACID** untuk operasi keuangan & stok.
- **Konsistensi:** operasi kritikal (checkout, redeem voucher, transfer stok) dibungkus DB transaction.
- **Siap migrasi microservices:** modul tidak mengakses tabel modul lain langsung; lewat service/event.
- **Layered:** Controller -> Service (use-case) -> Domain -> Repository (data).

```
NestJS App (main.ts)
 ├── ApiModule (global): Auth, Guards, Interceptors, Filters, RateLimit
 ├── CoreModule: EventBus, JobQueue, Drizzle ORM, Config, Logger
 └── Domain Modules (Bagian 2)
```

---

## 2. Daftar Modul NestJS

| Modul NestJS | Tanggung Jawab | Dependensi utama |
|---|---|---|
| `AuthModule` | Login, JWT, refresh, RBAC | Users |
| `BusinessModule` | Multi-business, lokasi/warehouse, settings, invoice/barcode/devices | - |
| `UserModule` (HRM) | User, roles, permissions, user matrix, commission agent, payroll, expense | Auth, Business |
| `ProductModule` (Inventory/Catalog) | Produk single/variable, brand, kategori, unit, pajak, SKU, IMEI/Serial/Lot, expiry, label, CSV | Business |
| `StockModule` | Stok per lokasi, adjustment, transfer, real-time check, low-stock/expiry alert | Product, Business |
| `PricingModule` | Pricelist, selling price group, diskon bersyarat, markdown, voucher | Product, Customer |
| `CustomerModule` (CRM) | Profil, kategori, loyalty points, membership | Business |
| `SalesModule` (Checkout) | Keranjang, tab transaksi multi-pelanggan (maks 10), split payment, hold, pajak, sales return, kredit/partial, komisi | Product, Stock, Pricing, Customer, Accounting |
| `PurchaseModule` | Pembelian, terima barang, purchase return, pembayaran supplier, reminder | Product, Stock, Contact, Accounting |
| `ContactModule` | Supplier/Customer/keduanya, pay terms, payment alert, saldo hutang/piutang | Business |
| `BookingModule` | Reservasi, kalender, pre-order/Click&Collect, DP, reminder | Stock, Customer, Sales |
| `AccountingModule` | Payment account, jurnal, balance sheet, trial balance, cash flow | - |
| `CashRegisterModule` | Buka/tutup shift, kas masuk/keluar, rekonsiliasi (fraud) | Sales, Accounting |
| `ReportModule` | P&L, purchase/sell, stock, trending, tax, expense, contacts, cash register, salesperson | (read lintas modul) |

---

## 3. Anatomi Sebuah Modul (Layer)

Contoh `SalesModule`:
```
sales/
├── sales.module.ts
├── controllers/
│   └── sales.controller.ts      # REST endpoints (HTTP)
├── services/
│   ├── checkout.service.ts      # use-case: proses checkout (transaksi ACID)
│   ├── tab.service.ts           # tab transaksi multi-pelanggan (maks 10, hold/resume/park)
│   ├── hold.service.ts          # parkir tagihan
│   └── sales-return.service.ts
├── domain/
│   ├── entities/                # Sale, SaleItem, Payment, TransactionTab
│   ├── events/                  # TransactionCompleted, SalesReturned
│   └── value-objects/           # Money, TaxLine
├── repositories/
│   └── sales.repository.ts      # akses DB (Drizzle ORM)
└── dto/                         # request/response DTO + validation (class-validator)
```

**Pola:**
- **Controller** tipis: validasi DTO, panggil service.
- **Service** berisi use-case & orkestrasi (membuka DB transaction, publish event).
- **Repository** abstraksi data; tidak mengakses tabel modul lain.
- **DTO** + `class-validator` untuk validasi input.

---

## 4. Cross-Cutting: Auth, RBAC, Multi-Tenancy

### 4.1 Autentikasi
- **JWT** (access + refresh token). `AuthModule` menerbitkan & memverifikasi.
- `JwtAuthGuard` global (kecuali route publik seperti `/login`).

### 4.2 Otorisasi (RBAC)
- **Roles & Permissions** granular. Predefined: `Admin`, `Cashier`.
- `@Permissions('sale.create')` + `PermissionsGuard`.
- **User Matrix** = pemetaan user x permission (dikelola di UserModule).

### 4.3 Multi-Tenancy
- Setiap request membawa konteks **`business_id`** (dan `branch_id`) dari token/headers.
- `TenantInterceptor` menyuntik scope ke query; data tersekat antar business.
- Semua tabel transaksional punya kolom `business_id` & `location_id`.

### 4.4 Lainnya
- `ValidationPipe` global, `HttpExceptionFilter`, `LoggingInterceptor`, `RateLimit` (throttler).
- Audit trail: interceptor mencatat aksi sensitif (void, diskon manual, adjustment, redeem voucher).

---

## 5. Domain Events (In-Process Event Bus)

Memakai `@nestjs/event-emitter` (atau CQRS EventBus). Listener berjalan in-process; tugas berat didorong ke JobQueue.

| Event | Publisher | Listener -> Aksi |
|---|---|---|
| `TransactionCompleted` | Sales | Stock (potong stok), Customer (tambah poin), Accounting (posting kas masuk), Report |
| `SalesReturned` | Sales | Stock (kembalikan stok), Accounting (refund), Report |
| `PurchaseReceived` | Purchase | Stock (tambah stok + lot/expiry), Accounting (hutang/kas keluar) |
| `PurchaseReturned` | Purchase | Stock (kurangi stok), Accounting (penyesuaian hutang) |
| `StockAdjusted` | Stock | Report, Accounting (nilai kerugian opsional) |
| `StockTransferred` | Stock | Report |
| `PaymentRecorded` | Sales/Purchase/Expense | Accounting (posting akun), CashRegister |
| `ExpenseRecorded` | UserModule (HRM) | Accounting, Report |
| `VoucherRedeemed` | Pricing | Report (liability voucher) |
| `BookingCreated` / `PreOrderCreated` | Booking | Stock (hold), JobQueue (reminder) |
| `LowStockDetected` / `ExpiryNearing` | Stock | JobQueue (notifikasi alert) |

---

## 6. Background Jobs (Redis Queue)

Memakai **BullMQ** (Redis). Untuk tugas non-blocking & terjadwal.

| Queue / Job | Pemicu | Tugas |
|---|---|---|
| `payment-reminder` | Cron harian | Cek hutang supplier / piutang customer jatuh tempo -> kirim alert |
| `booking-reminder` | Saat booking dibuat / cron | Ingatkan reservasi mendatang |
| `stock-alerts` | Event/cron | Low stock & expiry nearing |
| `report-generation` | On-demand | Generate laporan berat -> file/cache |
| `loyalty-recalc` | Event | Hitung ulang poin bila perlu |

---

## 7. WebSocket (Real-time)

`@nestjs/websockets` (Socket.IO).

| Namespace/Event | Fungsi |
|---|---|
| `stock:check` | Klien subscribe stok produk -> dapat snapshot per lokasi |
| `stock:changed` | Broadcast saat stok berubah (transaksi/transfer/adjust) |
| `booking:queue` | Update antrean booking ke layar POS |

---

## 8. Endpoint API per Modul

> Konvensi: REST, prefiks `/api/v1`, autentikasi JWT, scope multi-tenant otomatis. `?filter`, `?page`, `?limit` untuk listing.

### 8.1 Auth
```
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me
```

### 8.2 Business & Settings
```
GET/POST/PATCH/DELETE  /businesses
GET/POST/PATCH/DELETE  /locations            # store front / warehouse
GET/PATCH              /settings/business     # currency, timezone, financial year, margin, pajak
GET/POST/PATCH/DELETE  /settings/invoice-templates
GET/PATCH              /settings/barcode
GET/POST/PATCH/DELETE  /settings/devices      # printer ESC/POS, scanner
```

### 8.3 Users / HRM
```
GET/POST/PATCH/DELETE  /users
GET/POST/PATCH/DELETE  /roles
GET                    /permissions
GET/PATCH              /users/{id}/matrix      # user matrix (permissions)
GET/POST/PATCH/DELETE  /commission-agents
GET/POST/PATCH/DELETE  /payroll
GET/POST/PATCH/DELETE  /expenses
```

### 8.4 Product (Inventory/Catalog)
```
GET/POST/PATCH/DELETE  /products
POST                   /products/import        # CSV
GET                    /products/by-barcode/{code}
GET/POST/PATCH/DELETE  /product-variations
GET/POST/PATCH/DELETE  /brands | /categories | /units
GET/POST/PATCH/DELETE  /taxes | /tax-groups
GET/POST/PATCH/DELETE  /selling-price-groups
POST                   /products/barcodes/print
```

### 8.5 Stock
```
GET    /stock?product&location                 # stok per lokasi
GET    /stock/alerts                            # low stock & expiry
POST   /stock/adjustments                       # increase/decrease + alasan
GET    /stock/adjustments
POST   /stock/transfers                         # buat (in_transit)
POST   /stock/transfers/{id}/receive            # completed
GET    /stock/transfers
```

### 8.6 Pricing & Voucher
```
GET    /pricing/quote                           # harga final (produk, customer)
GET/POST/PATCH/DELETE  /discounts               # conditional
GET/POST/PATCH/DELETE  /markdowns
GET/POST               /vouchers                 # generate batch
POST   /vouchers/validate                        # cek voucher
POST   /vouchers/redeem                           # tebus (atomik)
GET    /vouchers/{code}
```

### 8.7 Customer (CRM & Loyalty)
```
GET/POST/PATCH/DELETE  /customers
GET    /customers/search?q=
GET    /customers/{id}/points
POST   /customers/{id}/points/redeem
GET/POST/PATCH/DELETE  /memberships
```

### 8.8 Sales / Checkout
```
POST   /sales/cart                               # buat/update keranjang
POST   /sales/cart/hold                           # parkir
GET    /sales/cart/hold | GET /sales/cart/hold/{id} | POST .../resume
POST   /checkout/apply-voucher
POST   /checkout/apply-discount
POST   /checkout/pay                              # split payment (transaksi ACID); tutup tab terkait
POST   /checkout/from-booking/{bookingId}         # potong DP
GET    /sales | GET /sales/{id} | PATCH | DELETE
POST   /sales/{id}/return                         # sales return
GET    /sales/{id}/print
```

#### 8.8.1 Tab Transaksi (Multi-Tab Checkout)
```
GET    /sales/tabs                                # daftar tab sesi kasir aktif (maks 10)
POST   /sales/tabs                                # buka tab baru (409 bila sudah 10 tab)
GET    /sales/tabs/{id}                            # detail isi tab
PATCH  /sales/tabs/{id}                            # update keranjang/pelanggan/label tab
POST   /sales/tabs/{id}/hold                       # tandai tab On Hold (state dipersist ke DB)
POST   /sales/tabs/{id}/resume                      # aktifkan kembali tab On Hold
POST   /sales/tabs/{id}/park                        # turunkan tab -> parkir tagihan (held_cart)
DELETE /sales/tabs/{id}                             # tutup tab (butuh konfirmasi bila masih ada item)
```

### 8.9 Purchase
```
GET/POST/PATCH/DELETE  /purchases
POST   /purchases/{id}/return
POST   /purchases/{id}/payments                  # kredit/partial
GET    /purchases/{id}/print
POST   /purchases/{id}/documents                 # upload dokumen
```

### 8.10 Contact
```
GET/POST/PATCH/DELETE  /contacts                  # supplier/customer/both
GET    /contacts/{id}/ledger                       # hutang/piutang
GET    /contacts/{id}/transactions
POST   /contacts/{id}/payments
```

### 8.11 Booking
```
GET/POST/PATCH/DELETE  /bookings
GET    /bookings/calendar
POST   /preorders                                 # dari sistem eksternal
POST   /preorders/{id}/collect
POST   /bookings/{id}/deposit                     # DP
```

### 8.12 Accounting (Payment Account)
```
GET/POST/PATCH/DELETE  /accounts                  # list account
GET    /accounts/{id}/report                       # mutasi & saldo
GET    /accounting/balance-sheet
GET    /accounting/trial-balance
GET    /accounting/cash-flow
```

### 8.13 Cash Register
```
POST   /register/open                             # saldo awal
POST   /register/cash-in | /register/cash-out
POST   /register/close                            # rekonsiliasi (selisih)
GET    /register/current | GET /register/history
```

### 8.14 Reports
```
GET    /reports/profit-loss
GET    /reports/purchase-sell
GET    /reports/stock
GET    /reports/trending
GET    /reports/tax
GET    /reports/expense
GET    /reports/contacts
GET    /reports/cash-register
GET    /reports/salesperson
```

---

## 9. Skema Database (ERD per Modul)

> Notasi ringkas. Semua tabel transaksional memiliki `business_id` (multi-business) dan umumnya `location_id`. Audit: `created_at`, `updated_at`, `created_by`.

### 9.1 Business & Settings
```
business(id, name, currency, timezone, financial_year_start, profit_margin, tax_number, ...)
location(id, business_id, name, type[store|warehouse], address, ...)
invoice_template(id, business_id, name, layout_json, is_default)
barcode_setting(id, business_id, label_size, columns, symbology, fields_json)
device(id, business_id, location_id, type[printer|scanner], config_json)
```

### 9.2 Users / HRM
```
user(id, business_id, name, email, password_hash, status)
role(id, business_id, name, is_predefined)
permission(id, code, description)
role_permission(role_id, permission_id)
user_role(user_id, role_id)
user_location(user_id, location_id)            # assign lokasi
commission_agent(id, business_id, user_id, rate)
payroll(id, business_id, user_id, period, amount, ...)
expense(id, business_id, location_id, category, amount, account_id, date, note)
```

### 9.3 Product / Catalog
```
brand(id, business_id, name)
category(id, business_id, name, parent_id)
unit(id, business_id, name, short_name)
tax(id, business_id, name, rate)
tax_group(id, business_id, name)              tax_group_item(tax_group_id, tax_id)
product(id, business_id, name, type[single|variable], brand_id, category_id, unit_id,
        tax_id|tax_group_id, manage_stock[bool], has_expiry[bool], sku, barcode)
product_variation(id, product_id, name, sku, attributes_json)
selling_price_group(id, business_id, name)
product_price(id, product_id|variation_id, price_group_id, price)
```

### 9.4 Stock
```
stock(id, business_id, location_id, product_id|variation_id, qty, qty_held)
stock_serial(id, stock_id, imei_serial, lot_number, expiry_date)   # IMEI/Serial/Lot
stock_adjustment(id, business_id, location_id, type[increase|decrease], reason,
                 recovery_amount, created_by, created_at)
stock_adjustment_item(adjustment_id, product_id|variation_id, qty)
stock_transfer(id, business_id, from_location_id, to_location_id,
               status[in_transit|completed], shipping_charge, created_at, received_at)
stock_transfer_item(transfer_id, product_id|variation_id, qty)
```

### 9.5 Pricing & Voucher
```
discount(id, business_id, type[buyXgetY|percent_2nd|min_purchase|...], config_json,
         start_date, end_date, active)
markdown(id, business_id, product_id, rule[hour|expiry], config_json)
voucher(id, business_id, code[unik], type[fixed|percent], value, max_discount,
        min_purchase, branch_scope, product_scope, start_date, expiry_date,
        status[active|redeemed|expired|void], is_stackable, batch_id, created_at)
voucher_redemption(id, voucher_id[UNIQUE], transaction_id, branch_id, cashier_id,
        amount_used, redeemed_at)
```

### 9.6 Customer / CRM
```
customer(id, business_id, name, phone, email, category[retail|grosir|...], price_group_id)
loyalty_account(id, customer_id, points_balance)
loyalty_transaction(id, customer_id, type[earn|redeem], points, sale_id, created_at)
membership(id, business_id, name, rules_json)
```

### 9.7 Sales
```
sale(id, business_id, location_id, customer_id, cashier_id, commission_agent_id,
     subtotal, tax_total, discount_total, shipping, grand_total,
     paid_total, status[paid|partial|credit|held], shift_id, created_at, idempotency_key[unik])
sale_item(id, sale_id, product_id|variation_id, qty, unit_price, discount, tax, line_total,
          imei_serial, lot_number)
sale_payment(id, sale_id, method[cash|qris|card|cheque|transfer|voucher|points],
             amount, account_id, ref)
sales_return(id, sale_id, business_id, reason, refund_method, refund_amount, created_at)
sales_return_item(return_id, sale_item_id, qty)

# Tab transaksi multi-pelanggan (maks 10 tab aktif per sesi kasir/shift)
transaction_tab(id, business_id, location_id, shift_id, cashier_id, customer_id,
        tab_index[1..10], label, status[active|on_hold], cart_json, item_count,
        subtotal_amount, created_at, updated_at, held_at)
  # UNIQUE(shift_id, tab_index) ; jumlah baris per shift dibatasi <= 10 (app-level)

# Parkir tagihan jangka panjang / lintas sesi (melengkapi tab)
held_cart(id, business_id, location_id, cashier_id, customer_id, cart_json,
        source_tab_id[nullable], created_at)
```

### 9.8 Purchase
```
purchase(id, business_id, location_id, supplier_id, subtotal, tax_total, discount,
         shipping, grand_total, paid_total, status[paid|partial|credit], document_url, created_at)
purchase_item(id, purchase_id, product_id|variation_id, qty, cost, tax, lot_number, expiry_date)
purchase_payment(id, purchase_id, method, amount, account_id, paid_at)
purchase_return(id, purchase_id, business_id, reason, amount, created_at)
purchase_return_item(return_id, purchase_item_id, qty)
```

### 9.9 Contact
```
contact(id, business_id, type[supplier|customer|both], name, phone, email,
        pay_term_days, credit_limit, opening_balance)
contact_ledger(id, contact_id, ref_type[sale|purchase|payment], ref_id,
        debit, credit, balance, created_at)
```

### 9.10 Booking
```
booking(id, business_id, location_id, customer_id, type[table|staff|slot],
        resource_id, start_time, end_time, status[confirmed|collected|cancelled], dp_amount)
preorder(id, business_id, location_id, customer_id, source[external|pos],
         pickup_code, status[reserved|collected|cancelled], created_at)
preorder_item(preorder_id, product_id|variation_id, qty)   # stok di-hold
```

### 9.11 Accounting
```
account(id, business_id, name, type[cash|bank|ewallet|...], opening_balance, balance)
journal_entry(id, business_id, ref_type, ref_id, date, memo)
journal_line(id, journal_entry_id, account_id, debit, credit)
```

### 9.12 Cash Register
```
shift(id, business_id, location_id, cashier_id, opening_balance, closing_counted,
      system_cash, difference, status[open|closed], opened_at, closed_at)
cash_movement(id, shift_id, type[in|out|sale|refund|expense], amount, ref, created_at)
```

> **Catatan integritas penting:**
> - `voucher_redemption.voucher_id` = **UNIQUE** -> jaminan voucher single-use.
> - `sale.idempotency_key` = **UNIQUE** -> mencegah transaksi dobel saat retry jaringan.
> - `transaction_tab` = **UNIQUE(shift_id, tab_index)**; jumlah tab aktif per shift **dibatasi maksimal 10** (divalidasi di service layer). Tab dapat **diturunkan (park)** menjadi `held_cart` dan `held_cart` dapat **diangkat (resume)** menjadi tab baru.
> - Operasi checkout, redeem voucher, stock transfer, purchase receive -> dibungkus **DB transaction**.

---

## 10. Idempotency & Keandalan Transaksi

- Setiap permintaan transaksi (mis. `POST /checkout/pay`) menyertakan **`idempotencyKey`** unik per transaksi pada header/body.
- Server menyimpan `sale.idempotency_key` (UNIQUE). Bila request dikirim ulang (retry akibat timeout/kegagalan jaringan), server **mengembalikan hasil transaksi yang sudah ada** alih-alih membuat duplikat.
- Operasi kritikal (checkout, redeem voucher, stock transfer, purchase receive) dibungkus **DB transaction**; bila gagal -> rollback penuh.
- Voucher divalidasi & di-redeem **online secara atomik** (lock baris + UNIQUE `voucher_redemption.voucher_id`) sehingga tidak ada pemakaian ganda walau ada request bersamaan (race condition).
- Frontend menerapkan UX retry yang jelas saat koneksi terganggu, mengandalkan idempotency agar aman mengirim ulang.

---

## 11. Struktur Folder Backend (usulan)

```
src/
├── main.ts
├── app.module.ts
├── core/                        # EventBus, JobQueue, Drizzle (db client), Config, Logger
├── common/                      # Guards, Interceptors, Filters, Decorators (@Permissions)
├── modules/
│   ├── auth/
│   ├── business/
│   ├── users/                   # HRM (users, roles, agents, payroll, expense)
│   ├── products/                # catalog
│   ├── stock/
│   ├── pricing/                 # + voucher
│   ├── customers/               # CRM & loyalty
│   ├── sales/                   # checkout
│   ├── purchases/
│   ├── contacts/
│   ├── booking/
│   ├── accounting/
│   ├── cash-register/
│   └── reports/
├── events/                      # definisi event lintas modul (kontrak)
└── db/                          # Drizzle: schema per modul (*.schema.ts), migrations, db client
    ├── schema/                  # definisi tabel Drizzle (pgTable) per modul
    ├── migrations/              # output drizzle-kit (SQL migrations)
    └── index.ts                 # inisialisasi drizzle(client) + export `db`
```

---

## 12. Checklist Pekerjaan Backend

**Fondasi**
- [ ] Setup NestJS + TypeScript + Drizzle ORM (+ drizzle-kit migrations) + PostgreSQL + Redis
- [ ] Core: EventEmitter/EventBus, BullMQ, Config, Logger
- [ ] Common: ValidationPipe, ExceptionFilter, LoggingInterceptor, RateLimit
- [ ] AuthModule (JWT, refresh) + JwtAuthGuard
- [ ] RBAC: roles, permissions, @Permissions + PermissionsGuard, user matrix
- [ ] Multi-tenancy: TenantInterceptor (business_id/location_id)

**Modul Domain**
- [x] BusinessModule (business, locations, settings, invoice/barcode/devices)
- [ ] UserModule/HRM (users, roles, agents, payroll, expense)
- [x] ProductModule (produk single/variable, master, SKU, CSV, label)
- [x] StockModule (stok per lokasi, serial/lot, adjustment, transfer, alerts)
- [x] PricingModule (pricelist, price group, diskon, markdown, voucher + redeem atomik)
- [x] CustomerModule (CRM, loyalty points, membership)
- [x] SalesModule (cart, tab transaksi multi-pelanggan [maks 10, hold/resume/park], split payment, checkout ACID, sales return, komisi)
- [x] PurchaseModule (purchase, return, payments, reminder, dokumen)
- [x] ContactModule (supplier/customer, ledger hutang/piutang, payments)
- [ ] BookingModule (reservasi, kalender, pre-order, DP)
- [ ] AccountingModule (accounts, journal, balance sheet, trial balance, cash flow)
- [x] CashRegisterModule (open/close shift, rekonsiliasi/fraud)
- [ ] ReportModule (semua laporan + filter)
- [x] Idempotency transaksi (idempotency_key UNIQUE pada checkout & operasi tulis kritikal)

**Lintas Modul**
- [ ] Domain events (Bagian 5) + listener
- [ ] Background jobs (Bagian 6): reminder, alerts, report-gen, loyalty-recalc
- [ ] WebSocket gateway (stock check/changed, booking queue)
- [ ] Audit trail aksi sensitif
- [ ] Seed data (predefined roles Admin & Cashier, akun kas default)