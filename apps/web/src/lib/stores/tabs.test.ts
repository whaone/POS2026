import { describe, it, expect } from 'vitest';
import {
	MAX_TABS,
	canOpenTab,
	openTab,
	holdTab,
	resumeTab,
	TabLimitError,
	type TransactionTab
} from './tabs';

/**
 * REQ-driven tests untuk tab transaksi.
 * Mengunci: FR-SAL-19 / BR-15 (maks 10 tab), FR-SAL-21 / BR-16 (hold tetap di tab), E-TAB-409.
 */
function makeTabs(n: number): TransactionTab[] {
	let tabs: TransactionTab[] = [];
	for (let i = 0; i < n; i++) tabs = openTab(tabs, `C${i + 1}`);
	return tabs;
}

describe('FR-SAL-18/19 + BR-15: batas 10 tab per shift', () => {
	it('boleh membuka tab hingga MAX_TABS', () => {
		const tabs = makeTabs(MAX_TABS);
		expect(tabs).toHaveLength(MAX_TABS);
		expect(canOpenTab(tabs)).toBe(false);
	});

	it('menolak tab ke-11 dengan TabLimitError (E-TAB-409)', () => {
		const tabs = makeTabs(MAX_TABS);
		expect(() => openTab(tabs)).toThrowError(TabLimitError);
		try {
			openTab(tabs);
		} catch (e) {
			expect((e as TabLimitError).code).toBe('E-TAB-409');
		}
	});

	it('tabIndex unik & mengisi slot terkecil yang kosong', () => {
		const tabs = makeTabs(3);
		expect(tabs.map((t) => t.tabIndex)).toEqual([1, 2, 3]);
	});
});

describe('FR-SAL-21 + BR-16: hold tetap menempati tab', () => {
	it('holdTab mengubah status tanpa menghapus tab', () => {
		let tabs = makeTabs(2);
		tabs = holdTab(tabs, 1);
		expect(tabs).toHaveLength(2);
		expect(tabs.find((t) => t.tabIndex === 1)?.status).toBe('on_hold');
	});

	it('resumeTab mengembalikan status menjadi active', () => {
		let tabs = holdTab(makeTabs(1), 1);
		tabs = resumeTab(tabs, 1);
		expect(tabs.find((t) => t.tabIndex === 1)?.status).toBe('active');
	});
});
