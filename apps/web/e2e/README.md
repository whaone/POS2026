# E2E & Visual Regression (Playwright)

Test end-to-end untuk `apps/web`. Lihat aturan gate di `AGENTS.md` §6.2.

## Dua jenis test

| Jenis | Tag | Masuk gate? | Skrip |
|---|---|---|---|
| **Fungsional** (assertion DOM/perilaku terikat `FR/AC`) | — | ✅ Ya | `pnpm --filter web test:e2e` |
| **Visual regression** (`toHaveScreenshot`) | `@visual` | ❌ Opt-in | `pnpm --filter web test:e2e:visual` |

- `test:e2e` menjalankan **fungsional saja** (`--grep-invert @visual`) → dipakai quality gate (deterministik, lintas-lingkungan aman).
- `test:e2e:visual` menjalankan **visual saja** (`--grep @visual`) → butuh baseline.

## Menjalankan lokal

```bash
pnpm install
pnpm --filter web exec playwright install --with-deps chromium

# fungsional (sama seperti gate)
pnpm --filter web test:e2e

# visual (perlu baseline lebih dulu, lihat di bawah)
pnpm --filter web test:e2e:visual
```

## Baseline visual

Baseline piksel **sensitif terhadap lingkungan** (font/anti-aliasing berbeda antar OS),
sehingga harus dibuat di lingkungan yang konsisten dengan tempat ia diverifikasi.

**Rekomendasi: generate baseline di CI** (lingkungan identik dengan gate):

1. Buka tab **Actions → Update Visual Baselines → Run workflow**, pilih branch.
2. Workflow `update-visual-baseline.yml` menjalankan `--update-snapshots` di ubuntu-CI lalu
   **commit baseline** ke `apps/web/e2e/__screenshots__/` pada branch tsb.
3. Setelah itu `test:e2e:visual` dapat dipakai untuk mendeteksi regresi.

**Atau generate lokal** (baseline akan cocok untuk mesin Anda saja):

```bash
pnpm --filter web test:e2e:visual --update-snapshots
```

> Saat **menyetujui** baseline baru, bandingkan secara visual dengan mockup acuan di
> `reference/frontend/Reference/<layar>/screen.png` agar sesuai design system "Luminous Industrial".

## Menambah test baru

- Tambahkan file `*.spec.ts` di folder ini.
- Tautkan ID requirement (`FR-*`/`AC-*`) di deskripsi `test(...)`.
- Test visual diberi tag `@visual` pada judulnya agar tidak masuk gate sampai baseline stabil.
