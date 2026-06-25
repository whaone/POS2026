<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApiClient } from '$lib/api/client';
	import { session } from '$lib/stores/session';
	import type { ApiError, LoginResponse } from '$lib/types/auth';

	let email = '';
	let password = '';
	let rememberDevice = true;
	let showPassword = false;
	let isSubmitting = false;
	let errorMessage = '';

	const login = async () => {
		isSubmitting = true;
		errorMessage = '';

		try {
			const response = await ApiClient.post<LoginResponse>('/auth/login', {
				email,
				password
			});

			session.setSession(response.user, response.tokens);

			if (!rememberDevice) {
				session.clearSession();
				session.setSession(response.user, response.tokens);
			}

			await goto('/');
		} catch (error) {
			const apiError = error as Partial<ApiError>;
			errorMessage =
				apiError.statusCode === 401
					? 'Invalid email or password.'
					: apiError.message || 'Unable to sign in. Try again.';
		} finally {
			isSubmitting = false;
		}
	};

	const submit = async (event: SubmitEvent) => {
		event.preventDefault();
		await login();
	};
</script>

<svelte:head>
	<title>Login | Luminous POS</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center p-sm text-on-surface">
	<div class="w-full max-w-md">
		<div class="mb-lg flex flex-col items-center">
			<div class="btn-primary-glow mb-4 flex h-16 w-16 items-center justify-center rounded-full">
				<span
					class="material-symbols-outlined text-[32px] text-on-primary"
					style="font-variation-settings:'FILL' 1;"
				>
					point_of_sale
				</span>
			</div>
			<h1 class="text-headline-xl tracking-tight text-primary">Luminous POS</h1>
			<p class="mt-1 text-body-md text-on-surface-variant">Sign in to your terminal</p>
		</div>

		<div class="glass-panel ambient-shadow animate-rise p-md md:p-lg">
			{#if errorMessage}
				<div
					class="mb-6 flex items-center gap-3 rounded-xl border border-error/20 bg-error-container/40 px-4 py-3 text-on-error-container"
				>
					<span class="material-symbols-outlined text-error">error</span>
					<span class="text-body-md">{errorMessage}</span>
				</div>
			{/if}

			<form class="flex flex-col gap-5" on:submit={submit}>
				<div>
					<label class="mb-2 block text-label-sm uppercase text-on-surface-variant" for="email"
						>Email</label
					>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute inset-y-0 left-0 flex items-center pl-4 text-[20px] text-on-surface-variant"
						>
							mail
						</span>
						<input
							id="email"
							type="email"
							autocomplete="username"
							bind:value={email}
							placeholder="sarah.j@store.com"
							required
							class="block w-full rounded-xl border border-outline-variant/50 bg-surface-container py-3 pl-12 pr-4 text-body-lg text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
					</div>
				</div>

				<div>
					<label
						class="mb-2 block text-label-sm uppercase text-on-surface-variant"
						for="password">Password</label
					>
					<div class="relative">
						<span
							class="material-symbols-outlined absolute inset-y-0 left-0 flex items-center pl-4 text-[20px] text-on-surface-variant"
						>
							lock
						</span>
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							autocomplete="current-password"
							bind:value={password}
							placeholder="••••••••"
							required
							minlength="6"
							class="block w-full rounded-xl border border-outline-variant/50 bg-surface-container py-3 pl-12 pr-12 text-body-lg text-on-surface transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
						<button
							type="button"
							class="absolute inset-y-0 right-0 flex items-center pr-4 text-on-surface-variant transition-colors hover:text-primary"
							aria-label={showPassword ? 'Hide password' : 'Show password'}
							on:click={() => (showPassword = !showPassword)}
						>
							<span class="material-symbols-outlined text-[20px]">
								{showPassword ? 'visibility_off' : 'visibility'}
							</span>
						</button>
					</div>
				</div>

				<div class="flex items-center justify-between gap-3">
					<label class="flex cursor-pointer items-center gap-2">
						<input
							type="checkbox"
							bind:checked={rememberDevice}
							class="rounded border-outline-variant text-primary focus:ring-primary/30"
						/>
						<span class="text-body-md text-on-surface-variant">Remember this device</span>
					</label>
					<a href="/" class="text-body-md font-medium text-primary hover:underline">Back</a>
				</div>

				<button
					type="submit"
					disabled={isSubmitting}
					class="btn-primary-glow mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-headline-md text-on-primary transition-all hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
				>
					<span class="material-symbols-outlined">login</span>
					{isSubmitting ? 'Signing In...' : 'Sign In'}
				</button>
			</form>
		</div>

		<div class="mt-lg flex items-center justify-center gap-2">
			<span class="h-2 w-2 rounded-full bg-primary-fixed-dim"></span>
			<span class="text-label-sm uppercase text-on-surface-variant">Secure connection • HTTPS</span>
		</div>
	</div>
</main>
