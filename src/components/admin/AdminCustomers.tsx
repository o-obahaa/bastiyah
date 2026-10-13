import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, Mail, MapPin, Award, UserCheck } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { customers, t, language } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {t.customerDirectory} ({customers.length})
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.customerDirectoryDesc}</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder={language === 'ar' ? 'البحث بالاسم، البريد، المدينة...' : 'Search customers by name, email, or city...'}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCustomers.map((customer) => {
                const isVip = customer.totalSpent >= 500;
                return (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={customer.avatar}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                            {customer.name}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {customer.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{customer.city}, {customer.country}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {customer.ordersCount} {t.orders}
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 text-xs sm:text-sm">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      {isVip ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>{t.vipMember}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          <UserCheck className="w-3 h-3 text-slate-500" />
                          <span>{t.standard}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {customer.joinedDate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
