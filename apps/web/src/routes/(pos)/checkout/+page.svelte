<script lang="ts">
	import { onMount } from 'svelte';
	import { cart } from '$lib/stores/cart';
	import { SalesApi } from '$lib/api/sales';
	import { formatRupiah } from '$lib/utils/money';
	import type { ProductSummary } from '$lib/types/sales';

	let products: ProductSummary[] = [];
	let showPaymentModal = false;
	let selectedPaymentMethod: 'cash' | 'qris' | 'card' = 'cash';
	let cashAmount = 0;
	let loading = false;
	let errorMessage = '';
	let successMessage = '';

	onMount(async () => {
		products = await SalesApi.getProducts();
	});

	const addProduct = (product: ProductSummary) => {
		cart.addItem(product);
	};

	const openPayment = () => {
		if ($cart.items.length === 0) {
			errorMessage = 'Cart is empty.';
			return;
		}
		cashAmount = $cart.grandTotal;
		showPaymentModal = true;
	};

	const closePayment = () => {
		showPaymentModal = false;
		errorMessage = '';
	};

	const processPay = async () => {
		loading = true;
		errorMessage = '';
		successMessage = '';
		try {
			const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
			const cartData = {
				items: $cart.items.map(item => ({
					productId: item.productId,
					qty: item.qty,
					unitPrice: item.unitPrice,
					discount: item.discount,
					tax: item.tax
				}))
			};
			const { sale } = await SalesApi.createCart(cartData);
			await SalesApi.pay({
				saleId: sale.id,
				idempotencyKey,
				payments: [{ method: selectedPaymentMethod, amount: $cart.grandTotal }]
			});
			successMessage = 'Payment successful!';
			cart.clear();
			showPaymentModal = false;
		} catch (error) {
			const apiError = error as { message?: string };
			errorMessage = apiError.message || 'Payment failed.';
		} finally {
			loading = false;
		}
	};

	$: change = cashAmount - $cart.grandTotal;
</script>

<svelte:head>
	<title>POS Checkout | Luminous POS</title>
</svelte:head>

<main class="flex h-screen w-full overflow-hidden bg-background">
	<aside class="flex w-64 flex-col border-r border-white/40 bg-surface/80 py-6 backdrop-blur-xl">
		<div class="mb-8 flex items-center gap-3 px-6">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-fixed shadow-sm">
				<span class="material-symbols-outlined text-[20px] text-on-primary" style="font-variation-settings:'FILL' 1;">point_of_sale</span>
			</div>
			<span class="text-headline-md tracking-tight text-primary">Terminal</span>
		</div>
		<nav class="flex flex-col gap-2 px-4">
			<a href="/pos/checkout" class="mx-2 flex items-center gap-3 rounded-xl bg-primary p-3 text-on-primary shadow-lg"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">point_of_sale</span><span class="text-label-sm font-semibold">Sales</span></a>
			<a href="/stock" class="mx-2 flex items-center gap-3 rounded-xl p-3 text-on-surface-variant transition-all hover:bg-surface-container-high"><span class="material-symbols-outlined">inventory_2</span><span class="text-label-sm font-medium">Inventory</span></a>
			<a href="/pos/register" class="mx-2 flex items-center gap-3 rounded-xl p-3 text-on-surface-variant transition-all hover:bg-surface-container-high"><span class="material-symbols-outlined">schedule</span><span class="text-label-sm font-medium">Shifts</span></a>
		</nav>
	</aside>

	<div class="flex flex-1 flex-col">
		<header class="flex h-16 items-center justify-between border-b border-white/40 bg-surface/70 px-container-margin backdrop-blur-lg">
			<h1 class="text-headline-lg font-bold tracking-tight text-primary">Luminous POS</h1>
			<div class="flex items-center gap-2 rounded-full border border-white/50 bg-surface-container px-3 py-1">
				<div class="h-2 w-2 rounded-full bg-primary-fixed-dim"></div>
				<span class="text-label-sm text-on-surface-variant">Terminal 01 - Online</span>
			</div>
		</header>

		<div class="flex flex-1 overflow-hidden">
			<section class="flex-1 overflow-y-auto p-container-margin">
				<h2 class="mb-4 text-headline-md text-on-surface">Product Catalog</h2>
				{#if errorMessage}
					<div class="mb-4 rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-on-error-container">{errorMessage}</div>
				{/if}
				{#if successMessage}
					<div class="mb-4 rounded-xl border border-primary/10 bg-primary-container/15 px-4 py-3 text-primary">{successMessage}</div>
				{/if}
				<div class="grid grid-cols-2 gap-4 lg:grid-cols-3">
					{#each products as product (product.id)}
						<button type="button" class="glass-panel ambient-shadow flex flex-col gap-2 rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-95" on:click={() => addProduct(product)}>
							<div class={`h-24 w-full rounded-xl ${product.colorClass} flex items-center justify-center`}>
								<span class="material-symbols-outlined text-[48px] text-white">shopping_bag</span>
							</div>
							<div class="text-left">
								<div class="text-body-md font-medium text-on-surface">{product.name}</div>
								<div class="text-label-sm uppercase text-on-surface-variant">{product.sku}</div>
								<div class="mt-2 text-headline-md text-primary">{formatRupiah(product.price)}</div>
							</div>
						</button>
					{/each}
				</div>
			</section>

			<aside class="glass-panel flex w-96 flex-col border-l-4 border-l-primary p-md">
				<h2 class="mb-4 flex items-center gap-2 text-headline-md text-on-surface"><span class="material-symbols-outlined text-primary">shopping_cart</span>Current Order</h2>
				<div class="mb-4 flex-1 space-y-2 overflow-y-auto">
					{#if $cart.items.length === 0}
						<p class="py-8 text-center text-body-md text-on-surface-variant">Cart is empty</p>
					{:else}
						{#each $cart.items as item (item.id)}
							<div class="flex items-start justify-between rounded-lg border border-white/50 bg-surface-container-lowest/50 p-3">
								<div class="flex-1">
									<div class="text-body-md font-medium text-on-surface">{item.name}</div>
									<div class="text-body-md text-on-surface-variant">{item.qty} × {formatRupiah(item.unitPrice)}</div>
								</div>
								<div class="flex flex-col items-end gap-2">
									<div class="text-body-lg font-semibold text-on-surface">{formatRupiah(item.lineTotal)}</div>
									<div class="flex gap-1">
										<button type="button" class="flex h-6 w-6 items-center justify-center rounded bg-surface-container text-on-surface hover:bg-primary-container/20" on:click={() => cart.updateQty(item.id, -1)}><span class="material-symbols-outlined text-[16px]">remove</span></button>
										<button type="button" class="flex h-6 w-6 items-center justify-center rounded bg-surface-container text-on-surface hover:bg-primary-container/20" on:click={() => cart.updateQty(item.id, 1)}><span class="material-symbols-outlined text-[16px]">add</span></button>
										<button type="button" class="flex h-6 w-6 items-center justify-center rounded bg-error-container/20 text-error hover:bg-error-container/40" on:click={() => cart.removeItem(item.id)}><span class="material-symbols-outlined text-[16px]">delete</span></button>
									</div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
				<div class="space-y-2 border-t border-outline-variant/30 pt-4">
					<div class="flex justify-between text-body-md text-on-surface-variant"><span>Subtotal</span><span>{formatRupiah($cart.subtotal)}</span></div>
					<div class="flex justify-between text-body-md text-on-surface-variant"><span>Tax (11%)</span><span>{formatRupiah($cart.taxTotal)}</span></div>
					<div class="flex justify-between text-headline-lg text-on-surface"><span>Total</span><span>{formatRupiah($cart.grandTotal)}</span></div>
				</div>
				<button type="button" disabled={$cart.items.length === 0} class="btn-primary-glow mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-headline-md text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" on:click={openPayment}><span class="material-symbols-outlined">payments</span>Pay</button>
			</aside>
		</div>
	</div>
</main>

{#if showPaymentModal}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/20 p-4 backdrop-blur-sm" on:click={closePayment} on:keydown={(e) => e.key === 'Escape' && closePayment()} role="button" tabindex="-1">
		<div class="glass-panel flex w-full max-w-2xl flex-col gap-6 rounded-2xl p-lg shadow-2xl" on:click|stopPropagation on:keydown role="button" tabindex="-1">
			<div class="flex items-center justify-between">
				<h2 class="flex items-center gap-2 text-headline-lg text-primary"><span class="material-symbols-outlined">receipt_long</span>Payment</h2>
				<button type="button" class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-highest" on:click={closePayment}><span class="material-symbols-outlined">close</span></button>
			</div>
			<div class="rounded-xl border border-white/50 bg-surface-container-lowest/50 p-4">
				<div class="mb-2 flex justify-between text-body-md text-on-surface-variant"><span>Items</span><span>{$cart.items.length}</span></div>
				<div class="mb-2 flex justify-between text-body-md text-on-surface-variant"><span>Subtotal</span><span>{formatRupiah($cart.subtotal)}</span></div>
				<div class="mb-2 flex justify-between text-body-md text-on-surface-variant"><span>Tax</span><span>{formatRupiah($cart.taxTotal)}</span></div>
				<div class="flex justify-between border-t border-outline-variant/30 pt-2 text-headline-lg text-on-surface"><span>Total Due</span><span>{formatRupiah($cart.grandTotal)}</span></div>
			</div>
			<div>
				<h3 class="mb-3 text-headline-md text-on-surface">Payment Method</h3>
				<div class="grid grid-cols-3 gap-3">
					<button type="button" class={`glass-panel flex flex-col items-center justify-center gap-2 rounded-lg p-4 transition-all ${selectedPaymentMethod === 'cash' ? 'border-primary/50 bg-primary/5' : 'hover:bg-surface-container-low'}`} on:click={() => (selectedPaymentMethod = 'cash')}><span class="material-symbols-outlined text-[32px] {selectedPaymentMethod === 'cash' ? 'text-primary' : 'text-on-surface-variant'}">payments</span><span class="text-label-sm {selectedPaymentMethod === 'cash' ? 'text-primary' : 'text-on-surface-variant'}">Cash</span></button>
					<button type="button" class={`glass-panel flex flex-col items-center justify-center gap-2 rounded-lg p-4 transition-all ${selectedPaymentMethod === 'qris' ? 'border-primary/50 bg-primary/5' : 'hover:bg-surface-container-low'}`} on:click={() => (selectedPaymentMethod = 'qris')}><span class="material-symbols-outlined text-[32px] {selectedPaymentMethod === 'qris' ? 'text-primary' : 'text-on-surface-variant'}">qr_code_scanner</span><span class="text-label-sm {selectedPaymentMethod === 'qris' ? 'text-primary' : 'text-on-surface-variant'}">QRIS</span></button>
					<button type="button" class={`glass-panel flex flex-col items-center justify-center gap-2 rounded-lg p-4 transition-all ${selectedPaymentMethod === 'card' ? 'border-primary/50 bg-primary/5' : 'hover:bg-surface-container-low'}`} on:click={() => (selectedPaymentMethod = 'card')}><span class="material-symbols-outlined text-[32px] {selectedPaymentMethod === 'card' ? 'text-primary' : 'text-on-surface-variant'}">credit_card</span><span class="text-label-sm {selectedPaymentMethod === 'card' ? 'text-primary' : 'text-on-surface-variant'}">Card</span></button>
				</div>
			</div>
			{#if selectedPaymentMethod === 'cash'}
				<div>
					<label class="mb-2 block text-label-sm uppercase text-on-surface-variant" for="cashAmount">Cash Amount</label>
					<input id="cashAmount" type="number" min={$cart.grandTotal} bind:value={cashAmount} class="block w-full rounded-xl border border-outline-variant/50 bg-surface-container px-4 py-3 text-body-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
					{#if change >= 0}
						<div class="mt-2 flex justify-between rounded-lg bg-primary-container/10 px-4 py-2"><span class="text-body-md text-on-surface-variant">Change</span><span class="text-headline-md text-primary">{formatRupiah(change)}</span></div>
					{/if}
				</div>
			{/if}
			{#if errorMessage}
				<div class="rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-on-error-container">{errorMessage}</div>
			{/if}
			<button type="button" disabled={loading || (selectedPaymentMethod === 'cash' && cashAmount < $cart.grandTotal)} class="btn-primary-glow flex w-full items-center justify-center gap-3 rounded-xl py-4 text-headline-md text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" on:click={processPay}><span class="material-symbols-outlined">check_circle</span>{loading ? 'Processing...' : 'Confirm Payment'}</button>
		</div>
	</div>
{/if}
