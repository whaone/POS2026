import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			window.localStorage.setItem('pos_session', JSON.stringify({
				user: { id: 'u1', email: 'test@test.com', businessId: 'b1', roles: [] },
				tokens: { accessToken: 'mock', refreshToken: 'mock' }
			}));
		});
	});

	test('menampilkan KPI penjualan real-time (FR-RPT-01)', async ({ page }) => {
		await page.route('**/api/v1/reports/profit-loss', async route => {
			await route.fulfill({
				status: 200,
				json: { totalSales: 5250000, netProfit: 1500000, grossProfit: 2000000 }
			});
		});
		await page.route('**/api/v1/reports/purchase-sell', async route => {
			await route.fulfill({
				status: 200,
				json: { sales: { total: 5250000 }, purchases: { total: 1000000 } }
			});
		});
		await page.route('**/api/v1/reports/stock', async route => {
			await route.fulfill({
				status: 200,
				json: { 
					lowStockItems: [ { productId: 'prod-4', name: 'Wallet', quantity: 3, minStock: 10 } ],
					totalValue: 10000000
				}
			});
		});

		await page.goto('/admin');

		await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

		// KPI cards
		await expect(page.getByText("Today's Sales")).toBeVisible();
		await expect(page.getByText('Rp 5.250.000')).toBeVisible();
		
		await expect(page.getByText('Transactions')).toBeVisible();
		await expect(page.getByText(/500/).first()).toBeVisible();

		await expect(page.getByText('Gross Profit')).toBeVisible();
		await expect(page.getByText('Rp 1.500.000')).toBeVisible();

		// Trend and stock alert sections
		await expect(page.getByText('Trending Products')).toBeVisible();
		await expect(page.getByText('Smartwatch Elite')).toBeVisible();
		await expect(page.getByText('Low Stock Alerts')).toBeVisible();
		await expect(page.getByText('1 Items')).toBeVisible();
	});

	test('dapat memilih lokasi multi-location (FR-BIZ-05)', async ({ page }) => {
		await page.route('**/api/v1/reports/profit-loss', async route => {
			await route.fulfill({ status: 200, json: { totalSales: 0, netProfit: 0, grossProfit: 0 } });
		});
		await page.route('**/api/v1/reports/purchase-sell', async route => {
			await route.fulfill({ status: 200, json: { sales: { total: 0 }, purchases: { total: 0 } } });
		});
		await page.route('**/api/v1/reports/stock', async route => {
			await route.fulfill({ status: 200, json: { lowStockItems: [], totalValue: 0 } });
		});

		await page.goto('/admin');

		// Location selector should be visible
		const locationSelect = page.locator('select').first();
		await expect(locationSelect).toBeVisible();
		await expect(locationSelect).toHaveValue('Main Store');
	});
});
