/**
 * One-time migration: remove auth data that was previously stored in localStorage
 * now that auth is stored in cookies. Safe to call on every load; only removes keys if present.
 *
 * TODO: Remove this file and its call from main.tsx once all users have loaded the app
 * at least once (e.g. after a few months).
 */
const LEGACY_KEYS = ['auth_token', 'auth-storage'] as const;

export function migrateAuthFromLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  for (const key of LEGACY_KEYS) {
    if (window.localStorage.getItem(key) !== null) {
      window.localStorage.removeItem(key);
    }
  }
}
