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
  CheckCircle
} from 'lucide-react';
import { OrderStatus } from '../../types';
import { getStoreDisplayUrl, getStorePathLabel } from '../../utils/urlUtils';

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

  const currency = activeStore.settings.currency || '$';

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

      // Match orders on this calendar day
      const dayOrders = orders.filter((o) => o.date.startsWith(dateStr));
      const amount = dayOrders.reduce((s, o) => s + o.total, 0);

      // Height % capped
      const heightPercent = maxAmount > 0 ? Math.min(100, Math.max(15, Math.round((amount / maxAmount) * 100))) : 20;

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

  // Top Selling Products Leaderboard
  const topSellingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 4);
  }, [products]);

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

  return (
    <div className="space-y-8">
      {/* Top Welcome & Period Control */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'لوحة تحكم المتجر والمبيعات' : 'Store Dashboard & Overview'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'ar'
              ? `إحصائيات ونشاط متجر (${language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name}) المباشرة`
              : `Live metrics and activity for ${activeStore.name}`}
          </p>
        </div>

        {/* Time Period Filter */}
        <div className="inline-flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === 'today'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'اليوم' : 'Today'}
          </button>
          <button
            onClick={() => setPeriod('7days')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === '7days'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'آخر 7 أيام' : '7 Days'}
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === 'month'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'هذا الشهر' : 'This Month'}
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'ar' ? 'كل الأوقات' : 'All Time'}
          </button>
        </div>
      </div>

      {/* Storefront Share & Launch Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-lg border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {language === 'ar' ? 'متجرك جاهز للطلب ومتاح للعملاء' : 'Live Storefront Ready'}
            </span>
            <span className="text-[11px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
              {language === 'ar' ? `معدل إنجاز الطلبات: ${fulfillmentRate}%` : `Fulfillment: ${fulfillmentRate}%`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-700 rounded-xl px-3 py-1.5 font-mono text-xs text-slate-200">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate max-w-[240px] sm:max-w-none">{getStorePathLabel(activeStore.slug, false)}</span>
            </div>

            <button
              onClick={handleCopyStoreLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-colors"
              title={language === 'ar' ? 'نسخ الرابط' : 'Copy link'}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? (language === 'ar' ? 'تم النسخ!' : 'Copied!') : (language === 'ar' ? 'نسخ الرابط' : 'Copy')}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{language === 'ar' ? 'مشاركة بالواتساب' : 'WhatsApp'}</span>
          </button>

          <button
            onClick={handleShareTwitter}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Share2 className="w-4 h-4" />
            <span>{language === 'ar' ? 'نشر على X' : 'Share X'}</span>
          </button>

          <button
            onClick={() => setCurrentPage('home')}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all shadow-xs"
          >
            <Eye className="w-4 h-4 text-amber-600" />
            <span>{language === 'ar' ? 'زيارة المتجر' : 'Visit Store'}</span>
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setAdminTab('products')}
          className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all text-start group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product'}
            </span>
            <span className="text-[11px] text-slate-400">
              {products.length} {language === 'ar' ? 'منتج معروض' : 'products'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('orders')}
          className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all text-start group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {language === 'ar' ? 'إدارة الطلبات' : 'Manage Orders'}
            </span>
            <span className="text-[11px] text-amber-600 font-bold">
              {pendingOrders.length} {language === 'ar' ? 'بانتظار التأكيد' : 'pending'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('design')}
          className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all text-start group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {language === 'ar' ? 'تخصيص المظهر' : 'Store Design'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'ar' ? 'الألوان والتنسيق' : 'Themes & Layout'}
            </span>
          </div>
        </button>

        <button
          onClick={() => setAdminTab('settings')}
          className="flex items-center gap-2.5 p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all text-start group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {language === 'ar' ? 'كوبونات الخصم' : 'Discount Coupons'}
            </span>
            <span className="text-[11px] text-slate-400">
              {activeStore.coupons?.length || 0} {language === 'ar' ? 'أكواد مفعلة' : 'coupons'}
            </span>
          </div>
        </button>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalRevenue}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {currency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'نشاط متزايد' : '+18.4% growth'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalOrders}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalOrders}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
              <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
              <span>{pendingOrders.length} {language === 'ar' ? 'قيد الانتظار' : 'pending'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {language === 'ar' ? 'متوسط قيمة السلة' : 'Average Order'}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {currency}{avgOrderValue.toFixed(2)}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'معدل سلة الشراء' : 'Per transaction'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.activeCustomers}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              {totalCustomers}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-teal-600">
              <Users className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'قاعدة عملاء المتجر' : 'Active buyers'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Trend Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Chart (7 Cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                {language === 'ar' ? 'مؤشر المبيعات اليومية (آخر 7 أيام)' : 'Daily Revenue Velocity'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'توزيع المبيعات والقيمة الإجمالية للطلبات المستلمة' : 'Revenue generated per day'}
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تحديث لحظي' : 'Live synced'}</span>
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 pb-4">
            {chartDays.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg whitespace-nowrap shadow-md pointer-events-none mb-1">
                  {currency}{d.amount.toFixed(0)} ({d.count} {language === 'ar' ? 'طلب' : 'orders'})
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
                <span className="text-[11px] font-bold text-slate-500 group-hover:text-slate-900">
                  {d.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>{language === 'ar' ? 'إجمالي طلبات الفترة' : 'Period orders'}: <strong className="text-slate-900">{orders.length}</strong></span>
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
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
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
                          className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0" 
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
                        className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors whitespace-nowrap shrink-0"
                        title={language === 'ar' ? 'زيادة المخزون بـ 20 وحدة' : 'Add +20 units'}
                      >
                        +20
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => setAdminTab('products')}
            className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors text-center"
          >
            {language === 'ar' ? 'إدارة كتالوج المنتجات' : 'Open Product Catalog'}
          </button>
        </div>
      </div>

      {/* Recent Orders Section with Direct WhatsApp Contact */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              {language === 'ar' ? 'أحدث الطلبات المستلمة' : 'Recent Customer Orders'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ar' ? 'تابع طلبات الزبائن وتواصل معهم فوراً عبر واتساب لتأكيد الشحن' : 'Latest orders with instant WhatsApp customer dispatch'}
            </p>
          </div>

          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
          >
            <span>{language === 'ar' ? 'عرض كافة الطلبات' : 'View all orders'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t.orderNumber}</th>
                <th className="py-3 px-4">{t.fullName}</th>
                <th className="py-3 px-4">{language === 'ar' ? 'المدينة' : 'City'}</th>
                <th className="py-3 px-4">{t.total}</th>
                <th className="py-3 px-4">{t.deliveryStatus}</th>
                <th className="py-3 px-4 text-end">{language === 'ar' ? 'التواصل والإجراء' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block font-mono">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{order.customer.fullName}</span>
                    <span className="text-[11px] text-slate-400">{order.customer.phone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {order.customer.city}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    {currency}{order.total.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
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
                  <td className="py-3.5 px-4 text-end">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => handleAdvanceStatus(order.id, order.status)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-all shadow-2xs whitespace-nowrap"
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                          title={language === 'ar' ? 'مراسلة العميل عبر واتساب' : 'Chat on WhatsApp'}
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>واتساب</span>
                        </button>
                      )}

                      <button
                        onClick={() => setAdminTab('orders')}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title={language === 'ar' ? 'تفاصيل الطلب' : 'Details'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
