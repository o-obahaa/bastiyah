import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory } from '../../types';
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
  Check
} from 'lucide-react';
import { getStorePathLabel } from '../../utils/urlUtils';

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
    logoutCustomer
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
              <div>
                <span
                  className={`font-black text-lg sm:text-xl tracking-tight block leading-tight ${
                    isDarkHeader ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {displayStoreName}
                </span>
                <span
                  className="font-mono text-[11px] font-bold block"
                  style={{ color: theme.hex }}
                  dir="ltr"
                >
                  {getStorePathLabel(activeStore.slug)}
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-2 text-sm rounded-full border focus:outline-none transition-all ${
                  isDarkHeader
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-white'
                    : 'bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-900 border-slate-200 placeholder:text-slate-400'
                } ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
              />
              <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
                language === 'ar' ? 'right-3.5' : 'left-3.5'
              }`} />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={`absolute top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-0.5 ${
                    language === 'ar' ? 'left-3' : 'right-3'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5">
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                isDarkHeader
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title={language === 'en' ? 'التحويل للغة العربية' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5" style={{ color: theme.hex }} />
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Customer WhatsApp Account Button / Dropdown */}
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
                      src={currentCustomer.avatar}
                      alt={currentCustomer.name}
                      className="w-6 h-6 rounded-lg object-cover bg-emerald-100"
                    />
                    <span className="absolute -bottom-1 -end-1 w-3.5 h-3.5 bg-[#25D366] text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-xs ring-1 ring-white">
                      ✓
                    </span>
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">{currentCustomer.name}</span>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setUserMenuOpen(false)} 
                    />
                    <div className="absolute end-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {currentCustomer.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{currentCustomer.name}</p>
                            <p className="text-[11px] font-mono text-emerald-700 flex items-center gap-1" dir="ltr">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]" />
                              <span>{currentCustomer.phone}</span>
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-3 h-3 text-[#25D366]" />
                          <span>{language === 'ar' ? 'موثّق عبر تطبيق واتساب' : 'WhatsApp Verified'}</span>
                        </div>
                      </div>

                      <div className="py-1 text-xs">
                        <button
                          onClick={() => {
                            setCurrentPage('orders');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-start hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
                        >
                          <ShoppingBag className="w-4 h-4 text-emerald-600" />
                          <span>{t.navMyOrders}</span>
                        </button>
                        <button
                          onClick={() => {
                            setCurrentPage('wishlist');
                            setUserMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-start hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 font-semibold"
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
              <button
                onClick={() => setIsCustomerAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border shadow-2xs ${
                  isDarkHeader
                    ? 'bg-[#128C7E]/20 hover:bg-[#128C7E]/30 text-emerald-300 border-[#128C7E]/40'
                    : 'bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border-[#25D366]/30'
                }`}
                title={language === 'ar' ? 'تسجيل الدخول والتحقق برقم الهاتف' : 'Sign In via Phone Number'}
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                <span className="hidden sm:inline">{language === 'ar' ? 'دخول بالهاتف' : 'Phone Sign In'}</span>
                <span className="sm:hidden">{language === 'ar' ? 'دخول' : 'Sign In'}</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => setCurrentPage('wishlist')}
              className={`relative p-2.5 rounded-full transition-colors ${
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
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 text-white rounded-xl shadow-md transition-all active:scale-95"
              style={{ backgroundColor: theme.hex }}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <span className="text-xs sm:text-sm font-bold">
                {cartCount > 0 ? `${cartCount}` : t.navBag}
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
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2 text-sm rounded-lg border focus:outline-none ${
                isDarkHeader
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-900'
              } ${language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
            />
            <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
              language === 'ar' ? 'right-3' : 'left-3'
            }`} />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b px-4 pt-2 pb-6 space-y-2 ${
          isDarkHeader ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <button
            onClick={() => {
              setCurrentPage('shop');
              setSelectedCategory('All');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-start py-2 px-3 text-base font-semibold rounded-lg"
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
              className="block w-full text-start py-2 px-3 text-base font-medium rounded-lg"
            >
              {getCategoryName(cat)}
            </button>
          ))}

          {/* Mobile WhatsApp Account */}
          <div className="pt-3 border-t border-slate-200/60 mt-3">
            {currentCustomer ? (
              <div className="p-3 bg-emerald-50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{currentCustomer.name}</span>
                    <span className="text-[11px] font-mono text-emerald-700" dir="ltr">{currentCustomer.phone}</span>
                  </div>
                  <span className="text-[10px] bg-[#25D366] text-white px-2 py-0.5 rounded-full font-bold">
                    WhatsApp ✓
                  </span>
                </div>
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
            ) : (
              <button
                onClick={() => {
                  setIsCustomerAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>{language === 'ar' ? 'تسجيل الدخول برقم الهاتف' : 'Sign In via Phone Number'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
