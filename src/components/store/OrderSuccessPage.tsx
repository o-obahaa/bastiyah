import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  Printer, 
  Sparkles 
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { lastPlacedOrder, setCurrentPage, t, language, activeStore } = useStore();
  const currency = activeStore.settings.currency || 'د.ع';

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
            <span className="font-bold text-slate-900 text-sm">{lastPlacedOrder.paymentMethod}</span>
          </div>
        </div>

        {/* Live Delivery Timeline */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-bold text-slate-900">{t.deliveryStatus}</h3>
            <span className="font-semibold text-emerald-700">
              {lastPlacedOrder.trackingNumber}
            </span>
          </div>

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
