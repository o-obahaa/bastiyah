// Bastiyah Platform - Background Service Worker for Offline Push Notifications

const CACHE_NAME = 'bastiyah-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for Web Push events from background server or push service
self.addEventListener('push', (event) => {
  let payload = {
    title: '🔔 طلب جديد وارد على متجرك!',
    body: 'تم استلام طلب شراء جديد في متجرك. اضغط لعرض التفاصيل.',
    url: '/admin',
    orderNumber: '',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch (e) {
      payload.body = event.data.text() || payload.body;
    }
  }

  const options = {
    body: payload.body,
    icon: '/favicon.ico',
    badge: '/favicon-32x32.png',
    tag: payload.orderNumber ? `order-${payload.orderNumber}` : `bastiyah-notif-${Date.now()}`,
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: payload.url || '/admin',
      orderNumber: payload.orderNumber,
    },
    requireInteraction: true,
    actions: [
      { action: 'open_order', title: 'عرض الطلب 🛍️' },
      { action: 'close', title: 'إغلاق ✕' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Handle notification click when browser/site is closed or in background
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for direct background message from active tab to test or trigger notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, url, orderNumber } = event.data;
    self.registration.showNotification(title || '🔔 طلب جديد وارد!', {
      body: body || 'تم تسجيل طلب جديد بنجاح',
      icon: '/favicon.ico',
      badge: '/favicon-32x32.png',
      tag: orderNumber ? `order-${orderNumber}` : `notif-${Date.now()}`,
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: { url: url || '/admin', orderNumber },
    });
  }
});
