import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Printer, 
  Sparkles,
  Truck,
  Copy,
  Check,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { getIraqiTrackingUrl } from '../../utils/iraqShipping';
import { renderWhatsAppTemplate, logWhatsAppActivity } from '../../utils/whatsappPlatformUtils';

export const OrderSuccessPage: React.FC = () => {
  const { lastPlacedOrder, setCurrentPage, t, language, activeStore } = useStore();
  const currency = activeStore.settings.currency || 'د.ع';
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleSendWhatsAppConfirmation = () => {
    if (!lastPlacedOrder) return;
    const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const rendered = renderWhatsAppTemplate('customer_order_confirmation', {
      customerName: lastPlacedOrder.customer.fullName,
      storeName,
      orderNumber: lastPlacedOrder.orderNumber,
      total: `${lastPlacedOrder.total.toLocaleString()}`,
      currency,
      customerAddress: `${lastPlacedOrder.customer.city} - ${lastPlacedOrder.customer.address}`,
      orderUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/orders`,
    });

    const rawPhone = activeStore.settings?.notificationSettings?.whatsappAlertPhone || activeStore.design?.whatsappNumber || activeStore.ownerPhone || '9647714834776';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('964')) cleanPhone = `964${cleanPhone.replace(/^0+/, '')}`;

    try {
      logWhatsAppActivity({
        direction: 'outbound',
        storeId: activeStore.id,
        storeName,
        storeSlug: activeStore.slug,
        recipientName: lastPlacedOrder.customer.fullName,
        recipientPhone: `+${cleanPhone}`,
        categoryLabelAr: 'تأكيد الطلب للزبون',
        categoryLabelEn: 'Customer Confirmation',
        content: rendered.content,
        status: 'sent',
        orderNumber: lastPlacedOrder.orderNumber,
      });
    } catch (e) {
      // ignore
    }

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(rendered.content)}`, '_blank');
  };

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Ignore
    }
  }, []);

  if (!lastPlacedOrder) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{language === 'ar' ? 'لا يوجد طلب حديث' : 'No recent order found'}</h2>
        <button
          onClick={() => setCurrentPage('home')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold"
        >
          {t.home}
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Top success card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.orderConfirmed}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t.thankYouOrder}
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            {t.orderSentTo}{' '}
            <strong className="text-slate-900">{lastPlacedOrder.customer.email}</strong>.
          </p>
        </div>

        {/* Order Details Header Box */}
        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block font-medium">{t.orderNumber}</span>
            <span className="font-bold text-slate-900 text-sm">{lastPlacedOrder.orderNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">{t.orderDate}</span>
            <span className="font-bold text-slate-900 text-sm">
              {new Date(lastPlacedOrder.date).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">{t.total}</span>
            <span className="font-black text-emerald-700 text-sm">
              {currency}{lastPlacedOrder.total.toFixed(2)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block font-medium">{t.paymentMethod}</span>
            <span className="font-bold text-slate-900 text-sm">
              {lastPlacedOrder.paymentMethod === 'Cash on Delivery'
                ? (language === 'ar' ? 'الدفع نقداً عند الاستلام' : 'Cash on Delivery')
                : lastPlacedOrder.paymentMethod}
            </span>
          </div>
        </div>

        {/* Live Delivery Timeline & Iraqi Tracking Box */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>{lastPlacedOrder.courier || (language === 'ar' ? 'واصل إكسبريس (Wasel Express)' : 'Wasel Express')}</span>
            </div>
            {lastPlacedOrder.trackingNumber && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {language === 'ar' ? 'كود التتبع:' : 'Tracking Code:'}
                </span>
                <span className="font-mono font-bold text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200 shadow-2xs">
                  {lastPlacedOrder.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(lastPlacedOrder.trackingNumber!)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
                  title={language === 'ar' ? 'نسخ كود التتبع' : 'Copy Tracking Code'}
                >
                  {copiedTracking ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {lastPlacedOrder.trackingNumber && getIraqiTrackingUrl(lastPlacedOrder.trackingNumber, lastPlacedOrder.courier) && (
            <div className="flex justify-end">
              <a
                href={getIraqiTrackingUrl(lastPlacedOrder.trackingNumber, lastPlacedOrder.courier)!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline inline-flex items-center gap-1"
              >
                <span>{language === 'ar' ? 'تتبع الشحنة مباشرة على موقع شركة الشحن' : 'Track on Courier Official Portal'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          <div className="relative pt-2 pb-4">
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-1/3" />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
              <span className="text-emerald-700 font-bold">{t.orderPlacedStep}</span>
              <span className="text-slate-800">{t.processingStep}</span>
              <span>{t.shippedStep}</span>
              <span>{t.deliveredStep}</span>
            </div>
          </div>
        </div>

        {/* Ordered items breakdown */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">{t.orderSummary}</h3>
          <div className="divide-y divide-slate-100">
            {lastPlacedOrder.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.productName}</h4>
                    <p className="text-[11px] text-slate-500">Qty: {item.quantity} × {currency}{item.price}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900">
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping address recap */}
        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 border border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <span className="font-bold text-slate-900 block mb-1">{t.shippingDestination}:</span>
            <p>{lastPlacedOrder.customer.fullName}</p>
            <p>{lastPlacedOrder.customer.address}</p>
            <p>{lastPlacedOrder.customer.city}, {lastPlacedOrder.customer.state} {lastPlacedOrder.customer.zipCode}</p>
          </div>
          <div className="sm:text-end">
            <span className="font-bold text-slate-900 block mb-1">{t.estimatedArrival}</span>
            <p className="text-emerald-700 font-semibold">{t.carrierUsps}</p>
          </div>
        </div>

        {/* WhatsApp Direct Confirmation Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSendWhatsAppConfirmation}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>{language === 'ar' ? 'تأكيد وإرسال تفاصيل الطلب عبر واتساب المتجر 📲' : 'Confirm Order via Store WhatsApp 📲'}</span>
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => setCurrentPage('orders')}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <Package className="w-4 h-4" />
            <span>{t.trackInOrders}</span>
          </button>

          <button
            onClick={() => setCurrentPage('shop')}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <span>{t.continueShopping}</span>
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={handlePrint}
            className="p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors hidden sm:flex items-center justify-center"
            title={t.printReceipt}
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
