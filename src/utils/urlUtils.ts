/**
 * Utility helpers for Bastiyah multi-store URLs
 * - Live working URL on Vercel: https://bastiyah.vercel.app/store/(slug)
 * - Future custom domain: https://(slug).bastiyah.com
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
 * Returns the live working full URL for a store on the current deployment
 * e.g. https://bastiyah.vercel.app/store/panda
 */
export const getStoreDisplayUrl = (slug: string, isStoreAdmin: boolean = false): string => {
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
 * e.g. bastiyah.vercel.app/store/panda
 */
export const getStorePathLabel = (slug: string, isStoreAdmin: boolean = false): string => {
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
  const base = `https://${slug}.bastiyah.com`;
  return isStoreAdmin ? `${base}/admin` : base;
};

export const getPlatformDisplayUrl = (page: 'landing' | 'owner-admin' = 'landing'): string => {
  const origin = getPlatformOrigin();
  return page === 'owner-admin' ? `${origin}/owner` : `${origin}/`;
};
