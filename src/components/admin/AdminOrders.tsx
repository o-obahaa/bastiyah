import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { 
  Search, 
  Eye, 
  X, 
  MessageCircle, 
  Printer, 
  Truck, 
  Download, 
  CheckCircle2, 
  Clock, 
  PackageCheck, 
  XCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Share2
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { 
    orders, 
    products,
    updateOrderStatus, 
    updateOrder, 
    activeStore, 
    t, 
    language, 
    addToast 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [paymentFilter, setPaymentFilter] = useState<string>('All');
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [courierInput, setCourierInput] = useState('');
  const [trackingInput, setTrackingInput] = useState('');

  const currency = activeStore.settings.currency || '$';

  const courierOptions = [
    { label: 'أرامكس (Aramex)', value: 'Aramex' },
    { label: 'سمسا (SMSA Express)', value: 'SMSA' },
    { label: 'دي إتش إل (DHL Express)', value: 'DHL' },
    { label: 'رد بوكس (RedBox)', value: 'RedBox' },
    { label: 'مندوب خاص / توصيل محلي (Local Delivery)', value: 'Local Courier' },
  ];

  const filteredOrders = orders.filter((order) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(q) ||
      order.customer.fullName.toLowerCase().includes(q) ||
      order.customer.email.toLowerCase().includes(q) ||
      (order.customer.phone && order.customer.phone.includes(q)) ||
      (order.customer.city && order.customer.city.toLowerCase().includes(q));
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesPayment = paymentFilter === 'All' || order.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const statusOptions: { label: string; value: string; count: number }[] = [
    { label: t.allOrders, value: 'All', count: orders.length },
    { label: t.pending, value: 'pending', count: orders.filter((o) => o.status === 'pending').length },
    { label: t.processing, value: 'processing', count: orders.filter((o) => o.status === 'processing').length },
    { label: t.shipped, value: 'shipped', count: orders.filter((o) => o.status === 'shipped').length },
    { label: t.delivered, value: 'delivered', count: orders.filter((o) => o.status === 'delivered').length },
    { label: t.cancelled, value: 'cancelled', count: orders.filter((o) => o.status === 'cancelled').length },
  ];

  const openWhatsApp = (order: Order) => {
    const cleanPhone = (order.customer.phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      addToast(language === 'ar' ? 'رقم هاتف العميل غير متوفر' : 'Customer phone number not available', 'error');
      return;
    }
    const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const statusTextAr = {
      pending: 'قيد المراجعة',
      processing: 'جاري التجهيز والتغليف',
      shipped: 'تم شحنه وبطريقه إليك',
      delivered: 'تم التوصيل بنجاح',
      cancelled: 'تم إلغاؤه',
    }[order.status];

    const msg = language === 'ar'
      ? `مرحباً ${order.customer.fullName}، يسعدنا تواصلك مع متجر ${storeName}.\n\nبخصوص طلبك رقم #${order.orderNumber} بقيمة إجمالية ${order.total} ${currency}.\nحالة الطلب الحالية: ${statusTextAr}.\n\nعنوان التوصيل: ${order.customer.city} - ${order.customer.address}.\n\nهل تود تأكيد أي تفاصيل إضافية بخصوص الشحنة؟ نحن بخدمتك!`
      : `Hello ${order.customer.fullName}, thank you for choosing ${storeName}.\n\nRegarding your order #${order.orderNumber} (Total: ${currency}${order.total}).\nStatus: ${order.status.toUpperCase()}.\nShipping to: ${order.customer.city}, ${order.customer.address}.\n\nPlease let us know if you have any questions!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenDetails = (order: Order) => {
    setInspectingOrder(order);
    setCourierInput(order.courier || 'Aramex');
    setTrackingInput(order.trackingNumber || '');
    setIsInvoiceOpen(false);
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

  const handleSendTrackingWhatsApp = (order: Order, courier: string, tracking: string) => {
    const cleanPhone = (order.customer.phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      addToast(language === 'ar' ? 'رقم هاتف العميل غير متوفر' : 'Customer phone number not available', 'error');
      return;
    }
    const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const msg = language === 'ar'
      ? `مرحباً ${order.customer.fullName}، يسعدنا إبلاغك بأنه تم شحن طلبك رقم #${order.orderNumber} من متجر ${storeName} بنجاح!\n\nشركة الشحن: ${courier}\nرقم التتبع: ${tracking}\n\nشكراً لتسوقك معنا، وسنكون سعداء بخدمتك دائماً.`
      : `Hello ${order.customer.fullName}, your order #${order.orderNumber} from ${storeName} has been shipped!\n\nCourier: ${courier}\nTracking Number: ${tracking}\n\nThank you for shopping with us!`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const totalRevenueAll = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const processingOrdersCount = orders.filter(o => o.status === 'processing').length;
  const shippedDeliveredCount = orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length;

  const handleSaveShippingInfo = () => {
    if (!inspectingOrder) return;
    updateOrder(inspectingOrder.id, {
      courier: courierInput,
      trackingNumber: trackingInput.trim()
    });
    setInspectingOrder((prev) => prev ? { ...prev, courier: courierInput, trackingNumber: trackingInput.trim() } : null);
    addToast(language === 'ar' ? 'تم حفظ بيانات الشحن بنجاح!' : 'Shipping info saved!', 'success');
  };

  const handleExportCSV = () => {
    if (orders.length === 0) {
      addToast(language === 'ar' ? 'لا توجد طلبات لتصديرها' : 'No orders to export', 'info');
      return;
    }

    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Email', 'City', 'Total', 'Payment Method', 'Status', 'Courier', 'Tracking'];
    const rows = orders.map((o) => [
      o.orderNumber,
      new Date(o.date).toLocaleDateString(),
      `"${o.customer.fullName}"`,
      `"${o.customer.phone}"`,
      `"${o.customer.email}"`,
      `"${o.customer.city}"`,
      o.total.toFixed(2),
      `"${o.paymentMethod}"`,
      o.status,
      `"${o.courier || ''}"`,
      `"${o.trackingNumber || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders-${activeStore.slug}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(language === 'ar' ? 'تم تصدير ملف الطلبات (CSV) بنجاح!' : 'Orders exported to CSV successfully!', 'success');
  };

  const printInvoice = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Search and Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'إدارة الطلبات والشحن' : t.ordersAndFulfillment} ({orders.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'ar' ? 'متابعة مراحل الشحن، طباعة بوليصات الشحن، والتواصل الفوري مع العملاء' : t.ordersDesc}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all"
            title={language === 'ar' ? 'تصدير جدول الطلبات إلى ملف Excel / CSV' : 'Export orders to CSV'}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Orders Quick Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{orders.length}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{currency}{totalRevenueAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'بانتظار التأكيد' : 'Pending Orders'}</span>
          <span className={`text-lg font-black mt-0.5 block ${pendingOrdersCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{pendingOrdersCount}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'تم الشحن والتوصيل' : 'Fulfilled'}</span>
          <span className="text-lg font-black text-emerald-700 mt-0.5 block">{shippedDeliveredCount}</span>
        </div>
      </div>

      {/* Filter Tabs by Status */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusOptions.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedStatus === tab.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedStatus === tab.value ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input & Payment Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder={language === 'ar' ? 'البحث برقم الطلب، اسم العميل، الهاتف، المدينة...' : 'Search by order ID, customer name, phone, city...'}
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

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="w-full sm:w-auto py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{language === 'ar' ? 'جميع طرق الدفع' : 'All Payment Methods'}</option>
          <option value="Cash on Delivery">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</option>
          <option value="Credit Card">{language === 'ar' ? 'بطاقة بنكية / مدى' : 'Credit Card'}</option>
          <option value="Apple Pay">Apple Pay</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t.orderNumber} & {t.orderDate}</th>
                <th className="py-3.5 px-4">{t.fullName}</th>
                <th className="py-3.5 px-4">{t.shippingDestination}</th>
                <th className="py-3.5 px-4">{t.orderSummary}</th>
                <th className="py-3.5 px-4">{t.paymentMethod}</th>
                <th className="py-3.5 px-4">{t.total}</th>
                <th className="py-3.5 px-4">{t.deliveryStatus}</th>
                <th className="py-3.5 px-4 text-end">{language === 'ar' ? 'إجراءات وسريعة' : t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>{language === 'ar' ? 'لا توجد طلبات تطابق معايير البحث الحالية' : 'No orders found matching this filter.'}</span>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block font-mono text-xs sm:text-sm">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                      {order.notes && (
                        <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded shadow-2xs" title={order.notes}>
                          📝 {language === 'ar' ? 'ملاحظة' : 'Note'}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{order.customer.fullName}</span>
                      <span className="text-[11px] text-slate-400 block font-mono">{order.customer.phone}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800 block">{order.customer.city}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px] block">{order.customer.address}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-2 overflow-hidden">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <img
                              key={idx}
                              src={item.productImage}
                              alt=""
                              className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {order.items.length} {t.items}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] whitespace-nowrap">
                        {order.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {currency}{order.total.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1 rounded-full border cursor-pointer focus:outline-none ${
                          order.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.status === 'shipped'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : order.status === 'processing'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : order.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-all shadow-2xs whitespace-nowrap"
                            title={language === 'ar' ? 'ترقية الحالة للمرحلة التالية' : 'Advance status'}
                          >
                            {order.status === 'pending' && <span>{language === 'ar' ? 'تجهيز' : 'Process'}</span>}
                            {order.status === 'processing' && <span>{language === 'ar' ? 'شحن' : 'Ship'}</span>}
                            {order.status === 'shipped' && <span>{language === 'ar' ? 'تسليم' : 'Deliver'}</span>}
                            <ArrowRight className={`w-3 h-3 text-emerald-400 ${language === 'ar' ? 'rotate-180' : ''}`} />
                          </button>
                        )}

                        {/* WhatsApp Contact */}
                        {order.customer.phone && (
                          <button
                            onClick={() => openWhatsApp(order)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={language === 'ar' ? 'مراسلة العميل على واتساب' : 'WhatsApp'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* View & Edit Details */}
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{language === 'ar' ? 'تفاصيل' : 'View'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order & Packing Slip Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <PackageCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {t.orderNumber}: #{inspectingOrder.orderNumber}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {new Date(inspectingOrder.date).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsInvoiceOpen(!isInvoiceOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                    isInvoiceOpen
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'معاينة الفاتورة' : 'Invoice Slip'}</span>
                </button>

                <button
                  onClick={() => setInspectingOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {isInvoiceOpen ? (
                /* Clean Printable Invoice View */
                <div id="printable-invoice" className="p-6 border border-slate-200 rounded-2xl bg-white space-y-6">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="text-xl font-black text-slate-900">
                        {language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name}
                      </h2>
                      <p className="text-xs text-slate-500">{activeStore.settings.supportEmail}</p>
                    </div>
                    <div className="text-end">
                      <span className="text-xs font-mono font-bold text-slate-900">#{inspectingOrder.orderNumber}</span>
                      <p className="text-[11px] text-slate-400">{new Date(inspectingOrder.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">{language === 'ar' ? 'بيانات المشتري:' : 'Bill to:'}</span>
                      <p className="font-bold text-slate-900 mt-1">{inspectingOrder.customer.fullName}</p>
                      <p className="text-slate-600 font-mono">{inspectingOrder.customer.phone}</p>
                      <p className="text-slate-600">{inspectingOrder.customer.email}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">{language === 'ar' ? 'عنوان الشحن والتسليم:' : 'Ship to:'}</span>
                      <p className="font-bold text-slate-900 mt-1">{inspectingOrder.customer.city}</p>
                      <p className="text-slate-600">{inspectingOrder.customer.address}</p>
                      <p className="text-slate-600">{inspectingOrder.customer.country}</p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="py-2 px-3 text-start">{language === 'ar' ? 'المنتج' : 'Item'}</th>
                          <th className="py-2 px-3 text-center">{language === 'ar' ? 'الكمية' : 'Qty'}</th>
                          <th className="py-2 px-3 text-end">{language === 'ar' ? 'السعر' : 'Price'}</th>
                          <th className="py-2 px-3 text-end">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inspectingOrder.items.map((item, idx) => {
                          const matchedProd = products.find((p) => p.id === item.productId);
                          return (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-semibold text-slate-900">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span>{item.productName}</span>
                                  {matchedProd?.sku && (
                                    <span className="font-mono text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.5 rounded font-bold">
                                      {language === 'ar' ? 'كود الصنف:' : 'SKU:'} {matchedProd.sku}
                                    </span>
                                  )}
                                </div>
                                {(item.selectedSize || item.selectedColor) && (
                                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                                    {item.selectedSize && <span className="me-2">{language === 'ar' ? 'المقاس:' : 'Size:'} {item.selectedSize}</span>}
                                    {item.selectedColor && <span>{language === 'ar' ? 'اللون:' : 'Color:'} {item.selectedColor}</span>}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-3 text-center text-slate-600">{item.quantity}</td>
                              <td className="py-2 px-3 text-end text-slate-600">{currency}{item.price.toFixed(2)}</td>
                              <td className="py-2 px-3 text-end font-bold text-slate-900">{currency}{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Customer Notes on Invoice */}
                  {inspectingOrder.notes && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900">
                      <span className="font-bold block mb-0.5">{language === 'ar' ? 'ملاحظات العميل الخاصة بالطلب:' : 'Customer Order Notes:'}</span>
                      <p className="text-amber-800">{inspectingOrder.notes}</p>
                    </div>
                  )}

                  {/* Summary Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>{t.subtotal}:</span>
                        <span>{currency}{inspectingOrder.subtotal.toFixed(2)}</span>
                      </div>
                      {inspectingOrder.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-bold">
                          <span>{t.discount}:</span>
                          <span>-{currency}{inspectingOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>{t.shipping}:</span>
                        <span>{currency}{inspectingOrder.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>{t.estimatedTax}:</span>
                        <span>{currency}{inspectingOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-black text-slate-900 text-sm pt-2 border-t border-slate-200">
                        <span>{t.total}:</span>
                        <span className="text-emerald-700">{currency}{inspectingOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4 border-t border-slate-100">
                    <button
                      onClick={printInvoice}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center gap-2 mx-auto transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{language === 'ar' ? 'طباعة هذه الفاتورة' : 'Print Invoice'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Standard Detailed View */
                <>
                  {/* Shipping & Customer Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{t.fullName}</h4>
                      <p className="font-semibold text-slate-800">{inspectingOrder.customer.fullName}</p>
                      <p className="text-slate-500 font-mono mt-0.5">{inspectingOrder.customer.phone}</p>
                      <p className="text-slate-500">{inspectingOrder.customer.email}</p>

                      {inspectingOrder.customer.phone && (
                        <button
                          onClick={() => openWhatsApp(inspectingOrder)}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'تواصل مع العميل عبر واتساب' : 'WhatsApp Customer'}</span>
                        </button>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{t.shippingDestination}</h4>
                      <p className="font-bold text-slate-800">{inspectingOrder.customer.city}, {inspectingOrder.customer.country}</p>
                      <p className="text-slate-600 mt-1">{inspectingOrder.customer.address}</p>
                      {inspectingOrder.customer.zipCode && (
                        <p className="text-slate-400 font-mono">الرمز البريدي: {inspectingOrder.customer.zipCode}</p>
                      )}
                    </div>
                  </div>

                  {/* Customer Order Notes */}
                  {inspectingOrder.notes && (
                    <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-1">
                      <span className="font-bold text-amber-900 block text-xs">
                        {language === 'ar' ? 'ملاحظات العميل على الطلب:' : 'Customer Order Notes:'}
                      </span>
                      <p className="text-xs text-amber-800 leading-relaxed">{inspectingOrder.notes}</p>
                    </div>
                  )}

                  {/* Shipping Courier and Tracking Code Configuration */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>{language === 'ar' ? 'بيانات الشحنة والتوصيل' : 'Shipping & Tracking'}</span>
                      </div>
                      <button
                        onClick={handleSaveShippingInfo}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors"
                      >
                        {language === 'ar' ? 'حفظ التتبع' : 'Save Tracking'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          {language === 'ar' ? 'شركة الشحن' : 'Courier'}
                        </label>
                        <select
                          value={courierInput}
                          onChange={(e) => setCourierInput(e.target.value)}
                          className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {courierOptions.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                          {language === 'ar' ? 'رقم الشحنة / التتبع' : 'Tracking Number'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. ARX-99824823"
                          value={trackingInput}
                          onChange={(e) => setTrackingInput(e.target.value)}
                          className="w-full py-1.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    {trackingInput.trim() && inspectingOrder.customer.phone && (
                      <div className="pt-2 border-t border-slate-200/80 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSendTrackingWhatsApp(inspectingOrder, courierInput, trackingInput.trim())}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إرسال بيانات التتبع للعميل عبر واتساب' : 'Send Tracking via WhatsApp'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm">{t.orderSummary}</h4>
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl p-3">
                      {inspectingOrder.items.map((item, idx) => (
                        <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.productImage}
                              alt=""
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 text-xs sm:text-sm">{item.productName}</p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                {item.selectedSize && (
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                    {language === 'ar' ? 'المقاس:' : 'Size:'} {item.selectedSize}
                                  </span>
                                )}
                                {item.selectedColor && (
                                  <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                                    {language === 'ar' ? 'اللون:' : 'Color:'} {item.selectedColor}
                                  </span>
                                )}
                                <span className="text-slate-400 text-[11px]">Qty: {item.quantity} × {currency}{item.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {currency}{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 text-slate-600">
                    <div className="flex justify-between">
                      <span>{t.subtotal}</span>
                      <span className="font-semibold text-slate-900">{currency}{inspectingOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {inspectingOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>{t.discount}</span>
                        <span>-{currency}{inspectingOrder.discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{t.shipping}</span>
                      <span className="font-semibold text-slate-900">
                        {inspectingOrder.shipping === 0 ? t.free : `${currency}${inspectingOrder.shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.estimatedTax}</span>
                      <span className="font-semibold text-slate-900">{currency}{inspectingOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>{t.total}</span>
                      <span className="text-emerald-700 text-base">{currency}{inspectingOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">{language === 'ar' ? 'تحديث الحالة:' : 'Status:'}</span>
                <select
                  value={inspectingOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    updateOrderStatus(inspectingOrder.id, newStatus);
                    setInspectingOrder((prev) => prev ? { ...prev, status: newStatus } : null);
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 bg-white cursor-pointer focus:outline-none"
                >
                  <option value="pending">{t.pending}</option>
                  <option value="processing">{t.processing}</option>
                  <option value="shipped">{t.shipped}</option>
                  <option value="delivered">{t.delivered}</option>
                  <option value="cancelled">{t.cancelled}</option>
                </select>
              </div>

              <button
                onClick={() => setInspectingOrder(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
