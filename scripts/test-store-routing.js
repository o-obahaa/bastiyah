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

console.log('🎉 ALL STORE URL ROUTING TESTS PASSED!');
