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
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  Building2,
  ArrowRight,
  Send,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getStoreDisplayUrl, getStorePathLabel } from '../../utils/urlUtils';
import { DynamicLogo } from '../common/DynamicLogo';

export const BastiyahLandingPage: React.FC = () => {
  const {
    stores,
    switchStore,
    setCurrentPage,
    setAdminTab,
    createHostedStore,
    language,
    setLanguage,
    t,
    addToast,
  } = useStore();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Application Box Form State
  const [appName, setAppName] = useState('');
  const [appNameAr, setAppNameAr] = useState('');
  const [appSlug, setAppSlug] = useState('');
  const [appOwnerName, setAppOwnerName] = useState('');
  const [appContact, setAppContact] = useState('');
  const [appCategory, setAppCategory] = useState<'fashion' | 'perfumes' | 'tech' | 'coffee' | 'decor'>('fashion');
  const [appPlan, setAppPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Starter');
  const [appSuccess, setAppSuccess] = useState<{ storeId: string; slug: string; name: string } | null>(null);
  const [appSubmitting, setAppSubmitting] = useState(false);

  // Contact Section Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const handleCopyStoreUrl = (e: React.MouseEvent, storeSlug: string, storeId: string) => {
    e.stopPropagation();
    const liveUrl = getStoreDisplayUrl(storeSlug);
    navigator.clipboard?.writeText(liveUrl);
    setCopiedId(storeId);
    addToast(`${t.linkCopied}: ${liveUrl}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNameChange = (val: string) => {
    setAppName(val);
    if (!appSlug) {
      const generated = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setAppSlug(generated);
    }
  };

  const handleApplyStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName.trim()) {
      addToast(language === 'ar' ? 'يرجى كتابة اسم المتجر' : 'Please provide a store name', 'error');
      return;
    }

    const cleanSlug = (appSlug || appName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `store-${Date.now().toString().slice(-4)}`;

    // Check if slug taken
    const exists = stores.some((s) => s.slug.toLowerCase() === cleanSlug.toLowerCase());
    const finalSlug = exists ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

    const categoryMap = {
      fashion: { en: 'Fashion & Luxury', ar: 'أزياء وفخامة', emoji: '👗' },
      perfumes: { en: 'Perfumes & Oud', ar: 'عطور وعود فاخر', emoji: '🏺' },
      tech: { en: 'Electronics & Tech', ar: 'إلكترونيات وتقنية', emoji: '⚡' },
      coffee: { en: 'Specialty Coffee & Artisan', ar: 'قهوة مختصة وحرفيات', emoji: '☕' },
      decor: { en: 'Home & Architecture', ar: 'منزل وديكور', emoji: '🕯️' },
    };

    const chosenCat = categoryMap[appCategory] || categoryMap.fashion;

    setAppSubmitting(true);
    setTimeout(() => {
      try {
        const newStore = createHostedStore({
          name: appName,
          nameAr: appNameAr || appName,
          slug: finalSlug,
          tagline: `Curated ${chosenCat.en} hosted on Bastiyah`,
          taglineAr: `أفضل منتجات ${chosenCat.ar} عبر منصة بسطية`,
          category: chosenCat.en,
          categoryAr: chosenCat.ar,
          ownerName: appOwnerName || 'Store Merchant',
          ownerEmail: appContact.includes('@') ? appContact : `contact@${finalSlug}.bastiyah.com`,
          plan: appPlan,
          themeColor: 'emerald',
          layoutStyle: 'modern-split',
          logoEmoji: chosenCat.emoji,
        });

        setAppSuccess({
          storeId: newStore.id,
          slug: newStore.slug,
          name: language === 'ar' ? newStore.nameAr : newStore.name,
        });

        addToast(
          language === 'ar' ? 'تم إنشاء المتجر بنجاح وجاهز للانطلاق!' : 'Store launched successfully on Bastiyah!',
          'success'
        );
      } catch (err) {
        addToast(language === 'ar' ? 'حدث خطأ أثناء التقديم' : 'Error submitting application', 'error');
      } finally {
        setAppSubmitting(false);
      }
    }, 600);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      addToast(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill in all fields', 'error');
      return;
    }
    setContactSent(true);
    addToast(
      language === 'ar' ? 'شكراً لتواصلك! سيقوم فريق بسطية بالرد قريباً' : 'Thank you! The Bastiyah team will reach out soon.',
      'success'
    );
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 relative selection:bg-stone-900 selection:text-white">
      {/* Minimalist Background Pattern Overlay (Subtle dot grid fading radially) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-pattern-dots-subtle opacity-75 bg-pattern-radial-mask" />

      {/* 
        ========================================================================
        1. THE UPPER BANNER (Navbar)
        Contains: Logo + Name of site, (services), (features), (pricing), (about us), (contact us)
        ========================================================================
      */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Platform Brand (Cropped Logo + بسطية) */}
          <div 
            onClick={() => setCurrentPage('bastiyah-landing')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            {/* Cropped Official Bastiyah Emblem */}
            <img
              src="/bastiyah-emblem.png"
              alt="بسطية"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105 pointer-events-none"
            />

            <div className="flex items-baseline gap-2">
              <span className="font-brand font-black text-xl sm:text-2xl tracking-tight text-stone-900 group-hover:text-stone-950 transition-colors">
                بسطية
              </span>
              <span className="text-xs font-bold text-stone-400 tracking-wider uppercase font-sans">
                Bastiyah
              </span>
            </div>
          </div>

          {/* Navigation Links (Upper Banner Links) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs sm:text-sm font-semibold text-stone-600">
            <a 
              href="#services" 
              className="hover:text-stone-950 transition-colors font-medium py-1"
            >
              {language === 'ar' ? 'خدماتنا' : 'Services'}
            </a>
            <a 
              href="#features" 
              className="hover:text-stone-950 transition-colors font-medium py-1"
            >
              {language === 'ar' ? 'المميزات' : 'Features'}
            </a>
            <a 
              href="#pricing" 
              className="hover:text-stone-950 transition-colors font-medium py-1"
            >
              {language === 'ar' ? 'الأسعار' : 'Pricing'}
            </a>
            <a 
              href="#about" 
              className="hover:text-stone-950 transition-colors font-medium py-1"
            >
              {language === 'ar' ? 'من نحن' : 'About Us'}
            </a>
            <a 
              href="#contact" 
              className="hover:text-stone-950 transition-colors font-medium py-1"
            >
              {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
            </a>
            <a 
              href="#hosted-stores-directory" 
              className="hover:text-stone-950 transition-colors font-medium py-1 flex items-center gap-1.5 text-stone-700"
            >
              <Store className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'ar' ? 'المتاجر' : 'Stores'}</span>
              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded-full font-bold">
                {stores.length}
              </span>
            </a>
          </nav>

          {/* Platform Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* CTA Button: Jump to Application Box */}
            <a
              href="#apply-store"
              className="px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white transition-all shadow-sm hover:shadow flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'قدّم طلب متجر' : 'Apply Store'}</span>
            </a>

            {/* Platform Owner Super Admin */}
            <button
              onClick={() => setCurrentPage('bastiyah-admin')}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-white border border-stone-200/90 hover:bg-stone-50 text-stone-800 transition-all shadow-2xs flex items-center gap-1.5"
              title={t.bastiyahOwnerAdmin}
            >
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">{language === 'ar' ? 'لوحة المالك' : 'Owner'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
              title={language === 'en' ? 'التحويل للعربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-stone-500" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10">

        {/* 
          ========================================================================
          2. HERO SECTION & CENTERPIECE LOGO
          ========================================================================
        */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-stone-200/80">
          <div className="absolute top-10 start-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-100/40 via-rose-100/30 to-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Centerpiece: Cropped Bastiyah Emblem with Centered Typography */}
            <div className="mb-6 animate-in fade-in zoom-in-95 duration-500">
              <DynamicLogo
                size="hero"
                layout="vertical"
                showText={true}
                subtitle={
                  language === 'ar'
                    ? 'المنصة السحابية لإطلاق واستضافة المتاجر الإلكترونية المستقلة'
                    : 'Cloud Platform for Hosting Independent Web-Stores'
                }
              />
            </div>

            {/* Hero Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 max-w-4xl mx-auto leading-[1.2] font-brand">
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

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="#apply-store"
                className="px-6 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-stone-900/10 flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'قدّم طلب متجر جديد الآن' : 'Apply as a New Store'}</span>
              </a>

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

        {/* 
          ========================================================================
          3. THE BOX FOR NEW STORES APPLYING (With logo and name of site)
          ========================================================================
        */}
        <section id="apply-store" className="py-20 sm:py-24 border-b border-stone-200/80 bg-white/70 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* The Application Box Container */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl shadow-stone-200/50 p-6 sm:p-10 relative overflow-hidden">
              {/* Subtle Ambient Decorative Gradient */}
              <div className="absolute top-0 end-0 w-80 h-80 bg-gradient-to-bl from-amber-100/50 via-rose-100/30 to-transparent rounded-full blur-2xl pointer-events-none -z-0" />

              {/* Box Header: Contains the Logo and Name of the Site */}
              <div className="relative z-10 flex flex-col items-center text-center pb-8 border-b border-stone-100">
                {/* Stall Emblem */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex items-center justify-center mb-3">
                  <img
                    src="/bastiyah-emblem.png"
                    alt="بسطية"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>

                {/* Name of the Site */}
                <div className="flex items-center gap-2">
                  <h2 className="font-brand font-black text-2xl sm:text-3xl text-stone-900 tracking-tight">
                    بسطية
                  </h2>
                  <span className="text-xs font-bold tracking-widest text-stone-400 uppercase font-sans">
                    Bastiyah
                  </span>
                </div>

                {/* Box Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-stone-800 mt-2 font-brand">
                  {language === 'ar' ? 'طلب انضمام وإطلاق متجر جديد' : 'New Store Application & Onboarding'}
                </h3>
                <p className="text-sm text-stone-500 max-w-lg mt-1 font-normal leading-relaxed">
                  {language === 'ar'
                    ? 'املأ بيانات متجرك للانضمام إلى منصة بسطية والحصول على رابط مخصص وهوية مستقلة ولوحة تحكم خاصة فوراً.'
                    : 'Fill out your store details to join Bastiyah with a dedicated subdomain, custom visual identity, and private management dashboard.'}
                </p>
              </div>

              {/* Success Confirmation Card */}
              {appSuccess ? (
                <div className="relative z-10 py-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <h4 className="text-2xl font-black text-stone-900 font-brand">
                    {language === 'ar' ? `تهانينا! متجر (${appSuccess.name}) جاهز الآن` : `Congratulations! (${appSuccess.name}) is Live`}
                  </h4>

                  <p className="text-sm text-stone-600 mt-2 max-w-md">
                    {language === 'ar'
                      ? 'تم قبول طلبك وإطلاق متجرك بنجاح على منصة بسطية السحابية.'
                      : 'Your application has been processed and your store is now live on Bastiyah.'}
                  </p>

                  <div className="mt-5 px-5 py-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center gap-2 text-stone-800 font-mono text-sm">
                    <span className="text-emerald-600 font-bold">https://</span>
                    <span className="font-black text-stone-900">{appSuccess.slug}.bastiyah.com</span>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        switchStore(appSuccess.storeId, 'home');
                      }}
                      className="px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm flex items-center gap-2 shadow-sm"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      <span>{t.visitStore}</span>
                    </button>

                    <button
                      onClick={() => {
                        switchStore(appSuccess.storeId, 'admin');
                        setAdminTab('dashboard');
                      }}
                      className="px-6 py-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm flex items-center gap-2 shadow-2xs"
                    >
                      <Layers className="w-4 h-4 text-stone-600" />
                      <span>{t.manageStore}</span>
                    </button>

                    <button
                      onClick={() => setAppSuccess(null)}
                      className="px-4 py-3 rounded-xl text-stone-500 hover:text-stone-800 text-xs font-semibold"
                    >
                      {language === 'ar' ? 'تقديم طلب متجر آخر' : 'Submit Another Store'}
                    </button>
                  </div>
                </div>
              ) : (
                /* The Interactive Application Form */
                <form onSubmit={handleApplyStore} className="relative z-10 pt-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Store Name (English / Primary) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'ar' ? 'اسم المتجر بالإنجليزية *' : 'Store Name (English) *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={appName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Silk & Stone"
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
                      />
                    </div>

                    {/* Store Name (Arabic) */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'ar' ? 'اسم المتجر بالعربية' : 'Store Name (Arabic)'}
                      </label>
                      <input
                        type="text"
                        value={appNameAr}
                        onChange={(e) => setAppNameAr(e.target.value)}
                        placeholder="مثال: حرير وحجر"
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all font-brand"
                      />
                    </div>
                  </div>

                  {/* Subdomain Slug Live Preview */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {language === 'ar' ? 'رابط المتجر المخصص على بسطية *' : 'Dedicated Store Link Slug *'}
                    </label>
                    <div className="flex items-center rounded-xl bg-stone-50 border border-stone-200 overflow-hidden px-4 py-2.5 focus-within:border-stone-400 focus-within:ring-2 focus-within:ring-stone-900/10 transition-all" dir="ltr">
                      <span className="font-mono text-xs text-stone-400 select-none">https://</span>
                      <input
                        type="text"
                        required
                        value={appSlug}
                        onChange={(e) => setAppSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="store-name"
                        className="bg-transparent border-0 px-1 font-mono text-xs sm:text-sm font-bold text-stone-900 focus:outline-none flex-1 min-w-0"
                      />
                      <span className="font-mono text-xs text-stone-500 font-bold select-none">.bastiyah.com</span>
                    </div>
                  </div>

                  {/* Merchant / Owner Name & Contact Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'ar' ? 'اسم صاحب المتجر *' : 'Merchant / Owner Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={appOwnerName}
                        onChange={(e) => setAppOwnerName(e.target.value)}
                        placeholder={language === 'ar' ? 'مثال: أحمد العراقي' : 'e.g. Sarah Miller'}
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        {language === 'ar' ? 'البريد أو رقم الهاتف *' : 'Email or Contact Phone *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={appContact}
                        onChange={(e) => setAppContact(e.target.value)}
                        placeholder="merchant@domain.com / +964..."
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {language === 'ar' ? 'مجال ونشاط المتجر' : 'Primary Store Category'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {[
                        { id: 'fashion', labelAr: 'أزياء وملابس', labelEn: 'Fashion', icon: '👗' },
                        { id: 'perfumes', labelAr: 'عطور وبخور', labelEn: 'Perfumes', icon: '🏺' },
                        { id: 'tech', labelAr: 'إلكترونيات', labelEn: 'Tech', icon: '⚡' },
                        { id: 'coffee', labelAr: 'قهوة وحرف', labelEn: 'Coffee & Crafts', icon: '☕' },
                        { id: 'decor', labelAr: 'منزل وديكور', labelEn: 'Home Decor', icon: '🕯️' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setAppCategory(cat.id as any)}
                          className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                            appCategory === cat.id
                              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                          }`}
                        >
                          <span className="text-xl">{cat.icon}</span>
                          <span className="text-[11px] font-bold">
                            {language === 'ar' ? cat.labelAr : cat.labelEn}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {language === 'ar' ? 'الباقة المختارة' : 'Selected Hosting Plan'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'Starter', nameAr: 'البداية (Starter)', descAr: 'مجاناً للتجربة وإطلاق أول متجر', price: '$0' },
                        { id: 'Growth', nameAr: 'النمو (Growth)', descAr: 'للمتاجر النشطة مع دومين خاص', price: '$29/mo' },
                        { id: 'Enterprise', nameAr: 'المؤسسات (Enterprise)', descAr: 'بنية متكاملة ودعم مخصص', price: '$99/mo' },
                      ].map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => setAppPlan(plan.id as any)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            appPlan === plan.id
                              ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                              : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs">{language === 'ar' ? plan.nameAr : plan.id}</span>
                            <span className={`text-xs font-black ${appPlan === plan.id ? 'text-amber-400' : 'text-stone-900'}`}>
                              {plan.price}
                            </span>
                          </div>
                          <p className={`text-[11px] ${appPlan === plan.id ? 'text-stone-300' : 'text-stone-500'}`}>
                            {language === 'ar' ? plan.descAr : 'Hosting plan'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={appSubmitting}
                      className="w-full py-4 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white font-bold text-base shadow-lg shadow-stone-900/10 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                    >
                      <Zap className="w-5 h-5 text-amber-400" />
                      <span>
                        {appSubmitting
                          ? (language === 'ar' ? 'جارٍ معالجة طلبك...' : 'Processing application...')
                          : (language === 'ar' ? 'إرسال طلب إطلاق المتجر على بسطية' : 'Submit Application & Launch Store')}
                      </span>
                    </button>
                    <p className="text-center text-[11px] text-stone-400 mt-2.5">
                      {language === 'ar' 
                        ? '🔒 يتم تفعيل متجرك فوراً مع شهادة أمان SSL ورابط فرعي مستقل' 
                        : '🔒 Your store is activated immediately with dedicated SSL and isolated dashboard.'}
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          4. SERVICES SECTION (#services)
          ========================================================================
        */}
        <section id="services" className="py-20 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'خدمات منصة بسطية' : 'Platform Services'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-1 font-brand">
                {language === 'ar' ? 'كل ما تحتاجه لإطلاق وإدارة تجارتك' : 'Comprehensive Multi-Store Services'}
              </h2>
              <p className="text-stone-500 text-sm mt-2">
                {language === 'ar'
                  ? 'نوفر بنية سحابية متكاملة تمنحك استقلالية تامة دون تعقيدات البرمجة أو تكاليف الخوادم الباهظة.'
                  : 'Everything you need to host, brand, and scale independent e-commerce stores effortlessly.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: <Globe className="w-6 h-6 text-stone-800" />,
                  titleAr: 'استضافة بروابط مخصصة',
                  titleEn: 'Dedicated Subdomains',
                  descAr: 'رابط فرعي مباشر مثل (store).bastiyah.com جاهز للمشاركة والتسويق مع شهادة حماية مجانية.',
                  descEn: 'Instant dedicated subdomains with automatic SSL encryption and custom domain support.',
                },
                {
                  icon: <Palette className="w-6 h-6 text-stone-800" />,
                  titleAr: 'تخصيص الهوية البصرية',
                  titleEn: 'Visual Identity Studio',
                  descAr: 'تحكم في ألوان متجرك، وتخطيط صفحة البداية، وأشكال البطاقات، وشعار المتجر بدقة.',
                  descEn: 'Complete control over your store color palette, hero layouts, card styles, and brand logo.',
                },
                {
                  icon: <LayoutDashboard className="w-6 h-6 text-stone-800" />,
                  titleAr: 'لوحة تحكم معزولة لكل متجر',
                  titleEn: 'Isolated Admin Portal',
                  descAr: 'لوحة إدارة متكاملة لإضافة المنتجات، متابعة الطلبات، إدارة العملاء، وتطبيق الكوبونات.',
                  descEn: 'Private /admin dashboard for product inventory, customer tracking, and order fulfillment.',
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-stone-800" />,
                  titleAr: 'بنية سحابية آمنة وسريعة',
                  titleEn: 'Cloud & CDN Architecture',
                  descAr: 'استضافة سحابية عالية السرعة على Vercel وCloudflare R2 مع أداء فائق على كافة الأجهزة.',
                  descEn: 'Lightning-fast cloud architecture powered by Vercel edge networks and Cloudflare media storage.',
                },
              ].map((svc, idx) => (
                <div key={idx} className="p-7 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
                    {svc.icon}
                  </div>
                  <h3 className="font-brand font-bold text-lg text-stone-900 mb-2">
                    {language === 'ar' ? svc.titleAr : svc.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
                    {language === 'ar' ? svc.descAr : svc.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          5. FEATURES SECTION (#features)
          ========================================================================
        */}
        <section id="features" className="py-20 border-b border-stone-200/80 bg-white/60 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'مميزات بسطية' : 'Core Features'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-1 font-brand">
                {language === 'ar' ? 'لماذا يختار التجار منصة بسطية؟' : 'Why Merchants Choose Bastiyah'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all">
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

              <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all">
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

              <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all">
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

        {/* 
          ========================================================================
          6. PRICING SECTION (#pricing)
          ========================================================================
        */}
        <section id="pricing" className="py-20 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'خطط وباقات الاستضافة' : 'Pricing Plans'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-1 font-brand">
                {language === 'ar' ? 'باقات شفافة وبسيطة تناسب حجم تجارتك' : 'Transparent Hosting Plans'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Plan 1: Starter */}
              <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {language === 'ar' ? 'باقة البداية' : 'Starter'}
                  </span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 font-brand">$0</span>
                    <span className="text-xs text-stone-400">/{language === 'ar' ? 'شهرياً' : 'month'}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    {language === 'ar' ? 'مثالية للبدء والتجربة وإطلاق أول بسطية إلكترونية.' : 'Ideal for hobbyists and launching your very first online boutique.'}
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-stone-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'رابط متجر فرعي: (name).bastiyah.com' : 'Dedicated (name).bastiyah.com link'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'حتى 15 منتج مستقل' : 'Up to 15 products'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'لوحة تحكم كاملة للمتجر' : 'Full private /admin panel'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'تخصيص الألوان والشعار' : 'Custom colors & emoji logo'}</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="#apply-store"
                  className="mt-8 w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs text-center transition-colors"
                >
                  {language === 'ar' ? 'ابدأ مجاناً' : 'Get Started Free'}
                </a>
              </div>

              {/* Plan 2: Growth (Featured) */}
              <div className="p-8 rounded-3xl bg-stone-900 text-white shadow-xl shadow-stone-900/10 flex flex-col justify-between relative border border-stone-800">
                <span className="absolute -top-3 start-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px] uppercase tracking-wider">
                  {language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                </span>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                    {language === 'ar' ? 'باقة النمو' : 'Growth'}
                  </span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white font-brand">$29</span>
                    <span className="text-xs text-stone-400">/{language === 'ar' ? 'شهرياً' : 'month'}</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">
                    {language === 'ar' ? 'للمشاريع والعلامات التجارية المتنامية والمتاجر النشطة.' : 'For active merchants scaling their e-commerce storefront.'}
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-stone-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{language === 'ar' ? 'كل ميزات باقة البداية' : 'All Starter features included'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{language === 'ar' ? 'منتجات وطلبات غير محدودة' : 'Unlimited products & orders'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{language === 'ar' ? 'دعم الدومين المخصص (.com)' : 'Custom domain support (.com)'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{language === 'ar' ? 'نظام كوبونات وخصومات متقدم' : 'Advanced coupons & promotions'}</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="#apply-store"
                  className="mt-8 w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs text-center transition-colors shadow-sm"
                >
                  {language === 'ar' ? 'انضم للباقة الآن' : 'Choose Growth Plan'}
                </a>
              </div>

              {/* Plan 3: Enterprise */}
              <div className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    {language === 'ar' ? 'باقة المؤسسات' : 'Enterprise'}
                  </span>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-stone-900 font-brand">$99</span>
                    <span className="text-xs text-stone-400">/{language === 'ar' ? 'شهرياً' : 'month'}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">
                    {language === 'ar' ? 'للشركات الكبرى والمؤسسات التي تحتاج دعماً مخصصاً وسرعات فائقة.' : 'For large enterprises requiring high SLA and custom integration.'}
                  </p>

                  <ul className="mt-6 space-y-3 text-xs text-stone-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'كل ميزات باقة النمو' : 'All Growth features included'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'استضافة وسائط غير محدودة Cloudflare R2' : 'Unlimited Cloudflare R2 image storage'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'دعم فني مخصص على مدار الساعة' : 'Dedicated 24/7 VIP support'}</span>
                    </li>
                  </ul>
                </div>

                <a
                  href="#apply-store"
                  className="mt-8 w-full py-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs text-center transition-colors"
                >
                  {language === 'ar' ? 'تواصل معنا' : 'Contact Enterprise'}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          7. ABOUT US SECTION (#about)
          ========================================================================
        */}
        <section id="about" className="py-20 border-b border-stone-200/80 bg-white/60 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Cropped Emblem */}
            <div className="w-16 h-16 mx-auto mb-4">
              <img src="/bastiyah-emblem.png" alt="بسطية" className="w-full h-full object-contain pointer-events-none" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
              {language === 'ar' ? 'عن المنصة' : 'About Bastiyah'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-1 font-brand">
              {language === 'ar' ? 'قصة ورؤية منصة بسطية' : 'The Story & Vision Behind Bastiyah'}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base mt-4 leading-relaxed font-normal">
              {language === 'ar'
                ? 'استلهمنا اسم (بسطية) من الأسواق العراقية والعربية الأصيلة، حيث كانت كل بسطية تمثل مشروعاً حقيقياً ومصدر رزق لأصحاب الحرف والتجارة. نقلنا هذه الروح إلى الفضاء السحابي الرقمي، لنمكن كل تاجر وشاب وصاحب فكرة من امتلاك بسطية إلكترونية مستقلة برابط خاص وهوية بصرية كاملة دون الحاجة إلى وسطاء.'
                : 'Inspired by authentic marketplace merchants, Bastiyah empowers modern creators, craftspeople, and brands to host independent online storefronts with dedicated subdomains and full visual autonomy.'}
            </p>
          </div>
        </section>

        {/* 
          ========================================================================
          8. CONTACT US SECTION (#contact)
          ========================================================================
        */}
        <section id="contact" className="py-20 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'تواصل معنا' : 'Get in Touch'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 font-brand">
                {language === 'ar' ? 'فريق بسطية جاهز لمساعدتك' : 'The Bastiyah Team is Here to Help'}
              </h2>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-sm">
              {contactSent ? (
                <div className="py-8 text-center animate-in fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-brand font-bold text-lg text-stone-900">
                    {language === 'ar' ? 'تم استلام رسالتك بنجاح' : 'Message Sent Successfully'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1">
                    {language === 'ar' ? 'سنتواصل معك عبر البريد الإلكتروني في أقرب وقت.' : 'We will respond via email shortly.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        {language === 'ar' ? 'الاسم' : 'Your Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder={language === 'ar' ? 'اسمك الكريم' : 'Full name'}
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                      </label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="you@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      {language === 'ar' ? 'الرسالة أو الاستفسار' : 'Your Message'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={language === 'ar' ? 'كيف يمكننا مساعدتك في إطلاق متجرك؟' : 'How can we help you launch your store?'}
                      className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          9. LIVE HOSTED STORES DIRECTORY
          ========================================================================
        */}
        <section id="hosted-stores-directory" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
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

            <a
              href="#apply-store"
              className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto transition-all shadow-sm"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{t.createNewStore}</span>
            </a>
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

      {/* Bastiyah Platform Footer */}
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
