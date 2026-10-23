import assert from 'node:assert';

// 1. Test canonical Iraqi phone normalization and matching
export const normalizePhoneDigits = (raw) => {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00964')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('964')) {
    digits = digits.slice(3);
  }
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
};

export const phonesMatch = (p1, p2) => {
  if (!p1 || !p2) return false;
  const n1 = normalizePhoneDigits(p1);
  const n2 = normalizePhoneDigits(p2);
  if (!n1 || !n2) return false;
  return n1 === n2;
};

console.log('--- 1. Testing Iraqi Phone Matching & Operator Collision Prevention ---');
// Various valid formats of the same Iraqi number
assert.strictEqual(phonesMatch('0770 123 4567', '+964 770 123 4567'), true, 'Local formatted vs international');
assert.strictEqual(phonesMatch('07701234567', '9647701234567'), true, 'Raw digits vs 964 prefix');
assert.strictEqual(phonesMatch('00964 770 123 4567', '7701234567'), true, '00964 prefix vs 10-digit number');
assert.strictEqual(phonesMatch('+964 0770 123 4567', '0770 123 4567'), true, '+964 with leading zero');
assert.strictEqual(phonesMatch('+9647802345678', '0780 234 5678'), true, 'Zain number match');
assert.strictEqual(phonesMatch('0750 345 6789', '+964 750 345 6789'), true, 'Korek number match');

// CRITICAL: Numbers sharing last 8 digits but from DIFFERENT operators MUST NOT match!
assert.strictEqual(phonesMatch('0770 123 4567', '0780 123 4567'), false, 'Asiacell vs Zain with same suffix must NOT match');
assert.strictEqual(phonesMatch('0770 123 4567', '0750 123 4567'), false, 'Asiacell vs Korek with same suffix must NOT match');
assert.strictEqual(phonesMatch('0780 123 4567', '0750 123 4567'), false, 'Zain vs Korek with same suffix must NOT match');

// Empty and invalid checks
assert.strictEqual(phonesMatch('', '0770 123 4567'), false, 'Empty phone should not match');
assert.strictEqual(phonesMatch(undefined, '0770 123 4567'), false, 'Undefined should not match');
assert.strictEqual(phonesMatch(null, '0770 123 4567'), false, 'Null should not match');
console.log('✅ Phone matching & operator collision prevention passed!');

console.log('--- 2. Testing Multi-Store Customer Synchronization & Profile Propagation ---');

// Mock hosted stores
const stores = [
  { id: 'store-panda', slug: 'panda', name: 'Panda Store', customers: [], orders: [] },
  { id: 'store-royal-oud', slug: 'royal-oud', name: 'Royal Oud', customers: [], orders: [] },
  { id: 'store-velvet', slug: 'velvet', name: 'Velvet Atelier', customers: [], orders: [] }
];

let universalCustomers = [];
let currentCustomer = null;

const syncCustomerToAllStores = (profile) => {
  const rawPhone = profile.phone;
  const cleanPhone = rawPhone.replace(/\D/g, '');

  const existingIdx = universalCustomers.findIndex((p) => phonesMatch(p.phone, cleanPhone));
  const updatedUser = {
    id: existingIdx >= 0 ? universalCustomers[existingIdx].id : `cust-wa-${Date.now()}`,
    name: profile.name.trim() || 'Customer',
    phone: rawPhone.trim(),
    email: profile.email?.trim() || (existingIdx >= 0 ? universalCustomers[existingIdx].email : undefined),
    city: profile.city?.trim() || (existingIdx >= 0 ? universalCustomers[existingIdx].city : undefined),
    state: profile.state?.trim() || (existingIdx >= 0 ? universalCustomers[existingIdx].state : undefined),
    address: profile.address?.trim() || (existingIdx >= 0 ? universalCustomers[existingIdx].address : undefined),
    landmark: profile.landmark?.trim() || (existingIdx >= 0 ? universalCustomers[existingIdx].landmark : undefined),
    authenticatedVia: 'phone_auth',
    authenticatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    universalCustomers[existingIdx] = updatedUser;
  } else {
    universalCustomers.unshift(updatedUser);
  }

  for (let i = 0; i < stores.length; i++) {
    const st = stores[i];
    const existingCust = st.customers.find((c) => phonesMatch(c.phone, cleanPhone));
    const isCurrentStoreOrder = profile.orderAmount !== undefined && st.id === profile.activeStoreId;

    if (existingCust) {
      existingCust.name = profile.name.trim() || existingCust.name;
      existingCust.phone = rawPhone.trim() || existingCust.phone;
      existingCust.email = profile.email?.trim() || existingCust.email;
      existingCust.city = profile.city?.trim() || existingCust.city;
      existingCust.state = profile.state?.trim() || existingCust.state;
      existingCust.address = profile.address?.trim() || existingCust.address;
      existingCust.landmark = profile.landmark?.trim() || existingCust.landmark;
      if (isCurrentStoreOrder) {
        existingCust.ordersCount += 1;
        existingCust.totalSpent = Number((existingCust.totalSpent + profile.orderAmount).toFixed(2));
      }
      existingCust.isPhoneVerified = true;
    } else {
      const newCust = {
        id: `cust-${Date.now()}-${st.slug}`,
        name: profile.name.trim() || 'Customer',
        phone: rawPhone.trim(),
        email: profile.email?.trim() || `${cleanPhone.slice(-6)}@customer.iq`,
        avatar: '',
        city: profile.city?.trim() || 'Baghdad',
        state: profile.state?.trim() || 'Baghdad (Capital)',
        address: profile.address?.trim() || '',
        landmark: profile.landmark?.trim() || '',
        country: 'Iraq',
        ordersCount: isCurrentStoreOrder ? 1 : 0,
        totalSpent: isCurrentStoreOrder ? profile.orderAmount : 0,
        joinedDate: new Date().toISOString().split('T')[0],
        isPhoneVerified: true,
      };
      st.customers.unshift(newCust);
    }
  }
};

const findCustomerByPhone = (rawPhone) => {
  if (!rawPhone) return null;
  const clean = rawPhone.replace(/\D/g, '');
  if (clean.length < 7) return null;

  let baseResult = null;
  if (currentCustomer && phonesMatch(currentCustomer.phone, clean)) {
    baseResult = currentCustomer;
    if (baseResult.address && baseResult.city) return baseResult;
  }

  const inUniversal = universalCustomers.find((c) => phonesMatch(c.phone, clean));
  if (inUniversal) {
    if (!baseResult) return inUniversal;
    return { ...inUniversal, ...baseResult, address: baseResult.address || inUniversal.address };
  }

  for (const st of stores) {
    const matchedCust = st.customers.find((c) => phonesMatch(c.phone, clean));
    if (matchedCust) {
      const custObj = {
        id: matchedCust.id,
        name: matchedCust.name,
        phone: matchedCust.phone || rawPhone,
        email: matchedCust.email,
        city: matchedCust.city,
        state: matchedCust.state,
        address: matchedCust.address,
        landmark: matchedCust.landmark,
      };
      if (!baseResult) return custObj;
      return { ...custObj, ...baseResult, address: baseResult.address || custObj.address };
    }
  }
  return baseResult;
};

// Scenario A: Customer registers in Store 1 (Panda Store)
console.log('Step A: Registering customer in Panda Store...');
syncCustomerToAllStores({
  name: 'أحمد البغدادي',
  phone: '0770 123 9999',
  email: 'ahmed@baghdad.iq',
  state: 'بغداد (العاصمة)',
  city: 'المنصور',
  address: 'شارع 14 رمضان، عمارة الأمل، طابق 2',
  landmark: 'قرب مطعم الساعة'
});

// Verify customer exists across ALL stores
for (const st of stores) {
  const cust = st.customers.find((c) => phonesMatch(c.phone, '0770 123 9999'));
  assert.ok(cust, `Customer must exist in store: ${st.name}`);
  assert.strictEqual(cust.name, 'أحمد البغدادي');
  assert.strictEqual(cust.isPhoneVerified, true);
  assert.strictEqual(cust.address, 'شارع 14 رمضان، عمارة الأمل، طابق 2');
}
console.log('✅ Registered customer synced across all hosted stores!');

// Scenario B: Customer switches to Royal Oud and checks recognition by phone
console.log('Step B: Checking recognition in Royal Oud by phone...');
const recognizedInOud = findCustomerByPhone('+964 770 123 9999');
assert.ok(recognizedInOud, 'Customer must be recognized by international formatted phone');
assert.strictEqual(recognizedInOud.name, 'أحمد البغدادي');
assert.strictEqual(recognizedInOud.city, 'المنصور');
assert.strictEqual(recognizedInOud.address, 'شارع 14 رمضان، عمارة الأمل، طابق 2');
console.log('✅ Customer recognized in Royal Oud!');

// Scenario C: Customer updates shipping address in Royal Oud
console.log('Step C: Customer updates shipping address in Royal Oud...');
syncCustomerToAllStores({
  name: 'أحمد البغدادي',
  phone: '0770 123 9999',
  email: 'ahmed@baghdad.iq',
  state: 'بغداد (العاصمة)',
  city: 'اليرموك',
  address: 'ساحة قحطان، مجمع اليرموك السكني',
  landmark: 'مقابل مستشفى اليرموك'
});

for (const st of stores) {
  const cust = st.customers.find((c) => phonesMatch(c.phone, '0770 123 9999'));
  assert.strictEqual(cust.city, 'اليرموك', `Store ${st.name} must reflect updated city`);
  assert.strictEqual(cust.address, 'ساحة قحطان، مجمع اليرموك السكني', `Store ${st.name} must reflect updated address`);
}
console.log('✅ Updated shipping info reflected in all stores!');

// Scenario D: Placing order in Velvet Atelier — strictly verify NO double count
console.log('Step D: Customer places order in Velvet Atelier (verifying single increment)...');
const cartTotal = 75000;
const velvetStore = stores.find((s) => s.id === 'store-velvet');
const initialVelvetCust = velvetStore.customers.find((c) => phonesMatch(c.phone, '0770 123 9999'));
const prevCount = initialVelvetCust.ordersCount;
const prevSpent = initialVelvetCust.totalSpent;

// Simulated placeOrder: calls syncCustomerToAllStores with order details
syncCustomerToAllStores({
  name: 'أحمد البغدادي',
  phone: '0770 123 9999',
  orderAmount: cartTotal,
  activeStoreId: 'store-velvet'
});

const velvetCustAfter = velvetStore.customers.find((c) => phonesMatch(c.phone, '0770 123 9999'));
assert.strictEqual(velvetCustAfter.ordersCount, prevCount + 1, 'ordersCount must increase by exactly 1');
assert.strictEqual(velvetCustAfter.totalSpent, prevSpent + cartTotal, 'totalSpent must increase by exactly cartTotal');

const pandaCustAfter = stores.find((s) => s.id === 'store-panda').customers.find((c) => phonesMatch(c.phone, '0770 123 9999'));
assert.strictEqual(pandaCustAfter.ordersCount, 0, 'Panda orders count must remain isolated');
assert.strictEqual(pandaCustAfter.totalSpent, 0, 'Panda total spend must remain isolated');

console.log('✅ Single-increment order placement verified (no double count)!');

// Scenario E: Newly created hosted store inherits registered universal customers
console.log('Step E: Creating a new hosted store and verifying universal customer inheritance...');
const newStore = {
  id: 'store-iraq-tea',
  slug: 'iraq-tea',
  name: 'Iraq Tea Co.',
  customers: universalCustomers.map((u) => ({
    id: `cust-iraq-tea-${normalizePhoneDigits(u.phone) || u.id}`,
    name: u.name,
    phone: u.phone,
    email: u.email || `${normalizePhoneDigits(u.phone).slice(-6)}@customer.iq`,
    avatar: '',
    city: u.city || 'Baghdad',
    state: u.state,
    address: u.address,
    landmark: u.landmark,
    country: 'Iraq',
    ordersCount: 0,
    totalSpent: 0,
    joinedDate: new Date().toISOString().split('T')[0],
    isPhoneVerified: true,
  })),
  orders: []
};
stores.push(newStore);

const custInNewStore = newStore.customers.find((c) => phonesMatch(c.phone, '0770 123 9999'));
assert.ok(custInNewStore, 'New store must inherit registered universal customers');
assert.strictEqual(custInNewStore.name, 'أحمد البغدادي');
assert.strictEqual(custInNewStore.address, 'ساحة قحطان، مجمع اليرموك السكني');
assert.strictEqual(custInNewStore.ordersCount, 0);
console.log('✅ Newly launched stores inherit registered universal customers!');

console.log('🎉 ALL UNIVERSAL CUSTOMER INTEGRATION TESTS PASSED CLEANLY!');
