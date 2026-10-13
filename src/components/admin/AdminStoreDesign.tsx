import React, { useState, useEffect } from 'react';
import {
  Palette,
  Globe,
  Layout,
  Check,
  Sparkles,
  ExternalLink,
  Copy,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreThemeColor, StoreLayoutStyle } from '../../types';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getStoreDisplayUrl, getStorePathLabel, getCustomDomainRoot, getFutureCustomDomainUrl } from '../../utils/urlUtils';

const EMOJI_CHOICES = ['🐼', '👑', '🦢', '💎', '🌿', '⚡', '🏺', '👟', '⌚', '🎧', '🕯️', '🛍️', '🚀', '🌸', '☕', '🎮'];

export const AdminStoreDesign: React.FC = () => {
  const {
    stores,
    activeStore,
    updateHostedStore,
    updateStoreDesign,
    setCurrentPage,
    language,
    t,
    addToast,
  } = useStore();

  const [slug, setSlug] = useState(activeStore.slug);
  const [name, setName] = useState(activeStore.name);
  const [nameAr, setNameAr] = useState(activeStore.nameAr);
  const [tagline, setTagline] = useState(activeStore.tagline);
  const [taglineAr, setTaglineAr] = useState(activeStore.taglineAr);

  useEffect(() => {
    setSlug(activeStore.slug);
    setName(activeStore.name);
    setNameAr(activeStore.nameAr);
    setTagline(activeStore.tagline);
    setTaglineAr(activeStore.taglineAr);
  }, [activeStore]);

  const normalizedSlug = slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const isSlugDuplicate = stores.some(
    (s) => s.id !== activeStore.id && s.slug.toLowerCase() === normalizedSlug
  );

  const handleSaveIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizedSlug || normalizedSlug.length < 2 || isSlugDuplicate) {
      addToast(
        language === 'ar'
          ? 'الرابط الفرعي غير متاح أو قصير جداً'
          : 'Subdomain slug is unavailable or too short',
        'error'
      );
      return;
    }
    updateHostedStore(activeStore.id, {
      slug: normalizedSlug,
      name: name.trim() || activeStore.name,
      nameAr: nameAr.trim() || name.trim(),
      tagline: tagline.trim(),
      taglineAr: taglineAr.trim() || tagline.trim(),
    });
  };

  const layoutOptions: {
    id: StoreLayoutStyle;
    title: string;
    desc: string;
  }[] = [
    {
      id: 'modern-split',
      title: t.layoutModernSplit,
      desc:
        language === 'ar'
          ? 'بطل مقسم عصري مع بطاقة منتج عائمة وتأثيرات زجاجية'
          : 'Split-screen hero with floating product showcase & glassmorphic badges',
    },
    {
      id: 'luxury-centered',
      title: t.layoutLuxuryCentered,
      desc:
        language === 'ar'
          ? 'تصميم ملكي متمركز مناسب للعطور الفاخرة والمجوهرات'
          : 'Regal centered typography & opulent dark gold accents for luxury brands',
    },
    {
      id: 'minimal-editorial',
      title: t.layoutMinimalEditorial,
      desc:
        language === 'ar'
          ? 'تصميم تحريري بسيط وهادئ مستوحى من دور الأزياء العالمية'
          : 'Clean, high-fashion editorial layout with crisp borders and airy spacing',
    },
    {
      id: 'vibrant-banner',
      title: t.layoutVibrantBanner,
      desc:
        language === 'ar'
          ? 'واجهة جريئة متدرجة الألوان مع إبراز العروض الحصرية'
          : 'High-energy full-bleed color gradient banner for high-conversion campaigns',
    },
  ];

  const currentThemeConfig = THEME_CONFIGS[activeStore.design.themeColor];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Palette className="w-3.5 h-3.5" />
            <span>{t.storeDesignStudio}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {language === 'ar'
              ? `تخصيص تصميم وهوية: ${activeStore.nameAr || activeStore.name}`
              : `Design & Custom Link: ${activeStore.name}`}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{t.storeDesignSubtitle}</p>
        </div>

        <button
          onClick={() => setCurrentPage('home')}
          className="px-5 py-3 rounded-2xl text-white font-bold text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02] self-start sm:self-auto"
          style={{ backgroundColor: currentThemeConfig.hex }}
        >
          <span>{t.visitStore}</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Cols: Custom Subdomain Link & Store Brand Identity */}
        <div className="lg:col-span-6 space-y-6">
          <form
            onSubmit={handleSaveIdentity}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                <span>
                  {language === 'ar'
                    ? 'الرابط المخصص وهوية المتجر المستقلة'
                    : 'Dedicated Store Link & Brand Identity'}
                </span>
              </h2>
            </div>

            {/* Custom Subdomain Box */}
            <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">{t.storeSlugLabel}</span>
                {normalizedSlug.length >= 2 && (
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${
                      isSlugDuplicate ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {isSlugDuplicate ? (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t.slugTaken}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t.slugAvailable}
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5" dir="ltr">
                <span className="text-slate-400 font-mono text-sm">
                  {getCustomDomainRoot() ? 'https://' : 'bastiyah.vercel.app/store/'}
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent text-emerald-400 font-mono font-bold text-sm focus:outline-none flex-1 px-1"
                />
                {getCustomDomainRoot() && (
                  <span className="text-slate-400 font-mono text-sm">.{getCustomDomainRoot()}</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    const fullUrl = getStoreDisplayUrl(normalizedSlug);
                    navigator.clipboard?.writeText(fullUrl);
                    addToast(`${t.linkCopied}: ${fullUrl}`, 'info');
                  }}
                  className="ms-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy Working Link"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-emerald-400/90 font-mono" dir="ltr">
                {getStoreDisplayUrl(normalizedSlug)}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.storeNameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.storeNameArLabel}
                </label>
                <input
                  type="text"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.storeTaglineLabel} (EN)
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {t.storeTaglineArLabel}
              </label>
              <input
                type="text"
                value={taglineAr}
                onChange={(e) => setTaglineAr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Logo Icon Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {t.logoEmojiLabel}
              </label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_CHOICES.map((emo) => (
                  <button
                    key={emo}
                    type="button"
                    onClick={() => updateStoreDesign({ logoEmoji: emo })}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      activeStore.design.logoEmoji === emo
                        ? 'border-indigo-600 bg-indigo-50 scale-110 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors"
            >
              {t.saveSettings}
            </button>
          </form>
        </div>

        {/* Right 6 Cols: Theme Palette & Hero Layout Style */}
        <div className="lg:col-span-6 space-y-6">
          {/* Color Palette Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t.themeColorLabel}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.keys(THEME_CONFIGS) as StoreThemeColor[]).map((colorKey) => {
                const cfg = THEME_CONFIGS[colorKey];
                const isSelected = activeStore.design.themeColor === colorKey;
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => updateStoreDesign({ themeColor: colorKey })}
                    className={`p-3.5 rounded-2xl border text-start transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                    }`}
                  >
                    <span
                      className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: cfg.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {language === 'ar' ? cfg.nameAr : cfg.name}
                      </p>
                      <p className={`text-[10px] font-mono ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {cfg.hex}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Header Style & Card Corner Radius */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t.headerStyleLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateStoreDesign({ headerStyle: 'light' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      activeStore.design.headerStyle === 'light'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.headerLight}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStoreDesign({ headerStyle: 'dark' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      activeStore.design.headerStyle === 'dark'
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {t.headerDark}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  {t.cardStyleLabel}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['rounded', 'pill', 'sharp'] as const).map((rad) => (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => updateStoreDesign({ cardRadius: rad })}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold capitalize ${
                        activeStore.design.cardRadius === rad
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {rad}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Storefront Layout Style Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-600" />
              <span>{t.layoutStyleLabel}</span>
            </h2>

            <div className="space-y-3">
              {layoutOptions.map((opt) => {
                const active = activeStore.design.layoutStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateStoreDesign({ layoutStyle: opt.id })}
                    className={`w-full p-4 rounded-2xl border text-start transition-all flex items-start justify-between gap-4 ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{opt.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        active ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                      }`}
                    >
                      {active && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
