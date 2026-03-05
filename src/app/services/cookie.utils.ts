const DOMAIN = '.cernertools.com';

export function setCernerToolsCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; domain=${DOMAIN}; Secure; SameSite=Lax`;
}

export function getCernerToolsCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function clearCernerToolsCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${DOMAIN}; Secure; SameSite=Lax`;
}
