import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import { 
  Search, 
  Eye, 
  X
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, t, language } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [inspectingOrder, setInspectingOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const statusOptions: { label: string; value: string; count: number }[] = [
    { label: t.allOrders, value: 'All', count: orders.length },
    { label: t.pending, value: 'pending', count: orders.filter((o) => o.status === 'pending').length },
    { label: t.processing, value: 'processing', count: orders.filter((o) => o.status === 'processing').length },
    { label: t.shipped, value: 'shipped', count: orders.filter((o) => o.status === 'shipped').length },
    { label: t.delivered, value: 'delivered', count: orders.filter((o) => o.status === 'delivered').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {t.ordersAndFulfillment} ({orders.length})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.ordersDesc}</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusOptions.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedStatus(tab.value)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedStatus === tab.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              selectedStatus === tab.value ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder={language === 'ar' ? 'البحث برقم الطلب، اسم العميل، البريد الإلكتروني...' : 'Search by order ID, customer name, email...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'
          }`}
        />
        <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
          language === 'ar' ? 'right-3' : 'left-3'
        }`} />
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t.orderNumber} & {t.orderDate}</th>
                <th className="py-3.5 px-4">{t.fullName}</th>
                <th className="py-3.5 px-4">{t.orderSummary}</th>
                <th className="py-3.5 px-4">{t.paymentMethod}</th>
                <th className="py-3.5 px-4">{t.total}</th>
                <th className="py-3.5 px-4">{t.deliveryStatus}</th>
                <th className="py-3.5 px-4 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{order.customer.fullName}</span>
                    <span className="text-[11px] text-slate-400">{order.customer.email}</span>
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
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ${order.total.toFixed(2)}
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
                    <button
                      onClick={() => setInspectingOrder(order)}
                      className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors inline-flex items-center gap-1 font-bold text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'عرض' : 'View'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {t.orderNumber}: {inspectingOrder.orderNumber}
                </h3>
                <span className="text-xs text-slate-400">
                  {new Date(inspectingOrder.date).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setInspectingOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Shipping & Customer */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.fullName}</h4>
                  <p className="font-semibold text-slate-800">{inspectingOrder.customer.fullName}</p>
                  <p className="text-slate-500">{inspectingOrder.customer.email}</p>
                  <p className="text-slate-500">{inspectingOrder.customer.phone}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">{t.shippingDestination}</h4>
                  <p>{inspectingOrder.customer.address}</p>
                  <p>{inspectingOrder.customer.city}, {inspectingOrder.customer.state} {inspectingOrder.customer.zipCode}</p>
                  <p>{inspectingOrder.customer.country}</p>
                </div>
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
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.productName}</p>
                          <p className="text-slate-400">Qty: {item.quantity} × ${item.price}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Summary */}
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-slate-900">${inspectingOrder.subtotal.toFixed(2)}</span>
                </div>
                {inspectingOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t.discount}</span>
                    <span>-${inspectingOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span className="font-semibold text-slate-900">
                    {inspectingOrder.shipping === 0 ? t.free : `$${inspectingOrder.shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.estimatedTax}</span>
                  <span className="font-semibold text-slate-900">${inspectingOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t.total}</span>
                  <span className="text-emerald-700">${inspectingOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
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
