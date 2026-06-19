import { get } from 'svelte/store';
import { session } from '../stores/session';
import { browser } from '$app/environment';

const API_BASE = '/api/v1';

export class ApiClient {
	static async getHeaders(): Promise<HeadersInit> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		};

		if (browser) {
			const state = get(session);
			if (state.tokens?.accessToken) {
				headers['Authorization'] = `Bearer ${state.tokens.accessToken}`;
			}
		}

		return headers;
	}

	static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
		const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
		const headers = await this.getHeaders();

		const response = await fetch(url, {
			...options,
			headers: {
				...headers,
				...options.headers
			}
		});

		if (response.status === 401 && endpoint !== '/auth/login') {
			session.clearSession();
			if (browser) window.location.href = '/login';
			throw new Error('Unauthorized');
		}

		const data = await response.json();

		if (!response.ok) {
			throw data;
		}

		return data as T;
	}

	static async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: 'GET' });
	}

	static async post<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: 'POST',
			body: JSON.stringify(body)
		});
	}

	static async patch<T>(endpoint: string, body: unknown, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, {
			...options,
			method: 'PATCH',
			body: JSON.stringify(body)
		});
	}

	static async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
		return this.request<T>(endpoint, { ...options, method: 'DELETE' });
	}
}
