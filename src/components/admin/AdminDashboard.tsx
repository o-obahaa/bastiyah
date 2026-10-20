import React, { useState, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight,
  Package,
  Plus,
  Palette,
  Tag,
  Clock,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  Eye,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Sparkles,
  Copy,
  Check,
  Share2,
  Globe,
  Send,
  Truck,
  CheckCircle,
  QrCode,
  Zap,
  ChevronRight,
  Layers
} from 'lucide-react';
import { OrderStatus } from '../../types';
import { getStoreDisplayUrl, getStorePathLabel } from '../../utils/urlUtils';
import { StoreQrCodeModal } from '../common/StoreQrCodeModal';

export const AdminDashboard: React.FC = () => {
  const { 
    activeStore,
    products, 
    orders, 
    customers, 
    updateOrderStatus, 
    updateProduct, 
    setAdminTab,
    setCurrentPage,
    addToast,
    t,
    language,
    getProductName,
    theme
  } = useStore();

  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'all'>('7days');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const currency = activeStore.settings.currency || 'د.ع';

  // Dynamic filtering based on chosen period
  const filteredOrders = useMemo(() => {
    const now = new Date().getTime();
    if (period === 'today') {
      const oneDayAgo = now - 24 * 60 * 60 * 1000;
      return orders.filter((o) => new Date(o.date).getTime() >= oneDayAgo);
    }
    if (period === '7days') {
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => new Date(o.date).getTime() >= sevenDaysAgo);
    }
    if (period === 'month') {
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
      return orders.filter((o) => new Date(o.date).getTime() >= thirtyDaysAgo);
    }
    return orders;
  }, [orders, period]);

  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalCustomers = customers.length;
  const lowStockProducts = products.filter((p) => p.stock <= 10);
  const pendingOrders = orders.filter((o) => o.status === 'pending');

  const handleQuickRestock = (productId: string, currentStock: number) => {
    updateProduct(productId, { stock: currentStock + 20 });
    addToast(language === 'ar' ? 'تمت إضافة +20 وحدة للمخزون' : 'Restocked +20 units', 'success');
  };

  // Build daily sales series for the last 7 days
  const chartDays = useMemo(() => {
    const dayNamesAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const results = [];

    const maxAmount = Math.max(
      ...orders.map((o) => o.total),
      800
    );

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = language === 'ar' ? dayNamesAr[d.getDay()] : dayNamesEn[d.getDay()];

      const dayOrders = orders.filter((o) => o.date.startsWith(dateStr));
      const amount = dayOrders.reduce((s, o) => s + o.total, 0);

      const heightPercent = maxAmount > 0 ? Math.min(100, Math.max(16, Math.round((amount / maxAmount) * 100))) : 20;

      results.push({
        day: dayName,
        date: dateStr,
        amount,
        height: `${heightPercent}%`,
        count: dayOrders.length
      });
    }

    return results;
  }, [orders, language]);

  const openWhatsApp = (customerPhone: string, customerName: string, orderNumber: string, orderTotal: number) => {
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const msg = language === 'ar'
      ? `مرحباً ${customerName}، شكراً لتسوقك من متجر ${storeName}. بخصوص طلبك رقم #${orderNumber} بمبلغ ${orderTotal} ${currency}...`
      : `Hello ${customerName}, thank you for shopping at ${storeName}. Regarding your order #${orderNumber} (${currency}${orderTotal})...`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const fulfilledOrdersCount = orders.filter((o) => o.status === 'delivered' || o.status === 'shipped').length;
  const fulfillmentRate = orders.length > 0 ? Math.round((fulfilledOrdersCount / orders.length) * 100) : 100;
  const storeUrl = getStoreDisplayUrl(activeStore.slug, false);

  const handleCopyStoreLink = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopiedLink(true);
    addToast(language === 'ar' ? 'تم نسخ رابط متجرك بنجاح!' : 'Store link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const msg = language === 'ar'
      ? `أهلاً بكم في متجرنا الرسمي (${storeName}) على منصة بسطية! تصفحوا أحدث المنتجات واطلبوا مباشرة عبر الرابط:\n${storeUrl}`
      : `Welcome to our official store (${storeName}) on Bastiyah! Browse our catalog and shop now:\n${storeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareTwitter = () => {
    const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const text = language === 'ar'
      ? `تسوقوا الآن من متجر ${storeName} عبر منصة بسطية!`
      : `Shop from ${storeName} on Bastiyah!`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(storeUrl)}`, '_blank');
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    let nextStatus: OrderStatus = currentStatus;
    if (currentStatus === 'pending') nextStatus = 'processing';
    else if (currentStatus === 'processing') nextStatus = 'shipped';
    else if (currentStatus === 'shipped') nextStatus = 'delivered';

    if (nextStatus !== currentStatus) {
      updateOrderStatus(orderId, nextStatus);
      addToast(
        language === 'ar'
          ? `تم تحديث حالة الطلب إلى: ${nextStatus === 'processing' ? 'قيد التجهيز' : nextStatus === 'shipped' ? 'تم الشحن' : 'تم التوصيل'}`
          : `Order status advanced to ${nextStatus}`,
        'success'
      );
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return language === 'ar' ? 'صباح الخير' : 'Good morning';
    if (hour < 18) return language === 'ar' ? 'مساء الخير' : 'Good afternoon';
    return language === 'ar' ? 'مساء الخير' : 'Good evening';
  };

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* Executive Welcome & Period Filter Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {getTimeGreeting()}، {activeStore.ownerName || (language === 'ar' ? 'يا أستاذ' : 'Owner')}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'ar' ? 'المتجر نشط ومتاح للعملاء' : 'Live & Active'}</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {language === 'ar' ? 'لوحة تحكم المتجر والعمليات' : 'Store Dashboard & Analytics'}
          </h2>
        </div>

        {/* Time Period Filter Pills */}
        <div className="inline-flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs">
          {[
            { id: 'today', labelAr: 'اليوم', labelEn: 'Today' },
            { id: '7days', labelAr: 'آخر 7 أيام', labelEn: '7 Days' },
            { id: 'month', labelAr: 'هذا الشهر', labelEn: 'Month' },
            { id: 'all', labelAr: 'كل الأوقات', labelEn: 'All Time' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                period === item.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              {language === 'ar' ? item.labelAr : item.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Storefront Launch & Quick Share Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 text-white border border-slate-800 shadow-xl">
        {/* Subtle Ambient Background Glow */}
        <div 
          className="absolute -top-16 -end-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: theme.hex }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'ar' ? 'رابط المتجر الرسمي المباشر' : 'Official Storefront URL'}</span>
              </span>

              <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-700/80">
                {language === 'ar' ? `معدل إنجاز الطلبات: %${fulfillmentRate}` : `Fulfillment: ${fulfillmentRate}%`}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-950/90 border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-200">
                <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[220px] sm:max-w-none font-semibold">
                  {getStorePathLabel(activeStore.slug, false)}
                </span>
              </div>

              <button
                onClick={handleCopyStoreLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
                title={language === 'ar' ? 'نسخ الرابط' : 'Copy link'}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الرابط' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Quick Share and View Actions */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs transition-all shadow-md hover:scale-101"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>{language === 'ar' ? 'مشاركة بالواتساب' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={handleShareTwitter}
              className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
            >
              <Share2 className="w-4 h-4 text-sky-400" />
              <span>{language === 'ar' ? 'نشر على X' : 'Share'}</span>
            </button>

            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'رمز QR المتجر' : 'QR Code'}</span>
            </button>

            <button
              onClick={() => setCurrentPage('home')}
              className="flex-1 lg:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-xs transition-all shadow-md"
            >
              <Eye className="w-4 h-4 text-amber-600" />
              <span>{language === 'ar' ? 'زيارة المتجر' : 'Visit Store'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.totalRevenue}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm font-bold text-slate-500">{currency}</span>
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 pt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إجمالي المبيعات المحققة' : 'Total Revenue'}</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.totalOrders}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalOrders}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold pt-1">
              {pendingOrders.length > 0 ? (
                <span className="text-amber-600 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{pendingOrders.length} {language === 'ar' ? 'بحاجة للمراجعة' : 'pending'}</span>
                </span>
              ) : (
                <span className="text-slate-500">
                  {language === 'ar' ? 'جميع الطلبات منجزة' : 'All up to date'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'متوسط قيمة السلة' : 'Average Basket'}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-sm font-bold text-slate-500">{currency}</span>
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 pt-1">
              <span>{language === 'ar' ? 'متوسط السلة لكل زبون' : 'Per transaction'}</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t.activeCustomers}
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalCustomers}
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 pt-1">
              <span>{language === 'ar' ? 'عملاء مسجلين بالمتجر' : 'Registered shoppers'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <button
          onClick={() => setAdminTab('products')}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-md transition-all text-start group"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">
              {language === 'ar' ? 'إضافة منتج جديد' : 'Add Product'}
            </span>
            <span className="text-[11px] text-slate-400 truncate block">
              {products.length} {language === 'ar' ? 'منتج معروض' : 'products'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-300 hover:shadow-md transition-all text-start group"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">
              {language === 'ar' ? 'متابعة الطلبات' : 'Orders'}
            </span>
            <span className="text-[11px] text-amber-600 font-bold truncate block">
              {pendingOrders.length} {language === 'ar' ? 'بانتظار التأكيد' : 'pending'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('design')}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-md transition-all text-start group"
        >
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">
              {language === 'ar' ? 'تخصيص المظهر' : 'Store Design'}
            </span>
            <span className="text-[11px] text-slate-400 truncate block">
              {language === 'ar' ? 'الألوان والتنسيق' : 'Themes & Layout'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-300 hover:shadow-md transition-all text-start group"
        >
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-900 block truncate">
              {language === 'ar' ? 'كوبونات الخصم' : 'Promo Codes'}
            </span>
            <span className="text-[11px] text-slate-400 truncate block">
              {activeStore.coupons?.length || 0} {language === 'ar' ? 'أكواد مفعلة' : 'coupons'}
            </span>
          </div>
        </button>
      </div>

      {/* Main Grid: Revenue Trend Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7 items-stretch">
        {/* Sales Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                {language === 'ar' ? 'مؤشر المبيعات اليومية (آخر 7 أيام)' : 'Daily Sales Velocity'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'حجم المبيعات وقيمة الطلبات المستلمة يومياً' : 'Revenue generated per day'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تحديث لحظي' : 'Live synced'}</span>
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 pt-6 border-b border-slate-100 pb-4 w-full">
            {chartDays.map((d, idx) => (
              <div key={idx} className="flex-1 min-w-0 flex flex-col items-center gap-2 h-full justify-end group relative">
                {/* Floating Tooltip on hover - positioned absolutely so it never forces column width */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-md pointer-events-none z-20 font-mono font-bold start-1/2 -translate-x-1/2">
                  {d.amount.toLocaleString()} {currency} ({d.count} {language === 'ar' ? 'طلب' : 'orders'})
                </div>

                <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-full">
                  <div 
                    className="w-full rounded-t-xl transition-all duration-500 group-hover:opacity-90"
                    style={{ 
                      height: d.height,
                      backgroundColor: theme.hex
                    }}
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900 truncate max-w-full text-center">
                  {d.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>{language === 'ar' ? 'إجمالي طلبات الفترة' : 'Period orders'}: <strong className="text-slate-900 font-bold">{orders.length}</strong></span>
            <button
              onClick={() => setAdminTab('orders')}
              className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <span>{language === 'ar' ? 'عرض سجل الطلبات الكامل' : 'View all orders'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Low Stock & Inventory Health Alerts (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'تنبيهات المخزون' : 'Stock Alerts'}
                </h3>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                {lowStockProducts.length} {language === 'ar' ? 'أصناف' : 'items'}
              </span>
            </div>

            {/* List of Low Stock Products */}
            <div className="divide-y divide-slate-100 mt-2 max-h-[300px] overflow-y-auto pr-1">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-semibold">
                    {language === 'ar' ? 'جميع المنتجات متوفرة بكميات ممتازة!' : 'All inventory levels are healthy!'}
                  </p>
                </div>
              ) : (
                lowStockProducts.map((p) => {
                  const pName = getProductName(p);
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'} 
                          alt="" 
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">
                            {pName}
                          </span>
                          <span className="text-[11px] font-bold text-rose-600 block">
                            {p.stock === 0 
                              ? (language === 'ar' ? 'نفد من المخزون' : 'Out of stock')
                              : (language === 'ar' ? `متبقي ${p.stock} فقط` : `${p.stock} units left`)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleQuickRestock(p.id, p.stock)}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors whitespace-nowrap shrink-0 shadow-2xs"
                        title={language === 'ar' ? 'زيادة المخزون بـ 20 وحدة' : 'Add +20 units'}
                      >
                        +20 {language === 'ar' ? 'وحدة' : 'units'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setAdminTab('products')}
            className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl transition-colors text-center shadow-xs"
          >
            {language === 'ar' ? 'إدارة كتالوج المنتجات والمخزون' : 'Open Product Catalog'}
          </button>
        </div>
      </div>

      {/* Recent Orders Section with Direct WhatsApp Contact */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              {language === 'ar' ? 'أحدث الطلبات المستلمة' : 'Recent Customer Orders'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar' ? 'تواصل فوراً مع الزبائن عبر واتساب لتأكيد الشحن والتوصيل' : 'Latest orders with instant WhatsApp customer dispatch'}
            </p>
          </div>

          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <span>{language === 'ar' ? 'عرض كافة الطلبات' : 'View all orders'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-5">{t.orderNumber}</th>
                <th className="py-3.5 px-5">{t.fullName}</th>
                <th className="py-3.5 px-5">{language === 'ar' ? 'المدينة' : 'City'}</th>
                <th className="py-3.5 px-5">{t.total}</th>
                <th className="py-3.5 px-5">{t.deliveryStatus}</th>
                <th className="py-3.5 px-5 text-end">{language === 'ar' ? 'التواصل والإجراء' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-900 block font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-bold text-slate-800 block">{order.customer.fullName}</span>
                    <span className="text-[11px] text-slate-400 font-mono" dir="ltr">{order.customer.phone}</span>
                  </td>
                  <td className="py-4 px-5 text-slate-600">
                    {order.customer.city}
                  </td>
                  <td className="py-4 px-5 font-black text-slate-900">
                    {order.total.toLocaleString()} {currency}
                  </td>
                  <td className="py-4 px-5">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none transition-colors ${
                        order.status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.status === 'shipped'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : order.status === 'processing'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      <option value="pending">{t.pending}</option>
                      <option value="processing">{t.processing}</option>
                      <option value="shipped">{t.shipped}</option>
                      <option value="delivered">{t.delivered}</option>
                      <option value="cancelled">{t.cancelled}</option>
                    </select>
                  </td>
                  <td className="py-4 px-5 text-end">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, order.status)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shadow-2xs whitespace-nowrap"
                          title={language === 'ar' ? 'ترقية الحالة للمرحلة التالية' : 'Advance status'}
                        >
                          {order.status === 'pending' && <span>{language === 'ar' ? 'تجهيز' : 'Process'}</span>}
                          {order.status === 'processing' && <span>{language === 'ar' ? 'شحن' : 'Ship'}</span>}
                          {order.status === 'shipped' && <span>{language === 'ar' ? 'تسليم' : 'Deliver'}</span>}
                          <ArrowRight className={`w-3 h-3 text-emerald-400 ${language === 'ar' ? 'rotate-180' : ''}`} />
                        </button>
                      )}

                      {order.customer.phone && (
                        <button
                          onClick={() => openWhatsApp(order.customer.phone, order.customer.fullName, order.orderNumber, order.total)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
                          title={language === 'ar' ? 'مراسلة العميل عبر واتساب' : 'Chat on WhatsApp'}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setAdminTab('orders')}
                        className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                        title={language === 'ar' ? 'تفاصيل الطلب' : 'Details'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store QR Code Modal */}
      <StoreQrCodeModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </div>
  );
};
