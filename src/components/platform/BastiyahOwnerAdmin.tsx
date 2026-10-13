import React, { useState } from 'react';
import {
  Crown,
  Globe,
  Plus,
  ExternalLink,
  Settings,
  Palette,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Store,
  Layers,
  Sparkles,
  CheckCircle2,
  Search,
  Link2,
  ArrowUpRight,
  Edit3
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreThemeColor, StoreLayoutStyle, HostedStore } from '../../types';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getStoreDisplayUrl, getStorePathLabel, getFutureCustomDomainUrl } from '../../utils/urlUtils';

const EMOJI_OPTIONS = ['🐼', '👑', '🦢', '💎', '🌿', '⚡', '🏺', '👟', '⌚', '🎧', '🕯️', '🛍️'];

const CATEGORY_PRESETS = [
  { en: 'Electronics & Tech', ar: 'إلكترونيات وتقنية' },
  { en: 'Perfumes & Oud', ar: 'عطور وعود فاخر' },
  { en: 'Fashion & Luxury', ar: 'أزياء وفخامة' },
  { en: 'Home & Architecture', ar: 'منزل وديكور' },
  { en: 'Specialty Coffee & Artisan', ar: 'قهوة مختصة وحرفيات' },
];

export const BastiyahOwnerAdmin: React.FC = () => {
  const {
    stores,
    activeStore,
    switchStore,
    goToPlatform,
    createHostedStore,
    updateHostedStore,
    updateStoreDesign,
    deleteHostedStore,
    setAdminTab,
    language,
    setLanguage,
    t,
    addToast,
  } = useStore();

  // Form State for Creating a New Custom Store Link
  const [storeName, setStoreName] = useState('');
  const [storeNameAr, setStoreNameAr] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [tagline, setTagline] = useState('');
  const [taglineAr, setTaglineAr] = useState('');
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [plan, setPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [themeColor, setThemeColor] = useState<StoreThemeColor>('indigo');
  const [layoutStyle, setLayoutStyle] = useState<StoreLayoutStyle>('modern-split');
  const [logoEmoji, setLogoEmoji] = useState('💎');

  // Filter & UI state
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingSlugStoreId, setEditingSlugStoreId] = useState<string | null>(null);
  const [tempSlug, setTempSlug] = useState('');

  // Auto-generate clean slug from storeName unless manually edited
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (!slugManuallyEdited) {
      const auto = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setCustomSlug(auto);
    }
  };

  const handleSlugInput = (val: string) => {
    setSlugManuallyEdited(true);
    const cleaned = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');
    setCustomSlug(cleaned);
  };

  const normalizedSlug = customSlug.replace(/^-|-$/g, '');
  const isSlugTaken = stores.some(
    (s) => s.slug.toLowerCase() === normalizedSlug.toLowerCase()
  );
  const isSlugValid = normalizedSlug.length >= 2 && !isSlugTaken;

  // Platform-wide aggregated metrics
  const totalPlatformStores = stores.length;
  const totalPlatformOrders = stores.reduce((acc, s) => acc + s.orders.length, 0);
  const totalPlatformProducts = stores.reduce((acc, s) => acc + s.products.length, 0);
  const totalPlatformRevenue = stores.reduce(
    (acc, s) =>
      acc +
      s.orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    0
  );

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      addToast(
        language === 'ar' ? 'يرجى إدخال اسم المتجر' : 'Please enter a store name',
        'error'
      );
      return;
    }
    if (!isSlugValid) {
      addToast(
        language === 'ar'
          ? 'يرجى اختيار رابط فرعي صالح وغير مستخدم'
          : 'Please choose a valid, available subdomain slug',
        'error'
      );
      return;
    }

    const chosenCat = CATEGORY_PRESETS[categoryIndex];
    const created = createHostedStore({
      name: storeName,
      nameAr: storeNameAr || storeName,
      slug: normalizedSlug,
      tagline:
        tagline ||
        `Curated ${chosenCat.en} hosted on Bastiyah`,
      taglineAr:
        taglineAr ||
        `أفضل منتجات ${chosenCat.ar} عبر منصة بسطية`,
      category: chosenCat.en,
      categoryAr: chosenCat.ar,
      ownerName: ownerName || 'Store Merchant',
      ownerEmail: ownerEmail || `merchant@${normalizedSlug}.bastiyah.com`,
      plan,
      themeColor,
      layoutStyle,
      logoEmoji,
    });

    // Reset form
    setStoreName('');
    setStoreNameAr('');
    setCustomSlug('');
    setSlugManuallyEdited(false);
    setTagline('');
    setTaglineAr('');
    setOwnerName('');
    setOwnerEmail('');

    // Switch active store to the newly created one so the top bar reflects it immediately
    switchStore(created.id, 'bastiyah-admin');
  };

  const handleCopyStoreLink = (store: HostedStore) => {
    const link = getStoreDisplayUrl(store.slug);
    navigator.clipboard?.writeText(link);
    setCopiedId(store.id);
    addToast(`${t.linkCopied}: ${link}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCustomSlug = (storeId: string) => {
    const cleaned = tempSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-|-$/g, '');
    if (!cleaned || cleaned.length < 2) {
      addToast(language === 'ar' ? 'الرابط قصير جداً' : 'Subdomain is too short', 'error');
      return;
    }
    const duplicate = stores.some(
      (s) => s.id !== storeId && s.slug.toLowerCase() === cleaned
    );
    if (duplicate) {
      addToast(language === 'ar' ? t.slugTaken : t.slugTaken, 'error');
      return;
    }
    updateHostedStore(storeId, { slug: cleaned });
    setEditingSlugStoreId(null);
  };

  const filteredStores = stores.filter((s) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.nameAr.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.ownerName.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    );
  });

  const layoutLabels: Record<StoreLayoutStyle, string> = {
    'modern-split': t.layoutModernSplit,
    'luxury-centered': t.layoutLuxuryCentered,
    'minimal-editorial': t.layoutMinimalEditorial,
    'vibrant-banner': t.layoutVibrantBanner,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Top Platform Navigation Bar */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => goToPlatform('landing')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ar' ? '← العودة للمنصة الرئيسية (bastiyah.vercel.app)' : '← Return to Bastiyah Main Site'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Hero Banner for Platform Owner */}
      <div className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-indigo-950/60 via-slate-950 to-slate-950">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-12 -start-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold mb-4">
                <Crown className="w-3.5 h-3.5" />
                <span>{t.platformSuperAdmin}</span>
                <span className="text-amber-500/60">•</span>
                <span className="font-mono">bastiyah.vercel.app</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <span>{language === 'ar' ? 'لوحة مالك منصة بسطية (Bastiyah)' : 'Bastiyah Platform Owner Control Center'}</span>
              </h1>
              <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
                {t.platformOwnerSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => switchStore(activeStore.id, 'home')}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span>
                  {language === 'ar'
                    ? `معاينة /store/${activeStore.slug}`
                    : `Preview /store/${activeStore.slug}`}
                </span>
              </button>
              <a
                href="#create-custom-link"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t.createNewStore}</span>
              </a>
            </div>
          </div>

          {/* Platform KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.totalHostedStores}
                </span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-2">{totalPlatformStores}</p>
              <p className="text-xs text-emerald-400 mt-1 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>*.bastiyah.vercel.app Vercel SSL Active</span>
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.platformGMV}
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-2">
                ${totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar' ? 'إجمالي مبيعات جميع المتاجر المستضافة' : 'Combined volume across all stores'}
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.platformOrders}
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-2">{totalPlatformOrders}</p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar' ? 'طلبات معالجة عبر شبكة بسطية' : 'Processed across Bastiyah network'}
              </p>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t.platformProducts}
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-white mt-2">{totalPlatformProducts}</p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'ar' ? 'منتجات مستقلة لكل متجر' : 'Isolated catalog items hosted'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN (5 cols): Create New Custom Store Link Generator */}
        <div id="create-custom-link" className="lg:col-span-5">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl sticky top-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">{t.customLinkGenerator}</h2>
                <p className="text-xs text-slate-400">
                  {language === 'ar'
                    ? 'أنشئ رابطاً مخصصاً (storename).bastiyah.com بتصميم وإدارة مستقلة'
                    : 'Provision a new (storename).bastiyah.com link with independent design & admin'}
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4">
              {/* LIVE CUSTOM LINK PREVIEW BOX */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/40 shadow-inner">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    {t.liveLinkPreview}
                  </span>
                  {normalizedSlug.length >= 2 && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSlugTaken
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {isSlugTaken ? (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          {t.slugTaken}
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3" />
                          {t.slugAvailable}
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Custom Subdomain Input */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition-colors" dir="ltr">
                  <span className="text-slate-400 font-mono text-xs select-none">bastiyah.vercel.app/store/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => handleSlugInput(e.target.value)}
                    placeholder="your-store"
                    className="bg-transparent text-emerald-400 font-mono font-bold text-sm focus:outline-none flex-1 min-w-0 px-1"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'ar' ? 'مستقبلاً عند ربط دومين مخصص: (slug).bastiyah.com' : 'Future custom domain: (slug).bastiyah.com'}
                </p>
              </div>

              {/* Store Names (EN & AR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeNameLabel} *
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="e.g. SaharaWatches"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeNameArLabel}
                  </label>
                  <input
                    type="text"
                    value={storeNameAr}
                    onChange={(e) => setStoreNameAr(e.target.value)}
                    placeholder="مثال: ساعات صحارى"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Store Tagline & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeCategoryLabel}
                  </label>
                  <select
                    value={categoryIndex}
                    onChange={(e) => setCategoryIndex(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {CATEGORY_PRESETS.map((cat, idx) => (
                      <option key={cat.en} value={idx}>
                        {language === 'ar' ? cat.ar : cat.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storePlanLabel}
                  </label>
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value as 'Starter' | 'Growth' | 'Enterprise')}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Starter">Starter ($29/mo)</option>
                    <option value="Growth">Growth ($79/mo)</option>
                    <option value="Enterprise">Enterprise ($199/mo)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t.storeTaglineLabel}
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'وصف مختصر يظهر في واجهة المتجر...'
                      : 'Short hero headline for this store...'
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Owner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeOwnerNameLabel}
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Merchant Name"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeOwnerEmailLabel}
                  </label>
                  <input
                    type="email"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    placeholder={`merchant@${normalizedSlug || 'store'}.com`}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Store Design Customization Section */}
              <div className="pt-3 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <Palette className="w-4 h-4" />
                  <span>{t.designAndTheme}</span>
                </div>

                {/* Color Palette Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {t.themeColorLabel}
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {(Object.keys(THEME_CONFIGS) as StoreThemeColor[]).map((colorKey) => {
                      const cfg = THEME_CONFIGS[colorKey];
                      const active = themeColor === colorKey;
                      return (
                        <button
                          key={colorKey}
                          type="button"
                          onClick={() => setThemeColor(colorKey)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                            active
                              ? 'border-white bg-slate-800 scale-105 shadow-md'
                              : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                          }`}
                        >
                          <span
                            className="w-6 h-6 rounded-full shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: cfg.hex }}
                          >
                            {active && <Check className="w-3.5 h-3.5 text-white" />}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300 capitalize">
                            {language === 'ar' ? cfg.nameAr.split(' ')[0] : colorKey}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Layout Style Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {t.layoutStyleLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        'modern-split',
                        'luxury-centered',
                        'minimal-editorial',
                        'vibrant-banner',
                      ] as StoreLayoutStyle[]
                    ).map((style) => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => setLayoutStyle(style)}
                        className={`px-3 py-2 rounded-xl border text-xs font-bold text-start transition-all ${
                          layoutStyle === style
                            ? 'border-indigo-500 bg-indigo-500/15 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {layoutLabels[style]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Emoji Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    {t.logoEmojiLabel}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {EMOJI_OPTIONS.map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => setLogoEmoji(emo)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg border transition-all ${
                          logoEmoji === emo
                            ? 'border-indigo-500 bg-indigo-500/20 scale-110'
                            : 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                        }`}
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isSlugValid || !storeName.trim()}
                className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.launchStoreBtn}</span>
                {normalizedSlug && (
                  <span className="font-mono text-xs bg-black/25 px-2 py-0.5 rounded-md">
                    {normalizedSlug}.bastiyah.vercel.app
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Hosted Web-Stores Directory & Management */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>{t.hostedStoresTitle}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {stores.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'كل متجر يمتلك رابطه الفرعي المستقل، تصميمه الخاص، ولوحة تحكم خاصة به'
                  : 'Every hosted store operates on its own .bastiyah.vercel.app link with independent design & admin panel'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث عن متجر أو رابط...' : 'Search stores or links...'}
                className="w-full ps-9 pe-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Hosted Store Cards */}
          <div className="space-y-4">
            {filteredStores.map((store) => {
              const storeTheme = THEME_CONFIGS[store.design.themeColor] || THEME_CONFIGS.emerald;
              const storeRevenue = store.orders
                .filter((o) => o.status !== 'cancelled')
                .reduce((sum, o) => sum + o.total, 0);
              const isCurrent = store.id === activeStore.id;

              return (
                <div
                  key={store.id}
                  className={`bg-slate-900 border rounded-3xl p-6 transition-all ${
                    isCurrent
                      ? 'border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-xl shadow-indigo-950/50'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Row: Store Identity + Custom Link */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg shrink-0 border border-white/10"
                        style={{ backgroundColor: `${storeTheme.hex}25` }}
                      >
                        {store.design.logoEmoji}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-white">
                            {language === 'ar' ? store.nameAr || store.name : store.name}
                          </h3>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {store.plan}
                          </span>
                          <span
                            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                              store.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {store.status === 'active' ? t.statusActive : t.statusMaintenance}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 mt-1">
                          {language === 'ar' ? store.taglineAr || store.tagline : store.tagline}
                        </p>

                        {/* Custom Subdomain Link Pill */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {editingSlugStoreId === store.id ? (
                            <div className="flex items-center gap-1.5 bg-slate-950 border border-indigo-500 rounded-xl px-2.5 py-1" dir="ltr">
                              <span className="text-xs font-mono text-slate-400">bastiyah.vercel.app/store/</span>
                              <input
                                type="text"
                                value={tempSlug}
                                onChange={(e) => setTempSlug(e.target.value)}
                                className="bg-transparent text-emerald-400 font-mono text-xs font-bold focus:outline-none w-28"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveCustomSlug(store.id)}
                                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold"
                              >
                                {language === 'ar' ? 'حفظ' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingSlugStoreId(null)}
                                className="px-1.5 py-0.5 text-slate-400 hover:text-white text-[11px]"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 group">
                              <Globe className="w-3.5 h-3.5 text-emerald-400" />
                              <button
                                onClick={() => switchStore(store.id, 'home')}
                                className="font-mono text-xs text-slate-300 hover:text-white transition-colors"
                                dir="ltr"
                              >
                                /store/<strong className="text-emerald-400 font-bold">{store.slug}</strong>
                              </button>
                              <button
                                onClick={() => handleCopyStoreLink(store)}
                                className="text-slate-500 hover:text-white transition-colors"
                                title="Copy Link"
                              >
                                {copiedId === store.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSlugStoreId(store.id);
                                  setTempSlug(store.slug);
                                }}
                                className="text-slate-500 hover:text-indigo-400 transition-colors"
                                title={language === 'ar' ? 'تعديل الرابط الفرعي' : 'Edit Custom Subdomain Link'}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <span className="text-xs text-slate-500">
                            {language === 'ar' ? 'المالك:' : 'Owner:'}{' '}
                            <strong className="text-slate-300">{store.ownerName}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    {stores.length > 1 && (
                      <button
                        onClick={() => deleteHostedStore(store.id)}
                        className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors self-end sm:self-start"
                        title={t.deleteStore}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Middle Row: Store Metrics + Quick Theme & Design Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/70">
                      <span className="text-[11px] text-slate-400 block">{t.products}</span>
                      <span className="text-base font-black text-white">
                        {store.products.length} {t.itemsCount}
                      </span>
                    </div>
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/70">
                      <span className="text-[11px] text-slate-400 block">{t.orders}</span>
                      <span className="text-base font-black text-white">{store.orders.length}</span>
                    </div>
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/70">
                      <span className="text-[11px] text-slate-400 block">{t.totalRevenue}</span>
                      <span className="text-base font-black text-emerald-400">
                        ${storeRevenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/70">
                      <span className="text-[11px] text-slate-400 block">{t.layoutStyleLabel}</span>
                      <span className="text-xs font-bold text-indigo-300 truncate block mt-0.5">
                        {layoutLabels[store.design.layoutStyle]}
                      </span>
                    </div>
                  </div>

                  {/* Quick Design Swatch Switcher + Action Buttons */}
                  <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Quick Theme Switcher for this store */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Palette className="w-3.5 h-3.5 text-slate-500" />
                        {language === 'ar' ? 'لون الهوية:' : 'Theme:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(Object.keys(THEME_CONFIGS) as StoreThemeColor[]).map((cKey) => {
                          const cfg = THEME_CONFIGS[cKey];
                          const isSelectedColor = store.design.themeColor === cKey;
                          return (
                            <button
                              key={cKey}
                              onClick={() => updateStoreDesign({ themeColor: cKey }, store.id)}
                              className={`w-5 h-5 rounded-full transition-transform ${
                                isSelectedColor ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: cfg.hex }}
                              title={cfg.name}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Storefront & Isolated Store Admin Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => {
                          switchStore(store.id, 'admin');
                          setAdminTab('design');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Palette className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{t.storeDesignTab}</span>
                      </button>

                      <button
                        onClick={() => {
                          switchStore(store.id, 'admin');
                          setAdminTab('dashboard');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{t.manageStore}</span>
                      </button>

                      <button
                        onClick={() => switchStore(store.id, 'home')}
                        className="px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                        style={{ backgroundColor: storeTheme.hex }}
                      >
                        <span>{t.visitStore}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
