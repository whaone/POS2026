<script lang="ts">
	import { formatRupiah, sumMoney } from '$lib/utils/money';
	import { MAX_TABS } from '$lib/stores/tabs';

	// Contoh data ringkas (statis) untuk memverifikasi util & token tema.
	const demoCart = [50000, 35000, 100000];
	const total = sumMoney(demoCart);

	const phase1 = [
		{ label: 'Secure Login', route: '/login', req: 'FR-AUT-01', icon: 'login' },
		{ label: 'Open Shift', route: '/pos/register', req: 'FR-CSH-01', icon: 'lock_open' },
		{ label: 'POS Checkout', route: '/pos/checkout', req: 'FR-SAL-01..09', icon: 'point_of_sale' },
		{ label: 'Transaction Tabs', route: '/pos/tabs', req: 'FR-SAL-18..23', icon: 'tab_group' },
		{ label: 'Scanner', route: '/pos/scan', req: 'FR-SCN-01..05', icon: 'qr_code_scanner' },
		{ label: 'Inventory', route: '/stock', req: 'FR-INV-01..06', icon: 'inventory_2' }
	];
</script>

<svelte:head>
	<title>Luminous POS</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-md px-sm py-lg md:px-container-margin">
	<!-- Brand header -->
	<header class="flex items-center gap-4">
		<div class="btn-primary-glow flex h-14 w-14 items-center justify-center rounded-full">
			<span class="material-symbols-outlined text-on-primary" style="font-variation-settings:'FILL' 1;"
				>point_of_sale</span
			>
		</div>
		<div>
			<h1 class="text-headline-xl text-primary">Luminous POS</h1>
			<p class="text-body-md text-on-surface-variant">
				Modular Monolith • SvelteKit + NestJS + Drizzle
			</p>
		</div>
	</header>

	<!-- Demo card: membuktikan util money & token tema bekerja -->
	<section class="glass-panel ambient-shadow p-md">
		<h2 class="text-headline-md mb-4 flex items-center gap-2 text-on-surface">
			<span class="material-symbols-outlined text-primary">shopping_cart</span> Demo Cart
		</h2>
		<ul class="flex flex-col gap-2">
			{#each demoCart as amount (amount)}
				<li class="flex items-center justify-between rounded-lg p-3 hover:bg-white/40">
					<span class="text-body-md">Item</span>
					<span class="text-body-lg font-semibold">{formatRupiah(amount)}</span>
				</li>
			{/each}
		</ul>
		<div class="mt-4 flex items-center justify-between border-t border-white/50 pt-4">
			<span class="text-body-lg text-on-surface-variant">Total</span>
			<span class="text-headline-lg text-on-surface">{formatRupiah(total)}</span>
		</div>
	</section>

	<!-- Phase 1 screens -->
	<section>
		<h2 class="text-headline-md mb-4 text-on-surface">Phase 1 Screens (max {MAX_TABS} tabs)</h2>
		<div class="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
			{#each phase1 as screen (screen.route)}
				<a
					href={screen.route}
					class="glass-panel ambient-shadow flex items-center gap-3 p-sm transition-transform hover:scale-[1.02] active:scale-95"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container/20 text-primary"
					>
						<span class="material-symbols-outlined">{screen.icon}</span>
					</div>
					<div>
						<div class="text-body-md font-medium text-on-surface">{screen.label}</div>
						<div class="text-label-sm uppercase text-on-surface-variant">{screen.req}</div>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<footer class="mt-auto flex items-center gap-2 pt-md">
		<span class="h-2 w-2 rounded-full bg-primary-fixed-dim"></span>
		<span class="text-label-sm uppercase text-on-surface-variant">Online • HTTPS</span>
	</footer>
</main>
