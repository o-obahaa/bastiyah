/**
 * Utility helpers for Bastiyah multi-store URLs
 * - Live working URL on Vercel: https://bastiyah.vercel.app/store/(slug)
 * - Custom domain with wildcards: https://(slug).yourdomain.com
 */

export const BASTIYAH_PLATFORM_HOST = 'bastiyah.vercel.app';

/**
 * Returns current origin or fallback host
 */
export const getPlatformOrigin = (): string => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return `https://${BASTIYAH_PLATFORM_HOST}`;
};

/**
 * Detects if the current deployment is running on a custom domain (not localhost, not vercel.app)
 * e.g. for "panda.bastiyah.com" or "bastiyah.com" returns "bastiyah.com"
 */
export const getCustomDomainRoot = (): string | null => {
  if (typeof window === 'undefined') return null;
  const hostname = window.location.hostname.toLowerCase();
  if (
    hostname.includes('localhost') || 
    hostname.includes('127.0.0.1') || 
    hostname.endsWith('.vercel.app')
  ) {
    return null;
  }
  const parts = hostname.split('.');
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts.slice(1).join('.');
  }
  return hostname.replace(/^www\./, '');
};

/**
 * Returns the live working full URL for a store
 * - On Custom Domain: https://(slug).yourdomain.com
 * - On Vercel: https://bastiyah.vercel.app/store/(slug)
 */
export const getStoreDisplayUrl = (slug: string, isStoreAdmin: boolean = false): string => {
  const customRoot = getCustomDomainRoot();
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  
  if (customRoot) {
    const base = `${protocol}//${slug}.${customRoot}`;
    return isStoreAdmin ? `${base}/admin` : base;
  }

  const origin = getPlatformOrigin();
  const path = isStoreAdmin ? `/store/${slug}/admin` : `/store/${slug}`;
  return `${origin}${path}`;
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
 * e.g. panda.yourdomain.com (on custom domain) or bastiyah.vercel.app/store/panda (on Vercel)
 */
export const getStorePathLabel = (slug: string, isStoreAdmin: boolean = false): string => {
  const customRoot = getCustomDomainRoot();
  if (customRoot) {
    const base = `${slug}.${customRoot}`;
    return isStoreAdmin ? `${base}/admin` : base;
  }

  const host = typeof window !== 'undefined' && window.location.host
    ? window.location.host
    : BASTIYAH_PLATFORM_HOST;
  const path = isStoreAdmin ? `/store/${slug}/admin` : `/store/${slug}`;
  return `${host}${path}`;
};

/**
 * Future custom domain format
 * e.g. https://panda.bastiyah.com
 */
export const getFutureCustomDomainUrl = (slug: string, isStoreAdmin: boolean = false): string => {
  const customRoot = getCustomDomainRoot() || 'bastiyah.com';
  const base = `https://${slug}.${customRoot}`;
  return isStoreAdmin ? `${base}/admin` : base;
};

export const getPlatformDisplayUrl = (page: 'landing' | 'owner-admin' = 'landing'): string => {
  const customRoot = getCustomDomainRoot();
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  
  if (customRoot) {
    const base = `${protocol}//${customRoot}`;
    return page === 'owner-admin' ? `${base}/owner` : `${base}/`;
  }

  const origin = getPlatformOrigin();
  return page === 'owner-admin' ? `${origin}/owner` : `${origin}/`;
};
