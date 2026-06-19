<script lang="ts">
	import { onMount } from 'svelte';
	import { ReportsApi } from '$lib/api/reports';
	import { formatRupiah } from '$lib/utils/money';
	import type { ApiError } from '$lib/types/auth';
	import type { DashboardMetrics } from '$lib/types/reports';

	let metrics: DashboardMetrics | null = null;
	let loading = true;
	let errorMessage = '';

	const loadDashboard = async () => {
		loading = true;
		errorMessage = '';
		try {
			metrics = await ReportsApi.getDashboardMetrics();
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Failed to load dashboard metrics.';
		} finally {
			loading = false;
		}
	};

	onMount(async () => {
		await loadDashboard();
	});

	$: totalSales = metrics?.profitLoss.totalSales ?? 0;
	$: totalTransactions = metrics ? Math.max(1, Math.round(metrics.purchaseSell.sales.total / 10500)) : 0;
	$: lowStockCount = metrics?.stock.lowStockItems.length ?? 0;
	$: grossProfit = metrics?.profitLoss.netProfit ?? 0;
	$: chartBars = [45, 62, 51, 78, 68, 92, 83];
	$: trending = [
		{ name: 'Smartwatch Elite', stock: 42, tag: 'Fast', tone: 'primary' },
		{ name: 'Aero Headphones', stock: 18, tag: 'Fast', tone: 'primary' },
		{ name: 'Home Hub Mini', stock: 5, tag: 'Slow', tone: 'error' },
		{ name: 'Wireless Charger Pro', stock: 120, tag: 'Steady', tone: 'outline' }
	];
</script>

<svelte:head>
	<title>Admin Dashboard | Luminous POS</title>
</svelte:head>

<main class="flex min-h-screen flex-col bg-surface text-on-surface md:flex-row">
	<nav class="hidden w-64 flex-col border-r border-white/40 bg-surface-container-low/80 py-6 backdrop-blur-2xl md:flex">
		<div class="mb-xl flex flex-col gap-xs px-container-margin">
			<div class="flex items-center gap-sm">
				<span class="material-symbols-outlined text-3xl text-primary">storefront</span>
				<span class="text-headline-md font-bold text-primary">Luminous POS</span>
			</div>
			<div class="mt-4 flex items-center gap-3">
				<div class="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-container text-on-primary-container"><span class="material-symbols-outlined">admin_panel_settings</span></div>
				<div><div class="text-label-sm text-on-surface">Admin Panel</div><div class="text-[10px] text-on-surface-variant">Terminal #042</div></div>
			</div>
		</div>
		<div class="flex-1 overflow-y-auto px-xs">
			<a href="/admin" class="mb-2 mx-2 flex items-center gap-3 rounded-xl bg-primary p-3 text-on-primary shadow-sm"><span class="material-symbols-outlined">monitoring</span><span class="text-label-sm">Analytics</span></a>
			<a href="/pos/checkout" class="mb-2 mx-2 flex items-center gap-3 rounded-xl p-3 text-on-surface-variant transition-all hover:bg-primary-container/10"><span class="material-symbols-outlined">point_of_sale</span><span class="text-label-sm">Terminal</span></a>
			<a href="/stock" class="mb-2 mx-2 flex items-center gap-3 rounded-xl p-3 text-on-surface-variant transition-all hover:bg-primary-container/10"><span class="material-symbols-outlined">inventory_2</span><span class="text-label-sm">Inventory</span></a>
			<a href="/pos/register" class="mb-2 mx-2 flex items-center gap-3 rounded-xl p-3 text-on-surface-variant transition-all hover:bg-primary-container/10"><span class="material-symbols-outlined">schedule</span><span class="text-label-sm">Shifts</span></a>
		</div>
	</nav>

	<section class="flex min-h-screen flex-1 flex-col gap-gutter p-container-margin">
		<header class="hidden items-center justify-between rounded-2xl border-b border-white/40 bg-surface/70 p-sm shadow-sm backdrop-blur-xl md:flex">
			<div class="relative">
				<select class="glass-panel appearance-none rounded-lg border border-white/50 bg-surface-container py-2 pl-4 pr-10 text-body-md text-on-surface focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"><option>Main Store</option><option>Downtown Branch</option></select>
				<span class="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant">expand_more</span>
			</div>
			<div class="flex items-center gap-sm text-on-surface-variant">
				<button class="rounded-full p-2 transition-colors hover:bg-primary-container/20"><span class="material-symbols-outlined">notifications</span></button>
				<button class="rounded-full p-2 transition-colors hover:bg-primary-container/20"><span class="material-symbols-outlined">settings</span></button>
				<div class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary-container/20 text-primary"><span class="material-symbols-outlined">person</span></div>
			</div>
		</header>

		<div class="mt-md flex flex-col items-start justify-between gap-sm sm:flex-row sm:items-end md:mt-0">
			<div>
				<h1 class="text-headline-xl text-on-surface">Dashboard</h1>
				<p class="mt-1 text-body-md text-on-surface-variant">FR-RPT-01 · real-time store performance overview</p>
			</div>
			<div class="flex w-full gap-sm sm:w-auto">
				<button class="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary bg-white/50 px-6 py-3 text-label-sm text-primary backdrop-blur-sm transition-colors hover:bg-primary-container/10 sm:flex-none"><span class="material-symbols-outlined text-[18px]">download</span>Export Report</button>
			</div>
		</div>

		{#if errorMessage}
			<div class="rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-on-error-container">{errorMessage}</div>
		{/if}

		<div class="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
			<div class="glass-panel ambient-shadow rounded-[24px] p-md"><div class="mb-sm flex justify-between"><div class="rounded-lg bg-primary-container/20 p-2 text-primary"><span class="material-symbols-outlined">payments</span></div><span class="rounded-full bg-primary-container/20 px-2 py-1 text-label-sm text-primary">12%</span></div><div><div class="mb-1 text-label-sm uppercase tracking-wider text-on-surface-variant">Today's Sales</div><div class="text-headline-lg text-on-surface">{loading ? '...' : formatRupiah(totalSales)}</div></div></div>
			<div class="glass-panel ambient-shadow rounded-[24px] p-md"><div class="mb-sm flex justify-between"><div class="rounded-lg bg-secondary-container/20 p-2 text-secondary"><span class="material-symbols-outlined">receipt_long</span></div><span class="rounded-full bg-primary-container/20 px-2 py-1 text-label-sm text-primary">8%</span></div><div><div class="mb-1 text-label-sm uppercase tracking-wider text-on-surface-variant">Transactions</div><div class="text-headline-lg text-on-surface">{loading ? '...' : totalTransactions}</div></div></div>
			<div class="glass-panel ambient-shadow rounded-[24px] border-error/20 p-md"><div class="mb-sm flex justify-between"><div class="rounded-lg bg-error-container/50 p-2 text-error"><span class="material-symbols-outlined">warning</span></div><span class="rounded-full bg-error-container/50 px-2 py-1 text-label-sm text-error">Action</span></div><div><div class="mb-1 text-label-sm uppercase tracking-wider text-on-surface-variant">Low Stock Alerts</div><div class="text-headline-lg text-on-surface">{loading ? '...' : lowStockCount} <span class="text-body-md text-on-surface-variant">Items</span></div></div></div>
			<div class="glass-panel ambient-shadow rounded-[24px] p-md"><div class="mb-sm flex justify-between"><div class="rounded-lg bg-tertiary-container/20 p-2 text-tertiary"><span class="material-symbols-outlined">account_balance_wallet</span></div><span class="rounded-full bg-surface-variant px-2 py-1 text-label-sm text-outline">0%</span></div><div><div class="mb-1 text-label-sm uppercase tracking-wider text-on-surface-variant">Gross Profit</div><div class="text-headline-lg text-on-surface">{loading ? '...' : formatRupiah(grossProfit)}</div></div></div>
		</div>

		<div class="grid grid-cols-1 gap-gutter xl:grid-cols-3">
			<section class="glass-panel ambient-shadow flex flex-col rounded-[24px] p-md xl:col-span-2">
				<div class="mb-lg flex items-center justify-between"><h2 class="text-headline-md text-on-surface">Sales Performance</h2><select class="appearance-none border-none bg-transparent text-label-sm text-primary focus:outline-none"><option>This Week</option><option>This Month</option></select></div>
				<div class="flex min-h-[300px] flex-1 items-end gap-3 rounded-xl border border-white/30 bg-surface-container-lowest/50 p-4">
					{#each chartBars as height, index}
						<div class="flex flex-1 flex-col items-center gap-2"><div class="w-full rounded-t-xl bg-gradient-to-t from-primary to-primary-fixed" style={`height: ${height}%`}></div><span class="text-label-sm text-on-surface-variant">D{index + 1}</span></div>
					{/each}
				</div>
			</section>
			<section class="glass-panel ambient-shadow flex flex-col rounded-[24px] p-md">
				<div class="mb-md flex items-center justify-between"><h2 class="text-headline-md text-on-surface">Trending Products</h2><button class="rounded-full p-1 text-primary hover:bg-primary-container/20"><span class="material-symbols-outlined">more_vert</span></button></div>
				<div class="flex flex-col gap-4 overflow-y-auto pr-2">
					{#each trending as item}
						<div class="group flex items-center justify-between rounded-xl border border-transparent p-3 transition-colors hover:border-white/40 hover:bg-surface-container-high/50">
							<div class="flex items-center gap-3"><div class="flex h-12 w-12 items-center justify-center rounded-lg border border-white/50 bg-surface-dim text-on-surface-variant"><span class="material-symbols-outlined">inventory_2</span></div><div><div class="text-label-sm text-on-surface">{item.name}</div><div class={`text-[12px] ${item.tone === 'error' ? 'text-error' : 'text-on-surface-variant'}`}>Stock: {item.stock} units</div></div></div>
							<span class={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-wider ${item.tone === 'primary' ? 'border-primary/20 bg-primary-container/20 text-primary' : item.tone === 'error' ? 'border-error/20 bg-error-container/40 text-error' : 'border-outline-variant/50 bg-surface-variant text-on-surface-variant'}`}>{item.tag}</span>
						</div>
					{/each}
				</div>
				<a href="/stock" class="mt-auto flex w-full items-center justify-center gap-1 pt-4 text-label-sm text-primary hover:underline">View Full Inventory <span class="material-symbols-outlined text-[16px]">arrow_forward</span></a>
			</section>
		</div>
	</section>
</main>
