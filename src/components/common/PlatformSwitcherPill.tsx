import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Globe, 
  ExternalLink, 
  Store, 
  ChevronUp, 
  ChevronDown, 
  X
} from 'lucide-react';

export const PlatformSwitcherPill: React.FC = () => {
  const { 
    stores, 
    activeStore, 
    switchStore, 
    goToPlatform, 
    language, 
    currentPage 
  } = useStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Only show on storefront pages and store admin (not on main landing or platform admin)
  if (currentPage === 'bastiyah-landing' || currentPage === 'bastiyah-admin') {
    return null;
  }

  // When browsing on a dedicated store subdomain (e.g. panda.domain.com),
  // this is a 100% standalone store — never display platform switchers or competitor stores!
  const isDedicatedSubdomain = typeof window !== 'undefined' && (() => {
    const hostname = window.location.hostname.toLowerCase();
    const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
    const parts = hostname.split('.');
    return !isLocalOrVercel && parts.length >= 3 && parts[0] !== 'www';
  })();

  if (isDedicatedSubdomain) {
    return null;
  }

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 start-4 z-40 w-9 h-9 rounded-full bg-white text-stone-800 border border-stone-200 shadow-md flex items-center justify-center hover:bg-stone-50 transition-all text-xs opacity-80 hover:opacity-100"
        title={language === 'ar' ? 'إظهار شارة بسطية' : 'Show Bastiyah badge'}
      >
        <video
          src="/bastiyah-logo.mp4"
          autoPlay
          muted
          playsInline
          className="w-5 h-5 object-contain mix-blend-multiply pointer-events-none"
        />
      </button>
    );
  }

  const otherStores = stores.filter((s) => s.id !== activeStore.id);

  return (
    <div className="fixed bottom-4 start-4 z-40 select-none font-sans text-xs" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {isExpanded && (
        <div className="mb-2 bg-white/95 backdrop-blur-md text-stone-800 border border-stone-200 rounded-2xl shadow-2xl p-3.5 w-72 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <video
                src="/bastiyah-logo.mp4"
                autoPlay
                muted
                playsInline
                className="w-6 h-6 object-contain mix-blend-multiply shrink-0 pointer-events-none"
              />
              <span className="font-brand font-black text-stone-900 text-sm">
                بسطية
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                (Bastiyah)
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-stone-400 hover:text-stone-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-500 leading-relaxed font-normal">
            {language === 'ar'
              ? `أنت تتصفح حالياً متجر (${activeStore.nameAr || activeStore.name}) المستقل.`
              : `You are currently viewing the independent store: ${activeStore.name}.`}
          </p>

          <button
            onClick={() => {
              goToPlatform('landing');
              setIsExpanded(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold flex items-center justify-between transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-stone-300" />
              <span>{language === 'ar' ? 'الذهاب للموقع الرئيسي (بسطية)' : 'Visit Bastiyah Main Site'}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-stone-300" />
          </button>

          {otherStores.length > 0 && (
            <div className="pt-2 border-t border-stone-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-1">
                {language === 'ar' ? 'المتاجر المستضافة الأخرى' : 'Other Hosted Stores'}
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {otherStores.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      switchStore(s.id, 'home');
                      setIsExpanded(false);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg hover:bg-stone-50 text-stone-700 hover:text-stone-900 flex items-center justify-between text-start transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{s.design.logoEmoji}</span>
                      <span className="truncate">{language === 'ar' ? s.nameAr || s.name : s.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-600">/store/{s.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed Pill */}
      <div className="flex items-center bg-white/95 backdrop-blur-md text-stone-800 border border-stone-200/90 rounded-full shadow-lg overflow-hidden hover:border-stone-300 transition-all">
        <button
          onClick={() => goToPlatform('landing')}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-stone-50 transition-colors text-stone-800 font-medium"
          title={language === 'ar' ? 'العودة للمنصة الرئيسية (بسطية)' : 'Return to Bastiyah platform'}
        >
          <video
            src="/bastiyah-logo.mp4"
            autoPlay
            muted
            playsInline
            className="w-5 h-5 object-contain mix-blend-multiply shrink-0 pointer-events-none"
          />
          <span className="font-brand font-black text-xs text-stone-900">بسطية</span>
          <span className="text-stone-300">•</span>
          <span className="text-[11px] text-stone-500 font-medium">
            {language === 'ar' ? 'المنصة الرئيسية' : 'Main Site'}
          </span>
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-1.5 border-s border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
          title="Switch store or options"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="px-2 py-1.5 border-s border-stone-200 hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
          title="Minimize"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
