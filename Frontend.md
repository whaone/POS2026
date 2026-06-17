# Frontend Specification (UI/UX Requirement)
# Sistem POS Modular Berbasis Monolith

> **Versi:** 0.1 (Kerangka awal — siap diisi detail per layar)
> **Stack Frontend:** SvelteKit (web app online, SSR/SPA) + TypeScript
> **Dokumen terkait:** `PRD.md` (§7, §9, §10), `SRS.md` (§3 FR, §6.1 UI, §8 error, §10 AC), `Backend.md` (§8 API, §7 WebSocket)
> **Tujuan:** Mendefinisikan peta route, komponen, state, kontrak data (API-first), dan pemetaan tiap layar ke ID kebutuhan agar implementasi UI tidak menyimpang dari spec (anti-drift).

---

## Daftar Isi
1. Prinsip Frontend (Wajib Dibaca)
2. Tech Stack & Struktur Folder
3. Folder Referensi Desain (HTML + PNG)
4. Peta Route & Layar (→ FR)
5. Komponen Utama
6. State Management & Data Fetching
7. Real-time (WebSocket)
8. Penanganan Error di UI (→ SRS §8)
9. Kebutuhan Non-Fungsional UI
10. Matriks Ketertelusuran (Layar → Kebutuhan)
11. Backlog UI Fase 1 & Open Items

---

## 1. Prinsip Frontend (Wajib Dibaca)

> Lihat juga `AGENTS.md` §1 (anti-drift) & §6 (TDD/quality gate). Prinsip di bawah mencegah halusinasi UI.

1. **API-first, bukan DB-first.** Frontend bicara ke **API** (`Backend.md §8`), **tidak** ke database. Jangan mendesain UI dari kolom tabel (`Backend.md §9`); schema hanya **konteks pendukung** untuk memahami bentuk data. Sumber kebenaran data UI = **kontrak API + shared types**.
2. **Perilaku dari requirement, tampilan dari referensi.** Logika/aturan layar diturunkan dari `FR-*` & `AC-*` (SRS). File **HTML/PNG referensi hanya panduan VISUAL & markup** — bukan sumber kebenaran perilaku.
3. **Setiap route/komponen menautkan ID** (`FR-*`/`UC-*`/`AC-*`). Tanpa ID = indikasi scope creep.
4. **Validasi berlapis.** Validasi sisi klien untuk UX, tetapi backend tetap otoritas final (SRS §8).
5. **Online & idempotent-aware.** Aplikasi online (bukan offline-first). UI checkout harus menangani retry dengan `idempotency_key` (FR-SAL-09) dan menampilkan UX retry yang jelas (E-NET-409).
6. **HTTPS wajib** untuk akses kamera (scan) & WebUSB/print (SRS §2.5).

### Urutan baca untuk tugas frontend
```
1. SRS §3 (FR layar tsb) + §10 (AC)     → APA yang dikerjakan (perilaku)
2. Backend.md §8 (kontrak API)          → DENGAN APA UI bicara
3. Frontend.md (route/komponen)          → DI MANA & BAGAIMANA struktur UI
4. reference/frontend/*.html + *.png     → SEPERTI APA tampilannya (visual)
5. (pendukung) Backend.md §9 schema      → konteks bentuk data (BUKAN kontrak)
```

---

## 2. Tech Stack & Struktur Folder

- **SvelteKit** + **TypeScript** (strict). Bundle ringan, cocok untuk perangkat kasir spek terbatas (PRD §7.4).
- **Shared types FE↔BE**: tipe request/response API didefinisikan/diselaraskan dengan backend (satu sumber, hindari duplikasi liar).
- **Styling**: _(TBD — tentukan: Tailwind / UnoCSS / CSS vanilla; catat di PLAN sebagai keputusan)._
- **Testing**: Vitest (unit komponen) + Playwright (E2E opsional), single-run di CI (AGENTS §6.2).

Usulan struktur (`src/`):
```
src/
├── routes/                      # route SvelteKit (file-based)
│   ├── (auth)/login/
│   ├── (pos)/                   # area kasir (perlu shift terbuka)
│   │   ├── checkout/
│   │   ├── tabs/
│   │   └── register/            # cash register
│   └── (admin)/                 # dashboard admin
├── lib/
│   ├── api/                     # API client per modul (fetch wrapper) -> kontrak Backend §8
│   ├── types/                   # shared types (selaras dgn API/DTO backend)
│   ├── stores/                  # state (svelte stores): cart, tabs, session, shift
│   ├── components/              # komponen reusable (Cart, TabBar, PaymentModal, Scanner)
│   ├── ws/                      # client WebSocket (stock:changed, booking:queue)
│   └── utils/                   # money (decimal/minor-unit), format, validasi
└── app.html
```

> **Catatan uang:** seluruh nilai uang memakai integer minor-unit atau decimal yang konsisten — **dilarang float** (AGENTS §5, §9).

---

## 3. Folder Referensi Desain (HTML + PNG)

File referensi desain dari pemilik produk disimpan di **`reference/frontend/`** (read-only, panduan visual).

**Konvensi penamaan** (memudahkan pemetaan ke route & FR):
```
reference/frontend/
├── login.html              login.png            → /login            (FR-AUT-01)
├── pos-checkout.html       pos-checkout.png      → /pos/checkout     (FR-SAL-01..09)
├── pos-tabs.html           pos-tabs.png          → /pos/tabs         (FR-SAL-18..23)
├── scan.html               scan.png              → komponen Scanner  (FR-SCN-01..05)
├── register.html           register.png          → /pos/register     (FR-CSH-01..04)
└── ...                     ...
```

**Aturan penggunaan referensi:**
- HTML referensi dikonversi menjadi **komponen Svelte**; jangan disalin mentah ke produksi.
- Bila referensi bertentangan dengan `FR-*`/`AC-*`, **requirement menang** — catat selisihnya di `docs/PLAN.md` (Open Questions) dan konfirmasi ke user.
- PNG = acuan tata letak/spacing/warna; bukan sumber teks/aturan final.
- Jangan mengarang layar yang tidak ada di PRD §10 / SRS §6.1 hanya karena ada di referensi tanpa ID requirement.

---

## 4. Peta Route & Layar (→ FR)

> Berdasarkan PRD §9–§10 & SRS §6.1. Detail per layar diisi bertahap.

| Route | Layar | Peran utama | Kebutuhan |
|---|---|---|---|
| `/login` | Login | Autentikasi JWT | `FR-AUT-01`, `E-AUTH-401` |
| `/pos/register` | Cash Register | Buka/tutup shift, kas masuk/keluar, rekonsiliasi | `FR-CSH-01..04`, `UC-03`, `AC-04` |
| `/pos/checkout` | POS Checkout | Keranjang, item, pajak, diskon, split payment, struk | `FR-SAL-01..09`, `FR-SAL-12`, `UC-01`, `AC-01` |
| `/pos/tabs` | Tab Bar Transaksi | Maks 10 tab paralel, hold/resume/park | `FR-SAL-18..23`, `BR-15/16`, `UC-08`, `AC-03b` |
| (komponen) | Scanner | Scan barcode kamera 1D/2D + fallback manual | `FR-SCN-01..05`, `UC-26` |
| (komponen) | Payment Modal | Split payment + voucher | `FR-SAL-03`, `FR-PRC-06`, `E-PAY-422` |
| `/products` | Katalog Produk | CRUD produk dasar, lookup barcode | `FR-INV-01`, `FR-PRD-01` |
| `/stock` | Stok | Stok per lokasi + real-time | `FR-INV-03/04`, `AC-09` |
| `/admin/...` | Admin Dashboard | Bisnis, harga/promo, voucher, laporan | `FR-BIZ-*`, `FR-RPT-*` (Fase lanjut) |

---

## 5. Komponen Utama

| Komponen | Fungsi | Kebutuhan |
|---|---|---|
| `TabBar` | Menampilkan ≤10 tab, indikator status (Active/On Hold), item count, total | `FR-SAL-18..21`, `BR-15` |
| `Cart` | Daftar item, qty, harga, subtotal/pajak/total real-time | `FR-SAL-01`, `FR-SAL-05` |
| `Scanner` | getUserMedia + BarcodeDetector (fallback ZXing) + input manual | `FR-SCN-01..04` |
| `PaymentModal` | Split payment, terapkan voucher, validasi total | `FR-SAL-03/08`, `FR-PRC-06` |
| `CustomerPicker` | Walk-in / quick add / cari pelanggan | `FR-SAL-14`, `FR-CRM-01` |
| `ReceiptPreview` | Pratinjau & cetak struk (ESC/POS) | `FR-SAL-06`, `FR-CFG-04` |
| `ShiftPanel` | Buka/tutup shift + rekonsiliasi | `FR-CSH-01..03` |

---

## 6. State Management & Data Fetching

- **Stores** (svelte): `session` (user/permissions), `shift` (status kas), `tabs` (≤10 tab + tab aktif), `cart` (turunan tab aktif).
- **Isolasi tab:** state tiap tab terpisah; pindah tab tidak mengubah tab lain (`FR-SAL-20`). Tab On Hold dipersist via API ke backend (`FR-SAL-22`).
- **API client** (`lib/api/*`): wrapper `fetch` dengan JWT, penanganan error baku (SRS §8), dan `idempotency_key` untuk checkout (`FR-SAL-09`).
- **RBAC di UI:** sembunyikan/disable aksi sesuai permission; backend tetap menolak (`FR-AUT-02`, `AC-11`). UI bukan satu-satunya penjaga.

---

## 7. Real-time (WebSocket)

Lihat `Backend.md §7`. Klien subscribe:
- `stock:changed` → perbarui tampilan stok real-time (`FR-INV-04`, `AC-09`).
- `booking:queue` → antrean booking di layar POS (`FR-BOK-02`, Fase lanjut).

---

## 8. Penanganan Error di UI (→ SRS §8)

Petakan kode error backend ke umpan balik UI yang jelas:

| Kode | UI |
|---|---|
| `E-VAL-400` | Highlight field + pesan validasi |
| `E-AUTH-401` | Redirect ke `/login` |
| `E-PERM-403` | Toast "akses ditolak"; sembunyikan aksi |
| `E-VOUCHER-409` | Tolak voucher, tampilkan alasan, lanjut tanpa voucher |
| `E-STOCK-409` | Tolak tambah/checkout item; tampilkan stok |
| `E-TAB-409` | Tolak buka tab ke-11; minta selesaikan/tutup/parkir |
| `E-PAY-422` | Tolak bayar < tagihan (non-kredit) |
| `E-NET-409` | UX retry jelas; aman karena idempotency_key |

---

## 9. Kebutuhan Non-Fungsional UI

- **Performa:** operasi POS terasa < 200 ms (`NFR-PERF-01`); optimistic UI bila aman.
- **Usabilitas:** alur checkout minim langkah; keyboard shortcuts (`FR-SAL-13`); pelatihan kasir < 1 jam (`NFR-USAB-01`).
- **Kompatibilitas:** browser modern; BarcodeDetector + fallback (`NFR-COMPAT-01`).
- **Responsif:** tablet/desktop/smartphone, mode kiosk (SRS §2.4).
- **HTTPS wajib** (kamera/print).

---

## 10. Matriks Ketertelusuran (Layar → Kebutuhan)

| Layar/Komponen | FR | BR/NFR | UC | AC |
|---|---|---|---|---|
| Login | FR-AUT-01 | NFR-SEC-01 | — | — |
| Cash Register | FR-CSH-01..04 | BR-07 | UC-03 | AC-04 |
| POS Checkout | FR-SAL-01..09, FR-SAL-12 | BR-04, NFR-REL-01 | UC-01 | AC-01, AC-05 |
| Tab Bar | FR-SAL-18..23 | BR-15, BR-16 | UC-08 | AC-03b |
| Scanner | FR-SCN-01..05 | NFR-COMPAT-01 | UC-01 | — |
| Payment Modal | FR-SAL-03/08, FR-PRC-06 | BR-04 | UC-01 | AC-01 |
| Stok real-time | FR-INV-03/04 | — | — | AC-09 |

---

## 11. Backlog UI Fase 1 & Open Items

**Backlog (selaras `docs/PLAN.md` Fase 1):**
- [ ] Layout dasar + auth guard + RBAC visibility (`FR-AUT-01/02`)
- [ ] Shift panel (buka/tutup + rekonsiliasi) (`FR-CSH-*`)
- [ ] POS checkout + cart + payment modal (`FR-SAL-01..09`)
- [ ] Tab bar (≤10, hold/resume/park) (`FR-SAL-18..23`)
- [ ] Scanner komponen (`FR-SCN-*`)
- [ ] Tampilan stok real-time (`FR-INV-04`)

**Open Items (butuh keputusan — catat di `docs/PLAN.md`):**
- Library styling (Tailwind / UnoCSS / lainnya).
- Strategi shared types (generate dari OpenAPI backend vs paket types manual).
- Strategi cetak struk Fase 1 (WebUSB/WebBluetooth langsung vs bridge lokal) — terkait Q3 di PLAN.
- Detail final tiap layar menyesuaikan file `reference/frontend/*` setelah disediakan user.
