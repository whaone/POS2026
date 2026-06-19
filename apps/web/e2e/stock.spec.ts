import { test, expect } from '@playwright/test';

test.describe('Stock UI', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			window.localStorage.setItem('pos_session', JSON.stringify({
				user: { id: 'u1', email: 'test@test.com', businessId: 'b1', roles: [] },
				tokens: { accessToken: 'mock', refreshToken: 'mock' }
			}));
		});
	});

	test('menampilkan inventory real-time dengan status indikator (FR-INV-04)', async ({ page }) => {
		await page.route('**/api/v1/products', async route => {
			await route.fulfill({
				status: 200,
				json: [
					{ id: 'prod-1', sku: 'SKU-001', name: 'Tote Bag', category: { name: 'Bags' } },
					{ id: 'prod-2', sku: 'SKU-002', name: 'Keychain', category: { name: 'Accessories' } },
					{ id: 'prod-3', sku: 'SKU-003', name: 'Wallet', category: { name: 'Accessories' } }
				]
			});
		});
		await page.route('**/api/v1/stock?*', async route => {
			await route.fulfill({
				status: 200,
				json: [
					{
						productId: 'prod-1',
						locationId: 'loc-1',
						qty: 120, // healthy
						qtyHeld: 0
					},
					{
						productId: 'prod-2',
						locationId: 'loc-1',
						qty: 15, // low stock
						qtyHeld: 0
					},
					{
						productId: 'prod-3',
						locationId: 'loc-1',
						qty: 0, // out of stock
						qtyHeld: 0
					}
				]
			});
		});

		await page.goto('/stock');

		await expect(page.getByRole('heading', { name: 'Inventory Management' })).toBeVisible();

		// Verify items are rendered
		await expect(page.getByText('Tote Bag')).toBeVisible();
		await expect(page.getByText('Keychain')).toBeVisible();
		await expect(page.getByText('Wallet')).toBeVisible();

		// Verify stock status texts
		await expect(page.getByText('GOOD').first()).toBeVisible();
		await expect(page.getByText('LOW').first()).toBeVisible();
		await expect(page.getByText('EMPTY').first()).toBeVisible();

		// Note: WebSocket testing in Playwright requires a different setup, 
		// but HTTP initial fetch covers the primary UI rendering.
	});
});
