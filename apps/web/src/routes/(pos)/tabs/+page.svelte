<script lang="ts">
	import { onMount } from 'svelte';
	import { TabsApi } from '$lib/api/tabs';
	import { MAX_TABS } from '$lib/stores/tabs';
	import { formatRupiah } from '$lib/utils/money';
	import type { ApiError } from '$lib/types/auth';
	import type { Tab } from '$lib/types/tabs';

	let tabs: Tab[] = [];
	let activeTabId = '';
	let loading = false;
	let errorMessage = '';
	let successMessage = '';
	let showLimitModal = false;
	let newLabel = 'Walk-In';

	const mockItems = [
		{ name: 'Kopi Susu Gula Aren', qty: 2, price: 25000, icon: 'local_cafe' },
		{ name: 'Croissant Butter', qty: 1, price: 35000, icon: 'bakery_dining' },
		{ name: 'Nasi Goreng Spesial', qty: 2, price: 50000, icon: 'lunch_dining' }
	];

	const loadTabs = async () => {
		loading = true;
		errorMessage = '';
		try {
			tabs = await TabsApi.listTabs();
			if (!activeTabId && tabs.length > 0) activeTabId = tabs[0].id;
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Unable to load tabs.';
		} finally {
			loading = false;
		}
	};

	onMount(async () => {
		await loadTabs();
	});

	const openNewTab = async () => {
		if (tabs.length >= MAX_TABS) {
			showLimitModal = true;
			return;
		}
		loading = true;
		errorMessage = '';
		successMessage = '';
		try {
			const tab = await TabsApi.openTab();
			const updated = await TabsApi.updateTab(tab.id, { label: newLabel });
			tabs = [...tabs, updated];
			activeTabId = updated.id;
			newLabel = 'Walk-In';
			successMessage = `Tab ${updated.tabIndex} opened.`;
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Unable to open tab.';
			if (apiError.message?.includes('Maximum')) showLimitModal = true;
		} finally {
			loading = false;
		}
	};

	const updateTabState = async (action: 'hold' | 'resume' | 'park' | 'close') => {
		const active = tabs.find((tab) => tab.id === activeTabId);
		if (!active) return;
		loading = true;
		errorMessage = '';
		successMessage = '';
		try {
			if (action === 'hold') await TabsApi.holdTab(active.id);
			if (action === 'resume') await TabsApi.resumeTab(active.id);
			if (action === 'park') await TabsApi.parkTab(active.id);
			if (action === 'close') await TabsApi.closeTab(active.id);
			await loadTabs();
			successMessage = action === 'park' ? 'Tab parked to held bills.' : `Tab ${action} complete.`;
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || `Unable to ${action} tab.`;
		} finally {
			loading = false;
		}
	};

	$: activeTab = tabs.find((tab) => tab.id === activeTabId) ?? null;
	$: activeSubtotal = activeTab?.subtotalAmount ?? 185000;
</script>

<svelte:head>
	<title>Transaction Tabs | Luminous POS</title>
</svelte:head>

<main class="flex min-h-screen w-full bg-background text-on-surface">
	<nav class="hidden w-64 flex-col border-r border-white/40 bg-surface/70 py-6 backdrop-blur-xl md:flex">
		<div class="mb-8 flex flex-col items-center px-6">
			<div class="btn-primary-glow mb-3 flex h-16 w-16 items-center justify-center rounded-full"><span class="material-symbols-outlined text-[28px] text-on-primary" style="font-variation-settings:'FILL' 1;">point_of_sale</span></div>
			<div class="text-headline-md font-bold tracking-tight text-primary">Terminal 01</div>
			<div class="mt-1 text-body-md text-on-surface-variant">Multi-Customer</div>
		</div>
		<div class="flex flex-1 flex-col gap-2 px-2">
			<a href="/pos/checkout" class="mx-2 flex items-center gap-3 rounded-full px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest"><span class="material-symbols-outlined">point_of_sale</span><span class="text-body-md font-medium">Sales</span></a>
			<a href="/pos/tabs" class="mx-2 flex items-center gap-3 rounded-full bg-primary px-4 py-3 text-on-primary shadow-lg shadow-primary/20"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">tab_group</span><span class="text-body-md font-medium">Tabs</span></a>
			<a href="/pos/register" class="mx-2 flex items-center gap-3 rounded-full px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest"><span class="material-symbols-outlined">schedule</span><span class="text-body-md font-medium">Shifts</span></a>
		</div>
	</nav>

	<section class="flex flex-1 flex-col px-4 py-6 md:px-container-margin">
		<header class="mb-md flex flex-col justify-between gap-4 md:flex-row md:items-end">
			<div>
				<h1 class="mb-2 text-headline-xl text-on-surface">Active Transactions</h1>
				<p class="text-body-md text-on-surface-variant">FR-SAL-18..23 · max 10 tabs · hold/resume/park</p>
			</div>
			<div class="flex items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-4 py-2 text-primary">
				<span class="material-symbols-outlined text-[20px]">tab_group</span>
				<span class="text-label-sm uppercase">{tabs.length} / {MAX_TABS} Tabs Active</span>
			</div>
		</header>

		{#if errorMessage}<div class="mb-4 rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-on-error-container">{errorMessage}</div>{/if}
		{#if successMessage}<div class="mb-4 rounded-xl border border-primary/10 bg-primary-container/15 px-4 py-3 text-primary">{successMessage}</div>{/if}

		<div class="mb-gutter flex items-end gap-2 overflow-x-auto pb-1">
			{#each tabs as tab (tab.id)}
				<button type="button" class={`flex min-w-[180px] items-center gap-2 rounded-t-xl border border-b-0 px-4 py-3 ${tab.id === activeTabId ? 'glass-panel ring-2 ring-primary/40' : 'border-white/40 bg-surface-container/70'} transition-all`} on:click={() => (activeTabId = tab.id)}>
					{#if tab.status === 'on_hold'}<span class="material-symbols-outlined shrink-0 text-[16px] text-secondary" style="font-variation-settings:'FILL' 1;">pause_circle</span>{:else}<span class="h-2 w-2 shrink-0 rounded-full bg-primary-fixed-dim"></span>{/if}
					<div class="min-w-0 flex-1 text-left">
						<div class="truncate text-body-md font-semibold text-on-surface">{tab.label || `Tab ${tab.tabIndex}`}</div>
						<div class={`text-label-sm ${tab.status === 'on_hold' ? 'text-secondary' : 'text-on-surface-variant'}`}>{tab.status === 'on_hold' ? 'On Hold' : `${tab.itemCount} items • ${formatRupiah(tab.subtotalAmount)}`}</div>
					</div>
				</button>
			{/each}
			<button type="button" class="flex shrink-0 items-center gap-1 rounded-t-xl px-4 py-3 text-primary transition-all hover:bg-primary-container/10 disabled:cursor-not-allowed disabled:opacity-50" disabled={loading} on:click={openNewTab}>
				<span class="material-symbols-outlined">add</span><span class="text-body-md font-medium">New</span>
			</button>
		</div>

		<div class="grid flex-1 grid-cols-1 gap-gutter lg:grid-cols-12">
			<section class="glass-panel ambient-shadow flex flex-col p-sm md:p-md lg:col-span-8">
				<div class="mb-4 flex items-center justify-between border-b border-white/50 pb-4">
					<h2 class="flex items-center gap-2 text-headline-md text-on-surface"><span class="material-symbols-outlined text-primary">shopping_cart</span>{activeTab?.label || 'No active tab'} — Cart</h2>
					<span class="rounded-full bg-surface-container px-3 py-1 text-label-sm uppercase text-on-surface-variant">{activeTab ? `Tab ${activeTab.tabIndex} • ${activeTab.status}` : 'Empty'}</span>
				</div>
				{#if !activeTab}
					<div class="flex flex-1 items-center justify-center text-body-md text-on-surface-variant">Open a new tab to begin.</div>
				{:else}
					<div class="flex flex-col gap-2">
						{#each mockItems as item}
							<div class="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-white/40">
								<div class="flex items-center gap-3"><div class="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-on-surface-variant"><span class="material-symbols-outlined text-[20px]">{item.icon}</span></div><div><div class="text-body-md font-medium">{item.name}</div><div class="text-label-sm text-on-surface-variant">{item.qty} × {formatRupiah(item.price)}</div></div></div>
								<span class="text-body-lg font-semibold">{formatRupiah(item.qty * item.price)}</span>
							</div>
						{/each}
					</div>
					<div class="mt-auto flex items-center justify-between border-t border-white/50 pt-4"><span class="text-body-lg text-on-surface-variant">Subtotal</span><span class="text-headline-lg text-on-surface">{formatRupiah(activeSubtotal)}</span></div>
				{/if}
			</section>

			<aside class="flex flex-col gap-gutter lg:col-span-4">
				<div class="glass-panel ambient-shadow flex flex-col gap-3 p-sm md:p-md">
					<h3 class="mb-1 text-label-sm uppercase text-on-surface-variant">New tab label</h3>
					<input type="text" bind:value={newLabel} class="rounded-xl border border-outline-variant/50 bg-surface-container px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
					<button type="button" class="btn-primary-glow flex w-full items-center justify-center gap-2 rounded-xl py-3 text-headline-md text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading} on:click={openNewTab}><span class="material-symbols-outlined">add</span>Open Tab</button>
				</div>
				<div class="glass-panel ambient-shadow flex flex-col gap-3 p-sm md:p-md">
					<h3 class="mb-1 text-label-sm uppercase text-on-surface-variant">Tab Actions</h3>
					<button type="button" class="btn-primary-glow flex w-full items-center justify-center gap-2 rounded-xl py-3 text-headline-md text-on-primary transition-all hover:opacity-90 active:scale-95" disabled={!activeTab || loading}><span class="material-symbols-outlined">point_of_sale</span>Checkout</button>
					{#if activeTab?.status === 'on_hold'}
						<button type="button" class="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container/30 py-3 text-body-lg text-on-secondary-container transition-all hover:bg-secondary-container/40" disabled={loading} on:click={() => updateTabState('resume')}><span class="material-symbols-outlined">play_circle</span>Resume Tab</button>
					{:else}
						<button type="button" class="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary-container/30 py-3 text-body-lg text-on-secondary-container transition-all hover:bg-secondary-container/40" disabled={!activeTab || loading} on:click={() => updateTabState('hold')}><span class="material-symbols-outlined">pause_circle</span>Hold Tab</button>
					{/if}
					<button type="button" class="flex w-full items-center justify-center gap-2 rounded-xl border border-outline-variant/60 py-3 text-body-lg text-on-surface transition-all hover:bg-surface-container" disabled={!activeTab || loading} on:click={() => updateTabState('park')}><span class="material-symbols-outlined">local_parking</span>Park to Held Bills</button>
					<button type="button" class="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-body-md text-error transition-all hover:bg-error-container/30" disabled={!activeTab || loading} on:click={() => updateTabState('close')}><span class="material-symbols-outlined text-[20px]">delete</span>Discard Tab</button>
				</div>
				<div class="glass-panel ambient-shadow p-sm md:p-md"><h3 class="mb-3 text-label-sm uppercase text-on-surface-variant">Held Bills</h3><div class="rounded-lg border border-white/40 p-3 text-body-md text-on-surface-variant">Parked bills appear here after API support for listing held carts.</div></div>
			</aside>
		</div>
	</section>
</main>

{#if showLimitModal}
	<div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-sm backdrop-blur-sm">
		<div class="glass-panel ambient-shadow w-full max-w-sm p-md text-center">
			<div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-container/40 text-error"><span class="material-symbols-outlined text-[28px]">tab_close</span></div>
			<h3 class="mb-2 text-headline-md text-on-surface">Tab limit reached</h3>
			<p class="mb-6 text-body-md text-on-surface-variant">Maximum {MAX_TABS} active tabs per shift (BR-15). Complete, close, or park a tab first.</p>
			<button type="button" class="btn-primary-glow w-full rounded-xl py-3 text-body-lg text-on-primary" on:click={() => (showLimitModal = false)}>Got it</button>
		</div>
	</div>
{/if}
