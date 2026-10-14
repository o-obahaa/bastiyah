import React, { useState } from 'react';
import { 
  Globe, 
  Crown, 
  Store, 
  Copy, 
  Check, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles, 
  LayoutDashboard,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getPlatformOrigin, getStoreDisplayUrl } from '../../utils/urlUtils';

export const BastiyahTopBar: React.FC = () => {
  const { 
    stores, 
    activeStore, 
    switchStore, 
    currentPage, 
    setCurrentPage, 
    language, 
    setLanguage, 
    t,
    addToast
  } = useStore();

  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getSimulatedUrl = () => {
    if (currentPage === 'bastiyah-admin') return `${getPlatformOrigin()}/owner`;
    if (currentPage === 'bastiyah-landing') return `${getPlatformOrigin()}/`;
    if (currentPage === 'admin') return getStoreDisplayUrl(activeStore.slug, true);
    return getStoreDisplayUrl(activeStore.slug, false);
  };

  const handleCopyUrl = () => {
    const simulated = getSimulatedUrl();
    navigator.clipboard?.writeText(simulated);
    setCopied(true);
    addToast(`${t.linkCopied}: ${simulated}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md text-stone-800 border-b border-stone-200/90 relative z-50 select-none shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-2 text-xs">
        {/* Left: Bastiyah Brand + Store Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setCurrentPage('bastiyah-landing')}
            className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-stone-100 transition-colors shrink-0 group"
            title={t.bastiyahTagline}
          >
            {/* Official Bastiyah Emblem (Without Text) */}
            <img
              src="/bastiyah-emblem.png"
              alt="بسطية"
              className="w-7 h-7 object-contain pointer-events-none transition-transform group-hover:scale-105"
            />
            <span className="font-brand font-black text-sm tracking-tight text-stone-900 group-hover:text-stone-950 transition-colors">
              بسطية
            </span>
          </button>

          {/* Interactive Browser Subdomain Bar + Store Switcher */}
          <div className="relative">
            <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg overflow-hidden shadow-2xs">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-stone-100 transition-colors text-stone-800 max-w-[240px] sm:max-w-md truncate"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="font-mono text-[11px] text-stone-400 hidden sm:inline">https://</span>
                {currentPage === 'bastiyah-admin' ? (
                  <span className="font-mono text-[11px] font-bold text-amber-700">owner.bastiyah.com</span>
                ) : currentPage === 'bastiyah-landing' ? (
                  <span className="font-mono text-[11px] font-bold text-stone-900">bastiyah.com</span>
                ) : (
                  <span className="font-mono text-[11px] truncate">
                    <strong className="text-emerald-700 font-bold">{activeStore.slug}</strong>
                    <span className="text-stone-600">.bastiyah.com</span>
                    {currentPage === 'admin' && <span className="text-amber-700 font-bold">/admin</span>}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              </button>

              <button
                onClick={handleCopyUrl}
                className="px-2 py-1 border-s border-stone-200 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
                title="Copy Store Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Store Switcher Dropdown */}
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute start-0 mt-2 w-80 bg-white border border-stone-200 rounded-2xl shadow-xl py-2 z-50 overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-stone-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      {t.switchStore} ({stores.length})
                    </span>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setCurrentPage('bastiyah-admin');
                      }}
                      className="text-[11px] font-bold text-stone-900 hover:text-stone-700 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3 text-amber-500" />
                      {language === 'ar' ? 'رابط جديد' : 'New Link'}
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                    {stores.map((st) => {
                      const isSelected = st.id === activeStore.id && currentPage !== 'bastiyah-admin' && currentPage !== 'bastiyah-landing';
                      const dotColor = THEME_CONFIGS[st.design.themeColor]?.hex || '#10b981';
                      return (
                        <div
                          key={st.id}
                          className={`px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-stone-50 transition-colors ${
                            isSelected ? 'bg-stone-50' : ''
                          }`}
                        >
                          <button
                            onClick={() => {
                              switchStore(st.id, 'home');
                              setDropdownOpen(false);
                            }}
                            className="flex items-center gap-2.5 text-start flex-1 min-w-0"
                          >
                            <span className="text-lg shrink-0">{st.design.logoEmoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-stone-900 text-xs truncate">
                                  {language === 'ar' ? st.nameAr || st.name : st.name}
                                </p>
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: dotColor }}
                                />
                              </div>
                              <p className="font-mono text-[11px] text-emerald-700 truncate">
                                {st.slug}.bastiyah.com
                              </p>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => {
                                switchStore(st.id, 'home');
                                setDropdownOpen(false);
                              }}
                              className="px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 text-[10px] font-semibold text-stone-700"
                              title={t.visitStore}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                switchStore(st.id, 'admin');
                                setDropdownOpen(false);
                              }}
                              className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-[10px] font-semibold text-white"
                              title={t.manageStore}
                            >
                              {language === 'ar' ? 'إدارة' : 'Admin'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2 bg-stone-50 border-t border-stone-100 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setCurrentPage('bastiyah-landing');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white hover:bg-stone-100 border border-stone-200 text-stone-800 font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Store className="w-3.5 h-3.5 text-stone-600" />
                      {t.bastiyahDirectory}
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setCurrentPage('bastiyah-admin');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <Crown className="w-3.5 h-3.5 text-amber-400" />
                      {t.bastiyahOwnerAdmin}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Platform Owner Admin + Current Store Admin + Language */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Directory Button */}
          <button
            onClick={() => setCurrentPage('bastiyah-landing')}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentPage === 'bastiyah-landing'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.bastiyahDirectory}</span>
          </button>

          {/* Active Store Admin Toggle */}
          <button
            onClick={() => setCurrentPage(currentPage === 'admin' ? 'home' : 'admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentPage === 'admin'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-200'
            }`}
            title={`${activeStore.slug}.bastiyah.com/admin`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">
              {currentPage === 'admin'
                ? (language === 'ar' ? `عرض متجر ${activeStore.nameAr}` : `View ${activeStore.name}`)
                : `${activeStore.slug} ${language === 'ar' ? 'إدارة' : 'Admin'}`}
            </span>
          </button>

          {/* MAIN BASTIYAH WEBSITE OWNER ADMIN PANEL BUTTON */}
          <button
            onClick={() => setCurrentPage('bastiyah-admin')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all ${
              currentPage === 'bastiyah-admin'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-2xs'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-stone-950" />
            <span>{t.bastiyahOwnerAdmin}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold border border-stone-200 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-stone-500" />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
