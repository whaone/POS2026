# docs/PLAN.md — Rencana Eksekusi & Memori Lintas-Sesi (Anti-Drift)

> **Proyek:** Sistem POS Modular Berbasis Monolith (POS2026)
> **Stack:** SvelteKit + NestJS (TypeScript) + PostgreSQL + Redis
> **Baca bersama:** `AGENTS.md` (kontrak kerja) + `SRS.md` (kebutuhan ber-ID).
>
> File ini adalah **satu-satunya sumber status pekerjaan**. Setiap agent **wajib** membaca file ini
> sebelum mulai dan **memperbaruinya** setelah setiap unit kerja. Tujuannya menjaga kontinuitas
> lintas-sesi dan mencegah drift dari spesifikasi.

---

## Cara Memakai File Ini

1. **Sebelum kerja:** baca "Status Saat Ini" + "Fase Aktif" + "Open Questions".
2. **Saat ambil tugas:** pindahkan item ke "Sedang Dikerjakan", isi ID kebutuhan + acceptance criteria.
3. **Saat selesai:** pindahkan ke "Selesai", catat tanggal, file berubah, dan keputusan penting.
4. **Saat menemukan ambiguitas:** tulis di "Open Questions" dan tanyakan user — jangan menebak.
5. **Saat spec berubah:** catat di "Spec Change Log" dengan alasan + persetujuan user.

Setiap item kerja **harus** menautkan minimal satu ID: `FR-*`, `NFR-*`, `BR-*`, atau `UC-*`.
Item tanpa ID = indikasi scope creep → jangan dikerjakan.

---

## Status Saat Ini

| Field | Nilai |
|---|---|
| Fase aktif | **Fase 3 — Back-Office & Keuangan** (lihat PRD §12) |
| Status implementasi | Fase 1 selesai 100%. Fase 2 selesai 100%. **Fase 3 siap dimulai**: booking/reservasi, pre-order, DP, akuntansi, expense & payroll, commission, laporan, kustomisasi invoice, barcode setting, dukungan thermal printer. |
| Branch kerja | `main` |
| Pemegang tugas terakhir | Agent (Phase 2 activation) |
| Update terakhir | 2026-06-18 |

---

## Peta Fase (dari PRD §12)

### Fase 1 — MVP POS Inti (SELESAI)
Auth & RBAC dasar, Business & lokasi, katalog produk dasar, checkout + split payment
(Tunai/QRIS/Kartu), cetak struk, cash control, tab transaksi (maks 10) + parkir tagihan,
scan barcode smartphone, inventory dasar + real-time stock.

### Fase 2 — Retail & Promo (SELESAI)
Voucher fisik, CRM & loyalty, pricelist & diskon bersyarat, markdown, purchasing + contact,
purchase return, payment reminder, stock adjustment & transfer, produk lanjutan (IMEI/Serial/Lot, CSV, label).

### Fase 3 — Back-Office & Keuangan  ← AKTIF
Booking/reservasi, pre-order, DP, akuntansi (payment account, balance sheet, trial balance, cash flow),
expense & payroll, commission agent, laporan lengkap + dashboard, kustomisasi invoice, barcode setting,
dukungan thermal printer ESC/POS & scanner HID.

> Jangan kerjakan item Fase 2/3 sebelum Fase 1 dinyatakan selesai, kecuali diminta user.

---

## Backlog Fase 1 (MVP) — Berbasis Kebutuhan

> Status: ⬜ belum · 🔵 dikerjakan · ✅ selesai · ⛔ blocked

### Fondasi & Infrastruktur
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-INFRA-01 | Setup NestJS + TS + Drizzle ORM (+ drizzle-kit) + PostgreSQL + Redis | Backend.md §11/§12 | ✅ |
| F1-INFRA-02 | Core: EventBus (in-process), BullMQ, Config, Logger | Backend.md §5/§6 | ✅ |
| F1-INFRA-03 | Common: ValidationPipe, HttpExceptionFilter, LoggingInterceptor, RateLimit | Backend.md §4.4, SRS §8 | ✅ |
| F1-INFRA-04 | Multi-tenancy: `TenantInterceptor` (`business_id`/`location_id`) | Backend.md §4.3, BR-10 | ✅ |
| F1-INFRA-05 | Setup SvelteKit (web app online, SSR/SPA) | PRD §7.4, Frontend.md | ✅ |
| F1-INFRA-06 | Definisikan skrip gate di package.json (`typecheck`,`lint`,`test`,`build`) + konfig Vitest/ESLint agar `quality-gate.yml` aktif | AGENTS.md §6.2 | ✅ |
| F1-INFRA-07 | Playwright E2E (fungsional, masuk gate) + visual regression opt-in; CI install chromium | AGENTS.md §6.2 | ✅ |

### Auth & RBAC
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-AUTH-01 | Login/refresh/logout/me (JWT) + `JwtAuthGuard` | FR-AUT-01, Backend §8.1 | ✅ |
| F1-AUTH-02 | RBAC granular + `@Permissions` + `PermissionsGuard` | FR-AUT-02 | ✅ |
| F1-AUTH-03 | Approval supervisor untuk aksi sensitif (void/diskon) | FR-AUT-03, BR-11 | ✅ |
| F1-AUTH-04 | Seed predefined roles (Admin, Cashier) | FR-HRM-02 | ✅ |

### Business & Lokasi
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-BIZ-01 | CRUD business + currency/timezone/financial year | FR-BIZ-01/03 | ✅ |
| F1-BIZ-02 | CRUD lokasi (store/warehouse) + isolasi data per tenant | FR-BIZ-02/05 | ✅ |

### Produk & Stok (dasar)
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-PRD-01 | CRUD produk dasar + kategori + barcode | FR-INV-01 | ✅ |
| F1-INV-01 | Stok multi-lokasi + potong stok saat `TransactionCompleted` | FR-INV-02/03 | ✅ |
| F1-INV-02 | Cegah stok negatif + lock baris konkuren | FR-INV-06, BR-05 | ✅ |
| F1-INV-03 | Real-time stock check via WebSocket | FR-INV-04, Backend §7 | ✅ |
| F1-PRD-02 | Lookup produk by-barcode | Backend §8.4 | ✅ |

### Checkout & Pembayaran
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-SAL-01 | Keranjang + hitung subtotal/pajak/total real-time | FR-SAL-01/05 | ✅ |
| F1-SAL-02 | Tambah item (scan/manual) | FR-SAL-02 | ✅ |
| F1-SAL-03 | Split payment (Tunai/QRIS/Kartu) — transaksi ACID | FR-SAL-03/12, UC-01 | ✅ |
| F1-SAL-04 | Idempotency checkout (`idempotency_key` UNIQUE) | FR-SAL-09, NFR-REL-01 | ✅ |
| F1-SAL-05 | Publish `TransactionCompleted` (stok/poin/akun/laporan) | FR-SAL-07 | ✅ |
| F1-SAL-06 | Tolak bayar < tagihan (non-kredit) | FR-SAL-08, BR-04, E-PAY-422 | ✅ |
| F1-SAL-07 | Cetak struk + buka cash drawer | FR-SAL-06 | ✅ |

### Tab Transaksi & Parkir Tagihan
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-TAB-01 | Buka/list/detail tab (maks 10, `UNIQUE(shift_id,tab_index)`) | FR-SAL-18/19, BR-15, E-TAB-409 | ✅ |
| F1-TAB-02 | Isolasi state tiap tab | FR-SAL-20 | ✅ |
| F1-TAB-03 | Hold tab (persist ke DB) + resume | FR-SAL-21/22, BR-16, UC-02/UC-08 | ✅ |
| F1-TAB-04 | Park tab → held_cart & resume; konfirmasi tutup tab berisi item | FR-SAL-23 | ✅ |

### Cash Control
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-CSH-01 | Buka shift + saldo awal | FR-CSH-01, UC-03 | ✅ |
| F1-CSH-02 | Catat mutasi kas | FR-CSH-02 | ✅ |
| F1-CSH-03 | Tutup shift + rekonsiliasi (selisih/fraud) | FR-CSH-03, BR-07 | ✅ |

### Scan Barcode (Smartphone)
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-SCN-01 | Akses kamera + decode (BarcodeDetector + fallback ZXing) | FR-SCN-01/02, UC-26 | ✅ |
| F1-SCN-02 | Teruskan hasil ke Inventory/Checkout + input manual fallback | FR-SCN-03/04 | ✅ |

---

## Backlog Fase 2 (Retail & Promo) — Berbasis Kebutuhan

> Status: ⬜ belum · 🔵 dikerjakan · ✅ selesai · ⛔ blocked

### Fondasi Data (Schema)
| ID | Item | Ref | Status |
|---|---|---|---|
| F2-DB-01 | Schema: Customer, Loyalty, Contact, ContactLedger | Backend §9 | ✅ |
| F2-DB-02 | Schema: Discount, Pricelist, Voucher, VoucherRedemption | Backend §9 | ✅ |
| F2-DB-03 | Schema: Purchase, Item, Payment, Return | Backend §9 | ✅ |
| F2-DB-04 | Schema: StockAdjustment, StockTransfer, Item lanjutan | Backend §9 | ✅ |

### Customer & Contact (CRM)
| ID | Item | Ref | Status |
|---|---|---|---|
| F2-CRM-01 | CRUD Customer (Grosir/Retail) + Profiling | FR-CRM-01/04 | ✅ |
| F2-CRM-02 | Loyalty system (earn on sales, redeem as payment) | FR-CRM-02/03 | ✅ |
| F2-CNT-01 | CRUD Contact (Supplier/Customer) + Pay terms | FR-SUP-01/02 | ✅ |

### Pricing & Voucher (Kritikal)
| ID | Item | Ref | Status |
|---|---|---|---|
| F2-PRC-01 | CRUD Pricelist & Customer Category Discount | FR-PRC-01 | ✅ |
| F2-PRC-02 | Conditional Discounts & Automated Markdown | FR-PRC-02/03 | ✅ |
| F2-VCH-01 | **[KRITIKAL TDD]** Validasi & Redeem Voucher Atomik (Single-use) | FR-PRC-04..08, AC-02 | ✅ |
| F2-VCH-02 | Integrasi voucher dengan split payment (checkout) | FR-PRC-06 | ✅ |

### Purchasing & Hutang (Kritikal)
| ID | Item | Ref | Status |
|---|---|---|---|
| F2-PUR-01 | CRUD Purchase (kredit, lot/expiry, tax/shipping) | FR-PUR-01/05..08 | ✅ |
| F2-PUR-02 | **[KRITIKAL TDD]** Purchase Receive (ACID + stok bertambah) | FR-PUR-09, AC-07 | ✅ |
| F2-PUR-03 | Purchase Return (ACID + stok/hutang) | FR-PUR-02 | ✅ |
| F2-PUR-04 | Pembayaran hutang (multiple) + Payment Reminder job | FR-PUR-03/04 | ✅ |

### Lanjutan Stok & Inventory (Kritikal)
| ID | Item | Ref | Status |
|---|---|---|---|
| F2-STK-01 | Stock Adjustment (Increase/Decrease + alasan) | FR-STK-01/02 | ✅ |
| F2-STK-02 | **[KRITIKAL TDD]** Stock Transfer ACID (In Transit → Completed) | FR-STK-03..05, AC-06 | ✅ |
| F2-PRD-01 | Extended produk (Variable, IMEI/Serial/Lot, CSV) | FR-PRD-02..09 | ✅ |

---

## Backlog Fase 3 (Back-Office & Keuangan) — Berbasis Kebutuhan

> Status: ⬜ belum · 🔵 dikerjakan · ✅ selesai · ⛔ blocked

### Booking & Reservasi
| ID | Item | Ref | Status |
|---|---|---|---|
| F3-BOK-01 | CRUD Booking (reservasi meja/staf/slot waktu) + kalender | FR-BOK-01/02 | ✅ |
| F3-BOK-02/03 | Pre-order/Click & Collect dari API eksternal | FR-BOK-03/04 | ✅ |
| F3-BOK-04 | Catat DP & potong total tagihan saat pelunasan | FR-BOK-05 | ✅ |
| F3-BOK-05 | Reminder booking (background job) | FR-BOK-06 | ⬜ |

### Accounting / Payment Account
| ID | Item | Ref | Status |
|---|---|---|---|
| F3-ACC-01 | CRUD Payment Account (kas/bank/ewallet) + auto update saldo | FR-ACC-01/02 | ✅ |
| F3-ACC-02 | Balance Sheet | FR-ACC-03 | ⬜ |
| F3-ACC-03 | Trial Balance | FR-ACC-04 | ⬜ |
| F3-ACC-04 | Cash Flow per periode | FR-ACC-05 | ⬜ |
| F3-ACC-05 | Payment Account Report (mutasi & saldo) | FR-ACC-06 | ⬜ |

### HR: Commission, Expense, Payroll
| ID | Item | Ref | Status |
|---|---|---|---|
| F3-HRM-01 | Commission Agent + perhitungan komisi | FR-HRM-04, FR-SAL-15 | ✅ |
| F3-HRM-02 | Expense Management + link kas & laporan | FR-HRM-06 | ✅ |
| F3-HRM-03 | Staff Salary (gaji) | FR-HRM-05 | ⬜ |

### Reporting & Analytics
| ID | Item | Ref | Status |
|---|---|---|---|
| F3-RPT-01 | Dashboard penjualan & laba-rugi | FR-RPT-01/06 | ⬜ |
| F3-RPT-02 | Purchase & Sell Report + Stock Reports | FR-RPT-07 | ⬜ |
| F3-RPT-03 | Tax Report + Expenses Report | FR-RPT-08 | ⬜ |
| F3-RPT-04 | Supplier & Customer Report + Cash Register Report | FR-RPT-09 | ⬜ |
| F3-RPT-05 | Commission Agent / Salesperson Report | FR-RPT-10 | ⬜ |
| F3-RPT-06 | Analisis performa produk (Fast/Slow Moving) | FR-RPT-02 | ⬜ |
| F3-RPT-07 | Laporan redemption & liability voucher | FR-RPT-04 | ⬜ |
| F3-RPT-08 | Filter, chart, ekspor untuk semua laporan | FR-RPT-11 | ⬜ |

### Settings: Invoice, Barcode & Hardware
| ID | Item | Ref | Status |
|---|---|---|---|
| F3-CFG-01 | Customizable Invoice Layout multi-template | FR-CFG-01 | ⬜ |
| F3-CFG-02 | Barcode Setting (format label, simbologi) | FR-CFG-02 | ⬜ |
| F3-CFG-03 | Barcode scanner USB/Bluetooth (HID) | FR-CFG-03 | ⬜ |
| F3-CFG-04 | Thermal printer ESC/POS (USB/jaringan/BT) | FR-CFG-04 | ⬜ |
| F3-CFG-05 | Cash drawer kick-out via printer | FR-CFG-05 | ⬜ |

> **Catatan:** Phase 3 mencakup back-office (booking, akuntansi, HR, reporting) dan hardware (printer, scanner). Prioritaskan vertikal slice (misal: booking end-to-end atau accounting module) sebelum beralih ke modul lain.

---

## Sedang Dikerjakan

> Pindahkan item ke sini saat mulai. Satu pemilik per item.

| ID Item | Pemilik | Mulai | ID Kebutuhan | Acceptance Criteria (ringkas) | Catatan |
|---|---|---|---|---|---|
| _(kosong)_ | | | | | |
| _(kosong)_ | | | | | |

---

## Selesai

> Catat hasil agar sesi berikutnya tidak mengulang.

| ID Item | Tanggal | ID Kebutuhan | File Berubah | Keputusan Penting |
|---|---|---|---|---|
| F3-HRM-01 | 2026-06-18 | FR-HRM-04, FR-SAL-15 | apps/backend/src/modules/users/commission-agents.service.ts, commission-agents.controller.ts, user.schema.ts | Added Commission Agent CRUD to UserModule. This enables assigning salespersons to sales. |
| F3-HRM-02 | 2026-06-18 | FR-HRM-06 | apps/backend/src/db/schema/user.schema.ts, modules/users/expenses.* | Implemented expense schema in user module, created expense CRUD API (controller, service, dto) in users module. |
| F3-ACC-01 | 2026-06-18 | FR-ACC-01/02 | apps/backend/src/db/schema/accounting.schema.ts, modules/accounting/* | Implemented accounting schema (accounts, journals) and CRUD for payment accounts. Added accounting module to app.module.ts. |
| F3-BOK-02/03 | 2026-06-18 | FR-BOK-03/04 | apps/backend/src/modules/booking/services/booking.service.ts, controllers/preorder.controller.ts, booking.module.ts | Implemented pre-order creation with stock hold (qtyHeld increment) and collection logic (deducts held stock and actual qty); preorder controller added. |
| F3-BOK-01 | 2026-06-18 | FR-BOK-01/02 | apps/backend/src/db/schema/booking.schema.ts, modules/booking/* | BookingModule first vertical slice implemented: schema for bookings/preorders, CRUD service + calendar query, controller endpoints, module registered in AppModule. |
| F2-VCH-01 | 2026-06-18 | FR-PRC-04..08, AC-02 | apps/backend/src/modules/pricing/services/voucher.service*.ts, controllers/voucher.controller.ts, pricing.module.ts | TDD-first: voucher.service.spec.ts verifies single-use atomicity & race conditions (E-VOUCHER-409); implementation uses DB transaction + UNIQUE constraint catch |
| F2-PRD-01 | 2026-06-18 | FR-PRD-02..09 | apps/backend/src/modules/products/services/products.service.ts, controllers/products.controller.ts, dto/create-product.dto.ts | Ditambahkan CRUD untuk Product Variations, mock endpoint untuk CSV import, dan mock endpoint untuk Print Barcodes/Labels. Status gate ✅ |
| F2-PUR-01..04 | 2026-06-18 | FR-PUR-01..08 | apps/backend/src/modules/purchases/services/purchases.service.ts, controllers/purchases.controller.ts, dto/purchase.dto.ts | Completed CRUD Purchase (PATCH/DELETE unreceived). Purchase return deducts stock & adjusts contact ledger debit. Purchase payment adds to contact ledger. |
| F2-PUR-02 | 2026-06-18 | FR-PUR-09, AC-07 | apps/backend/src/modules/purchases/services/purchases.service.ts, controllers/purchases.controller.ts, purchases.module.ts | TDD-first: purchases.service.spec.ts verifies ACID stock update and supplier ledger entry; DB transaction wraps update/insert calls |
| F2-PRC-01/02 | 2026-06-18 | FR-PRC-01..03 | apps/backend/src/modules/pricing/services/pricing.service.ts, controllers/pricing.controller.ts, pricing.module.ts | PricingModule dengan CRUD Discounts, Markdowns, dan API GET /pricing/quote untuk hitung harga final (termasuk diskon jam/expiry); typecheck/lint/test/build ✅ |
| F2-VCH-02 | 2026-06-18 | FR-PRC-06 | apps/backend/src/modules/sales/{dto/checkout.dto.ts,services/checkout.service.ts,sales.module.ts}, modules/pricing/services/voucher.service.ts | Checkout now redeems voucher payments inside the same sale DB transaction via VoucherService.redeemVoucherInTx; all gates ✅ |
| F2-STK-02 | 2026-06-18 | FR-STK-03..05, AC-06 | apps/backend/src/modules/stock/stock.service.ts, services/stock.service.spec.ts | TDD-first: stock.service.spec.ts verifies transfer ACID (source deduct, dest increase, in_transit→completed); DB transaction + SELECT FOR UPDATE |
| F2-CNT-01 | 2026-06-18 | FR-SUP-01/02 | apps/backend/src/modules/contacts/* | ContactsModule dengan CRUD (supplier/customer) + initial ledger entry untuk openingBalance |
| F2-CRM-01/02 | 2026-06-18 | FR-CRM-01..04 | apps/backend/src/modules/customers/* | CustomerModule dengan CustomersService (CRUD) dan LoyaltyService (earn points on TransactionCompleted); typecheck/lint/test/build ✅ |
| F2-DB-01..04 | 2026-06-18 | FR-CRM-01..04, FR-PRC-01..08, FR-PUR-01..09, FR-STK-01..06, BR-01..03, BR-06, BR-13 | apps/backend/src/db/schema/{customer,contact,pricing,purchase,stock}.schema.ts | Phase 2 schemas: customers, loyaltyAccounts, contacts, vouchers (code UNIQUE), voucherRedemptions (voucherId UNIQUE for single-use), discounts, purchases, purchaseItems, stockSerials (IMEI/Lot), recoveryAmount in adjustments, shippingCharge in transfers; all money as integer minor-unit; typecheck/lint/test/build ✅ |
| F1-AUTH-03 | 2026-06-18 | FR-AUT-03, BR-11, NFR-SEC-03 | apps/backend/src/modules/auth/dto/approve.dto.ts, auth.controller.ts, auth.service.ts, common/decorators/requires-approval.decorator.ts, common/guards/approval.guard.ts, db/schema/approval-log.schema.ts | POST /auth/approve validates supervisor credentials+permission; returns 5-min approvalToken; ApprovalGuard checks X-Approval-Token; logs approval audit |
| F1-TAB-04 | 2026-06-18 | FR-SAL-23 | apps/backend/src/modules/sales/controllers/tab.controller.ts, services/tab.service.ts | POST /sales/tabs/:id/park moves cart to heldCarts and deletes tab; DELETE /sales/tabs/:id closes tab |
| F1-SCN-02 | 2026-06-18 | FR-SCN-03/04 | apps/web/src/lib/components/Scanner.svelte | Scanner emits `scan` event with barcode; parent page consumes and calls GET /products/by-barcode/:code |
| F1-SCN-01 | 2026-06-18 | FR-SCN-01/02, UC-26 | apps/web/src/lib/components/Scanner.svelte | Scanner component: getUserMedia + BarcodeDetector + ZXing fallback + manual input |
| F1-CSH-03 | 2026-06-18 | FR-CSH-03, BR-07 | apps/backend/src/modules/cash-register/dto/close-register.dto.ts, controllers/cash-register.controller.ts, services/cash-register.service.ts | POST /register/close records closing_counted, calculates difference, closes shift |
| F1-CSH-02 | 2026-06-18 | FR-CSH-02 | apps/backend/src/modules/cash-register/dto/cash-movement.dto.ts, controllers/cash-register.controller.ts, services/cash-register.service.ts | POST /register/cash-in and /register/cash-out record cash movements |
| F1-CSH-01 | 2026-06-18 | FR-CSH-01, UC-03 | apps/backend/src/db/schema/cash-register.schema.ts, modules/cash-register/* | Shift schema + POST /register/open creates open shift with opening balance |
| F1-TAB-03 | 2026-06-18 | FR-SAL-21/22, BR-16, UC-02/UC-08 | apps/backend/src/modules/sales/controllers/tab.controller.ts, services/tab.service.ts | POST /sales/tabs/:id/hold sets status on_hold and heldAt; /resume reverts to active |
| F1-TAB-02 | 2026-06-18 | FR-SAL-20 | apps/backend/src/modules/sales/dto/update-tab.dto.ts, controllers/tab.controller.ts, services/tab.service.ts | PATCH /sales/tabs/:id updates tab's cartJson independently; tab isolation |
| F1-TAB-01 | 2026-06-18 | FR-SAL-18/19, BR-15, E-TAB-409 | apps/backend/src/db/schema/sales.schema.ts, modules/sales/services/tab.service.ts, controllers/tab.controller.ts | Tab schema + TabService with max 10 enforcement + POST/GET /sales/tabs endpoints |
| F1-SAL-07 | 2026-06-18 | FR-SAL-06 | apps/backend/src/modules/sales/controllers/cart.controller.ts, services/cart.service.ts | GET /sales/:id/print returns sale, items, and payments for receipt printing |
| F1-SAL-06 | 2026-06-18 | FR-SAL-08, BR-04, E-PAY-422 | apps/backend/src/modules/sales/services/checkout.service.ts | Already implemented in F1-SAL-03: rejects payment < grandTotal with E-PAY-422 |
| F1-SAL-05 | 2026-06-18 | FR-SAL-07 | apps/backend/src/modules/sales/services/checkout.service.ts | Checkout emits TransactionCompleted event with sale data for stock/loyalty/accounting listeners |
| F1-SAL-04 | 2026-06-18 | FR-SAL-09, NFR-REL-01 | apps/backend/src/modules/sales/dto/checkout.dto.ts, services/checkout.service.ts | idempotencyKey required on POST /checkout/pay; duplicate key returns existing paid sale |
| F1-SAL-03 | 2026-06-18 | FR-SAL-03/12, UC-01 | apps/backend/src/modules/sales/dto/checkout.dto.ts, controllers/checkout.controller.ts, services/checkout.service.ts | POST /checkout/pay supports split payments; wraps sale lock + payment insert + sale update in DB transaction |
| F1-SAL-02 | 2026-06-18 | FR-SAL-02 | apps/backend/src/modules/sales/dto/create-cart.dto.ts, modules/sales/services/cart.service.ts | Cart accepts productId or barcode; resolves barcode to product; validates item source; recalculates tax/total |
| F1-SAL-01 | 2026-06-18 | FR-SAL-01/05 | apps/backend/src/db/schema/sales.schema.ts, modules/sales/* | Sales schema (sale, sale_item, sale_payment) + CartService + POST /sales/cart with subtotal/tax/grand_total calculation |
| F1-INV-03 | 2026-06-18 | FR-INV-04, AC-09 | apps/backend/src/modules/stock/stock.gateway.ts, stock.module.ts, stock.service.ts | WebSocket `stock:check`; broadcasts `stock:changed` via EventBus on stock changes |
| F1-INV-02 | 2026-06-18 | FR-INV-06, BR-05 | apps/backend/src/modules/stock/stock.service.ts | deductStock() with DB tx + SELECT FOR UPDATE + non-negative check; increaseStock() for returns |
| F1-INV-01 | 2026-06-18 | FR-INV-02/03 | apps/backend/src/db/schema/stock.schema.ts, modules/stock/* | Stock schema + GET /stock endpoint |
| F1-AUTH-02 | 2026-06-18 | FR-AUT-02, AC-11 | apps/backend/src/common/decorators/permissions.decorator.ts, common/guards/permissions.guard.ts, modules/users/* | Global `PermissionsGuard`; `@Permissions(...)`; DB-backed user role→permission check; denies unauthorized access with 403 |
| F1-PRD-01 | 2026-06-18 | FR-INV-01 | apps/backend/src/db/schema/product.schema.ts, modules/products/* | Product CRUD + master data (brand/category/unit/tax) schema & GET/POST/PATCH/DELETE endpoints |
| F1-BIZ-02 | 2026-06-18 | FR-BIZ-02/05 | apps/backend/src/db/schema/location.schema.ts, modules/business/location.* | Location CRUD scoped by authenticated user's businessId |
| F1-BIZ-01 | 2026-06-18 | FR-BIZ-01/03 | apps/backend/src/db/schema/business.schema.ts, modules/business/* | Business CRUD; auto-seed Admin+Cashier roles per new business via RolesService |
| F1-AUTH-04 | 2026-06-18 | FR-HRM-02 | apps/backend/src/db/schema/role.schema.ts, db/seeds/*, modules/users/roles.service.ts | Predefined roles (Admin, Cashier) w/ 24 permissions; cloned per business via RolesService |
| F1-AUTH-01 | 2026-06-18 | FR-AUT-01, E-AUTH-401 | apps/backend/src/modules/auth/*, users/*, common/decorators/* | JWT login/refresh/logout/me, JwtAuthGuard global, Public decorator, argon2 hashing |
| F1-INFRA-01/02 | 2026-06-17 | Backend §11 | apps/backend/* | Scaffold NestJS, Config, Drizzle DB Client, BullMQ, EventBus; Folder structure |
| F1-INFRA-05 | 2026-06-17 | PRD §7.4 | package.json, pnpm-workspace.yaml, apps/web/* | Monorepo pnpm; SvelteKit 2 + Svelte 5 + Tailwind 3 (token Luminous Industrial) + adapter-node |
| F1-INFRA-06 | 2026-06-17 | AGENTS §6.2 | apps/web/{vite,eslint}.config, package.json | Skrip gate (typecheck/lint/test/build) aktif; quality-gate.yml kini "menggigit" |

---

## Open Questions (Ambiguitas / Butuh Keputusan User)

> Jangan menebak. Tulis pertanyaan di sini dan tunggu jawaban user.

| # | Pertanyaan | Konteks/Ref | Status |
|---|---|---|---|
| Q1 | ~~`Frontend.md` masih kosong~~ **TERJAWAB: Frontend.md v0.1 dibuat** (API-first, route map, traceability). Detail per layar menyusul referensi `reference/frontend/*` dari user. | Frontend.md | ✅ Selesai |
| Q2 | ~~ORM final: Prisma atau TypeORM?~~ **TERJAWAB: Drizzle ORM** (lihat ADR-05 & Spec Change Log) | Backend.md header | ✅ Selesai |
| Q3 | Strategi cetak struk Fase 1: WebUSB/WebBluetooth langsung atau bridge lokal? | UC-10, FR-CFG-04 | ⬜ Menunggu |
| Q4 | ~~Library styling frontend?~~ **TERJAWAB: Tailwind CSS** + design system "Luminous Industrial" (token di `reference/frontend/Reference/.../DESIGN.md`) | Frontend.md §2 | ✅ Selesai |
| Q5 | Strategi shared types FE↔BE (generate dari OpenAPI vs paket manual)? | Frontend.md §2, §11 | ⬜ Menunggu |
| Q6 | ~~File referensi UI belum disediakan~~ **TERJAWAB: 15 layar tersedia** di `reference/frontend/Reference/` (11 batch awal + 4 dilengkapi menyusul: tab transaksi, scanner, buka shift, login). Lihat README katalognya. | reference/frontend/Reference/ | ✅ Selesai |
| Q7 | ~~F1-AUTH-03 supervisor approval butuh kontrak API/alur final~~ **TERJAWAB/DIIMPLEMENTASI:** `POST /auth/approve` menerima kredensial supervisor + requiredPermission dan mengembalikan `approvalToken` sementara untuk aksi sensitif. | FR-AUT-03, BR-11, Backend.md §8.1 | ✅ Selesai |

---

## Spec Change Log

> Setiap perubahan terhadap dokumen spec (`PRD/SRS/Backend/Frontend/Sequence`) dicatat di sini.
> Format: tanggal — file — ringkasan perubahan — alasan — disetujui oleh.

| Tanggal | File | Perubahan | Alasan | Disetujui |
|---|---|---|---|---|
| 2026-06-17 | Backend.md | ORM difinalkan ke **Drizzle ORM** (header, CoreModule, repository, struktur folder `db/`, checklist) | Keputusan user; sebelumnya "Prisma atau TypeORM" masih opsi | User |
| 2026-06-17 | AGENTS.md, PLAN.md, .github/, .kiro/ | Tambah harness anti-halusinasi: bagian TDD & Quality Gate (AGENTS §6), kolom Test/AC & Gate (PLAN), workflow `quality-gate.yml`, agent `pos-code-reviewer.md` | Permintaan user untuk mencegah halusinasi via guardrail keras | User |
| 2026-06-17 | Frontend.md, AGENTS.md | Buat `Frontend.md` v0.1 (API-first, route map, komponen, traceability layar→FR, konvensi `reference/frontend/`); AGENTS §3 ditambah aturan baca frontend API-first | Menjawab Q1; menyiapkan kerja frontend dari file referensi HTML/PNG | User |
| 2026-06-17 | reference/frontend/Reference/README.md, Frontend.md, PLAN.md | Tambah README katalog 11 layar referensi "Luminous Industrial" (pemetaan layar→route→FR); finalisasi styling = Tailwind (Q4), referensi tersedia (Q6) | User menyediakan file referensi UI di branch main | User |
| 2026-06-17 | reference/frontend/Reference/{secure_login,transaction_tabs_multi_customer,barcode_scanner_camera,shift_opening}/code.html | Lengkapi 4 layar Fase 1 yang tanpa mockup, bertema "Luminous Industrial" identik dengan referensi lain | Permintaan user; menutup gap cakupan UI Fase 1 | User |
| 2026-06-17 | package.json, pnpm-workspace.yaml, apps/web/* | Scaffold monorepo pnpm + SvelteKit (Svelte 5) + Tailwind 3 (token Luminous Industrial) + ESLint 9 + Vitest + adapter-node; quality gate hijau (typecheck/lint/test/build) | Permintaan user "scaffold sveltekit" (F1-INFRA-05/06) | User |
| 2026-06-17 | apps/web/{playwright.config.ts,e2e/*}, package.json, .github/quality-gate.yml, AGENTS.md | Tambah Playwright: E2E fungsional (masuk gate, step 5) + visual regression opt-in (`@visual`); CI install chromium `--with-deps` | Permintaan user setup Playwright + test:e2e | User |

---

## Keputusan Teknis (ADR Ringkas)

> Catat keputusan yang berdampak lintas modul agar tidak diperdebatkan ulang (mencegah drift).

| # | Keputusan | Alasan | Tanggal |
|---|---|---|---|
| ADR-01 | Arsitektur Modular Monolith (bukan microservices) | Konsistensi ACID, biaya & tim kecil, time-to-market | (fixed di PRD §6) |
| ADR-02 | Komunikasi antar modul in-process (service + Domain Event) | Hindari overhead jaringan; siap strangler ke microservices | (fixed di Backend §1) |
| ADR-03 | Idempotency via `sale.idempotency_key` UNIQUE | Anti transaksi dobel saat retry jaringan | (fixed di Backend §10) |
| ADR-04 | Voucher single-use via `voucher_redemption.voucher_id` UNIQUE + lock | Anti pemakaian ganda / race condition | (fixed di SRS §7) |
| ADR-05 | **Drizzle ORM** sebagai ORM resmi (bukan Prisma/TypeORM) | TypeScript-first, type-safe, SQL-like ringan; migrasi via drizzle-kit | 2026-06-17 |
| ADR-06 | **REQ-driven TDD + Quality Gate (typecheck→lint→test→build) + code-reviewer agent** sebagai guardrail keras anti-halusinasi | Dokumen (AGENTS/PLAN) hanya guardrail lunak; gate eksekutabel membuat halusinasi gagal objektif | 2026-06-17 |

---

## Traceability Matrix (Ringkas)

> Peta kebutuhan → status implementasi. Perbarui kolom Status, Test/AC, Gate & PR saat ada progres.
> Daftar lengkap FR/NFR/BR ada di `SRS.md` §3, §5, §9. Acceptance Criteria di `SRS.md` §10.
>
> **Kolom Test/AC:** ID test REQ-driven yang mengunci perilaku (lihat AGENTS.md §6.1).
> **Kolom Gate:** status quality gate (typecheck→lint→test→build); ⬜ belum · 🟡 sebagian · ✅ hijau semua.

| ID Kebutuhan | Deskripsi singkat | Modul | Item PLAN | Test/AC | Status | Gate | PR/Commit |
|---|---|---|---|---|---|---|---|
| FR-SAL-03 | Split payment | Sales | F1-SAL-03 | AC-01 | ⬜ | ⬜ | |
| FR-SAL-08 | Tolak bayar < tagihan | Sales | F1-SAL-06 | E-PAY-422 | ⬜ | ⬜ | |
| FR-SAL-09 | Checkout idempotent | Sales | F1-SAL-04 | AC-05, E-DUP-409 | ⬜ | ⬜ | |
| FR-SAL-18..23 | Tab transaksi (maks 10) | Sales | F1-TAB-01..04 | AC-03b, E-TAB-409 | ⬜ | ⬜ | |
| FR-PRC-05/08 | Voucher single-use atomik | Pricing | (Fase 2) | AC-02, E-VOUCHER-409 | ⬜ | ⬜ | |
| FR-INV-06 | Stok non-negatif | Stock | F1-INV-02 | BR-05, E-STOCK-409 | ⬜ | ⬜ | |
| FR-STK-04 | Stock transfer ACID | Stock | F2-STK-02 | AC-06 | ✅ | ✅ | F2-STK-02 |
| FR-PRD-02..09 | Extended products | Product | F2-PRD-01 | | ✅ | ✅ | F2-PRD-01 |
| FR-PUR-01..08 | CRUD Purchase | Purchase | F2-PUR-01..04 | | ✅ | ✅ | F2-PUR-01..04 |
| FR-STK-01/02 | Stock Adjustment | Stock | F2-STK-01 | | ✅ | ✅ | F2-STK-01 |
| FR-BOK-01..06 | Booking & Pre-order | Booking | F3-BOK-01..04 | | ✅ | ✅ | F3-BOK-* |
| FR-ACC-01..02 | Payment Accounts | Accounting | F3-ACC-01 | | ✅ | ✅ | F3-ACC-01 |
| FR-HRM-06 | Expense Management | Users | F3-HRM-02 | | ✅ | ✅ | F3-HRM-02 |
| FR-CSH-03 | Rekonsiliasi shift | CashRegister | F1-CSH-03 | AC-04 | ⬜ | ⬜ | |
| FR-AUT-01/02 | Auth + RBAC | Auth | F1-AUTH-01/02 | AC-11, E-PERM-403 | ⬜ | ⬜ | |
| NFR-REL-01 | Idempotent, anti double-charge | Sales/Core | F1-SAL-04 | AC-05 | ⬜ | ⬜ | |
| NFR-DATA-01 | Operasi keuangan/stok ACID | lintas | F1-SAL-03, F1-INV-* | AC-01, AC-06 | ⬜ | ⬜ | |
| NFR-SEC-04 | RBAC + isolasi tenant | Auth/Core | F1-AUTH-02, F1-INFRA-04 | AC-11 | ⬜ | ⬜ | |

> Tambahkan baris saat kebutuhan baru mulai dikerjakan. Setiap baris **wajib** punya ID kebutuhan resmi dari SRS, dan item kritikal **wajib** punya entri di kolom Test/AC sebelum Gate bisa ✅.

---

## Catatan Verifikasi (Definition of Done)

Sebelum menandai item ✅, pastikan (lihat `AGENTS.md` §6 & §8):
- Tertaut ID kebutuhan · **(kritikal) test REQ-driven RED→GREEN** · boundary modul terjaga ·
  ACID/idempotency (bila relevan) · error handling SRS §8 · Acceptance Criteria SRS §10 tercakup test ·
  **Quality Gate hijau (typecheck→lint→test→build)** · **(logika kritikal) lolos `pos-code-reviewer`** ·
  PLAN diperbarui (kolom Test/AC & Gate) · tanpa scope creep.

---

## Gerbang Mutu & Review (Referensi)

- **Quality Gate CI:** `.github/workflows/quality-gate.yml` — menjalankan typecheck → lint → test → build pada setiap push/PR. Wajib hijau sebelum merge.
- **Code Reviewer Agent:** `.kiro/agents/pos-code-reviewer.md` — reviewer khusus aturan POS (boundary modul, ACID, idempotency, single-use voucher, uang non-float, kepatuhan AC). Jalankan untuk perubahan logika kritikal.
- **Filosofi:** dokumen = guardrail lunak; gate + test + reviewer = guardrail keras yang membuat halusinasi gagal secara objektif.
