# AGENTS.md — Panduan Kerja Agent (Anti-Drift)

> **Proyek:** Sistem POS Modular Berbasis Monolith (POS2026)
> **Stack:** SvelteKit + NestJS (TypeScript) + PostgreSQL + Redis
> **Arsitektur:** Modular Monolith (siap migrasi microservices via strangler pattern)
> **Sumber kebenaran:** `PRD.md`, `SRS.md`, `Backend.md`, `Frontend.md`, `Sequence_Diagram.md`
> **Status:** Greenfield — dokumen spesifikasi sudah lengkap, implementasi kode belum dimulai.

File ini adalah **kontrak kerja** untuk setiap AI agent / kontributor. Tujuannya **mencegah drift**:
agar implementasi tidak menyimpang dari spesifikasi (PRD/SRS), tidak menambah fitur di luar lingkup,
dan tidak melanggar batasan arsitektur yang sudah disepakati.

---

## 0. TL;DR — Baca Ini Dulu

1. **Jangan menebak.** Jika kebutuhan tidak ada di `SRS.md`/`PRD.md`, **tanya atau tandai TODO**, jangan mengarang.
2. **Setiap perubahan harus tertaut ke ID kebutuhan** (`FR-*`, `NFR-*`, `BR-*`, atau `UC-*`).
3. **Patuhi boundary modul.** Modul **tidak boleh** mengakses tabel/repository modul lain secara langsung — gunakan service interface atau Domain Event.
4. **Operasi keuangan & stok wajib ACID** (DB transaction). Checkout wajib **idempotent**.
5. **Update `docs/PLAN.md`** setiap mulai/selesai satu unit kerja. PLAN adalah memori lintas-sesi.
6. **Jangan menghapus/menulis ulang spec** (`PRD.md`, `SRS.md`, dst.) tanpa permintaan eksplisit.
7. **Scope diam = tidak dikerjakan.** Tidak ada fitur "bonus" di luar fase aktif.

---

## 1. Prinsip Anti-Drift

Drift = implementasi pelan-pelan menyimpang dari niat asli. Cegah dengan aturan berikut:

### 1.1 Traceability Wajib
- Setiap PR/commit/unit kerja **harus menyebut ID** kebutuhan yang dipenuhi, mis. `FR-SAL-09`, `BR-15`, `NFR-REL-01`.
- Jika tidak ada ID yang cocok → pekerjaan itu **di luar scope**. Hentikan dan konfirmasi dulu.
- Tabel ketertelusuran dipelihara di `docs/PLAN.md` (lihat bagian Traceability di sana).

### 1.2 Spec adalah Sumber Kebenaran
- Urutan otoritas bila terjadi konflik: **SRS.md > PRD.md > Backend.md/Frontend.md > Sequence_Diagram.md > kode**.
- Bila kode dan spec bertentangan, **spec menang** — perbaiki kode, atau ajukan perubahan spec secara eksplisit.
- Perubahan spec harus: (a) diminta user, (b) dicatat di `docs/PLAN.md` bagian "Spec Change Log".

### 1.3 No Scope Creep
- Kerjakan **hanya** item pada fase yang sedang aktif (lihat `PRD.md` §12 dan `docs/PLAN.md`).
- Fitur Fase 2/3 **tidak** disentuh saat Fase 1 belum selesai, kecuali diminta.
- Jangan menambah dependensi, library, atau service baru tanpa alasan yang tertaut ke kebutuhan.

### 1.4 No Hallucination
- Jangan mengarang endpoint, kolom DB, nama event, atau aturan bisnis. Semua sudah didefinisikan di `Backend.md` §8 (API), §9 (skema DB), §5 (events).
- Jika butuh sesuatu yang belum ada → tandai `// TODO(spec): <pertanyaan>` dan catat di PLAN, jangan asal isi.

### 1.5 Konsisten dengan Keputusan Arsitektur
- **Modular Monolith**, bukan microservices. Komunikasi antar modul **in-process** (service / Domain Event), bukan HTTP/broker.
- **Satu** PostgreSQL. **Satu** proses deploy. Jangan memecah jadi service terpisah.
- Online web app (bukan PWA/offline-first). Jangan menambahkan logika offline-sync.

---

## 2. Arsitektur — Aturan yang Tidak Boleh Dilanggar

| Aturan | Penjelasan | Referensi |
|---|---|---|
| Boundary modul | Modul akses data sendiri saja; lintas modul via service interface / Domain Event | Backend.md §1, §3 |
| ACID | checkout, redeem voucher, stock transfer, purchase receive → dibungkus DB transaction | Backend.md §10, SRS §7.3 |
| Idempotency | `POST /checkout/pay` memakai `idempotency_key` UNIQUE; retry tidak boleh dobel | FR-SAL-09, NFR-REL-01 |
| Voucher single-use | `voucher_redemption.voucher_id` UNIQUE + lock baris (atomik) | FR-PRC-05/08, BR-02 |
| Multi-tenancy | Semua tabel transaksional punya `business_id` (+ `location_id`); scope via `TenantInterceptor` | Backend.md §4.3, BR-10 |
| Tab transaksi | Maks **10 tab** aktif per sesi kasir; `UNIQUE(shift_id, tab_index)`; hold tetap di tab | FR-SAL-18..23, BR-15/16 |
| RBAC | `@Permissions(...)` + `PermissionsGuard`; aksi sensitif perlu approval | FR-AUT-02/03, BR-11 |
| Stok non-negatif | Operasi yang membuat stok negatif ditolak (lock baris saat konkuren) | FR-INV-06, BR-05 |
| TypeScript E2E | Shared types FE↔BE; jangan duplikasi tipe secara liar | PRD §7.4 |
| HTTPS wajib | Akses kamera (scan) & WebUSB (print) butuh HTTPS | SRS §2.5 |

### Layered Pattern (Backend)
`Controller (tipis) → Service (use-case, buka transaction, publish event) → Domain → Repository (data)`.
Controller **tidak** berisi logika bisnis. Repository **tidak** mengakses tabel modul lain.

### Domain Events (in-process)
Gunakan event yang sudah didefinisikan (Backend.md §5): `TransactionCompleted`, `SalesReturned`,
`PurchaseReceived`, `PurchaseReturned`, `StockAdjusted`, `StockTransferred`, `PaymentRecorded`,
`ExpenseRecorded`, `VoucherRedeemed`, `BookingCreated`/`PreOrderCreated`, `LowStockDetected`/`ExpiryNearing`.
**Jangan** menambah event baru tanpa mencatatnya di PLAN + alasan tertaut kebutuhan.

---

## 3. Modul & Kepemilikan

Modul NestJS (Backend.md §2). Setiap modul punya boundary jelas:

`AuthModule` · `BusinessModule` · `UserModule` (HRM) · `ProductModule` · `StockModule` ·
`PricingModule` (+voucher) · `CustomerModule` (CRM) · `SalesModule` (checkout/tab) ·
`PurchaseModule` · `ContactModule` · `BookingModule` · `AccountingModule` ·
`CashRegisterModule` · `ReportModule`.

Frontend (SvelteKit) mengikuti `Frontend.md`. **Aturan frontend (anti-halu):**
- **API-first, bukan DB-first.** Frontend bicara ke API (`Backend.md §8`) + shared types, **bukan** ke database. Schema DB (`Backend.md §9`) hanya konteks pendukung.
- **Urutan baca:** SRS §3 (FR) + §10 (AC) → `Backend.md §8` (API) → `Frontend.md` (route/komponen) → `reference/frontend/*.html|png` (visual) → (pendukung) `Backend.md §9`.
- **File referensi HTML/PNG** ada di `reference/frontend/` = panduan **visual/markup saja**, bukan sumber kebenaran perilaku. Bila bertentangan dengan `FR-*`/`AC-*` → requirement menang; catat selisih di PLAN.
- Jangan mengarang layar di luar PRD §10 & SRS §6.1 tanpa ID requirement.

Struktur folder backend usulan ada di Backend.md §11 — **ikuti**, jangan buat struktur tandingan.

---

## 4. Alur Kerja Agent (Wajib)

Setiap kali mengerjakan tugas, ikuti loop **REQ-driven TDD** ini:

1. **Orient** — Baca `docs/PLAN.md` (status terkini) + bagian spec terkait (cari ID `FR-*`/`AC-*`).
2. **Plan** — Tambahkan/operasikan item di `docs/PLAN.md` dengan ID kebutuhan & acceptance criteria.
3. **Confirm scope** — Pastikan item ada di fase aktif. Jika tidak → konfirmasi dulu.
4. **Test-first (RED)** — Untuk item kritikal, tulis test **dari requirement** (turunkan dari `AC-*`/`FR-*`/`BR-*`) lebih dulu. Test harus **gagal** sebelum kode ditulis (membuktikan test benar-benar menguji sesuatu). Lihat §6.
5. **Implement (GREEN)** — Tulis kode minimal sesuai layered pattern + boundary + aturan ACID/idempotency hingga test hijau.
6. **Quality Gate** — Jalankan gerbang: **typecheck → lint → test → build**. SEMUA wajib hijau. Halusinasi (endpoint/kolom/tipe/logika karangan) akan gagal di sini. Lihat §6.2.
7. **Review** — Untuk perubahan logika kritikal, jalankan agent **`pos-code-reviewer`** (`.kiro/agents/pos-code-reviewer.md`) untuk menangkap asumsi palsu yang lolos compiler.
8. **Record** — Tandai item selesai di PLAN (status gate + test), catat keputusan & file berubah. Tautkan ID.
9. **Surface** — Laporkan ke user: apa yang berubah, ID yang dipenuhi, hasil gate, cara review (branch/PR).

> **Aturan emas:** jangan menyatakan "selesai" sebelum diverifikasi terhadap acceptance criteria.
> Command exit 0 ≠ benar. Verifikasi tiap kriteria; jika tidak bisa diverifikasi, **katakan terus terang**.

---

## 5. Konvensi Kode & Data

- **Bahasa:** TypeScript end-to-end. Strict mode aktif.
- **ORM:** **Drizzle ORM** (type-safe, SQL-like). Skema tabel didefinisikan per modul di `src/db/schema/*.ts`; migrasi via `drizzle-kit`. Jangan memakai ORM lain (Prisma/TypeORM). Repository membungkus akses Drizzle; jangan query tabel modul lain.
- **Validasi:** DTO + `class-validator` di backend; validasi berlapis (FE + BE) — SRS §8.
- **Error:** gunakan kode error baku SRS §8 (`E-VAL-400`, `E-AUTH-401`, `E-PERM-403`, `E-VOUCHER-409`, `E-STOCK-409`, `E-TAB-409`, `E-DUP-409`, `E-PAY-422`, `E-NET-409`, `E-SRV-500`).
- **API:** REST versioned `/api/v1`; endpoint persis seperti Backend.md §8. Jangan mengubah path/verb tanpa alasan.
- **DB:** skema persis Backend.md §9. Tambah kolom hanya bila tertaut kebutuhan; catat di PLAN.
- **Naming:** ikuti nama entitas/kolom/event yang sudah ada (jangan rename sembarangan).
- **Audit:** tabel transaksional punya `created_at`, `updated_at`, `created_by`; aksi sensitif dicatat (NFR-SEC-03).
- **Uang:** gunakan tipe `decimal`/integer minor-unit yang konsisten; jangan pakai float untuk uang.

---

## 6. TDD & Quality Gate (REQ-driven) — Lapisan Anti-Halusinasi

Filosofi: **ubah "tolong jangan halu" menjadi "halu = build merah".** Dokumen (AGENTS/PLAN) adalah guardrail *lunak*; bagian ini adalah guardrail *keras* yang membuat halusinasi **gagal secara objektif**.

### 6.1 TDD Berbasis Requirement
- Untuk **item kritikal**, tulis test **sebelum** implementasi, diturunkan langsung dari ID requirement (`AC-*` SRS §10, `FR-*`, `BR-*`, kode error `E-*` SRS §8).
- **Setiap test wajib menautkan ID requirement** di nama/deskripsinya, mis. `describe('AC-02 / FR-PRC-05: voucher single-use', ...)`. Test tanpa ID = indikasi scope creep.
- Siklus **RED → GREEN → REFACTOR**: pastikan test gagal dulu (RED) agar terbukti menguji perilaku nyata, baru buat hijau (GREEN).
- **Wajib TDD (jalur kritikal):** checkout & idempotency (`FR-SAL-09`), redeem voucher atomik (`FR-PRC-08`, `AC-02`), batas 10 tab (`FR-SAL-19`, `E-TAB-409`), stok non-negatif (`FR-INV-06`, `BR-05`), stock transfer ACID (`FR-STK-04`, `AC-06`), rekonsiliasi shift (`FR-CSH-03`), RBAC (`FR-AUT-02`, `AC-11`), tolak bayar < tagihan (`FR-SAL-08`, `E-PAY-422`).
- **Cukup test ringan (non-kritikal):** CRUD master sederhana, UI murni → smoke test + typecheck saja.
- Mode test: **single-run** (`--run`/`--ci`), bukan watch (lingkungan sandbox).

### 6.2 Quality Gate (urutan WAJIB hijau)
Sebelum item PLAN ditandai ✅, gerbang berikut harus **semua hijau** (lihat `.github/workflows/quality-gate.yml`):

| Urutan | Gate | Menangkap halusinasi berupa |
|---|---|---|
| 1 | **typecheck** (`tsc --noEmit`) | endpoint/kolom/tipe/field karangan, signature salah |
| 2 | **lint** (eslint) | impor lintas-modul terlarang, anti-pattern, dead code |
| 3 | **test** (unit + integrasi REQ-driven) | logika bisnis/aturan karangan, AC tidak terpenuhi |
| 4 | **build** (kompilasi produksi) | kode yang tidak benar-benar dapat di-build |
| 5 | **e2e** (Playwright, fungsional) | alur layar melenceng dari requirement; UI tak merender data dari util/API |

Prinsip: **jika satu gate merah, pekerjaan belum selesai — titik.** Jangan menonaktifkan/men-skip test atau menambah `// @ts-ignore` untuk "menghijaukan" gate.

**E2E & Visual regression (frontend):**
- E2E **fungsional** (assertion DOM/perilaku terikat `FR/AC`) masuk gate via skrip `test:e2e` (tag `@visual` dikecualikan).
- **Visual regression** (`toHaveScreenshot`, tag `@visual`) bersifat **opt-in** (`test:e2e:visual`) karena baseline piksel sensitif terhadap lingkungan (font/AA). **Cara membuat baseline yang konsisten dengan gate:** jalankan workflow **Actions → Update Visual Baselines** (`update-visual-baseline.yml`) yang generate `--update-snapshots` di CI lalu commit baseline. Alternatif lokal: `pnpm --filter web test:e2e:visual --update-snapshots`. Saat menyetujui baseline, bandingkan dengan `reference/frontend/Reference/<layar>/screen.png`. Detail: `apps/web/e2e/README.md`.

### 6.3 Code Review oleh Agent
- Setelah gate hijau, untuk perubahan logika kritikal jalankan agent **`pos-code-reviewer`** (didefinisikan di `.kiro/agents/pos-code-reviewer.md`).
- Reviewer memeriksa hal yang **lolos compiler tapi salah semantik**: boundary modul ditembus, transaksi/idempotency hilang, float untuk uang, AC tidak benar-benar terpenuhi, asumsi yang tidak ada di spec.
- Temuan reviewer ditangani sebelum PR di-merge.

### 6.4 Verifikasi Akhir
- Verifikasi eksplisit terhadap **Acceptance Criteria SRS §10** dan **Business Rules §5** — bukan sekadar "test hijau", tapi "AC yang relevan benar-benar tercakup oleh test".

---

## 7. Git & Kolaborasi

- Push ke **branch baru**, jangan langsung `main`/`master` (kecuali diminta).
- Pesan commit menyertakan ID kebutuhan, mis. `feat(sales): tab transaksi maks 10 (FR-SAL-19, BR-15)`.
- Stage file spesifik (hindari `git add .`). Jangan ubah git config, jangan force-push.
- Setelah selesai, sertakan link PR/branch untuk review (user tidak punya akses filesystem langsung).

---

## 8. Definition of Done (DoD)

Sebuah unit kerja dianggap **selesai** bila SEMUA terpenuhi:

- [ ] Tertaut ke ≥1 ID kebutuhan (`FR/NFR/BR/UC`).
- [ ] **(Jalur kritikal)** Test REQ-driven ditulis lebih dulu (RED→GREEN) & menautkan ID requirement.
- [ ] Sesuai boundary modul & layered pattern (tidak ada akses lintas-tabel).
- [ ] Operasi keuangan/stok dibungkus DB transaction (bila relevan); checkout idempotent.
- [ ] Validasi input + error handling sesuai SRS §8.
- [ ] Memenuhi Acceptance Criteria SRS §10 terkait (tercakup oleh test, bukan sekadar diasumsikan).
- [ ] **Quality Gate hijau semua:** typecheck → lint → test → build (tanpa skip/`@ts-ignore`).
- [ ] **(Logika kritikal)** Sudah dilewatkan `pos-code-reviewer` & temuan ditangani.
- [ ] `docs/PLAN.md` diperbarui (status, kolom Test/AC & gate, keputusan, file berubah, traceability).
- [ ] Tidak ada scope creep / fitur tak diminta.

---

## 9. Yang DILARANG (Hard Stops)

- ❌ Mengubah arsitektur jadi microservices / memecah DB.
- ❌ Modul mengakses tabel/repository modul lain langsung.
- ❌ Menambah fitur/endpoint/event/library di luar scope tanpa konfirmasi.
- ❌ Menghapus atau menulis ulang dokumen spec tanpa permintaan eksplisit.
- ❌ Checkout/keuangan tanpa transaction atau tanpa idempotency.
- ❌ Float untuk nilai uang.
- ❌ Menyatakan "selesai" tanpa verifikasi terhadap acceptance criteria.
- ❌ Mengarang nilai/aturan yang tidak ada di spec.
- ❌ Menonaktifkan/men-skip test, menambah `// @ts-ignore`, atau melemahkan quality gate demi "menghijaukan" build.

---

## 10. Saat Ragu

Jika kebutuhan ambigu, bertentangan, atau hilang:
1. Cari di `SRS.md` (paling rinci) → `PRD.md` → `Backend.md`/`Frontend.md`.
2. Jika tetap tidak jelas: **hentikan**, tulis pertanyaan di `docs/PLAN.md` (bagian "Open Questions"), dan tanyakan user.
3. Jangan melanjutkan dengan asumsi yang berisiko menambah drift.
