<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { InventoryApi } from '$lib/api/inventory';
	import type { Product, StockRow, StockChangedPayload } from '$lib/types/inventory';
	import type { Socket } from 'socket.io-client';
	import type { ApiError } from '$lib/types/auth';

	const DEFAULT_LOCATION_ID = '00000000-0000-0000-0000-000000000001';

	let products: Product[] = [];
	let stockData: StockRow[] = [];
	let loading = true;
	let errorMessage = '';
	let socket: Socket | null = null;
	let socketConnected = false;

	const loadData = async () => {
		loading = true;
		errorMessage = '';
		try {
			const [p, s] = await Promise.all([
				InventoryApi.listProducts(),
				InventoryApi.listStock(DEFAULT_LOCATION_ID)
			]);
			products = p;
			stockData = s;
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Failed to load inventory data.';
		} finally {
			loading = false;
		}
	};

	const onStockChanged = (payload: StockChangedPayload) => {
		if (payload.locationId !== DEFAULT_LOCATION_ID) return;
		stockData = stockData.map((row) =>
			row.productId === payload.productId
				? { ...row, qty: payload.qty, qtyHeld: payload.qtyHeld }
				: row
		);
		// If stock doesn't exist yet, we could append it, but we need locationId.
		const exists = stockData.some((row) => row.productId === payload.productId);
		if (!exists) {
			stockData = [...stockData, {
				id: Math.random().toString(),
				businessId: payload.businessId,
				locationId: payload.locationId,
				productId: payload.productId,
				variationId: null,
				qty: payload.qty,
				qtyHeld: payload.qtyHeld,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}];
		}
	};

	onMount(async () => {
		await loadData();
		socket = InventoryApi.connectStockSocket(onStockChanged);
		socket.on('connect', () => socketConnected = true);
		socket.on('disconnect', () => socketConnected = false);
	});

	onDestroy(() => {
		if (socket) socket.disconnect();
	});

	$: inventoryTable = products.map((prod) => {
		const st = stockData.find((s) => s.productId === prod.id);
		const totalQty = st ? st.qty : 0;
		const availableQty = st ? st.qty - st.qtyHeld : 0;
		let status = 'GOOD';
		let statusColor = 'text-primary border-primary-container/30 bg-primary-container/20';
		if (totalQty === 0) {
			status = 'EMPTY';
			statusColor = 'text-outline border-outline/20 bg-outline/10';
		} else if (availableQty <= 5) {
			status = 'CRITICAL';
			statusColor = 'text-error border-error/20 bg-error/10';
		} else if (availableQty <= 15) {
			status = 'LOW';
			statusColor = 'text-secondary-container border-secondary-container/30 bg-secondary-container/20';
		}

		return {
			product: prod,
			totalQty,
			availableQty,
			status,
			statusColor
		};
	});
</script>

<svelte:head>
	<title>Inventory | Luminous POS</title>
</svelte:head>

<main class="flex h-screen w-full overflow-hidden bg-background">
	<aside class="flex w-64 flex-col border-r border-white/40 bg-surface/70 py-6 backdrop-blur-xl md:flex">
		<div class="mb-8 flex items-center gap-3 px-6">
			<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">view_in_ar</span></div>
			<div>
				<h1 class="truncate text-headline-md font-bold text-primary">Admin Panel</h1>
				<p class="text-label-sm text-on-surface-variant">Terminal #042</p>
			</div>
		</div>
		<ul class="flex-1 space-y-2 px-2">
			<li><a href="/pos/checkout" class="mx-2 flex items-center gap-3 rounded-xl p-3 text-on-surface-variant transition-all hover:bg-primary-container/10"><span class="material-symbols-outlined">point_of_sale</span><span class="text-body-md">Terminal</span></a></li>
			<li><a href="/stock" class="mx-2 flex items-center gap-3 rounded-xl bg-primary p-3 text-on-primary shadow-sm"><span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">inventory_2</span><span class="text-body-md font-medium">Inventory</span></a></li>
		</ul>
	</aside>

	<div class="flex flex-1 flex-col overflow-hidden">
		<header class="flex h-16 w-full shrink-0 items-center justify-between border-b border-white/40 bg-surface/70 px-container-margin backdrop-blur-xl">
			<div class="flex flex-1 items-center gap-4">
				<div class="hidden text-headline-lg font-bold tracking-tight text-primary lg:block">Luminous POS</div>
			</div>
			<div class="flex items-center gap-3 border-l border-outline-variant/30 pl-4">
				<span class={`h-2 w-2 rounded-full ${socketConnected ? 'bg-primary-fixed-dim' : 'bg-outline'}`}></span>
				<span class={`text-body-md font-medium ${socketConnected ? 'text-primary' : 'text-outline'}`}>{socketConnected ? 'Online (WS)' : 'Offline'}</span>
			</div>
		</header>

		<main class="flex-1 overflow-y-auto p-container-margin">
			<div class="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
				<div>
					<h2 class="mb-2 text-headline-xl text-on-background">Inventory Management</h2>
					<p class="text-body-lg text-on-surface-variant">FR-INV-01..06 · FR-INV-04 Real-time stock</p>
				</div>
				<div class="flex flex-wrap items-center gap-3">
					<button class="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label-sm font-label-sm text-on-surface transition-colors hover:bg-surface-container"><span class="material-symbols-outlined text-[18px]">sync_alt</span>Stock Transfer</button>
					<button class="flex items-center gap-2 rounded-lg border border-outline-variant px-4 py-2 text-label-sm font-label-sm text-on-surface transition-colors hover:bg-surface-container"><span class="material-symbols-outlined text-[18px]">edit_note</span>Stock Adjustment</button>
				</div>
			</div>

			{#if errorMessage}
				<div class="mb-6 rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-on-error-container">{errorMessage}</div>
			{/if}

			<div class="glass-panel flex min-h-[400px] flex-col overflow-hidden rounded-[24px]">
				<div class="flex-1 overflow-x-auto">
					<table class="w-full border-collapse text-left">
						<thead class="sticky top-0 z-10 border-b border-white/40 bg-surface-container-lowest/50">
							<tr>
								<th class="px-4 py-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">SKU</th>
								<th class="px-4 py-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Product Name</th>
								<th class="px-4 py-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant text-right">Available Qty</th>
								<th class="px-4 py-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant text-right">Held Qty</th>
								<th class="px-4 py-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant text-right">Total Stock</th>
								<th class="px-4 py-3 text-right text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Status</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-outline-variant/10">
							{#if loading}
								<tr><td colspan="6" class="px-4 py-8 text-center text-body-md text-on-surface-variant">Loading inventory...</td></tr>
							{:else if inventoryTable.length === 0}
								<tr><td colspan="6" class="px-4 py-8 text-center text-body-md text-on-surface-variant">No products found. Add products via backend API.</td></tr>
							{:else}
								{#each inventoryTable as row}
									<tr class="group transition-colors hover:bg-surface-container-lowest/40 {row.status === 'CRITICAL' ? 'bg-error-container/5' : row.status === 'EMPTY' ? 'bg-surface-variant/20' : ''}">
										<td class="px-4 py-3 text-body-md text-outline">{row.product.sku}</td>
										<td class="px-4 py-3 text-body-md font-medium text-on-surface">{row.product.name}</td>
										<td class="px-4 py-3 text-right text-body-md font-semibold text-on-surface">{row.availableQty}</td>
										<td class="px-4 py-3 text-right text-body-md text-on-surface-variant">{row.totalQty - row.availableQty}</td>
										<td class="px-4 py-3 text-right text-body-md font-semibold text-on-surface">{row.totalQty}</td>
										<td class="px-4 py-3 text-right">
											<span class={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${row.statusColor}`}>{row.status}</span>
										</td>
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</main>
	</div>
</main>
