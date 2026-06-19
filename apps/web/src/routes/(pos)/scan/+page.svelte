<script lang="ts">
	import { goto } from '$app/navigation';
	import Scanner from '$lib/components/Scanner.svelte';
	import { ProductsApi } from '$lib/api/products';
import type { Product } from '$lib/types/inventory';
	import type { ApiError } from '$lib/types/auth';

	let lastCode = '';
	let lookupMessage = '';
	let lookupSuccess = false;
	let lookupProduct: Product | null = null;
	let errorMessage = '';

	const handleScan = async (code: string) => {
		if (!code.trim()) return;
		lastCode = code;
		errorMessage = '';
		lookupMessage = `Looking up barcode: ${code}`;
		lookupProduct = null;
		lookupSuccess = false;

		try {
			const product = await ProductsApi.findByBarcode(code);
			lookupProduct = product;
			lookupSuccess = true;
			lookupMessage = `Found: ${product.name} (${product.sku})`;
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			lookupSuccess = false;
			lookupMessage = '';
			errorMessage = apiError.message || `No product found for barcode: ${code}`;
		}
	};

	const onScan = (event: CustomEvent<string>) => handleScan(event.detail);

	const onSubmit = () => handleScan(lastCode);

	const goToCheckout = () => goto('/pos/checkout');

	const clearResult = () => {
		lastCode = '';
		lookupMessage = '';
		lookupSuccess = false;
		lookupProduct = null;
		errorMessage = '';
	};
</script>

<svelte:head>
	<title>Scan Barcode | Luminous POS</title>
</svelte:head>

<main class="flex min-h-screen w-full flex-col items-center bg-background px-sm py-lg md:px-container-margin">
	<div class="w-full max-w-md">
		<div class="mb-md flex items-center justify-between">
			<button type="button" class="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container" on:click={() => goto('/pos/checkout')}><span class="material-symbols-outlined">arrow_back</span></button>
			<h1 class="text-headline-md text-on-surface">Scan Barcode</h1>
			<div class="h-10 w-10"></div>
		</div>

		<div class="glass-panel ambient-shadow mb-gutter p-3">
			<Scanner on:scan={onScan} />
		</div>

		{#if lookupMessage}
			<div class="glass-panel ambient-shadow mb-gutter flex items-center gap-3 p-sm">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-primary"><span class="material-symbols-outlined">radar</span></div>
				<div class="flex-1">
					<div class="text-body-md font-medium text-on-surface">{lookupMessage}</div>
					<div class="text-label-sm text-on-surface-variant">{lastCode}</div>
				</div>
			</div>
		{/if}

		{#if errorMessage}
			<div class="glass-panel ambient-shadow mb-gutter flex items-center gap-3 border border-error/20 p-sm">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error-container/40 text-error"><span class="material-symbols-outlined">error</span></div>
				<div class="flex-1">
					<div class="text-body-md font-medium text-on-error-container">{errorMessage}</div>
					<div class="text-label-sm text-on-error-container opacity-70">Try another barcode or manual input.</div>
				</div>
			</div>
		{/if}

		{#if lookupSuccess && lookupProduct}
			<div class="glass-panel ambient-shadow mb-gutter border-t-4 border-t-primary p-sm md:p-md">
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-headline-md text-on-surface">Product Found</h2>
					<span class="rounded-full bg-primary-container/20 px-3 py-1 text-label-sm font-semibold uppercase text-primary">{lookupProduct.sku}</span>
				</div>
				<div class="mb-6 grid grid-cols-2 gap-4">
					<div class="rounded-xl border border-white/50 bg-surface-container-lowest/50 p-4">
						<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Name</div>
						<div class="text-body-lg font-medium text-on-surface">{lookupProduct.name}</div>
					</div>
					<div class="rounded-xl border border-white/50 bg-surface-container-lowest/50 p-4">
						<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Barcode</div>
						<div class="text-body-lg text-on-surface">{lookupProduct.barcode || 'N/A'}</div>
					</div>
				</div>
				<div class="flex gap-3">
					<button type="button" class="btn-primary-glow flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-body-lg text-on-primary transition-all hover:opacity-90 active:scale-95" on:click={goToCheckout}><span class="material-symbols-outlined">shopping_cart</span>Go to Checkout</button>
					<button type="button" class="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/60 px-4 py-3 text-body-md text-on-surface transition-all hover:bg-surface-container active:scale-95" on:click={clearResult}><span class="material-symbols-outlined">qr_code_scanner</span>Scan Next</button>
				</div>
			</div>
		{/if}

		<div class="glass-panel ambient-shadow p-sm md:p-md">
			<h3 class="mb-3 flex items-center gap-2 text-label-sm uppercase text-on-surface-variant"><span class="material-symbols-outlined text-[18px]">keyboard</span> Manual entry</h3>
			<form class="flex gap-2" on:submit|preventDefault={onSubmit}>
				<input type="text" bind:value={lastCode} placeholder="Enter barcode number" inputmode="numeric" class="flex-1 rounded-xl border border-outline-variant/50 bg-surface-container px-4 py-3 text-body-lg text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20" />
				<button type="submit" class="btn-primary-glow flex items-center gap-1 rounded-xl px-5 py-3 text-on-primary transition-all hover:opacity-90 active:scale-95"><span class="material-symbols-outlined">search</span></button>
			</form>
			<p class="mt-3 text-label-sm text-on-surface-variant opacity-70">FR-SCN-04 · result routes to checkout / inventory / voucher</p>
		</div>
	</div>
</main>
