import { ApiClient } from './client';
import type { Tab, HeldCart, UpdateTabDto } from '../types/tabs';

export class TabsApi {
	static async listTabs(): Promise<Tab[]> {
		return await ApiClient.get<Tab[]>('/sales/tabs');
	}

	static async openTab(): Promise<Tab> {
		return await ApiClient.post<Tab>('/sales/tabs', {});
	}

	static async getTab(id: string): Promise<Tab> {
		return await ApiClient.get<Tab>(`/sales/tabs/${id}`);
	}

	static async updateTab(id: string, data: UpdateTabDto): Promise<Tab> {
		return await ApiClient.patch<Tab>(`/sales/tabs/${id}`, data);
	}

	static async holdTab(id: string): Promise<Tab> {
		return await ApiClient.post<Tab>(`/sales/tabs/${id}/hold`, {});
	}

	static async resumeTab(id: string): Promise<Tab> {
		return await ApiClient.post<Tab>(`/sales/tabs/${id}/resume`, {});
	}

	static async parkTab(id: string): Promise<HeldCart> {
		return await ApiClient.post<HeldCart>(`/sales/tabs/${id}/park`, {});
	}

	static async closeTab(id: string): Promise<void> {
		return await ApiClient.delete<void>(`/sales/tabs/${id}`);
	}
}
