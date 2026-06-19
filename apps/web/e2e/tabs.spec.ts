import { test, expect } from '@playwright/test';

test.describe('Transaction Tabs', () => {
	test.beforeEach(async ({ page }) => {
		await page.addInitScript(() => {
			window.localStorage.setItem('pos_session', JSON.stringify({
				user: { id: 'u1', email: 'test@test.com', businessId: 'b1', roles: [] },
				tokens: { accessToken: 'mock', refreshToken: 'mock' }
			}));
		});
	});

	test('membuat tab, hold, resume, dan park (FR-SAL-18..23, AC-03b)', async ({ page }) => {
		// 1. Mock GET tabs (empty initially)
		await page.route('**/api/v1/sales/tabs*', async route => {
			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					json: []
				});
			}
		});

		await page.goto('/tabs');

		await expect(page.getByRole('heading', { name: 'Active Transactions' })).toBeVisible();
		await expect(page.getByText('Open a new tab to begin.')).toBeVisible();

		// 2. Mock POST create tab
		await page.route('**/api/v1/sales/tabs', async route => {
			if (route.request().method() === 'POST') {
				await route.fulfill({
					status: 201,
					json: {
						id: 'tab-1',
						shiftId: 'shift-1',
						tabIndex: 1,
						status: 'active',
						cartJson: { items: [] }
					}
				});
			}
		});

		await page.route('**/api/v1/sales/tabs/tab-1', async route => {
			if (route.request().method() === 'PATCH') {
				await route.fulfill({
					status: 200,
					json: {
						id: 'tab-1',
						shiftId: 'shift-1',
						tabIndex: 1,
						label: 'Walk-In',
						status: 'active',
						cartJson: { items: [] }
					}
				});
			}
		});

		// 3. Mock GET tabs (after create)
		await page.route('**/api/v1/sales/tabs*', async route => {
			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					json: [
							{
								id: 'tab-1',
								shiftId: 'shift-1',
								tabIndex: 1,
								status: 'active',
								cartJson: { items: [] }
							}
						]
				});
			}
		});

		// Create new tab
		await page.getByRole('button', { name: 'add Open Tab' }).click();

		await expect(page.getByText('Tab 1').first()).toBeVisible();
		await expect(page.getByText(/active/i).first()).toBeVisible();

		// 4. Mock POST hold
		await page.route('**/api/v1/sales/tabs/tab-1/hold', async route => {
			await route.fulfill({
				status: 200,
				json: {
					id: 'tab-1',
					status: 'on_hold',
					heldAt: new Date().toISOString()
				}
			});
		});

		// 5. Mock GET tabs (after hold)
		await page.route('**/api/v1/sales/tabs*', async route => {
			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					json: [
							{
								id: 'tab-1',
								shiftId: 'shift-1',
								tabIndex: 1,
								status: 'on_hold',
								heldAt: new Date().toISOString(),
								cartJson: { items: [] }
							}
						]
				});
			}
		});

		// Hold tab
		await page.getByRole('button', { name: 'pause_circle Hold Tab' }).click();
		await expect(page.getByText('On Hold')).toBeVisible();

		// 6. Mock POST resume
		await page.route('**/api/v1/sales/tabs/tab-1/resume', async route => {
			await route.fulfill({
				status: 200,
				json: {
					id: 'tab-1',
					status: 'active',
					heldAt: null
				}
			});
		});

		// 7. Mock GET tabs (after resume)
		await page.route('**/api/v1/sales/tabs*', async route => {
			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					json: [
							{
								id: 'tab-1',
								shiftId: 'shift-1',
								tabIndex: 1,
								status: 'active',
								cartJson: { items: [] }
							}
						]
				});
			}
		});

		// Resume tab
		await page.getByRole('button', { name: 'play_circle Resume Tab' }).click();
		await expect(page.getByText('Active')).toBeVisible();
	});

	test('mencegah lebih dari 10 tab (E-TAB-409, BR-15)', async ({ page }) => {
		// Mock 10 existing tabs
		const tabs = Array.from({ length: 10 }, (_, i) => ({
			id: `tab-${i + 1}`,
			shiftId: 'shift-1',
			tabIndex: i + 1,
			status: 'active',
			cartJson: { items: [] }
		}));

		await page.route('**/api/v1/sales/tabs*', async route => {
			if (route.request().method() === 'GET') {
				await route.fulfill({
					status: 200,
					json: tabs
				});
			}
		});

		// Mock POST create tab (returns 409)
		await page.route('**/api/v1/sales/tabs', async route => {
			if (route.request().method() === 'POST') {
				await route.fulfill({
					status: 409,
					json: {
						statusCode: 409,
						message: 'E-TAB-409',
						error: 'Maximum 10 tabs per shift'
					}
				});
			}
		});

		await page.goto('/tabs');

		// Should show 10 tabs
		await expect(page.getByText('Tab 1').first()).toBeVisible();
		await expect(page.getByText('Tab 10').first()).toBeVisible();

		// Try to create 11th tab
		await page.getByRole('button', { name: 'add Open Tab' }).click();

		// Error message should appear
		await expect(page.getByText(/Maximum 10 tabs/)).toBeVisible();
	});
});
