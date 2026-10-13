import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const { orders, setCurrentPage, setAdminTab, t, language } = useStore();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {t.delivered}</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 flex items-center gap-1"><Truck className="w-3 h-3" /> {t.shipped}</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1"><Clock className="w-3 h-3" /> {t.processing}</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">{t.cancelled}</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">{t.pending}</span>;
    }
  };

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'delivered': return '100%';
      case 'shipped': return '75%';
      case 'processing': return '40%';
      case 'cancelled': return '0%';
      default: return '15%';
    }
  };

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.orderHistoryTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t.orderHistorySubtitle}
          </p>
        </div>

        {/* Admin hint pill */}
        <button
          onClick={() => {
            setCurrentPage('admin');
            setAdminTab('orders');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors w-fit"
        >
          <span>{t.manageInAdmin}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">{t.noOrdersYet}</h2>
          <button
            onClick={() => setCurrentPage('shop')}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
          >
            {t.shopNow}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6"
            >
              {/* Order header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900 text-base">
                      {order.orderNumber}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-end">
                  <span className="text-xs text-slate-400 block">{t.total}</span>
                  <span className="text-lg font-black text-emerald-700">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              {order.status !== 'cancelled' && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>{t.orderPlacedStep}</span>
                    <span>{t.processingStep}</span>
                    <span>{t.shippedStep}</span>
                    <span>{t.deliveredStep}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: getProgressWidth(order.status) }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                    <span>{t.carrierUsps}</span>
                    {order.trackingNumber && (
                      <span className="font-mono text-emerald-700 font-semibold">
                        {order.trackingNumber}
                      </span>
                    )}
                  </div>
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
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{item.productName}</h4>
                        <span className="text-[11px] text-slate-500">
                          Qty: {item.quantity} × ${item.price}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Customer and address summary */}
              <div className="pt-2 flex flex-col sm:flex-row justify-between text-xs text-slate-500 border-t border-slate-100 gap-2">
                <div>
                  <span className="font-bold text-slate-700">{t.fullName}:</span> {order.customer.fullName} ({order.customer.email})
                </div>
                <div>
                  <span className="font-bold text-slate-700">{t.shippingDestination}:</span> {order.customer.address}, {order.customer.city}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
