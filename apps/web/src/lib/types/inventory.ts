export interface Product {
	id: string;
	businessId: string;
	name: string;
	type: string;
	brandId: string | null;
	categoryId: string | null;
	unitId: string | null;
	taxId: string | null;
	manageStock: boolean;
	hasExpiry: boolean;
	sku: string;
	barcode: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface StockRow {
	id: string;
	businessId: string;
	locationId: string;
	productId: string | null;
	variationId: string | null;
	qty: number;
	qtyHeld: number;
	createdAt: string;
	updatedAt: string;
}

export interface StockChangedPayload {
	businessId: string;
	locationId: string;
	productId: string;
	qty: number;
	qtyHeld: number;
}
