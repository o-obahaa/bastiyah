import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Bell, 
  ShoppingBag, 
  CheckCheck, 
  Trash2, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Package, 
  AlertTriangle,
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { formatTimeAgo, playNotificationChime } from '../../utils/notificationUtils';

export const AdminNotificationBell: React.FC = () => {
  const {
    adminNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    setAdminTab,
    activeStore,
    updateNotificationSettings,
    language,
    addToast
  } = useStore();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const soundEnabled = activeStore.settings.notificationSettings?.soundEnabled ?? true;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notificationId: string, orderNumber?: string) => {
    markNotificationAsRead(notificationId);
    setIsOpen(false);
    setAdminTab('orders');
    if (orderNumber) {
      addToast(
        language === 'ar' ? `الانتقال إلى تفاصيل الطلب #${orderNumber}` : `Viewing order #${orderNumber}`,
        'info'
      );
    }
  };

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newSoundState = !soundEnabled;
    updateNotificationSettings({ soundEnabled: newSoundState });
    if (newSoundState) {
      playNotificationChime();
    }
  };

  const handleTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    playNotificationChime();
    addToast(
      language === 'ar' ? '🔊 تم تشغيل نغمة تنبيه الطلبات الجديدة' : '🔊 Order chime played',
      'info'
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all border ${
          isOpen
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90 shadow-2xs'
        }`}
        title={language === 'ar' ? 'إشعارات الطلبات' : 'Order Notifications'}
        aria-label="Order Notifications"
      >
        <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />

        {/* Unread Badge Counter with Pulse */}
        {unreadNotificationsCount > 0 && (
          <span className="absolute -top-1 -end-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs animate-in zoom-in-75">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
            <span className="relative">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute end-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  <span>{language === 'ar' ? 'إشعارات وتنبيهات المتجر' : 'Store Notifications'}</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-mono font-bold">
                      {unreadNotificationsCount} {language === 'ar' ? 'جديد' : 'new'}
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {language === 'ar' ? 'تنبيهات فورية عند وصول طلبات جديدة' : 'Instant alerts on new customer orders'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsAsRead}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-[11px] flex items-center gap-1"
                  title={language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              {adminNotifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title={language === 'ar' ? 'مسح الكل' : 'Clear all'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {adminNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  {language === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications yet'}
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  {language === 'ar'
                    ? 'ستظهر هنا إشعارات الطلبات الجديدة وتنبيهات المخزون تلقائياً مع صوت تنبيه فوري'
                    : 'New orders and stock alerts will appear here automatically with sound chimes'}
                </p>
              </div>
            ) : (
              adminNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif.id, notif.orderNumber)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 relative ${
                    !notif.read ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                    notif.type === 'new_order'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : notif.type === 'low_stock'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {notif.type === 'new_order' ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {language === 'ar' ? notif.titleAr : notif.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{formatTimeAgo(notif.timestamp, language)}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {language === 'ar' ? notif.messageAr : notif.message}
                    </p>

                    {/* Order Meta details if new_order */}
                    {notif.orderNumber && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                          #{notif.orderNumber}
                        </span>
                        {notif.amount !== undefined && (
                          <span className="text-[10px] font-bold text-emerald-700">
                            {activeStore.settings.currency}{notif.amount.toFixed(0)}
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 font-semibold ms-auto flex items-center gap-0.5 hover:underline">
                          <span>{language === 'ar' ? 'عرض الطلب' : 'View'}</span>
                          <ChevronRight className="w-3 h-3 rtl:rotate-180" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Unread Dot Indicator */}
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1 shadow-xs" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer Controls */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleToggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                soundEnabled
                  ? 'bg-white text-slate-800 border-slate-200 hover:bg-slate-100 shadow-2xs'
                  : 'bg-slate-200 text-slate-500 border-slate-300'
              }`}
              title={soundEnabled ? (language === 'ar' ? 'كتم الصوت' : 'Mute Sound') : (language === 'ar' ? 'تشغيل الصوت' : 'Enable Sound')}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ar' ? 'صوت التنبيه: مفعّل' : 'Sound: On'}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'ar' ? 'صوت التنبيه: مكتوم' : 'Sound: Muted'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleTestSound}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-bold px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{language === 'ar' ? 'تجربة الصوت 🔊' : 'Test Chime 🔊'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
