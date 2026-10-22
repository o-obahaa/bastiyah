import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Home, LayoutGrid, ShoppingBag, User } from 'lucide-react';
import { ANONYMOUS_USER_AVATAR } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const {
    currentPage,
    setCurrentPage,
    setSelectedCategory,
    cartCount,
    setIsCartDrawerOpen,
    currentCustomer,
    setIsCustomerAccountModalOpen,
    setIsCustomerAuthModalOpen,
    language,
    theme,
  } = useStore();

  const handleHomeClick = () => {
    setCurrentPage('home');
    setSelectedCategory('All');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShopClick = () => {
    setCurrentPage('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAccountClick = () => {
    if (currentCustomer) {
      setIsCustomerAccountModalOpen(true);
    } else {
      setIsCustomerAuthModalOpen(true);
    }
  };

  const isHomeActive = currentPage === 'home';
  const isShopActive = currentPage === 'shop';

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none">
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            isHomeActive ? 'font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          style={isHomeActive ? { color: theme.hex } : undefined}
        >
          {isHomeActive && (
            <span
              className="absolute top-0 inset-x-6 h-0.5 rounded-full"
              style={{ backgroundColor: theme.hex }}
            />
          )}
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] leading-none">{language === 'ar' ? 'الرئيسة' : 'Home'}</span>
        </button>

        {/* 2. Categories */}
        <button
          type="button"
          onClick={handleShopClick}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            isShopActive ? 'font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
          style={isShopActive ? { color: theme.hex } : undefined}
        >
          {isShopActive && (
            <span
              className="absolute top-0 inset-x-6 h-0.5 rounded-full"
              style={{ backgroundColor: theme.hex }}
            />
          )}
          <LayoutGrid className={`w-5 h-5 ${isShopActive ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[11px] leading-none">{language === 'ar' ? 'التصنيفات' : 'Categories'}</span>
        </button>

        {/* 3. Shopping Cart */}
        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 transition-colors relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -end-2 min-w-[1.125rem] h-4.5 px-1 rounded-full text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs"
                style={{ backgroundColor: theme.hex }}
              >
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] leading-none">{language === 'ar' ? 'سلّة التسوّق' : 'Cart'}</span>
        </button>

        {/* 4. My Account / Login */}
        <button
          type="button"
          onClick={handleAccountClick}
          className="flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800 transition-colors relative"
        >
          <div className="relative">
            {currentCustomer?.avatar ? (
              <img
                src={currentCustomer.avatar}
                alt=""
                onError={(e) => { (e.target as HTMLImageElement).src = ANONYMOUS_USER_AVATAR; }}
                className="w-5 h-5 rounded-full object-cover border border-slate-300"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
            {currentCustomer && (
              <span className="absolute -bottom-0.5 -end-0.5 w-2 h-2 bg-[#25D366] rounded-full ring-1 ring-white" />
            )}
          </div>
          <span className="text-[11px] leading-none truncate max-w-[70px]">
            {currentCustomer ? currentCustomer.name.split(' ')[0] : (language === 'ar' ? 'حسابي' : 'Account')}
          </span>
        </button>
      </div>
    </nav>
  );
};
