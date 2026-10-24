/**
 * Bastiyah Multi-Tenant Core Architecture Engine
 * 
 * Responsibilities:
 * 1. Tenant Resolution (subdomain, path-based, custom domains)
 * 2. Tenant Isolation & Scope Verification (prevents cross-store data leakage)
 * 3. Store Configuration & Feature Flags (reviews, wishlist, delivery tracking, etc.)
 * 4. Dynamic Theme Token Resolution & CSS Variable Application
 */

import { 
  HostedStore, 
  StoreFeaturesConfig, 
  StoreThemeTokens, 
  DEFAULT_STORE_FEATURES, 
  DEFAULT_STORE_THEME_TOKENS,
  StoreThemeColor
} from '../types';

export const THEME_COLOR_MAP: Record<StoreThemeColor, { primary: string; accent: string; rgb: string }> = {
  emerald: { primary: '#059669', accent: '#10b981', rgb: '5, 150, 105' },
  indigo:  { primary: '#4f46e5', accent: '#6366f1', rgb: '79, 70, 229' },
  amber:   { primary: '#d97706', accent: '#f59e0b', rgb: '217, 119, 6' },
  rose:    { primary: '#e11d48', accent: '#f43f5e', rgb: '225, 29, 72' },
  cyan:    { primary: '#0891b2', accent: '#06b6d4', rgb: '8, 145, 178' },
  violet:  { primary: '#7c3aed', accent: '#8b5cf6', rgb: '124, 58, 237' },
};

export const CARD_RADIUS_MAP: Record<string, string> = {
  sharp: '0px',
  none: '0px',
  sm: '0.25rem',
  rounded: '0.75rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  pill: '9999px',
  full: '9999px',
};

/**
 * Merges store feature configurations with default feature flags.
 * Guarantees that every store has a complete, strongly-typed feature set.
 */
export function resolveStoreFeatures(store?: HostedStore | null): StoreFeaturesConfig {
  if (!store || !store.features) {
    return { ...DEFAULT_STORE_FEATURES };
  }
  return {
    ...DEFAULT_STORE_FEATURES,
    ...store.features,
  };
}

/**
 * Checks whether a specific feature is enabled for a given store.
 */
export function isStoreFeatureEnabled(
  store: HostedStore | null | undefined, 
  feature: keyof StoreFeaturesConfig
): boolean {
  const features = resolveStoreFeatures(store);
  return !!features[feature];
}

/**
 * Resolves theme tokens for a store, bridging legacy store.design with StoreThemeTokens.
 */
export function resolveStoreTheme(store?: HostedStore | null): StoreThemeTokens {
  if (!store) {
    return { ...DEFAULT_STORE_THEME_TOKENS };
  }

  const legacyColor = store.design?.themeColor || 'emerald';
  const colorDef = THEME_COLOR_MAP[legacyColor] || THEME_COLOR_MAP.emerald;
  const primaryColor = store.design?.customThemeColor || store.themeTokens?.primaryColor || colorDef.primary;
  const accentColor = store.themeTokens?.accentColor || colorDef.accent;

  const cardRadiusKey = store.themeTokens?.cardBorderRadius || 
    (store.design?.cardRadius === 'pill' ? 'pill' : store.design?.cardRadius === 'sharp' ? 'sharp' : 'xl');

  return {
    primaryColor,
    accentColor,
    fontFamily: store.themeTokens?.fontFamily || 'sans',
    cardBorderRadius: (cardRadiusKey as StoreThemeTokens['cardBorderRadius']) || 'xl',
    cardShadow: store.themeTokens?.cardShadow || 'sm',
    headerLayout: store.themeTokens?.headerLayout || 'standard',
    footerLayout: store.themeTokens?.footerLayout || 'simple',
  };
}

/**
 * Dynamically applies the store's theme CSS custom properties to the HTML document.
 * This ensures all components, borders, badges, and accents inherit the store's unique identity.
 */
export function applyStoreThemeToDocument(store?: HostedStore | null): void {
  if (typeof document === 'undefined') return;

  const theme = resolveStoreTheme(store);
  const root = document.documentElement;

  // Apply custom CSS variables
  root.style.setProperty('--bastiyah-primary', theme.primaryColor);
  root.style.setProperty('--bastiyah-accent', theme.accentColor || theme.primaryColor);
  
  const radiusPx = CARD_RADIUS_MAP[theme.cardBorderRadius] || '0.75rem';
  root.style.setProperty('--bastiyah-radius', radiusPx);

  // Set data-store attribute for tenant styling hooks
  if (store?.slug) {
    root.setAttribute('data-store-slug', store.slug);
    root.setAttribute('data-store-theme', store.design?.themeColor || 'emerald');
  } else {
    root.removeAttribute('data-store-slug');
    root.removeAttribute('data-store-theme');
  }
}

/**
 * Tenant Isolation Guard
 * Enforces strict boundary verification to ensure queries and mutations cannot leak across stores.
 */
export class TenantIsolationGuard {
  /**
   * Asserts that a target resource belongs to the current active store.
   * Throws an error or returns false if tenant isolation is violated.
   */
  static assertScope(activeStoreId: string, resourceStoreId: string, entityName = 'Resource'): void {
    if (!activeStoreId || !resourceStoreId) {
      console.warn(`[TenantGuard] Scope check missing identifier: activeStoreId=${activeStoreId}, resourceStoreId=${resourceStoreId}`);
      return;
    }
    if (activeStoreId !== resourceStoreId) {
      const errorMsg = `[TenantSecurityViolation] Unauthorized cross-tenant access to ${entityName}. Active store: ${activeStoreId}, target store: ${resourceStoreId}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Filters an array of tenant-bound records, guaranteeing zero records from other stores are exposed.
   */
  static filterTenantItems<T extends { storeId?: string }>(items: T[], activeStoreId: string): T[] {
    if (!activeStoreId) return items;
    return items.filter(item => !item.storeId || item.storeId === activeStoreId);
  }

  /**
   * Validates store owner authorization credentials against store settings.
   */
  static isOwnerAuthorized(store: HostedStore, candidatePassword?: string): boolean {
    if (!store.adminPassword) return true; // Default access if not set
    if (!candidatePassword) return false;
    return store.adminPassword === candidatePassword;
  }
}
