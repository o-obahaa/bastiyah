import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Plus, Tag, Settings, Save, X, Database, Cloud, Server, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    coupons, 
    addCoupon, 
    toggleCouponStatus, 
    t, 
    language,
    activeStore,
    isConvexConnected,
    isCloudflareConfigured,
  } = useStore();

  const [formSettings, setFormSettings] = useState({
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    currency: settings.currency,
    freeShippingThreshold: settings.freeShippingThreshold,
    standardShippingFee: settings.standardShippingFee,
    taxRatePercent: (settings.taxRate * 100).toFixed(1),
  });

  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [newCouponData, setNewCouponData] = useState({
    code: '',
    discountPercent: 15,
    minSpend: 50,
    description: '',
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: formSettings.storeName,
      supportEmail: formSettings.supportEmail,
      currency: formSettings.currency,
      freeShippingThreshold: Number(formSettings.freeShippingThreshold),
      standardShippingFee: Number(formSettings.standardShippingFee),
      taxRate: Number(formSettings.taxRatePercent) / 100,
    });
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponData.code.trim()) return;

    addCoupon({
      code: newCouponData.code.trim().toUpperCase(),
      discountPercent: Number(newCouponData.discountPercent),
      minSpend: Number(newCouponData.minSpend),
      active: true,
      description: newCouponData.description || `${newCouponData.discountPercent}% off orders over $${newCouponData.minSpend}`,
    });

    setNewCouponData({ code: '', discountPercent: 15, minSpend: 50, description: '' });
    setIsNewCouponOpen(false);
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">
          {t.storeConfig}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{t.storeConfigDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: General Store Settings */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
            <Settings className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">{t.storefrontPreferences}</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'اسم المتجر' : 'Store Name'}</label>
                <input
                  type="text"
                  required
                  value={formSettings.storeName}
                  onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'البريد الإلكتروني للدعم' : 'Support Email'}</label>
                <input
                  type="email"
                  required
                  value={formSettings.supportEmail}
                  onChange={(e) => setFormSettings({ ...formSettings, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'رمز العملة' : 'Currency Symbol'}</label>
                <input
                  type="text"
                  required
                  value={formSettings.currency}
                  onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'حد الشحن المجاني ($)' : 'Free Shipping ($)'}</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formSettings.freeShippingThreshold}
                  onChange={(e) => setFormSettings({ ...formSettings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'رسوم الشحن العادي ($)' : 'Standard Fee ($)'}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formSettings.standardShippingFee}
                  onChange={(e) => setFormSettings({ ...formSettings, standardShippingFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {language === 'ar' ? 'نسبة الضريبة المضافة (%)' : 'Tax Rate Percentage (%)'}
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formSettings.taxRatePercent}
                  onChange={(e) => setFormSettings({ ...formSettings, taxRatePercent: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
                <span className="text-slate-500 font-bold">%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{t.savePreferences}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Promotional Coupons */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">{t.promoCoupons}</h3>
            </div>
            <button
              onClick={() => setIsNewCouponOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.createCoupon}</span>
            </button>
          </div>

          {/* Coupons List */}
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div
                key={coupon.code}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  coupon.active
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/60 opacity-60'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">
                      {coupon.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {coupon.discountPercent}% OFF
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Min: ${coupon.minSpend} • {coupon.description}
                  </p>
                </div>

                <button
                  onClick={() => toggleCouponStatus(coupon.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                    coupon.active
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {coupon.active ? t.active : t.disabled}
                </button>
              </div>
            ))}
          </div>

          {/* New Coupon Modal */}
          {isNewCouponOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <div 
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 p-6 space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-base text-slate-900">{t.createCoupon}</h4>
                  <button onClick={() => setIsNewCouponOpen(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t.couponCode}</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. PANDA20"
                      value={newCouponData.code}
                      onChange={(e) => setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t.discount} %</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={newCouponData.discountPercent}
                        onChange={(e) => setNewCouponData({ ...newCouponData, discountPercent: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'الحد الأدنى للطلب ($)' : 'Min Spend ($)'}</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={newCouponData.minSpend}
                        onChange={(e) => setNewCouponData({ ...newCouponData, minSpend: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{language === 'ar' ? 'الوصف' : 'Description'}</label>
                    <input
                      type="text"
                      placeholder="e.g. Special weekend discount"
                      value={newCouponData.description}
                      onChange={(e) => setNewCouponData({ ...newCouponData, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsNewCouponOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20"
                    >
                      {language === 'ar' ? 'حفظ الكوبون' : 'Save Coupon'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cloud & Database Infrastructure Card for Merchant */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-slate-800 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                {language === 'ar' ? 'البنية السحابية وقاعدة البيانات المتصلة' : 'Connected Cloud & Database Engines'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ar' ? `بيانات متجر ${activeStore.name} معزولة ومستضافة سحابياً` : `Real-time tenant data isolated for ${activeStore.name}`}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'سحابي معتمد' : 'Cloud Native'}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <span>Convex Database</span>
                <span className={`w-2 h-2 rounded-full ${isConvexConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isConvexConnected
                  ? (language === 'ar' ? 'متصل لحظياً بقاعدة بيانات Convex' : 'Live real-time multi-tenant reactive sync')
                  : (language === 'ar' ? 'جاهز للربط الفوري (VITE_CONVEX_URL)' : 'Ready for deployment (VITE_CONVEX_URL)')}
              </p>
            </div>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <span>Cloudflare R2 Media</span>
                <span className="w-2 h-2 rounded-full bg-sky-400" />
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {language === 'ar'
                  ? 'استضافة صور المنتجات والغلاف عبر images.bastiyah.com'
                  : 'Fast zero-egress picture delivery via images.bastiyah.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
