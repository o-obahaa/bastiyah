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
 * In local/dev or Vercel preview environments, returns safe path on current origin
 */
export const getStoreDisplayUrl = (slug: string, isStoreAdmin: boolean = false): string => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
    if (isLocalOrVercel) {
      const origin = window.location.origin;
      return isStoreAdmin ? `${origin}/store/${slug}/admin` : `${origin}/store/${slug}`;
    }
  }
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

/**
 * Persists customer authentication across hosted store subdomains (e.g. *.bastiyah.com)
 */
export const setSharedCustomerCookie = (customer: any | null) => {
  if (typeof document === 'undefined') return;
  const root = getCustomDomainRoot();
  const domainPart = root && !root.includes('localhost') ? `; domain=.${root}` : '';
  if (!customer) {
    document.cookie = `bastiyah_shared_customer=; path=/${domainPart}; max-age=0; SameSite=Lax`;
  } else {
    try {
      const val = encodeURIComponent(JSON.stringify(customer));
      // 30 days expiration
      document.cookie = `bastiyah_shared_customer=${val}; path=/${domainPart}; max-age=2592000; SameSite=Lax`;
    } catch {
      // ignore
    }
  }
};

/**
 * Retrieves customer authentication shared across hosted store subdomains
 */
export const getSharedCustomerCookie = (): any | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)bastiyah_shared_customer=([^;]*)/);
  if (match && match[1]) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Persists custom hosted stores across subdomains (*.bastiyah.com)
 */
export const setSharedStoresCookie = (allStores: any[]) => {
  if (typeof document === 'undefined') return;
  const root = getCustomDomainRoot();
  const domainPart = root && !root.includes('localhost') ? `; domain=.${root}` : '';
  const initialSlugs = new Set(['panda', 'royal-oud', 'velvet']);
  const customStores = allStores.filter((s) => s.slug && !initialSlugs.has(s.slug.toLowerCase()));
  if (customStores.length === 0) {
    document.cookie = `bastiyah_shared_stores=; path=/${domainPart}; max-age=0; SameSite=Lax`;
    return;
  }
  try {
    // Keep compact summary for cookie size limits (under 4KB)
    const summaries = customStores.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      nameAr: s.nameAr,
      tagline: s.tagline,
      taglineAr: s.taglineAr,
      category: s.category,
      categoryAr: s.categoryAr,
      ownerName: s.ownerName,
      ownerEmail: s.ownerEmail,
      ownerPhone: s.ownerPhone,
      adminPassword: s.adminPassword,
      status: s.status,
      plan: s.plan,
      createdAt: s.createdAt,
      design: s.design,
      settings: s.settings,
    }));
    const val = encodeURIComponent(JSON.stringify(summaries));
    document.cookie = `bastiyah_shared_stores=${val}; path=/${domainPart}; max-age=2592000; SameSite=Lax`;
  } catch (e) {
    console.warn('Failed to set shared stores cookie:', e);
  }
};

/**
 * Retrieves custom hosted stores shared across subdomains (*.bastiyah.com)
 */
export const getSharedStoresCookie = (): any[] => {
  if (typeof document === 'undefined') return [];
  const match = document.cookie.match(/(?:^|;\s*)bastiyah_shared_stores=([^;]*)/);
  if (match && match[1]) {
    try {
      const parsed = JSON.parse(decodeURIComponent(match[1]));
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};
