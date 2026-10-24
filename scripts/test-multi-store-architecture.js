import assert from 'node:assert';

console.log('--- 1. Testing Store Feature Flags & Defaults Resolution ---');

const DEFAULT_STORE_FEATURES = {
  reviews: true,
  wishlist: true,
  heroSlider: true,
  deliveryTracking: true,
  whatsappOrders: true,
  customDiscounts: true,
  showBadges: true,
  orderTrackingLookup: true,
  announcements: true,
};

function resolveStoreFeatures(store) {
  if (!store || !store.features) {
    return { ...DEFAULT_STORE_FEATURES };
  }
  return {
    ...DEFAULT_STORE_FEATURES,
    ...store.features,
  };
}

function isStoreFeatureEnabled(store, feature) {
  const features = resolveStoreFeatures(store);
  return !!features[feature];
}

// Test A: Store with full defaults
const freshStore = { id: 'store-new', slug: 'fresh' };
assert.strictEqual(isStoreFeatureEnabled(freshStore, 'reviews'), true, 'Fresh store has reviews enabled by default');
assert.strictEqual(isStoreFeatureEnabled(freshStore, 'wishlist'), true, 'Fresh store has wishlist enabled by default');
assert.strictEqual(isStoreFeatureEnabled(freshStore, 'customDiscounts'), true, 'Fresh store has discounts enabled by default');
console.log('✅ Default feature flags resolution passed');

// Test B: Luxury store with disabled coupons & slider (e.g. Royal Oud / Velvet)
const luxuryStore = {
  id: 'store-velvet',
  slug: 'velvet',
  features: {
    customDiscounts: false,
    heroSlider: false,
  },
};
assert.strictEqual(isStoreFeatureEnabled(luxuryStore, 'customDiscounts'), false, 'Luxury store has discounts disabled');
assert.strictEqual(isStoreFeatureEnabled(luxuryStore, 'heroSlider'), false, 'Luxury store has hero slider disabled');
assert.strictEqual(isStoreFeatureEnabled(luxuryStore, 'whatsappOrders'), true, 'Luxury store retains default enabled features');
console.log('✅ Custom store feature overrides verified');

console.log('--- 2. Testing Tenant Isolation & Resource Scope Enforcement ---');

class TenantIsolationGuard {
  static assertScope(activeStoreId, resourceStoreId, entityName = 'Resource') {
    if (!activeStoreId || !resourceStoreId) return;
    if (activeStoreId !== resourceStoreId) {
      throw new Error(`[TenantSecurityViolation] Unauthorized cross-tenant access to ${entityName}. Active: ${activeStoreId}, Target: ${resourceStoreId}`);
    }
  }

  static filterTenantItems(items, activeStoreId) {
    if (!activeStoreId) return items;
    return items.filter(item => !item.storeId || item.storeId === activeStoreId);
  }
}

// Scope check: same store passes
assert.doesNotThrow(() => {
  TenantIsolationGuard.assertScope('store-panda', 'store-panda', 'Product');
}, 'Same store access must succeed');

// Scope check: cross-tenant access throws
assert.throws(() => {
  TenantIsolationGuard.assertScope('store-panda', 'store-velvet', 'Order');
}, /TenantSecurityViolation/, 'Cross-tenant access must be rejected');
console.log('✅ Cross-tenant assertion guard prevented unauthorized resource access');

// Resource filtering across stores
const mockOrders = [
  { id: 'ord-1', storeId: 'store-panda', total: 100 },
  { id: 'ord-2', storeId: 'store-panda', total: 200 },
  { id: 'ord-3', storeId: 'store-royal-oud', total: 450 },
  { id: 'ord-4', storeId: 'store-velvet', total: 320 },
];

const pandaOrders = TenantIsolationGuard.filterTenantItems(mockOrders, 'store-panda');
assert.strictEqual(pandaOrders.length, 2);
assert.strictEqual(pandaOrders.every(o => o.storeId === 'store-panda'), true);

const velvetOrders = TenantIsolationGuard.filterTenantItems(mockOrders, 'store-velvet');
assert.strictEqual(velvetOrders.length, 1);
assert.strictEqual(velvetOrders[0].id, 'ord-4');
console.log('✅ TenantIsolationGuard filtered records strictly to active tenant');

console.log('--- 3. Testing Theme Token Resolution & Bridge ---');

const THEME_COLOR_MAP = {
  emerald: { primary: '#059669', accent: '#10b981' },
  indigo:  { primary: '#4f46e5', accent: '#6366f1' },
  amber:   { primary: '#d97706', accent: '#f59e0b' },
  rose:    { primary: '#e11d48', accent: '#f43f5e' },
  cyan:    { primary: '#0891b2', accent: '#06b6d4' },
  violet:  { primary: '#7c3aed', accent: '#8b5cf6' },
};

function resolveStoreTheme(store) {
  const legacyColor = store?.design?.themeColor || 'emerald';
  const colorDef = THEME_COLOR_MAP[legacyColor] || THEME_COLOR_MAP.emerald;
  const primaryColor = store?.design?.customThemeColor || store?.themeTokens?.primaryColor || colorDef.primary;
  const accentColor = store?.themeTokens?.accentColor || colorDef.accent;

  const cardRadiusKey = store?.themeTokens?.cardBorderRadius || 
    (store?.design?.cardRadius === 'pill' ? 'pill' : store?.design?.cardRadius === 'sharp' ? 'sharp' : 'xl');

  return {
    primaryColor,
    accentColor,
    cardBorderRadius: cardRadiusKey,
  };
}

const oudStore = {
  design: { themeColor: 'amber', cardRadius: 'rounded' },
  themeTokens: { primaryColor: '#d97706', cardBorderRadius: 'lg' }
};

const oudTheme = resolveStoreTheme(oudStore);
assert.strictEqual(oudTheme.primaryColor, '#d97706');
assert.strictEqual(oudTheme.cardBorderRadius, 'lg');
console.log('✅ Store theme token resolution and legacy bridge verified');

console.log('\n🎉 ALL MULTI-STORE ARCHITECTURE TESTS PASSED CLEANLY!\n');
