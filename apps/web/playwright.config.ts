import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config (POS2026 web).
 * E2E + visual regression. Disambungkan ke quality gate (AGENTS.md §6.2).
 *
 * webServer: build + preview produksi agar yang diuji = artefak nyata.
 * Visual baseline disimpan di e2e/__screenshots__ (di-commit). Regenerasi:
 *   pnpm --filter web exec playwright test --update-snapshots
 */
const PORT = 4173;

export default defineConfig({
	testDir: './e2e',
	snapshotDir: './e2e/__screenshots__',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'on-first-retry'
	},
	/* Toleransi minor anti-aliasing antar lingkungan (font rendering). */
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.02,
			animations: 'disabled'
		}
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'pnpm run build && pnpm run preview',
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000
	}
});
