import { test, expect } from '@playwright/test';

test.describe('Login', () => {
	test('berhasil login dan menyimpan sesi (FR-AUT-01)', async ({ page }) => {
		// Mock POST login
		await page.route('**/api/v1/auth/login', async route => {
			await route.fulfill({
				status: 200,
				json: {
					user: {
						id: 'user-1',
						email: 'sarah.j@store.com',
						businessId: 'biz-1',
						roles: [{ name: 'Cashier', permissions: ['sales.create'] }]
					},
					tokens: {
						accessToken: 'mock-access',
						refreshToken: 'mock-refresh'
					}
				}
			});
		});

		await page.goto('/login');

		await expect(page.getByRole('heading', { name: 'Luminous POS' })).toBeVisible();

		await page.locator('#email').fill('sarah.j@store.com');
		await page.locator('#password').fill('password123');

		await page.getByRole('button', { name: 'Sign In' }).click();

		// Karena redirect ke '/', tunggu navigasi atau expect URL berubah
		await page.waitForURL('**/');
		await expect(page).toHaveURL('http://localhost:4173/');
	});

	test('menampilkan error jika kredensial salah (E-AUTH-401)', async ({ page }) => {
		await page.route('**/api/v1/auth/login', async route => {
			await route.fulfill({
				status: 401,
				json: { statusCode: 401, message: 'Invalid credentials' }
			});
		});

		await page.goto('/login');

		await page.locator('#email').fill('wrong@store.com');
		await page.locator('#password').fill('wrongpass');

		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Invalid email or password.')).toBeVisible();
	});
});
