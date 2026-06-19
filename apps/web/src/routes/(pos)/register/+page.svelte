<script lang="ts">
	import { onMount } from 'svelte';
	import { RegisterApi } from '$lib/api/register';
	import { shift } from '$lib/stores/shift';
	import { formatRupiah } from '$lib/utils/money';
	import type { ApiError } from '$lib/types/auth';
	import type { Shift } from '$lib/types/shift';

	const DEFAULT_LOCATION_ID = '00000000-0000-0000-0000-000000000001';
	const quickDenoms = [50000, 100000, 200000, 500000];

	let openingBalance = 500000;
	let closingCounted = 0;
	let movementAmount = 0;
	let movementRef = '';
	let movementType: 'in' | 'out' = 'in';
	let errorMessage = '';
	let successMessage = '';
	let loading = false;
	let currentShift: Shift | null = null;

	const loadCurrentShift = async () => {
		loading = true;
		errorMessage = '';
		try {
			currentShift = await RegisterApi.getCurrent();
			shift.setShift(currentShift);
			closingCounted = currentShift?.systemCash ?? 0;
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Unable to load shift state.';
		} finally {
			loading = false;
		}
	};

	onMount(async () => {
		await loadCurrentShift();
	});

	const openShift = async () => {
		loading = true;
		errorMessage = '';
		successMessage = '';
		try {
			currentShift = await RegisterApi.open({
				locationId: DEFAULT_LOCATION_ID,
				openingBalance
			});
			shift.setShift(currentShift);
			closingCounted = currentShift.systemCash;
			successMessage = 'Shift opened.';
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Unable to open shift.';
		} finally {
			loading = false;
		}
	};

	const submitMovement = async () => {
		loading = true;
		errorMessage = '';
		successMessage = '';
		try {
			if (movementType === 'in') {
				await RegisterApi.cashIn({ amount: movementAmount, ref: movementRef || undefined });
			} else {
				await RegisterApi.cashOut({ amount: movementAmount, ref: movementRef || undefined });
			}
			movementAmount = 0;
			movementRef = '';
			await loadCurrentShift();
			successMessage = movementType === 'in' ? 'Cash in recorded.' : 'Cash out recorded.';
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Unable to record cash movement.';
		} finally {
			loading = false;
		}
	};

	const closeShift = async () => {
		loading = true;
		errorMessage = '';
		successMessage = '';
		try {
			await RegisterApi.close({ closingCounted });
			currentShift = null;
			shift.setShift(null);
			successMessage = 'Shift closed.';
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage = apiError.message || 'Unable to close shift.';
		} finally {
			loading = false;
		}
	};

	const addDenom = (amount: number) => {
		openingBalance += amount;
	};

	$: difference = closingCounted - (currentShift?.systemCash ?? 0);
	$: differenceLabel = difference === 0 ? formatRupiah(0) : `${difference > 0 ? '+' : '-'} ${formatRupiah(Math.abs(difference))}`;
</script>

<svelte:head>
	<title>Shift Register | Luminous POS</title>
</svelte:head>

<main class="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-lg px-sm py-lg md:px-container-margin">
	<header class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
		<div>
			<h1 class="text-headline-xl text-on-surface">Shift Register</h1>
			<p class="text-body-md text-on-surface-variant">FR-CSH-01..04 · open, cash movement, reconciliation</p>
		</div>
		<div class="inline-flex items-center gap-2 rounded-full border border-primary-container/20 bg-primary-container/10 px-4 py-2 text-primary">
			<span class="material-symbols-outlined text-[20px]">schedule</span>
			<span class="text-label-sm uppercase">{currentShift ? 'Shift active' : 'No active shift'}</span>
		</div>
	</header>

	{#if errorMessage}
		<div class="rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-on-error-container">{errorMessage}</div>
	{/if}
	{#if successMessage}
		<div class="rounded-xl border border-primary/10 bg-primary-container/15 px-4 py-3 text-primary">{successMessage}</div>
	{/if}

	{#if !currentShift}
		<section class="glass-panel ambient-shadow mx-auto w-full max-w-2xl border-t-4 border-t-primary p-sm md:p-md">
			<div class="mb-lg text-center">
				<h2 class="text-headline-lg text-on-surface">Open Shift</h2>
				<p class="mt-2 text-body-md text-on-surface-variant">Count starting cash float before sales begin.</p>
			</div>
			<div class="mb-6 grid grid-cols-2 gap-4">
				<div class="rounded-xl border border-white/50 bg-surface-container-lowest/50 p-4">
					<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Cashier</div>
					<div class="text-headline-md text-on-surface">Current user</div>
				</div>
				<div class="rounded-xl border border-white/50 bg-surface-container-lowest/50 p-4">
					<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Time</div>
					<div class="text-headline-md text-on-surface">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
				</div>
			</div>
			<div class="mb-6">
				<label class="mb-2 block text-label-sm uppercase text-on-surface-variant" for="openingBalance">Starting Cash Float</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-headline-md text-on-surface-variant">Rp</div>
					<input id="openingBalance" type="number" min="0" bind:value={openingBalance} class="block w-full rounded-xl border border-outline-variant/50 bg-surface-container py-4 pl-12 pr-4 text-right text-headline-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
				</div>
			</div>
			<div class="mb-6">
				<h3 class="mb-3 px-1 text-label-sm uppercase text-on-surface-variant">Quick add</h3>
				<div class="grid grid-cols-2 gap-2 md:grid-cols-4">
					{#each quickDenoms as amount}
						<button type="button" class="rounded-lg border border-white/50 bg-surface-container py-3 text-body-md text-on-surface transition-all hover:bg-primary-container/15 active:scale-95" on:click={() => addDenom(amount)}>+{amount / 1000}k</button>
					{/each}
				</div>
			</div>
			<button type="button" disabled={loading} class="btn-primary-glow flex w-full items-center justify-center gap-3 rounded-xl py-4 text-headline-md text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" on:click={openShift}>
				<span class="material-symbols-outlined">login</span>
				{loading ? 'Starting...' : 'Start Shift'}
			</button>
		</section>
	{:else}
		<div class="grid grid-cols-1 gap-gutter lg:grid-cols-12">
			<section class="glass-panel ambient-shadow flex flex-col gap-4 p-sm md:p-md lg:col-span-7">
				<h2 class="flex items-center gap-2 text-headline-md text-on-surface"><span class="material-symbols-outlined text-primary">receipt_long</span>System Expected Totals</h2>
				<div class="grid grid-cols-2 gap-4">
					<div class="rounded-xl border border-white/50 bg-surface-container-lowest/50 p-4">
						<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Opening Balance</div>
						<div class="text-headline-lg text-on-surface">{formatRupiah(currentShift.openingBalance)}</div>
					</div>
					<div class="rounded-xl border border-white/50 bg-surface-container-lowest/50 p-4">
						<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Expected Cash Drawer</div>
						<div class="text-headline-lg text-on-surface">{formatRupiah(currentShift.systemCash)}</div>
					</div>
				</div>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="glass-panel p-4">
						<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Started</div>
						<div class="text-body-lg text-on-surface">{new Date(currentShift.openedAt).toLocaleString('id-ID')}</div>
					</div>
					<div class="glass-panel p-4">
						<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Location ID</div>
						<div class="break-all text-body-md text-on-surface">{currentShift.locationId}</div>
					</div>
				</div>
				<div class="rounded-xl border border-white/50 bg-surface-container-lowest/80 p-4">
					<div class="mb-3 text-label-sm uppercase text-on-surface-variant">Record Cash Movement</div>
					<div class="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr]">
						<select bind:value={movementType} class="rounded-xl border border-outline-variant/50 bg-surface-container px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20"><option value="in">Cash In</option><option value="out">Cash Out</option></select>
						<input type="number" min="1" bind:value={movementAmount} placeholder="Amount" class="rounded-xl border border-outline-variant/50 bg-surface-container px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
					</div>
					<input type="text" bind:value={movementRef} placeholder="Reference / note" class="mt-3 w-full rounded-xl border border-outline-variant/50 bg-surface-container px-4 py-3 text-body-md text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
					<button type="button" disabled={loading || movementAmount < 1} class="btn-primary-glow mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-body-lg text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" on:click={submitMovement}><span class="material-symbols-outlined">payments</span>Save Movement</button>
				</div>
			</section>
			<section class="glass-panel ambient-shadow flex flex-col border-t-4 border-t-primary p-sm md:p-md lg:col-span-5">
				<h2 class="mb-6 flex items-center gap-2 text-headline-md text-on-surface"><span class="material-symbols-outlined text-primary">calculate</span>Cash Reconciliation</h2>
				<div class="mb-6 flex items-center justify-between rounded-xl border border-white/40 bg-surface-container-high/50 p-4">
					<div>
						<div class="mb-1 text-label-sm uppercase text-on-surface-variant">Expected Cash Drawer</div>
						<div class="text-xs text-on-surface-variant">Starting cash + adjustments</div>
					</div>
					<div class="text-right text-headline-lg text-on-surface">{formatRupiah(currentShift.systemCash)}</div>
				</div>
				<div class="mb-6">
					<label class="mb-2 block text-label-sm uppercase text-on-surface-variant" for="closingCounted">Actual Cash Physical</label>
					<div class="relative">
						<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-headline-md text-on-surface-variant">Rp</div>
						<input id="closingCounted" type="number" min="0" bind:value={closingCounted} class="block w-full rounded-xl border border-outline-variant/50 bg-surface-container py-4 pl-12 pr-4 text-right text-headline-lg text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20" />
					</div>
				</div>
				<div class={`mb-8 flex items-center justify-between rounded-xl border border-white p-4 ${difference < 0 ? 'bg-error-container/20' : 'bg-surface-container-lowest/80'}`}>
					<span class="text-body-lg text-on-surface">Difference (Selisih)</span>
					<span class={`text-headline-xl ${difference < 0 ? 'text-error' : difference > 0 ? 'text-secondary-container' : 'text-primary'}`}>{differenceLabel}</span>
				</div>
				<button type="button" disabled={loading} class="btn-primary-glow flex w-full items-center justify-center gap-3 rounded-xl py-4 text-headline-md text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" on:click={closeShift}><span class="material-symbols-outlined">print</span>{loading ? 'Closing...' : 'Close Shift & Print Report'}</button>
				<p class="mt-4 text-center text-label-sm uppercase text-on-surface-variant opacity-70">AC-04 reconciliation active · review difference before closing</p>
			</section>
		</div>
	{/if}
</main>
