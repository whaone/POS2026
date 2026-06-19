export interface CartItem {
	id: string; // frontend-only temporary ID
	productId: string;
	name: string;
	qty: number;
	unitPrice: number;
	discount: number;
	tax: number;
	lineTotal: number;
}

export interface Cart {
	id?: string;
	items: CartItem[];
	subtotal: number;
	taxTotal: number;
	discountTotal: number;
	grandTotal: number;
}

export type PaymentMethodType = 'cash' | 'qris' | 'card' | 'cheque' | 'transfer' | 'voucher' | 'points';

export interface PaymentDto {
	method: PaymentMethodType;
	amount: number;
	accountId?: string;
	ref?: string;
	voucherCode?: string;
}

export interface CheckoutPayDto {
	saleId: string;
	idempotencyKey: string;
	payments: PaymentDto[];
}

export interface CheckoutResponse {
	sale: {
		id: string;
		status: string;
		grandTotal: number;
		paidTotal: number;
	};
}

export interface ProductSummary {
	id: string;
	name: string;
	sku: string;
	price: number;
	image?: string;
	colorClass?: string;
}
