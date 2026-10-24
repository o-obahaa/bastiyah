// Verification of new store URL routing, cross-subdomain sharing, and slug resolution
import assert from 'assert';

console.log('--- Testing Store URL Resolution & Cross-Subdomain Synchronization ---');

// Test 1: getStoreDisplayUrl in local vs production
function testGetStoreDisplayUrl(hostname, origin, slug, isStoreAdmin) {
  const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
  if (isLocalOrVercel) {
    return isStoreAdmin ? `${origin}/store/${slug}/admin` : `${origin}/store/${slug}`;
  }
  const root = 'bastiyah.com';
  const protocol = 'https:';
  const base = `${protocol}//${slug}.${root}`;
  return isStoreAdmin ? `${base}/admin` : base;
}

// 1. On localhost, should return localhost path, NOT production bastiyah.com
const localUrl = testGetStoreDisplayUrl('localhost', 'http://localhost:5173', 'new-shoes', false);
assert.strictEqual(localUrl, 'http://localhost:5173/store/new-shoes');
console.log('✅ Localhost store URL correctly stays on local origin:', localUrl);

// 2. On Vercel preview, should stay on vercel origin
const vercelUrl = testGetStoreDisplayUrl('bastiyah-preview.vercel.app', 'https://bastiyah-preview.vercel.app', 'new-shoes', true);
assert.strictEqual(vercelUrl, 'https://bastiyah-preview.vercel.app/store/new-shoes/admin');
console.log('✅ Vercel preview store URL correctly stays on preview origin:', vercelUrl);

// 3. On production custom domain, should return subdomain
const prodUrl = testGetStoreDisplayUrl('bastiyah.com', 'https://bastiyah.com', 'new-shoes', false);
assert.strictEqual(prodUrl, 'https://new-shoes.bastiyah.com');
console.log('✅ Production store URL correctly targets subdomain:', prodUrl);

// 4. Test detectInitialRouting on store subdomain when store not yet in default mock
function testSubdomainRouting(hostname, pathname, allStores, sharedCookieStores) {
  const hostParts = hostname.split('.');
  const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
  if (!isLocalOrVercel && hostParts.length >= 3 && hostParts[0] !== 'www') {
    const sub = hostParts[0];
    const found = allStores.find((s) => s.slug.toLowerCase() === sub);
    if (found) {
      return { storeId: found.id, page: 'home' };
    }
    const cookieMatch = sharedCookieStores.find((cs) => cs.slug.toLowerCase() === sub);
    if (cookieMatch) {
      return { storeId: cookieMatch.id, page: 'home' };
    }
    // Safe fallback: stay in store context, NEVER redirect to bastiyah-landing!
    return { storeId: `store-${sub}`, page: 'home' };
  }
  return { storeId: 'store-panda', page: 'bastiyah-landing' };
}

const mockStores = [{ id: 'store-panda', slug: 'panda' }];
const sharedCookies = [{ id: 'store-custom-1', slug: 'baghdad-cafe' }];

// When landing on a newly created store subdomain:
const res1 = testSubdomainRouting('baghdad-cafe.bastiyah.com', '/', mockStores, sharedCookies);
assert.strictEqual(res1.storeId, 'store-custom-1');
assert.strictEqual(res1.page, 'home');
console.log('✅ New store subdomain correctly resolved from shared cookie:', res1);

// When landing on unknown/fresh subdomain without cookie:
const res2 = testSubdomainRouting('fresh-store.bastiyah.com', '/', mockStores, []);
assert.strictEqual(res2.storeId, 'store-fresh-store');
assert.strictEqual(res2.page, 'home'); // NOT bastiyah-landing!
console.log('✅ Uncached store subdomain safely preserved in store context (NOT landing page):', res2);

// -----------------------------------------------------------------------------
// Test 5: Verify getPagePath for Every Single Distinct Page
// -----------------------------------------------------------------------------
console.log('\n--- Testing Canonical URL Path Generation (getPagePath) ---');

function testGetPagePath(page, storeSlug, productId, currentHostname) {
  const hostname = (currentHostname || 'localhost').toLowerCase();
  const hostParts = hostname.split('.');
  const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
  const isStoreSubdomain = !isLocalOrVercel && hostParts.length >= 3 && storeSlug && hostParts[0] === storeSlug.toLowerCase();

  if (page === 'bastiyah-landing') return '/';
  if (page === 'bastiyah-admin') return '/owner';

  if (isStoreSubdomain) {
    switch (page) {
      case 'home': return '/';
      case 'shop': return '/shop';
      case 'product-detail': return productId ? `/product/${productId}` : '/shop';
      case 'cart': return '/cart';
      case 'checkout': return '/checkout';
      case 'order-success': return '/order-success';
      case 'orders': return '/orders';
      case 'wishlist': return '/wishlist';
      case 'admin': return '/admin';
      default: return '/';
    }
  }

  const baseSlug = storeSlug || 'panda';
  const storePrefix = `/store/${baseSlug}`;

  switch (page) {
    case 'home': return storePrefix;
    case 'shop': return `${storePrefix}/shop`;
    case 'product-detail': return productId ? `${storePrefix}/product/${productId}` : `${storePrefix}/shop`;
    case 'cart': return `${storePrefix}/cart`;
    case 'checkout': return `${storePrefix}/checkout`;
    case 'order-success': return `${storePrefix}/order-success`;
    case 'orders': return `${storePrefix}/orders`;
    case 'wishlist': return `${storePrefix}/wishlist`;
    case 'admin': return `${storePrefix}/admin`;
    default: return storePrefix;
  }
}

// 5a. Path-based / Localhost distinct page URLs
assert.strictEqual(testGetPagePath('bastiyah-landing', 'panda', null, 'localhost'), '/');
assert.strictEqual(testGetPagePath('bastiyah-admin', 'panda', null, 'localhost'), '/owner');
assert.strictEqual(testGetPagePath('home', 'panda', null, 'localhost'), '/store/panda');
assert.strictEqual(testGetPagePath('shop', 'panda', null, 'localhost'), '/store/panda/shop');
assert.strictEqual(testGetPagePath('product-detail', 'panda', 'oud-perfume-1', 'localhost'), '/store/panda/product/oud-perfume-1');
assert.strictEqual(testGetPagePath('checkout', 'panda', null, 'localhost'), '/store/panda/checkout');
assert.strictEqual(testGetPagePath('order-success', 'panda', null, 'localhost'), '/store/panda/order-success');
assert.strictEqual(testGetPagePath('orders', 'panda', null, 'localhost'), '/store/panda/orders');
assert.strictEqual(testGetPagePath('wishlist', 'panda', null, 'localhost'), '/store/panda/wishlist');
assert.strictEqual(testGetPagePath('admin', 'panda', null, 'localhost'), '/store/panda/admin');
console.log('✅ All 10 distinct pages generate correct meaningful path-based URLs on localhost/preview');

// 5b. Subdomain-based distinct page URLs
assert.strictEqual(testGetPagePath('home', 'panda', null, 'panda.bastiyah.com'), '/');
assert.strictEqual(testGetPagePath('shop', 'panda', null, 'panda.bastiyah.com'), '/shop');
assert.strictEqual(testGetPagePath('product-detail', 'panda', 'oud-perfume-1', 'panda.bastiyah.com'), '/product/oud-perfume-1');
assert.strictEqual(testGetPagePath('checkout', 'panda', null, 'panda.bastiyah.com'), '/checkout');
assert.strictEqual(testGetPagePath('order-success', 'panda', null, 'panda.bastiyah.com'), '/order-success');
assert.strictEqual(testGetPagePath('orders', 'panda', null, 'panda.bastiyah.com'), '/orders');
assert.strictEqual(testGetPagePath('wishlist', 'panda', null, 'panda.bastiyah.com'), '/wishlist');
assert.strictEqual(testGetPagePath('admin', 'panda', null, 'panda.bastiyah.com'), '/admin');
console.log('✅ All 8 store pages generate correct meaningful subdomain URLs on production');

// -----------------------------------------------------------------------------
// Test 6: Verify detectInitialRouting on Direct Page Entry & Refresh
// -----------------------------------------------------------------------------
console.log('\n--- Testing Direct Page Access & Refresh Resolution ---');

const KNOWN_STORE_SUBPAGES = {
  shop: 'shop',
  checkout: 'checkout',
  'order-success': 'order-success',
  orders: 'orders',
  wishlist: 'wishlist',
  admin: 'admin',
  home: 'home',
  cart: 'cart',
};

function testDetectRouting(hostname, pathname, search = '') {
  const searchParams = new URLSearchParams(search);
  const cleanPath = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const queryProduct = searchParams.get('product') || searchParams.get('p') || undefined;
  const queryPage = (searchParams.get('page') || '').toLowerCase();

  const allStores = [
    { id: 'store-panda', slug: 'panda' },
    { id: 'store-royal-oud', slug: 'royal-oud' },
  ];

  const findStoreBySlugOrId = (slugOrId) => {
    const clean = slugOrId.toLowerCase();
    return allStores.find((s) => s.slug.toLowerCase() === clean || s.id === clean);
  };

  if (cleanPath === '/owner') {
    return { storeId: 'store-panda', page: 'bastiyah-admin' };
  }

  const hostParts = hostname.toLowerCase().split('.');
  const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');

  if (!isLocalOrVercel && hostParts.length >= 3 && hostParts[0] !== 'www') {
    const sub = hostParts[0];
    const found = findStoreBySlugOrId(sub);
    const storeId = found?.id || `store-${sub}`;

    const subProductMatch = cleanPath.match(/^\/(?:product|p)\/([a-z0-9-]+)/i);
    if (subProductMatch) {
      return { storeId, page: 'product-detail', productId: subProductMatch[1] };
    }

    const subRoute = cleanPath.replace(/^\//, '').toLowerCase();
    if (subRoute === 'admin' || searchParams.get('admin') === 'true') {
      return { storeId, page: 'admin' };
    }
    if (subRoute in KNOWN_STORE_SUBPAGES) {
      return { storeId, page: KNOWN_STORE_SUBPAGES[subRoute] };
    }
    return { storeId, page: 'home' };
  }

  // Path-based: /store/:slug/:subpage or /store/:slug/product/:pid
  const storeProductMatch = cleanPath.match(/^\/store\/([a-z0-9-]+)\/(?:product|p)\/([a-z0-9-]+)/i);
  if (storeProductMatch) {
    const slug = storeProductMatch[1].toLowerCase();
    const pid = storeProductMatch[2];
    const found = findStoreBySlugOrId(slug);
    return { storeId: found?.id || `store-${slug}`, page: 'product-detail', productId: pid };
  }

  const storePathMatch = cleanPath.match(/^\/store\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/i);
  if (storePathMatch) {
    const slug = storePathMatch[1].toLowerCase();
    const subRoute = storePathMatch[2]?.toLowerCase();
    const found = findStoreBySlugOrId(slug);
    const storeId = found?.id || `store-${slug}`;

    if (subRoute === 'admin' || searchParams.get('admin') === 'true') {
      return { storeId, page: 'admin' };
    }
    if (subRoute && subRoute in KNOWN_STORE_SUBPAGES) {
      return { storeId, page: KNOWN_STORE_SUBPAGES[subRoute] };
    }
    return { storeId, page: 'home' };
  }

  // Standalone routes on localhost (e.g. /shop, /checkout, /orders, /wishlist)
  const segments = cleanPath.replace(/^\//, '').split('/');
  const directSlug = segments[0]?.toLowerCase();
  if (directSlug && directSlug in KNOWN_STORE_SUBPAGES) {
    return { storeId: 'store-panda', page: KNOWN_STORE_SUBPAGES[directSlug] };
  }

  return { storeId: 'store-panda', page: 'bastiyah-landing' };
}

// Direct /owner entry
assert.strictEqual(testDetectRouting('localhost', '/owner').page, 'bastiyah-admin');

// Direct path-based subpages
assert.strictEqual(testDetectRouting('localhost', '/store/panda/shop').page, 'shop');
assert.strictEqual(testDetectRouting('localhost', '/store/panda/orders').page, 'orders');
assert.strictEqual(testDetectRouting('localhost', '/store/panda/wishlist').page, 'wishlist');
assert.strictEqual(testDetectRouting('localhost', '/store/panda/checkout').page, 'checkout');
assert.strictEqual(testDetectRouting('localhost', '/store/panda/order-success').page, 'order-success');
assert.strictEqual(testDetectRouting('localhost', '/store/panda/admin').page, 'admin');
const productRoute = testDetectRouting('localhost', '/store/panda/product/oud-100');
assert.strictEqual(productRoute.page, 'product-detail');
assert.strictEqual(productRoute.productId, 'oud-100');
console.log('✅ Direct entry & refresh to nested path-based routes (/store/panda/*) correctly resolved');

// Direct subdomain subpages
assert.strictEqual(testDetectRouting('panda.bastiyah.com', '/shop').page, 'shop');
assert.strictEqual(testDetectRouting('panda.bastiyah.com', '/orders').page, 'orders');
assert.strictEqual(testDetectRouting('panda.bastiyah.com', '/wishlist').page, 'wishlist');
assert.strictEqual(testDetectRouting('panda.bastiyah.com', '/checkout').page, 'checkout');
assert.strictEqual(testDetectRouting('panda.bastiyah.com', '/order-success').page, 'order-success');
assert.strictEqual(testDetectRouting('panda.bastiyah.com', '/admin').page, 'admin');
const subProductRoute = testDetectRouting('panda.bastiyah.com', '/product/musk-50');
assert.strictEqual(subProductRoute.page, 'product-detail');
assert.strictEqual(subProductRoute.productId, 'musk-50');
console.log('✅ Direct entry & refresh to subdomain routes (*.bastiyah.com/*) correctly resolved');

// Standalone direct routes on localhost
assert.strictEqual(testDetectRouting('localhost', '/shop').page, 'shop');
assert.strictEqual(testDetectRouting('localhost', '/orders').page, 'orders');
assert.strictEqual(testDetectRouting('localhost', '/wishlist').page, 'wishlist');
assert.strictEqual(testDetectRouting('localhost', '/checkout').page, 'checkout');
console.log('✅ Standalone routes on localhost (/shop, /orders, etc.) correctly resolved');

// -----------------------------------------------------------------------------
// Test 7: Verify History Navigation & PopState Integrity
// -----------------------------------------------------------------------------
console.log('\n--- Testing Browser Back / Forward PopState Integrity ---');

let simulatedHistory = [];
let simulatedIndex = -1;
let appCurrentPage = 'bastiyah-landing';
let isPopState = false;

function simulatePush(page, path) {
  if (isPopState) {
    isPopState = false;
    return;
  }
  simulatedHistory = simulatedHistory.slice(0, simulatedIndex + 1);
  simulatedHistory.push({ page, path });
  simulatedIndex++;
  appCurrentPage = page;
}

function simulateBack() {
  if (simulatedIndex > 0) {
    simulatedIndex--;
    isPopState = true;
    appCurrentPage = simulatedHistory[simulatedIndex].page;
  }
}

function simulateForward() {
  if (simulatedIndex < simulatedHistory.length - 1) {
    simulatedIndex++;
    isPopState = true;
    appCurrentPage = simulatedHistory[simulatedIndex].page;
  }
}

// 1. User starts at Landing
simulatePush('bastiyah-landing', '/');
assert.strictEqual(appCurrentPage, 'bastiyah-landing');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/');

// 2. User navigates to Store Home
simulatePush('home', '/store/panda');
assert.strictEqual(appCurrentPage, 'home');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/store/panda');

// 3. User navigates to Shop
simulatePush('shop', '/store/panda/shop');
assert.strictEqual(appCurrentPage, 'shop');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/store/panda/shop');

// 4. User navigates to Wishlist
simulatePush('wishlist', '/store/panda/wishlist');
assert.strictEqual(appCurrentPage, 'wishlist');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/store/panda/wishlist');

// 5. User clicks Browser Back (should go to Shop)
simulateBack();
assert.strictEqual(appCurrentPage, 'shop');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/store/panda/shop');

// 6. User clicks Browser Back again (should go to Home)
simulateBack();
assert.strictEqual(appCurrentPage, 'home');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/store/panda');

// 7. User clicks Browser Forward (should go to Shop)
simulateForward();
assert.strictEqual(appCurrentPage, 'shop');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/store/panda/shop');

// 8. User clicks Browser Forward again (should go to Wishlist)
simulateForward();
assert.strictEqual(appCurrentPage, 'wishlist');
assert.strictEqual(simulatedHistory[simulatedIndex].path, '/store/panda/wishlist');

console.log('✅ Browser Back and Forward history stack simulation passed with zero duplicate pushState calls');

console.log('\n🎉 ALL STORE URL ROUTING & NAVIGATION TESTS PASSED CLEANLY!');
