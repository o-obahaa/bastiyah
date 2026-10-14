import React, { useState } from 'react';
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
  Layers,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  Sliders,
  Database,
  Cloud
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getStoreDisplayUrl, getStorePathLabel, getFutureCustomDomainUrl } from '../../utils/urlUtils';
import { DynamicLogo } from '../common/DynamicLogo';

export const BastiyahLandingPage: React.FC = () => {
  const {
    stores,
    switchStore,
    setCurrentPage,
    setAdminTab,
    language,
    setLanguage,
    t,
    addToast,
  } = useStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyStoreUrl = (e: React.MouseEvent, storeSlug: string, storeId: string) => {
    e.stopPropagation();
    const liveUrl = getStoreDisplayUrl(storeSlug);
    navigator.clipboard?.writeText(liveUrl);
    setCopiedId(storeId);
    addToast(`${t.linkCopied}: ${liveUrl}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 relative selection:bg-stone-900 selection:text-white">
      {/* Minimalist Background Pattern Overlay (Subtle dot grid fading radially) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-pattern-dots-subtle opacity-75 bg-pattern-radial-mask" />

      {/* Bastiyah Platform Master Header (Minimalist White Glass) */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-stone-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Platform Brand (Dynamic Logo + بسطية) */}
          <div 
            onClick={() => setCurrentPage('bastiyah-landing')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            {/* Official Bastiyah Emblem (Without Text) */}
            <img
              src="/bastiyah-emblem.png"
              alt="بسطية"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105 pointer-events-none"
            />

            <div>
              <div className="flex items-center gap-2">
                <span className="font-brand font-black text-xl sm:text-2xl tracking-tight text-stone-900 group-hover:text-stone-950 transition-colors">
                  بسطية
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-stone-100 text-stone-600 border border-stone-200 uppercase tracking-wider">
                  BASTIYAH
                </span>
              </div>
              <span className="font-mono text-[11px] text-stone-500 block -mt-0.5" dir="ltr">
                bastiyah.com
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold text-stone-600">
            <a 
              href="#hosted-stores-directory" 
              className="hover:text-stone-950 transition-colors font-medium flex items-center gap-1.5"
            >
              <Store className="w-4 h-4 text-stone-400" />
              <span>{t.hostedStoresTitle}</span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full font-bold">
                {stores.length}
              </span>
            </a>
            <a 
              href="#features" 
              className="hover:text-stone-950 transition-colors font-medium flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-stone-400" />
              <span>{language === 'ar' ? 'مميزات بسطية' : 'Platform Features'}</span>
            </a>
          </nav>

          {/* Platform Actions */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white border border-stone-200/90 hover:bg-stone-50 text-stone-700 transition-colors shadow-sm"
              title={language === 'en' ? 'التحويل للغة العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Platform Owner Super Admin */}
            <button
              onClick={() => setCurrentPage('bastiyah-admin')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-sm hover:shadow"
              title={t.bastiyahOwnerAdmin}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.bastiyahOwnerAdmin}</span>
              <span className="sm:hidden">{language === 'ar' ? 'الإدارة' : 'Admin'}</span>
            </button>

            {/* Create New Store Link */}
            <button
              onClick={() => setCurrentPage('bastiyah-admin')}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-stone-50 text-stone-900 border border-stone-300 shadow-sm hover:border-stone-400 transition-all"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.createNewStore}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">
        {/* Hero Section (Modern Minimalist with Dynamic Logo) */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28 border-b border-stone-200/80">
          {/* Subtle Ambient Watercolor Glows */}
          <div className="absolute top-10 start-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-100/40 via-rose-100/30 to-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Centerpiece: Official Bastiyah Emblem with Layout-Matched Font */}
            <div className="mb-4 animate-in fade-in zoom-in-95 duration-500">
              <DynamicLogo
                size="hero"
                layout="vertical"
                showText={true}
              />
            </div>

            {/* Platform Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 text-stone-700 text-xs font-semibold shadow-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-brand font-bold">بسطية</span>
              <span className="text-stone-300">•</span>
              <span>{t.bastiyahHeroBadge}</span>
            </div>

            {/* Hero Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 max-w-4xl mx-auto leading-[1.2]">
              {language === 'ar' ? (
                <>
                  أطلق متجرك المستقل على <span className="font-brand text-stone-950 underline decoration-amber-400 decoration-wavy decoration-2">بسطية</span> برابط وهوية خاصة
                </>
              ) : (
                t.bastiyahHeroTitle
              )}
            </h1>

            {/* Hero Subtitle */}
            <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto mt-5 leading-relaxed font-normal">
              {language === 'ar'
                ? 'تتيح منصة بسطية لكل تاجر وعلامة تجارية استضافة متجر مستقل برابط فرعي حصري، وهوية بصرية متكاملة، ولوحة تحكم معزولة تماماً لإدارة المنتجات والطلبات والصور.'
                : t.bastiyahHeroSubtitle}
            </p>

            {/* Minimalist Live Store Link Showcase */}
            <div className="mt-8 flex flex-col items-center gap-2.5">
              <div 
                className="inline-flex items-center gap-2 sm:gap-3 px-5 py-3 rounded-2xl bg-white border border-stone-200/90 shadow-md shadow-stone-200/50" 
                dir="ltr"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <span className="font-mono text-sm sm:text-base font-bold text-stone-800">
                  https://
                </span>
                <span className="font-mono text-sm sm:text-base font-black text-stone-900 bg-stone-100 px-3 py-1 rounded-xl border border-stone-200">
                  (storename).bastiyah.com
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                {language === 'ar'
                  ? '🔗 روابط فورية جاهزة للمشاركة لكل متجر • تعمل على Vercel وتتحول تلقائياً إلى دومين بسطية الخاص'
                  : '🔗 Instant shareable links for every store • Powered by Bastiyah cloud infrastructure'}
              </p>
            </div>

            {/* Call to Actions */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => setCurrentPage('bastiyah-admin')}
                className="px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-stone-900/10 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{t.bastiyahOwnerAdmin}</span>
              </button>

              <a
                href="#hosted-stores-directory"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-sm hover:border-stone-400"
              >
                <Store className="w-4 h-4 text-stone-600" />
                <span>{t.hostedStoresTitle} ({stores.length})</span>
              </a>
            </div>
          </div>
        </section>

        {/* Platform Architecture Highlights (Minimalist 3 Cards) */}
        <section id="features" className="py-16 border-b border-stone-200/80 bg-white/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-extrabold uppercase tracking-widest text-stone-500 font-sans">
                {language === 'ar' ? 'بنية منصة بسطية السحابية' : 'Bastiyah Architecture'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1.5 font-brand">
                {language === 'ar' ? 'مميزات منصة بسطية للمتاجر المستقلة' : 'Platform Engineering Highlights'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-7 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-5">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-900 font-brand">
                  {language === 'ar' ? 'روابط مخصصة ومستقلة فورية' : 'Instant Dedicated Store Links'}
                </h3>
                <p className="text-sm text-stone-600 mt-2.5 leading-relaxed font-normal">
                  {language === 'ar'
                    ? 'ينشئ مالك منصة بسطية روابط مخصصة مثل (storename).bastiyah.com بضغطة زر مع شهادة حماية فورية وجاهزة للمشاركة للعملاء.'
                    : 'Generate dedicated working links like (storename).bastiyah.com in seconds from the main Bastiyah owner dashboard.'}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-5">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-900 font-brand">
                  {language === 'ar' ? 'تصميم وهوية مستقلة لكل متجر' : 'Independent Store Design & Theme'}
                </h3>
                <p className="text-sm text-stone-600 mt-2.5 leading-relaxed font-normal">
                  {language === 'ar'
                    ? 'يمتلك كل متجر على منصة بسطية نظام ألوانه الخاص، وتخطيط الواجهة الرئيسية، وشعاره، وتنسيقات البطاقات بشكل منعزل.'
                    : 'Every hosted store has its own color palette, hero layout architecture, header theme, and brand identity.'}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-300 flex items-center justify-center text-stone-800 mb-5">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-stone-900 font-brand">
                  {language === 'ar' ? 'إدارة متجر معزولة وسحابية' : 'Isolated Store Management'}
                </h3>
                <p className="text-sm text-stone-600 mt-2.5 leading-relaxed font-normal">
                  {language === 'ar'
                    ? 'لكل متجر لوحة تحكم خاصة به لإدارة منتجاته، طلباته، عملائه، وكوبوناته، مع ربط قاعدة بيانات Convex وخوادم صور Cloudflare.'
                    : 'Each store has its own private /admin portal for managing its products, orders, customers, and media storage.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Live Hosted Stores Directory Section */}
        <section id="hosted-stores-directory" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-stone-500 font-mono mb-1">
                <span>*.bastiyah.com</span>
                <span>•</span>
                <span className="font-brand">دليل بسطية</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-brand">
                {language === 'ar' ? 'المتاجر المستضافة على منصة بسطية' : t.hostedStoresTitle}
              </h2>
              <p className="text-stone-600 text-sm mt-1 font-normal">
                {language === 'ar'
                  ? 'تصفح المتاجر المستقلة النشطة التي تم إنشاؤها وتخصيصها عبر منصة بسطية'
                  : t.hostedStoresSubtitle}
              </p>
            </div>

            <button
              onClick={() => setCurrentPage('bastiyah-admin')}
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto transition-all shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{t.createNewStore}</span>
            </button>
          </div>

          {/* Store Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => {
              const storeTheme = THEME_CONFIGS[store.design.themeColor] || THEME_CONFIGS.emerald;
              const previewImages = store.products.slice(0, 3).map((p) => p.images[0]);

              return (
                <div
                  key={store.id}
                  className="bg-white border border-stone-200/90 hover:border-stone-400/90 rounded-3xl overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-stone-200/60 group"
                >
                  <div>
                    {/* Top Subtle Color Accent Header */}
                    <div
                      className="p-5 flex items-start justify-between relative border-b border-stone-100"
                      style={{
                        background: `linear-gradient(135deg, ${storeTheme.hex}14 0%, #ffffff 100%)`,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-stone-200/90 bg-white">
                          {store.design.logoEmoji}
                        </div>
                        <div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-stone-600 border border-stone-200 shadow-2xs">
                            {language === 'ar' ? store.categoryAr || store.category : store.category}
                          </span>
                          <h3 className="text-lg font-black text-stone-900 mt-1 font-brand">
                            {language === 'ar' ? store.nameAr || store.name : store.name}
                          </h3>
                        </div>
                      </div>

                      {/* Store Color Accent Pill */}
                      <span
                        className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow-sm shrink-0"
                        style={{ backgroundColor: storeTheme.hex }}
                        title={storeTheme.name}
                      />
                    </div>

                    {/* Store Card Body */}
                    <div className="p-6">
                      {/* Dedicated Store Link Pill */}
                      <div
                        className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 hover:border-stone-400 transition-colors mb-4 group/pill"
                        dir="ltr"
                      >
                        <button
                          onClick={() => switchStore(store.id, 'home')}
                          className="flex items-center gap-2 truncate text-start hover:opacity-90"
                          title={language === 'ar' ? `زيارة متجر ${store.name}` : `Visit ${store.name}`}
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-mono text-xs font-semibold text-stone-700 truncate">
                            {getStorePathLabel(store.slug)}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => handleCopyStoreUrl(e, store.slug, store.id)}
                            className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
                            title="Copy Store Link"
                          >
                            {copiedId === store.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => switchStore(store.id, 'home')}
                            className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 hover:text-stone-800 transition-colors"
                            title="Open Store"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Store Tagline */}
                      <p className="text-sm text-stone-600 font-medium line-clamp-2 min-h-[2.5rem]">
                        {language === 'ar' ? store.taglineAr || store.tagline : store.tagline}
                      </p>

                      {/* Mini Product Thumbnails */}
                      <div className="mt-5 flex items-center gap-2">
                        {previewImages.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover border border-stone-200 bg-stone-50"
                          />
                        ))}
                        <div className="flex-1 h-14 rounded-xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-xs">
                          <span className="font-black text-stone-900">{store.products.length}</span>
                          <span className="text-[10px] text-stone-500">{t.products}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-6 pb-6 pt-3 border-t border-stone-100 flex items-center gap-2.5">
                    <button
                      onClick={() => switchStore(store.id, 'home')}
                      className="flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-opacity hover:opacity-95"
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
                      className="py-2.5 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors border border-stone-200"
                    >
                      <Layers className="w-3.5 h-3.5 text-stone-600" />
                      <span>{t.manageStore}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Bastiyah Platform Footer (Modern Minimalist White) */}
      <footer className="border-t border-stone-200 bg-white py-12 text-stone-500 text-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/bastiyah-emblem.png"
              alt="بسطية"
              className="w-10 h-10 object-contain shrink-0 pointer-events-none"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-brand font-black text-stone-900 text-base">
                  بسطية
                </span>
                <span className="text-[10px] text-stone-400 font-bold uppercase">
                  (Bastiyah)
                </span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono block">
                bastiyah.com • Platform
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-center md:text-start text-stone-500 max-w-md font-normal leading-relaxed">
            {language === 'ar'
              ? 'منصة بسطية: بنية سحابية متكاملة لتمكين التجار وأصحاب المشاريع من إطلاق متاجر إلكترونية مستقلة بهوية خاصة وروابط فرعية معزولة.'
              : 'Bastiyah: Cloud platform for hosting independent web-stores with dedicated subdomains and isolated administration.'}
          </p>

          {/* Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage('bastiyah-admin')}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 font-bold transition-colors flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.bastiyahOwnerAdmin}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
