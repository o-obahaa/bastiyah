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
⚡ *أوامر التحكم السريع بالبوت (رد بالرقم):*
1️⃣ *تأكيد وقبول الطلب* (أرسل 1)
2️⃣ *شحن الطلب للمندوب* (أرسل 2)
3️⃣ *تم التوصيل واستلام المبلغ* (أرسل 3)
4️⃣ *إلغاء الطلب* (أرسل 4)
5️⃣ *عرض التفاصيل كاملة* (أرسل 5)`,
    content: '',
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
  },
];

export const INITIAL_WHATSAPP_ACTIVITIES: WhatsAppActivity[] = [
  {
    id: 'act-101',
    direction: 'outbound',
    storeId: 'store-1',
    storeName: 'متجر باندا',
    storeSlug: 'panda',
    recipientName: 'طارق المنصور (مدير المتجر)',
    recipientPhone: '+964 771 483 4776',
    categoryLabelAr: 'تنبيه طلب جديد',
    categoryLabelEn: 'New Order Alert',
    content: '🛍️ طلب جديد وارد إلى متجرك: متجر باندا\nرقم الطلب: #PA-89042\nالعميل: ليث العبيدي (07705412980)\nالمبلغ الإجمالي: 249,000 د.ع\nالعنوان: بغداد - المنصور',
    status: 'read',
    timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    orderNumber: 'PA-89042',
  },
  {
    id: 'act-102',
    direction: 'inbound',
    storeId: 'store-1',
    storeName: 'متجر باندا',
    storeSlug: 'panda',
    recipientName: 'طارق المنصور (مدير المتجر)',
    recipientPhone: '+964 771 483 4776',
    categoryLabelAr: 'أمر تحكم بالبوت (قبول)',
    categoryLabelEn: 'Bot Command (Accept)',
    content: '1',
    status: 'received',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    orderNumber: 'PA-89042',
  },
  {
    id: 'act-103',
    direction: 'outbound',
    storeId: 'store-1',
    storeName: 'متجر باندا',
    storeSlug: 'panda',
    recipientName: 'ليث العبيدي',
    recipientPhone: '+964 770 541 2980',
    categoryLabelAr: 'تأكيد الطلب للزبون',
    categoryLabelEn: 'Customer Confirmation',
    content: 'مرحباً ليث ✨ تم تأكيد طلبك رقم #PA-89042 من متجر باندا بنجاح! المبلغ المطلوب: 249,000 د.ع.',
    status: 'delivered',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    orderNumber: 'PA-89042',
  },
  {
    id: 'act-104',
    direction: 'inbound',
    storeId: 'store-1',
    storeName: 'متجر باندا',
    storeSlug: 'panda',
    recipientName: 'ليث العبيدي',
    recipientPhone: '+964 770 541 2980',
    categoryLabelAr: 'استفسار زبون',
    categoryLabelEn: 'Customer Inquiry',
    content: 'مرحباً، هل يمكن أن يكون موعد التوصيل غداً بعد الساعة 4 عصراً؟',
    status: 'received',
    timestamp: new Date(Date.now() - 45 * 1000).toISOString(),
    orderNumber: 'PA-89042',
  },
  {
    id: 'act-105',
    direction: 'outbound',
    storeId: 'store-2',
    storeName: 'رويال عود للعطور',
    storeSlug: 'royal-oud',
    recipientName: 'سارة الجبوري',
    recipientPhone: '+964 780 234 5678',
    categoryLabelAr: 'إشعار شحن الطلب',
    categoryLabelEn: 'Order Dispatched',
    content: 'أهلاً سارة 🚚 طلبك رقم #RO-55120 من رويال عود في طريقه إليك الآن مع شركة النسر السريع (بوليصة: IQ-RO-3021).',
    status: 'read',
    timestamp: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    orderNumber: 'RO-55120',
  },
  {
    id: 'act-106',
    direction: 'inbound',
    storeId: 'store-2',
    storeName: 'رويال عود للعطور',
    storeSlug: 'royal-oud',
    recipientName: 'سارة الجبوري',
    recipientPhone: '+964 780 234 5678',
    categoryLabelAr: 'شكر ورأي الزبون',
    categoryLabelEn: 'Customer Review',
    content: 'شكراً جزيلاً! وصلني العطر وريحته تجنن وثبات عالي جداً ❤️',
    status: 'received',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    orderNumber: 'RO-55120',
  },
  {
    id: 'act-107',
    direction: 'outbound',
    storeId: 'store-3',
    storeName: 'فولت للإلكترونيات',
    storeSlug: 'volt-tech',
    recipientName: 'أحمد كمال',
    recipientPhone: '+964 750 112 3344',
    categoryLabelAr: 'تأكيد تسليم الطلب',
    categoryLabelEn: 'Order Delivered',
    content: 'مرحباً أحمد 🌟 تم تسليم طلبك رقم #VT-1092 بنجاح! نأمل أن تكون تجربتك مع فولت للإلكترونيات ممتازة.',
    status: 'delivered',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    orderNumber: 'VT-1092',
  },
  {
    id: 'act-108',
    direction: 'outbound',
    storeId: 'store-4',
    storeName: 'بوتيك فيلفيت للأزياء',
    storeSlug: 'velvet-boutique',
    recipientName: 'نوران البغدادي (مديرة المتجر)',
    recipientPhone: '+964 750 456 7890',
    categoryLabelAr: 'ترحيب بمتجر جديد',
    categoryLabelEn: 'Merchant Welcome',
    content: 'أهلاً بك يا نوران في منصة بسطية 🚀 تم تفعيل متجرك "بوتيك فيلفيت" بنجاح وهو متاح للمشترين الآن.',
    status: 'read',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
  },
];

const TEMPLATES_STORAGE_KEY = 'bastiyah_whatsapp_templates';
const ACTIVITIES_STORAGE_KEY = 'bastiyah_whatsapp_activities';

/**
 * Loads WhatsApp templates from localStorage or fallback to defaults.
 */
export const getStoredWhatsAppTemplates = (): WhatsAppTemplate[] => {
  if (typeof window === 'undefined') return DEFAULT_WHATSAPP_TEMPLATES;
  try {
    const raw = localStorage.getItem(TEMPLATES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_WHATSAPP_TEMPLATES.map((t) => ({ ...t, content: t.defaultContent }));
    }
    const parsed = JSON.parse(raw);
    return DEFAULT_WHATSAPP_TEMPLATES.map((def) => {
      const match = parsed.find((p: any) => p.id === def.id);
      return {
        ...def,
        content: match?.content || def.defaultContent,
        isDefaultModified: match ? match.content !== def.defaultContent : false,
      };
    });
  } catch (e) {
    return DEFAULT_WHATSAPP_TEMPLATES.map((t) => ({ ...t, content: t.defaultContent }));
  }
};

/**
 * Saves an edited template to localStorage.
 */
export const saveStoredWhatsAppTemplate = (templateId: string, newContent: string): WhatsAppTemplate[] => {
  const current = getStoredWhatsAppTemplates();
  const updated = current.map((t) =>
    t.id === templateId
      ? {
          ...t,
          content: newContent,
          isDefaultModified: newContent.trim() !== t.defaultContent.trim(),
        }
      : t
  );
  try {
    localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save whatsapp template to localStorage:', e);
  }
  return updated;
};

/**
 * Resets a single template to its factory default content.
 */
export const resetStoredWhatsAppTemplate = (templateId: string): WhatsAppTemplate[] => {
  const def = DEFAULT_WHATSAPP_TEMPLATES.find((t) => t.id === templateId);
  if (!def) return getStoredWhatsAppTemplates();
  return saveStoredWhatsAppTemplate(templateId, def.defaultContent);
};

/**
 * Loads WhatsApp activities (sent & received messages) from localStorage or seed with initials.
 */
export const getStoredWhatsAppActivities = (): WhatsAppActivity[] => {
  if (typeof window === 'undefined') return INITIAL_WHATSAPP_ACTIVITIES;
  try {
    const raw = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(INITIAL_WHATSAPP_ACTIVITIES));
      return INITIAL_WHATSAPP_ACTIVITIES;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_WHATSAPP_ACTIVITIES;
  }
};

/**
 * Appends a new activity entry (either sent or received) to localStorage.
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
  } catch (e) {
    console.warn('Failed to save whatsapp activity to localStorage:', e);
  }

  return newEntry;
};
