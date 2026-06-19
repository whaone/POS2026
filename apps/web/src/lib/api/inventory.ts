import { io, type Socket } from 'socket.io-client';
import { ApiClient } from './client';
import type { Product, StockChangedPayload, StockRow } from '../types/inventory';

export class InventoryApi {
	static async listProducts(): Promise<Product[]> {
		return await ApiClient.get<Product[]>('/products');
	}

	static async listStock(locationId: string): Promise<StockRow[]> {
		return await ApiClient.get<StockRow[]>(`/stock?location=${encodeURIComponent(locationId)}`);
	}

	static connectStockSocket(onChanged: (payload: StockChangedPayload) => void): Socket {
		const socket = io('/', { transports: ['websocket'] });
		socket.on('stock:changed', onChanged);
		return socket;
	}
}
