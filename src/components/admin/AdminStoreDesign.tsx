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
  CheckCircle2,
  Pipette
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
import { BLANK_STORE_LOGO_URL } from '../../constants/blankLogo';

const CURATED_PALETTES = [
  { hex: '#10B981', nameAr: 'أخضر زمردي', nameEn: 'Emerald Green' },
  { hex: '#2563EB', nameAr: 'أزرق ملكي', nameEn: 'Royal Blue' },
  { hex: '#6366F1', nameAr: 'نيلي عصري', nameEn: 'Modern Indigo' },
  { hex: '#8B5CF6', nameAr: 'بنفسجي فاخر', nameEn: 'Luxury Violet' },
  { hex: '#E11D48', nameAr: 'وردي ياقوتي', nameEn: 'Crimson Rose' },
  { hex: '#F59E0B', nameAr: 'ذهبي عنبري', nameEn: 'Amber Gold' },
  { hex: '#06B6D4', nameAr: 'سماوي بحري', nameEn: 'Ocean Cyan' },
  { hex: '#0D9488', nameAr: 'أخضر بحري', nameEn: 'Teal Marine' },
  { hex: '#F97316', nameAr: 'برتقالي مشرق', nameEn: 'Sunset Orange' },
  { hex: '#18181B', nameAr: 'أسود فاحم', nameEn: 'Midnight Black' },
];

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
  const [logoSize, setLogoSize] = useState<number>(() => {
    const s = activeStore.design.logoSize;
    if (typeof s === 'number') return s;
    if (s === 'sm') return 32;
    if (s === 'lg') return 54;
    if (s === 'xl') return 68;
    return 42;
  });

  // Direct Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadProgress, setLogoUploadProgress] = useState(0);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Custom Theme Color State & Handlers
  const currentHex = activeStore.design.customThemeColor || theme.hex || '#10B981';
  const [customColorInput, setCustomColorInput] = useState<string>(currentHex);
  const [copiedHex, setCopiedHex] = useState(false);
  const colorPickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hex = activeStore.design.customThemeColor || theme.hex || '#10B981';
    setCustomColorInput(hex);
  }, [activeStore.design.customThemeColor, theme.hex]);

  const handleHexInputChange = (rawVal: string) => {
    setCustomColorInput(rawVal);
    let val = rawVal.trim();
    if (!val.startsWith('#') && /^[0-9A-Fa-f]{3,6}$/.test(val)) {
      val = '#' + val;
    }
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      const matchedKey = (Object.keys(THEME_CONFIGS) as StoreThemeColor[]).find(
        (k) => THEME_CONFIGS[k].hex.toLowerCase() === val.toLowerCase()
      );
      updateStoreDesign({
        customThemeColor: val,
        themeColor: matchedKey || activeStore.design.themeColor,
      });
    }
  };

  const handleColorPick = (newHex: string) => {
    setCustomColorInput(newHex);
    const matchedKey = (Object.keys(THEME_CONFIGS) as StoreThemeColor[]).find(
      (k) => THEME_CONFIGS[k].hex.toLowerCase() === newHex.toLowerCase()
    );
    updateStoreDesign({
      customThemeColor: newHex,
      themeColor: matchedKey || activeStore.design.themeColor,
    });
  };

  const handleCopyHex = () => {
    navigator.clipboard.writeText(customColorInput);
    setCopiedHex(true);
    addToast(
      language === 'ar' ? `تم نسخ كود اللون: ${customColorInput}` : `Color code copied: ${customColorInput}`,
      'success'
    );
    setTimeout(() => setCopiedHex(false), 2000);
  };

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

    const s = activeStore.design.logoSize;
    const initialPx = typeof s === 'number' ? s : s === 'sm' ? 32 : s === 'lg' ? 54 : s === 'xl' ? 68 : 42;
    setLogoSize(initialPx);
  }, [activeStore]);

  const handleLogoSizeChange = (newSize: number) => {
    setLogoSize(newSize);
    updateStoreDesign({ logoSize: newSize });
  };

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
      language === 'ar' ? 'تمت إزالة الشعار واستعادة الصورة الفارغة المؤقتة' : 'Logo removed, reverted to blank photo placeholder',
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
      logoSize,
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
      titleEn: 'Standard Modern Split',
      titleAr: 'الواجهة العصرية القياسية',
      descEn: 'Balanced commercial layout pairing high-converting hero messaging with featured product showcases.',
      descAr: 'تصميم تجاري متوازن يجمع بين واجهة العرض الرئيسية والمنتجات المميزة لتعزيز معدل التحويل والمبيعات.',
    },
    {
      id: 'luxury-centered',
      titleEn: 'Classic Luxury Centered',
      titleAr: 'الهوية الكلاسيكية الفاخرة',
      descEn: 'Symmetrical high-end aesthetic with refined depth, ideal for premium brands, perfumery, and jewelry.',
      descAr: 'طابع متناظر بأناقة هادئة وتدرجات عميقة، مخصص للعلامات التجارية الراقية كالعطور، الساعات والمجوهرات.',
    },
    {
      id: 'minimal-editorial',
      titleEn: 'Contemporary Editorial',
      titleAr: 'النمط التحريري المعاصر',
      descEn: 'Streamlined magazine-grade layout highlighting high-resolution product imagery and clear details.',
      descAr: 'تنسيق عصري انسيابي يركز بالكامل على فخامة صور المنتجات ووضوح التفاصيل بأسلوب المجلات العالمية.',
    },
    {
      id: 'vibrant-banner',
      titleEn: 'Dynamic Campaign Banner',
      titleAr: 'الواجهة الترويجية التفاعلية',
      descEn: 'High-impact promotional interface with wide banners suited for high-volume stores and retail events.',
      descAr: 'واجهة إعلانية شاملة ببانر عريض وتدرجات لونية حيوية، مصممة للمتاجر سريعة الحركة والحملات الكبرى.',
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
          {/* Brand Theme Color Poster & Code Picker */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'ar' ? 'ألوان هوية المتجر (Theme Color)' : 'Brand Theme Palette'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'بوستر لون الهوية وكود اللون المعتمد' : 'Brand color poster & custom color code'}
                  </p>
                </div>
              </div>

              {/* Pipette trigger button */}
              <button
                type="button"
                onClick={() => colorPickerRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title={language === 'ar' ? 'اختر لون من الطيف' : 'Pick color spectrum'}
              >
                <Pipette className="w-3.5 h-3.5 text-slate-600" />
                <span>{language === 'ar' ? 'القطارة' : 'Picker'}</span>
              </button>
            </div>

            {/* Hidden native color input */}
            <input
              ref={colorPickerRef}
              type="color"
              value={customColorInput.startsWith('#') && (customColorInput.length === 7 || customColorInput.length === 4) ? customColorInput : '#10B981'}
              onChange={(e) => handleColorPick(e.target.value)}
              className="sr-only"
              aria-label="Color spectrum picker"
            />

            {/* Visual Color Poster Card */}
            <div
              className="relative overflow-hidden rounded-2xl p-5 text-white shadow-md transition-all duration-300 group cursor-pointer border border-black/10 select-none hover:shadow-lg"
              style={{
                backgroundColor: currentHex,
                backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.25) 100%)',
              }}
              onClick={() => colorPickerRef.current?.click()}
              title={language === 'ar' ? 'اضغط لتغيير اللون عبر منتقي الألوان' : 'Click to change color via color spectrum'}
            >
              {/* Subtle background decorative shapes */}
              <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-black/10 blur-xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                {/* Poster Header Tag */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/25 backdrop-blur-md text-white/95 border border-white/20">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {language === 'ar' ? 'بوستر الهوية البصرية' : 'Brand Identity Poster'}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white group-hover:bg-white/30 transition-colors">
                    {language === 'ar' ? 'انقر لتغيير الدرجة' : 'Click to edit'}
                  </span>
                </div>

                {/* Poster Center: Big Hex Code & Label */}
                <div className="py-2">
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-wider drop-shadow-sm select-all">
                    {customColorInput.toUpperCase()}
                  </div>
                  <p className="text-xs text-white/90 mt-1 font-medium drop-shadow-xs">
                    {language === 'ar'
                      ? (CURATED_PALETTES.find((p) => p.hex.toLowerCase() === customColorInput.toLowerCase())?.nameAr || 'درجة لون مخصصة لمتجرك')
                      : (CURATED_PALETTES.find((p) => p.hex.toLowerCase() === customColorInput.toLowerCase())?.nameEn || 'Custom brand accent color')}
                  </p>
                </div>

                {/* Poster Live Components Preview Strip */}
                <div className="pt-3 border-t border-white/20 grid grid-cols-2 gap-2">
                  <div className="bg-white text-slate-900 rounded-xl px-3 py-2 text-center text-xs font-bold shadow-xs flex items-center justify-center gap-1.5">
                    <span>{language === 'ar' ? 'زر الشراء (CTA)' : 'Primary Button'}</span>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: currentHex }} />
                  </div>
                  <div className="bg-black/25 backdrop-blur-md text-white rounded-xl px-3 py-2 text-center text-xs font-medium border border-white/20 flex items-center justify-center gap-1.5">
                    <span>{language === 'ar' ? 'شارة عرض 20%-' : 'Badge -20%'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Code Input Field & Action Buttons */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'ar' ? 'كود اللون السداسي (Color Hex Code)' : 'Color Hex Code'}
              </label>

              <div className="flex items-center gap-2">
                {/* Visual Swatch Button */}
                <button
                  type="button"
                  onClick={() => colorPickerRef.current?.click()}
                  className="w-11 h-11 rounded-xl shrink-0 border-2 border-slate-200 shadow-xs flex items-center justify-center transition-transform hover:scale-105 relative group overflow-hidden cursor-pointer"
                  style={{ backgroundColor: currentHex }}
                  title={language === 'ar' ? 'فتح لوحة اختيار اللون' : 'Open color picker'}
                >
                  <Pipette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </button>

                {/* Hex Text Input */}
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-slate-400 font-mono font-bold">
                    #
                  </div>
                  <input
                    type="text"
                    value={customColorInput.replace(/^#/, '')}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    placeholder="10B981"
                    maxLength={7}
                    className="w-full ps-8 pe-3 py-2.5 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-800 uppercase focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 tracking-wider transition-all"
                    dir="ltr"
                  />
                </div>

                {/* Copy Button */}
                <button
                  type="button"
                  onClick={handleCopyHex}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shrink-0 text-xs font-semibold cursor-pointer"
                  title={language === 'ar' ? 'نسخ كود اللون' : 'Copy color code'}
                >
                  {copiedHex ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-600">{language === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>{language === 'ar' ? 'نسخ' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                {language === 'ar'
                  ? 'يمكنك كتابة أو لصق كود لون علامتك مباشرةً (من Figma أو Canva)، أو الضغط على البوستر لاختيار درجة مخصصة.'
                  : 'Type or paste any brand color code directly from Figma/Canva, or click the poster to pick.'}
              </p>
            </div>

            {/* Quick Palettes Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>{language === 'ar' ? 'درجات جاهزة شائعة:' : 'Curated Palettes:'}</span>
                <span className="text-[11px] text-slate-400">
                  {language === 'ar' ? 'نقرة واحدة للتطبيق' : '1-click apply'}
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {CURATED_PALETTES.map((palette) => {
                  const isSelected = currentHex.toLowerCase() === palette.hex.toLowerCase();
                  return (
                    <button
                      key={palette.hex}
                      type="button"
                      onClick={() => handleColorPick(palette.hex)}
                      className={`group relative flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900/10 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                      title={`${language === 'ar' ? palette.nameAr : palette.nameEn} (${palette.hex})`}
                    >
                      <span
                        className="w-7 h-7 rounded-full shadow-xs flex items-center justify-center text-white transition-transform group-hover:scale-110"
                        style={{ backgroundColor: palette.hex }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 drop-shadow" />}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-full">
                        {palette.hex}
                      </span>
                    </button>
                  );
                })}
              </div>
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
                    {language === 'ar' ? 'ارفع صورة الشعار الرسمية لمتجرك (في حال عدم الرفع تظهر صورة فارغة مؤقتة)' : 'Upload your official store logo (shows a blank photo placeholder until uploaded)'}
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

                {/* Dual Background Preview: Light & Dark Header Contrast (Borderless) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-center shadow-xs">
                    <div className="h-14 flex items-center justify-center">
                      <img
                        src={customLogoUrl}
                        alt="Store Logo Light"
                        className="max-h-full w-auto object-contain"
                        style={{ maxHeight: `${Math.min(logoSize, 56)}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {language === 'ar' ? 'على شريط فاتح (بدون إطار)' : 'On light header (Borderless)'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-900 flex flex-col items-center justify-center gap-1.5 text-center shadow-xs">
                    <div className="h-14 flex items-center justify-center">
                      <img
                        src={customLogoUrl}
                        alt="Store Logo Dark"
                        className="max-h-full w-auto object-contain"
                        style={{ maxHeight: `${Math.min(logoSize, 56)}px` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {language === 'ar' ? 'على شريط داكن (بدون إطار)' : 'On dark header (Borderless)'}
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

            {/* Blank Photo Placeholder info when no logo is uploaded */}
            {!customLogoUrl && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src={BLANK_STORE_LOGO_URL} alt="Blank Photo Placeholder" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {language === 'ar' ? 'صورة فارغة مؤقتة (معتمدة حالياً)' : 'Blank Photo Placeholder (Currently Active)'}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      {language === 'ar'
                        ? 'تظهر هذه الصورة الفارغة كشعار افتراضي في متجرك لحين رفع الشعار الرسمي أعلاه.'
                        : 'This blank photo is displayed in your storefront until you upload an official logo above.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Size Customization */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'حجم الشعار في شريط التنقل (بدون إطار):' : 'Logo Size in Navigation Bar (Borderless):'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'تحكم بحجم ظهور الشعار ليناسب هوية علامتك التجارية بدقة' : 'Fine-tune your logo dimensions to match your brand identity'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-mono font-bold">
                  {logoSize}px
                </span>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: language === 'ar' ? 'صغير' : 'Small', px: 32 },
                  { label: language === 'ar' ? 'متوسط' : 'Medium', px: 42 },
                  { label: language === 'ar' ? 'كبير' : 'Large', px: 54 },
                  { label: language === 'ar' ? 'كبير جداً' : 'X-Large', px: 68 },
                ].map((preset) => (
                  <button
                    key={preset.px}
                    type="button"
                    onClick={() => handleLogoSizeChange(preset.px)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all ${
                      logoSize === preset.px
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="block text-[10px] opacity-70 font-mono mt-0.5">{preset.px}px</span>
                  </button>
                ))}
              </div>

              {/* Precision Slider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>24px ({language === 'ar' ? 'ناعم' : 'Compact'})</span>
                  <span>80px ({language === 'ar' ? 'عريض' : 'Prominent'})</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="80"
                  step="2"
                  value={logoSize}
                  onChange={(e) => handleLogoSizeChange(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Live Borderless Preview at exact configured size */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                <span className="text-[11px] text-slate-600 font-semibold">
                  {language === 'ar' ? 'المظهر الفعلي للشعار بدون أي إطار:' : 'Actual appearance without borders:'}
                </span>
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{ height: `${logoSize}px`, minWidth: `${logoSize}px` }}
                >
                  {customLogoUrl ? (
                    <img
                      src={customLogoUrl}
                      alt="Logo Preview"
                      className="max-h-full w-auto object-contain select-none"
                      style={{ maxHeight: `${logoSize}px`, maxWidth: `${logoSize * 2.5}px` }}
                    />
                  ) : (
                    <img
                      src={BLANK_STORE_LOGO_URL}
                      alt="Blank Logo Preview"
                      className="max-h-full w-auto object-contain select-none rounded-lg"
                      style={{ maxHeight: `${logoSize}px`, maxWidth: `${logoSize * 2.5}px` }}
                    />
                  )}
                </div>
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
                      className="flex items-center justify-center shrink-0"
                      style={{ height: `${Math.min(Math.max(logoSize * 0.55, 18), 30)}px` }}
                    >
                      <img
                        src={customLogoUrl || BLANK_STORE_LOGO_URL}
                        alt=""
                        className="max-h-full w-auto object-contain select-none rounded"
                      />
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
