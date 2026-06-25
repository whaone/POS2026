<script lang="ts">
	import { formatRupiah, sumMoney } from '$lib/utils/money';
	import { MAX_TABS } from '$lib/stores/tabs';

	// Contoh data ringkas (statis) untuk memverifikasi util & token tema.
	const demoCart = [
		{ name: 'Espresso Blend 250g', amount: 50000 },
		{ name: 'Ceramic Pour-Over', amount: 35000 },
		{ name: 'Cold Brew Kit', amount: 100000 }
	];
	const total = sumMoney(demoCart.map((i) => i.amount));

	const phase1 = [
		{ label: 'Secure Login', route: '/login', req: 'FR-AUT-01', icon: 'login' },
		{ label: 'Open Shift', route: '/register', req: 'FR-CSH-01', icon: 'lock_open' },
		{ label: 'POS Checkout', route: '/checkout', req: 'FR-SAL-01..09', icon: 'point_of_sale' },
		{ label: 'Transaction Tabs', route: '/tabs', req: 'FR-SAL-18..23', icon: 'tab_group' },
		{ label: 'Scanner', route: '/scan', req: 'FR-SCN-01..05', icon: 'qr_code_scanner' },
		{ label: 'Inventory', route: '/stock', req: 'FR-INV-01..06', icon: 'inventory_2' }
	];
</script>

<svelte:head>
	<title>Luminous POS</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-5xl flex-col gap-lg px-sm py-lg md:px-container-margin">
	<!-- Brand header -->
	<header class="animate-rise flex items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<div
				class="btn-primary-glow flex h-14 w-14 items-center justify-center rounded-2xl"
			>
				<span
					class="material-symbols-outlined text-on-primary"
					style="font-variation-settings:'FILL' 1;">point_of_sale</span
				>
			</div>
			<div>
				<h1 class="text-headline-xl text-primary">Luminous POS</h1>
				<p class="text-body-md text-on-surface-variant">
					Modular Monolith • SvelteKit + NestJS + Drizzle
				</p>
			</div>
		</div>
		<div
			class="hidden items-center gap-2 rounded-full border border-white/60 bg-surface-container/70 px-4 py-2 backdrop-blur sm:flex"
		>
			<span class="relative flex h-2 w-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-fixed-dim opacity-75"
				></span>
				<span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
			</span>
			<span class="text-label-sm uppercase text-on-surface-variant">Online • HTTPS</span>
		</div>
	</header>

	<!-- Demo card: membuktikan util money & token tema bekerja -->
	<section class="glass-panel ambient-shadow animate-rise overflow-hidden p-md">
		<div class="mb-4 flex items-center justify-between">
			<h2 class="text-headline-md flex items-center gap-2 text-on-surface">
				<span class="material-symbols-outlined text-primary">shopping_cart</span> Live Cart Preview
			</h2>
			<span class="text-label-sm uppercase text-on-surface-variant"
				>{demoCart.length} items</span
			>
		</div>
		<ul class="flex flex-col gap-1">
			{#each demoCart as item (item.name)}
				<li
					class="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-white/50"
				>
					<span class="flex items-center gap-3 text-body-md text-on-surface">
						<span
							class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-container/15 text-primary"
						>
							<span class="material-symbols-outlined text-[18px]">shopping_bag</span>
						</span>
						{item.name}
					</span>
					<span class="text-body-lg font-semibold tabular-nums"
						>{formatRupiah(item.amount)}</span
					>
				</li>
			{/each}
		</ul>
		<div
			class="mt-4 flex items-end justify-between border-t border-white/60 pt-4"
		>
			<span class="text-body-lg text-on-surface-variant">Total</span>
			<span class="text-headline-xl tabular-nums text-on-surface">{formatRupiah(total)}</span>
		</div>
	</section>

	<!-- Phase 1 screens -->
	<section class="animate-rise">
		<div class="mb-4 flex items-baseline justify-between">
			<h2 class="text-headline-md text-on-surface">Phase 1 Screens</h2>
			<span class="text-label-sm uppercase text-on-surface-variant">max {MAX_TABS} tabs</span>
		</div>
		<div class="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
			{#each phase1 as screen (screen.route)}
				<a
					href={screen.route}
					class="glass-panel ambient-shadow lift group flex items-center gap-3 p-sm"
				>
					<div
						class="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-container/20 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary"
					>
						<span class="material-symbols-outlined">{screen.icon}</span>
					</div>
					<div class="flex-1">
						<div class="text-body-md font-medium text-on-surface">{screen.label}</div>
						<div class="text-label-sm uppercase text-on-surface-variant">{screen.req}</div>
					</div>
					<span
						class="material-symbols-outlined text-on-surface-variant opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
						>arrow_forward</span
					>
				</a>
			{/each}
		</div>
	</section>

	<footer class="mt-auto flex items-center gap-2 pt-md">
		<span class="h-2 w-2 rounded-full bg-primary-fixed-dim"></span>
		<span class="text-label-sm uppercase text-on-surface-variant">Online • HTTPS</span>
	</footer>
</main>
