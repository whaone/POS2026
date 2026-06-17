/**
 * Tab transaksi multi-pelanggan — logika murni (POS2026).
 *
 * Requirements: FR-SAL-18..23, BR-15 (maks 10 tab aktif per shift), BR-16 (hold tetap di tab).
 * Error: E-TAB-409 (melebihi batas tab). Lihat SRS §3.1, §5, §8.
 *
 * Catatan: logika di sini sengaja murni (pure) agar mudah diuji oleh quality gate.
 * Persistensi state tab dilakukan via API (Backend.md §8.8.1) di layer terpisah.
 */

export const MAX_TABS = 10;

export type TabStatus = 'active' | 'on_hold';

export interface TransactionTab {
	readonly tabIndex: number; // 1..MAX_TABS
	status: TabStatus;
	label: string;
	itemCount: number;
}

/** Galat saat mencoba membuka tab melebihi batas (BR-15 / E-TAB-409). */
export class TabLimitError extends Error {
	readonly code = 'E-TAB-409';
	constructor() {
		super(`Maximum ${MAX_TABS} active tabs per shift`);
		this.name = 'TabLimitError';
	}
}

/** Apakah masih boleh membuka tab baru? */
export function canOpenTab(tabs: readonly TransactionTab[]): boolean {
	return tabs.length < MAX_TABS;
}

/**
 * Buka tab baru. Menolak (TabLimitError) bila sudah ada MAX_TABS tab.
 * tabIndex baru = indeks terkecil 1..MAX_TABS yang belum dipakai.
 */
export function openTab(tabs: readonly TransactionTab[], label = 'Walk-In'): TransactionTab[] {
	if (!canOpenTab(tabs)) {
		throw new TabLimitError();
	}
	const used = new Set(tabs.map((t) => t.tabIndex));
	let nextIndex = 1;
	while (used.has(nextIndex)) nextIndex++;
	const tab: TransactionTab = { tabIndex: nextIndex, status: 'active', label, itemCount: 0 };
	return [...tabs, tab];
}

/** Hold sebuah tab (BR-16): status menjadi on_hold tanpa menghapusnya. */
export function holdTab(tabs: readonly TransactionTab[], tabIndex: number): TransactionTab[] {
	return tabs.map((t) => (t.tabIndex === tabIndex ? { ...t, status: 'on_hold' } : t));
}

/** Resume tab yang on_hold menjadi active. */
export function resumeTab(tabs: readonly TransactionTab[], tabIndex: number): TransactionTab[] {
	return tabs.map((t) => (t.tabIndex === tabIndex ? { ...t, status: 'active' } : t));
}
