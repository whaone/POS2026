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
		let tabCreated = false;
		let tabOnHold = false;

		await page.route('**/api/v1/sales/tabs', async route => {
			const method = route.request().method();
			if (method === 'GET') {
				if (tabOnHold) {
					await route.fulfill({ status: 200, json: [{ id: 'tab-1', shiftId: 'shift-1', tabIndex: 1, label: 'Walk-In', status: 'on_hold', itemCount: 0, subtotalAmount: 0 }] });
				} else if (tabCreated) {
					await route.fulfill({ status: 200, json: [{ id: 'tab-1', shiftId: 'shift-1', tabIndex: 1, label: 'Walk-In', status: 'active', itemCount: 0, subtotalAmount: 0 }] });
				} else {
					await route.fulfill({ status: 200, json: [] });
				}
			} else if (method === 'POST') {
				tabCreated = true;
				await route.fulfill({ status: 201, json: { id: 'tab-1', shiftId: 'shift-1', tabIndex: 1, label: 'Walk-In', status: 'active', itemCount: 0, subtotalAmount: 0 } });
			} else {
				await route.fallback();
			}
		});

		await page.route('**/api/v1/sales/tabs/tab-1/hold', async route => {
			tabOnHold = true;
			await route.fulfill({ status: 200, json: { id: 'tab-1', status: 'on_hold', heldAt: new Date().toISOString() } });
		});

		await page.route('**/api/v1/sales/tabs/tab-1/resume', async route => {
			tabOnHold = false;
			await route.fulfill({ status: 200, json: { id: 'tab-1', status: 'active', heldAt: null } });
		});

		await page.route('**/api/v1/sales/tabs/tab-1', async route => {
			if (route.request().method() === 'PATCH') {
				await route.fulfill({ status: 200, json: { id: 'tab-1', shiftId: 'shift-1', tabIndex: 1, label: 'Walk-In', status: 'active', itemCount: 0, subtotalAmount: 0 } });
			} else {
				await route.fallback();
			}
		});

		await page.goto('/tabs');
		await expect(page.getByRole('heading', { name: 'Active Transactions' })).toBeVisible();
		await expect(page.getByText('Open a new tab to begin.')).toBeVisible();

		await page.getByRole('button', { name: /Open Tab/ }).click();
		await expect(page.getByText('Walk-In').first()).toBeVisible({ timeout: 10000 });

		await page.getByRole('button', { name: /Hold Tab/ }).click();
		await expect(page.getByText('On Hold').first()).toBeVisible({ timeout: 10000 });

		await page.getByRole('button', { name: /Resume Tab/ }).click();
		await expect(page.getByText('1 / 10 Tabs Active')).toBeVisible({ timeout: 10000 });
	});

	test('mencegah lebih dari 10 tab (E-TAB-409, BR-15)', async ({ page }) => {
		const tabs = Array.from({ length: 10 }, (_, i) => ({
			id: `tab-${i + 1}`,
			shiftId: 'shift-1',
			tabIndex: i + 1,
			label: `Tab ${i + 1}`,
			status: 'active',
			itemCount: 0,
			subtotalAmount: 0
		}));

		await page.route('**/api/v1/sales/tabs', async route => {
			const method = route.request().method();
			if (method === 'GET') {
				await route.fulfill({ status: 200, json: tabs });
			} else if (method === 'POST') {
				await route.fulfill({ status: 409, json: { statusCode: 409, message: 'E-TAB-409', error: 'Maximum 10 tabs per shift' } });
			} else {
				await route.fallback();
			}
		});

		await page.goto('/tabs');

		await expect(page.getByText('10 / 10 Tabs Active')).toBeVisible({ timeout: 10000 });

		await page.getByRole('button', { name: /Open Tab/ }).click();
		await expect(page.getByText('Tab limit reached')).toBeVisible({ timeout: 10000 });
	});
});
