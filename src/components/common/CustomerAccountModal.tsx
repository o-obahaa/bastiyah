import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { IRAQ_GOVERNORATES, cleanGovernorateName } from '../store/CheckoutPage';
import { ANONYMOUS_USER_AVATAR } from '../../types';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Package,
  Heart,
  LogOut,
  Save,
  MessageCircle,
  Building,
  Navigation,
  Compass,
  Sparkles,
  Truck,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const CustomerAccountModal: React.FC = () => {
  const {
    isCustomerAccountModalOpen,
    setIsCustomerAccountModalOpen,
    setIsCustomerAuthModalOpen,
    currentCustomer,
    updateCustomerProfile,
    logoutCustomer,
    setCurrentPage,
    activeStore,
    language,
    theme,
    addToast,
    recognizeCustomerByPhone,
  } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState(language === 'ar' ? 'بغداد' : 'Baghdad');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handlePhoneInputChange = (val: string) => {
    setPhone(val);
    setIsEditing(true);
    const clean = val.replace(/\D/g, '');
    let norm = clean;
    if (norm.startsWith('00964')) norm = norm.slice(5);
    else if (norm.startsWith('964')) norm = norm.slice(3);
    if (norm.startsWith('0')) norm = norm.slice(1);

    if (norm.length >= 10) {
      const matched = recognizeCustomerByPhone(val);
      if (matched) {
        if (!name.trim() || name === 'عميل بسطية') setName(matched.name);
        if (matched.email && !email) setEmail(matched.email);
        if (matched.state) setState(cleanGovernorateName(matched.state));
        if (matched.city) setCity(matched.city);
        if (matched.address) setAddress(matched.address);
        if (matched.landmark) setLandmark(matched.landmark);
      }
    }
  };

  // Sync state when currentCustomer changes or modal opens
  useEffect(() => {
    if (currentCustomer) {
      setName(currentCustomer.name || '');
      setPhone(currentCustomer.phone || '');
      setEmail(currentCustomer.email || '');
      setState(cleanGovernorateName(currentCustomer.state) || (language === 'ar' ? 'بغداد' : 'Baghdad'));
      setCity(currentCustomer.city || '');
      setAddress(currentCustomer.address || '');
      setLandmark(currentCustomer.landmark || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setState(language === 'ar' ? 'بغداد' : 'Baghdad');
      setCity('');
      setAddress('');
      setLandmark('');
    }
  }, [currentCustomer, isCustomerAccountModalOpen, language]);

  if (!isCustomerAccountModalOpen) return null;

  const handleSaveShippingDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast(language === 'ar' ? 'يرجى إدخال اسم المستلم' : 'Please provide recipient name', 'error');
      return;
    }

    setIsSaving(true);
    const cleanedState = cleanGovernorateName(state.trim());

    updateCustomerProfile({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      state: cleanedState,
      city: city.trim(),
      address: address.trim(),
      landmark: landmark.trim(),
    });

    setIsEditing(false);
    setTimeout(() => {
      setIsSaving(false);
      addToast(
        language === 'ar'
          ? '✅ تم حفظ وتحديث بيانات الشحن المعتمدة ومزامنتها بنجاح'
          : '✅ Delivery location & shipping profile saved successfully',
        'success'
      );
    }, 250);
  };

  const handleOpenAuth = () => {
    setIsCustomerAccountModalOpen(false);
    setIsCustomerAuthModalOpen(true);
  };

  const activeGovernorate = cleanGovernorateName(state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        className="bg-white rounded-[28px] w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200/90 text-slate-800 flex flex-col relative max-h-[92vh] my-auto mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner with Store Theme Gradient & Ambient Glow */}
        <div 
          className="w-full p-5 sm:p-6 text-white relative select-none shrink-0 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.hex} 0%, #0f172a 100%)`,
          }}
        >
          {/* Subtle Ambient Glow Circles */}
          <div className="absolute -top-12 -end-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -start-10 w-36 h-36 rounded-full bg-emerald-500/15 blur-xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={() => setIsCustomerAccountModalOpen(false)}
            className="absolute top-4 end-4 p-2 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-md text-white/90 hover:text-white transition-all hover:scale-105 active:scale-95 cursor-pointer z-10"
            title={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>

          {/* User Identity Header Card */}
          <div className="flex items-center gap-3.5 sm:gap-4.5 pe-8 relative z-1">
            <div className="relative group shrink-0">
              <img
                src={currentCustomer?.avatar || ANONYMOUS_USER_AVATAR}
                alt={name}
                onError={(e) => { (e.target as HTMLImageElement).src = ANONYMOUS_USER_AVATAR; }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md bg-white/15"
              />
              {currentCustomer && (
                <span className="absolute -bottom-1 -end-1 w-5 h-5 rounded-full bg-[#25D366] border-2 border-slate-900 flex items-center justify-center text-white shadow-sm">
                  <Check className="w-3 h-3 stroke-[3]" />
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white truncate tracking-tight">
                  {currentCustomer ? currentCustomer.name : (language === 'ar' ? 'حساب الزبون' : 'Customer Account')}
                </h3>
                {currentCustomer ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[11px] font-bold text-emerald-200 flex items-center gap-1 backdrop-blur-xs">
                    <CheckCircle2 className="w-3 h-3 text-[#25D366]" />
                    <span>{language === 'ar' ? 'موثّق بالهاتف' : 'Verified'}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold text-slate-200">
                    {language === 'ar' ? 'غير مسجل' : 'Guest'}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-200/90 font-mono mt-1 flex items-center gap-1.5" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span className="font-semibold">{currentCustomer?.phone || (language === 'ar' ? 'التسجيل برقم الهاتف' : 'Sign in via phone')}</span>
              </p>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-300 mt-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 border border-white/10">
                  <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                  <span className="font-semibold text-white/95">
                    {activeGovernorate}{city ? ` • ${city}` : ''}
                  </span>
                </span>
                {currentCustomer?.email && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-slate-200/90 truncate max-w-[200px]">
                    <Mail className="w-3 h-3 text-emerald-300 shrink-0" />
                    <span className="truncate">{currentCustomer.email}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Quick Shortcuts: My Orders & My Wishlist */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                setIsCustomerAccountModalOpen(false);
                setCurrentPage('orders');
              }}
              className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/90 text-start flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-2xs cursor-pointer"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs"
                style={{ backgroundColor: `${theme.hex}18`, color: theme.hex }}
              >
                <Package className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-black">
                  {language === 'ar' ? 'طلباتي وشحناتي' : 'My Orders'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {language === 'ar' ? 'متابعة مراحل التوصيل' : 'Track deliveries'}
                </p>
              </div>
            </button>

            <button
              onClick={() => {
                setIsCustomerAccountModalOpen(false);
                setCurrentPage('wishlist');
              }}
              className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/90 hover:bg-slate-100/90 border border-slate-200/90 text-start flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] group shadow-2xs cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-xs">
                <Heart className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-black">
                  {language === 'ar' ? 'قائمة المفضلة' : 'My Wishlist'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {language === 'ar' ? 'المنتجات المحفوظة' : 'Saved products'}
                </p>
              </div>
            </button>
          </div>

          {/* Unauthenticated Shopper Phone Login Notice */}
          {!currentCustomer && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <MessageCircle className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {language === 'ar' ? 'ربط الحساب بالهاتف والواتساب' : 'Link Account via Phone & WhatsApp'}
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    {language === 'ar'
                      ? 'سجّل برقم هاتفك لحفظ موقع توصيلك المعتمد ومزامنة فواتيرك تلقائياً.'
                      : 'Verify your phone to permanently link your shipping address & receipts.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenAuth}
                className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs shrink-0 shadow-md shadow-[#25D366]/20 transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'التحقق والمصادقة بالهاتف' : 'Verify Phone'}</span>
              </button>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────── */}
          {/* Delivery Details Card — Formal Modern Design             */}
          {/* ─────────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${theme.hex}15`, color: theme.hex }}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight leading-none">
                  {language === 'ar' ? 'بيانات وموقع التوصيل' : 'Delivery Information'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {language === 'ar' ? 'تُطبَّق تلقائياً عند إتمام الطلبات' : 'Auto-filled at checkout'}
                </p>
              </div>
            </div>

            {/* Card Body — Form */}
            <form onSubmit={handleSaveShippingDetails} className="p-5 space-y-5">

              {/* ── Section 1: Contact ── */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {language === 'ar' ? 'معلومات التواصل' : 'Contact'}
                </p>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                        <User className="w-3 h-3" />
                        {language === 'ar' ? 'اسم المستلم' : 'Recipient'}
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => { setName(e.target.value); setIsEditing(true); }}
                        placeholder={language === 'ar' ? 'الاسم الثلاثي' : 'Full name'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                        style={{ '--tw-ring-color': `${theme.hex}40` } as React.CSSProperties}
                        onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.hex}25`; e.currentTarget.style.borderColor = theme.hex; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                        <Phone className="w-3 h-3" />
                        {language === 'ar' ? 'الهاتف (واتساب)' : 'Phone (WhatsApp)'}
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={phone}
                        onChange={(e) => handlePhoneInputChange(e.target.value)}
                        placeholder="0770 000 0000"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                        onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.hex}25`; e.currentTarget.style.borderColor = theme.hex; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                      <Mail className="w-3 h-3" />
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      <span className="text-slate-400 normal-case font-normal text-[10px]">
                        ({language === 'ar' ? 'اختياري' : 'optional'})
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setIsEditing(true); }}
                      placeholder="example@email.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                      onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.hex}25`; e.currentTarget.style.borderColor = theme.hex; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* ── Section 2: Address ── */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {language === 'ar' ? 'العنوان التفصيلي' : 'Address Details'}
                </p>
                <div className="space-y-3">
                  {/* Governorate + City Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                        <Compass className="w-3 h-3" />
                        {language === 'ar' ? 'المحافظة' : 'Governorate'}
                        <span className="text-rose-400">*</span>
                      </label>
                      <select
                        required
                        value={activeGovernorate}
                        onChange={(e) => { setState(cleanGovernorateName(e.target.value)); setIsEditing(true); }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:outline-none transition-all cursor-pointer appearance-none"
                        onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.hex}25`; e.currentTarget.style.borderColor = theme.hex; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                      >
                        {IRAQ_GOVERNORATES.map((g) => {
                          const val = language === 'ar' ? cleanGovernorateName(g.ar) : cleanGovernorateName(g.en);
                          return <option key={g.code} value={val}>{val}</option>;
                        })}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                        <Building className="w-3 h-3" />
                        {language === 'ar' ? 'المنطقة / الحي' : 'District / Area'}
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => { setCity(e.target.value); setIsEditing(true); }}
                        placeholder={language === 'ar' ? 'الحي أو المنطقة' : 'e.g. Al-Mansour'}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                        onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.hex}25`; e.currentTarget.style.borderColor = theme.hex; }}
                        onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                      />
                    </div>
                  </div>

                  {/* Street */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                      <Navigation className="w-3 h-3" />
                      {language === 'ar' ? 'الشارع والدار' : 'Street & Building'}
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => { setAddress(e.target.value); setIsEditing(true); }}
                      placeholder={language === 'ar' ? 'شارع، زقاق، رقم الدار أو العمارة' : 'Street, alley, building number'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                      onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.hex}25`; e.currentTarget.style.borderColor = theme.hex; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                    />
                  </div>

                  {/* Landmark */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 uppercase tracking-wide">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      {language === 'ar' ? 'أقرب نقطة دالة' : 'Nearest Landmark'}
                      <span className="text-slate-400 normal-case font-normal text-[10px]">
                        ({language === 'ar' ? 'اختياري' : 'optional'})
                      </span>
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => { setLandmark(e.target.value); setIsEditing(true); }}
                      placeholder={language === 'ar' ? 'قرب مطعم، صيدلية، مدرسة...' : 'Near a restaurant, pharmacy, school...'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
                      onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.hex}25`; e.currentTarget.style.borderColor = theme.hex; }}
                      onBlur={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100" />

              {/* ── Address Preview Strip ── */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 bg-white">
                  <span className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase tracking-wide">
                    <Truck className="w-3.5 h-3.5" style={{ color: theme.hex }} />
                    {language === 'ar' ? 'معاينة عنوان الشحن' : 'Shipping Preview'}
                  </span>

                </div>
                <div className="px-4 py-3 space-y-2">
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    <span className="font-bold" style={{ color: theme.hex }}>{activeGovernorate}</span>
                    {city && <span className="text-slate-600"> · {city}</span>}
                    {address && <span className="text-slate-500"> · {address}</span>}
                    {landmark && <span className="text-slate-400 text-xs font-normal"> ({landmark})</span>}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 border-t border-slate-200/70 pt-2">
                    <span className="font-semibold text-slate-700">
                      {name || (language === 'ar' ? 'اسم المستلم' : 'Recipient')}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span dir="ltr" className="font-mono text-slate-600">
                      {phone || (language === 'ar' ? 'رقم الهاتف' : 'Phone number')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Save Button ── */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 rounded-xl text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 shadow-sm transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                style={{ backgroundColor: theme.hex }}
                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
              >
                <Save className="w-4 h-4" />
                {isSaving
                  ? (language === 'ar' ? 'جارِ الحفظ...' : 'Saving...')
                  : (language === 'ar' ? 'حفظ بيانات التوصيل' : 'Save Delivery Info')}
              </button>
            </form>
          </div>

          {/* Account Footer Options: Log Out or Switch */}
          {currentCustomer && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5" dir="ltr">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{language === 'ar' ? `مسجل كـ: ${currentCustomer.phone}` : `Signed in as: ${currentCustomer.phone}`}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  logoutCustomer();
                  setIsCustomerAccountModalOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200/80 font-bold flex items-center gap-1.5 transition-all cursor-pointer hover:scale-102 active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
