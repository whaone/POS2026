# Referensi Desain Frontend

Folder ini menampung **file referensi UI** dari pemilik produk: markup **HTML** statis dan/atau gambar **PNG** (mockup/desain).

> Lihat aturan lengkap di `Frontend.md` §3 dan `AGENTS.md` §3.

## Status & Aturan

- File di sini adalah **panduan VISUAL & markup saja** — **bukan** sumber kebenaran perilaku.
- **Perilaku layar** tetap diturunkan dari requirement: `SRS.md` §3 (`FR-*`) & §10 (`AC-*`).
- **Data layar** berasal dari **API** (`Backend.md §8`) + shared types — **bukan** dari schema DB.
- Bila referensi bertentangan dengan `FR-*`/`AC-*`, **requirement menang**. Catat selisihnya di `docs/PLAN.md` (Open Questions) dan konfirmasi ke user.
- HTML referensi dikonversi menjadi komponen Svelte; jangan disalin mentah ke produksi.

## Konvensi Penamaan

Beri nama file sesuai route/komponen + tautkan ke FR (lihat tabel `Frontend.md` §4):

```
reference/frontend/
├── login.html / login.png                 → /login          (FR-AUT-01)
├── pos-checkout.html / pos-checkout.png    → /pos/checkout   (FR-SAL-01..09)
├── pos-tabs.html / pos-tabs.png            → /pos/tabs       (FR-SAL-18..23)
├── scan.html / scan.png                    → komponen Scanner (FR-SCN-01..05)
├── register.html / register.png            → /pos/register   (FR-CSH-01..04)
└── ...
```

## Cara Pakai (untuk agent/kontributor)

1. Baca requirement layar (`FR-*`/`AC-*`) dan kontrak API (`Backend.md §8`) **lebih dulu**.
2. Baru gunakan file di folder ini sebagai acuan tata letak/spacing/warna.
3. Konversi ke komponen Svelte di `src/lib/components` / route terkait.
4. Pastikan perilaku lolos test REQ-driven & quality gate (`AGENTS.md` §6).

_Folder ini masih kosong dari file desain. Tambahkan file HTML/PNG sesuai konvensi di atas._
