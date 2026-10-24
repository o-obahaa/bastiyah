import { getCustomDomainRoot } from './urlUtils';

export interface WhatsAppVariable {
  key: string;
  labelAr: string;
  labelEn: string;
  sample: string;
}

export interface WhatsAppTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'order_alert' | 'order_confirm' | 'order_dispatched' | 'order_delivered' | 'welcome_merchant' | 'abandoned_cart';
  recipientType: 'merchant' | 'customer';
  triggerAr: string;
  triggerEn: string;
  defaultContent: string;
  content: string;
  variables: WhatsAppVariable[];
  isDefaultModified?: boolean;
  enabled: boolean;
}

export interface WhatsAppActivity {
  id: string;
  direction: 'outbound' | 'inbound';
  storeId: string;
  storeName: string;
  storeSlug: string;
  recipientName: string;
  recipientPhone: string;
  categoryLabelAr: string;
  categoryLabelEn: string;
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'received';
  timestamp: string;
  orderNumber?: string;
}

export const DEFAULT_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'merchant_order_alert',
    nameAr: 'تنبيه طلب جديد لمدير المتجر',
    nameEn: 'Merchant New Order Alert',
    category: 'order_alert',
    recipientType: 'merchant',
    triggerAr: 'تلقائياً فور قيام الزبون بإتمام طلب جديد بالمتجر',
    triggerEn: 'Automatically triggered upon new customer order',
    variables: [
      { key: '{storeName}', labelAr: 'اسم المتجر', labelEn: 'Store Name', sample: 'متجر باندا' },
      { key: '{orderNumber}', labelAr: 'رقم الطلب', labelEn: 'Order #', sample: 'PA-89042' },
      { key: '{date}', labelAr: 'تاريخ وتوقيت الطلب', labelEn: 'Order Date', sample: '2026/10/24 10:30 ص' },
      { key: '{customerName}', labelAr: 'اسم الزبون', labelEn: 'Customer Name', sample: 'ليث العبيدي' },
      { key: '{customerPhone}', labelAr: 'هاتف الزبون', labelEn: 'Customer Phone', sample: '+964 770 541 2980' },
      { key: '{customerAddress}', labelAr: 'عنوان التوصيل', labelEn: 'Delivery Address', sample: 'بغداد - المنصور - شارع 14 رمضان' },
      { key: '{itemsList}', labelAr: 'قائمة المنتجات والكميات', labelEn: 'Items List', sample: '1. سماعات باندا ستوديو (الكمية: 1)' },
      { key: '{subtotal}', labelAr: 'المجموع الفرعي', labelEn: 'Subtotal', sample: '249,000' },
      { key: '{shipping}', labelAr: 'رسوم الشحن', labelEn: 'Shipping', sample: 'مجاني' },
      { key: '{total}', labelAr: 'المبلغ الإجمالي', labelEn: 'Total Amount', sample: '249,000' },
      { key: '{currency}', labelAr: 'رمز العملة', labelEn: 'Currency', sample: 'د.ع' },
      { key: '{paymentMethod}', labelAr: 'طريقة الدفع', labelEn: 'Payment Method', sample: 'الدفع نقداً عند الاستلام' },
    ],
    defaultContent: `🛍️ *طلب جديد وارد إلى متجرك:* {storeName}
━━━━━━━━━━━━━━━━━━━━
📋 *رقم الطلب:* #{orderNumber}
📅 *التاريخ:* {date}

👤 *معلومات الزبون:*
• الاسم: *{customerName}*
• رقم الهاتف: {customerPhone}
• العنوان: {customerAddress}

📦 *المنتجات المطلوبة:*
{itemsList}

💰 *تفاصيل الحساب:*
• المجموع الفرعي: {currency}{subtotal}
• رسوم التوصيل: {shipping}
💵 *المبلغ المطلوب تحصيله:* *{currency}{total}*

💳 *طريقة الدفع:* {paymentMethod}
━━━━━━━━━━━━━━━━━━━━
⚡ *أوامر التحكم السريع بالبوت (رد بالرقم أو الكلمة):*
1️⃣ *تأكيد وقبول الطلب* (أرسل 1 أو تأكيد #{orderNumber})
2️⃣ *شحن الطلب للمندوب* (أرسل 2 أو شحن #{orderNumber} [كود التتبع])
3️⃣ *تم التوصيل واستلام المبلغ* (أرسل 3 أو تسليم #{orderNumber})
4️⃣ *إلغاء الطلب* (أرسل 4 أو الغاء #{orderNumber})
5️⃣ *عرض التفاصيل كاملة* (أرسل 5 أو تفاصيل #{orderNumber})`,
    content: '',
    enabled: true,
  },
  {
    id: 'customer_order_confirmation',
    nameAr: 'تأكيد استلام الطلب للزبون',
    nameEn: 'Customer Order Confirmation',
    category: 'order_confirm',
    recipientType: 'customer',
    triggerAr: 'تلقائياً للزبون فور إتمام الشراء لتأكيد صحة الطلب',
    triggerEn: 'Sent to customer immediately after checkout',
    variables: [
      { key: '{customerName}', labelAr: 'اسم الزبون', labelEn: 'Customer Name', sample: 'ليث' },
      { key: '{storeName}', labelAr: 'اسم المتجر', labelEn: 'Store Name', sample: 'متجر باندا' },
      { key: '{orderNumber}', labelAr: 'رقم الطلب', labelEn: 'Order #', sample: 'PA-89042' },
      { key: '{total}', labelAr: 'المبلغ الإجمالي', labelEn: 'Total Amount', sample: '249,000' },
      { key: '{currency}', labelAr: 'رمز العملة', labelEn: 'Currency', sample: 'د.ع' },
      { key: '{customerAddress}', labelAr: 'عنوان التوصيل', labelEn: 'Delivery Address', sample: 'بغداد - المنصور' },
      { key: '{orderUrl}', labelAr: 'رابط متابعة الطلب', labelEn: 'Order URL', sample: 'https://panda.bastiyah.com/orders' },
    ],
    defaultContent: `مرحباً بك {customerName} ✨
شكراً لتسوقك من *{storeName}*! تم استلام طلبك رقم *#{orderNumber}* بنجاح وهو قيد التجهيز الآن 📦.

💰 إجمالي المبلغ المطلوب: *{currency}{total}*
📍 عنوان التوصيل: {customerAddress}

سنقوم بإشعارك فور خروج الطلب للتوصيل مع المندوب.
🔗 لمتابعة حالة طلبك:
{orderUrl}`,
    content: '',
    enabled: true,
  },
  {
    id: 'order_dispatched_tracking',
    nameAr: 'إشعار خروج الطلب للتوصيل والشحن',
    nameEn: 'Order Dispatched & Tracking',
    category: 'order_dispatched',
    recipientType: 'customer',
    triggerAr: 'عند قيام مدير المتجر بتغيير حالة الطلب إلى "مشحون"',
    triggerEn: 'Triggered when order status changes to Dispatched',
    variables: [
      { key: '{customerName}', labelAr: 'اسم الزبون', labelEn: 'Customer Name', sample: 'ليث' },
      { key: '{storeName}', labelAr: 'اسم المتجر', labelEn: 'Store Name', sample: 'متجر باندا' },
      { key: '{orderNumber}', labelAr: 'رقم الطلب', labelEn: 'Order #', sample: 'PA-89042' },
      { key: '{courier}', labelAr: 'شركة أو مندوب التوصيل', labelEn: 'Courier', sample: 'شركة النسر السريع' },
      { key: '{trackingNumber}', labelAr: 'رقم التتبع والشحنة', labelEn: 'Tracking #', sample: 'IQ-EXP-8841' },
      { key: '{total}', labelAr: 'المبلغ المطلوب تحصيله', labelEn: 'Total Due', sample: '249,000' },
      { key: '{currency}', labelAr: 'رمز العملة', labelEn: 'Currency', sample: 'د.ع' },
    ],
    defaultContent: `أهلاً {customerName} 🚚
طلبك رقم *#{orderNumber}* من *{storeName}* في طريقه إليك الآن!

📦 شركة التوصيل: *{courier}*
📍 رقم بوليصة الشحن: \`{trackingNumber}\`
💵 المبلغ المستحق عند الاستلام: *{currency}{total}*

يرجى إبقاء هاتفك متاحاً للتواصل مع مندوب التوصيل لتسليم الشحنة بأسرع وقت. نتمنى لك يوماً سعيداً!`,
    content: '',
    enabled: true,
  },
  {
    id: 'order_delivered_feedback',
    nameAr: 'اكتمال التوصيل وطلب تقييم الزبون',
    nameEn: 'Order Delivered & Review Request',
    category: 'order_delivered',
    recipientType: 'customer',
    triggerAr: 'عند تسليم الشحنة للزبون وتحصيل المبلغ بنجاح',
    triggerEn: 'Sent once the order is marked Delivered',
    variables: [
      { key: '{customerName}', labelAr: 'اسم الزبون', labelEn: 'Customer Name', sample: 'ليث' },
      { key: '{storeName}', labelAr: 'اسم المتجر', labelEn: 'Store Name', sample: 'متجر باندا' },
      { key: '{orderNumber}', labelAr: 'رقم الطلب', labelEn: 'Order #', sample: 'PA-89042' },
      { key: '{reviewUrl}', labelAr: 'رابط تقييم المنتجات', labelEn: 'Review URL', sample: 'https://panda.bastiyah.com' },
    ],
    defaultContent: `مرحباً {customerName} 🌟
تم تسليم طلبك رقم *#{orderNumber}* بنجاح!
نتمنى أن تكون مشترياتك من *{storeName}* قد نالت كامل رضاك وإعجابك.

رأيك يهمنا ويسعدنا جداً! يمكنك تقييم تجربتك مع المنتجات خلال ثوانٍ عبر الرابط:
{reviewUrl}

شكراً لثقتك بنا ونسعد دائماً بخدمتك! ❤️`,
    content: '',
    enabled: true,
  },
  {
    id: 'merchant_welcome_onboarding',
    nameAr: 'رسالة ترحيبية بالتاجر عند إطلاق المتجر',
    nameEn: 'New Merchant Onboarding Welcome',
    category: 'welcome_merchant',
    recipientType: 'merchant',
    triggerAr: 'عند تسجيل تاجر جديد أو إنشاء متجر بواسطة إدارة المنصة',
    triggerEn: 'Sent when a new store is created on Bastiyah',
    variables: [
      { key: '{ownerName}', labelAr: 'اسم التاجر', labelEn: 'Owner Name', sample: 'طارق المنصور' },
      { key: '{storeName}', labelAr: 'اسم المتجر', labelEn: 'Store Name', sample: 'متجر باندا' },
      { key: '{storeUrl}', labelAr: 'رابط المتجر للزبائن', labelEn: 'Storefront URL', sample: 'https://panda.bastiyah.com' },
      { key: '{adminUrl}', labelAr: 'رابط لوحة التحكم', labelEn: 'Admin Panel URL', sample: 'https://panda.bastiyah.com/admin' },
      { key: '{supportPhone}', labelAr: 'هاتف الدعم الفني', labelEn: 'Support Phone', sample: '+964 771 483 4776' },
    ],
    defaultContent: `أهلاً بك يا {ownerName} في منصة بسطية للتجارة الإلكترونية 🚀
تم إطلاق متجرك *{storeName}* بنجاح وهو جاهز لاستقبال الطلبات والمبيعات!

🌐 *رابط متجرك للزبائن:*
{storeUrl}

🔐 *لوحة تحكم متجرك (الإدارة والطلبات):*
{adminUrl}

فريق بسطية يتمنى لك تجارة رابحة ومبيعات مباركة. نحن في خدمتك لأي استفسار: {supportPhone}`,
    content: '',
    enabled: true,
  },
  {
    id: 'abandoned_cart_reminder',
    nameAr: 'تذكير بالسلة المتروكة مع كود خصم',
    nameEn: 'Abandoned Cart Recovery & Coupon',
    category: 'abandoned_cart',
    recipientType: 'customer',
    triggerAr: 'تلقائياً عند ترك الزبون منتجات بالسلة دون إتمام الشراء',
    triggerEn: 'Sent when items are left unpurchased in customer bag',
    variables: [
      { key: '{customerName}', labelAr: 'اسم الزبون', labelEn: 'Customer Name', sample: 'سارة' },
      { key: '{storeName}', labelAr: 'اسم المتجر', labelEn: 'Store Name', sample: 'متجر باندا' },
      { key: '{couponCode}', labelAr: 'كود الخصم التشجيعي', labelEn: 'Discount Coupon', sample: 'SAVE10' },
      { key: '{cartUrl}', labelAr: 'رابط السلة المباشر', labelEn: 'Cart Checkout URL', sample: 'https://panda.bastiyah.com/cart' },
    ],
    defaultContent: `مرحباً {customerName} 👋
لاحظنا أنك تركت بعض المنتجات المميزة في سلتك لدى *{storeName}*!

لكي لا تفوتك الفرصة، جهزنا لك خصم خاص 10% إضافي باستخدام الكود: *{couponCode}*

اضغط هنا لإكمال طلبك قبل نفاد الكمية:
{cartUrl}`,
    content: '',
    enabled: true,
  },
];

export const INITIAL_WHATSAPP_ACTIVITIES: WhatsAppActivity[] = [];

const TEMPLATES_STORAGE_KEY = 'bastiyah_whatsapp_templates';
const CUSTOM_MAP_KEY = 'bastiyah_whatsapp_custom_map';
const ACTIVITIES_STORAGE_KEY = 'bastiyah_whatsapp_activities';

/**
 * Cross-Subdomain Cookie Storage Helpers:
 * Ensures *.bastiyah.com, subdomains, and root platform share the identical
 * WhatsApp forms and inbox activities seamlessly.
 */
const getSharedCookie = (key: string): any | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]*)`));
  if (match && match[1]) {
    try {
      return JSON.parse(decodeURIComponent(match[1]));
    } catch {
      return null;
    }
  }
  return null;
};

const setSharedCookie = (key: string, data: any) => {
  if (typeof document === 'undefined') return;
  const root = getCustomDomainRoot();
  const hostname = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
  const canSetWildcard = root && !root.includes('localhost') && hostname.endsWith(root);
  try {
    const val = encodeURIComponent(JSON.stringify(data));
    if (canSetWildcard) {
      // Clear host-only cookie to prevent RFC 6265 cookie shadowing
      document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
      // Set the shared wildcard cookie across all subdomains (*.bastiyah.com)
      document.cookie = `${key}=${val}; path=/; domain=.${root}; max-age=2592000; SameSite=Lax`;
    } else {
      // Localhost or preview deployment
      document.cookie = `${key}=${val}; path=/; max-age=2592000; SameSite=Lax`;
    }
  } catch {
    // ignore
  }
};

/**
 * Fetches universal custom templates from WhatsApp Gateway HTTP API and updates localStorage + cookies.
 */
export const syncLiveGatewayTemplates = async (): Promise<Record<string, { content?: string; enabled?: boolean }>> => {
  if (typeof window === 'undefined') return getStoredCustomTemplatesMap();
  const gatewayUrl = ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WHATSAPP_GATEWAY_URL) || 'https://bastiyah-whatsapp.onrender.com').trim();
  try {
    const res = await fetch(`${gatewayUrl}/templates`, { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data?.templates && typeof data.templates === 'object') {
        const customMap = getStoredCustomTemplatesMap();
        let changed = false;
        for (const [id, item] of Object.entries(data.templates as Record<string, any>)) {
          if (item?.content && customMap[id]?.content !== item.content) {
            customMap[id] = { content: item.content, enabled: item.enabled };
            changed = true;
          }
        }
        if (changed) {
          localStorage.setItem(CUSTOM_MAP_KEY, JSON.stringify(customMap));
          setSharedCookie(CUSTOM_MAP_KEY, customMap);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_templates_updated', { detail: customMap }));
          }
        }
        return customMap;
      }
    }
  } catch {}
  return getStoredCustomTemplatesMap();
};

/**
 * Retrieves the compact custom templates map: { [templateId]: { content, enabled } }
 * Compact size (< 300 bytes) guarantees it safely fits in cookies & localStorage across subdomains.
 */
export const getStoredCustomTemplatesMap = (): Record<string, { content?: string; enabled?: boolean }> => {
  if (typeof window === 'undefined') return {};
  try {
    let map: Record<string, { content?: string; enabled?: boolean }> = {};

    // 1. Check shared cookie first (cross-subdomain source of truth)
    const cookieVal = getSharedCookie(CUSTOM_MAP_KEY);
    if (cookieVal && typeof cookieVal === 'object') {
      map = { ...map, ...cookieVal };
    }

    // 2. Check localStorage (same-origin cache)
    const raw = localStorage.getItem(CUSTOM_MAP_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          map = { ...map, ...parsed };
        }
      } catch {}
    }

    // 3. Fallback: legacy full templates storage
    if (Object.keys(map).length === 0) {
      const legacyRaw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (legacyRaw) {
        try {
          const legacy = JSON.parse(legacyRaw);
          if (Array.isArray(legacy)) {
            for (const item of legacy) {
              if (item?.id && item?.content) {
                map[item.id] = { content: item.content, enabled: item.enabled };
              }
            }
          }
        } catch {}
      }
    }

    return map;
  } catch {}
  return {};
};

/**
 * Real-time Cross-Tab and Cross-Subdomain Broadcast Channel
 */
let whatsappSyncChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
  try {
    whatsappSyncChannel = new BroadcastChannel('bastiyah_whatsapp_sync_channel');
    whatsappSyncChannel.onmessage = (event) => {
      if (event?.data?.type === 'TEMPLATES_UPDATED') {
        window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_templates_updated', { detail: event.data.data }));
      } else if (event?.data?.type === 'ACTIVITY_LOGGED' || event?.data?.type === 'ACTIVITIES_UPDATED') {
        window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_activity_updated', { detail: event.data.activity }));
      }
    };
  } catch {
    // BroadcastChannel unsupported or blocked
  }
}

/**
 * Loads WhatsApp templates from compact custom map, localStorage, shared cookie, or factory defaults.
 */
export const getStoredWhatsAppTemplates = (): WhatsAppTemplate[] => {
  if (typeof window === 'undefined') return DEFAULT_WHATSAPP_TEMPLATES;
  try {
    const customMap = getStoredCustomTemplatesMap();

    return DEFAULT_WHATSAPP_TEMPLATES.map((def) => {
      const custom = customMap[def.id];
      const customContent =
        custom?.content !== undefined && custom?.content !== null && custom?.content.trim() !== ''
          ? custom.content
          : def.defaultContent;
      const enabled = custom?.enabled !== undefined ? custom.enabled : (def.enabled ?? true);
      const isDefaultModified = customContent.trim() !== def.defaultContent.trim();

      return {
        ...def,
        content: customContent,
        enabled,
        isDefaultModified,
      };
    });
  } catch (e) {
    return DEFAULT_WHATSAPP_TEMPLATES.map((t) => ({ ...t, content: t.defaultContent, enabled: t.enabled ?? true }));
  }
};

/**
 * Saves an edited template to compact custom map, localStorage, shared cookie, and broadcasts to all tabs & stores.
 */
export const saveStoredWhatsAppTemplate = (templateId: string, newContent: string, enabled?: boolean): WhatsAppTemplate[] => {
  const customMap = getStoredCustomTemplatesMap();
  const def = DEFAULT_WHATSAPP_TEMPLATES.find((t) => t.id === templateId);

  customMap[templateId] = {
    content: newContent,
    enabled: enabled !== undefined ? enabled : customMap[templateId]?.enabled ?? def?.enabled ?? true,
  };

  try {
    localStorage.setItem(CUSTOM_MAP_KEY, JSON.stringify(customMap));
    setSharedCookie(CUSTOM_MAP_KEY, customMap);

    const fullTemplates = DEFAULT_WHATSAPP_TEMPLATES.map((d) => {
      const c = customMap[d.id];
      const text = c?.content !== undefined && c?.content !== null && c?.content.trim() !== '' ? c.content : d.defaultContent;
      return {
        ...d,
        content: text,
        enabled: c?.enabled !== undefined ? c.enabled : (d.enabled ?? true),
        isDefaultModified: text.trim() !== d.defaultContent.trim(),
      };
    });

    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(fullTemplates));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_templates_updated', { detail: fullTemplates }));
    }
    whatsappSyncChannel?.postMessage({ type: 'TEMPLATES_UPDATED', data: fullTemplates });

    // Sync to universal central WhatsApp Gateway
    const gatewayUrl = ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WHATSAPP_GATEWAY_URL) || 'https://bastiyah-whatsapp.onrender.com').trim();
    if (gatewayUrl && typeof fetch !== 'undefined') {
      fetch(`${gatewayUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, content: newContent, enabled }),
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Failed to save whatsapp template:', e);
  }

  return getStoredWhatsAppTemplates();
};

/**
 * Toggles a template's enabled/disabled status.
 */
export const toggleStoredWhatsAppTemplateStatus = (templateId: string, enabled: boolean): WhatsAppTemplate[] => {
  const customMap = getStoredCustomTemplatesMap();
  const def = DEFAULT_WHATSAPP_TEMPLATES.find((t) => t.id === templateId);

  customMap[templateId] = {
    content: customMap[templateId]?.content ?? def?.defaultContent ?? '',
    enabled,
  };

  try {
    localStorage.setItem(CUSTOM_MAP_KEY, JSON.stringify(customMap));
    setSharedCookie(CUSTOM_MAP_KEY, customMap);

    const fullTemplates = getStoredWhatsAppTemplates();
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(fullTemplates));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_templates_updated', { detail: fullTemplates }));
    }
    whatsappSyncChannel?.postMessage({ type: 'TEMPLATES_UPDATED', data: fullTemplates });
  } catch (e) {
    console.warn('Failed to toggle whatsapp template status:', e);
  }

  return getStoredWhatsAppTemplates();
};

/**
 * Checks if a specific WhatsApp template/feature is enabled.
 */
export const isWhatsAppTemplateEnabled = (templateId: string): boolean => {
  const templates = getStoredWhatsAppTemplates();
  const match = templates.find((t) => t.id === templateId);
  return match ? match.enabled !== false : true;
};

/**
 * Resets a single template to its factory default content.
 */
export const resetStoredWhatsAppTemplate = (templateId: string): WhatsAppTemplate[] => {
  const customMap = getStoredCustomTemplatesMap();
  delete customMap[templateId];

  try {
    localStorage.setItem(CUSTOM_MAP_KEY, JSON.stringify(customMap));
    setSharedCookie(CUSTOM_MAP_KEY, customMap);

    const fullTemplates = getStoredWhatsAppTemplates();
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(fullTemplates));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_templates_updated', { detail: fullTemplates }));
    }
    whatsappSyncChannel?.postMessage({ type: 'TEMPLATES_UPDATED', data: fullTemplates });

    // Sync reset to universal central WhatsApp Gateway
    const gatewayUrl = ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WHATSAPP_GATEWAY_URL) || 'https://bastiyah-whatsapp.onrender.com').trim();
    if (gatewayUrl && typeof fetch !== 'undefined') {
      fetch(`${gatewayUrl}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, content: '' }),
      }).catch(() => {});
    }
  } catch (e) {}

  return getStoredWhatsAppTemplates();
};

/**
 * Renders any WhatsApp template using the owner-configured text,
 * replacing dynamic variables with provided values.
 */
export const renderWhatsAppTemplate = (
  templateId: string,
  variables: Record<string, string | number | undefined | null>,
  customContentOverride?: string
): { content: string; enabled: boolean; templateNameAr: string } => {
  const templates = getStoredWhatsAppTemplates();
  const template =
    templates.find((t) => t.id === templateId) ||
    DEFAULT_WHATSAPP_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    return { content: '', enabled: true, templateNameAr: '' };
  }

  let text = customContentOverride && customContentOverride.trim()
    ? customContentOverride
    : (template.content && template.content.trim() ? template.content : template.defaultContent);

  // Replace each {key} with provided value
  Object.entries(variables).forEach(([rawKey, val]) => {
    const cleanVal = val !== undefined && val !== null ? String(val) : '';
    const keyWithBraces = rawKey.startsWith('{') && rawKey.endsWith('}') ? rawKey : `{${rawKey}}`;
    text = text.split(keyWithBraces).join(cleanVal);
  });

  return {
    content: text,
    enabled: template.enabled !== false,
    templateNameAr: template.nameAr,
  };
};

// Known legacy mock IDs to filter out permanently
const MOCK_ACTIVITY_IDS = new Set([
  'act-101', 'act-102', 'act-103', 'act-104',
  'act-105', 'act-106', 'act-107', 'act-108'
]);

/**
 * Cleanses activity lists so that NO random or placeholder messages appear in the inbox.
 */
const isCleanActivity = (a: any): boolean => {
  if (!a || typeof a !== 'object') return false;
  const idStr = String(a.id || '');
  if (MOCK_ACTIVITY_IDS.has(idStr)) return false;
  if (idStr.startsWith('act-sync-') || idStr.startsWith('act-10') || idStr.startsWith('act-sample')) return false;
  return true;
};

/**
 * Loads WhatsApp activities (sent & received messages) from localStorage and shared cookie.
 */
export const getStoredWhatsAppActivities = (): WhatsAppActivity[] => {
  if (typeof window === 'undefined') return [];
  try {
    let list: WhatsAppActivity[] = [];
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) list = parsed;
      } catch {}
    }

    // Merge shared cookie if available
    const cookieActivities = getSharedCookie(ACTIVITIES_STORAGE_KEY);
    if (Array.isArray(cookieActivities) && cookieActivities.length > 0) {
      const existingIds = new Set(list.map((x) => x.id));
      for (const item of cookieActivities) {
        if (item?.id && !existingIds.has(item.id)) {
          list.push(item);
        }
      }
    }

    // Strictly cleanse out any mock placeholder entries
    const cleaned = list.filter(isCleanActivity);
    if (cleaned.length !== list.length) {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(cleaned));
      setSharedCookie(ACTIVITIES_STORAGE_KEY, cleaned);
    }

    // Sort descending by timestamp
    cleaned.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return cleaned;
  } catch (e) {
    return [];
  }
};

/**
 * Deletes a single activity from the log.
 */
export const deleteStoredWhatsAppActivity = (activityId: string): WhatsAppActivity[] => {
  const current = getStoredWhatsAppActivities();
  const updated = current.filter((a) => a.id !== activityId);
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated));
    setSharedCookie(ACTIVITIES_STORAGE_KEY, updated);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_activity_updated', { detail: updated }));
    }
    whatsappSyncChannel?.postMessage({ type: 'ACTIVITIES_UPDATED', activity: updated });
  } catch (e) {
    console.warn('Failed to delete whatsapp activity:', e);
  }
  return updated;
};

/**
 * Clears all activities from the log.
 */
export const clearStoredWhatsAppActivities = (): WhatsAppActivity[] => {
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify([]));
    setSharedCookie(ACTIVITIES_STORAGE_KEY, []);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_activity_updated', { detail: [] }));
    }
    whatsappSyncChannel?.postMessage({ type: 'ACTIVITIES_UPDATED', activity: [] });
  } catch (e) {
    console.warn('Failed to clear whatsapp activities:', e);
  }
  return [];
};

/**
 * Appends a new activity entry (either sent or received) to localStorage,
 * shared cookie, dispatches a live window event, and broadcasts across all tabs.
 */
export const logWhatsAppActivity = (activity: Omit<WhatsAppActivity, 'id' | 'timestamp'> & { timestamp?: string }): WhatsAppActivity => {
  const newEntry: WhatsAppActivity = {
    ...activity,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: activity.timestamp || new Date().toISOString(),
  };

  try {
    const current = getStoredWhatsAppActivities();
    const updated = [newEntry, ...current].slice(0, 200); // keep last 200 messages
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated));
    setSharedCookie(ACTIVITIES_STORAGE_KEY, updated);
    
    // Notify all listeners across tabs and inside the single-page application
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_activity_updated', { detail: newEntry }));
    }
    whatsappSyncChannel?.postMessage({ type: 'ACTIVITY_LOGGED', activity: newEntry });

    // Inform Render WhatsApp gateway if reachable
    const gatewayUrl = ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WHATSAPP_GATEWAY_URL) || 'https://bastiyah-whatsapp.onrender.com').trim();
    if (gatewayUrl && typeof fetch !== 'undefined') {
      fetch(`${gatewayUrl}/log-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Failed to save whatsapp activity:', e);
  }

  return newEntry;
};

/**
 * Fetches recent live activities from WhatsApp gateway (Render/Baileys) and merges them.
 */
export const syncLiveGatewayActivities = async (): Promise<WhatsAppActivity[]> => {
  if (typeof window === 'undefined') return [];
  const gatewayUrl = ((typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_WHATSAPP_GATEWAY_URL) || 'https://bastiyah-whatsapp.onrender.com').trim();
  try {
    const res = await fetch(`${gatewayUrl}/activities`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.activities) && data.activities.length > 0) {
        const current = getStoredWhatsAppActivities();
        const existingIds = new Set(current.map((c) => c.id));
        let addedCount = 0;

        for (const act of data.activities) {
          if (act && act.id && !existingIds.has(act.id) && isCleanActivity(act)) {
            current.unshift(act);
            existingIds.add(act.id);
            addedCount++;
          }
        }

        if (addedCount > 0) {
          current.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const trimmed = current.slice(0, 200);
          localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(trimmed));
          setSharedCookie(ACTIVITIES_STORAGE_KEY, trimmed);
          window.dispatchEvent(new CustomEvent('bastiyah_whatsapp_activity_updated', { detail: trimmed }));
          return trimmed;
        }
      }
    }
  } catch {
    // Gateway offline or timeout
  }
  return getStoredWhatsAppActivities();
};
