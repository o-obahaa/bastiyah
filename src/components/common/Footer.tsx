import React from 'react';
import { useStore } from '../../context/StoreContext';
import { renderBadgeIcon, getDefaultTrustBadges } from '../admin/TrustBadgesEditor';

export const Footer: React.FC = () => {
  const { 
    activeStore, 
    theme, 
    setCurrentPage, 
    setSelectedCategory, 
    t, 
    language,
    getCategoryName
  } = useStore();
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const displayDesc = language === 'ar' ? activeStore.descriptionAr || activeStore.description : activeStore.description;

  // Dynamically derive unique categories from this store's products
  const storeCategories = Array.from(new Set(activeStore.products.map((p) => p.category)));

  // Trust Badges resolution (Store customized or defaults)
  const showTrustBadges = activeStore.design.showTrustBadges ?? true;
  const badges = (activeStore.design.trustBadges && activeStore.design.trustBadges.length > 0)
    ? activeStore.design.trustBadges.filter(b => b.enabled)
    : getDefaultTrustBadges(
        activeStore.settings.currency,
        activeStore.settings.freeShippingThreshold,
        activeStore.settings.supportEmail
      ).filter(b => b.enabled);

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value props banner */}
        {showTrustBadges && badges.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
            {badges.map((badge) => (
              <div key={badge.id} className="flex items-start gap-3">
                <div
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                  style={{ color: theme.hex }}
                >
                  {renderBadgeIcon(badge.icon, 'w-5 h-5')}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {language === 'ar' ? badge.titleAr || badge.title : badge.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar' ? badge.descriptionAr || badge.description : badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 py-12">
          {/* Brand info */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-extrabold text-xl p-1 overflow-hidden">
                {activeStore.design.customLogoUrl ? (
                  <img src={activeStore.design.customLogoUrl} alt="" className="w-full h-full object-contain rounded-lg" />
                ) : (
                  <span>{activeStore.design.logoEmoji}</span>
                )}
              </div>
              <div>
                <span className="font-black text-xl tracking-wider text-white block">
                  {displayStoreName}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {displayDesc}
            </p>
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

          {/* Customer Service */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
              {language === 'ar' ? 'خدمة العملاء' : 'Customer Care'}
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
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-900 flex items-center justify-center text-xs text-slate-400">
          <p className="tracking-wide text-center font-medium">
            Powered by <span className="font-bold text-white">Bastiyah</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
