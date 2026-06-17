import { test, expect } from '@playwright/test';

/**
 * E2E + visual regression untuk halaman landing.
 *
 * Anti-drift: assertion fungsional terikat ke requirement, snapshot visual
 * mengunci tampilan terhadap baseline (yang disetujui agar sesuai design system
 * "Luminous Industrial" — bandingkan dengan reference screen.png tiap layar
 * saat me-review/menyetujui baseline).
 */

test.describe('Landing page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('menampilkan brand & status online (visual identity)', async ({ page }) => {
		await expect(page).toHaveTitle(/Luminous POS/);
		await expect(page.getByRole('heading', { name: 'Luminous POS', level: 1 })).toBeVisible();
		await expect(page.getByText(/Online/)).toBeVisible();
	});

	test('total keranjang diformat Rupiah tanpa pecahan (NFR-DATA-01, money util)', async ({
		page
	}) => {
		// 50.000 + 35.000 + 100.000 = 185.000 (lihat src/lib/utils/money.ts)
		await expect(page.getByText(/Rp\s?185\.000/)).toBeVisible();
	});

	test('memetakan layar Fase 1 ke ID requirement (traceability di UI)', async ({ page }) => {
		await expect(page.getByText('POS Checkout')).toBeVisible();
		await expect(page.getByText('FR-SAL-01..09')).toBeVisible();
		await expect(page.getByText('Transaction Tabs')).toBeVisible();
		await expect(page.getByText('FR-SAL-18..23')).toBeVisible();
	});

	test('visual regression: landing sesuai baseline "Luminous Industrial" @visual', async ({
		page
	}) => {
		// Tunggu font Inter & Material Symbols termuat agar snapshot stabil.
		await page.evaluate(() => document.fonts.ready);
		await expect(page).toHaveScreenshot('landing.png', { fullPage: true });
	});
});
