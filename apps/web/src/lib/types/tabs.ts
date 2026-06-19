export interface Tab {
	id: string;
	businessId: string;
	locationId: string;
	shiftId: string | null;
	cashierId: string | null;
	customerId: string | null;
	tabIndex: number;
	label: string | null;
	status: 'active' | 'on_hold';
	cartJson: string | null;
	itemCount: number;
	subtotalAmount: number;
	createdAt: string;
	updatedAt: string;
	heldAt: string | null;
}

export interface HeldCart {
	id: string;
	businessId: string;
	locationId: string;
	cashierId: string | null;
	customerId: string | null;
	cartJson: string | null;
	sourceTabId: string | null;
	createdAt: string;
}

export interface UpdateTabDto {
	label?: string;
	customerId?: string;
	cartJson?: string;
	itemCount?: number;
	subtotalAmount?: number;
}
