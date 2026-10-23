import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory, ANONYMOUS_USER_AVATAR } from '../../types';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  ArrowRight,
  Palette,
  Globe,
  MessageCircle,
  User,
  LogOut,
  Check,
  ChevronDown,
  MapPin,
  Edit3,
  Package,
  Truck,
  ChevronLeft,
  Tag,
  TrendingUp
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    activeStore,
    theme,
    products,
    language,
    setLanguage,
    t,
    currentPage, 
    setCurrentPage, 
    setAdminTab,
    cartCount, 
    cartSubtotal, 
    setIsCartDrawerOpen, 
    wishlist, 
    searchQuery, 
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getCategoryName,
    getProductName,
    getProductTagline,
    setSelectedProductId,
    currentCustomer,
    setIsCustomerAuthModalOpen,
    setIsCustomerAccountModalOpen,
    logoutCustomer
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Click outside listener to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Arabic text normalization for flexible matching
  const normalizeArabic = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ة]/g, 'ه')
      .replace(/[يى]/g, 'ي')
      .replace(/[\u064B-\u065F]/g, '');
  };

  const cleanQuery = searchQuery.trim();
  const normalizedQ = normalizeArabic(cleanQuery);

  // Filter matching products
  const allMatchingProducts = cleanQuery.length > 0
    ? products.filter((p) => {
        const name = getProductName(p);
        const tagline = getProductTagline(p);
        const cat = getCategoryName(p.category);
        const tags = (p.tags || []).join(' ');
        const haystack = `${name} ${tagline} ${cat} ${tags}`;
        return normalizeArabic(haystack).includes(normalizedQ);
      })
    : [];

  const suggestedProducts = allMatchingProducts.slice(0, 5);
  const totalMatchingCount = allMatchingProducts.length;

  // Filter matching categories
  const matchingCategories = cleanQuery.length >= 2
    ? (Array.from(new Set(products.map((p) => p.category))) as ProductCategory[]).filter((cat) => {
        const catName = getCategoryName(cat);
        return normalizeArabic(catName).includes(normalizedQ);
      })
    : [];

  const handleSelectProduct = (product: any) => {
    setSelectedProductId(product.id);
    setCurrentPage('product-detail');
    setIsSuggestionsOpen(false);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleSelectCategory = (cat: ProductCategory) => {
    setSelectedCategory(cat);
    setCurrentPage('shop');
    setIsSuggestionsOpen(false);
    setIsSearchOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleViewAllResults = () => {
    setCurrentPage('shop');
    setIsSuggestionsOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuggestionsOpen(false);
    if (currentPage !== 'shop') {
      setCurrentPage('shop');
    }
  };

  // Dynamically derive unique categories from this store's products
  const storeCategories = Array.from(
    new Set(products.map((p) => p.category))
  ).slice(0, 3) as ProductCategory[];

  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const isDarkHeader = activeStore.design.headerStyle === 'dark';

  // Dynamic logo size resolution (Customizable by store manager)
  const getLogoSizePx = (size?: string | number): number => {
    if (typeof size === 'number' && size >= 24 && size <= 100) return size;
    switch (size) {
      case 'sm': return 32;
      case 'md': return 42;
      case 'lg': return 54;
      case 'xl': return 68;
      default: return 42;
    }
  };
  const logoSizePx = getLogoSizePx(activeStore.design.logoSize);

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all shadow-sm ${
        isDarkHeader
          ? 'bg-slate-900/95 border-slate-800 text-white'
          : 'bg-white/95 border-slate-200/80 text-slate-900'
      }`}
    >
      {/* Store announcement micro banner (Optional) */}
      {activeStore.design.showAnnouncementBar && (
        <div
          className="text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2"
          style={{ backgroundColor: theme.hex }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white shrink-0" />
          <span>
            {language === 'ar'
              ? activeStore.design.announcementTextAr || activeStore.design.announcementText || `شحن مجاني للطلبات فوق ${activeStore.settings.currency}${activeStore.settings.freeShippingThreshold} في ${displayStoreName}`
              : activeStore.design.announcementText || activeStore.design.announcementTextAr || `Free express shipping on orders over ${activeStore.settings.currency}${activeStore.settings.freeShippingThreshold} at ${displayStoreName}`}
          </span>
          <span className="hidden md:inline-block opacity-60">|</span>
          <button 
            onClick={() => { setCurrentPage('shop'); setSelectedCategory('All'); }}
            className="hidden md:inline-flex items-center gap-1 underline hover:opacity-90 transition-opacity font-bold"
          >
            <span>{t.shopNow}</span>
            <ArrowRight className={`w-3 h-3 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-4">
          {/* Store Logo & Title (Borderless with customizable size) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentPage('home');
                setSelectedCategory('All');
              }}
              className="flex items-center gap-2.5 group text-start shrink-0"
            >
              <div
                className="flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                style={{
                  height: `${logoSizePx}px`,
                  minWidth: `${logoSizePx}px`,
                }}
              >
                {activeStore.design.customLogoUrl ? (
                  <img
                    src={activeStore.design.customLogoUrl}
                    alt={displayStoreName}
                    className="max-h-full w-auto object-contain select-none"
                    style={{
                      maxHeight: `${logoSizePx}px`,
                      maxWidth: `${logoSizePx * 2.5}px`,
                    }}
                  />
                ) : (
                  <span
                    className="select-none leading-none"
                    role="img"
                    aria-label={displayStoreName}
                    style={{ fontSize: `${Math.round(logoSizePx * 0.75)}px` }}
                  >
                    {activeStore.design.logoEmoji}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <span
                  className={`font-black text-base sm:text-xl tracking-tight block leading-tight truncate max-w-[110px] xs:max-w-[150px] sm:max-w-xs ${
                    isDarkHeader ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {displayStoreName}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links (Conveniently ordered: Home -> Shop All -> Categories -> My Orders) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 lg:gap-2">
            <button
              onClick={() => {
                setCurrentPage('home');
                setSelectedCategory('All');
              }}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                currentPage === 'home'
                  ? `${theme.text} bg-slate-100/90 font-bold shadow-2xs`
                  : isDarkHeader
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </button>

            <button
              onClick={() => {
                setCurrentPage('shop');
                setSelectedCategory('All');
              }}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                currentPage === 'shop' && selectedCategory === 'All'
                  ? `${theme.text} bg-slate-100/90 font-bold shadow-2xs`
                  : isDarkHeader
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {t.navShopAll}
            </button>

            {storeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCurrentPage('shop');
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  currentPage === 'shop' && selectedCategory === cat
                    ? `${theme.text} bg-slate-100/90 font-bold shadow-2xs`
                    : isDarkHeader
                    ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {getCategoryName(cat)}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage('orders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                currentPage === 'orders'
                  ? `${theme.text} bg-slate-100/90 font-bold shadow-2xs`
                  : isDarkHeader
                  ? 'text-slate-300 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Package className="w-3.5 h-3.5 opacity-70" />
              <span>{t.navMyOrders}</span>
            </button>
          </nav>

          {/* Actions: Search, Wishlist, Language, User Account, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 1. Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className={`p-2 rounded-full border transition-all ${
                isSearchOpen
                  ? (isDarkHeader ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900')
                  : (isDarkHeader ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs')
              }`}
              title={language === 'ar' ? 'البحث عن المنتجات' : 'Search products'}
              aria-label={language === 'ar' ? 'البحث عن المنتجات' : 'Search products'}
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* 2. Wishlist Button */}
            <button
              onClick={() => setCurrentPage('wishlist')}
              className={`hidden md:flex relative p-2 rounded-full border transition-all ${
                currentPage === 'wishlist'
                  ? (isDarkHeader ? 'bg-slate-800 border-slate-700 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600')
                  : (isDarkHeader ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-rose-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-rose-600 hover:bg-slate-100 shadow-2xs')
              }`}
              title={t.navWishlist}
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -end-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* 3. Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                isDarkHeader
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
              title={language === 'en' ? 'التحويل للغة العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5" style={{ color: theme.hex }} />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Customer User Account Button / Dropdown (Desktop & Mobile) */}
            <div>
              {currentCustomer ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isDarkHeader
                        ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
                    }`}
                    title={currentCustomer.name}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={currentCustomer.avatar || ANONYMOUS_USER_AVATAR}
                        alt={currentCustomer.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = ANONYMOUS_USER_AVATAR; }}
                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover bg-slate-100 ring-1 ring-slate-200"
                      />
                      <span className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-[7.5px] font-black shadow-xs ring-1.5 ring-white">
                        ✓
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col text-start leading-tight">
                      <span className="font-bold text-xs truncate max-w-[110px]">{currentCustomer.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate max-w-[110px]">
                        {currentCustomer.city || currentCustomer.state || (language === 'ar' ? 'العراق' : 'Iraq')}
                      </span>
                    </div>
                    <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </button>

                  {/* User Dropdown Menu with Shipping Location Details */}
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)} 
                      />
                      <div className="absolute end-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                        {/* Customer Identity Card */}
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={currentCustomer.avatar || ANONYMOUS_USER_AVATAR}
                              alt=""
                              onError={(e) => { (e.target as HTMLImageElement).src = ANONYMOUS_USER_AVATAR; }}
                              className="w-10 h-10 rounded-full object-cover bg-slate-100 shrink-0 border border-slate-200 ring-1 ring-slate-100"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-slate-900 truncate">{currentCustomer.name}</p>
                              <p className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-semibold" dir="ltr">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                                <span>{currentCustomer.phone}</span>
                              </p>
                            </div>
                          </div>

                          {/* Shipping Location Details Card */}
                          <div className="mt-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-[11px]">
                            <div className="flex items-center justify-between text-slate-700 font-bold mb-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>{language === 'ar' ? 'موقع التوصيل المعتمد:' : 'Shipping Address:'}</span>
                              </span>
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-mono">
                                {currentCustomer.state || 'العراق'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium truncate">
                              {currentCustomer.address 
                                ? `${currentCustomer.city ? currentCustomer.city + ' - ' : ''}${currentCustomer.address}` 
                                : (language === 'ar' ? 'لم يتم حفظ تفاصيل الشارع بعد' : 'No street address saved')}
                            </p>
                          </div>
                        </div>

                        {/* Dropdown Options */}
                        <div className="py-1 text-xs">
                          {/* Manage Account & Shipping Location button */}
                          <button
                            onClick={() => {
                              setUserMenuOpen(false);
                              setIsCustomerAccountModalOpen(true);
                            }}
                            className="w-full px-4 py-2.5 text-start hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 font-bold"
                          >
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span>{language === 'ar' ? 'بيانات الحساب وموقع التوصيل' : 'Account & Shipping Details'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setCurrentPage('orders');
                              setUserMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-start hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                          >
                            <ShoppingBag className="w-4 h-4 text-slate-500" />
                            <span>{t.navMyOrders}</span>
                          </button>

                          <button
                            onClick={() => {
                              setCurrentPage('wishlist');
                              setUserMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-start hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                          >
                            <Heart className="w-4 h-4 text-rose-500" />
                            <span>{t.navWishlist}</span>
                          </button>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            onClick={() => {
                              logoutCustomer();
                              setUserMenuOpen(false);
                            }}
                            className="w-full px-4 py-2 text-start text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-bold transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                /* User Account trigger when not logged in */
                <button
                  onClick={() => setIsCustomerAuthModalOpen(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-bold transition-all border shadow-2xs ${
                    isDarkHeader
                      ? 'bg-slate-800/90 hover:bg-slate-750 text-white border-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                  title={language === 'ar' ? 'تسجيل الدخول / إنشاء حساب بالهاتف' : 'Sign In / Register'}
                >
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${theme.hex}18`, color: theme.hex }}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="hidden sm:flex flex-col text-start leading-none">
                    <span className="font-bold text-xs">{language === 'ar' ? 'حسابي' : 'Account'}</span>
                  </div>
                </button>
              )}
            </div>

            {/* 5. Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-full shadow-md transition-all active:scale-95 shrink-0"
              style={{ backgroundColor: theme.hex }}
              title={t.navBag}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="text-xs sm:text-sm font-bold">
                {cartCount > 0 ? `${cartCount}` : <span className="hidden xs:inline">{t.navBag}</span>}
              </span>
              {cartSubtotal > 0 && (
                <span className="hidden md:inline-block text-white/90 text-xs border-s border-white/30 ps-2 font-semibold">
                  {activeStore.settings.currency}{cartSubtotal.toFixed(0)}
                </span>
              )}
            </button>

            {/* 6. Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-full border transition-colors shrink-0 ${
                isDarkHeader 
                  ? 'bg-slate-800/80 border-slate-700/80 text-white hover:bg-slate-700' 
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Toggleable Search Bar & Instant Suggestions (Desktop & Mobile) */}
        {isSearchOpen && (
          <div className="pb-3.5 pt-1 transition-all relative">
            <div ref={searchContainerRef} className="relative w-full max-w-xl mx-auto">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSuggestionsOpen(true);
                  }}
                  onFocus={() => setIsSuggestionsOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsSuggestionsOpen(false);
                      setIsSearchOpen(false);
                    }
                  }}
                  className={`w-full py-2.5 text-sm rounded-2xl border shadow-sm focus:outline-none transition-all ${
                    isDarkHeader
                      ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-white'
                      : 'bg-white hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 focus:border-slate-400'
                  } ${language === 'ar' ? 'pr-11 pl-10' : 'pl-11 pr-10'}`}
                  style={{ backgroundColor: isDarkHeader ? '#1e293b' : '#ffffff' }}
                />
                <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                  language === 'ar' ? 'right-4' : 'left-4'
                }`} />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      if (searchInputRef.current) searchInputRef.current.focus();
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 rounded-full ${
                      language === 'ar' ? 'left-3' : 'right-3'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setIsSuggestionsOpen(false);
                    }}
                    className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 rounded-full ${
                      language === 'ar' ? 'left-3' : 'right-3'
                    }`}
                    title={language === 'ar' ? 'إغلاق' : 'Close'}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Instant Search Suggestions Dropdown */}
              {isSuggestionsOpen && (
                <div
                  className={`absolute top-full start-0 end-0 mt-2 z-50 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[75vh] overflow-y-auto scrollbar-thin ${
                    isDarkHeader
                      ? 'bg-slate-900 border-slate-700 text-white ring-1 ring-white/10'
                      : 'bg-white border-slate-200 text-slate-800 ring-1 ring-slate-900/10'
                  }`}
                  style={{ backgroundColor: isDarkHeader ? '#0f172a' : '#ffffff' }}
                >
                  {cleanQuery.length > 0 ? (
                    <>
                      {/* Matching Categories Shortcuts */}
                      {matchingCategories.length > 0 && (
                        <div className={`p-3 border-b ${
                          isDarkHeader ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-100'
                        }`}>
                          <span className="text-[11px] font-bold text-slate-400 block mb-2">
                            {language === 'ar' ? 'الأقسام المطابقة:' : 'Matching Categories:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {matchingCategories.map((cat) => {
                              const count = products.filter((p) => p.category === cat).length;
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => handleSelectCategory(cat)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all shadow-2xs group ${
                                    isDarkHeader
                                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:border-emerald-500'
                                      : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500'
                                  }`}
                                >
                                  <Tag className="w-3 h-3 text-emerald-600" />
                                  <span>{getCategoryName(cat)}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Matching Products List */}
                      {suggestedProducts.length > 0 ? (
                        <div>
                          <div className="p-2 space-y-1">
                            <span className="text-[11px] font-bold text-slate-400 px-2 py-1 block">
                              {language === 'ar' ? 'المنتجات المقترحة:' : 'Suggested Products:'}
                            </span>
                            {suggestedProducts.map((p) => {
                              const pName = getProductName(p);
                              const pTagline = getProductTagline(p);
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(p)}
                                  className={`w-full p-2.5 rounded-xl transition-colors flex items-center justify-between gap-3 text-start group ${
                                    isDarkHeader ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <img
                                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=150&q=80'}
                                      alt={pName}
                                      className="w-11 h-11 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700 group-hover:scale-105 transition-transform"
                                    />
                                    <div className="min-w-0">
                                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                                        {pName}
                                      </p>
                                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                        {pTagline || getCategoryName(p.category)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-end shrink-0">
                                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white font-mono block">
                                      {activeStore.settings.currency}{p.price.toLocaleString()}
                                    </span>
                                    {p.stock <= 0 && (
                                      <span className="text-[9px] text-rose-500 font-bold">
                                        {language === 'ar' ? 'نفد' : 'Out of stock'}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          {/* View All Results Button Footer */}
                          <div className={`p-2.5 border-t flex items-center justify-between ${
                            isDarkHeader ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-50 border-slate-100'
                          }`}>
                            <span className="text-xs text-slate-500">
                              {language === 'ar'
                                ? `تم العثور على ${totalMatchingCount} نتيجة بحث`
                                : `Found ${totalMatchingCount} results`}
                            </span>
                            <button
                              type="button"
                              onClick={handleViewAllResults}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all active:scale-95"
                              style={{ backgroundColor: theme.hex }}
                            >
                              <span>{language === 'ar' ? 'عرض كافة النتائج' : 'View All Results'}</span>
                              <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Empty Search State */
                        <div className="p-6 text-center space-y-2">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                            <Search className="w-5 h-5" />
                          </div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            {language === 'ar' ? `لا توجد نتائج مطابقة لـ "${cleanQuery}"` : `No matches found for "${cleanQuery}"`}
                          </p>
                          <p className="text-xs text-slate-400 max-w-xs mx-auto">
                            {language === 'ar'
                              ? 'تأكد من كتابة الكلمات بشكل صحيح أو تصفح التصنيفات الشائعة أدناه'
                              : 'Check for typos or try browsing our popular categories'}
                          </p>
                          <div className="pt-2 flex justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCategory('All');
                                setCurrentPage('shop');
                                setIsSuggestionsOpen(false);
                                setIsSearchOpen(false);
                              }}
                              className="px-3.5 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
                            >
                              {language === 'ar' ? 'تصفح جميع المنتجات' : 'Browse All Products'}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Initial Focus: Popular Categories & Trending Products */
                    <div className="p-4 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'أقسام التسوق الشائعة:' : 'Popular Categories:'}</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {storeCategories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleSelectCategory(cat)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                                isDarkHeader
                                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                              }`}
                            >
                              {getCategoryName(cat)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Featured Products Shortcut */}
                      {products.filter((p) => p.featured).slice(0, 3).length > 0 && (
                        <div className={`pt-2 border-t ${isDarkHeader ? 'border-slate-800' : 'border-slate-100'}`}>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                            {language === 'ar' ? 'منتجات مميزة قد تعجبك:' : 'Featured Products:'}
                          </span>
                          <div className="space-y-1">
                            {products.filter((p) => p.featured).slice(0, 3).map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => handleSelectProduct(p)}
                                className={`w-full p-2 rounded-xl transition-colors flex items-center justify-between gap-2 text-start ${
                                  isDarkHeader ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <img
                                    src={p.images?.[0] || ''}
                                    alt=""
                                    className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0"
                                  />
                                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                    {getProductName(p)}
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                                  {activeStore.settings.currency}{p.price.toLocaleString()}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Quick Delivery / Location Strip */}
      <div className={`md:hidden border-t px-4 py-1.5 flex items-center justify-between text-xs transition-colors ${
        isDarkHeader ? 'bg-slate-800/80 border-slate-700/60 text-slate-300' : 'bg-slate-100/70 border-slate-200/60 text-slate-700'
      }`}>
        <button
          onClick={() => {
            if (currentCustomer) {
              setIsCustomerAccountModalOpen(true);
            } else {
              setIsCustomerAuthModalOpen(true);
            }
          }}
          className="flex items-center gap-1.5 w-full justify-between"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold truncate">
              {language === 'ar' ? 'توصيل إلى:' : 'Delivery to:'}{' '}
              <span className={`font-bold ${isDarkHeader ? 'text-white' : 'text-slate-900'}`}>
                {currentCustomer?.state || currentCustomer?.city || (language === 'ar' ? 'العراق (كافة المحافظات)' : 'Iraq')}
              </span>
            </span>
          </div>
          <ChevronLeft className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${language === 'en' ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-4 pt-3 pb-6 space-y-3 shadow-lg ${
          isDarkHeader ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {/* Main Navigation Links */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setCurrentPage('shop');
                setSelectedCategory('All');
                setMobileMenuOpen(false);
              }}
              className="block w-full text-start py-2.5 px-3 text-base font-semibold rounded-xl hover:bg-slate-100/10 transition-colors"
            >
              {t.navShopAll}
            </button>
            {storeCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCurrentPage('shop');
                  setSelectedCategory(cat);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-start py-2 px-3 text-sm font-medium rounded-xl hover:bg-slate-100/10 transition-colors"
              >
                {getCategoryName(cat)}
              </button>
            ))}

            <button
              onClick={() => {
                setCurrentPage('orders');
                setMobileMenuOpen(false);
              }}
              className="w-full text-start py-2 px-3 text-sm font-medium rounded-xl hover:bg-slate-100/10 flex items-center gap-2.5 transition-colors"
            >
              <Package className="w-4 h-4 text-slate-400" />
              <span>{t.navMyOrders}</span>
            </button>

            <button
              onClick={() => {
                setCurrentPage('wishlist');
                setMobileMenuOpen(false);
              }}
              className="w-full text-start py-2 px-3 text-sm font-medium rounded-xl hover:bg-slate-100/10 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} />
                <span>{t.navWishlist}</span>
              </div>
              {wishlist.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500 text-xs font-bold font-mono">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>

          {/* Language Switcher in Mobile Drawer */}
          <div className="pt-2.5 border-t border-slate-200/50 flex items-center justify-between px-1">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" style={{ color: theme.hex }} />
              <span>{language === 'ar' ? 'لغة العرض' : 'Display Language'}</span>
            </span>
            <button
              onClick={() => {
                setLanguage(language === 'en' ? 'ar' : 'en');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                isDarkHeader
                  ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                  : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200'
              }`}
            >
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </div>

          {/* Mobile User Account & Location */}
          <div className="pt-2.5 border-t border-slate-200/50">
            {currentCustomer ? (
              <div className="p-3 bg-emerald-50/80 rounded-xl space-y-2.5 border border-emerald-100/80">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-slate-900 block truncate">{currentCustomer.name}</span>
                    <span className="text-[11px] font-mono text-emerald-700" dir="ltr">{currentCustomer.phone}</span>
                  </div>
                  <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-bold shrink-0">
                    WhatsApp ✓
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white/90 p-1.5 rounded-lg border border-emerald-100">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate">{currentCustomer.state || 'بغداد'} • {currentCustomer.city || 'الكرخ'}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      setIsCustomerAccountModalOpen(true);
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-emerald-800 font-bold hover:underline flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>{language === 'ar' ? 'تعديل موقع التوصيل' : 'Edit Location'}</span>
                  </button>
                  <button
                    onClick={() => {
                      logoutCustomer();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-600 font-bold hover:underline"
                  >
                    {language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsCustomerAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-between shadow-sm hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${theme.hex}25`, color: theme.hex }}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>{language === 'ar' ? 'حسابي (تسجيل الدخول / إنشاء حساب)' : 'Account (Sign In / Register)'}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-normal">
                  {language === 'ar' ? 'بالهاتف' : 'By Phone'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
