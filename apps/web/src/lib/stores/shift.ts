import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Shift } from '../types/shift';

interface ShiftState {
	active: Shift | null;
	isLoaded: boolean;
}

const getStoredShift = (): ShiftState => {
	if (!browser) return { active: null, isLoaded: false };
	try {
		const stored = localStorage.getItem('pos_shift');
		if (stored) {
			return { active: JSON.parse(stored), isLoaded: true };
		}
	} catch (e) {
		console.error('Failed to parse shift', e);
	}
	return { active: null, isLoaded: false };
};

function createShiftStore() {
	const { subscribe, set, update } = writable<ShiftState>(getStoredShift());

	return {
		subscribe,
		setShift: (shift: Shift | null) => {
			if (browser) {
				if (shift) {
					localStorage.setItem('pos_shift', JSON.stringify(shift));
				} else {
					localStorage.removeItem('pos_shift');
				}
			}
			set({ active: shift, isLoaded: true });
		},
		updateShift: (shift: Shift) => {
			update(() => {
				const newState = { active: shift, isLoaded: true };
				if (browser) {
					localStorage.setItem('pos_shift', JSON.stringify(shift));
				}
				return newState;
			});
		}
	};
}

export const shift = createShiftStore();
