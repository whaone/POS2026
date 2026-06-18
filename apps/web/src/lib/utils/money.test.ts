import { describe, it, expect } from 'vitest';
import { assertMoney, lineTotal, sumMoney, formatRupiah, NonIntegerMoneyError } from './money';

/**
 * REQ-driven tests.
 * Mengunci aturan: uang = integer (no float) — AGENTS.md §5/§9, NFR-DATA-01.
 */
describe('money utils (no-float rule)', () => {
	it('assertMoney menolak nilai float (mencegah halusinasi tipe uang)', () => {
		expect(() => assertMoney(10.5)).toThrow(NonIntegerMoneyError);
		expect(assertMoney(10000)).toBe(10000);
	});

	it('lineTotal menghitung integer unitPrice * qty', () => {
		expect(lineTotal(25000, 2)).toBe(50000);
	});

	it('lineTotal menolak qty negatif / non-integer', () => {
		expect(() => lineTotal(25000, -1)).toThrow(RangeError);
		expect(() => lineTotal(25000, 1.5)).toThrow(RangeError);
	});

	it('sumMoney menjumlahkan baris dengan benar', () => {
		expect(sumMoney([50000, 35000, 100000])).toBe(185000);
	});

	it('formatRupiah memformat sesuai id-ID tanpa pecahan', () => {
		// gunakan replace untuk menormalkan spasi non-breaking dari Intl
		expect(formatRupiah(185000).replace(/\u00a0/g, ' ')).toContain('185.000');
	});
});
