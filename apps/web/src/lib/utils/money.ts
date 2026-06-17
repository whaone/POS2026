/**
 * Money utilities (POS2026).
 *
 * Aturan (AGENTS.md §5, §9): nilai uang TIDAK boleh memakai float.
 * Semua nilai direpresentasikan sebagai BIGINT/integer dalam satuan terkecil
 * (untuk IDR: rupiah penuh, tanpa sen). Operasi aritmetika dilakukan pada integer.
 */

export type Money = number; // integer rupiah (minor unit untuk mata uang tanpa pecahan)

/** Galat bila nilai bukan integer (mencegah float menyusup ke domain uang). */
export class NonIntegerMoneyError extends Error {
	readonly code = 'E-MONEY-INT';
	constructor(value: number) {
		super(`Money value must be an integer (got ${value})`);
		this.name = 'NonIntegerMoneyError';
	}
}

/** Validasi bahwa sebuah angka adalah Money yang sah (integer, finite). */
export function assertMoney(value: number): Money {
	if (!Number.isInteger(value)) {
		throw new NonIntegerMoneyError(value);
	}
	return value;
}

/** Hitung total baris = unitPrice * qty (keduanya integer). */
export function lineTotal(unitPrice: Money, qty: number): Money {
	assertMoney(unitPrice);
	if (!Number.isInteger(qty) || qty < 0) {
		throw new RangeError(`qty must be a non-negative integer (got ${qty})`);
	}
	return unitPrice * qty;
}

/** Jumlahkan daftar nilai Money. */
export function sumMoney(values: readonly Money[]): Money {
	return values.reduce<Money>((acc, v) => acc + assertMoney(v), 0);
}

/** Format ke string Rupiah (id-ID), tanpa pecahan. */
export function formatRupiah(value: Money): string {
	assertMoney(value);
	return new Intl.NumberFormat('id-ID', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(value);
}
