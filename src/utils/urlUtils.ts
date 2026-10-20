/**
 * Utility helpers for Bastiyah multi-store URLs
 * Canonical Domain: bastiyah.com
 * - Platform: https://bastiyah.com
 * - Platform Owner Admin: https://bastiyah.com/owner (Strictly accessed via /owner)
 * - Independent Stores: https://(slug).bastiyah.com
 * - Merchant Admin: https://(slug).bastiyah.com/admin
 */

export const BASTIYAH_CUSTOM_DOMAIN = 'bastiyah.com';
export const BASTIYAH_PLATFORM_HOST = 'bastiyah.com';

/**
 * Returns current origin or fallback host
 */
export const getPlatformOrigin = (): string => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return `https://${BASTIYAH_CUSTOM_DOMAIN}`;
};

/**
 * Detects if the current browser environment is on custom domain (bastiyah.com)
 */
export const isRunningOnCustomDomain = (): boolean => {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname.toLowerCase();
  return (
    hostname.endsWith(BASTIYAH_CUSTOM_DOMAIN) ||
    (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.endsWith('.vercel.app'))
  );
};

/**
 * Returns the active root domain (default: bastiyah.com)
 */
export const getCustomDomainRoot = (): string => {
  if (typeof window === 'undefined') return BASTIYAH_CUSTOM_DOMAIN;
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.endsWith(BASTIYAH_CUSTOM_DOMAIN)) {
    return BASTIYAH_CUSTOM_DOMAIN;
  }
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www' && !hostname.includes('localhost') && !hostname.endsWith('.vercel.app')) {
    return parts.slice(1).join('.');
  }
  return BASTIYAH_CUSTOM_DOMAIN;
};

/**
 * Returns the full working URL for a store
 * e.g. https://panda.bastiyah.com or https://panda.bastiyah.com/admin
 */
export const getStoreDisplayUrl = (slug: string, isStoreAdmin: boolean = false): string => {
  const root = getCustomDomainRoot();
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const base = `${protocol}//${slug}.${root}`;
  return isStoreAdmin ? `${base}/admin` : base;
};

/**
 * Returns the relative path for a store
 * e.g. /store/panda or /store/panda/admin
 */
export const getStorePath = (slug: string, isStoreAdmin: boolean = false): string => {
  return isStoreAdmin ? `/store/${slug}/admin` : `/store/${slug}`;
};

/**
 * Returns the short display label for a store link
 * e.g. panda.bastiyah.com or panda.bastiyah.com/admin
 */
export const getStorePathLabel = (slug: string, isStoreAdmin: boolean = false): string => {
  const root = getCustomDomainRoot();
  const base = `${slug}.${root}`;
  return isStoreAdmin ? `${base}/admin` : base;
};

/**
 * Official custom domain format
 * e.g. https://panda.bastiyah.com
 */
export const getFutureCustomDomainUrl = (slug: string, isStoreAdmin: boolean = false): string => {
  const root = getCustomDomainRoot();
  const base = `https://${slug}.${root}`;
  return isStoreAdmin ? `${base}/admin` : base;
};

export const getPlatformDisplayUrl = (page: 'landing' | 'owner-admin' = 'landing'): string => {
  const root = getCustomDomainRoot();
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  if (page === 'owner-admin') {
    return `${protocol}//${root}/owner`;
  }
  return `${protocol}//${root}/`;
};
