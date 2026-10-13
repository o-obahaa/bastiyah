import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Globe, 
  ExternalLink, 
  Store, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Sparkles,
  Layers,
  ArrowRight
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
        className="fixed bottom-4 start-4 z-40 w-8 h-8 rounded-full bg-slate-900/90 text-white border border-slate-700/80 shadow-lg flex items-center justify-center hover:bg-slate-800 transition-all text-xs opacity-70 hover:opacity-100"
        title={language === 'ar' ? 'إظهار شارة المنصة' : 'Show Bastiyah badge'}
      >
        ⚡
      </button>
    );
  }

  const otherStores = stores.filter((s) => s.id !== activeStore.id);

  return (
    <div className="fixed bottom-4 start-4 z-40 select-none font-sans text-xs" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {isExpanded && (
        <div className="mb-2 bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl shadow-2xl p-3 w-72 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-[10px] text-white">
                B
              </span>
              <span className="font-bold text-white">
                {language === 'ar' ? 'منصة بسطية (Bastiyah)' : 'Bastiyah Platform'}
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            {language === 'ar'
              ? `أنت تتصفح حالياً متجر (${activeStore.nameAr || activeStore.name}) المستقل.`
              : `You are currently viewing the independent store: ${activeStore.name}.`}
          </p>

          <button
            onClick={() => {
              goToPlatform('landing');
              setIsExpanded(false);
            }}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600/25 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 font-bold flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'ar' ? 'الذهاب للموقع الرئيسي (بسطية)' : 'Visit Bastiyah Main Site'}</span>
            </div>
            <ExternalLink className="w-3 h-3 text-indigo-400" />
          </button>

          {otherStores.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-1">
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
                    className="w-full py-1.5 px-2 rounded-lg hover:bg-slate-900 text-slate-300 hover:text-white flex items-center justify-between text-start transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>{s.design.logoEmoji}</span>
                      <span className="truncate">{language === 'ar' ? s.nameAr || s.name : s.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-emerald-400">/store/{s.slug}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed Pill */}
      <div className="flex items-center bg-slate-950/90 backdrop-blur-md text-white border border-slate-800 rounded-full shadow-xl overflow-hidden hover:border-slate-700 transition-all">
        <button
          onClick={() => goToPlatform('landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-900 transition-colors text-slate-200 hover:text-white font-medium"
          title={language === 'ar' ? 'العودة للمنصة الرئيسية' : 'Return to Bastiyah platform'}
        >
          <span className="text-amber-400">⚡</span>
          <span className="font-bold">Bastiyah</span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-indigo-300">
            {language === 'ar' ? 'المنصة الرئيسية' : 'Main Site'}
          </span>
        </button>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-2 py-1.5 border-s border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white transition-colors"
          title="Switch store or options"
        >
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          className="px-2 py-1.5 border-s border-slate-800 hover:bg-slate-900 text-slate-500 hover:text-white transition-colors"
          title="Minimize"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
