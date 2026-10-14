import React from 'react';
import { useStore } from '../../context/StoreContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';
import { AdminSettings } from './AdminSettings';
import { AdminStoreDesign } from './AdminStoreDesign';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  Palette,
  ArrowLeft, 
  ArrowRight,
  Crown,
  Globe,
  LogOut
} from 'lucide-react';
import { getStorePathLabel } from '../../utils/urlUtils';

export const AdminLayout: React.FC = () => {
  const { 
    activeStore,
    theme,
    adminTab, 
    setAdminTab, 
    setCurrentPage, 
    orders, 
    products, 
    t, 
    language,
    setLanguage,
    goToPlatform,
    logoutStoreAdmin,
  } = useStore();

  const tabs = [
    { id: 'dashboard' as const, label: t.dashboard, icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products' as const, label: `${t.products} (${products.length})`, icon: <Package className="w-4 h-4" /> },
    { id: 'orders' as const, label: `${t.orders} (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'customers' as const, label: t.customers, icon: <Users className="w-4 h-4" /> },
    { id: 'design' as const, label: t.storeDesignTab, icon: <Palette className="w-4 h-4" /> },
    { id: 'settings' as const, label: t.settingsAndCoupons, icon: <Settings className="w-4 h-4" /> },
  ];

  const ReturnArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Store-Specific Admin Top App Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand & Return to Storefront */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
                title={t.exitAdmin}
              >
                <ReturnArrow className="w-4 h-4 text-emerald-400" />
                <span>{t.exitAdmin}</span>
              </button>

              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white text-xl p-1"
                  style={{ borderColor: `${theme.hex}66` }}
                >
                  <span>{activeStore.design.logoEmoji}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm sm:text-base tracking-wide text-white">
                      {displayStoreName}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white uppercase tracking-wider"
                      style={{ backgroundColor: theme.hex }}
                    >
                      {t.adminPortal}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-400 hidden sm:block" dir="ltr">
                    {getStorePathLabel(activeStore.slug, true)}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Language, Link to Platform, and Super Admin */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                title={language === 'en' ? 'التحويل للعربية' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'en' ? 'العربية' : 'EN'}</span>
              </button>

              <button
                onClick={() => goToPlatform('landing')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-colors"
                title={language === 'ar' ? 'الذهاب للموقع الرئيسي (بسطية)' : 'Visit Bastiyah Platform'}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span>{language === 'ar' ? 'موقع المنصة' : 'Bastiyah Platform'}</span>
              </button>

              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t.storeEngineActive}
              </span>

              <div className="flex items-center gap-2 ps-2 border-s border-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Admin Avatar"
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                />
                <div className="hidden lg:block text-start">
                  <span className="text-xs font-bold text-slate-200 block leading-tight">
                    {activeStore.ownerName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono" dir="ltr">
                    {activeStore.ownerEmail}
                  </span>
                </div>
                <button
                  onClick={() => logoutStoreAdmin(activeStore.id)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-colors"
                  title={language === 'ar' ? 'تسجيل الخروج من إدارة المتجر' : 'Log Out of Store Admin'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'خروج' : 'Log Out'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto py-2.5 border-t border-slate-800/80 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  style={isActive ? { backgroundColor: theme.hex } : undefined}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Admin Content View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {adminTab === 'dashboard' && <AdminDashboard />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'customers' && <AdminCustomers />}
        {adminTab === 'design' && <AdminStoreDesign />}
        {adminTab === 'settings' && <AdminSettings />}
      </div>
    </div>
  );
};
