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
| Fase aktif | **Fase 1 — MVP POS Inti** (lihat PRD §12) |
| Status implementasi | Greenfield — belum ada kode, spesifikasi lengkap |
| Branch kerja | _(isi nama branch saat mulai)_ |
| Pemegang tugas terakhir | _(isi)_ |
| Update terakhir | _(isi tanggal)_ |

---

## Peta Fase (dari PRD §12)

### Fase 1 — MVP POS Inti  ← AKTIF
Auth & RBAC dasar, Business & lokasi, katalog produk dasar, checkout + split payment
(Tunai/QRIS/Kartu), cetak struk, cash control, tab transaksi (maks 10) + parkir tagihan,
scan barcode smartphone, inventory dasar + real-time stock.

### Fase 2 — Retail & Promo
Voucher fisik, CRM & loyalty, pricelist & diskon bersyarat, markdown, purchasing + contact,
purchase return, payment reminder, stock adjustment & transfer, produk lanjutan (IMEI/Serial/Lot, CSV, label).

### Fase 3 — Back-Office & Keuangan
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
| F1-INFRA-01 | Setup NestJS + TS + Drizzle ORM (+ drizzle-kit) + PostgreSQL + Redis | Backend.md §11/§12 | ⬜ |
| F1-INFRA-02 | Core: EventBus (in-process), BullMQ, Config, Logger | Backend.md §5/§6 | ⬜ |
| F1-INFRA-03 | Common: ValidationPipe, HttpExceptionFilter, LoggingInterceptor, RateLimit | Backend.md §4.4, SRS §8 | ⬜ |
| F1-INFRA-04 | Multi-tenancy: `TenantInterceptor` (`business_id`/`location_id`) | Backend.md §4.3, BR-10 | ⬜ |
| F1-INFRA-05 | Setup SvelteKit (web app online, SSR/SPA) | PRD §7.4, Frontend.md | ⬜ |

### Auth & RBAC
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-AUTH-01 | Login/refresh/logout/me (JWT) + `JwtAuthGuard` | FR-AUT-01, Backend §8.1 | ⬜ |
| F1-AUTH-02 | RBAC granular + `@Permissions` + `PermissionsGuard` | FR-AUT-02 | ⬜ |
| F1-AUTH-03 | Approval supervisor untuk aksi sensitif (void/diskon) | FR-AUT-03, BR-11 | ⬜ |
| F1-AUTH-04 | Seed predefined roles (Admin, Cashier) | FR-HRM-02 | ⬜ |

### Business & Lokasi
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-BIZ-01 | CRUD business + currency/timezone/financial year | FR-BIZ-01/03 | ⬜ |
| F1-BIZ-02 | CRUD lokasi (store/warehouse) + isolasi data per tenant | FR-BIZ-02/05 | ⬜ |

### Produk & Stok (dasar)
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-PRD-01 | CRUD produk dasar + kategori + barcode | FR-INV-01 | ⬜ |
| F1-INV-01 | Stok multi-lokasi + potong stok saat `TransactionCompleted` | FR-INV-02/03 | ⬜ |
| F1-INV-02 | Cegah stok negatif + lock baris konkuren | FR-INV-06, BR-05 | ⬜ |
| F1-INV-03 | Real-time stock check via WebSocket | FR-INV-04, Backend §7 | ⬜ |
| F1-PRD-02 | Lookup produk by-barcode | Backend §8.4 | ⬜ |

### Checkout & Pembayaran
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-SAL-01 | Keranjang + hitung subtotal/pajak/total real-time | FR-SAL-01/05 | ⬜ |
| F1-SAL-02 | Tambah item (scan/manual) | FR-SAL-02 | ⬜ |
| F1-SAL-03 | Split payment (Tunai/QRIS/Kartu) — transaksi ACID | FR-SAL-03/12, UC-01 | ⬜ |
| F1-SAL-04 | Idempotency checkout (`idempotency_key` UNIQUE) | FR-SAL-09, NFR-REL-01 | ⬜ |
| F1-SAL-05 | Publish `TransactionCompleted` (stok/poin/akun/laporan) | FR-SAL-07 | ⬜ |
| F1-SAL-06 | Tolak bayar < tagihan (non-kredit) | FR-SAL-08, BR-04, E-PAY-422 | ⬜ |
| F1-SAL-07 | Cetak struk + buka cash drawer | FR-SAL-06 | ⬜ |

### Tab Transaksi & Parkir Tagihan
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-TAB-01 | Buka/list/detail tab (maks 10, `UNIQUE(shift_id,tab_index)`) | FR-SAL-18/19, BR-15, E-TAB-409 | ⬜ |
| F1-TAB-02 | Isolasi state tiap tab | FR-SAL-20 | ⬜ |
| F1-TAB-03 | Hold tab (persist ke DB) + resume | FR-SAL-21/22, BR-16, UC-02/UC-08 | ⬜ |
| F1-TAB-04 | Park tab → held_cart & resume; konfirmasi tutup tab berisi item | FR-SAL-23 | ⬜ |

### Cash Control
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-CSH-01 | Buka shift + saldo awal | FR-CSH-01, UC-03 | ⬜ |
| F1-CSH-02 | Catat mutasi kas | FR-CSH-02 | ⬜ |
| F1-CSH-03 | Tutup shift + rekonsiliasi (selisih/fraud) | FR-CSH-03, BR-07 | ⬜ |

### Scan Barcode (Smartphone)
| ID | Item | Ref | Status |
|---|---|---|---|
| F1-SCN-01 | Akses kamera + decode (BarcodeDetector + fallback ZXing) | FR-SCN-01/02, UC-26 | ⬜ |
| F1-SCN-02 | Teruskan hasil ke Inventory/Checkout + input manual fallback | FR-SCN-03/04 | ⬜ |

> **Catatan:** Backlog Fase 2 & 3 ditambahkan saat fase tersebut diaktifkan. Lihat checklist lengkap di Backend.md §12.

---

## Sedang Dikerjakan

> Pindahkan item ke sini saat mulai. Satu pemilik per item.

| ID Item | Pemilik | Mulai | ID Kebutuhan | Acceptance Criteria (ringkas) | Catatan |
|---|---|---|---|---|---|
| _(kosong)_ | | | | | |

---

## Selesai

> Catat hasil agar sesi berikutnya tidak mengulang.

| ID Item | Tanggal | ID Kebutuhan | File Berubah | Keputusan Penting |
|---|---|---|---|---|
| _(kosong)_ | | | | |

---

## Open Questions (Ambiguitas / Butuh Keputusan User)

> Jangan menebak. Tulis pertanyaan di sini dan tunggu jawaban user.

| # | Pertanyaan | Konteks/Ref | Status |
|---|---|---|---|
| Q1 | `Frontend.md` masih kosong — apakah spesifikasi UI menyusul, atau ikuti PRD §10 & SRS §6.1 sebagai acuan sementara? | Frontend.md | ⬜ Menunggu |
| Q2 | ~~ORM final: Prisma atau TypeORM?~~ **TERJAWAB: Drizzle ORM** (lihat ADR-05 & Spec Change Log) | Backend.md header | ✅ Selesai |
| Q3 | Strategi cetak struk Fase 1: WebUSB/WebBluetooth langsung atau bridge lokal? | UC-10, FR-CFG-04 | ⬜ Menunggu |

---

## Spec Change Log

> Setiap perubahan terhadap dokumen spec (`PRD/SRS/Backend/Frontend/Sequence`) dicatat di sini.
> Format: tanggal — file — ringkasan perubahan — alasan — disetujui oleh.

| Tanggal | File | Perubahan | Alasan | Disetujui |
|---|---|---|---|---|
| 2026-06-17 | Backend.md | ORM difinalkan ke **Drizzle ORM** (header, CoreModule, repository, struktur folder `db/`, checklist) | Keputusan user; sebelumnya "Prisma atau TypeORM" masih opsi | User |

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

---

## Traceability Matrix (Ringkas)

> Peta kebutuhan → status implementasi. Perbarui kolom Status & PR saat ada progres.
> Daftar lengkap FR/NFR/BR ada di `SRS.md` §3, §5, §9.

| ID Kebutuhan | Deskripsi singkat | Modul | Item PLAN | Status | PR/Commit |
|---|---|---|---|---|---|
| FR-SAL-03 | Split payment | Sales | F1-SAL-03 | ⬜ | |
| FR-SAL-09 | Checkout idempotent | Sales | F1-SAL-04 | ⬜ | |
| FR-SAL-18..23 | Tab transaksi (maks 10) | Sales | F1-TAB-01..04 | ⬜ | |
| FR-PRC-05/08 | Voucher single-use atomik | Pricing | (Fase 2) | ⬜ | |
| FR-INV-06 | Stok non-negatif | Stock | F1-INV-02 | ⬜ | |
| FR-CSH-03 | Rekonsiliasi shift | CashRegister | F1-CSH-03 | ⬜ | |
| FR-AUT-01/02 | Auth + RBAC | Auth | F1-AUTH-01/02 | ⬜ | |
| NFR-REL-01 | Idempotent, anti double-charge | Sales/Core | F1-SAL-04 | ⬜ | |
| NFR-DATA-01 | Operasi keuangan/stok ACID | lintas | F1-SAL-03, F1-INV-* | ⬜ | |
| NFR-SEC-04 | RBAC + isolasi tenant | Auth/Core | F1-AUTH-02, F1-INFRA-04 | ⬜ | |

> Tambahkan baris saat kebutuhan baru mulai dikerjakan. Setiap baris **wajib** punya ID kebutuhan resmi dari SRS.

---

## Catatan Verifikasi (Definition of Done)

Sebelum menandai item ✅, pastikan (lihat `AGENTS.md` §8):
- Tertaut ID kebutuhan · boundary modul terjaga · ACID/idempotency (bila relevan) ·
  error handling SRS §8 · Acceptance Criteria SRS §10 · lint/build/test hijau · PLAN diperbarui · tanpa scope creep.
