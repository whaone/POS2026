# Referensi Desain UI — "Luminous Industrial"

Katalog file referensi desain untuk **POS2026**. Berisi prototipe layar (HTML + screenshot) dan spesifikasi design system.

> **Status & aturan (anti-drift):** file di sini adalah **panduan VISUAL & markup saja**, bukan sumber kebenaran perilaku.
> - Perilaku layar diturunkan dari requirement: `SRS.md` §3 (`FR-*`) & §10 (`AC-*`).
> - Data layar berasal dari **API** (`Backend.md §8`) + shared types, **bukan** dari schema DB.
> - Bila referensi bertentangan dengan `FR-*`/`AC-*`, **requirement menang** — catat selisih di `docs/PLAN.md` (Open Questions).
> - Lihat `Frontend.md` §1 & §3 dan `AGENTS.md` §3 untuk aturan lengkap.

---

## Teknologi Prototipe

Prototipe HTML dibuat dengan:
- **Tailwind CSS** (via CDN `cdn.tailwindcss.com`, plugin `forms` + `container-queries`) dengan token warna kustom inline.
- **Font Inter** (Google Fonts) + ikon **Material Symbols Outlined**.
- `darkMode: "class"` (mendukung tema terang/gelap).

> **Implikasi keputusan:** styling produksi mengarah ke **Tailwind CSS** dengan token dari design system di bawah (lihat Q4 di `docs/PLAN.md`). Saat konversi ke SvelteKit, pindahkan token Tailwind dari CDN inline ke `tailwind.config` proyek, dan ganti CDN dengan build Tailwind biasa. Jangan memakai `cdn.tailwindcss.com` di produksi.

---

## Design System (Luminous Industrial)

Spesifikasi lengkap ada di **`luminous_industrial_1/DESIGN.md`** (dan `luminous_industrial_2/DESIGN.md` — isinya identik/duplikat). Ringkasan:

- **Gaya:** hybrid Glassmorphism + Minimalism; permukaan "frosted" + blur, mood "Luminous".
- **Warna kunci:** primary seafoam emerald (`#006c47` / aksen `#34B780`), secondary warm orange (`#994700`/`#F17B21`), background off-white (`#fbf9f7`), kartu putih (`#ffffff`), error (`#ba1a1a`).
- **Tipografi:** Inter; skala `headline-xl` (32px) → `body-md` (14px) → `label-sm` (12px, uppercase, tracking lebar).
- **Spacing:** basis 4px; xs 8 / sm 16 / md 24 / lg 32 / xl 48; margin kontainer 32px; gutter 24px.
- **Radius:** kartu 24px (`xl`), elemen interaktif 12–16px, chip/badge pill (`full`).
- **Kedalaman:** glassmorphism (border 1px putih ~50%, ambient shadow difus opacity rendah), bukan drop shadow berat.
- **Grid:** 12 kolom desktop, 4 kolom mobile.

---

## Katalog Layar → Route → Kebutuhan

> Setiap folder berisi `code.html` (markup Tailwind) dan/atau `screen.png` (screenshot). Kolom "Fase" mengacu `PRD.md §12` / `docs/PLAN.md`.

| Folder | Isi | Layar | Route usulan | Kebutuhan (SRS) | Fase |
|---|---|---|---|---|---|
| `secure_login/` | screen.png | Login aman | `/login` | `FR-AUT-01`, `E-AUTH-401` | 1 |
| `pos_terminal_sales_screen/` | code.html + png | Terminal POS / sales | `/pos/checkout` (+ tab bar) | `FR-SAL-01..09`, `FR-SAL-12..18`, `UC-01`, `AC-01` | 1 |
| `payment_split_bill/` | code.html + png | Modal pembayaran & split bill | komponen `PaymentModal` | `FR-SAL-03`, `FR-SAL-08`, `FR-PRC-06`, `E-PAY-422`, `AC-01` | 1 |
| `shift_closing_reconciliation/` | code.html + png | Tutup shift & rekonsiliasi kas | `/pos/register` (close) | `FR-CSH-03`, `BR-07`, `UC-03`, `AC-04` | 1 |
| `inventory_stock_management/` | code.html + png | Inventory & stok | `/stock`, `/products` | `FR-INV-01..06`, `FR-PRD-*`, `FR-STK-*`, `AC-09` | 1–2 |
| `admin_dashboard_overview/` | code.html + png | Dashboard admin (ringkasan) | `/admin` | `FR-RPT-01` | 1–3 |
| `sales_management_dashboard/` | code.html + png | Manajemen penjualan | `/admin/sales` | `FR-SAL-10/11/17`, `FR-RPT-06/07` | 2 |
| `purchase_management_dashboard/` | code.html + png | Manajemen pembelian | `/admin/purchases` | `FR-PUR-01..09`, `FR-RPT-07`, `UC-04` | 2 |
| `contacts_management_suppliers_customers/` | code.html + png | Kontak (supplier/customer) | `/admin/contacts` | `FR-SUP-01..04` | 2 |
| `booking_reservations_calendar/` | code.html + png | Kalender booking/reservasi | `/admin/bookings` | `FR-BOK-01..06`, `UC-06` | 3 |
| `accounting_financial_accounts/` | code.html + png | Akuntansi / payment account | `/admin/accounting` | `FR-ACC-01..06`, `AC-08` | 3 |
| `luminous_industrial_1/` | DESIGN.md | Design system (spec) | — (token & gaya) | — | semua |
| `luminous_industrial_2/` | DESIGN.md | Design system (duplikat) | — | — | semua |

---

## Catatan Cakupan (Gaps)

Beberapa kebutuhan Fase 1 **belum** punya file referensi terpisah — saat implementasi, turunkan dari requirement & integrasikan ke layar terkait (jangan menunggu mockup):

- **Tab transaksi multi-pelanggan** (`FR-SAL-18..23`, `BR-15/16`, `UC-08`): kemungkinan menjadi *tab bar* di dalam `pos_terminal_sales_screen`. Tidak ada mockup khusus → ikuti `Frontend.md` §4–§5.
- **Scanner barcode kamera** (`FR-SCN-01..05`): tidak ada mockup → komponen `Scanner` per `Frontend.md` §5.
- **Buka shift** (`FR-CSH-01`): hanya ada layar *tutup* shift; layar buka shift diturunkan dari `FR-CSH-01`.
- **`secure_login/`** hanya punya `screen.png` (tanpa `code.html`) → markup dibuat dari screenshot + `FR-AUT-01`.

Catat keputusan/selisih apa pun terhadap referensi di `docs/PLAN.md`.

---

## Cara Konversi ke SvelteKit (ringkas)

1. Baca `FR-*`/`AC-*` layar + kontrak API (`Backend.md §8`) **lebih dulu**.
2. Pindahkan token Tailwind (warna/tipografi/spacing dari `DESIGN.md`) ke `tailwind.config` proyek; hapus dependensi CDN.
3. Pecah `code.html` menjadi komponen Svelte reusable (lihat `Frontend.md` §5: `TabBar`, `Cart`, `PaymentModal`, `Scanner`, dll.).
4. Ganti data statis dengan pemanggilan API + shared types; jangan hardcode angka/aturan dari mockup.
5. Pastikan perilaku lolos test REQ-driven & quality gate (`AGENTS.md` §6).
