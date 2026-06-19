import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { AuthUser, AuthTokens } from '../types/auth';

interface SessionState {
	user: AuthUser | null;
	tokens: AuthTokens | null;
	isAuthenticated: boolean;
}

const initialState: SessionState = {
	user: null,
	tokens: null,
	isAuthenticated: false
};

const getStoredSession = (): SessionState => {
	if (!browser) return initialState;
	try {
		const stored = localStorage.getItem('pos_session');
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				user: parsed.user,
				tokens: parsed.tokens,
				isAuthenticated: !!parsed.tokens?.accessToken
			};
		}
	} catch (e) {
		console.error('Failed to parse session', e);
	}
	return initialState;
};

function createSessionStore() {
	const { subscribe, set } = writable<SessionState>(getStoredSession());

	return {
		subscribe,
		setSession: (user: AuthUser, tokens: AuthTokens) => {
			const state = { user, tokens, isAuthenticated: true };
			if (browser) {
				localStorage.setItem('pos_session', JSON.stringify({ user, tokens }));
			}
			set(state);
		},
		clearSession: () => {
			if (browser) {
				localStorage.removeItem('pos_session');
			}
			set(initialState);
		}
	};
}

export const session = createSessionStore();
