import React, { useState, useEffect, useRef } from 'react';
import {
  Palette,
  Globe,
  Layout,
  Check,
  Sparkles,
  ExternalLink,
  Copy,
  ShieldCheck,
  AlertCircle,
  Cloud,
  MessageCircle,
  Instagram,
  Twitter,
  Image as ImageIcon,
  Save,
  Radio,
  Eye,
  Megaphone,
  QrCode,
  Upload,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreThemeColor, StoreLayoutStyle } from '../../types';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getStoreDisplayUrl, getStorePathLabel, getCustomDomainRoot, getFutureCustomDomainUrl } from '../../utils/urlUtils';
import { StoreQrCodeModal } from '../common/StoreQrCodeModal';
import { uploadImageToR2, validateImageFile } from '../../utils/cloudflareR2';
import { HeroSectionEditor } from './HeroSectionEditor';
import { TrustBadgesEditor } from './TrustBadgesEditor';
import { StoreHeroSlider } from '../store/StoreHeroSlider';

const EMOJI_CHOICES = ['🐼', '👑', '🦢', '💎', '🌿', '⚡', '🏺', '👟', '⌚', '🎧', '🕯️', '🛍️', '🚀', '🌸', '☕', '🎮', '📱', '🍫', '💐', '🍯'];

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
    theme
  } = useStore();

  const [slug, setSlug] = useState(activeStore.slug);
  const [name, setName] = useState(activeStore.name);
  const [nameAr, setNameAr] = useState(activeStore.nameAr);
  const [tagline, setTagline] = useState(activeStore.tagline);
  const [taglineAr, setTaglineAr] = useState(activeStore.taglineAr);

  // Social & announcement state
  const [showAnnouncementBar, setShowAnnouncementBar] = useState<boolean>(activeStore.design.showAnnouncementBar ?? false);
  const [announcementText, setAnnouncementText] = useState(activeStore.design.announcementText || '');
  const [announcementTextAr, setAnnouncementTextAr] = useState(activeStore.design.announcementTextAr || '');
  const [whatsappNumber, setWhatsappNumber] = useState(activeStore.design.whatsappNumber || '');
  const [instagramUrl, setInstagramUrl] = useState(activeStore.design.instagramUrl || '');
  const [tiktokUrl, setTiktokUrl] = useState(activeStore.design.tiktokUrl || '');
  const [customLogoUrl, setCustomLogoUrl] = useState(activeStore.design.customLogoUrl || '');

  // Direct Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    setSlug(activeStore.slug);
    setName(activeStore.name);
    setNameAr(activeStore.nameAr);
    setTagline(activeStore.tagline);
    setTaglineAr(activeStore.taglineAr);
    setShowAnnouncementBar(activeStore.design.showAnnouncementBar ?? false);
    setAnnouncementText(activeStore.design.announcementText || '');
    setAnnouncementTextAr(activeStore.design.announcementTextAr || '');
    setWhatsappNumber(activeStore.design.whatsappNumber || '');
    setInstagramUrl(activeStore.design.instagramUrl || '');
    setTiktokUrl(activeStore.design.tiktokUrl || '');
    setCustomLogoUrl(activeStore.design.customLogoUrl || '');
  }, [activeStore]);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processLogoUpload(e.target.files[0]);
    }
  };

  const processLogoUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      addToast(validation.error || 'الملف غير صالح', 'error');
      return;
    }

    try {
      setIsUploadingLogo(true);
      setLogoUploadProgress(15);
      const result = await uploadImageToR2(file, {
        storeSlug: activeStore?.slug,
        onProgress: (p) => setLogoUploadProgress(p),
      });

      setCustomLogoUrl(result.url);
      updateStoreDesign({ customLogoUrl: result.url });
      addToast(
        language === 'ar' ? 'تم رفع وحفظ شعار المتجر بنجاح!' : 'Store logo uploaded and saved successfully!',
        'success'
      );
    } catch (err: any) {
      console.error('Logo upload failed:', err);
      addToast(err.message || 'فشل رفع الشعار', 'error');
    } finally {
      setIsUploadingLogo(false);
      setLogoUploadProgress(0);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setCustomLogoUrl('');
    updateStoreDesign({ customLogoUrl: undefined });
    addToast(
      language === 'ar' ? 'تمت إزالة الشعار واستعادة أيقونة الإيموجي' : 'Logo removed, reverted to emoji icon',
      'info'
    );
  };

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

    // Save design enhancements
    updateStoreDesign({
      customLogoUrl: customLogoUrl.trim() || undefined,
      showAnnouncementBar,
      announcementText: showAnnouncementBar ? announcementText.trim() || undefined : undefined,
      announcementTextAr: showAnnouncementBar ? announcementTextAr.trim() || undefined : undefined,
      whatsappNumber: whatsappNumber.trim() || undefined,
      instagramUrl: instagramUrl.trim() || undefined,
      tiktokUrl: tiktokUrl.trim() || undefined,
    });

    addToast(
      language === 'ar' ? 'تم حفظ هوية ومظهر المتجر بنجاح!' : 'Store identity & appearance saved successfully!',
      'success'
    );
  };

  const layoutOptions: {
    id: StoreLayoutStyle;
    titleEn: string;
    titleAr: string;
    descEn: string;
    descAr: string;
  }[] = [
    {
      id: 'modern-split',
      titleEn: 'Modern Split Hero',
      titleAr: 'عصري مقسوم (Modern Split)',
      descEn: 'Hero with dual action CTA and high-converting featured cards',
      descAr: 'واجهة عصرية مع عرض بارز للمنتجات ومساحة إعلانية واسعة',
    },
    {
      id: 'luxury-centered',
      titleEn: 'Luxury Centered',
      titleAr: 'فخامة ملكية (Luxury Centered)',
      descEn: 'Symmetrical centered branding tailored for perfumes, jewelry & luxury',
      descAr: 'تصميم أنيق متناظر للماركات الفاخرة، العطور، والمجوهرات',
    },
    {
      id: 'minimal-editorial',
      titleEn: 'Minimal Editorial',
      titleAr: 'بسيط وهادئ (Minimal Editorial)',
      descEn: 'Clean high-fashion editorial layout emphasizing product imagery',
      descAr: 'تنسيق ناعم يركز على صور المنتجات ونقاء التفاصيل',
    },
    {
      id: 'vibrant-banner',
      titleEn: 'Vibrant Dynamic Banner',
      titleAr: 'حيوي وديناميكي (Vibrant Banner)',
      descEn: 'Bold gradient backdrop with high-energy urgency prompts',
      descAr: 'خلفية متدرجة حيوية تلفت الأنظار وتزيد من سرعة التفاعل',
    },
  ];

  const handleCopyLink = () => {
    const storeUrl = getStoreDisplayUrl(activeStore.slug, false);
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    addToast(language === 'ar' ? 'تم نسخ الرابط بنجاح!' : 'Link copied!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'تخصيص مظهر وهوية المتجر' : t.storeDesignTab}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'ar' ? 'اختر ألوان الهوية، الشعار، التنسيق، وروابط التواصل الخاصة بمتجرك' : 'Customize theme colors, layout styles, branding, and social connections'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'ar' ? 'رمز QR للمتجر' : 'Store QR'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'معاينة المتجر المباشر' : 'Preview Store'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Store URL, Identity, and Branding */}
        <div className="lg:col-span-7 space-y-8">
          {/* Identity & Subdomain Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Globe className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'الرابط الخاص وهوية المتجر' : 'Dedicated Store Link & Identity'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'رابطك المستقل على بسطية الذي يشاركه عملاؤك' : 'Your customer-facing unique URL'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveIdentity} className="space-y-5">
              {/* Store Subdomain Slug */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'معرف الرابط الخاص (Slug) *' : 'Store Subdomain Slug *'}
                </label>
                <div className="relative">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white">
                    <span className="px-3 text-slate-400 font-mono text-xs select-none">
                      https://
                    </span>
                    <input
                      type="text"
                      dir="ltr"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="mystore"
                      className="py-2.5 px-1 bg-transparent font-mono font-bold text-slate-900 text-xs sm:text-sm flex-1 focus:outline-none"
                    />
                    <span className="px-3 text-emerald-700 font-mono font-bold text-xs select-none bg-emerald-50/50 py-2.5 border-s border-slate-200">
                      .{getCustomDomainRoot()}
                    </span>
                  </div>
                </div>

                {isSlugDuplicate ? (
                  <p className="text-[11px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'هذا المعرف محجوز لمتجر آخر، اختر معرفاً مختلفاً.' : 'This slug is already in use by another store.'}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ar' ? 'رابط متجرك سيكون جاهزاً للطلب والتسوق فوراً' : 'Live storefront URL ready for customers'}</span>
                  </p>
                )}
              </div>

              {/* Store Names (AR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم المتجر (بالعربية) *' : 'Store Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={nameAr}
                    onChange={(e) => setNameAr(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم المتجر (بالإنجليزية) *' : 'Store Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Taglines (AR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الشعار اللفظي للمتجر (عربي)' : 'Tagline (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={taglineAr}
                    onChange={(e) => setTaglineAr(e.target.value)}
                    placeholder="وجهتك الأولى للأناقة العصرية"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الشعار اللفظي للمتجر (إنجليزي)' : 'Tagline (English)'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Premium lifestyle & luxury goods"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Optional Announcement Bar Card */}
              <div className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/70 space-y-3.5 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl transition-colors ${showAnnouncementBar ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-500'}`}>
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {language === 'ar' ? 'شريط الإعلانات أعلى المتجر' : 'Top Announcement Bar'}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                          {language === 'ar' ? 'اختياري' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {language === 'ar' ? 'إظهار أو إخفاء شريط العروض والشحن المجاني أعلى المتجر' : 'Show or hide the promo banner at the top of your store'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const next = !showAnnouncementBar;
                      setShowAnnouncementBar(next);
                      updateStoreDesign({ showAnnouncementBar: next });
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      showAnnouncementBar ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={showAnnouncementBar}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        showAnnouncementBar
                          ? (language === 'ar' ? '-translate-x-5' : 'translate-x-5')
                          : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {showAnnouncementBar ? (
                  <div className="space-y-3 pt-3 border-t border-slate-200/70 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {language === 'ar' ? 'نص الإعلان (بالعربية)' : 'Announcement Text (Arabic)'}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={announcementTextAr}
                        onChange={(e) => setAnnouncementTextAr(e.target.value)}
                        placeholder="مثال: شحن مجاني لكافة الطلبات فوق 50 دولار بمناسبة الإطلاق!"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                        {language === 'ar' ? 'نص الإعلان (بالإنجليزية - اختياري)' : 'Announcement Text (English - Optional)'}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        placeholder="e.g. Free express delivery on orders over $50!"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-400 bg-white/60 p-2.5 rounded-xl border border-dashed border-slate-200 text-center">
                    {language === 'ar' ? '🚫 شريط الإعلانات معطل حالياً ولن يظهر للعملاء' : '🚫 Announcement bar is currently disabled and hidden from customers'}
                  </div>
                )}
              </div>

              {/* Social Connections */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-900 block mb-3">
                  {language === 'ar' ? 'قنوات التواصل مع العملاء' : 'Customer Contact & Social Channels'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                      <span>واتساب المتجر</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="9647XXXXXXXX"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                      <Instagram className="w-3 h-3 text-pink-600" />
                      <span>انستغرام (Instagram)</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="@mystore"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1 flex items-center gap-1">
                      <Twitter className="w-3 h-3 text-sky-500" />
                      <span>تيك توك / تويتر</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="@mystore"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSlugDuplicate}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'حفظ إعدادات الهوية' : 'Save Identity'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Store Layout Style Selection */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Layout className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'تنسيق الصفحة الرئيسية (Layout Style)' : 'Storefront Layout Style'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'اختر النمط البصري المناسب لنوع منتجات متجرك' : 'Select structural template matching your industry'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {layoutOptions.map((opt) => {
                const isSelected = activeStore.design.layoutStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => updateStoreDesign({ layoutStyle: opt.id })}
                    className={`p-4 rounded-2xl border text-start transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-xs ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {language === 'ar' ? opt.titleAr : opt.titleEn}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {language === 'ar' ? opt.descAr : opt.descEn}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero Section / Banner Slider Section Editor */}
          <HeroSectionEditor />

          {/* Storefront Trust Badges & Value Props Editor */}
          <TrustBadgesEditor />
        </div>

        {/* Right Column: Theme Color, Logo Emoji/Image, and Header Style */}
        <div className="lg:col-span-5 space-y-8">
          {/* Theme Color Picker */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Palette className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'ألوان هوية المتجر (Theme Color)' : 'Brand Theme Palette'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'اللون المميز للأزرار والشارات في متجرك' : 'Accent theme color for CTA & badges'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(THEME_CONFIGS) as StoreThemeColor[]).map((cKey) => {
                const conf = THEME_CONFIGS[cKey];
                const isSelected = activeStore.design.themeColor === cKey;
                return (
                  <button
                    key={cKey}
                    onClick={() => updateStoreDesign({ themeColor: cKey })}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-slate-900 bg-slate-50 shadow-xs ring-2 ring-slate-900/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full shadow-xs shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: conf.hex }}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </span>
                    <span className="font-bold text-xs text-slate-800">
                      {language === 'ar' ? conf.nameAr : conf.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logo Upload & Brand Identity */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'ar' ? 'شعار المتجر (رفع ملف مباشر)' : 'Store Logo (Direct File Upload)'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'ارفع صورة الشعار الرسمية لمتجرك أو اختر أيقونة إيموجي' : 'Upload your official brand logo or use an emoji emblem'}
                  </p>
                </div>
              </div>

              {customLogoUrl && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {language === 'ar' ? 'شعار مرفوع' : 'Uploaded'}
                </span>
              )}
            </div>

            {/* Direct File Upload Zone */}
            {customLogoUrl ? (
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    {language === 'ar' ? 'الشعار المعتمد حالياً:' : 'Active Uploaded Logo:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'تغيير الشعار' : 'Replace'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title={language === 'ar' ? 'إزالة الشعار' : 'Remove Logo'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dual Background Preview: Light & Dark Header Contrast */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-center shadow-xs">
                    <div className="w-16 h-16 flex items-center justify-center p-1 bg-slate-50 rounded-lg border border-slate-100">
                      <img
                        src={customLogoUrl}
                        alt="Store Logo Light"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {language === 'ar' ? 'على شريط فاتح' : 'On light header'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex flex-col items-center justify-center gap-1.5 text-center shadow-xs">
                    <div className="w-16 h-16 flex items-center justify-center p-1 bg-slate-900 rounded-lg border border-slate-800">
                      <img
                        src={customLogoUrl}
                        alt="Store Logo Dark"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {language === 'ar' ? 'على شريط داكن' : 'On dark header'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !isUploadingLogo && logoInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isUploadingLogo
                    ? 'border-purple-400 bg-purple-50/50'
                    : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/20 bg-slate-50/50'
                }`}
              >
                {isUploadingLogo ? (
                  <div className="py-2 space-y-2">
                    <Loader2 className="w-7 h-7 text-purple-600 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      {language === 'ar' ? 'جاري رفع الشعار...' : 'Uploading logo...'}
                    </p>
                    <div className="w-36 mx-auto bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${logoUploadProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {language === 'ar' ? 'اضغط لرفع ملف الشعار من جهازك' : 'Click to upload your logo file'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {language === 'ar'
                        ? 'PNG (مفضل بخلفية شفافة), SVG, JPG, WebP (حتى 10MB)'
                        : 'PNG (transparent recommended), SVG, JPG, WebP (up to 10MB)'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Hidden native file input */}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/avif"
              onChange={handleLogoFileChange}
              className="hidden"
            />

            {/* Emoji Fallback Picker (When no logo image is uploaded) */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  {language === 'ar' ? 'أو استخدم أيقونة إيموجي كشعار:' : 'Or use an emoji emblem as logo:'}
                </span>
                {customLogoUrl && (
                  <span className="text-[10px] text-slate-400">
                    ({language === 'ar' ? 'الشعار المرفوع له الأولوية' : 'Uploaded logo takes priority'})
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-2">
                {EMOJI_CHOICES.map((emoji) => {
                  const isSelected = activeStore.design.logoEmoji === emoji && !customLogoUrl;
                  return (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        updateStoreDesign({ logoEmoji: emoji });
                      }}
                      className={`h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md scale-105 ring-2 ring-purple-500'
                          : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{emoji}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Header Style */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'نمط الشريط العلوي (Header)' : 'Header Style'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'خلفية شفافة فاتحة أو داكنة أنيقة' : 'Light glass or dark slate theme'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => updateStoreDesign({ headerStyle: 'light' })}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  activeStore.design.headerStyle === 'light'
                    ? 'border-slate-900 bg-slate-50 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">{language === 'ar' ? 'فاتح أنيق (Light)' : 'Light Glass'}</span>
              </button>

              <button
                onClick={() => updateStoreDesign({ headerStyle: 'dark' })}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  activeStore.design.headerStyle === 'dark'
                    ? 'border-slate-900 bg-slate-900 text-white font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs block">{language === 'ar' ? 'داكن ملكي (Dark)' : 'Dark Obsidian'}</span>
              </button>
            </div>
          </div>

          {/* Card Corner Radius */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'انحناء زوايا البطاقات (Card Radius)' : 'Card Corner Radius'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'شكل حواف بطاقات المنتجات والأزرار' : 'Shape of product cards and UI elements'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => updateStoreDesign({ cardRadius: 'rounded' })}
                className={`p-3 rounded-xl border text-center transition-all ${
                  activeStore.design.cardRadius === 'rounded'
                    ? 'border-slate-900 bg-slate-50 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-6 h-6 border-2 border-slate-400 rounded-lg mx-auto mb-1.5" />
                <span className="text-[11px] block">{language === 'ar' ? 'عصري (Rounded)' : 'Rounded'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateStoreDesign({ cardRadius: 'pill' })}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  activeStore.design.cardRadius === 'pill'
                    ? 'border-slate-900 bg-slate-50 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-6 h-6 border-2 border-slate-400 rounded-full mx-auto mb-1.5" />
                <span className="text-[11px] block">{language === 'ar' ? 'ناعم (Pill)' : 'Pill Curved'}</span>
              </button>

              <button
                type="button"
                onClick={() => updateStoreDesign({ cardRadius: 'sharp' })}
                className={`p-3 rounded-none border text-center transition-all ${
                  activeStore.design.cardRadius === 'sharp'
                    ? 'border-slate-900 bg-slate-50 font-bold shadow-2xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="w-6 h-6 border-2 border-slate-400 rounded-none mx-auto mb-1.5" />
                <span className="text-[11px] block">{language === 'ar' ? 'حاد (Sharp)' : 'Sharp'}</span>
              </button>
            </div>
          </div>

          {/* Real-Time Live Mockup Card */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'المعاينة المباشرة لتخصيصاتك' : 'Live Real-Time Storefront Mockup'}
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {language === 'ar' ? 'تحديث تلقائي' : 'Auto synced'}
              </span>
            </div>

            {/* Mockup Container */}
            <div className="rounded-2xl border-2 border-slate-800 bg-slate-900 p-2 shadow-inner">
              {/* Browser Bar */}
              <div className="flex items-center gap-1.5 px-2 py-1 mb-2 bg-slate-800 rounded-lg text-[10px] text-slate-300 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="ms-2 truncate text-slate-400">https://{normalizedSlug || activeStore.slug}.bastiyah.com</span>
              </div>

              {/* Mock Storefront Screen */}
              <div className="bg-slate-50 rounded-xl overflow-hidden text-slate-900 shadow-sm">
                {/* Announcement Bar (Optional) */}
                {showAnnouncementBar && (
                  <div 
                    className="py-1 px-3 text-[10px] text-white text-center font-bold truncate transition-colors animate-in fade-in"
                    style={{ backgroundColor: theme.hex }}
                  >
                    {announcementTextAr || announcementText || (language === 'ar' ? 'شحن مجاني لكافة الطلبات فوق 50$!' : 'Free shipping on orders over $50!')}
                  </div>
                )}

                {/* Header */}
                <div className={`p-3 border-b border-slate-200/80 flex items-center justify-between ${
                  activeStore.design.headerStyle === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow-2xs overflow-hidden"
                      style={{ backgroundColor: `${theme.hex}20` }}
                    >
                      {customLogoUrl ? (
                        <img src={customLogoUrl} alt="" className="w-full h-full object-contain p-0.5" />
                      ) : (
                        <span>{activeStore.design.logoEmoji}</span>
                      )}
                    </div>
                    <span className="font-black text-xs truncate max-w-[120px]">
                      {language === 'ar' ? nameAr || name : name}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {language === 'ar' ? 'السلة (0)' : 'Cart (0)'}
                  </span>
                </div>

                {/* Hero Preview or Fallback Card */}
                {activeStore.design.heroConfig?.enabled ? (
                  <StoreHeroSlider config={activeStore.design.heroConfig} isPreview={true} />
                ) : (
                  <div className="p-4 space-y-3">
                    <div 
                      className={`p-3 text-white text-start transition-all ${
                        activeStore.design.cardRadius === 'pill' ? 'rounded-2xl' : activeStore.design.cardRadius === 'sharp' ? 'rounded-none' : 'rounded-xl'
                      }`}
                      style={{ backgroundColor: theme.hex }}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-90">
                        {language === 'ar' ? 'التشكيلة الجديدة' : 'New Collection'}
                      </span>
                      <span className="text-xs font-black block mt-0.5">
                        {language === 'ar' ? taglineAr || tagline : tagline}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {language === 'ar' ? `النمط: ${activeStore.design.layoutStyle}` : `Layout: ${activeStore.design.layoutStyle}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentPage('home')}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                      >
                        <span>{language === 'ar' ? 'معاينة ملء الشاشة' : 'Full Preview'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store QR Code Modal */}
      <StoreQrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </div>
  );
};
