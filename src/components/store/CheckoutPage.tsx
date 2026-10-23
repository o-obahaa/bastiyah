import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingAddress, Order } from '../../types';
import { 
  Truck, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  ShoppingBag,
  Banknote,
  MapPin,
  CheckCircle2,
  Phone,
  User,
  ShieldCheck
} from 'lucide-react';

export const IRAQ_GOVERNORATES = [
  { ar: 'بغداد (العاصمة)', en: 'Baghdad (Capital)', code: 'BG' },
  { ar: 'البصرة', en: 'Basra', code: 'BA' },
  { ar: 'أربيل', en: 'Erbil', code: 'ER' },
  { ar: 'النجف الأشرف', en: 'Najaf', code: 'NA' },
  { ar: 'كربلاء المقدسة', en: 'Karbala', code: 'KA' },
  { ar: 'نينوى (الموصل)', en: 'Nineveh (Mosul)', code: 'NI' },
  { ar: 'كركوك', en: 'Kirkuk', code: 'KI' },
  { ar: 'السليمانية', en: 'Sulaymaniyah', code: 'SU' },
  { ar: 'دهوك', en: 'Duhok', code: 'DA' },
  { ar: 'بابل (الحلة)', en: 'Babylon (Hillah)', code: 'BB' },
  { ar: 'الأنبار (الرمادي/الفلوجة)', en: 'Anbar (Ramadi/Fallujah)', code: 'AN' },
  { ar: 'ديالى (بعقوبة)', en: 'Diyala (Baqubah)', code: 'DI' },
  { ar: 'ذي قار (الناصرية)', en: 'Dhi Qar (Nasiriyah)', code: 'DQ' },
  { ar: 'ميسان (العمارة)', en: 'Maysan (Amarah)', code: 'MA' },
  { ar: 'المثنى (السماوة)', en: 'Muthanna (Samawah)', code: 'MU' },
  { ar: 'القادسية (الديوانية)', en: 'Al-Qadisiyyah (Diwaniyah)', code: 'QA' },
  { ar: 'واسط (الكوت)', en: 'Wasit (Kut)', code: 'WA' },
  { ar: 'صلاح الدين (تكريت/سامراء)', en: 'Saladin (Tikrit/Samarra)', code: 'SD' },
];

export const CheckoutPage: React.FC = () => {
  const { 
    activeStore,
    cart, 
    cartSubtotal, 
    cartDiscount, 
    cartShipping, 
    cartTax, 
    cartTotal, 
    appliedCoupon, 
    placeOrder, 
    setCurrentPage,
    t,
    language,
    getProductName,
    currentCustomer,
    setIsCustomerAuthModalOpen,
    setIsCustomerAccountModalOpen,
    findCustomerByPhone,
    recognizeCustomerByPhone,
  } = useStore();

  const currency = activeStore.settings.currency || 'د.ع';
  const [orderNotes, setOrderNotes] = useState('');
  const [recognizedAlert, setRecognizedAlert] = useState<{ name: string; phone: string } | null>(null);

  const [shippingInfo, setShippingInfo] = useState<ShippingAddress>(() => {
    if (currentCustomer) {
      return {
        fullName: currentCustomer.name || '',
        phone: currentCustomer.phone || '',
        email: currentCustomer.email || '',
        address: currentCustomer.address || '',
        city: currentCustomer.city || '',
        state: currentCustomer.state || (language === 'ar' ? 'بغداد (العاصمة)' : 'Baghdad (Capital)'),
        zipCode: '10011',
        country: language === 'ar' ? 'جمهورية العراق 🇮🇶' : 'Republic of Iraq 🇮🇶',
      };
    }
    return {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: language === 'ar' ? 'بغداد (العاصمة)' : 'Baghdad (Capital)',
      zipCode: '10011',
      country: language === 'ar' ? 'جمهورية العراق 🇮🇶' : 'Republic of Iraq 🇮🇶',
    };
  });

  useEffect(() => {
    if (currentCustomer) {
      setShippingInfo((prev) => ({
        ...prev,
        fullName: currentCustomer.name || prev.fullName,
        phone: currentCustomer.phone || prev.phone,
        email: currentCustomer.email || prev.email,
        address: currentCustomer.address || prev.address,
        city: currentCustomer.city || prev.city,
        state: currentCustomer.state || prev.state,
      }));
    }
  }, [currentCustomer]);

  const handlePhoneInputChange = (val: string) => {
    handleInputChange('phone', val);
    const clean = val.replace(/\D/g, '');
    let norm = clean;
    if (norm.startsWith('00964')) norm = norm.slice(5);
    else if (norm.startsWith('964')) norm = norm.slice(3);
    if (norm.startsWith('0')) norm = norm.slice(1);

    if (norm.length >= 10) {
      const matched = recognizeCustomerByPhone(val);
      if (matched) {
        setShippingInfo((prev) => ({
          ...prev,
          fullName: matched.name || prev.fullName,
          phone: val,
          email: matched.email || prev.email,
          address: matched.address || prev.address,
          city: matched.city || prev.city,
          state: matched.state || prev.state,
        }));
        setRecognizedAlert({ name: matched.name, phone: matched.phone });
      }
    }
  };

  const paymentMethod: Order['paymentMethod'] = 'Cash on Delivery';
  const [isProcessing, setIsProcessing] = useState(false);

  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{t.bagEmpty}</h2>
        <p className="text-sm text-slate-500">{t.bagEmptyDesc}</p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
        >
          {t.continueShopping}
        </button>
      </div>
    );
  }

  const handleInputChange = (field: keyof ShippingAddress, val: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      placeOrder(shippingInfo, paymentMethod, orderNotes.trim() || undefined);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back to cart header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('shop')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <BackArrow className="w-4 h-4" />
          <span>{t.continueShopping}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.sslSecure}</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Contact, Shipping, Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact & Shipping Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.shippingDestination}
              </h2>
            </div>

            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-900 font-medium">
              <span className="text-base">🇮🇶</span>
              <span>
                {language === 'ar'
                  ? 'التوصيل متاح لكافة محافظات العراق الـ 18 (شحن قياسي 5,000 د.ع أو مجاني للطلبات فوق 50,000 د.ع)'
                  : 'Domestic delivery is available exclusively across all 18 Iraqi Governorates (standard 5,000 د.ع or free over 50,000 د.ع)'}
              </span>
            </div>

            {/* Customer Account & Saved Delivery Location Status */}
            {currentCustomer ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 block">
                        {language === 'ar' ? `المستلم: ${currentCustomer.name}` : `Recipient: ${currentCustomer.name}`}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                        {language === 'ar' ? 'حساب موحّد لكافة المتاجر ✓' : 'Universal Store Account ✓'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{currentCustomer.state || 'بغداد'} • {currentCustomer.city || ''} ({currentCustomer.phone})</span>
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomerAccountModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shrink-0 transition-all flex items-center justify-center gap-1 shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ar' ? 'تعديل موقع التوصيل' : 'Edit Location'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-slate-600 text-xs">
                    {language === 'ar'
                      ? 'مسجل في أي من متاجرنا؟ أدخل رقم هاتفك أدناه للتعرف الفوري على بياناتك وتعبئتها تلقائياً.'
                      : 'Registered in any of our stores? Enter your phone below to instantly recognize and prefill your info.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomerAccountModalOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shrink-0 transition-all shadow-sm flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'حسابي وموقع التوصيل' : 'My Account'}</span>
                </button>
              </div>
            )}

            {recognizedAlert && (
              <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 font-bold animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <span>
                    {language === 'ar'
                      ? `✨ مرحباً بك مجدداً يا ${recognizedAlert.name}! تم التعرف على حسابك وتعبئة موقع التوصيل المعتمد تلقائياً للشراء الفوري.`
                      : `✨ Welcome back, ${recognizedAlert.name}! Recognized your phone number and prefilled your saved delivery info across stores.`}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t.phone} ({language === 'ar' ? 'زين 078، آسيا سيل 077، كورك 075' : 'Zain 078, Asiacell 077, Korek 075'}) *</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    {language === 'ar' ? 'وسيلة التسجيل والتحقق الأساسية' : 'Primary Phone Registration'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="0770 123 4567"
                    value={shippingInfo.phone}
                    onChange={(e) => handlePhoneInputChange(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t.emailAddress}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'ar' ? '(اختياري للإشعارات فقط)' : '(Optional for alerts)'}
                  </span>
                </label>
                <input
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="customer@domain.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'المحافظة (العراق)' : 'Governorate (Iraq)'}
                </label>
                <select
                  required
                  value={shippingInfo.state}
                  onChange={(e) => {
                    const gov = e.target.value;
                    handleInputChange('state', gov);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {IRAQ_GOVERNORATES.map((g) => (
                    <option key={g.code} value={language === 'ar' ? g.ar : g.en}>
                      {language === 'ar' ? g.ar : g.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'المدينة / المنطقة / القضاء' : 'City / District / Area'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: حي المنصور، الكرادة، زيونة...' : 'e.g. Al-Mansour, Karrada...'}
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {language === 'ar' ? 'تفاصيل العنوان وأقرب نقطة دالة' : 'Street Address & Landmark'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'الشارع، رقم الزقاق أو العمارة، أقرب نقطة دالة...' : 'Street, alley, building, landmark...'}
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'الدولة: جمهورية العراق 🇮🇶 (حصراً)' : 'Country: Republic of Iraq 🇮🇶 (Exclusive)'}</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-full">
                  {language === 'ar' ? 'توصيل محلي لكافة المحافظات' : 'All Governorates Covered'}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Payment Method - Cash on Delivery Only */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <h2 className="text-lg font-bold text-slate-900">
                  {t.paymentMethod}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-200">
                {language === 'ar' ? 'طريقة الدفع الحصرية' : 'Exclusive Payment Method'}
              </span>
            </div>

            {/* Exclusive Cash on Delivery Card */}
            <div className="p-5 sm:p-6 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 relative overflow-hidden transition-all shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 shrink-0">
                  <Banknote className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base sm:text-lg text-slate-900">
                        {language === 'ar' ? 'الدفع نقداً عند الاستلام (كاش)' : 'Cash on Delivery (COD)'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-0.5 rounded-full shadow-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {language === 'ar' ? 'مفعل ومضمون 100%' : '100% Guaranteed'}
                      </span>
                    </div>
                    <span className="font-mono font-black text-sm text-emerald-950 bg-emerald-200/80 px-3 py-1 rounded-xl">
                      {currency}{cartTotal.toFixed(0)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 mt-2.5 leading-relaxed font-medium">
                    {language === 'ar'
                      ? `ادفع نقداً بالدينار العراقي لمندوب التوصيل بعد استلام ومعاينة طلبك عند باب منزلك. لا توجد أي بطاقات أو دفعات مسبقة مطلوبة.`
                      : `Pay cash in Iraqi Dinars directly to the courier upon receiving and inspecting your parcel at your doorstep. No upfront online payment required.`}
                  </p>

                  {/* Trust & Guarantee Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-emerald-200/70">
                    <div className="flex items-center gap-2 text-xs text-emerald-950 bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 shadow-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-[11px]">
                        {language === 'ar' ? 'لا دفع مسبق نهائياً' : 'Zero Advance Payment'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-950 bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-[11px]">
                        {language === 'ar' ? 'معاينة وفحص قبل الدفع' : 'Inspect Before Paying'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-emerald-950 bg-white/90 p-2.5 rounded-xl border border-emerald-200/80 shadow-xs">
                      <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-[11px]">
                        {language === 'ar' ? 'تنسيق هاتفي مع المندوب' : 'Courier Phone Call'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Courier coordination note */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-[11px] leading-relaxed">
                {language === 'ar'
                  ? `سيتواصل معك مندوب التوصيل على هاتفك (${shippingInfo.phone || 'رقمك المسجل'}) قبل التوصيل للتأكد من تواجدك وتحديد الوقت المناسب.`
                  : `The courier will contact you at (${shippingInfo.phone || 'your phone number'}) prior to delivery to confirm your presence.`}
              </p>
            </div>
          </div>

          {/* 3. Order Notes / Special Instructions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'ar' ? 'ملاحظات إضافية على الطلب' : 'Order Notes & Instructions'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'أي تفاصيل خاصة بتسليم الشحنة، مواعيد التوصيل، أو تعليمات للمندوب المتجر.'
                : 'Special delivery instructions, timing preferences, or notes for the courier.'}
            </p>
            <textarea
              rows={3}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب ملاحظاتك هنا (اختياري)...' : 'Write any specific notes or instructions here (optional)...'}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Complete Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">
              {t.orderSummary} ({cart.length})
            </h3>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-slate-100">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${idx}`} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={getProductName(item.product)}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {getProductName(item.product)}
                    </p>
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
                        Qty: {item.quantity} × {currency}{item.product.price}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {currency}{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Costs calculation */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-slate-900">{currency}{cartSubtotal.toFixed(2)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t.discount} ({appliedCoupon?.code})</span>
                  <span>-{currency}{cartDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>{t.shipping}</span>
                <span className="font-semibold text-slate-900">
                  {cartShipping === 0 ? t.free : `${currency}${cartShipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t.estimatedTax}</span>
                <span className="font-semibold text-slate-900">{currency}{cartTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>{t.total}</span>
                <span className="text-emerald-700">{currency}{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.processingPayment}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t.placeOrder} • {currency}{cartTotal.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.estimatedArrival}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
