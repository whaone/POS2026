export interface Shift {
	id: string;
	businessId: string;
	locationId: string;
	cashierId: string;
	openingBalance: number;
	closingCounted: number | null;
	systemCash: number;
	difference: number | null;
	status: 'open' | 'closed';
	openedAt: string;
	closedAt: string | null;
}

export interface CashMovement {
	id: string;
	shiftId: string;
	type: 'in' | 'out' | 'sale' | 'refund' | 'expense';
	amount: number;
	ref: string | null;
	createdAt: string;
}

export interface OpenShiftDto {
	locationId: string;
	openingBalance: number;
}

export interface CashMovementDto {
	amount: number;
	ref?: string;
}

export interface CloseShiftDto {
	closingCounted: number;
}
