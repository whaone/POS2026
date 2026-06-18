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
| Status implementasi | Scaffolding frontend selesai (SvelteKit monorepo); quality gate aktif & hijau. Backend (NestJS+Drizzle) belum dimulai. |
| Branch kerja | `docs/anti-drift-and-drizzle` (PR #2) |
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
| F1-INFRA-05 | Setup SvelteKit (web app online, SSR/SPA) | PRD §7.4, Frontend.md | ✅ |
| F1-INFRA-06 | Definisikan skrip gate di package.json (`typecheck`,`lint`,`test`,`build`) + konfig Vitest/ESLint agar `quality-gate.yml` aktif | AGENTS.md §6.2 | ✅ |
| F1-INFRA-07 | Playwright E2E (fungsional, masuk gate) + visual regression opt-in; CI install chromium | AGENTS.md §6.2 | ✅ |
| F1-INFRA-08 | Workflow CI generate+commit baseline visual (`update-visual-baseline.yml`) + e2e README | AGENTS.md §6.2 | ✅ |

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
| F1-INFRA-05 | 2026-06-17 | PRD §7.4 | package.json, pnpm-workspace.yaml, apps/web/* | Monorepo pnpm; SvelteKit 2 + Svelte 5 + Tailwind 3 (token Luminous Industrial) + adapter-node |
| F1-INFRA-06 | 2026-06-17 | AGENTS §6.2 | apps/web/{vite,eslint}.config, package.json | Skrip gate (typecheck/lint/test/build) aktif; quality-gate.yml kini "menggigit" |
| F1-INFRA-07 | 2026-06-17 | AGENTS §6.2 | apps/web/{playwright.config,e2e/*}, .github/quality-gate.yml | E2E fungsional masuk gate; **diverifikasi hijau di CI** (run #10 commit 44a3945, push). Visual opt-in. |
| F1-INFRA-08 | 2026-06-17 | AGENTS §6.2 | .github/update-visual-baseline.yml, apps/web/e2e/README.md | Baseline visual digenerate+commit via CI agar konsisten dgn gate; trigger CI dirapikan (no dobel) |

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
| 2026-06-17 | .github/{quality-gate,update-visual-baseline}.yml, apps/web/e2e/README.md, AGENTS.md, PLAN.md | Tuntaskan F1-INFRA-07: workflow CI generate+commit baseline visual; trigger gate dirapikan (push:main + pull_request:main) agar tidak run dobel; catat bukti CI hijau | Permintaan user "selesaikan F1-INFRA-07" | User |

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
| FR-STK-04 | Stock transfer ACID | Stock | (Fase 2) | AC-06 | ⬜ | ⬜ | |
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
