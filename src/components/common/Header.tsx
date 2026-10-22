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
  Package
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
    currentCustomer,
    setIsCustomerAuthModalOpen,
    setIsCustomerAccountModalOpen,
    logoutCustomer
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          {/* Store Logo & Custom Domain Subtitle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentPage('home');
                setSelectedCategory('All');
              }}
              className="flex items-center gap-2.5 group text-start"
            >
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform p-1 border overflow-hidden"
                style={{
                  backgroundColor: `${theme.hex}20`,
                  borderColor: `${theme.hex}50`,
                }}
              >
                {activeStore.design.customLogoUrl ? (
                  <img
                    src={activeStore.design.customLogoUrl}
                    alt={displayStoreName}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-2xl select-none" role="img" aria-label={displayStoreName}>
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 sm:gap-6">
            <button
              onClick={() => {
                setCurrentPage('shop');
                setSelectedCategory('All');
              }}
              className={`text-sm font-semibold transition-colors ${
                currentPage === 'shop' && selectedCategory === 'All'
                  ? theme.text
                  : isDarkHeader
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
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
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'shop' && selectedCategory === cat
                    ? `${theme.text} font-bold`
                    : isDarkHeader
                    ? 'text-slate-300 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {getCategoryName(cat)}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage('orders')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'orders'
                  ? `${theme.text} font-bold`
                  : isDarkHeader
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.navMyOrders}
            </button>
          </nav>

          {/* Actions: Store Design, Store Admin, Wishlist, Cart */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Search Icon Button */}
            <button
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className={`p-2 rounded-xl border transition-all ${
                isSearchOpen
                  ? (isDarkHeader ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900')
                  : (isDarkHeader ? 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-2xs')
              }`}
              title={language === 'ar' ? 'البحث عن المنتجات' : 'Search products'}
              aria-label={language === 'ar' ? 'البحث عن المنتجات' : 'Search products'}
            >
              {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>

            {/* Language Switcher - on desktop/tablet */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDarkHeader
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={language === 'en' ? 'التحويل للغة العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5" style={{ color: theme.hex }} />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Customer User Account Button / Dropdown - on desktop */}
            <div className="hidden sm:block">
              {currentCustomer ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      isDarkHeader
                        ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-750'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
                    }`}
                    title={currentCustomer.name}
                  >
                    <div className="relative">
                      <img
                        src={currentCustomer.avatar || ANONYMOUS_USER_AVATAR}
                        alt={currentCustomer.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = ANONYMOUS_USER_AVATAR; }}
                        className="w-7 h-7 rounded-xl object-cover bg-slate-100"
                      />
                      <span className="absolute -bottom-1 -end-1 w-3.5 h-3.5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-xs ring-1 ring-white">
                        ✓
                      </span>
                    </div>
                    <div className="hidden sm:flex flex-col text-start leading-tight">
                      <span className="font-bold text-xs truncate max-w-[110px]">{currentCustomer.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal truncate max-w-[110px]">
                        {currentCustomer.city || currentCustomer.state || (language === 'ar' ? 'العراق' : 'Iraq')}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
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
                              className="w-9 h-9 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
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
                  className={`flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                    isDarkHeader
                      ? 'bg-slate-800/90 hover:bg-slate-750 text-white border-slate-700'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                  title={language === 'ar' ? 'تسجيل الدخول / إنشاء حساب بالهاتف' : 'Sign In / Register'}
                >
                  <div 
                    className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${theme.hex}18`, color: theme.hex }}
                  >
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col text-start leading-none">
                    <span className="font-bold text-xs">{language === 'ar' ? 'حسابي' : 'Account'}</span>
                  </div>
                </button>
              )}
            </div>

            {/* Wishlist Button - on desktop/tablet */}
            <button
              onClick={() => setCurrentPage('wishlist')}
              className={`hidden md:flex relative p-2.5 rounded-full transition-colors ${
                isDarkHeader
                  ? 'text-slate-300 hover:text-rose-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:text-rose-600 hover:bg-slate-100'
              }`}
              title={t.navWishlist}
            >
              <Heart className={`w-5 h-5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : ''}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 text-white rounded-xl shadow-md transition-all active:scale-95 shrink-0"
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

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-xl border transition-colors shrink-0 ${
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

        {/* Toggleable Search Bar (Desktop & Mobile when Search Icon is active) */}
        {isSearchOpen && (
          <div className="pb-3.5 pt-1 transition-all">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xl mx-auto">
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2.5 text-sm rounded-2xl border shadow-sm focus:outline-none transition-all ${
                  isDarkHeader
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-white'
                    : 'bg-white hover:bg-slate-50 focus:bg-white text-slate-900 border-slate-200 placeholder:text-slate-400 focus:border-slate-400'
                } ${language === 'ar' ? 'pr-11 pl-10' : 'pl-11 pr-10'}`}
              />
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none ${
                language === 'ar' ? 'right-4' : 'left-4'
              }`} />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 rounded-full ${
                    language === 'ar' ? 'left-3' : 'right-3'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 rounded-full ${
                    language === 'ar' ? 'left-3' : 'right-3'
                  }`}
                  title={language === 'ar' ? 'إغلاق' : 'Close'}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        )}
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
