import React, { useState } from 'react';
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
  ExternalLink,
  Copy,
  Check,
  Globe,
  LogOut,
  Store,
  Sparkles,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { getStoreDisplayUrl, getStorePathLabel } from '../../utils/urlUtils';

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
    addToast,
  } = useStore();

  const [copiedLink, setCopiedLink] = useState(false);

  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  const handleCopyStoreLink = () => {
    const storeUrl = getStoreDisplayUrl(activeStore.slug, false);
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    addToast(
      language === 'ar' ? 'تم نسخ رابط متجرك الخاص بنجاح!' : 'Store link copied to clipboard!',
      'success'
    );
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const tabs = [
    { 
      id: 'dashboard' as const, 
      label: language === 'ar' ? 'نظرة عامة والتحليلات' : t.dashboard, 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      id: 'products' as const, 
      label: language === 'ar' ? 'المنتجات والمخزون' : t.products, 
      badge: products.length,
      alertCount: lowStockCount,
      icon: <Package className="w-4 h-4" /> 
    },
    { 
      id: 'orders' as const, 
      label: language === 'ar' ? 'الطلبات والمبيعات' : t.orders, 
      badge: orders.length,
      pendingCount: pendingOrdersCount,
      icon: <ShoppingBag className="w-4 h-4" /> 
    },
    { 
      id: 'customers' as const, 
      label: language === 'ar' ? 'العملاء والولاء' : t.customers, 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'design' as const, 
      label: language === 'ar' ? 'المظهر والهوية' : t.storeDesignTab, 
      icon: <Palette className="w-4 h-4" /> 
    },
    { 
      id: 'settings' as const, 
      label: language === 'ar' ? 'الإعدادات والكوبونات' : t.settingsAndCoupons, 
      icon: <Settings className="w-4 h-4" /> 
    },
  ];

  const ReturnArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const storeUrl = getStoreDisplayUrl(activeStore.slug, false);

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20 font-sans">
      {/* Store-Specific Admin Top App Bar */}
      <div className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            
            {/* Left: Brand Identity & Quick Storefront Preview */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-102 shrink-0"
                title={t.exitAdmin}
              >
                <ReturnArrow className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{language === 'ar' ? 'الواجهة' : t.exitAdmin}</span>
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-white text-2xl shadow-inner shrink-0"
                  style={{ borderColor: `${theme.hex}66` }}
                >
                  {activeStore.design.customLogoUrl ? (
                    <img 
                      src={activeStore.design.customLogoUrl} 
                      alt="" 
                      className="w-full h-full object-cover rounded-2xl" 
                    />
                  ) : (
                    <span>{activeStore.design.logoEmoji}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-sm sm:text-base tracking-wide text-white truncate">
                      {displayStoreName}
                    </span>
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-md text-white uppercase tracking-wider shrink-0"
                      style={{ backgroundColor: theme.hex }}
                    >
                      {activeStore.plan || 'Starter'}
                    </span>
                    <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {language === 'ar' ? 'المتجر نشط' : 'Online'}
                    </span>
                  </div>

                  {/* Store Link Pill with Copy Button */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <button
                      onClick={handleCopyStoreLink}
                      className="group inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors font-mono"
                      title={language === 'ar' ? 'نسخ رابط المتجر المباشر' : 'Copy store direct link'}
                    >
                      <span>{getStorePathLabel(activeStore.slug, false)}</span>
                      {copiedLink ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300" />
                      )}
                    </button>

                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                      title={language === 'ar' ? 'فتح متجرك في نافذة جديدة' : 'Open storefront in new tab'}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions, Language Toggle, and Admin Account Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language Switcher */}
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
                title={language === 'en' ? 'التحويل للعربية' : 'Switch to English'}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'en' ? 'العربية' : 'EN'}</span>
              </button>

              {/* View Storefront in Client Mode */}
              <button
                onClick={() => setCurrentPage('home')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
              >
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ar' ? 'معاينة المتجر' : 'View Storefront'}</span>
              </button>

              {/* Admin Profile & Logout */}
              <div className="flex items-center gap-2 ps-2 border-s border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
                  {activeStore.ownerName ? activeStore.ownerName.charAt(0) : 'M'}
                </div>

                <div className="hidden xl:block text-start">
                  <span className="text-xs font-bold text-slate-200 block leading-tight">
                    {activeStore.ownerName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono" dir="ltr">
                    {activeStore.ownerPhone || activeStore.ownerEmail}
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
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all select-none ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                  }`}
                  style={isActive ? { backgroundColor: theme.hex } : undefined}
                >
                  {tab.icon}
                  <span>{tab.label}</span>

                  {/* Pending Orders Counter */}
                  {tab.pendingCount !== undefined && tab.pendingCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 animate-pulse">
                      {tab.pendingCount}
                    </span>
                  )}

                  {/* Low Stock Alert Counter */}
                  {tab.alertCount !== undefined && tab.alertCount > 0 && (
                    <span 
                      className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white"
                      title={language === 'ar' ? `${tab.alertCount} منتجات قاربت على النفاد` : `${tab.alertCount} low stock items`}
                    >
                      {tab.alertCount}
                    </span>
                  )}
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
