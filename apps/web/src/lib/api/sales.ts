import { ApiClient } from './client';
import type { CheckoutPayDto, CheckoutResponse, ProductSummary } from '../types/sales';

export class SalesApi {
	static async createCart(cartData: { items: Array<{ productId: string; qty: number; unitPrice: number; discount: number; tax: number }> }): Promise<{ sale: { id: string; status: string; grandTotal: number }; items: unknown[] }> {
		return await ApiClient.post('/sales/cart', cartData);
	}

	static async pay(checkoutData: CheckoutPayDto): Promise<CheckoutResponse> {
		return await ApiClient.post<CheckoutResponse>('/checkout/pay', checkoutData);
	}

	// Mock products catalog since product API isn't fully integrated yet in frontend
	static async getProducts(): Promise<ProductSummary[]> {
		// Mock data for the POS terminal UI to render something
		return [
			{ id: 'p1', name: 'Artisan Espresso', sku: 'BEV-001', price: 45000, colorClass: 'bg-secondary-container' },
			{ id: 'p2', name: 'Avocado Toast', sku: 'FOD-001', price: 120000, colorClass: 'bg-primary-container' },
			{ id: 'p3', name: 'Matcha Latte', sku: 'BEV-002', price: 65000, colorClass: 'bg-primary-fixed-dim' },
			{ id: 'p4', name: 'Cold Brew', sku: 'BEV-003', price: 55000, colorClass: 'bg-secondary-fixed' },
			{ id: 'p5', name: 'Croissant', sku: 'FOD-002', price: 35000, colorClass: 'bg-surface-variant' },
			{ id: 'p6', name: 'Mineral Water', sku: 'BEV-004', price: 15000, colorClass: 'bg-outline-variant' }
		];
	}
}
