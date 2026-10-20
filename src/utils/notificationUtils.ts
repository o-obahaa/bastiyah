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
