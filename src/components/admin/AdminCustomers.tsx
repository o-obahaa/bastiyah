import React, { useState } from 'react';
import { useStore, phonesMatch } from '../../context/StoreContext';
import { Customer, ANONYMOUS_USER_AVATAR } from '../../types';
import { renderWhatsAppTemplate, logWhatsAppActivity } from '../../utils/whatsappPlatformUtils';
import { 
  Search, 
  Mail, 
  MapPin, 
  Award, 
  UserCheck, 
  MessageCircle, 
  Download, 
  ShoppingBag, 
  Calendar,
  X,
  ExternalLink,
  DollarSign,
  Phone,
  CheckCircle2
} from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { customers, orders, activeStore, t, language, addToast } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'All' | 'vip' | 'standard'>('All');
  const [inspectingCustomer, setInspectingCustomer] = useState<Customer | null>(null);

  const currency = activeStore.settings.currency || '$';

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    const isVip = c.totalSpent >= 500;
    const matchesTier = 
      filterTier === 'All' ||
      (filterTier === 'vip' && isVip) ||
      (filterTier === 'standard' && !isVip);

    return matchesSearch && matchesTier;
  });

  const openWhatsApp = (customer: Customer) => {
    // Look up customer phone directly or from recent orders
    const directPhone = customer.phone || '';
    const customerOrder = orders.find(
      (o) => (customer.email && o.customer.email.toLowerCase() === customer.email.toLowerCase()) ||
             o.customer.fullName.toLowerCase() === customer.name.toLowerCase()
    );

    const phone = directPhone || customerOrder?.customer.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    if (!cleanPhone) {
      addToast(
        language === 'ar' ? 'رقم الهاتف غير مسجل لهذا العميل' : 'Phone number not on record',
        'info'
      );
      return;
    }

    const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const rendered = renderWhatsAppTemplate('abandoned_cart_reminder', {
      customerName: customer.name,
      storeName,
      couponCode: 'SAVE10',
      cartUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${activeStore.slug}`,
    });
    const msg = rendered.content;

    try {
      logWhatsAppActivity({
        direction: 'outbound',
        storeId: activeStore.id,
        storeName,
        storeSlug: activeStore.slug,
        recipientName: customer.name,
        recipientPhone: `+${cleanPhone}`,
        categoryLabelAr: 'تواصل مع العميل',
        categoryLabelEn: 'Customer Outreach',
        content: msg,
        status: 'sent',
      });
    } catch (e) {
      // ignore
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleExportCSV = () => {
    if (customers.length === 0) {
      addToast(language === 'ar' ? 'لا يوجد عملاء لتصديرهم' : 'No customers to export', 'info');
      return;
    }

    const headers = ['ID', 'Name', 'Phone', 'Email', 'City', 'Country', 'Orders Count', 'Total Spent', 'Tier', 'Joined Date'];
    const rows = customers.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.phone || ''}"`,
      `"${c.email || ''}"`,
      `"${c.city}"`,
      `"${c.country}"`,
      c.ordersCount,
      c.totalSpent.toFixed(2),
      c.totalSpent >= 500 ? 'VIP' : 'Standard',
      c.joinedDate
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers-${activeStore.slug}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(language === 'ar' ? 'تم تصدير قائمة العملاء (CSV) بنجاح!' : 'Customers exported to CSV successfully!', 'success');
  };

  // Find orders belonging to inspecting customer
  const customerOrders = inspectingCustomer ? orders.filter(
    (o) => (inspectingCustomer.phone && o.customer.phone && phonesMatch(inspectingCustomer.phone, o.customer.phone)) ||
           (inspectingCustomer.email && o.customer.email.toLowerCase() === inspectingCustomer.email.toLowerCase()) ||
           o.customer.fullName.toLowerCase() === inspectingCustomer.name.toLowerCase()
  ) : [];

  const totalCustomerSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgCustomerSpend = customers.length > 0 ? totalCustomerSpend / customers.length : 0;
  const vipCount = customers.filter(c => c.totalSpent >= 500).length;

  return (
    <div className="space-y-6">
      {/* Header and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'دليل وقاعدة العملاء' : t.customerDirectory} ({customers.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'ar' ? 'إدارة العملاء المسجلين، برامج الولاء، وتاريخ مشتريات كل عميل' : t.customerDirectoryDesc}
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>{language === 'ar' ? 'تصدير العملاء (CSV)' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Customer KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{customers.length}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'إجمالي إنفاق العملاء' : 'Total Spent (LTV)'}</span>
          <span className="text-lg font-black text-emerald-700 mt-0.5 block">{currency}{totalCustomerSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'متوسط قيمة العميل' : 'Avg Spend / Buyer'}</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{currency}{avgCustomerSpend.toFixed(2)}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'عملاء النخبة (VIP)' : 'VIP Customers'}</span>
          <span className="text-lg font-black text-amber-600 mt-0.5 block">{vipCount}</span>
        </div>
      </div>

      {/* Filter Tiers */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterTier('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterTier === 'All'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'جميع العملاء' : 'All Customers'} ({customers.length})
        </button>

        <button
          onClick={() => setFilterTier('vip')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterTier === 'vip'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-800 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'عملاء كبار (VIP)' : 'VIP Buyers'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px]">
            {customers.filter(c => c.totalSpent >= 500).length}
          </span>
        </button>

        <button
          onClick={() => setFilterTier('standard')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterTier === 'standard'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'عملاء منتظمين' : 'Standard'} ({customers.filter(c => c.totalSpent < 500).length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder={language === 'ar' ? 'البحث بالاسم، البريد الإلكتروني، المدينة...' : 'Search customers by name, email, or city...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs ${
            language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'
          }`}
        />
        <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
          language === 'ar' ? 'right-3' : 'left-3'
        }`} />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t.customers}</th>
                <th className="py-3.5 px-4">{t.shippingDestination}</th>
                <th className="py-3.5 px-4">{t.orders}</th>
                <th className="py-3.5 px-4">{t.totalRevenue}</th>
                <th className="py-3.5 px-4">{t.customerTier}</th>
                <th className="py-3.5 px-4">{t.memberSince}</th>
                <th className="py-3.5 px-4 text-end">{language === 'ar' ? 'التواصل والملف' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {language === 'ar' ? 'لا يوجد عملاء مطابقين للبحث' : 'No customers found.'}
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const isVip = customer.totalSpent >= 500;
                  return (
                    <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={customer.avatar || ANONYMOUS_USER_AVATAR}
                            alt=""
                            onError={(e) => { (e.target as HTMLImageElement).src = ANONYMOUS_USER_AVATAR; }}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm truncate">
                              {customer.name}
                            </span>
                            <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-mono font-bold truncate" dir="ltr">
                              <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{customer.phone || customer.email}</span>
                              {customer.isPhoneVerified && (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-sans px-1.5 py-0.2 rounded font-bold ms-1">
                                  {language === 'ar' ? 'موثق ✓' : 'Verified ✓'}
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{customer.city}, {customer.country}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {customer.ordersCount} {t.orders}
                      </td>

                      <td className="py-3.5 px-4 font-black text-emerald-700 text-xs sm:text-sm">
                        {currency}{customer.totalSpent.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4">
                        {isVip ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>{t.vipMember}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
                            <UserCheck className="w-3 h-3 text-slate-500" />
                            <span>{t.standard}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(customer.joinedDate).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => openWhatsApp(customer)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={language === 'ar' ? 'مراسلة العميل عبر واتساب' : 'WhatsApp'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setInspectingCustomer(customer)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                          >
                            {language === 'ar' ? 'السجل' : 'Profile'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Purchase History Modal */}
      {inspectingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div 
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingCustomer.avatar || ANONYMOUS_USER_AVATAR}
                  alt=""
                  onError={(e) => { (e.target as HTMLImageElement).src = ANONYMOUS_USER_AVATAR; }}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm bg-slate-100"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900">{inspectingCustomer.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{inspectingCustomer.email}</p>
                </div>
              </div>

              <button
                onClick={() => setInspectingCustomer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Quick KPI stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">{t.orders}</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">{inspectingCustomer.ordersCount}</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <span className="text-emerald-700 block text-[11px]">{t.totalRevenue}</span>
                  <span className="text-base font-black text-emerald-800 mt-1 block">{currency}{inspectingCustomer.totalSpent.toFixed(2)}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px]">{language === 'ar' ? 'الموقع' : 'Location'}</span>
                  <span className="text-xs font-bold text-slate-900 mt-1 block truncate">{inspectingCustomer.city}</span>
                </div>
              </div>

              {/* Purchase History in this store */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">
                  {language === 'ar' ? 'سجل طلبات العميل بالمتجر' : 'Order History'} ({customerOrders.length})
                </h4>

                {customerOrders.length === 0 ? (
                  <p className="text-slate-400 text-center py-6">
                    {language === 'ar' ? 'لا توجد طلبات مسجلة لهذا العميل حالياً' : 'No recorded orders.'}
                  </p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                    {customerOrders.map((ord) => (
                      <div key={ord.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <span className="font-bold text-slate-900 block">#{ord.orderNumber}</span>
                          <span className="text-[11px] text-slate-400">{new Date(ord.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-end">
                          <span className="font-black text-slate-900 block">{currency}{ord.total.toFixed(2)}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            {ord.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <button
                onClick={() => openWhatsApp(inspectingCustomer)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'ar' ? 'مراسلة العميل' : 'WhatsApp'}</span>
              </button>

              <button
                onClick={() => setInspectingCustomer(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
