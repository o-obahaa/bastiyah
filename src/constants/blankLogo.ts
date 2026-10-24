/**
 * Blank Store Logo Placeholder & Built-in Brand Emblems
 * A neutral, formal blank photo graphic used when no custom logo is uploaded for a store,
 * plus curated executive brand emblems for default platform stores.
 */

export const DEFAULT_STORE_LOGOS: Record<string, string> = {
  panda: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="28" fill="%23059669"/><rect x="8" y="8" width="104" height="104" rx="22" stroke="%2334d399" stroke-width="2" stroke-opacity="0.35"/><path d="M42 32h24c13.255 0 22 8.745 22 20s-8.745 20-22 20H56v20H42V32zm14 28h10c6.627 0 10-3.373 10-8s-3.373-8-10-8H56v16z" fill="%23ffffff"/><circle cx="88" cy="36" r="5" fill="%2334d399"/></svg>`,

  'royal-oud': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="26" fill="%23fffbeb"/><path d="M34 76l6-36 20 16 20-16 6 36H34z" fill="%23f59e0b" stroke="%23b45309" stroke-width="3" stroke-linejoin="round"/><circle cx="34" cy="38" r="5" fill="%23d97706"/><circle cx="60" cy="52" r="5" fill="%23d97706"/><circle cx="86" cy="38" r="5" fill="%23d97706"/><rect x="42" y="76" width="36" height="10" rx="4" fill="%23b45309"/></svg>`,

  velvet: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="26" fill="%23fff1f2"/><path d="M78 34c-8 0-14 8-14 18 0 12 12 18 12 28 0 8-6 14-16 14-8 0-14-4-16-10" stroke="%23f43f5e" stroke-width="4.5" stroke-linecap="round"/><circle cx="78" cy="34" r="5" fill="%23e11d48"/><path d="M42 66c6 8 16 14 26 14" stroke="%23fb7185" stroke-width="3" stroke-linecap="round"/></svg>`,

  qurtuba: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="26" fill="%23eff6ff"/><path d="M36 44h48l-6 44H42L36 44z" fill="%233b82f6" stroke="%231d4ed8" stroke-width="3"/><path d="M48 44V34a12 12 0 0124 0v10" stroke="%231d4ed8" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="62" r="6" fill="%23ffffff"/></svg>`,
};

export const BLANK_STORE_LOGO_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="22" fill="%23f8fafc"/><rect x="18" y="18" width="84" height="84" rx="16" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="2" stroke-dasharray="5 4"/><path d="M38 78l15-18 13 15 11-13 17 21H38z" fill="%2394a3b8"/><circle cx="48" cy="46" r="7" fill="%2364748b"/></svg>`;

/**
 * Returns the store's custom logo if available, or the store's default emblem, or the formal blank photo placeholder.
 */
export function getStoreLogo(store?: { slug?: string; logo?: string; design?: { customLogoUrl?: string } } | null): string {
  if (!store) return BLANK_STORE_LOGO_URL;
  
  // 1. Highest priority: User's custom uploaded logo (via design or direct property)
  const custom = store.design?.customLogoUrl?.trim();
  if (custom) return custom;
  const legacy = store.logo?.trim();
  if (legacy) return legacy;

  // 2. Default branded emblem for pre-configured stores
  const slug = (store.slug || '').toLowerCase();
  if (DEFAULT_STORE_LOGOS[slug]) return DEFAULT_STORE_LOGOS[slug];
  for (const [key, val] of Object.entries(DEFAULT_STORE_LOGOS)) {
    if (slug.includes(key)) return val;
  }

  // 3. Fallback: Formal blank photo placeholder
  return BLANK_STORE_LOGO_URL;
}

export function hasCustomLogo(store?: { logo?: string; design?: { customLogoUrl?: string } } | null): boolean {
  if (!store) return false;
  return Boolean(store.design?.customLogoUrl?.trim() || store.logo?.trim());
}
