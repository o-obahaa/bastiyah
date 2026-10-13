import React from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    products, 
    orders, 
    customers, 
    updateOrderStatus, 
    updateProduct, 
    setAdminTab,
    addToast,
    t,
    language,
    getProductName
  } = useStore();

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const lowStockProducts = products.filter((p) => p.stock <= 15);

  const handleQuickRestock = (productId: string, currentStock: number) => {
    updateProduct(productId, { stock: currentStock + 20 });
    addToast(language === 'ar' ? 'تمت إضافة +20 وحدة للمخزون' : 'Restocked +20 units', 'success');
  };

  const days = language === 'ar'
    ? [{ day: 'الإثنين', amount: 840, height: '40%' }, { day: 'الثلاثاء', amount: 1290, height: '60%' }, { day: 'الأربعاء', amount: 980, height: '48%' }, { day: 'الخميس', amount: 1650, height: '78%' }, { day: 'الجمعة', amount: 2100, height: '95%' }, { day: 'السبت', amount: 1890, height: '88%' }, { day: 'الأحد', amount: 1420, height: '68%' }]
    : [{ day: 'Mon', amount: 840, height: '40%' }, { day: 'Tue', amount: 1290, height: '60%' }, { day: 'Wed', amount: 980, height: '48%' }, { day: 'Thu', amount: 1650, height: '78%' }, { day: 'Fri', amount: 2100, height: '95%' }, { day: 'Sat', amount: 1890, height: '88%' }, { day: 'Sun', amount: 1420, height: '68%' }];

  return (
    <div className="space-y-8">
      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.totalRevenue}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-slate-900">
              ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4%</span>
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
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'جميع القنوات' : 'All channels'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
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
              <span>{language === 'ar' ? 'حسابات نشطة' : 'Registered'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.lowStockWarnings}
            </span>
            <p className="text-2xl sm:text-3xl font-black text-amber-600">
              {lowStockProducts.length}
            </p>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تتطلب تزويد' : 'Need restock'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Visual Revenue Graph & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Performance Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-slate-900">
                {t.revenueVelocity}
              </h3>
              <p className="text-xs text-slate-400">{t.weeklyVolume}</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              +24% Target Pace
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-100">
            {days.map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded shadow-sm">
                  ${bar.amount}
                </div>
                <div 
                  className="w-full max-w-[42px] bg-slate-900 group-hover:bg-emerald-600 rounded-t-xl transition-all duration-300"
                  style={{ height: bar.height }}
                />
                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900">
                  {bar.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{language === 'ar' ? 'متوسط قيمة الطلب: $284.10' : 'Average Order Value: $284.10'}</span>
            <span>{language === 'ar' ? 'معدل التحويل: 3.82%' : 'Conversion Rate: 3.82%'}</span>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-base text-slate-900">{t.inventoryAlert}</h3>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Attention
              </span>
            </div>

            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
              {lowStockProducts.slice(0, 4).map((p) => {
                const pName = getProductName(p);
                return (
                  <div key={p.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                    <img
                      src={p.images[0]}
                      alt={pName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{pName}</h4>
                      <span className="text-[11px] font-semibold text-rose-600">
                        {t.stock}: {p.stock}
                      </span>
                    </div>
                    <button
                      onClick={() => handleQuickRestock(p.id, p.stock)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                    >
                      +20
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setAdminTab('products')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{t.manageAllProducts}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">{t.recentCustomerOrders}</h3>
            <p className="text-xs text-slate-400">{t.ordersDesc}</p>
          </div>
          <button
            onClick={() => setAdminTab('orders')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>{t.viewAllOrders} ({orders.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">{t.orderNumber}</th>
                <th className="py-3 px-4">{t.fullName}</th>
                <th className="py-3 px-4">{t.orderDate}</th>
                <th className="py-3 px-4">{t.price}</th>
                <th className="py-3 px-4">{t.deliveryStatus}</th>
                <th className="py-3 px-4 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 block">{order.customer.fullName}</span>
                    <span className="text-[11px] text-slate-400">{order.customer.email}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
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
                    <button
                      onClick={() => setAdminTab('orders')}
                      className="text-emerald-700 hover:text-emerald-900 font-bold"
                    >
                      {language === 'ar' ? 'التفاصيل ←' : 'Details →'}
                    </button>
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
