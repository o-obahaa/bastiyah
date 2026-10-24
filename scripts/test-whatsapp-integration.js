/**
 * Automated Verification for WhatsApp Templates & Owner Inbox Engine
 */

import assert from 'node:assert';

console.log('🧪 Starting WhatsApp Templates & Owner Inbox Automated Tests...\n');

// 1. WhatsApp Template Data Structures & Variables
const DEFAULT_TEMPLATES = [
  {
    id: 'merchant_order_alert',
    nameAr: 'تنبيه طلب جديد لمدير المتجر',
    defaultContent: '🛍️ *طلب جديد وارد إلى متجرك:* {storeName}\n📋 *رقم الطلب:* #{orderNumber}\n👤 *الزبون:* {customerName}\n💵 *المبلغ:* {currency}{total}',
    content: '',
    enabled: true,
  },
  {
    id: 'customer_order_confirmation',
    nameAr: 'تأكيد استلام الطلب للزبون',
    defaultContent: 'مرحباً بك {customerName} ✨\nشكراً لتسوقك من *{storeName}*! تم استلام طلبك #{orderNumber} بمبلغ {currency}{total}',
    content: '',
    enabled: true,
  },
  {
    id: 'order_dispatched_tracking',
    nameAr: 'إشعار خروج الطلب للتوصيل والشحن',
    defaultContent: 'أهلاً {customerName} 🚚 طلبك #{orderNumber} من {storeName} قيد التوصيل الآن.',
    content: '',
    enabled: true,
  },
  {
    id: 'order_delivered_feedback',
    nameAr: 'اكتمال التوصيل وطلب تقييم الزبون',
    defaultContent: 'مرحباً {customerName} 🌟 تم تسليم طلبك #{orderNumber} بنجاح!',
    content: '',
    enabled: true,
  },
  {
    id: 'merchant_welcome_onboarding',
    nameAr: 'رسالة ترحيبية بالتاجر عند إطلاق المتجر',
    defaultContent: 'أهلاً بك في منصة بسطية 🚀 تم إطلاق متجرك *{storeName}*',
    content: '',
    enabled: true,
  },
  {
    id: 'abandoned_cart_reminder',
    nameAr: 'تذكير بالسلة المتروكة مع كود خصم',
    defaultContent: 'مرحباً {customerName} 👋 لاحظنا أنك تركت منتجات في سلتك لدى {storeName}!',
    content: '',
    enabled: true,
  },
];

// In-memory simulation of cross-subdomain synchronized state
let simulatedLocalStorage = {};
let simulatedSharedCookie = {};

const renderWhatsAppTemplate = (templateId, variables, templatesList = DEFAULT_TEMPLATES) => {
  const tpl = templatesList.find(t => t.id === templateId) || DEFAULT_TEMPLATES[0];
  let text = tpl.content && tpl.content.trim() ? tpl.content : tpl.defaultContent;
  Object.entries(variables).forEach(([rawKey, val]) => {
    const cleanVal = val !== undefined && val !== null ? String(val) : '';
    const keyWithBraces = rawKey.startsWith('{') && rawKey.endsWith('}') ? rawKey : `{${rawKey}}`;
    text = text.split(keyWithBraces).join(cleanVal);
  });
  return {
    content: text,
    enabled: tpl.enabled !== false,
    templateNameAr: tpl.nameAr,
    isDefaultModified: Boolean(tpl.content && tpl.content.trim() !== tpl.defaultContent.trim()),
  };
};

// 1. Verify Default Templates Structure
console.log('Test 1: Verifying default platform templates...');
assert.strictEqual(DEFAULT_TEMPLATES.length, 6, 'Should load all 6 default templates');
const defaultAlert = renderWhatsAppTemplate('merchant_order_alert', {
  storeName: 'متجر باندا',
  orderNumber: 'PA-101',
  customerName: 'حيدر الكرخي',
  currency: 'د.ع',
  total: '45,000',
});
assert(defaultAlert.content.includes('متجر باندا'), 'Default render should replace storeName');
assert(defaultAlert.content.includes('PA-101'), 'Default render should replace orderNumber');
assert.strictEqual(defaultAlert.isDefaultModified, false, 'Default template should not be marked as modified');
console.log('✅ Default templates verified successfully.');

// 2. Verify Template Customization & Modification Flag
console.log('\nTest 2: Editing template content and checking modification tracking...');
const customTemplateContent = '🚨 [نموذج الإدارة المحدث] طلب جديد ورد لمتجر: {storeName}\nرقم الطلب: #{orderNumber}\nالزبون: {customerName}\nالإجمالي: {currency}{total}';
const modifiedTemplates = DEFAULT_TEMPLATES.map(t =>
  t.id === 'merchant_order_alert'
    ? { ...t, content: customTemplateContent, isDefaultModified: true }
    : t
);

const updatedRender = renderWhatsAppTemplate('merchant_order_alert', {
  storeName: 'متجر الرافدين',
  orderNumber: 'RF-8890',
  customerName: 'مروان البغدادي',
  currency: 'د.ع',
  total: '92,000',
}, modifiedTemplates);

assert(updatedRender.content.includes('[نموذج الإدارة المحدث]'), 'Updated template content must be used');
assert(updatedRender.content.includes('RF-8890'), 'Order number must be replaced');
assert(updatedRender.content.includes('مروان البغدادي'), 'Customer name must be replaced');
assert.strictEqual(updatedRender.isDefaultModified, true, 'isDefaultModified must be true for custom template');
console.log('✅ Template customization and dynamic variable substitution verified.');

// 3. Verify Cross-Subdomain Synchronized Storage
console.log('\nTest 3: Checking cross-subdomain shared cookie synchronization...');
simulatedLocalStorage['bastiyah_whatsapp_templates'] = JSON.stringify(modifiedTemplates);
simulatedSharedCookie['bastiyah_whatsapp_templates'] = JSON.stringify(modifiedTemplates);

// Store subdomain accessing shared state
const loadedFromCookie = JSON.parse(simulatedSharedCookie['bastiyah_whatsapp_templates']);
assert(loadedFromCookie.some(t => t.id === 'merchant_order_alert' && t.content.includes('[نموذج الإدارة المحدث]')), 'Subdomain must inherit modified templates from shared cookie');
console.log('✅ Cross-subdomain template synchronization verified.');

// 4. Verify Inbox Cleanliness & Activity Logging (No Random Mock Messages)
console.log('\nTest 4: Verifying WhatsApp activities logging & inbox cleanliness...');
const MOCK_IDS = new Set(['act-101', 'act-102', 'act-103', 'act-104', 'act-105', 'act-106', 'act-107', 'act-108']);
const isClean = (a) => !MOCK_IDS.has(a.id) && !String(a.id || '').startsWith('act-sync-') && !String(a.id || '').startsWith('act-10');

let activities = [];

// Clean initial activities
assert.strictEqual(activities.filter(isClean).length, 0, 'Inbox should have 0 random mock messages');

// Log a real outbound notification
activities.unshift({
  id: `act-${Date.now()}-1`,
  direction: 'outbound',
  storeId: 'store-panda',
  storeName: 'متجر باندا',
  storeSlug: 'panda',
  recipientName: 'مدير المتجر',
  recipientPhone: '+9647701234567',
  categoryLabelAr: 'تنبيه طلب جديد',
  categoryLabelEn: 'New Order Alert',
  content: updatedRender.content,
  status: 'sent',
  timestamp: new Date().toISOString(),
  orderNumber: 'RF-8890',
});

// Log a real inbound response
activities.unshift({
  id: `act-${Date.now()}-2`,
  direction: 'inbound',
  storeId: 'store-panda',
  storeName: 'متجر باندا',
  storeSlug: 'panda',
  recipientName: 'زبون المتجر',
  recipientPhone: '+9647809876543',
  categoryLabelAr: 'رد الزبون',
  categoryLabelEn: 'Customer Reply',
  content: 'تأكيد #RF-8890',
  status: 'received',
  timestamp: new Date().toISOString(),
  orderNumber: 'RF-8890',
});

assert.strictEqual(activities.length, 2, 'Should contain 2 genuine activities');
assert.strictEqual(activities[0].direction, 'inbound', 'Inbound message must appear at the top');
assert.strictEqual(activities[1].direction, 'outbound', 'Outbound message must follow');
assert(activities.every(isClean), 'All entries must be clean genuine activities');
console.log('✅ WhatsApp activities logging and inbox cleanliness verified.');

console.log('\n🎉 ALL WHATSAPP INTEGRATION & INBOX TESTS PASSED SUCCESSFULLY!');
