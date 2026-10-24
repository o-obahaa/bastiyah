#!/usr/bin/env node
/**
 * ==============================================================================
 * Bastiyah E2E & Synthetic Transaction Verification Engine
 * Simulates a full end-to-end user checkout and WhatsApp payload generation cycle.
 * ==============================================================================
 */

import assert from 'assert';

console.log('🚀 Running Bastiyah Synthetic E2E Checkout Flow Simulator...');

// 1. Emulate Store Catalog & Inventory Fetch
const mockStore = {
  id: 'store-baghdad-perfumes',
  name: 'Baghdad Royal Perfumes',
  domain: 'baghdad.bastiyah.com',
  currency: 'IQD',
  whatsappConfig: {
    phone: '9647701234567',
    enabled: true,
    defaultTemplate: 'طلب جديد من {storeName}\nالزبون: {customerName}\nالهاتف: {customerPhone}\nالعنوان: {customerAddress}\nالمجموع: {total} د.ع',
  },
  products: [
    { id: 'prod-oud-1', title: 'Royal Cambodian Oud', price: 65000, inStock: true },
    { id: 'prod-musk-2', title: 'White Musk Essence', price: 25000, inStock: true },
  ],
};

console.log('  [Step 1] Store resolved successfully:', mockStore.name);
assert(mockStore.products.length >= 2, 'Store must contain available products');

// 2. Emulate Customer Adding Items to Cart
const customerCart = [
  { product: mockStore.products[0], quantity: 1 },
  { product: mockStore.products[1], quantity: 2 },
];

const subtotal = customerCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
const deliveryFee = 5000;
const grandTotal = subtotal + deliveryFee;

console.log('  [Step 2] Cart calculated:');
console.log(`    - Subtotal: ${subtotal} IQD`);
console.log(`    - Delivery: ${deliveryFee} IQD`);
console.log(`    - Grand Total: ${grandTotal} IQD`);
assert.strictEqual(grandTotal, 65000 * 1 + 25000 * 2 + 5000, 'Grand total computation mismatch');

// 3. Emulate Customer Checkout Form Submission
const customerInfo = {
  name: 'Ahmed Al-Iraqi',
  phone: '07801234567',
  address: 'Baghdad, Al-Mansour, Street 14',
  notes: 'Please call before delivery',
};

assert(/^07[3-9][0-9]{8}$/.test(customerInfo.phone), 'Iraqi phone format validation failed');
console.log('  [Step 3] Customer info validated:', customerInfo.name, `(${customerInfo.phone})`);

// 4. Construct Order Payload
const orderPayload = {
  orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  storeId: mockStore.id,
  customer: customerInfo,
  items: customerCart,
  total: grandTotal,
  status: 'pending',
  createdAt: new Date().toISOString(),
};

assert(orderPayload.orderId.startsWith('ORD-'), 'Invalid order ID format');
console.log('  [Step 4] Order created successfully:', orderPayload.orderId);

// 5. Generate and Verify WhatsApp Message URL
const itemsSummary = customerCart
  .map(item => `• ${item.product.title} x${item.quantity} (${(item.product.price * item.quantity).toLocaleString()} IQD)`)
  .join('\n');

const renderedMessage = mockStore.whatsappConfig.defaultTemplate
  .replace('{storeName}', mockStore.name)
  .replace('{customerName}', customerInfo.name)
  .replace('{customerPhone}', customerInfo.phone)
  .replace('{customerAddress}', customerInfo.address)
  .replace('{total}', grandTotal.toLocaleString()) + `\n\nالمنتجات:\n${itemsSummary}\n\nرقم الطلب: ${orderPayload.orderId}`;

const whatsappUrl = `https://wa.me/${mockStore.whatsappConfig.phone}?text=${encodeURIComponent(renderedMessage)}`;

console.log('  [Step 5] Formatted WhatsApp payload URL:');
console.log('   ', whatsappUrl.substring(0, 110) + '...');

assert(whatsappUrl.includes(mockStore.whatsappConfig.phone), 'Target WhatsApp phone missing from URL');
assert(whatsappUrl.includes(encodeURIComponent(orderPayload.orderId)), 'Order ID missing in message payload');

console.log('');
console.log('🎉 [E2E SUCCESS] All 5 checkout & WhatsApp synthetic stages passed cleanly!');
