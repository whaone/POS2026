import { test, expect } from '@playwright/test';

test.describe('POS Checkout', () => {
	test.beforeEach(async ({ page }) => {
		// Mock Auth Session in localStorage
		await page.addInitScript(() => {
			window.localStorage.setItem('pos_session', JSON.stringify({
				user: { id: 'u1', email: 'test@test.com', businessId: 'b1', roles: [] },
				tokens: { accessToken: 'mock', refreshToken: 'mock' }
			}));
		});

		// Mock GET products
		await page.route('**/api/v1/products', async route => {
			await route.fulfill({
				status: 200,
				json: {
					data: [
						{
							id: 'prod-1',
							sku: 'SKU-001',
							name: 'Tote Bag',
							categoryId: 'cat-1',
							price: 150000,
							taxRate: 11
						},
						{
							id: 'prod-2',
							sku: 'SKU-002',
							name: 'T-Shirt',
							categoryId: 'cat-1',
							price: 120000,
							taxRate: 11
						}
					],
					meta: { total: 2, page: 1, limit: 10 }
				}
			});
		});

		// Mock POST cart
		await page.route('**/api/v1/sales/cart', async route => {
			await route.fulfill({
				status: 201,
				json: {
					sale: {
						id: 'sale-1',
						businessId: 'biz-1',
						locationId: 'loc-1',
						status: 'pending',
						subtotal: 150000,
						taxTotal: 16500,
						grandTotal: 166500,
						items: []
					}
				}
			});
		});

		// Mock POST pay
		await page.route('**/api/v1/checkout/pay', async route => {
			await route.fulfill({
				status: 200,
				json: {
					sale: { id: 'sale-1', status: 'paid' },
					payments: []
				}
			});
		});

		await page.goto('/checkout');
	});

	test('tambah produk ke keranjang dan bayar (AC-01, AC-05)', async ({ page }) => {
		// Tunggu produk muncul
		await expect(page.getByText('Artisan Espresso')).toBeVisible();
		
		// Klik produk
		await page.getByText('Artisan Espresso').click();

		// Cek keranjang (45.000 + tax 11% = 49.950)
		await expect(page.getByText('Rp 49.950').first()).toBeVisible();

		// Klik Pay
		await page.getByRole('button', { name: 'Pay' }).click();

		// Cek modal payment
		await expect(page.getByRole('heading', { name: 'Payment', level: 2 })).toBeVisible();
		await expect(page.getByText('Total Due')).toBeVisible();

		// Klik Confirm Payment
		await page.locator('button').filter({ hasText: 'Confirm Payment' }).click();

		// Success message muncul
		await expect(page.getByText('Payment successful!')).toBeVisible();
		
		await expect(page.getByRole('heading', { name: 'Product Catalog' })).toBeVisible();
	});
});
