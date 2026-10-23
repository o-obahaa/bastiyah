import { Order, HostedStore } from '../types';

/**
 * Utility functions for Order Notifications, Audio Chimes, and Browser Web Notifications.
 */

/**
 * Plays a pleasant, multi-tone melodic order arrival chime using the native Web Audio API.
 * Does not depend on external MP3 files or network requests.
 */
export const playNotificationChime = (): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Tone 1: E5 (659.25 Hz) - bright intro
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.28, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Tone 2: G#5 (830.61 Hz) - major uplifting chord
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(830.61, now + 0.1);
    gain2.gain.setValueAtTime(0.32, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.45);

    // Tone 3: B5 (987.77 Hz) - triumphant high note
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(987.77, now + 0.2);
    gain3.gain.setValueAtTime(0.35, now + 0.2);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.2);
    osc3.stop(now + 0.65);

    // Tone 4: E6 (1318.51 Hz) - sparkling register chime bell
    const osc4 = ctx.createOscillator();
    const gain4 = ctx.createGain();
    osc4.type = 'triangle';
    osc4.frequency.setValueAtTime(1318.51, now + 0.32);
    gain4.gain.setValueAtTime(0.22, now + 0.32);
    gain4.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc4.connect(gain4);
    gain4.connect(ctx.destination);
    osc4.start(now + 0.32);
    osc4.stop(now + 0.85);
  } catch (err) {
    console.warn('Audio chime reproduction failed:', err);
  }
};

/**
 * Requests desktop browser push notification permission from the merchant.
 */
export const requestBrowserNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Dispatches a native desktop notification to the merchant.
 */
export const sendBrowserNotification = (
  title: string,
  body: string,
  options?: {
    onClick?: () => void;
    tag?: string;
  }
): void => {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const notification = new Notification(title, {
      body,
      tag: options?.tag || `bastiyah-order-${Date.now()}`,
      silent: false,
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }
  } catch (e) {
    console.warn('Native notification dispatch failed:', e);
  }
};

/**
 * Formats an ISO date into relative time text (e.g., 'الآن', 'منذ 5 دقائق', '5m ago').
 */
export const formatTimeAgo = (isoDate: string, language: 'ar' | 'en' = 'ar'): string => {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) {
      return language === 'ar' ? 'الآن' : 'Just now';
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
      return language === 'ar' ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
    }

    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) {
      return language === 'ar' ? 'أمس' : 'Yesterday';
    }

    return language === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
  } catch {
    return isoDate;
  }
};

/**
 * Registers the background service worker for offline / closed-tab push notifications.
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    return registration;
  } catch (err) {
    console.warn('Service Worker registration error:', err);
    return null;
  }
};

/**
 * Sends a background notification through the Service Worker (runs even if the tab is inactive).
 */
export const showServiceWorkerNotification = async (
  title: string,
  body: string,
  orderNumber?: string
): Promise<void> => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration && 'showNotification' in registration) {
      await registration.showNotification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon-32x32.png',
        tag: orderNumber ? `order-${orderNumber}` : `bastiyah-${Date.now()}`,
        requireInteraction: true,
        data: {
          url: '/admin',
          orderNumber,
        },
      } as NotificationOptions);
    }
  } catch (e) {
    console.warn('Could not display service worker notification:', e);
  }
};

/**
 * Constructs a pre-formatted WhatsApp order notification link to deliver instant alerts
 * directly to the store owner's WhatsApp on their mobile phone (active 24/7 even if PC is off).
 */
export const generateWhatsAppAlertUrl = (
  merchantPhone: string,
  orderNumber: string,
  customerName: string,
  customerPhone: string,
  totalAmount: string,
  itemsCount: number,
  storeName: string
): string => {
  const cleanPhone = merchantPhone.replace(/\D/g, '');
  const text = encodeURIComponent(
    `🚨 *طلب جديد وارد عبر متجر ${storeName}*\n` +
    `--------------------------------\n` +
    `📦 *رقم الطلب:* #${orderNumber}\n` +
    `👤 *العميل:* ${customerName}\n` +
    `📞 *رقم العميل:* ${customerPhone}\n` +
    `🛍️ *عدد المنتجات:* ${itemsCount}\n` +
    `💰 *الإجمالي:* ${totalAmount}\n` +
    `--------------------------------\n` +
    `🔗 يمكنك مراجعة وإدارة الطلب فوراً من لوحة تحكم بسطية.`
  );

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${text}`;
};

/**
 * Formats a comprehensive Arabic WhatsApp order notification for the store manager.
 */
export const formatOrderWhatsAppMessage = (
  order: Order,
  storeName: string,
  currency: string = 'د.ع'
): string => {
  const itemsText = order.items
    .map((item, idx) => {
      const variantDetails = [
        item.selectedColor ? `اللون: ${item.selectedColor}` : '',
        item.selectedSize ? `المقاس: ${item.selectedSize}` : '',
      ]
        .filter(Boolean)
        .join(' | ');
      return `  ${idx + 1}. *${item.productName}*\n     الكمية: ${item.quantity} × ${currency}${item.price.toLocaleString()} ${variantDetails ? `(${variantDetails})` : ''}`;
    })
    .join('\n');

  const customer = order.customer;
  const addressText = [customer.state, customer.city, customer.address].filter(Boolean).join(' - ');

  return (
    `🛍️ *طلب جديد وارد إلى متجرك:* ${storeName}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *رقم الطلب:* #${order.orderNumber}\n` +
    `📅 *التاريخ:* ${new Date(order.date).toLocaleString('ar-IQ')}\n\n` +
    `👤 *معلومات الزبون:*\n` +
    `• الاسم: *${customer.fullName}*\n` +
    `• رقم الهاتف: ${customer.phone}\n` +
    `• العنوان: ${addressText || 'لم يُحدد'}\n\n` +
    `📦 *المنتجات المطلوبة:*\n` +
    `${itemsText}\n\n` +
    `💰 *تفاصيل الحساب:*\n` +
    `• المجموع الفرعي: ${currency}${order.subtotal.toLocaleString()}\n` +
    (order.discount > 0 ? `• الخصم: -${currency}${order.discount.toLocaleString()}\n` : '') +
    `• رسوم التوصيل: ${order.shipping > 0 ? `${currency}${order.shipping.toLocaleString()}` : 'مجاني'}\n` +
    `💵 *المبلغ الإجمالي المطلوب تحصيله:* *${currency}${order.total.toLocaleString()}*\n\n` +
    `💳 *طريقة الدفع:* ${order.paymentMethod === 'Cash on Delivery' ? 'الدفع نقداً عند الاستلام (COD)' : order.paymentMethod}\n` +
    (order.courier ? `🚚 *شركة التوصيل:* ${order.courier}\n` : '') +
    (order.trackingNumber ? `📍 *رقم التتبع:* \`${order.trackingNumber}\`\n` : '') +
    (order.notes ? `📝 *ملاحظات الزبون:* ${order.notes}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ يرجى تجهيز الطلب وإرساله لشركة الشحن.`
  );
};

/**
 * Dispatches an automated WhatsApp notification to the store manager
 * via the live Render WhatsApp Gateway and/or direct API.
 */
export const dispatchOrderWhatsAppToManager = async (
  order: Order,
  store: HostedStore,
  convexClient?: any
): Promise<{ success: boolean; phone: string; message: string }> => {
  const storeName = store.nameAr || store.name;
  const currency = store.settings.currency || 'د.ع';
  const rawPhone = store.settings.notificationSettings?.whatsappAlertPhone || store.ownerPhone || '9647714834776';

  let cleanPhone = rawPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.slice(2);
  if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
  if (!cleanPhone.startsWith('964')) cleanPhone = `964${cleanPhone}`;

  const message = formatOrderWhatsAppMessage(order, storeName, currency);

  // 1. Dispatch through WhatsApp Gateway (Render)
  const gatewayUrl = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_GATEWAY_URL) || 'https://bastiyah-whatsapp.onrender.com').trim();
  try {
    fetch(`${gatewayUrl}/send-message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanPhone,
        message,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          console.log(`[WhatsApp Gateway] ✅ Order alert sent to manager (+${cleanPhone}):`, data);
        }
      })
      .catch((err) => {
        console.warn('[WhatsApp Gateway] Offline note:', err);
      });
  } catch (e) {
    // silently catch
  }

  // 2. Dispatch via Convex action if configured
  if (convexClient) {
    try {
      convexClient
        .action('whatsapp:sendWhatsAppMessage' as any, {
          phone: cleanPhone,
          message,
        })
        .catch(() => {});
    } catch (e) {}
  }

  return { success: true, phone: cleanPhone, message };
};

