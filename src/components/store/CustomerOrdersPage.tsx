import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search,
  Copy,
  Check,
  FileText,
  AlertCircle,
  MessageCircle
} from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const { 
    orders, 
    activeStore, 
    setCurrentPage, 
    t, 
    language, 
    currentCustomer, 
    setIsCustomerAuthModalOpen 
  } = useStore();
  const currency = activeStore.settings.currency || 'د.ع';

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  const handleCopyTracking = (trackingNum: string) => {
    navigator.clipboard.writeText(trackingNum);
    setCopiedTracking(trackingNum);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {t.delivered}
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> {t.shipped}
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {t.processing}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> {t.cancelled}
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {t.pending}
          </span>
        );
    }
  };

  const getProgressStepIndex = (status: string) => {
    switch (status) {
      case 'pending': return 0;
      case 'processing': return 1;
      case 'shipped': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  const steps = [
    { title: t.orderPlacedStep, subtitle: language === 'ar' ? 'تم استلام الطلب' : 'Received' },
    { title: t.processingStep, subtitle: language === 'ar' ? 'قيد التجهيز' : 'Preparing' },
    { title: t.shippedStep, subtitle: language === 'ar' ? 'في الطريق' : 'In transit' },
    { title: t.deliveredStep, subtitle: language === 'ar' ? 'تم التوصيل' : 'Completed' },
  ];

  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const orderNum = order.orderNumber.toLowerCase();
    const phone = (order.customer.phone || '').toLowerCase();
    const email = (order.customer.email || '').toLowerCase();
    const name = (order.customer.fullName || '').toLowerCase();
    const tracking = (order.trackingNumber || '').toLowerCase();
    return (
      orderNum.includes(q) ||
      phone.includes(q) ||
      email.includes(q) ||
      name.includes(q) ||
      tracking.includes(q)
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.orderHistoryTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'ar'
              ? 'تتبع طلباتك لحظة بلحظة واستعرض تفاصيل الشحن والتوصيل'
              : 'Track your orders in real-time and review shipment status'}
          </p>
        </div>

        {/* Tracking Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث برقم الطلب أو الجوال...' : 'Search by order # or phone...'}
            className="w-full ps-10 pe-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Customer Auth Banner */}
      {currentCustomer ? (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/90 rounded-2xl flex items-center justify-between flex-wrap gap-3 mb-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/20 shrink-0">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900">
                  {language === 'ar' ? `أهلاً بك، ${currentCustomer.name}` : `Welcome back, ${currentCustomer.name}`}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span>WhatsApp Verified ✓</span>
                </span>
              </div>
              <p className="text-[11px] font-mono text-emerald-700 mt-0.5" dir="ltr">
                {currentCustomer.phone}
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold bg-white px-3 py-1 rounded-xl border border-emerald-200">
            {language === 'ar' ? 'يتم عرض طلباتك المسجلة تلقائياً' : 'Showing orders linked to your WhatsApp'}
          </span>
        </div>
      ) : (
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between flex-wrap gap-4 mb-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-[#25D366]/25 shrink-0">
              <MessageCircle className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                {language === 'ar' ? 'سجّل الدخول عبر واتساب لمتابعة طلباتك تلقائياً' : 'Sign in via WhatsApp to track your orders'}
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {language === 'ar'
                  ? 'تحقق بنقرة واحدة برقم هاتفك العراقي لاستعراض فواتيرك وتتبع مراحل الشحن والتسليم المباشرة دون الحاجة للبحث كل مرة.'
                  : 'Fast WhatsApp verification using your Iraqi phone number to track orders and receipts automatically.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCustomerAuthModalOpen(true)}
            className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs rounded-xl shadow-md shadow-[#25D366]/20 transition-all hover:scale-102 flex items-center gap-1.5"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
            <span>{language === 'ar' ? 'تسجيل الدخول عبر واتساب' : 'WhatsApp Sign In'}</span>
          </button>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">{t.noOrdersYet}</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'ar' ? 'لم تقم بإجراء أي طلبات حتى الآن في هذا المتجر.' : 'You have not placed any orders in this store yet.'}
          </p>
          <button
            onClick={() => setCurrentPage('shop')}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            {t.shopNow}
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Search className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">
            {language === 'ar' ? 'لم يتم العثور على طلبات مطابقة' : 'No matching orders found'}
          </h3>
          <p className="text-xs text-slate-500">
            {language === 'ar' ? `لا توجد نتائج بحث تطابق "${searchQuery}"` : `No results matching "${searchQuery}"`}
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs font-bold text-emerald-600 hover:underline pt-2"
          >
            {language === 'ar' ? 'إعادة تعيين البحث' : 'Clear search'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const currentStepIdx = getProgressStepIndex(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 sm:p-7 space-y-6"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-slate-900 text-lg">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(order.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="text-end">
                    <span className="text-xs text-slate-400 block">{t.total}</span>
                    <span className="text-xl font-black text-emerald-700">
                      {currency}{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Status Timeline */}
                {order.status !== 'cancelled' ? (
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {steps.map((st, sIdx) => {
                        const isDone = sIdx <= currentStepIdx;
                        const isCurrent = sIdx === currentStepIdx;
                        return (
                          <div key={sIdx} className="space-y-1.5">
                            <div className="flex items-center justify-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                                    : 'bg-slate-200 text-slate-400'
                                }`}
                              >
                                {isDone ? '✓' : sIdx + 1}
                              </div>
                            </div>
                            <div>
                              <p className={`text-xs font-bold leading-tight ${isCurrent ? 'text-emerald-700' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                                {st.title}
                              </p>
                              <p className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
                                {st.subtitle}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Progress Bar Line */}
                    <div className="relative h-1.5 bg-slate-200 rounded-full overflow-hidden mx-4">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${(currentStepIdx / (steps.length - 1)) * 100}%`,
                        }}
                      />
                    </div>

                    {/* Carrier & Tracking Code Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-slate-200/60">
                      <div className="flex items-center gap-2 text-slate-600 font-medium">
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span>
                          {order.courier ? (
                            <>
                              <strong className="text-slate-800">{order.courier}</strong>
                            </>
                          ) : (
                            t.carrierUsps
                          )}
                        </span>
                      </div>

                      {order.trackingNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 text-[11px]">
                            {language === 'ar' ? 'رقم التتبع:' : 'Tracking #:'}
                          </span>
                          <span className="font-mono text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-xs">
                            {order.trackingNumber}
                          </span>
                          <button
                            onClick={() => handleCopyTracking(order.trackingNumber!)}
                            className="p-1 hover:bg-white rounded text-slate-500 hover:text-slate-800 border border-transparent hover:border-slate-200 transition-colors"
                            title={language === 'ar' ? 'نسخ رقم التتبع' : 'Copy tracking number'}
                          >
                            {copiedTracking === order.trackingNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{language === 'ar' ? 'تم إلغاء هذا الطلب من قبل المتجر أو العميل.' : 'This order has been cancelled.'}</span>
                  </div>
                )}

                {/* Items in this order */}
                <div className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{item.productName}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.selectedSize && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                                {language === 'ar' ? 'المقاس:' : 'Size:'} {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                                {language === 'ar' ? 'اللون:' : 'Color:'} {item.selectedColor}
                              </span>
                            )}
                            <span>
                              Qty: {item.quantity} × {currency}{item.price}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {currency}{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Customer, Shipping and Order Notes */}
                <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex flex-col sm:flex-row justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-700">{t.fullName}:</span> {order.customer.fullName} ({order.customer.phone || order.customer.email})
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">{t.shippingDestination}:</span> {order.customer.address}, {order.customer.city}
                    </div>
                  </div>

                  {order.notes && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2 text-amber-900">
                      <FileText className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                      <div>
                        <span className="font-bold text-[11px] block">{language === 'ar' ? 'ملاحظات العميل:' : 'Order Notes:'}</span>
                        <p className="text-xs text-amber-800">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
