import { ApiClient } from './client';
import type { Shift, CashMovement, OpenShiftDto, CashMovementDto, CloseShiftDto } from '../types/shift';

const isNotFound = (error: unknown): boolean => {
	return typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 404;
};

export class RegisterApi {
	static async getCurrent(): Promise<Shift | null> {
		try {
			return await ApiClient.get<Shift | null>('/register/current');
		} catch (error) {
			if (isNotFound(error)) return null;
			throw error;
		}
	}

	static async open(data: OpenShiftDto): Promise<Shift> {
		return await ApiClient.post<Shift>('/register/open', data);
	}

	static async close(data: CloseShiftDto): Promise<Shift> {
		return await ApiClient.post<Shift>('/register/close', data);
	}

	static async cashIn(data: CashMovementDto): Promise<CashMovement> {
		return await ApiClient.post<CashMovement>('/register/cash-in', data);
	}

	static async cashOut(data: CashMovementDto): Promise<CashMovement> {
		return await ApiClient.post<CashMovement>('/register/cash-out', data);
	}
}
