import { writable } from 'svelte/store';
import type { Cart, ProductSummary } from '../types/sales';

const generateId = () => Math.random().toString(36).substring(2, 9);

function createCartStore() {
	const initial: Cart = {
		items: [],
		subtotal: 0,
		taxTotal: 0,
		discountTotal: 0,
		grandTotal: 0
	};

	const { subscribe, set, update } = writable<Cart>(initial);

	const recalculate = (cart: Cart): Cart => {
		let subtotal = 0;
		let taxTotal = 0;
		
		cart.items.forEach(item => {
			item.lineTotal = item.qty * item.unitPrice;
			subtotal += item.lineTotal;
			taxTotal += Math.floor(item.lineTotal * 0.11); // Simple 11% mock tax
		});

		return {
			...cart,
			subtotal,
			taxTotal,
			discountTotal: 0,
			grandTotal: subtotal + taxTotal
		};
	};

	return {
		subscribe,
		addItem: (product: ProductSummary) => {
			update(cart => {
				const existing = cart.items.find(i => i.productId === product.id);
				if (existing) {
					existing.qty += 1;
				} else {
					cart.items.push({
						id: generateId(),
						productId: product.id,
						name: product.name,
						qty: 1,
						unitPrice: product.price,
						discount: 0,
						tax: 0,
						lineTotal: product.price
					});
				}
				return recalculate(cart);
			});
		},
		removeItem: (itemId: string) => {
			update(cart => {
				cart.items = cart.items.filter(i => i.id !== itemId);
				return recalculate(cart);
			});
		},
		updateQty: (itemId: string, delta: number) => {
			update(cart => {
				const item = cart.items.find(i => i.id === itemId);
				if (item) {
					item.qty += delta;
					if (item.qty <= 0) {
						cart.items = cart.items.filter(i => i.id !== itemId);
					}
				}
				return recalculate(cart);
			});
		},
		clear: () => set(initial)
	};
}

export const cart = createCartStore();
