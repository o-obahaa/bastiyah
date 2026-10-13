import React from 'react';
import {
  Globe,
  Crown,
  Sparkles,
  ArrowUpRight,
  Palette,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Store,
  Layers
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { THEME_CONFIGS } from '../../utils/themeUtils';

export const BastiyahLandingPage: React.FC = () => {
  const {
    stores,
    switchStore,
    setCurrentPage,
    setAdminTab,
    language,
    t,
  } = useStore();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28 border-b border-slate-800">
        <div className="absolute -top-40 start-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-indigo-600/25 via-violet-600/20 to-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.bastiyahHeroBadge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {t.bastiyahHeroTitle}
          </h1>

          <p className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
            {t.bastiyahHeroSubtitle}
          </p>

          {/* Interactive Subdomain Example Pill */}
          <div className="mt-8 inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl" dir="ltr">
            <Globe className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-mono text-sm sm:text-lg text-slate-400">https://</span>
            <span className="font-mono text-sm sm:text-lg font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
              (storename)
            </span>
            <span className="font-mono text-sm sm:text-lg font-bold text-white">.bastiyah.com</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setCurrentPage('bastiyah-admin')}
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 flex items-center gap-2.5 transition-all"
            >
              <Crown className="w-5 h-5" />
              <span>{t.bastiyahOwnerAdmin}</span>
            </button>

            <a
              href="#hosted-stores-directory"
              className="px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm sm:text-base flex items-center gap-2 transition-all"
            >
              <Store className="w-5 h-5 text-indigo-400" />
              <span>{t.hostedStoresTitle} ({stores.length})</span>
            </a>
          </div>
        </div>
      </section>

      {/* Platform Architecture Highlights */}
      <section className="py-14 border-b border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">
              {language === 'ar' ? 'روابط فرعية مخصصة فورية' : 'Instant Custom Subdomain Links'}
            </h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {language === 'ar'
                ? 'ينشئ مالك المنصة روابط مخصصة مثل (storename).bastiyah.com بضغطة زر مع شهادة حماية فورية.'
                : 'Generate dedicated custom links like (storename).bastiyah.com in seconds from the main Bastiyah owner dashboard.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Palette className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">
              {language === 'ar' ? 'تصميم وهوية مستقلة لكل متجر' : 'Independent Store Design & Theme'}
            </h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {language === 'ar'
                ? 'يمتلك كل متجر نظام ألوانه الخاص، وتخطيط الواجهة الرئيسية، وشعاره، وتنسيقات البطاقات بشكل مستقل.'
                : 'Every hosted store has its own color palette, hero layout architecture, header theme, and brand identity.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/90">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white">
              {language === 'ar' ? 'إدارة متجر معزولة بالكامل' : 'Isolated Store Management'}
            </h3>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {language === 'ar'
                ? 'لكل متجر لوحة تحكم خاصة به لإدارة منتجاته، طلباته، عملائه، وكوبوناته بمعزل تام عن المتاجر الأخرى.'
                : 'Each store has its own private /admin portal for managing its products, orders, customers, and coupons.'}
            </p>
          </div>
        </div>
      </section>

      {/* Live Hosted Stores Directory */}
      <section id="hosted-stores-directory" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">
              *.bastiyah.com
            </span>
            <h2 className="text-3xl font-black text-white mt-1">{t.hostedStoresTitle}</h2>
            <p className="text-slate-400 text-sm mt-1">{t.hostedStoresSubtitle}</p>
          </div>

          <button
            onClick={() => setCurrentPage('bastiyah-admin')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto"
          >
            <Zap className="w-4 h-4" />
            <span>{t.createNewStore}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const storeTheme = THEME_CONFIGS[store.design.themeColor] || THEME_CONFIGS.emerald;
            const previewImages = store.products.slice(0, 3).map((p) => p.images[0]);

            return (
              <div
                key={store.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-xl"
              >
                <div>
                  {/* Top Color Accent Banner */}
                  <div
                    className="h-24 p-5 flex items-start justify-between relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${storeTheme.hex}33 0%, #0f172a 100%)`,
                    }}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/15 bg-slate-950/80"
                      >
                        {store.design.logoEmoji}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-950/80 text-slate-300 border border-white/10">
                          {language === 'ar' ? store.categoryAr || store.category : store.category}
                        </span>
                        <h3 className="text-xl font-black text-white mt-1">
                          {language === 'ar' ? store.nameAr || store.name : store.name}
                        </h3>
                      </div>
                    </div>

                    <span
                      className="w-3 h-3 rounded-full ring-4 ring-white/10"
                      style={{ backgroundColor: storeTheme.hex }}
                      title={storeTheme.name}
                    />
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    {/* Custom Link Pill */}
                    <div
                      onClick={() => switchStore(store.id, 'home')}
                      className="cursor-pointer flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-colors mb-4"
                      dir="ltr"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-mono text-xs text-slate-400 truncate">
                          https://<strong className="text-emerald-400 font-bold">{store.slug}</strong>.bastiyah.com
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>

                    <p className="text-sm text-slate-300 font-medium line-clamp-2 min-h-[2.5rem]">
                      {language === 'ar' ? store.taglineAr || store.tagline : store.tagline}
                    </p>

                    {/* Mini Product Thumbnails */}
                    <div className="mt-5 flex items-center gap-2">
                      {previewImages.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover border border-slate-800 bg-slate-950"
                        />
                      ))}
                      <div className="flex-1 h-14 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-xs">
                        <span className="font-black text-white">{store.products.length}</span>
                        <span className="text-[10px] text-slate-400">{t.products}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 pb-6 pt-3 border-t border-slate-800/70 flex items-center gap-2.5">
                  <button
                    onClick={() => switchStore(store.id, 'home')}
                    className="flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg transition-opacity hover:opacity-95"
                    style={{ backgroundColor: storeTheme.hex }}
                  >
                    <span>{t.visitStore}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      switchStore(store.id, 'admin');
                      setAdminTab('dashboard');
                    }}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{t.manageStore}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
