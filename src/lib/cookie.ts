/** Cookie max-age for auth: 1 day in seconds */
const AUTH_COOKIE_MAX_AGE = 24 * 60 * 60;

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name.replace(/\s/g, '\\s') + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, maxAgeSeconds: number = AUTH_COOKIE_MAX_AGE): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0`;
}

/** Storage-like interface for Zustand persist using cookies with 1-day expiry */
export const authCookieStorage = {
  getItem: (name: string): string | null => getCookie(name),
  setItem: (name: string, value: string): void => setCookie(name, value),
  removeItem: (name: string): void => removeCookie(name),
};
