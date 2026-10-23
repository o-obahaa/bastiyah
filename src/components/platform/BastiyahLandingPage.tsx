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
  ChevronDown,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  HelpCircle,
  Building2,
  ArrowRight,
  Send,
  ShoppingBag,
  Share2,
  TrendingUp,
  Sparkle,
  Smartphone,
  Package,
  Compass,
  CheckCircle,
  ShoppingBasket
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BLANK_STORE_LOGO_URL } from '../../constants/blankLogo';
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
  const [appCategory, setAppCategory] = useState<'fashion' | 'beauty' | 'home' | 'handmade' | 'tech' | 'local'>('fashion');
  const [appPlan, setAppPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Starter');
  const [appSuccess, setAppSuccess] = useState<{ storeId: string; slug: string; name: string } | null>(null);
  const [appSubmitting, setAppSubmitting] = useState(false);

  // FAQ Accordion State (open question index, default first opened)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
      fashion: { en: 'Clothing & Fashion', ar: 'أزياء وملابس', emoji: '👗' },
      beauty: { en: 'Beauty & Cosmetics', ar: 'تجميل ومستحضرات', emoji: '✨' },
      home: { en: 'Home & Lifestyle', ar: 'منزل وديكور', emoji: '🕯️' },
      handmade: { en: 'Handmade & Creative Products', ar: 'حرفيات وإبداع', emoji: '🎨' },
      tech: { en: 'Electronics & Accessories', ar: 'إلكترونيات وإكسسوارات', emoji: '⚡' },
      local: { en: 'Local Shops & Small Businesses', ar: 'متاجر محلية ومشاريع صغيرة', emoji: '🏪' },
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
          language === 'ar' ? 'تم إنشاء المتجر بنجاح وجاهز للانطلاق!' : 'Store created successfully on Bastiyah!',
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

  // FAQ Data from user prompt
  const faqs = [
    {
      qEn: 'What is Bastiyah?',
      aEn: 'Bastiyah is a platform designed to help businesses establish their own online stores and showcase their products on the internet.',
      qAr: 'ما هي بسطية؟',
      aAr: 'بسطية هي منصة مصممة لمساعدة الأنشطة التجارية على إنشاء متاجرها الإلكترونية الخاصة وعرض منتجاتها على الإنترنت بسهولة واحترافية.'
    },
    {
      qEn: 'Do I need programming experience?',
      aEn: 'No. Bastiyah is designed to simplify the process of creating an online storefront without requiring you to build a website from scratch.',
      qAr: 'هل أحتاج إلى خبرة برمجية؟',
      aAr: 'لا، تم تصميم بسطية لتبسيط عملية إنشاء المتجر الإلكتروني دون الحاجة إلى بناء موقع من الصفر أو كتابة أي سطر برمجي.'
    },
    {
      qEn: 'Can I display my own products?',
      aEn: 'Yes. Your store is intended to showcase your products, including their photos, descriptions, and prices.',
      qAr: 'هل يمكنني عرض منتجاتي الخاصة؟',
      aAr: 'نعم، متجرك مخصص لعرض منتجاتك بالكامل بما يشمل الصور والأوصاف والأسعار والمخزون.'
    },
    {
      qEn: 'Can I share my store with customers?',
      aEn: 'Yes. Your online store can be shared through its link, making it easier for customers to access your products.',
      qAr: 'هل يمكنني مشاركة متجري مع العملاء؟',
      aAr: 'نعم، يمكنك مشاركة رابط متجرك المباشر بسهولة عبر وسائل التواصل الاجتماعي وتطبيقات المراسلة لتسهيل وصول العملاء لمنتجاتك.'
    },
    {
      qEn: 'Who can use Bastiyah?',
      aEn: 'Bastiyah is suitable for entrepreneurs, small businesses, local shops, and established sellers who want to create an online presence.',
      qAr: 'من يمكنه استخدام بسطية؟',
      aAr: 'بسطية مناسبة لرواد الأعمال، وأصحاب المشاريع الصغيرة، والمتاجر المحلية، والتجار المعتمدين الراغبين في تأسيس حضور رقمي مستقل.'
    },
    {
      qEn: 'Does creating a store guarantee more sales?',
      aEn: 'Creating an online store gives your business another way to reach customers, but sales depend on factors such as product quality, pricing, marketing, and customer service.',
      qAr: 'هل إنشاء المتجر يضمن زيادة المبيعات؟',
      aAr: 'إنشاء متجر إلكتروني يمنح نشاطك التجاري قناة موثوقة للوصول إلى عملاء أكثر، لكن المبيعات تعتمد أيضاً على جودة المنتجات، والتسعير، والتسويق، وخدمة العملاء.'
    },
    {
      qEn: 'How do I get started?',
      aEn: 'Start by creating your store, adding your products, and sharing your storefront with potential customers.',
      qAr: 'كيف أبدأ؟',
      aAr: 'ابدأ بتقديم طلب متجرك، ثم إضافة منتجاتك وصورها، ومشاركة رابط متجرك مع جمهورك وعملائك المحتملين.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900 relative selection:bg-stone-900 selection:text-white">
      {/* Minimalist Background Pattern Overlay (Subtle dot grid fading radially) */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-pattern-dots-subtle opacity-75 bg-pattern-radial-mask" />

      {/* 
        ========================================================================
        1. THE UPPER BANNER (Navbar)
        Contains: Logo + Name of site (BASTIYAH | بسطية), 
        Links: ( services ) ( features ) ( pricing ) ( about us ) ( contact us )
        ========================================================================
      */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 transition-all shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Platform Brand (Cropped Logo + BASTIYAH | بسطية) */}
          <div 
            onClick={() => setCurrentPage('bastiyah-landing')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            {/* Cropped Official Bastiyah Emblem */}
            <img
              src="/bastiyah-emblem.png"
              alt="BASTIYAH | بسطية"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105 pointer-events-none"
            />

            <div className="flex items-baseline gap-2">
              <span className="font-brand font-black text-xl sm:text-2xl tracking-normal text-[#842a12] bg-gradient-to-b from-[#8f3216] via-[#6d240d] to-[#3a1105] bg-clip-text text-transparent leading-[1.3] py-1 px-1 group-hover:from-[#a03819] group-hover:to-[#4a1607] transition-all inline-block">
                بسطية
              </span>
              <span className="text-stone-300 font-light select-none">|</span>
              <span className="text-xs font-bold text-[#8a2f14]/80 tracking-wider uppercase font-sans">
                BASTIYAH
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
              href="#how-it-works" 
              className="hover:text-stone-950 transition-colors font-medium py-1"
            >
              {language === 'ar' ? 'كيف يعمل' : 'How It Works'}
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
              href="#faq" 
              className="hover:text-stone-950 transition-colors font-medium py-1"
            >
              {language === 'ar' ? 'الأسئلة الشائعة' : 'FAQ'}
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
              <span>{language === 'ar' ? 'أنشئ متجرك' : 'Create Your Store'}</span>
            </a>

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
          2. HERO SECTION
          # BASTIYAH | بسطية
          ## Your Business Deserves to Be Online.
          Turn your products into an online store with Bastiyah. Create your own 
          digital storefront, showcase your products, and give your customers 
          a simpler way to shop — all under your own brand.
          [Create Your Store]  [Explore How It Works]
          No complicated setup. Just a simpler way to sell online.
          ========================================================================
        */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-stone-200/80">
          <div className="absolute top-10 start-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-100/40 via-rose-100/30 to-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            
            {/* Centerpiece: Emblem with Centered Typography (Clean logo without English text or long description) */}
            <div className="mb-6 animate-in fade-in zoom-in-95 duration-500">
              <DynamicLogo
                size="hero"
                layout="vertical"
                showText={true}
                showEnglishText={false}
              />
            </div>

            {/* Hero Main Headline with generous line-height to prevent overlap */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-normal text-stone-900 max-w-4xl mx-auto leading-[1.35] sm:leading-[1.28] font-brand mb-4">
              {language === 'ar' 
                ? 'احجز متجرك الإلكتروني ببساطة' 
                : 'Book Your Online Store, Simply.'}
            </h1>

            {/* Hero Subtitle with generous line-height */}
            <p className="text-stone-600 text-base sm:text-xl max-w-3xl mx-auto mt-4 leading-relaxed sm:leading-[1.8] font-normal">
              {language === 'ar'
                ? 'احصل على رابط خاص بمتجرك وحوّل منتجاتك إلى متجر إلكتروني متكامل مع بسطية. أنشئ واجهتك الرقمية الخاصة، واعرض منتجاتك، وامنح عملاءك تجربة تسوق أسهل — كل ذلك برابط مخصص وعلامة تجارية مستقلة.'
                : 'Get a specific link for your store and turn your products into an online store with Bastiyah. Create your own digital storefront, showcase your products, and give your customers a simpler way to shop — all under your own brand.'}
            </p>

            {/* Hero Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href="#apply-store"
                className="px-7 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-stone-900/10 flex items-center gap-2 transition-all hover:-translate-y-0.5 leading-normal"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'أنشئ متجرك' : 'Create Your Store'}</span>
              </a>

              <a
                href="#how-it-works"
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm sm:text-base flex items-center gap-2 transition-all shadow-sm hover:border-stone-400 leading-normal"
              >
                <Compass className="w-4 h-4 text-stone-600" />
                <span>{language === 'ar' ? 'اكتشف كيف يعمل' : 'Explore How It Works'}</span>
              </a>
            </div>

            {/* Micro-copy */}
            <p className="text-xs sm:text-sm text-stone-500 mt-5 font-medium leading-normal">
              {language === 'ar' 
                ? 'بدون تعقيدات تقنية. فقط طريقة أسهل للبيع عبر الإنترنت.' 
                : 'No complicated setup. Just a simpler way to sell online.'}
            </p>
          </div>
        </section>

        {/* 
          ========================================================================
          3. EVERYTHING YOU NEED TO START SELLING ONLINE (#services)
          Building an online store shouldn't be complicated. Bastiyah gives you 
          the tools to bring your business online without starting from scratch.
          ========================================================================
        */}
        <section id="services" className="py-20 sm:py-24 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'خدمات بسطية المتكاملة' : 'Platform Services'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 font-brand leading-[1.35] sm:leading-[1.3] tracking-normal">
                {language === 'ar' 
                  ? 'كل ما تحتاجه لبدء البيع عبر الإنترنت' 
                  : 'Everything You Need to Start Selling Online'}
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed sm:leading-[1.75]">
                {language === 'ar'
                  ? 'بناء متجر إلكتروني لا ينبغي أن يكون معقداً. تمنحك بسطية الأدوات لنقل تجارتك إلى الإنترنت دون البدء من الصفر.'
                  : "Building an online store shouldn't be complicated. Bastiyah gives you the tools to bring your business online without starting from scratch."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: <Store className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Your Own Online Store',
                  titleAr: 'متجرك الإلكتروني المستقل',
                  descEn: 'Get a dedicated storefront for your business where customers can browse your products, discover your brand, and shop with ease.',
                  descAr: 'احصل على واجهة متجر مخصصة لمشروعك، حيث يمكن للعملاء تصفح منتجاتك، واستكشاف علامتك التجارية، والتسوق بكل سهولة.'
                },
                {
                  icon: <Package className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Showcase Your Products',
                  titleAr: 'اعرض منتجاتك باحترافية',
                  descEn: "Present your products with photos, descriptions, and prices to help customers find exactly what they're looking for.",
                  descAr: 'اعرض منتجاتك مع الصور الواضحة والأوصاف الدقيقة والأسعار لمساعدة العملاء في العثور على ما يبحثون عنه تماماً.'
                },
                {
                  icon: <Palette className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Your Brand, Your Identity',
                  titleAr: 'علامتك التجارية وهويتك الخاصة',
                  descEn: 'Create an online presence that represents your business and gives your customers a familiar place to shop.',
                  descAr: 'أنشئ حضوراً رقمياً يعبر عن نشاطك التجاري بدقة، ويمنح عملاءك تجربة تسوق مألوفة تعزز الثقة والولاء.'
                },
                {
                  icon: <LayoutDashboard className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Simple Store Management',
                  titleAr: 'إدارة بسيطة للمتجر',
                  descEn: 'Manage your products and keep your store organized through a straightforward experience designed for business owners.',
                  descAr: 'أدِر منتجاتك وحافظ على تنظيم متجرك من خلال تجربة إدارة مباشرة وسلسة صُممت خصيصاً لأصحاب الأعمال.'
                },
                {
                  icon: <Share2 className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Share Your Store Anywhere',
                  titleAr: 'شارك متجرك في أي مكان',
                  descEn: 'Make it easy for customers to find your store by sharing its link through social media, messaging apps, and other channels.',
                  descAr: 'سهّل على العملاء الوصول لمتجرك بمشاركة رابطه المباشر عبر وسائل التواصل الاجتماعي، وتطبيقات المراسلة، وكافة القنوات.'
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Built for Growing Businesses',
                  titleAr: 'مصمم للمشاريع المتنامية',
                  descEn: "Whether you're starting a small business or bringing an established shop online, Bastiyah helps you take the next step.",
                  descAr: 'سواء كنت تبدأ مشروعاً صغيراً أو تنقل محلاً قائماً إلى الإنترنت، تساعدك بسطية على اتخاذ الخطوة التالية بثقة.'
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md hover:border-stone-300 transition-all flex flex-col"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-5 shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="font-brand font-bold text-lg text-stone-900 mb-2.5">
                    {language === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed font-normal">
                    {language === 'ar' ? item.descAr : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          4. FROM YOUR SHOP TO THE ONLINE WORLD (#about)
          Your products deserve to reach more people. Bastiyah helps you move beyond 
          traditional selling and establish your business online.
          With your own digital storefront, you can give customers a convenient 
          way to explore your products whenever they want.
          Your shop. Your products. Your brand. One online destination.
          [Get Started with Bastiyah]
          ========================================================================
        */}
        <section id="about" className="py-20 sm:py-24 border-b border-stone-200/80 bg-white/60 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            {/* Cropped Emblem */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6">
              <img 
                src="/bastiyah-emblem.png" 
                alt="BASTIYAH | بسطية" 
                className="w-full h-full object-contain pointer-events-none" 
              />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
              {language === 'ar' ? 'من متجرك إلى العالم الرقمي' : 'From Your Shop to the Online World'}
            </span>

            <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 font-brand leading-[1.35] sm:leading-[1.3] tracking-normal">
              {language === 'ar' 
                ? 'منتجاتك تستحق الوصول إلى جمهور أكبر' 
                : 'From Your Shop to the Online World'}
            </h2>

            <p className="text-stone-600 text-base sm:text-lg mt-5 leading-relaxed sm:leading-[1.8] max-w-2xl font-normal">
              {language === 'ar'
                ? 'تستحق منتجاتك أن تصل إلى عدد أكبر من الناس. تساعدك بسطية على تجاوز حدود البيع التقليدي وتأسيس متجرك على الإنترنت بكل ثقة.'
                : 'Your products deserve to reach more people. Bastiyah helps you move beyond traditional selling and establish your business online.'}
            </p>

            <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed sm:leading-[1.8] max-w-2xl font-normal">
              {language === 'ar'
                ? 'مع واجهتك الرقمية المستقلة، تمنح عملاءك وسيلة مريحة لاستكشاف منتجاتك والتسوق منها في أي وقت ومن أي مكان.'
                : 'With your own digital storefront, you can give customers a convenient way to explore your products whenever they want.'}
            </p>

            {/* Punchy Brand Statement */}
            <div className="mt-8 px-6 py-4 rounded-2xl bg-stone-100 border border-stone-200/80">
              <p className="text-sm sm:text-base font-bold text-stone-900 font-brand leading-[1.4] tracking-normal">
                {language === 'ar'
                  ? 'متجرك. منتجاتك. علامتك التجارية. وجهة رقمية واحدة.'
                  : 'Your shop. Your products. Your brand. One online destination.'}
              </p>
            </div>

            {/* CTA */}
            <div className="mt-8">
              <a
                href="#apply-store"
                className="px-8 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center gap-2 transition-all hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'ابدأ الآن مع بسطية' : 'Get Started with Bastiyah'}</span>
              </a>
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          5. THE BOX FOR NEW STORES APPLYING (With logo and name of site)
          ========================================================================
        */}
        <section id="apply-store" className="py-20 sm:py-24 border-b border-stone-200/80 bg-stone-50/50 scroll-mt-20">
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
                    alt="BASTIYAH | بسطية"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>

                {/* Name of the Site with Vintage Artisanal Contrast */}
                <div className="flex items-center gap-2">
                  <h2 className="font-brand font-black text-2xl sm:text-3xl tracking-normal text-[#842a12] bg-gradient-to-b from-[#8f3216] via-[#6d240d] to-[#3a1105] bg-clip-text text-transparent leading-[1.3] py-1 px-2 inline-block">
                    بسطية
                  </h2>
                  <span className="text-stone-300 font-light select-none">|</span>
                  <span className="text-xs font-bold tracking-widest text-[#8a2f14]/80 uppercase font-sans">
                    BASTIYAH
                  </span>
                </div>

                {/* Box Title & Description */}
                <h3 className="text-lg sm:text-xl font-bold text-stone-800 mt-2 font-brand">
                  {language === 'ar' ? 'طلب انضمام وإطلاق متجر جديد' : 'Create Your Online Store Today'}
                </h3>
                <p className="text-sm text-stone-500 max-w-lg mt-1 font-normal leading-relaxed">
                  {language === 'ar'
                    ? 'املأ بيانات متجرك للانضمام إلى منصة بسطية؛ يتم اعتماد وإضافة مدراء المتاجر حصرياً عبر رقم الهاتف من قِبل إدارة المنصة.'
                    : 'Submit your store details to join Bastiyah; store admins are onboarded and authorized exclusively via mobile phone.'}
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
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>{language === 'ar' ? 'رقم الهاتف المحمول (وسيلة التسجيل والاعتماد) *' : 'Mobile Phone (Registration Method) *'}</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {language === 'ar' ? 'اعتماد المالك' : 'Owner Approved'}
                        </span>
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={appContact}
                        onChange={(e) => setAppContact(e.target.value)}
                        placeholder="+964 770 123 4567"
                        className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-400 transition-all font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {language === 'ar' ? 'نوع النشاط التجاري' : 'Business Category'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      {[
                        { id: 'fashion', labelAr: 'أزياء وملابس', labelEn: 'Fashion', icon: '👗' },
                        { id: 'beauty', labelAr: 'تجميل وعناية', labelEn: 'Beauty', icon: '✨' },
                        { id: 'home', labelAr: 'منزل وديكور', labelEn: 'Home Decor', icon: '🕯️' },
                        { id: 'handmade', labelAr: 'حرف وإبداع', labelEn: 'Handmade', icon: '🎨' },
                        { id: 'tech', labelAr: 'إلكترونيات', labelEn: 'Electronics', icon: '⚡' },
                        { id: 'local', labelAr: 'متاجر محلية', labelEn: 'Local Shops', icon: '🏪' },
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
                          : (language === 'ar' ? 'إرسال طلب إطلاق المتجر على بسطية' : 'Create Your Store Today')}
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
          6. HOW IT WORKS (#how-it-works)
          01. Create Your Store
          02. Add Your Products
          03. Share Your Store
          04. Grow Your Business
          ========================================================================
        */}
        <section id="how-it-works" className="py-20 sm:py-24 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'خطوات بسيطة' : 'Simple Steps'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 font-brand leading-[1.35] sm:leading-[1.3] tracking-normal">
                {language === 'ar' ? 'كيف يعمل؟' : 'How It Works'}
              </h2>
              <p className="text-stone-500 text-sm sm:text-base mt-2 leading-relaxed sm:leading-[1.75]">
                {language === 'ar'
                  ? 'أربع خطوات واضحة ومباشرة تفصلك عن إطلاق متجرك الرقمي والوصول لعملائك.'
                  : 'Four straightforward steps to set up your store and introduce your business to the online world.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[
                {
                  step: '01',
                  titleEn: 'Create Your Store',
                  titleAr: 'أنشئ متجرك',
                  descEn: 'Start your journey by setting up your store and introducing your business to the online world.',
                  descAr: 'ابدأ رحلتك بإعداد متجرك الإلكتروني وتقديم نشاطك التجاري للعالم الرقمي.'
                },
                {
                  step: '02',
                  titleEn: 'Add Your Products',
                  titleAr: 'أضف منتجاتك',
                  descEn: 'Upload product photos, write descriptions, and set your prices so customers know what you offer.',
                  descAr: 'ارفع صور المنتجات، واكتب الأوصاف، وحدد أسعارك ليعرف العملاء ما تقدمه بدقة.'
                },
                {
                  step: '03',
                  titleEn: 'Share Your Store',
                  titleAr: 'شارك متجرك',
                  descEn: 'Share your store link with your audience and make it easier for potential customers to discover your products.',
                  descAr: 'شارك رابط متجرك مع جمهورك واجعل من السهل على العملاء المحتملين اكتشاف منتجاتك.'
                },
                {
                  step: '04',
                  titleEn: 'Grow Your Business',
                  titleAr: 'طوّر تجارتك',
                  descEn: 'Keep your store updated, showcase new products, and build your online presence as your business grows.',
                  descAr: 'حافظ على تحديث متجرك، واعرض منتجات جديدة، وعزز حضورك الرقمي مع نمو أعمالك.'
                }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl sm:text-4xl font-black text-stone-300 font-mono mb-4 leading-none">
                    {item.step}.
                  </div>
                  <div>
                    <h3 className="font-brand font-bold text-lg text-stone-900 mb-2 leading-[1.4] tracking-normal">
                      {language === 'ar' ? item.titleAr : item.titleEn}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed sm:leading-[1.7] font-normal">
                      {language === 'ar' ? item.descAr : item.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          7. MADE FOR BUSINESSES LIKE YOURS
          Clothing & Fashion / Beauty & Cosmetics / Home & Lifestyle / 
          Handmade & Creative Products / Electronics & Accessories / 
          Local Shops & Small Businesses
          Whatever you sell, Bastiyah helps you build your place in the digital marketplace.
          ========================================================================
        */}
        <section className="py-20 sm:py-24 border-b border-stone-200/80 bg-white/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'القطاعات والتصنيفات' : 'Tailored for Every Merchant'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 font-brand leading-[1.35] sm:leading-[1.3] tracking-normal">
                {language === 'ar' 
                  ? 'مُصمم للأنشطة التجارية مثل نشاطك' 
                  : 'Made for Businesses Like Yours'}
              </h2>
              <p className="text-stone-600 text-sm sm:text-base mt-3 leading-relaxed sm:leading-[1.75]">
                {language === 'ar'
                  ? 'مهما كان ما تبيعه، تساعدك بسطية في بناء مكانك الخاص في السوق الرقمي.'
                  : 'Whatever you sell, Bastiyah helps you build your place in the digital marketplace.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  emoji: '👗',
                  titleEn: 'Clothing & Fashion',
                  titleAr: 'الملابس والأزياء',
                  descEn: 'Showcase collections, accessories, and the latest trends in your own online store.',
                  descAr: 'اعرض التشكيلات الحصرية، والإكسسوارات، وأحدث صيحات الموضة في متجرك الإلكتروني الخاص.'
                },
                {
                  emoji: '✨',
                  titleEn: 'Beauty & Cosmetics',
                  titleAr: 'الجمال ومستحضرات التجميل',
                  descEn: 'Present beauty products and skincare essentials in an organized, easy-to-browse catalog.',
                  descAr: 'اعرض منتجات الجمال والعناية بالبشرة في كتالوج منظم وسهل التصفح لعملائك.'
                },
                {
                  emoji: '🕯️',
                  titleEn: 'Home & Lifestyle',
                  titleAr: 'المنزل ونمط الحياة',
                  descEn: 'Bring furniture, home accessories, decorations, and everyday essentials online.',
                  descAr: 'انقل الأثاث، وإكسسوارات المنزل، والديكورات، والمستلزمات اليومية إلى متجرك الرقمي.'
                },
                {
                  emoji: '🎨',
                  titleEn: 'Handmade & Creative Products',
                  titleAr: 'المنتجات اليدوية والإبداعية',
                  descEn: 'Give your handmade creations a dedicated space where customers can discover what makes them special.',
                  descAr: 'امنح إبداعاتك ومصنوعاتك اليدوية مساحة مخصصة يكتشف فيها العملاء سر تميزها.'
                },
                {
                  emoji: '⚡',
                  titleEn: 'Electronics & Accessories',
                  titleAr: 'الإلكترونيات والإكسسوارات',
                  descEn: 'Display gadgets, devices, and accessories with clear product information.',
                  descAr: 'اعرض الأجهزة الذكية، والأدوات التقنية، والملحقات مع معلومات ومواصفات واضحة.'
                },
                {
                  emoji: '🏪',
                  titleEn: 'Local Shops & Small Businesses',
                  titleAr: 'المتاجر المحلية والمشاريع الصغيرة',
                  descEn: 'Take your neighborhood business online and give customers another way to discover what you offer.',
                  descAr: 'انقل متجرك المحلي في منطقتك إلى الإنترنت وامنح عملاءك طريقة سهلة لاكتشاف ما تقدمه.'
                }
              ].map((cat, idx) => (
                <div 
                  key={idx}
                  className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="text-3xl mb-4 leading-none">{cat.emoji}</div>
                  <h3 className="font-brand font-bold text-lg text-stone-900 mb-2 leading-[1.4] tracking-normal">
                    {language === 'ar' ? cat.titleAr : cat.titleEn}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed sm:leading-[1.7] font-normal">
                    {language === 'ar' ? cat.descAr : cat.descEn}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-sm sm:text-base font-semibold text-stone-700 leading-relaxed sm:leading-[1.7]">
                {language === 'ar'
                  ? 'مهما كان ما تبيعه، تساعدك بسطية في بناء مكانك الخاص في السوق الرقمي.'
                  : 'Whatever you sell, Bastiyah helps you build your place in the digital marketplace.'}
              </p>
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          8. WHY CHOOSE BASTIYAH? (#features)
          Simple by Design / Your Own Digital Space / A Better Shopping Experience /
          Room to Grow / Focus on Your Business
          ========================================================================
        */}
        <section id="features" className="py-20 sm:py-24 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'مميزات المنصة' : 'Core Advantages'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 font-brand leading-[1.35] sm:leading-[1.3] tracking-normal">
                {language === 'ar' ? 'لماذا تختار بسطية؟' : 'Why Choose Bastiyah?'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {[
                {
                  icon: <Sparkles className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Simple by Design',
                  titleAr: 'بساطة في التصميم',
                  descEn: "You don't need to build a website from the ground up to establish your online presence.",
                  descAr: 'لست بحاجة لبناء موقع إلكتروني من الصفر أو الدخول في تعقيدات تقنية لتأسيس حضورك الرقمي.'
                },
                {
                  icon: <Store className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Your Own Digital Space',
                  titleAr: 'مساحتك الرقمية الخاصة',
                  descEn: 'Give your business a dedicated storefront instead of relying entirely on social media posts and messages.',
                  descAr: 'امنح مشروعك واجهة متجر مخصصة بدلاً من الاعتماد الكلي على منشورات ورسائل مواقع التواصل الاجتماعي.'
                },
                {
                  icon: <ShoppingBag className="w-6 h-6 text-stone-900" />,
                  titleEn: 'A Better Shopping Experience',
                  titleAr: 'تجربة تسوق أفضل',
                  descEn: 'Help customers browse your products and find the information they need in one place.',
                  descAr: 'ساعِد عملاءك على تصفح منتجاتك والوصول إلى كافة المعلومات والأسعار في مكان واحد منظم.'
                },
                {
                  icon: <TrendingUp className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Room to Grow',
                  titleAr: 'مساحة للتوسع والنمو',
                  descEn: 'Start with your current products and continue developing your online presence as your business evolves.',
                  descAr: 'ابدأ بمنتجاتك الحالية، وواصل تطوير حضورك الرقمي وتوسيع تشكيلاتك مع نمو وتوسع نشاطك.'
                },
                {
                  icon: <ShieldCheck className="w-6 h-6 text-stone-900" />,
                  titleEn: 'Focus on Your Business',
                  titleAr: 'ركّز على تجارتك',
                  descEn: 'Spend less time worrying about the technical side of creating a website and more time focusing on your products and customers.',
                  descAr: 'اقضِ وقتاً أقل في القلق بشأن الجوانب التقنية لإنشاء المواقع، وركّز كامل جهدك على منتجاتك وعملائك.'
                }
              ].map((item, idx) => (
                <div 
                  key={idx}
                  className="p-8 rounded-3xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-5 shrink-0">
                    {item.icon}
                  </div>
                  <h3 className="font-brand font-bold text-lg text-stone-900 mb-2.5 leading-[1.4] tracking-normal">
                    {language === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed sm:leading-[1.7] font-normal">
                    {language === 'ar' ? item.descAr : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          9. YOUR NEXT BUSINESS STEP STARTS HERE
          Every successful business starts somewhere. Take the next step and give 
          your products a place online.
          Whether you're launching a new idea or expanding an existing shop, 
          Bastiyah makes starting your online journey simpler.
          Let's bring your business online.
          [Create Your Store Today]
          ========================================================================
        */}
        <section className="py-20 sm:py-24 border-b border-stone-200/80 bg-stone-900 text-white relative overflow-hidden">
          {/* Subtle Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 flex flex-col items-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-brand tracking-normal leading-[1.3] sm:leading-[1.28]">
              {language === 'ar'
                ? 'خطوتك التجارية القادمة تبدأ هنا'
                : 'Your Next Business Step Starts Here'}
            </h2>

            <p className="text-stone-300 text-base sm:text-lg mt-5 leading-relaxed sm:leading-[1.8] max-w-2xl font-normal">
              {language === 'ar'
                ? 'كل مشروع ناجح يبدأ بخطوة. اتخذ الخطوة القادمة وامنح منتجاتك مكاناً مخصصاً على الإنترنت.'
                : 'Every successful business starts somewhere. Take the next step and give your products a place online.'}
            </p>

            <p className="text-stone-400 text-sm sm:text-base mt-3 leading-relaxed sm:leading-[1.8] max-w-2xl font-normal">
              {language === 'ar'
                ? 'سواء كنت تطلق فكرة جديدة أو توسع متجراً قائماً، تجعل بسطية بداية رحلتك الرقمية أكثر سهولة ووضوحاً.'
                : "Whether you're launching a new idea or expanding an existing shop, Bastiyah makes starting your online journey simpler."}
            </p>

            <div className="mt-6 text-amber-400 font-bold text-base sm:text-lg font-brand leading-[1.4] tracking-normal">
              {language === 'ar' ? 'لننقل نشاطك التجاري إلى الإنترنت معاً.' : "Let's bring your business online."}
            </div>

            <div className="mt-8">
              <a
                href="#apply-store"
                className="px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-sm sm:text-base shadow-xl transition-all hover:-translate-y-0.5 inline-flex items-center gap-2 leading-normal"
              >
                <Zap className="w-4 h-4 text-stone-950" />
                <span>{language === 'ar' ? 'أنشئ متجرك اليوم' : 'Create Your Store Today'}</span>
              </a>
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          10. PRICING SECTION (#pricing)
          ========================================================================
        */}
        <section id="pricing" className="py-20 sm:py-24 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'خطط الاستضافة' : 'Pricing Plans'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 font-brand leading-[1.35] sm:leading-[1.3] tracking-normal">
                {language === 'ar' ? 'باقات واضحة وبسيطة تناسب حجم تجارتك' : 'Transparent Hosting Plans'}
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
                    {language === 'ar' ? 'مثالية للبدء والتجربة وإطلاق أول بسطية إلكترونية.' : 'Ideal for starting out, experimenting, and launching your first digital store.'}
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
                      <span>{language === 'ar' ? 'لوحة تحكم كاملة للمتجر' : 'Full private management dashboard'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{language === 'ar' ? 'تخصيص الألوان والشعار' : 'Custom theme colors & branding'}</span>
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
          11. FREQUENTLY ASKED QUESTIONS (#faq)
          What is Bastiyah? / Do I need programming experience? / 
          Can I display my own products? / Can I share my store with customers? / 
          Who can use Bastiyah? / Does creating a store guarantee more sales? / 
          How do I get started?
          ========================================================================
        */}
        <section id="faq" className="py-20 sm:py-24 border-b border-stone-200/80 bg-white/60 scroll-mt-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'إجابات واضحة' : 'Common Questions'}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 mt-2 font-brand leading-[1.35] sm:leading-[1.3] tracking-normal">
                {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden transition-all shadow-2xs hover:border-stone-300"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 sm:p-6 text-start flex items-center justify-between gap-4 font-brand font-bold text-base sm:text-lg text-stone-900 leading-[1.4] tracking-normal"
                    >
                      <span>{language === 'ar' ? faq.qAr : faq.qEn}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-stone-800' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-stone-600 text-sm sm:text-base leading-relaxed sm:leading-[1.8] border-t border-stone-100 pt-3 animate-in fade-in duration-200">
                        {language === 'ar' ? faq.aAr : faq.aEn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          12. READY TO TAKE YOUR BUSINESS ONLINE?
          Your products have a story. Your business has potential. Give both a place to grow.
          Bastiyah — Your Store, Your Brand, Your Way.
          [Get Started]
          ========================================================================
        */}
        <section className="py-20 sm:py-24 border-b border-stone-200/80 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 font-brand tracking-normal leading-[1.3] sm:leading-[1.28]">
              {language === 'ar'
                ? 'جاهز لنقل مشروعك إلى الإنترنت؟'
                : 'Ready to Take Your Business Online?'}
            </h2>

            <p className="text-stone-600 text-base sm:text-lg mt-5 leading-relaxed sm:leading-[1.8] max-w-2xl font-normal">
              {language === 'ar'
                ? 'منتجاتك لها قصة. ومشروعك يمتلك إمكانات حقيقية. امنح كليهما مكاناً ينموان فيه.'
                : 'Your products have a story. Your business has potential. Give both a place to grow.'}
            </p>

            <div className="mt-5 text-lg sm:text-xl font-black text-stone-900 font-brand leading-[1.4] tracking-normal">
              {language === 'ar'
                ? 'بسطية — متجرك، علامتك التجارية، بطريقتك.'
                : 'Bastiyah — Your Store, Your Brand, Your Way.'}
            </div>

            <div className="mt-8">
              <a
                href="#apply-store"
                className="px-9 py-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-stone-900/10 inline-flex items-center gap-2 transition-all hover:-translate-y-0.5 leading-normal"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'ابدأ الآن' : 'Get Started'}</span>
              </a>
            </div>
          </div>
        </section>

        {/* 
          ========================================================================
          13. CONTACT US SECTION (#contact)
          ========================================================================
        */}
        <section id="contact" className="py-20 border-b border-stone-200/80 scroll-mt-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400 font-sans">
                {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 font-brand leading-[1.35] tracking-normal">
                {language === 'ar' ? 'فريق بسطية جاهز لمساعدتك' : 'Have a Question or Need Assistance?'}
              </h2>
              <p className="text-stone-500 text-sm mt-2 leading-relaxed sm:leading-[1.7]">
                {language === 'ar' 
                  ? 'لديك استفسار أو تحتاج إلى مساعدة؟ تواصل مع فريقنا مباشرة.' 
                  : 'Have a question or need assistance? Get in touch with our team.'}
              </p>
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
          14. LIVE HOSTED STORES DIRECTORY (#hosted-stores-directory)
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
              <span>{language === 'ar' ? 'أنشئ متجرك' : 'Create Your Store'}</span>
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
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-stone-200/90 bg-white overflow-hidden p-1">
                          <img
                            src={store.design.customLogoUrl || store.logo || BLANK_STORE_LOGO_URL}
                            alt=""
                            className="w-full h-full object-contain"
                          />
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

      {/* 
        ========================================================================
        15. FOOTER
        Bastiyah | بسطية
        A simpler way to bring your business online.
        Explore: Home, Features, How It Works, Frequently Asked Questions
        For Sellers: Create Your Store, Manage Your Products, Contact Support
        Legal: Privacy Policy, Terms of Service
        Contact Us: Have a question or need assistance? Get in touch with our team.
        © 2026 Bastiyah. All rights reserved.
        ========================================================================
      */}
      <footer className="border-t border-stone-200 bg-white py-16 text-stone-500 text-xs sm:text-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-100">
            
            {/* Brand Column */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src="/bastiyah-emblem.png"
                  alt="BASTIYAH | بسطية"
                  className="w-10 h-10 object-contain shrink-0 pointer-events-none"
                />
                <div className="flex items-baseline gap-2">
                  <span className="font-brand font-black text-xl tracking-normal text-[#842a12] bg-gradient-to-b from-[#8f3216] via-[#6d240d] to-[#3a1105] bg-clip-text text-transparent leading-[1.3] py-1 px-1 inline-block">
                    بسطية
                  </span>
                  <span className="text-stone-300 font-light select-none">|</span>
                  <span className="text-xs font-bold text-[#8a2f14]/80 tracking-wider uppercase font-sans">
                    BASTIYAH
                  </span>
                </div>
              </div>

              <p className="text-stone-600 text-sm max-w-sm font-normal leading-relaxed mb-4">
                {language === 'ar'
                  ? 'طريقة أسهل لنقل نشاطك التجاري إلى الإنترنت.'
                  : 'A simpler way to bring your business online.'}
              </p>
            </div>

            {/* Explore Column */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-4 font-sans">
                {language === 'ar' ? 'استكشف' : 'Explore'}
              </h4>
              <ul className="space-y-2.5 text-stone-600 text-xs sm:text-sm">
                <li>
                  <a href="#" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'المميزات' : 'Features'}
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'كيف يعمل' : 'How It Works'}
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
                  </a>
                </li>
              </ul>
            </div>

            {/* For Sellers Column */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-4 font-sans">
                {language === 'ar' ? 'للتجار وأصحاب الأعمال' : 'For Sellers'}
              </h4>
              <ul className="space-y-2.5 text-stone-600 text-xs sm:text-sm">
                <li>
                  <a href="#apply-store" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'أنشئ متجرك' : 'Create Your Store'}
                  </a>
                </li>
                <li>
                  <a href="#hosted-stores-directory" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'إدارة منتجاتك' : 'Manage Your Products'}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'الدعم الفني' : 'Contact Support'}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 mb-4 font-sans">
                {language === 'ar' ? 'قانوني' : 'Legal'}
              </h4>
              <ul className="space-y-2.5 text-stone-600 text-xs sm:text-sm">
                <li>
                  <a href="#legal" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </a>
                </li>
                <li>
                  <a href="#legal" className="hover:text-stone-950 transition-colors">
                    {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
            <div>
              {language === 'ar' 
                ? '© 2026 بسطية. جميع الحقوق محفوظة.' 
                : '© 2026 Bastiyah. All rights reserved.'}
            </div>

            <div className="flex items-center gap-1 font-mono text-[11px] text-stone-400">
              <span>bastiyah.com</span>
              <span>•</span>
              <span>Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
