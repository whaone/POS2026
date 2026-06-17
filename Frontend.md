# Frontend Specification
# Sistem POS Modular Berbasis Monolith

> **Versi:** 1.0 (Online Web App)
> **Stack Frontend:** SvelteKit + TypeScript (web app online, SSR/SPA) + TailwindCSS
> **Dokumen terkait:** `PRD.md`, `SRS.md`, `Backend.md`, `Sequence_Diagram.md`
> **Tujuan:** Merinci arsitektur frontend, routing/halaman, manajemen state, komponen, integrasi API & real-time, hardware, auth, serta UX fitur kasir (termasuk tab transaksi multi-pelanggan).

> **Penting:** Frontend ini adalah **web app online biasa** (SvelteKit) yang berkomunikasi langsung ke backend NestJS via REST/WebSocket. **Bukan PWA / bukan offline-first** — tidak ada service worker, tidak ada IndexedDB/Dexie, dan tidak ada sinkronisasi offline. Aplikasi mengandalkan koneksi internet aktif saat operasi.

---

## Daftar Isi
1. Prinsip & Pendekatan Frontend
2. Tech Stack Frontend
3. Arsitektur Frontend (Layer & Folder)
4. Routing & Struktur Halaman
5. Manajemen State (Svelte Stores)
6. Lapisan API & Real-time (REST + WebSocket)
7. Autentikasi & RBAC di Frontend
8. Layar POS Kasir (Checkout)
9. Tab Transaksi Multi-Pelanggan (UI/UX)
10. Admin Dashboard
11. Scan Barcode via Kamera (Browser)
12. Integrasi Hardware (Printer ESC/POS, Cash Drawer, Scanner HID)
13. Penanganan Error & UX Retry (Online)
14. Komponen UI Bersama (Design System)
15. Responsivitas, Mode Kiosk & Aksesibilitas
16. Lokalisasi (i18n) & Format
17. Performa Frontend (NFR)
18. Keamanan Frontend
19. Struktur Folder Frontend
20. Checklist Pekerjaan Frontend

---

## 1. Prinsip & Pendekatan Frontend

- **Online web app (bukan PWA):** koneksi internet wajib; tidak ada mode offline, service worker, atau cache transaksi lokal.
- **SvelteKit:** memanfaatkan compiler Svelte (tanpa Virtual DOM) untuk bundle kecil & UI cepat — cocok untuk perangkat kasir spek terbatas.
- **Optimistic UI** untuk operasi keranjang (tambah/ubah item) agar terasa instan, dengan rekonsiliasi ke respons server.
- **Type-safe end-to-end:** TypeScript + shared types dengan backend (DTO) untuk meminimalkan kesalahan kontrak API.
- **Component-driven & modular:** struktur fitur mengikuti modul domain backend (sales, products, stock, dst.).
- **Aksesibilitas & keyboard-first:** alur kasir dioptimalkan untuk keyboard shortcut dan layar sentuh.
- **Responsif:** mendukung tablet, desktop, dan smartphone; mendukung mode kiosk fullscreen.

---

## 2. Tech Stack Frontend

```
Framework   : SvelteKit (TypeScript)
Rendering   : SSR untuk halaman publik/login + SPA/CSR untuk area POS & dashboard
Styling     : TailwindCSS (+ komponen UI ringan, mis. Melt UI / bits-ui)
State       : Svelte stores (writable/derived) + context API
Data/Fetch  : SvelteKit `load` + thin API client (fetch) ; opsi TanStack Query (svelte-query) untuk cache
Real-time   : socket.io-client (selaras Socket.IO di backend)
Form/Valid. : Zod (skema validasi, dibagikan dengan tipe DTO)
Barcode     : BarcodeDetector API + fallback @zxing/browser
Printing    : ESC/POS via WebUSB/Web Serial atau bridge print service
Charts      : Chart.js / LayerChart (untuk laporan & dashboard)
i18n        : svelte-i18n (atau Paraglide) ; default id-ID
Build/Tooling: Vite, ESLint, Prettier, Vitest + Playwright (E2E)
```

> Catatan: **tidak ada** `@vite-pwa`, service worker, atau penyimpanan offline. `service-worker.ts` SvelteKit tidak digunakan.

---

## 3. Arsitektur Frontend (Layer & Folder)

Pemisahan tanggung jawab:

```
Routes (SvelteKit)        -> halaman & layout, route guard, load data
 └─ Feature Modules       -> komponen + store + service per domain (sales, products, ...)
     └─ UI Components      -> komponen presentasional (design system)
     └─ Stores             -> state UI & data (cart, tabs, auth, session)
     └─ Services/API       -> pemanggilan REST/WebSocket (thin client)
Core/Lib                  -> apiClient, wsClient, auth, i18n, format, types (shared DTO)
```

**Pola:**
- **Route component** tipis: ambil data (`load`), render, delegasikan aksi ke service/store.
- **Store** memegang state (mis. `cartStore`, `tabStore`); komponen subscribe secara reaktif.
- **Service** membungkus endpoint backend (mis. `salesService.openTab()`), mengembalikan tipe DTO.
- Komponen domain tidak memanggil `fetch` langsung — selalu via service.

---

## 4. Routing & Struktur Halaman

SvelteKit file-based routing. Dua area utama: **POS** (kasir) dan **Admin**.

```
/login                          # autentikasi (SSR)
/(pos)                          # layout kasir (butuh shift terbuka + permission sale.create)
  /(pos)/register/open          # buka shift (modal awal)
  /(pos)/checkout               # layar kasir utama + bar tab transaksi
  /(pos)/register/close         # tutup shift & rekonsiliasi
/(admin)                        # layout dashboard (sidebar)
  /(admin)/dashboard            # ringkasan KPI & chart
  /(admin)/products             # katalog (single/variable, SKU, label, CSV)
  /(admin)/stock                # stok, adjustment, transfer, alert
  /(admin)/pricing              # pricelist, diskon, markdown, voucher
  /(admin)/customers            # CRM & loyalty
  /(admin)/sales                # daftar transaksi, sales return
  /(admin)/purchases            # pembelian & purchase return
  /(admin)/contacts             # supplier/customer + ledger
  /(admin)/bookings             # kalender & pre-order
  /(admin)/accounting           # payment account, balance sheet, cash flow
  /(admin)/hr                   # users, roles, user matrix, payroll, expense
  /(admin)/reports              # laporan lengkap + filter & chart
  /(admin)/settings             # business, lokasi, invoice, barcode, devices
```

- Grup `(pos)` & `(admin)` memakai **layout** masing-masing dengan **route guard** (cek token + permission).
- Akses langsung ke route tanpa izin -> redirect ke halaman yang sesuai / tampilkan 403.

---

## 5. Manajemen State (Svelte Stores)

| Store | Isi | Catatan |
|---|---|---|
| `authStore` | user, token, permissions, business_id, location_id | sumber kebenaran sesi; dipakai route guard |
| `sessionStore` | shift aktif (open/closed), opening balance | wajib terbuka untuk transaksi |
| `tabStore` | daftar tab transaksi aktif (maks 10), `activeTabId` | lihat Bagian 9 |
| `cartStore` (per tab) | item, qty, pelanggan, diskon/voucher, salesperson, pajak, total | state terisolasi per tab |
| `productSearchStore` | hasil pencarian/scan produk | cache ringan |
| `stockStore` | snapshot stok real-time (langganan WebSocket) | update via `stock:changed` |
| `uiStore` | toast, modal, loading global, status koneksi | UX |

- Total/subtotal/pajak dihitung via **derived store** dari `cartStore` agar selalu konsisten.
- Tidak ada persistensi offline; **state tab yang di-hold dipersist ke backend** (lihat Bagian 9), bukan ke storage browser.

---

## 6. Lapisan API & Real-time (REST + WebSocket)

### 6.1 REST Client
- Thin wrapper `fetch` (`core/apiClient.ts`): base URL `/api/v1`, menyisipkan `Authorization: Bearer`, header tenant (`business_id`/`location_id`), dan `Idempotency-Key` untuk operasi tulis kritikal (checkout).
- Penanganan token: refresh otomatis saat 401 (sekali), lalu logout bila gagal.
- Mapping error backend (lihat `SRS.md` Bagian 8) ke pesan/aksi UI (lihat Bagian 13).

### 6.2 WebSocket Client
- `core/wsClient.ts` (socket.io-client) untuk:
  - `stock:check` / `stock:changed` -> update `stockStore` real-time.
  - `booking:queue` -> antrean booking di layar POS.
- Reconnect otomatis; saat terputus tampilkan indikator status koneksi (lihat Bagian 13).

### 6.3 Idempotency
- Setiap checkout mengirim `Idempotency-Key` unik per transaksi. Jika koneksi terganggu, UI aman melakukan **retry** dengan key yang sama (backend tidak akan membuat transaksi dobel).

---

## 7. Autentikasi & RBAC di Frontend

- Login menukar kredensial -> access + refresh token (JWT) -> disimpan di `authStore` (memori; refresh token via httpOnly cookie bila tersedia).
- **Route guard** di layout `(pos)` & `(admin)`: redirect ke `/login` bila tak ada sesi.
- **Permission-based rendering:** helper `can('sale.create')` menyembunyikan/menonaktifkan menu & aksi sesuai permission user (mis. void, diskon manual, hapus transaksi).
- Aksi sensitif yang butuh approval supervisor memunculkan modal otorisasi (PIN/login supervisor).

---

## 8. Layar POS Kasir (Checkout)

Tata letak layar kasir utama (`/(pos)/checkout`):

```
+-----------------------------------------------------------------------+
| [Tab A: Andi (3)] [Tab B: Walk-In (1) • On Hold] [+]      <- BAR TAB   |
+----------------------------+------------------------------------------+
| Pencarian / Scan produk    |  Keranjang (item, qty, harga, diskon)    |
| Grid kategori & produk     |  ...                                     |
|                            |  Subtotal / Pajak / Diskon / Total       |
| [Scan kamera] [Manual]     |  Pelanggan: [pilih/Quick Add]            |
|                            |  Salesperson/Agen komisi                 |
+----------------------------+------------------------------------------+
| [Hold] [Parkir] [Diskon] [Voucher]            [BAYAR / Split Payment]  |
+-----------------------------------------------------------------------+
```

**Fitur (mengacu FR-SAL di `SRS.md`):**
- Tambah item via **scan barcode** (kamera/HID) atau pencarian manual; perhitungan harga sesuai pricelist pelanggan (real-time).
- **Split payment** (Tunai, QRIS, Kartu, Cheque, Bank Transfer, Voucher) dalam satu modal pembayaran.
- **Voucher & diskon**: input kode -> validasi ke backend -> tampil potongan; voucher single-use.
- **Walk-In / Quick Add Customer** dari layar POS.
- **Keyboard shortcuts** (mis. F2 cari produk, F4 bayar, F8 hold) & fully-AJAX.
- **Cetak struk** + buka cash drawer setelah transaksi sukses.
- **Sales return**, penjualan kredit/partial.

---

## 9. Tab Transaksi Multi-Pelanggan (UI/UX)

Fitur unggulan kasir: **bar tab mirip tab browser** untuk melayani beberapa pelanggan paralel. Mengacu **FR-SAL-18..23**, **BR-15/16** (`SRS.md`), endpoint **8.8.1 `/sales/tabs`** & tabel `transaction_tab` (`Backend.md`), dan diagram **5A** (`Sequence_Diagram.md`).

### 9.1 Perilaku UI
- **Bar tab** di atas layar checkout menampilkan setiap transaksi aktif sebagai satu tab.
- **Maksimal 10 tab** aktif per sesi kasir. Tombol **[+]** menonaktif/menolak saat sudah 10 tab; UI menampilkan pesan dari `E-TAB-409` (selesaikan/tutup/parkir tab dahulu).
- **Indikator per tab:** label pelanggan (atau "Walk-In"), jumlah item, total sementara, dan badge status (**Active** / **On Hold**), plus penanda perubahan belum tersimpan.
- **Berpindah tab** tidak mempengaruhi tab lain — tiap tab punya `cartStore` terisolasi.
- **Hold:** menekan Hold mengubah tab jadi *On Hold*; **tab tetap tampil di bar** (tidak hilang). Kasir bisa pindah ke tab lain dan kembali kapan saja.
- **Persistensi:** saat di-hold, state tab dikirim ke backend (`POST /sales/tabs/{id}/hold`) sehingga **pulih setelah refresh browser / ganti perangkat** (di-load dari `GET /sales/tabs` saat layar dibuka). Tab baru yang masih kosong cukup di klien sampai item pertama ditambahkan.
- **Resume:** klik tab *On Hold* -> `POST /sales/tabs/{id}/resume` -> tab kembali *Active* dan keranjang pulih utuh.
- **Park (turunkan ke Parkir Tagihan):** untuk mengosongkan slot/menyimpan jangka panjang -> `POST /sales/tabs/{id}/park` -> tab pindah ke daftar Parkir Tagihan dan slot tab kosong. Parkir tagihan dapat diangkat kembali menjadi tab baru.
- **Tutup tab:** bila masih ada item, tampilkan konfirmasi (**Selesaikan pembayaran / Parkir tagihan / Buang**).
- **Setelah checkout sukses**, tab otomatis ditutup; bila tidak ada tab tersisa, buat tab kosong baru.

### 9.2 Hubungan dengan Parkir Tagihan
- **Tab** = transaksi aktif atau *On Hold* dalam sesi kasir saat ini (akses cepat via bar tab).
- **Parkir Tagihan** = penyimpanan jangka lebih panjang / lintas sesi & lintas kasir.
- Alur konversi dua arah: **Tab -> Park** dan **Parkir -> Resume jadi Tab**.

### 9.3 Contoh State (klien)
```ts
type TransactionTab = {
  id: string;             // id tab dari backend (atau temp id bila masih kosong)
  tabIndex: number;       // 1..10
  label: string;          // nama pelanggan / "Walk-In"
  status: 'active' | 'on_hold';
  itemCount: number;
  subtotal: number;
  dirty: boolean;         // ada perubahan belum tersimpan
};
// tabStore: { tabs: TransactionTab[]; activeTabId: string | null }  (maks 10 tabs)
```

---

## 10. Admin Dashboard

- **Sidebar navigasi** mengikuti modul domain; menu tampil sesuai permission.
- **Dashboard KPI**: penjualan, laba-rugi ringkas, produk fast/slow moving, performa salesperson (chart).
- **Tabel data** standar: pencarian, filter, pagination server-side, ekspor.
- **CRUD** untuk produk, stok (adjustment/transfer), pricing/voucher, customer, purchase, contact, accounting, HR, settings.
- **Laporan**: filter periode/cabang + chart + ekspor (P&L, purchase/sell, stock, tax, expense, cash register, salesperson, dll.).

---

## 11. Scan Barcode via Kamera (Browser)

Mengacu **FR-SCN** (`SRS.md`) & diagram **26** (`Sequence_Diagram.md`).
- Gunakan **`getUserMedia`** untuk akses kamera (wajib **HTTPS**).
- Decode via **`BarcodeDetector` API**; fallback **`@zxing/browser`** untuk browser tanpa dukungan.
- Mendukung 1D (EAN/UPC) & 2D (QR/QRIS).
- **Umpan balik** visual (highlight) + audio (beep) saat scan berhasil.
- **Input manual fallback** bila izin kamera ditolak/kamera tidak ada.
- Hasil scan diteruskan ke konteks aktif: tambah item ke tab aktif, lookup produk, validasi voucher, atau ambil pre-order.

---

## 12. Integrasi Hardware (Printer ESC/POS, Cash Drawer, Scanner HID)

- **Barcode scanner USB/Bluetooth (HID):** terbaca sebagai input keyboard; ditangani via listener fokus pada field scan (tanpa driver khusus).
- **Thermal printer ESC/POS:** cetak struk via WebUSB/Web Serial (butuh HTTPS) atau melalui bridge print service lokal; render dari template invoice (multi-template).
- **Cash drawer:** dibuka via kick-out command printer saat transaksi tunai.
- Sediakan **opsi cetak ulang/lewati** bila printer tidak terjangkau (`E-HW-PRINT`).

---

## 13. Penanganan Error & UX Retry (Online)

Karena aplikasi online-only, UX konektivitas penting:
- **Indikator status koneksi** (online/terputus) di header; saat WebSocket/REST gagal, tampilkan banner.
- **Kegagalan jaringan saat checkout** (`E-NET-409`): tampilkan dialog dengan tombol **Coba Lagi** yang mengirim ulang request memakai **Idempotency-Key** yang sama (aman dari dobel).
- Mapping error -> UX:
  | Kode | UX |
  |---|---|
  | `E-VAL-400` | Highlight field + pesan validasi inline |
  | `E-AUTH-401` | Refresh token sekali; bila gagal -> ke `/login` |
  | `E-PERM-403` | Toast "akses ditolak"; sembunyikan aksi |
  | `E-VOUCHER-409` | Tandai voucher tidak bisa dipakai; lanjut tanpa voucher |
  | `E-STOCK-409` | Tampilkan stok tidak cukup; cegah checkout |
  | `E-TAB-409` | Nonaktifkan tombol [+]; minta selesaikan/tutup/parkir tab |
  | `E-PAY-422` | Tampilkan kurang bayar; cegah submit |
  | `E-NET-409` | Dialog retry (idempotent) |
- **Loading & skeleton** untuk daftar/laporan; **optimistic update** untuk keranjang dengan rollback bila server menolak.

---

## 14. Komponen UI Bersama (Design System)

Komponen presentasional reusable (TailwindCSS):
- **Dasar:** Button, Input, Select, Checkbox/Radio, Switch, Badge, Tabs, Modal/Dialog, Drawer, Toast, Tooltip, Spinner/Skeleton.
- **Data:** DataTable (sortable, filter, pagination), Pagination, EmptyState, KPfor Card, Chart wrapper.
- **Domain POS:** ProductCard/Grid, CartLine, PaymentMethodRow (split payment), VoucherInput, CustomerPicker, **TransactionTabBar**, **TransactionTabItem**, NumericKeypad, ReceiptPreview.
- Konsisten: token warna/spacing, dark/light opsional, fokus & state aksesibel.

---

## 15. Responsivitas, Mode Kiosk & Aksesibilitas

- **Responsif**: tablet (utama kasir), desktop (admin), smartphone (scan/ringkas).
- **Mode kiosk**: layar penuh, nonaktifkan navigasi browser yang tidak perlu, target sentuh besar.
- **Aksesibilitas (a11y)**: navigasi keyboard penuh, label ARIA, kontras memadai (WCAG AA), fokus terlihat, dukungan pembaca layar pada komponen inti.

---

## 16. Lokalisasi (i18n) & Format

- Default **id-ID**; struktur i18n siap multi-bahasa.
- **Mata uang, zona waktu, format tanggal/angka** mengikuti pengaturan bisnis (`business`/settings), bukan hard-coded.
- Pajak & pembulatan mengikuti aturan bisnis (lihat BR di `SRS.md`).

---

## 17. Performa Frontend (NFR)

Mengacu NFR di `SRS.md`:
- Respons UI operasi checkout terasa instan (target interaksi < 200 ms; perhitungan keranjang di klien).
- Bundle kecil (keunggulan Svelte); code-splitting per route; lazy-load modul admin/laporan.
- Virtualisasi daftar panjang (produk/laporan); debounce pencarian/scan.
- Hindari render ulang berlebihan via derived store yang tepat.

---

## 18. Keamanan Frontend

- **HTTPS wajib** (syarat kamera, WebUSB/Serial, keamanan token).
- Token disimpan aman (refresh token httpOnly cookie bila memungkinkan; access token di memori).
- **Sanitasi/escape** semua output dinamis; hindari `@html` tanpa sanitasi.
- Tidak menyimpan data transaksi sensitif di localStorage/IndexedDB (selaras kebijakan non-offline).
- Render aksi sesuai permission (defense in depth — backend tetap otoritatif).

---

## 19. Struktur Folder Frontend (usulan)

```
src/
├── app.html
├── app.css                       # Tailwind base
├── lib/
│   ├── core/
│   │   ├── apiClient.ts           # REST wrapper (auth, tenant, idempotency)
│   │   ├── wsClient.ts            # socket.io-client
│   │   ├── auth.ts                # session, guard helpers, can()
│   │   ├── i18n.ts
│   │   └── format.ts              # currency/date/number per business
│   ├── types/                     # shared DTO types (selaras backend)
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── session.ts
│   │   ├── tabs.ts                # tabStore (maks 10)
│   │   ├── cart.ts                # cart per tab
│   │   └── stock.ts
│   ├── components/                # design system (Bagian 14)
│   └── features/
│       ├── pos/                   # checkout, tab bar, payment, scan
│       ├── products/
│       ├── stock/
│       ├── pricing/               # + voucher
│       ├── customers/
│       ├── sales/
│       ├── purchases/
│       ├── contacts/
│       ├── bookings/
│       ├── accounting/
│       ├── hr/
│       ├── reports/
│       └── settings/
├── routes/
│   ├── login/
│   ├── (pos)/                     # layout + guard kasir
│   └── (admin)/                   # layout + guard admin
└── (TIDAK ADA service-worker.ts — bukan PWA)
```

---

## 20. Checklist Pekerjaan Frontend

**Fondasi**
- [ ] Setup SvelteKit + TypeScript + TailwindCSS + Vite (tanpa plugin PWA/service worker)
- [ ] Core: apiClient (auth/tenant/idempotency), wsClient (Socket.IO), i18n, format
- [ ] Shared DTO types selaras `Backend.md`
- [ ] Auth: login, refresh token, route guard, `can()` permission helper
- [ ] Design system dasar (Button, Input, Modal, DataTable, Toast, dll.)

**POS Kasir**
- [ ] Buka/Tutup shift (cash control) + rekonsiliasi
- [ ] Layar checkout (pencarian/scan, keranjang, perhitungan real-time)
- [ ] Split payment (Tunai/QRIS/Kartu/Cheque/Transfer/Voucher)
- [ ] Voucher & diskon (validasi ke backend, single-use)
- [ ] **Tab transaksi multi-pelanggan (maks 10, hold tetap di tab, resume, park) + persist ke backend**
- [ ] Parkir tagihan (jangka panjang) + resume jadi tab
- [ ] Walk-In/Quick Add Customer, salesperson/commission agent
- [ ] Cetak struk ESC/POS + cash drawer; sales return
- [ ] Scan barcode kamera (BarcodeDetector + ZXing fallback + input manual)
- [ ] Keyboard shortcuts & fully-AJAX

**Admin Dashboard**
- [ ] Dashboard KPI + chart
- [ ] Products (single/variable, SKU, label, import CSV)
- [ ] Stock (adjustment, transfer, alert, real-time via WebSocket)
- [ ] Pricing (pricelist, diskon, markdown, voucher batch)
- [ ] Customers (CRM, loyalty)
- [ ] Sales, Purchases, Contacts (ledger)
- [ ] Bookings (kalender, pre-order, DP)
- [ ] Accounting (payment account, balance sheet, trial balance, cash flow)
- [ ] HR (users, roles, user matrix, payroll, expense)
- [ ] Reports (filter, chart, ekspor)
- [ ] Settings (business, lokasi, invoice template, barcode, devices)

**Lintas Fitur**
- [ ] Indikator status koneksi + UX retry idempotent (online-only)
- [ ] Mapping error backend -> UX (Bagian 13)
- [ ] Responsif + mode kiosk + aksesibilitas (a11y)
- [ ] Lokalisasi (mata uang/zona waktu/format per business)
- [ ] Pengujian: Vitest (unit/komponen) + Playwright (E2E alur kasir & tab)

---

> **Dokumen pendamping:**
> - `PRD.md` — Product Requirements Document.
> - `SRS.md` — Software Requirements Specification (FR/NFR ber-ID).
> - `Backend.md` — spesifikasi backend (modul, endpoint, skema DB).
> - `Sequence_Diagram.md` — sequence diagram (termasuk 5A: tab transaksi).
