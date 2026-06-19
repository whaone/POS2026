import { test, expect } from '@playwright/test';

test.describe('Shift Panel (Register)', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			window.localStorage.setItem('pos_session', JSON.stringify({
				user: { id: 'u1', email: 'test@test.com', businessId: 'b1', roles: [] },
				tokens: { accessToken: 'mock', refreshToken: 'mock' }
			}));
		});
	});

	test('membuka shift baru, cash in, dan tutup shift (AC-04)', async ({ page }) => {
		// 1. Mock state: no active shift
		await page.route('**/api/v1/register/current', async route => {
			await route.fulfill({ status: 404, json: { statusCode: 404, message: 'No open shift' } });
		});

		await page.goto('/register');

		// 2. Mock POST open shift
		await page.route('**/api/v1/register/open', async route => {
			await route.fulfill({
				status: 201,
				json: {
					id: 'shift-1',
					locationId: 'loc-1',
					openedAt: new Date().toISOString(),
					openingBalance: 500000,
					systemCash: 500000,
					status: 'open'
				}
			});
		});

		// 3. Mock state: active shift
		await page.route('**/api/v1/register/current', async route => {
			await route.fulfill({
				status: 200,
				json: {
					id: 'shift-1',
					locationId: 'loc-1',
					openedAt: new Date().toISOString(),
					openingBalance: 500000,
					systemCash: 500000,
					status: 'open'
				}
			});
		});

		await expect(page.getByRole('heading', { name: 'Open Shift' })).toBeVisible();
		
		// Klik Start Shift (dengan default 500.000)
		await page.getByRole('button', { name: 'Start Shift' }).click();

		// Layar berubah ke active shift
		await expect(page.getByText('Shift active')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'System Expected Totals' })).toBeVisible();
		
		// Cek perbedaan nol (karena system = counted = 500.000)
		await expect(page.getByText('Rp 0')).toBeVisible();

		// 4. Mock POST cash in
		await page.route('**/api/v1/register/cash-in', async route => {
			await route.fulfill({
				status: 201,
				json: { id: 'mov-1', type: 'in', amount: 50000 }
			});
		});
		
		// 5. Mock state after cash in
		await page.route('**/api/v1/register/current', async route => {
			await route.fulfill({
				status: 200,
				json: {
					id: 'shift-1',
					locationId: 'loc-1',
					openedAt: new Date().toISOString(),
					openingBalance: 500000,
					systemCash: 550000,
					status: 'open'
				}
			});
		});

		// Masukkan 50.000 cash in
		await page.getByPlaceholder('Amount').fill('50000');
		await page.getByRole('button', { name: 'Save Movement' }).click();

		await expect(page.getByText('Cash in recorded.')).toBeVisible();
		await expect(page.getByText('Rp 550.000').first()).toBeVisible();

		// Closing counted syncs to expected cash after reload
		await expect(page.getByText('Rp 0')).toBeVisible();

		// 6. Mock close shift
		await page.route('**/api/v1/register/close', async route => {
			await route.fulfill({
				status: 201,
				json: { id: 'shift-1', status: 'closed' }
			});
		});

		// Back to no shift mock
		await page.route('**/api/v1/register/current', async route => {
			await route.fulfill({ status: 404, json: { statusCode: 404, message: 'No open shift' } });
		});

		await page.getByRole('button', { name: 'Close Shift & Print Report' }).click();

		await expect(page.getByText('Shift closed.')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Open Shift' })).toBeVisible();
	});
});
