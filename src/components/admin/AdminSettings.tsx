import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Plus, 
  Tag, 
  Settings, 
  Save, 
  X, 
  Database, 
  Cloud, 
  Server, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  Banknote, 
  Phone, 
  Smartphone,
  Trash2,
  DollarSign,
  ShieldCheck,
  Check,
  Download,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  MessageCircle,
  ExternalLink,
  Laptop,
  CheckCircle
} from 'lucide-react';
import { generateWhatsAppAlertUrl } from '../../utils/notificationUtils';

export const AdminSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    coupons, 
    addCoupon, 
    toggleCouponStatus, 
    deleteCoupon,
    updateHostedStore,
    t, 
    language,
    activeStore,
    isConvexConnected,
    isCloudflareConfigured,
    addToast,
    setAdminTab,
    updateNotificationSettings,
    playNotificationSound,
    requestBrowserNotifications
  } = useStore();

  const [formSettings, setFormSettings] = useState({
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    currency: settings.currency || '$',
    freeShippingThreshold: settings.freeShippingThreshold,
    standardShippingFee: settings.standardShippingFee,
    taxRatePercent: (settings.taxRate * 100).toFixed(1),
    phoneNumber: settings.phoneNumber || '',
    bankDetails: settings.bankDetails || '',
  });

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState({
    cashOnDelivery: settings.paymentMethods?.cashOnDelivery ?? true,
    creditCard: settings.paymentMethods?.creditCard ?? false,
    bankTransfer: settings.paymentMethods?.bankTransfer ?? false,
    applePay: settings.paymentMethods?.applePay ?? false,
  });

  // Merchant login credentials & security
  const [ownerLoginPhone, setOwnerLoginPhone] = useState(activeStore.ownerPhone || '+964 770 123 4567');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [newCouponData, setNewCouponData] = useState({
    code: '',
    discountPercent: 15,
    minSpend: 25000,
    description: '',
  });

  const currencies = [
    { symbol: 'د.ع', label: 'IQD (د.ع) — دينار عراقي (العملة الرسمية داخل العراق)' },
    { symbol: '$', label: 'USD ($) — دولار أمريكي' },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: formSettings.storeName,
      supportEmail: formSettings.supportEmail,
      currency: formSettings.currency,
      freeShippingThreshold: Number(formSettings.freeShippingThreshold),
      standardShippingFee: Number(formSettings.standardShippingFee),
      taxRate: Number(formSettings.taxRatePercent) / 100,
      phoneNumber: formSettings.phoneNumber.trim(),
      bankDetails: formSettings.bankDetails.trim(),
      paymentMethods: paymentMethods,
    });
    addToast(language === 'ar' ? 'تم حفظ إعدادات المتجر بنجاح!' : 'Store settings updated!', 'success');
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerLoginPhone.trim()) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم جوال مالك المتجر' : 'Please provide owner phone number', 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      addToast(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'error');
      return;
    }

    updateHostedStore(activeStore.id, {
      ownerPhone: ownerLoginPhone.trim(),
      ...(newPassword.trim() ? { adminPassword: newPassword.trim() } : {}),
    });

    setNewPassword('');
    setConfirmPassword('');
    addToast(
      language === 'ar' ? 'تم حفظ بيانات أمان الدخول ورقم الجوال بنجاح!' : 'Login phone and security settings saved!',
      'success'
    );
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponData.code.trim()) return;

    addCoupon({
      code: newCouponData.code.trim().toUpperCase(),
      discountPercent: Number(newCouponData.discountPercent),
      minSpend: Number(newCouponData.minSpend),
      active: true,
      description: newCouponData.description || `${newCouponData.discountPercent}% off orders over ${formSettings.currency}${newCouponData.minSpend}`,
    });

    setNewCouponData({ code: '', discountPercent: 15, minSpend: 25000, description: '' });
    setIsNewCouponOpen(false);
    addToast(language === 'ar' ? 'تم إنشاء كود الخصم بنجاح!' : 'Coupon created successfully!', 'success');
  };

  const handleDeleteCoupon = (code: string) => {
    if (window.confirm(language === 'ar' ? `هل أنت متأكد من حذف كود الخصم (${code})؟` : `Delete coupon ${code}?`)) {
      deleteCoupon(code);
      addToast(language === 'ar' ? 'تم حذف كود الخصم بنجاح' : 'Coupon deleted', 'info');
    }
  };

  const handleDownloadStoreBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      store: activeStore
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `store-backup-${activeStore.slug}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast(language === 'ar' ? 'تم تنزيل النسخة الاحتياطية لمتجرك بنجاح!' : 'Store backup downloaded!', 'success');
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {language === 'ar' ? 'إعدادات المتجر، الشحن، والكوبونات' : t.storeConfig}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'ar' ? 'ضبط العملة، رسوم الشحن، بوابات الدفع، وإدارة أكواد التخفيض' : t.storeConfigDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: General Store Settings & Payment Methods */}
        <div className="lg:col-span-7 space-y-8">
          {/* General Preferences */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Settings className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">{t.storefrontPreferences}</h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'البيانات التجارية الأساسية ورسوم التوصيل' : 'Primary store operations & delivery rates'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم المتجر الرسمي' : 'Store Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formSettings.storeName}
                    onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني للدعم' : 'Support Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formSettings.supportEmail}
                    onChange={(e) => setFormSettings({ ...formSettings, supportEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Currency & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عملة المتجر المعتمدة' : 'Store Currency'}
                  </label>
                  <select
                    value={formSettings.currency}
                    onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                  >
                    {currencies.map((c) => (
                      <option key={c.symbol} value={c.symbol}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم هاتف خدمة العملاء' : 'Customer Support Phone'}
                  </label>
                  <input
                    type="text"
                    placeholder="9647XXXXXXXX"
                    value={formSettings.phoneNumber}
                    onChange={(e) => setFormSettings({ ...formSettings, phoneNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Shipping & Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? `حد الشحن المجاني (${formSettings.currency})` : 'Free Shipping Threshold'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formSettings.freeShippingThreshold}
                    onChange={(e) => setFormSettings({ ...formSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? `رسوم التوصيل القياسية (${formSettings.currency})` : 'Standard Delivery Fee'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formSettings.standardShippingFee}
                    onChange={(e) => setFormSettings({ ...formSettings, standardShippingFee: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formSettings.taxRatePercent}
                    onChange={(e) => setFormSettings({ ...formSettings, taxRatePercent: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Trust Badges Notice & Shortcut */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {language === 'ar' ? 'شارات الثقة ومميزات المتجر (Trust Badges)' : 'Trust Badges & Guarantees'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {language === 'ar' ? 'تخصيص نصوص وأيقونات الشحن، الإرجاع، والضمان الظاهرة بالفوتر' : 'Customize icons & text for shipping, returns, warranty and support'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminTab('design')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
                >
                  {language === 'ar' ? 'تعديل الشارات في التصميم ←' : 'Edit Badges in Design →'}
                </button>
              </div>

              {/* Payment Gateways / Methods Configuration */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">
                  {language === 'ar' ? 'طرق الدفع المفعلة للعملاء' : 'Accepted Payment Gateways'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cashOnDelivery}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, cashOnDelivery: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'التحصيل عند الباب' : 'Pay upon delivery'}</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.creditCard}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, creditCard: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">{language === 'ar' ? 'البطاقات الإلكترونية / كي كارد / ماستركارد' : 'Debit / Credit / Qi Card'}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'دفع إلكتروني فوري' : 'Online checkout'}</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.applePay}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, applePay: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <CreditCard className="w-4 h-4 text-slate-900" />
                    <div>
                      <span className="font-bold text-slate-800 block">Apple Pay</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'دفع فوري بلمسة واحدة' : 'One-tap checkout'}</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.bankTransfer}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, bankTransfer: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">{language === 'ar' ? 'التحويل المصرفي / محفظة زين كاش' : 'Direct Bank / Mobile Wallet'}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'إيداع على حساب التاجر' : 'Wire to bank account'}</span>
                    </div>
                  </label>
                </div>

                {paymentMethods.bankTransfer && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'ar' ? 'بيانات الحساب المصرفي أو رقم محفظة زين كاش' : 'Bank Details or Zain Cash Wallet'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={language === 'ar' ? 'اسم المصرف (مثال: مصرف التي بي آي / مصرف بغداد / محفظة زين كاش 0780...)' : 'Bank name / Qi Card / Zain Cash Wallet 0780...'}
                      value={formSettings.bankDetails}
                      onChange={(e) => setFormSettings({ ...formSettings, bankDetails: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ إعدادات المتجر' : t.savePreferences}</span>
                </button>
              </div>
            </form>
          </div>

          {/* New Order Notifications & Alert Settings */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'ar' ? 'إشعارات وتنبيهات الطلبات الجديدة' : 'New Order Alerts & Notifications'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar'
                      ? 'تنبيهك فوراً بنغمة صوتية وإشعارات سطح المكتب عند تقديم أي عميل لطلب جديد في متجرك'
                      : 'Get alerted instantly with audio chimes & desktop push notifications whenever an order is submitted'}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === 'ar' ? 'نظام التنبيهات نشط' : 'Alerts Active'}</span>
              </span>
            </div>

            <div className="space-y-4">
              {/* Sound Chime Alert Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                    {activeStore.settings.notificationSettings?.soundEnabled !== false ? (
                      <Volume2 className="w-4.5 h-4.5 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-4.5 h-4.5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {language === 'ar' ? 'صوت التنبيه الموسيقي للطلبات (Sound Chime)' : 'Melodic Order Arrival Chime'}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {language === 'ar'
                        ? 'تشغيل نغمة كاشير تنبيهية مميزة تلقائياً فور تأكيد أي طلب جديد عبر المتجر'
                        : 'Play a crisp melodic cash register chime automatically upon each order confirmation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={playNotificationSound}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'ar' ? 'تجربة الصوت 🔊' : 'Test Sound 🔊'}</span>
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeStore.settings.notificationSettings?.soundEnabled !== false}
                      onChange={(e) => updateNotificationSettings({ soundEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative" />
                  </label>
                </div>
              </div>

              {/* Desktop Browser Push Notifications */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                    <Bell className="w-4.5 h-4.5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {language === 'ar' ? 'إشعارات سطح المكتب للمتصفح (Web Push)' : 'Desktop Browser Notifications'}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {language === 'ar'
                        ? 'إرسال إشعار فوري لسطح المكتب برقم وتفاصيل الطلب حتى لو كانت لوحة التحكم مصغرة'
                        : 'Receive desktop banners with order number & details even when the browser is minimized'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'ar' ? 'مفعّلة بالمتصفح' : 'Active in Browser'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestBrowserNotifications}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {language === 'ar' ? 'تفعيل إشعارات المتصفح' : 'Enable Browser Push'}
                    </button>
                  )}
                </div>
              </div>

              {/* WhatsApp Notification Number & Instant Test */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {language === 'ar' ? 'رقم الواتساب لتلقي تنبيهات الطلبات الفورية' : 'WhatsApp Order Alert Phone'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                    {language === 'ar' ? 'يعمل حتى عند إغلاق الموقع' : 'Works even when site is closed'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="9647XXXXXXXX"
                    value={activeStore.settings.notificationSettings?.whatsappAlertPhone || activeStore.ownerPhone || ''}
                    onChange={(e) => updateNotificationSettings({ whatsappAlertPhone: e.target.value })}
                    className="w-full sm:flex-1 p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const targetPhone = activeStore.settings.notificationSettings?.whatsappAlertPhone || activeStore.ownerPhone || '9647701234567';
                      const testUrl = generateWhatsAppAlertUrl(
                        targetPhone,
                        'TEST-88120',
                        'عميل تجريبي',
                        '+964 770 000 0000',
                        `${activeStore.settings.currency}125,000`,
                        2,
                        activeStore.nameAr || activeStore.name
                      );
                      window.open(testUrl, '_blank');
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 w-full sm:w-auto justify-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'تجربة إرسال تنبيه واتساب 📲' : 'Test WhatsApp Alert 📲'}</span>
                  </button>
                </div>
              </div>

              {/* Offline & Closed-Website Background Notification Explainer */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'ar' ? 'كيف تعمل التنبيهات عندما يكون الموقع أو المتصفح مغلقاً؟' : 'How alerts work when the website is closed'}</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                  <p className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{language === 'ar' ? 'خدمة خلفية المتصفح (Service Worker):' : 'Background Service Worker:'}</strong> {language === 'ar' ? 'تم تسجيل ملف الخلفية بنجاح، حيث يستمر المتصفح في الاستماع وإظهار إشعارات النظام المباشرة.' : 'Background service worker is registered and triggers OS system notifications.'}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{language === 'ar' ? 'تنبيهات الواتساب الفورية (WhatsApp Direct):' : 'Instant WhatsApp Alerts:'}</strong> {language === 'ar' ? 'أضمن وسيلة لاستقبال الطلبات على هاتفك المحمول 24/7 حتى وإن كان جهاز الكمبيوتر مطفأً تماماً.' : 'Most reliable way to get order pings on your phone 24/7 even if your PC is powered off.'}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{language === 'ar' ? 'تطبيق الويب المستقل (PWA App):' : 'Standalone Web App (PWA):'}</strong> {language === 'ar' ? 'يمكنك تثبيت لوحة التحكم كتطبيق مستقل من خيارات المتصفح (Install App) لتعمل كتطبيق هاتف أو حاسوب دائم.' : 'Install the admin panel as an app from browser menu for dedicated OS integration.'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Owner Password & Security */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'أمان وتسجيل دخول مالك المتجر' : 'Store Owner Authentication & Security'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'تحديث رقم الجوال المستخدم في تسجيل الدخول (SMS OTP) وكلمة المرور' : 'Update your login mobile phone (SMS OTP) and panel password'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSecurity} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'رقم جوال تسجيل الدخول (معتمد لرموز SMS)' : 'Merchant Login Phone (SMS OTP)'} *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={ownerLoginPhone}
                    onChange={(e) => setOwnerLoginPhone(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    dir="ltr"
                  />
                  <Smartphone className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'ar'
                    ? 'يُستخدم هذا الرقم للتحقق المباشر عند تسجيل الدخول إلى لوحة إدارة متجرك وتلقي رمز التحقق السري.'
                    : 'This mobile number is used to verify store owner access and receive 4-digit SMS OTP codes.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تغيير كلمة المرور (اختياري)' : 'New Password (Optional)'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'حفظ إعدادات الأمان والجوال' : 'Save Security & Phone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Discount Coupons & Cloud Sync */}
        <div className="lg:col-span-5 space-y-8">
          {/* Coupon Management */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">{language === 'ar' ? 'أكواد وكوبونات الخصم' : t.promoCoupons}</h3>
              </div>
              <button
                onClick={() => setIsNewCouponOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1"
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
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900 tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {coupon.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {coupon.description || `Min spend ${formSettings.currency}${coupon.minSpend}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCouponStatus(coupon.code)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        coupon.active
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {coupon.active ? t.active : t.disabled}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={language === 'ar' ? 'حذف الكوبون' : 'Delete coupon'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Infrastructure Connection Status */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'حالة السحابة وقواعد البيانات' : 'Cloud Infrastructure'}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Convex Database</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isConvexConnected ? 'Connected' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-slate-800">Cloudflare Images / R2</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isCloudflareConfigured ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Store Data & Disaster Recovery Backup Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'النسخ الاحتياطي وحفظ البيانات' : 'Store Data & Backup'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'قم بتنزيل نسخة احتياطية كاملة لمتجرك (المنتجات، الكوبونات، الطلبات، والإعدادات) في ملف JSON يمكنك الاحتفاظ به بأمان.'
                : 'Download a JSON snapshot of your store catalog, coupons, orders, and configuration.'}
            </p>

            <button
              type="button"
              onClick={handleDownloadStoreBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'تحميل نسخة احتياطية للمتجر (JSON)' : 'Download Store Backup (JSON)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Coupon Modal */}
      {isNewCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t.createCoupon}</h3>
              <button
                onClick={() => setIsNewCouponOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'رمز الكوبون (Code)' : 'Coupon Code'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20"
                  value={newCouponData.code}
                  onChange={(e) => setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نسبة الخصم (%)' : 'Discount (%)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newCouponData.discountPercent}
                    onChange={(e) => setNewCouponData({ ...newCouponData, discountPercent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? `الحد الأدنى للطلب (${formSettings.currency})` : 'Min Spend'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCouponData.minSpend}
                    onChange={(e) => setNewCouponData({ ...newCouponData, minSpend: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'وصف الكوبون الترويجي' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="خصم ترحيبي للعملاء الجدد"
                  value={newCouponData.description}
                  onChange={(e) => setNewCouponData({ ...newCouponData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCouponOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  {language === 'ar' ? 'إنشاء وتفعيل' : 'Create & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
