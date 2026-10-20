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
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { getStoreDisplayUrl, getStorePathLabel } from '../../utils/urlUtils';
import { AdminTab } from '../../types';

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  const navGroups: {
    groupTitleAr: string;
    groupTitleEn: string;
    items: {
      id: AdminTab;
      labelAr: string;
      labelEn: string;
      icon: React.ReactNode;
      badge?: number;
      badgeColor?: string;
      alertCount?: number;
    }[];
  }[] = [
    {
      groupTitleAr: 'الرئيسية والعمليات',
      groupTitleEn: 'Main & Operations',
      items: [
        {
          id: 'dashboard',
          labelAr: 'لوحة التحكم',
          labelEn: 'Overview',
          icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'orders',
          labelAr: 'الطلبات والمبيعات',
          labelEn: 'Orders',
          badge: orders.length,
          alertCount: pendingOrdersCount,
          badgeColor: 'bg-amber-500',
          icon: <ShoppingBag className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'products',
          labelAr: 'المنتجات والمخزون',
          labelEn: 'Products & Inventory',
          badge: products.length,
          alertCount: lowStockCount,
          badgeColor: 'bg-rose-500',
          icon: <Package className="w-4 h-4 shrink-0" />,
        },
        {
          id: 'customers',
          labelAr: 'العملاء وقاعدة البيانات',
          labelEn: 'Customers',
          icon: <Users className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitleAr: 'تخصيص الواجهة',
      groupTitleEn: 'Storefront',
      items: [
        {
          id: 'design',
          labelAr: 'تصميم وهوية المتجر',
          labelEn: 'Store Design',
          icon: <Palette className="w-4 h-4 shrink-0" />,
        },
      ],
    },
    {
      groupTitleAr: 'الإعدادات والأنظمة',
      groupTitleEn: 'Preferences',
      items: [
        {
          id: 'settings',
          labelAr: 'الإعدادات والكوبونات',
          labelEn: 'Settings & Coupons',
          icon: <Settings className="w-4 h-4 shrink-0" />,
        },
      ],
    },
  ];

  const ReturnArrow = language === 'ar' ? ArrowRight : ArrowLeft;
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const storeUrl = getStoreDisplayUrl(activeStore.slug, false);

  const getActiveTabTitle = () => {
    switch (adminTab) {
      case 'dashboard':
        return language === 'ar' ? 'لوحة التحكم والتحليلات' : 'Dashboard Overview';
      case 'orders':
        return language === 'ar' ? 'إدارة الطلبات والمبيعات' : 'Orders Management';
      case 'products':
        return language === 'ar' ? 'كتالوج المنتجات والمخزون' : 'Products & Catalog';
      case 'customers':
        return language === 'ar' ? 'قاعدة بيانات العملاء' : 'Customer Database';
      case 'design':
        return language === 'ar' ? 'تصميم وهوية المتجر' : 'Store Design & Identity';
      case 'settings':
        return language === 'ar' ? 'إعدادات المتجر والكوبونات' : 'Settings & Discounts';
      default:
        return displayStoreName;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col lg:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shadow-inner shrink-0"
              style={{ borderColor: `${theme.hex}55` }}
            >
              {activeStore.design.customLogoUrl ? (
                <img src={activeStore.design.customLogoUrl} alt="" className="w-full h-full object-contain p-0.5 rounded-xl" />
              ) : (
                <span>{activeStore.design.logoEmoji}</span>
              )}
            </div>
            <span className="font-black text-sm text-white truncate max-w-[140px]">
              {displayStoreName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'المتجر' : 'Store'}</span>
          </button>

          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-colors"
          >
            {language === 'en' ? 'العربية' : 'EN'}
          </button>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Unified Elegant Sidebar (Desktop Fixed + Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 w-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col border-e border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen 
            ? 'translate-x-0' 
            : language === 'ar' 
              ? 'translate-x-full lg:translate-x-0' 
              : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: Store Brand & Status */}
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-11 h-11 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-2xl shadow-inner shrink-0"
                style={{ borderColor: `${theme.hex}66` }}
              >
                {activeStore.design.customLogoUrl ? (
                  <img src={activeStore.design.customLogoUrl} alt="" className="w-full h-full object-contain p-1 rounded-2xl" />
                ) : (
                  <span>{activeStore.design.logoEmoji}</span>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-sm text-white tracking-wide truncate">
                    {displayStoreName}
                  </h1>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-md text-white uppercase tracking-wider shadow-2xs"
                    style={{ backgroundColor: theme.hex }}
                  >
                    {activeStore.plan || 'Starter'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{language === 'ar' ? 'متصل' : 'Online'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct Store Link Card */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between gap-2">
            <div className="min-w-0 flex items-center gap-1.5 text-slate-400">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-mono text-slate-300 truncate" dir="ltr">
                {getStorePathLabel(activeStore.slug, false)}
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopyStoreLink}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={language === 'ar' ? 'نسخ رابط المتجر' : 'Copy link'}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title={language === 'ar' ? 'معاينة المتجر في نافذة جديدة' : 'Open in new tab'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-none">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400/90">
                {language === 'ar' ? group.groupTitleAr : group.groupTitleEn}
              </div>

              {group.items.map((item) => {
                const isActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setAdminTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all group ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                    }`}
                    style={
                      isActive
                        ? { 
                            backgroundColor: theme.hex,
                            boxShadow: `0 4px 14px ${theme.hex}40`
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200 transition-colors'}>
                        {item.icon}
                      </span>
                      <span className="truncate">
                        {language === 'ar' ? item.labelAr : item.labelEn}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Critical Alert Counter (e.g. pending orders or low stock) */}
                      {item.alertCount !== undefined && item.alertCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black text-white ${
                          item.id === 'orders' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                        }`}>
                          {item.alertCount}
                        </span>
                      )}

                      {/* General Count Badge */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Owner Identity & Fast Exit */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          {/* Quick Exit to Storefront */}
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800/90 transition-all hover:scale-101"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'ar' ? 'عرض متجر العملاء' : 'View Storefront'}</span>
            <ReturnArrow className="w-3.5 h-3.5 ms-auto text-slate-500" />
          </button>

          {/* Owner Account & Logout */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-950/70 border border-emerald-700/50 flex items-center justify-center text-emerald-300 font-black text-xs shrink-0">
                {activeStore.ownerName ? activeStore.ownerName.charAt(0) : 'M'}
              </div>
              <div className="min-w-0 text-start">
                <span className="text-xs font-bold text-slate-200 block truncate leading-tight">
                  {activeStore.ownerName || (language === 'ar' ? 'مالك المتجر' : 'Store Owner')}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono truncate" dir="ltr">
                  {activeStore.ownerPhone || activeStore.ownerEmail}
                </span>
              </div>
            </div>

            <button
              onClick={() => logoutStoreAdmin(activeStore.id)}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
              title={language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 lg:ps-72 min-h-screen flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden lg:flex sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-8 items-center justify-between shadow-2xs">
          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span className="hover:text-slate-800 cursor-pointer" onClick={() => setAdminTab('dashboard')}>
                {displayStoreName}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
              <span className="text-slate-900 font-extrabold">{getActiveTabTitle()}</span>
            </div>

            {pendingOrdersCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{language === 'ar' ? `${pendingOrdersCount} طلبات جديدة بحاجة للتأكيد` : `${pendingOrdersCount} pending orders`}</span>
              </span>
            )}
          </div>

          {/* Right Header Quick Controls */}
          <div className="flex items-center gap-3">
            {/* Direct Storefront Preview Button */}
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-all"
            >
              <Store className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'ar' ? 'معاينة المتجر' : 'View Store'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {/* Platform Super Admin Quick Link (if platform admin) */}
            <button
              onClick={() => goToPlatform('admin')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
              title={language === 'ar' ? 'لوحة تحكم منصة بسطية الرئيسية' : 'Bastiyah Platform Owner'}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">{language === 'ar' ? 'المنصة الرئيسية' : 'Platform'}</span>
            </button>
          </div>
        </header>

        {/* Tab Content Rendering Container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-24">
          {adminTab === 'dashboard' && <AdminDashboard />}
          {adminTab === 'products' && <AdminProducts />}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'customers' && <AdminCustomers />}
          {adminTab === 'design' && <AdminStoreDesign />}
          {adminTab === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};
