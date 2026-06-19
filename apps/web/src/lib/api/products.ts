import { ApiClient } from './client';
import type { Product } from '../types/inventory';

export class ProductsApi {
	static async findByBarcode(barcode: string): Promise<Product> {
		return await ApiClient.get<Product>(`/products/by-barcode/${encodeURIComponent(barcode)}`);
	}
}
