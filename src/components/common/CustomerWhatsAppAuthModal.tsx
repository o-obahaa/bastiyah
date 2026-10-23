import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { IRAQ_GOVERNORATES } from '../store/CheckoutPage';
import { 
  X, 
  MessageCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Smartphone, 
  User, 
  Sparkles,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Mail,
  MapPin,
  Building,
  Navigation,
  Compass,
  Save,
  Check
} from 'lucide-react';

export const CustomerWhatsAppAuthModal: React.FC = () => {
  const {
    isCustomerAuthModalOpen,
    setIsCustomerAuthModalOpen,
    setIsCustomerAccountModalOpen,
    sendCustomerWhatsAppOtp,
    verifyCustomerWhatsAppOtp,
    updateCustomerProfile,
    currentCustomer,
    activeStore,
    language,
    theme,
    addToast,
    findCustomerByPhone,
  } = useStore();

  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState(language === 'ar' ? 'بغداد (العاصمة)' : 'Baghdad (Capital)');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [recognizedUser, setRecognizedUser] = useState<string | null>(null);

  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [simulatedCode, setSimulatedCode] = useState<string>('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    const clean = val.replace(/\D/g, '');
    let norm = clean;
    if (norm.startsWith('00964')) norm = norm.slice(5);
    else if (norm.startsWith('964')) norm = norm.slice(3);
    if (norm.startsWith('0')) norm = norm.slice(1);

    if (norm.length >= 10) {
      const matched = findCustomerByPhone(val);
      if (matched) {
        if (!fullName.trim() || fullName === 'عميل بسطية') {
          setFullName(matched.name);
        }
        if (matched.email) setEmail(matched.email);
        if (matched.state) setState(matched.state);
        if (matched.city) setCity(matched.city);
        if (matched.address) setAddress(matched.address);
        if (matched.landmark) setLandmark(matched.landmark);
        setRecognizedUser(matched.name);
      } else {
        setRecognizedUser(null);
      }
    } else {
      setRecognizedUser(null);
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setInterval(() => setResendCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  if (!isCustomerAuthModalOpen) return null;

  const handleClose = () => {
    setIsCustomerAuthModalOpen(false);
    setStep('phone');
    setPhoneNumber('');
    setFullName('');
    setEmail('');
    setCity('');
    setAddress('');
    setLandmark('');
    setOtpCode(['', '', '', '']);
  };

  const handleSendCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const registered = findCustomerByPhone(phoneNumber);
    const resolvedName = fullName.trim() || registered?.name || '';
    if (!resolvedName) {
      addToast(language === 'ar' ? 'يرجى إدخال اسمك الكامل للمتابعة' : 'Please provide your full name', 'error');
      return;
    }
    if (!fullName.trim()) {
      setFullName(resolvedName);
    }
    if (!phoneNumber.trim()) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم هاتفك المحمول' : 'Please provide mobile phone number', 'error');
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      const res = sendCustomerWhatsAppOtp(phoneNumber);
      setSimulatedCode(res.code);
      setFormattedPhone(res.fullPhone);
      setStep('otp');
      setResendCountdown(30);
      setIsSending(false);
      setOtpCode(['', '', '', '']);
      setTimeout(() => otpInputsRef.current[0]?.focus(), 150);
    }, 600);
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = cleanVal;
    setOtpCode(newOtp);

    // Auto-advance
    if (cleanVal && index < 3) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when 4 digits filled
    if (cleanVal && index === 3) {
      const fullCode = newOtp.join('');
      if (fullCode.length === 4) {
        verifyCode(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const verifyCode = (codeToVerify?: string) => {
    const code = codeToVerify || otpCode.join('');
    if (code.length < 4) {
      addToast(language === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 4 أرقام' : 'Please enter the 4-digit code', 'error');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const ok = verifyCustomerWhatsAppOtp(phoneNumber, code, fullName.trim() || undefined);
      setIsVerifying(false);
      if (ok) {
        // Look up matched customer to prefill details step
        const matched = findCustomerByPhone(phoneNumber);
        if (matched) {
          if (matched.name) setFullName(matched.name);
          if (matched.email) setEmail(matched.email);
          if (matched.state) setState(matched.state);
          if (matched.city) setCity(matched.city);
          if (matched.address) setAddress(matched.address);
          if (matched.landmark) setLandmark(matched.landmark);
        }
        setStep('details');
      }
    }, 500);
  };

  const handleSaveAdditionalDetails = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateCustomerProfile({
      name: fullName.trim() || currentCustomer?.name,
      phone: formattedPhone || phoneNumber.trim() || currentCustomer?.phone,
      email: email.trim() || undefined,
      state: state.trim(),
      city: city.trim() || undefined,
      address: address.trim() || undefined,
      landmark: landmark.trim() || undefined,
    });

    addToast(
      language === 'ar' 
        ? '✅ تم حفظ بيانات التوصيل والبريد الإلكتروني بنجاح!' 
        : '✅ Shipping and email details saved successfully!', 
      'success'
    );
    handleClose();
  };

  const handleAutoFillCode = () => {
    if (simulatedCode) {
      const digits = simulatedCode.split('').slice(0, 4);
      setOtpCode(digits);
      verifyCode(simulatedCode);
    }
  };

  const storeTitle = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        dir={language === 'ar' ? 'rtl' : 'ltr'}
        className={`bg-white rounded-3xl w-full ${step === 'details' ? 'max-w-xl' : 'max-w-md'} overflow-hidden shadow-2xl border border-slate-200 text-slate-800 relative mx-auto my-auto transition-all duration-200 max-h-[92vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with WhatsApp styling */}
        <div className="w-full bg-gradient-to-r from-[#128C7E] to-[#075E54] p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-4 end-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-[#25D366]/30 shrink-0">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">
                <span>
                  {step === 'details'
                    ? (language === 'ar' ? 'اكتمل التحقق بنجاح' : 'Authentication Verified')
                    : (language === 'ar' ? 'التسجيل والتحقق بالهاتف' : 'Phone Authentication')}
                </span>
                <span>•</span>
                <span>العراق 🇮🇶</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                {step === 'details'
                  ? (language === 'ar' ? 'إكمال بيانات الشحن والبريد الإلكتروني' : 'Complete Shipping & Email Details')
                  : (language === 'ar' ? 'تسجيل حساب زبون جديد' : 'Shopper Registration & Sign-In')}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="w-full p-5 sm:p-7 space-y-5 overflow-y-auto">
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                {language === 'ar'
                  ? 'يرجى إدخال اسمك ورقم هاتفك المحمول؛ سنرسل لك رمز تحقق سريعاً مكوناً من 4 أرقام عبر واتساب. بعد اكتمال التحقق ستتمكن من إضافة البريد الإلكتروني وبيانات التوصيل.'
                  : 'Please enter your name and phone number. We will send you a 4-digit code via WhatsApp. Once verified, you will be able to complete your email and shipping address.'}
              </p>

              {/* 1. Full Name (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'أدخل اسمك الثلاثي (مثال: حيدر علي العراقي)' : 'e.g. Haidar Ali'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                </div>
              </div>

              {/* 2. Phone Number (Required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'ar' ? 'رقم الهاتف العراقي *' : 'Iraqi Mobile Phone *'}</span>
                </label>
                <div className="flex gap-2" dir="ltr">
                  <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0 select-none">
                    <span className="text-base">🇮🇶</span>
                    <span>+964</span>
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="0770 123 4567"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                  </div>
                </div>

                {recognizedUser && (
                  <div className="flex items-center gap-2 p-2.5 mt-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {language === 'ar'
                        ? `✨ حساب مسجل باسم (${recognizedUser}) في منصة بسطية • يمكنك المتابعة بنفس الرقم`
                        : `✨ Registered account for (${recognizedUser}) across Bastiyah stores • Ready to sign in`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>{language === 'ar' ? 'زين (078/079) • آسيا سيل (077) • كورك (075)' : 'Zain (078), Asiacell (077), Korek (075)'}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending || !phoneNumber.trim() || !fullName.trim()}
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all hover:scale-101 active:scale-99"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 fill-slate-950" />
                    <span>{language === 'ar' ? 'إرسال رمز التحقق عبر واتساب' : 'Send Code via WhatsApp'}</span>
                  </>
                )}
              </button>
            </form>
          ) : step === 'otp' ? (
            <div className="space-y-5">
              {/* Target phone banner with back button */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                <div>
                  <span className="text-slate-400 block">{language === 'ar' ? 'تم الإرسال إلى رقم الواتساب:' : 'Sent to WhatsApp Number:'}</span>
                  <span className="font-mono font-black text-slate-900 text-sm" dir="ltr">{formattedPhone}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-xs font-bold text-[#128C7E] hover:underline flex items-center gap-1"
                >
                  <BackArrow className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'تغيير الرقم' : 'Change'}</span>
                </button>
              </div>

              {/* Realistic WhatsApp Notification Card */}
              <div className="p-3.5 rounded-2xl bg-[#DCF8C6]/50 border border-[#25D366]/40 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-bold text-[#075E54]">
                    <div className="w-5 h-5 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 fill-white" />
                    </div>
                    <span>WhatsApp • بسطية للتحقق</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">الآن</span>
                </div>
                <div className="text-xs text-slate-800 leading-relaxed font-sans">
                  {language === 'ar'
                    ? `رمز تسجيل الدخول لمتجر ${storeTitle} هو: `
                    : `Your verification code for ${storeTitle} is: `}
                  <strong className="font-mono font-black text-[#075E54] text-base px-1.5 py-0.5 rounded bg-white border border-[#25D366]/40 ms-1 inline-block">
                    {simulatedCode}
                  </strong>
                </div>
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <a
                    href={`https://wa.me/9647700104813?text=${encodeURIComponent(
                      language === 'ar'
                        ? `مرحباً بسطية، كود تسجيل دخولي في متجر ${storeTitle} هو: ${simulatedCode}`
                        : `Hello Bastiyah, my login code for ${storeTitle} is: ${simulatedCode}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-[#075E54] hover:underline inline-flex items-center gap-1.5 bg-[#25D366]/25 hover:bg-[#25D366]/35 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-[#075E54]" />
                    <span>{language === 'ar' ? 'فتح واتساب' : 'Open WhatsApp'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={handleAutoFillCode}
                    className="text-[11px] font-bold text-[#128C7E] hover:text-[#075E54] underline inline-flex items-center gap-1"
                  >
                    <span>{language === 'ar' ? '⚡ نسخ وتعبئة الرمز تلقائياً' : '⚡ Auto-fill code'}</span>
                  </button>
                </div>
              </div>

              {/* OTP 4 Input boxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                  {language === 'ar' ? 'أدخل رمز التحقق (4 أرقام)' : 'Enter 4-Digit WhatsApp Code'}
                </label>
                <div className="flex justify-center gap-2.5 sm:gap-3" dir="ltr">
                  {[0, 1, 2, 3].map((idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otpCode[idx]}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className={`w-12 sm:w-14 h-14 text-center text-2xl font-mono font-black rounded-2xl border transition-all focus:outline-none shrink-0 ${
                        otpCode[idx]
                          ? 'border-[#25D366] bg-[#25D366]/10 text-slate-900 ring-2 ring-[#25D366]/30'
                          : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:border-[#25D366]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Verify submit button */}
              <button
                type="button"
                onClick={() => verifyCode()}
                disabled={isVerifying || otpCode.join('').length < 4}
                className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-40 text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/25 transition-all hover:scale-101 active:scale-99"
              >
                {isVerifying ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-slate-950" />
                    <span>{language === 'ar' ? 'تأكيد الرمز وإكمال البيانات' : 'Verify & Complete Details'}</span>
                  </>
                )}
              </button>

              {/* Resend timer */}
              <div className="text-center pt-1">
                {resendCountdown > 0 ? (
                  <p className="text-xs text-slate-400">
                    {language === 'ar'
                      ? `إمكانية إعادة الإرسال خلال (${resendCountdown} ثانية)`
                      : `Resend code in (${resendCountdown}s)`}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendCode()}
                    className="text-xs font-bold text-[#128C7E] hover:underline inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إعادة إرسال رمز التحقق عبر واتساب' : 'Resend WhatsApp Code'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Step 3: Complete Details (Email & Shipping Info) */
            <form onSubmit={handleSaveAdditionalDetails} className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                    {language === 'ar' 
                      ? `تم توثيق الحساب بنجاح! مرحباً بك يا ${fullName || currentCustomer?.name}`
                      : `Phone verified! Welcome, ${fullName || currentCustomer?.name}`}
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    {language === 'ar'
                      ? 'يرجى إكمال البريد الإلكتروني وتفاصيل عنوان الشحن لحفظها لطلباتك القادمة.'
                      : 'Please provide your email & delivery address to auto-populate future orders.'}
                  </p>
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'ar' ? 'البريد الإلكتروني (لتلقي إشعارات وفواتير الشراء)' : 'Email Address (For invoices & updates)'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                />
              </div>

              {/* Shipping Governorate & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'ar' ? 'المحافظة' : 'Governorate'} *</span>
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                  >
                    {IRAQ_GOVERNORATES.map((g) => (
                      <option key={g.code} value={language === 'ar' ? g.ar : g.en}>
                        {language === 'ar' ? g.ar : g.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{language === 'ar' ? 'المدينة / المنطقة / الحي' : 'City / District'} *</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: المنصور، الكرادة، الجادرية...' : 'e.g. Al-Mansour'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                  />
                </div>
              </div>

              {/* Detailed Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'ar' ? 'تفاصيل العنوان (الشارع، الزقاق، رقم الدار)' : 'Street & Building Details'} *</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: شارع 14 رمضان، محلة 603، زقاق 12، دار 8' : 'Street name, building #, apartment'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'ar' ? 'أقرب نقطة دالة (اختياري لتسهيل التوصيل)' : 'Nearest Landmark'}</span>
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: قرب جامع الرحمن، مقابل صيدلية الرواد' : 'e.g. Near Al-Rahman Mosque'}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  className="w-full sm:flex-1 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all hover:scale-101 active:scale-99"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ البيانات ومتابعة التسوق' : 'Save Details & Continue'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {language === 'ar' ? 'إكمال لاحقاً' : 'Complete Later'}
                </button>
              </div>
            </form>
          )}

          {/* Trust and privacy footer note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'ar' ? 'حسابك محمي ومشفر بالكامل عبر منصة بسطية' : 'End-to-end verified via Bastiyah Cloud'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
