import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShieldCheck, Truck, RotateCcw, Headphones, Crown, Globe } from 'lucide-react';
import { getStorePathLabel } from '../../utils/urlUtils';

export const Footer: React.FC = () => {
  const { 
    activeStore, 
    theme, 
    setCurrentPage, 
    setSelectedCategory, 
    t, 
    language,
    goToPlatform,
    getCategoryName
  } = useStore();
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const displayDesc = language === 'ar' ? activeStore.descriptionAr || activeStore.description : activeStore.description;

  // Dynamically derive unique categories from this store's products
  const storeCategories = Array.from(new Set(activeStore.products.map((p) => p.category)));

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value props banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800" style={{ color: theme.hex }}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.deliveryGuarantee}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'ar'
                  ? `توصيل مجاني للطلبات فوق ${activeStore.settings.currency}${activeStore.settings.freeShippingThreshold}`
                  : `Complimentary delivery over ${activeStore.settings.currency}${activeStore.settings.freeShippingThreshold}`}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800" style={{ color: theme.hex }}>
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.returnGuarantee}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{language === 'ar' ? 'إرجاع واستبدال مرن' : 'Hassle-free return & exchanges'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800" style={{ color: theme.hex }}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.warrantyGuarantee}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{language === 'ar' ? 'ضمان رسمي معتمد' : 'Full coverage protection'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800" style={{ color: theme.hex }}>
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t.conciergeGuarantee}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{activeStore.settings.supportEmail}</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 py-12">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-extrabold text-xl p-1">
                <span>{activeStore.design.logoEmoji}</span>
              </div>
              <div>
                <span className="font-black text-xl tracking-wider text-white block">
                  {displayStoreName}
                </span>
                <span className="font-mono text-xs" style={{ color: theme.hex }} dir="ltr">
                  {getStorePathLabel(activeStore.slug)}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {displayDesc}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => goToPlatform('landing')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-700/50 hover:bg-indigo-900 transition-colors"
                title={language === 'ar' ? 'الذهاب لموقع المنصة الرئيسي' : 'Visit Bastiyah Platform'}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {language === 'ar' ? 'مستضاف عبر منصة بسطية (Bastiyah)' : 'Hosted on Bastiyah Platform'}
                </span>
              </button>
            </div>
          </div>

          {/* Catalog Categories (Scoped to this store) */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {language === 'ar' ? 'أقسام المتجر' : 'Explore Collections'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => { setCurrentPage('shop'); setSelectedCategory('All'); }}
                  className="hover:text-white transition-colors"
                >
                  {t.catAll}
                </button>
              </li>
              {storeCategories.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => { setCurrentPage('shop'); setSelectedCategory(cat); }}
                    className="hover:text-white transition-colors"
                  >
                    {getCategoryName(cat)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service & Store Merchant Portal */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {language === 'ar' ? 'إدارة وخدمة المتجر' : 'Store & Admin Hub'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => setCurrentPage('orders')}
                  className="hover:text-white transition-colors"
                >
                  {t.navMyOrders}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('wishlist')}
                  className="hover:text-white transition-colors"
                >
                  {t.navWishlist}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('admin')}
                  className="font-bold transition-colors flex items-center gap-1"
                  style={{ color: theme.hex }}
                >
                  <span>{t.adminPanel}</span>
                  <span className="font-mono text-[10px] opacity-75">({activeStore.slug})</span>
                  <span>→</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {language === 'ar' ? 'النشرة البريدية' : 'Stay in the Loop'}
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              {language === 'ar' ? 'اشترك للحصول على أحدث العروض والخصومات الحصرية.' : 'Subscribe for private drop alerts, seasonal discount codes, and updates.'}
            </p>
            <div className="flex gap-1.5">
              <input
                type="email"
                placeholder="you@domain.com"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none w-full"
              />
              <button 
                onClick={(e) => { 
                  e.preventDefault(); 
                  alert(language === 'ar' ? `تم الاشتراك بنجاح في ${displayStoreName}!` : `Subscribed to ${displayStoreName}!`); 
                }}
                className="text-white px-3 py-2 rounded-lg text-xs font-semibold shrink-0 transition-opacity hover:opacity-90"
                style={{ backgroundColor: theme.hex }}
              >
                {language === 'ar' ? 'انضم' : 'Join'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2026 {displayStoreName} (<span className="font-mono text-slate-300">{getStorePathLabel(activeStore.slug)}</span>) • Powered by <span className="font-brand font-bold text-white">بسطية</span> <span className="text-slate-400">(Bastiyah)</span>
          </p>
          <div className="flex items-center gap-1">
            <span>Bastiyah Multi-Store Cloud • EN / AR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
