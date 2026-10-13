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
    if (currentPage === 'bastiyah-admin') return 'https://owner.bastiyah.com/admin';
    if (currentPage === 'bastiyah-landing') return 'https://bastiyah.com';
    if (currentPage === 'admin') return `https://${activeStore.slug}.bastiyah.com/admin`;
    return `https://${activeStore.slug}.bastiyah.com`;
  };

  const handleCopyUrl = () => {
    const simulated = getSimulatedUrl();
    navigator.clipboard?.writeText(simulated);
    setCopied(true);
    addToast(`${t.linkCopied}: ${simulated}`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 text-white border-b border-slate-800/80 relative z-50 select-none">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-11 flex items-center justify-between gap-2 text-xs">
        {/* Left: Bastiyah Brand + Store Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setCurrentPage('bastiyah-landing')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 hover:border-indigo-400 transition-all shrink-0"
            title={t.bastiyahTagline}
          >
            <span className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-black text-[11px] text-white shadow-sm">
              B
            </span>
            <span className="font-extrabold tracking-tight text-white">
              {language === 'ar' ? 'بسطية' : 'Bastiyah'}
            </span>
            <span className="hidden md:inline-block text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded">
              HOSTING
            </span>
          </button>

          {/* Interactive Browser Subdomain Bar + Store Switcher */}
          <div className="relative">
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden shadow-inner">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 hover:bg-slate-800/80 transition-colors text-slate-200 max-w-[200px] sm:max-w-xs truncate"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px] text-slate-400 hidden sm:inline">https://</span>
                {currentPage === 'bastiyah-admin' ? (
                  <span className="font-mono text-[11px] font-bold text-amber-400">owner.bastiyah.com</span>
                ) : currentPage === 'bastiyah-landing' ? (
                  <span className="font-mono text-[11px] font-bold text-indigo-400">bastiyah.com</span>
                ) : (
                  <span className="font-mono text-[11px] truncate">
                    <strong className="text-emerald-400 font-bold">{activeStore.slug}</strong>
                    <span className="text-slate-300">.bastiyah.com</span>
                    {currentPage === 'admin' && <span className="text-amber-400">/admin</span>}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              <button
                onClick={handleCopyUrl}
                className="px-2 py-1 border-s border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy Custom Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Store Switcher Dropdown */}
            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)} 
                />
                <div className="absolute start-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                  <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {t.switchStore} ({stores.length})
                    </span>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setCurrentPage('bastiyah-admin');
                      }}
                      className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3 h-3" />
                      {language === 'ar' ? 'رابط جديد' : 'New Link'}
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
                    {stores.map((st) => {
                      const isSelected = st.id === activeStore.id && currentPage !== 'bastiyah-admin' && currentPage !== 'bastiyah-landing';
                      const dotColor = THEME_CONFIGS[st.design.themeColor]?.hex || '#10b981';
                      return (
                        <div
                          key={st.id}
                          className={`px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-slate-800/70 transition-colors ${
                            isSelected ? 'bg-slate-800/90' : ''
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
                                <p className="font-bold text-white text-xs truncate">
                                  {language === 'ar' ? st.nameAr || st.name : st.name}
                                </p>
                                <span
                                  className="w-2 h-2 rounded-full shrink-0"
                                  style={{ backgroundColor: dotColor }}
                                />
                              </div>
                              <p className="font-mono text-[11px] text-emerald-400 truncate">
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
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-200"
                              title={t.visitStore}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                switchStore(st.id, 'admin');
                                setDropdownOpen(false);
                              }}
                              className="px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-[10px] font-semibold text-indigo-200 hover:text-white"
                              title={t.manageStore}
                            >
                              {language === 'ar' ? 'إدارة' : 'Admin'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-2 bg-slate-950/70 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setCurrentPage('bastiyah-landing');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <Store className="w-3.5 h-3.5 text-indigo-400" />
                      {t.bastiyahDirectory}
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setCurrentPage('bastiyah-admin');
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-3.5 h-3.5" />
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
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.bastiyahDirectory}</span>
          </button>

          {/* Active Store Admin Toggle */}
          <button
            onClick={() => setCurrentPage(currentPage === 'admin' ? 'home' : 'admin')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentPage === 'admin'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700'
            }`}
            title={`${activeStore.slug}.bastiyah.com/admin`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
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
                ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>{t.bastiyahOwnerAdmin}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'en' ? 'العربية' : 'EN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
