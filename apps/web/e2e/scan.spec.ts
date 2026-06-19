import { test, expect } from '@playwright/test';

test.describe('Barcode Scanner', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			window.localStorage.setItem('pos_session', JSON.stringify({
				user: { id: 'u1', email: 'test@test.com', businessId: 'b1', roles: [] },
				tokens: { accessToken: 'mock', refreshToken: 'mock' }
			}));
		});
	});

	test('menampilkan UI scanner dan fallback manual input (FR-SCN-01..04)', async ({ page }) => {
		// Mock barcode lookup
		await page.route('**/api/v1/products/by-barcode/*', async route => {
			const barcode = route.request().url().split('/').pop();
			if (barcode === '8991234567890') {
				await route.fulfill({
					status: 200,
					json: {
						id: 'prod-1',
						businessId: 'biz-1',
						name: 'Tote Bag',
						type: 'single',
						brandId: null,
						categoryId: null,
						unitId: null,
						taxId: null,
						manageStock: true,
						hasExpiry: false,
						sku: 'SKU-001',
						barcode: '8991234567890',
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					}
				});
			} else {
				await route.fulfill({
					status: 404,
					json: { statusCode: 404, message: 'Product not found' }
				});
			}
		});

		await page.goto('/scan');

		await expect(page.getByRole('heading', { name: 'Scan Barcode' })).toBeVisible();

		// Scanner component should be visible (camera or fallback)
		// Note: Camera permission will be denied in headless, so manual input fallback appears
		await expect(page.getByText(/Manual Input/)).toBeVisible();

		// Manual barcode input
		await page.getByPlaceholder('Enter barcode number').fill('8991234567890');
		await page.getByRole('button', { name: 'search' }).click();

		// Product found
		await expect(page.getByText('Tote Bag').first()).toBeVisible();
		await expect(page.getByText('8991234567890').first()).toBeVisible();

		// Proceed to checkout button should be visible
		await expect(page.getByRole('button', { name: /Go to Checkout/i })).toBeVisible();
	});

	test('menampilkan error jika barcode tidak ditemukan (FR-SCN-04)', async ({ page }) => {
		await page.route('**/api/v1/products/by-barcode/*', async route => {
			await route.fulfill({
				status: 404,
				json: { statusCode: 404, message: 'Product not found' }
			});
		});

		await page.goto('/scan');

		await page.getByPlaceholder('Enter barcode number').fill('0000000000000');
		await page.getByRole('button', { name: 'search' }).click();

		await expect(page.getByText(/not found/i)).toBeVisible();
	});
});
