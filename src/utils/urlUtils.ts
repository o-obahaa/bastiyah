/**
 * Utility helpers for Bastiyah multi-store subdomain URLs on Vercel
 * e.g. https://(storename).bastiyah.vercel.app
 */

export const BASTIYAH_PLATFORM_HOST = 'bastiyah.vercel.app';

export const getStoreSubdomain = (slug: string): string => {
  return `${slug}.bastiyah.vercel.app`;
};

export const getStoreDisplayUrl = (slug: string, isStoreAdmin: boolean = false): string => {
  const base = `https://${slug}.bastiyah.vercel.app`;
  return isStoreAdmin ? `${base}/admin` : base;
};

export const getPlatformDisplayUrl = (page: 'landing' | 'owner-admin' = 'landing'): string => {
  if (page === 'owner-admin') return 'https://owner.bastiyah.vercel.app';
  return 'https://bastiyah.vercel.app';
};
