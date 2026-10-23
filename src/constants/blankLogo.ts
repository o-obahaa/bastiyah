/**
 * Blank Store Logo Placeholder
 * A neutral, formal blank photo graphic used when no custom logo is uploaded for a store.
 */
export const BLANK_STORE_LOGO_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="22" fill="%23f8fafc"/><rect x="18" y="18" width="84" height="84" rx="16" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="2" stroke-dasharray="5 4"/><path d="M38 78l15-18 13 15 11-13 17 21H38z" fill="%2394a3b8"/><circle cx="48" cy="46" r="7" fill="%2364748b"/></svg>`;

/**
 * Returns the store's custom logo if available, or the formal blank photo placeholder.
 */
export function getStoreLogo(store?: { logo?: string; design?: { customLogoUrl?: string } } | null): string {
  if (!store) return BLANK_STORE_LOGO_URL;
  const custom = store.design?.customLogoUrl?.trim();
  if (custom) return custom;
  const legacy = store.logo?.trim();
  if (legacy) return legacy;
  return BLANK_STORE_LOGO_URL;
}

export function hasCustomLogo(store?: { logo?: string; design?: { customLogoUrl?: string } } | null): boolean {
  if (!store) return false;
  return Boolean(store.design?.customLogoUrl?.trim() || store.logo?.trim());
}
