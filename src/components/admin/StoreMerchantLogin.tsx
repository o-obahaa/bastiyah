import React, { useState, useEffect } from 'react';
import { useStore, phonesMatch } from '../../context/StoreContext';
import { 
  ShieldCheck, 
  Lock, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Key,
  Globe,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ChevronDown
} from 'lucide-react';
import { getStorePathLabel } from '../../utils/urlUtils';
import { BLANK_STORE_LOGO_URL, getStoreLogo } from '../../constants/blankLogo';

const COUNTRY_CODES = [
  { code: '+964', country: 'IQ', flag: '🇮🇶', nameAr: 'العراق', nameEn: 'Iraq' },
];

export const StoreMerchantLogin: React.FC = () => {
  const { 
    activeStore,
    theme,
    language, 
    setLanguage, 
    loginStoreAdmin, 
    sendStoreAdminOtp,
    verifyStoreAdminOtp,
    setCurrentPage, 
    stores,
    addToast
  } = useStore();

  const [authMethod, setAuthMethod] = useState<'otp' | 'password'>('otp');
  const [selectedCountryCode, setSelectedCountryCode] = useState('+964');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpStep, setOtpStep] = useState<'input_phone' | 'input_code'>('input_phone');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [simulatedSms, setSimulatedSms] = useState<{ code: string; time: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const registeredPhone = activeStore.ownerPhone || '+964 770 123 4567';

  // Timer countdown effect for OTP resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Derive normalized phone number
  const getFullPhoneNumber = (): string => {
    const raw = phoneNumber.trim();
    if (!raw) return '';
    if (raw.startsWith('+')) return raw;
    // Strip leading zero if provided with a country code
    const cleanNumber = raw.replace(/^0+/, '');
    return `${selectedCountryCode} ${cleanNumber}`.trim();
  };

  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const fullPhone = getFullPhoneNumber();

    if (!fullPhone || phoneNumber.trim().length < 5) {
      setError(language === 'ar' ? 'يرجى إدخال رقم جوال صحيح' : 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = sendStoreAdminOtp(activeStore.id, fullPhone);
      setIsLoading(false);

      if (result.success && result.code) {
        setOtpStep('input_code');
        setCountdown(60);
        setSimulatedSms({
          code: result.code,
          time: new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        setError(result.message);
      }
    }, 350);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullPhone = getFullPhoneNumber();

    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setError(language === 'ar' ? 'يرجى إدخال رمز التحقق المكون من 4 أرقام' : 'Please enter the 4-digit code');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = verifyStoreAdminOtp(activeStore.id, fullPhone, otpCode.trim());
      setIsLoading(false);

      if (!success) {
        setError(
          language === 'ar'
            ? 'رمز التحقق غير صحيح أو انتهت صلاحيته. يرجى التأكد وإعادة المحاولة.'
            : 'Invalid or expired verification code. Please check and try again.'
        );
      }
    }, 300);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fullPhone = getFullPhoneNumber();

    if (!fullPhone) {
      setError(language === 'ar' ? 'يرجى إدخال رقم الجوال' : 'Please enter phone number');
      return;
    }

    if (!password) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور' : 'Please enter password');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const success = loginStoreAdmin(activeStore.id, fullPhone, password);
      setIsLoading(false);

      if (!success) {
        // Check if phone matches another store
        const otherStore = stores.find((s) => {
          if (s.id === activeStore.id || !s.ownerPhone) return false;
          return phonesMatch(s.ownerPhone, fullPhone);
        });

        if (otherStore) {
          const otherName = language === 'ar' ? otherStore.nameAr || otherStore.name : otherStore.name;
          setError(
            language === 'ar'
              ? `هذا الرقم مسجل لمتجر آخر (${otherName}) ولا يملك صلاحية إدارة (${displayStoreName}).`
              : `This phone belongs to another store (${otherName}) and cannot manage (${displayStoreName}).`
          );
        } else {
          setError(
            language === 'ar'
              ? `بيانات الدخول غير صحيحة لمتجر (${displayStoreName}). تأكد من رقم الهاتف المسجل وكلمة المرور.`
              : `Invalid phone credentials for (${displayStoreName}). Please verify your registered phone and password.`
          );
        }
      }
    }, 350);
  };

  const handleUseDemoCredentials = () => {
    setError(null);
    // Parse registered phone
    const regPhone = activeStore.ownerPhone || '+964 770 123 4567';
    
    // Find matching country code prefix
    const matchedCountry = COUNTRY_CODES.find((c) => regPhone.startsWith(c.code));
    if (matchedCountry) {
      setSelectedCountryCode(matchedCountry.code);
      const localNum = regPhone.replace(matchedCountry.code, '').trim();
      setPhoneNumber(localNum);
    } else {
      setSelectedCountryCode('+964');
      setPhoneNumber(regPhone.replace('+964', '').trim());
    }

    if (authMethod === 'password') {
      setPassword(activeStore.adminPassword || 'merchant123');
      addToast(
        language === 'ar' ? 'تمت تعبئة بيانات جوال التاجر وكلمة المرور' : 'Auto-filled merchant phone and password',
        'info'
      );
    } else {
      // In OTP mode, send code and pre-fill for effortless one-click test
      const fullPhone = regPhone;
      const res = sendStoreAdminOtp(activeStore.id, fullPhone);
      if (res.success && res.code) {
        setOtpStep('input_code');
        setCountdown(60);
        setOtpCode(res.code);
        setSimulatedSms({
          code: res.code,
          time: new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        });
        addToast(
          language === 'ar' 
            ? `تم إرسال رمز التحقق (${res.code}) وتعبئته تلقائياً للتجربة السريعة!` 
            : `Verification code (${res.code}) sent and auto-filled!`,
          'success'
        );
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setOtpCode(code);
    addToast(language === 'ar' ? 'تم نسخ الرمز وتعبئته' : 'Code copied & filled', 'success');
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-alexandria"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Background Ambience tailored to store theme */}
      <div 
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: theme.hex }}
      />
      <div 
        className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ backgroundColor: theme.hex }}
      />

      {/* Top Bar with Language and Return to Storefront */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-2 relative z-10">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all"
        >
          <ArrowIcon className="w-4 h-4" style={{ color: theme.hex }} />
          <span>{language === 'ar' ? `العودة لواجهة ${displayStoreName}` : `Return to ${displayStoreName}`}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-colors"
          >
            <Globe className="w-3.5 h-3.5" style={{ color: theme.hex }} />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-6 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header & Store Identity */}
          <div className="text-center space-y-3 mb-6">
            <div 
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg border p-1.5 transition-transform hover:scale-105 overflow-hidden"
              style={{ 
                backgroundColor: `${theme.hex}15`, 
                borderColor: `${theme.hex}50` 
              }}
            >
              <img
                src={getStoreLogo(activeStore)}
                alt=""
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {displayStoreName}
              </h1>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'تسجيل الدخول برقم الجوال' : 'Phone Number Authentication'}</span>
              </p>
            </div>

            {/* Specified Store Admin Link Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono" dir="ltr">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.hex }} />
              <span className="text-white font-bold">{getStorePathLabel(activeStore.slug, true)}</span>
            </div>

            {/* Owner Authority Notice */}
            <div className="mt-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {language === 'ar'
                  ? 'تسجيل الدخول مخصص لمدراء المتاجر المضافين من قِبل مالك المنصة برقم الهاتف.'
                  : 'Access restricted to store admins registered by platform owner via phone.'}
              </span>
            </div>
          </div>

          {/* Authentication Mode Switcher: SMS OTP vs Password */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMethod('otp');
                setError(null);
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'otp'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" style={{ color: authMethod === 'otp' ? theme.hex : undefined }} />
              <span>{language === 'ar' ? 'رمز تحقق SMS' : 'SMS Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('password');
                setError(null);
              }}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                authMethod === 'password'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" style={{ color: authMethod === 'password' ? theme.hex : undefined }} />
              <span>{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Simulated SMS Notification Banner (Appears when code is sent) */}
          {authMethod === 'otp' && otpStep === 'input_code' && simulatedSms && (
            <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 shadow-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between text-[11px] text-emerald-400 font-bold mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>{language === 'ar' ? '📩 رسالة نصية واردة (SMS)' : '📩 Incoming SMS Message'}</span>
                </div>
                <span className="text-slate-400 font-mono text-[10px]">{simulatedSms.time}</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {language === 'ar'
                  ? `رمز التحقق الخاص بإدارة ${displayStoreName} هو:`
                  : `Your verification code for ${displayStoreName} is:`}
                {' '}
                <strong className="font-mono text-base text-emerald-300 font-black tracking-widest px-1.5 py-0.5 rounded bg-emerald-900/40 border border-emerald-500/30 inline-block mx-1">
                  {simulatedSms.code}
                </strong>
              </p>
              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleCopyCode(simulatedSms.code)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/30 transition-all"
                >
                  <Copy className="w-3 h-3" />
                  <span>{language === 'ar' ? 'نسخ وتعبئة الرمز' : 'Copy & Auto-fill'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Form 1: SMS OTP Method */}
          {authMethod === 'otp' ? (
            otpStep === 'input_phone' ? (
              /* Step 1: Input Phone Number */
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'رقم جوال مالك المتجر' : 'Store Owner Mobile Phone'}
                  </label>

                  <div className="flex gap-2" dir="ltr">
                    {/* Country Code Dropdown */}
                    <div className="relative shrink-0">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="h-full px-3 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-slate-600 appearance-none pe-7 font-mono font-bold cursor-pointer"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                            {c.flag} {c.code}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {/* Phone Number Input */}
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0770 123 4567"
                        className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-slate-600 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors font-mono font-bold tracking-wider"
                      />
                      <Smartphone className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 end-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {language === 'ar'
                      ? 'يدعم شبكات الاتصال داخل العراق (زين 078، آسيا سيل 077، كورك 075). سيتم إرسال رمز التحقق SMS.'
                      : 'Supports Iraqi networks (Zain 078, Asiacell 077, Korek 075). An SMS code will be sent.'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || phoneNumber.trim().length < 5}
                  className="w-full py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.99] disabled:opacity-40"
                  style={{ backgroundColor: theme.hex }}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {isLoading 
                      ? (language === 'ar' ? 'جارٍ إرسال الرمز...' : 'Sending Code...') 
                      : (language === 'ar' ? 'إرسال رمز التحقق (SMS)' : 'Send Verification Code')}
                  </span>
                </button>
              </form>
            ) : (
              /* Step 2: Input Verification Code */
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-300">
                      {language === 'ar' ? 'رمز التحقق (OTP)' : 'Verification Code'}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('input_phone');
                        setError(null);
                      }}
                      className="text-[11px] text-slate-400 hover:text-white underline"
                    >
                      {language === 'ar' ? 'تغيير الرقم' : 'Change Phone'}
                    </button>
                  </div>

                  <div className="text-xs text-slate-400 mb-2 font-mono" dir="ltr">
                    <span>{getFullPhoneNumber()}</span>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • •"
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-slate-600 text-center text-xl sm:text-2xl text-white font-mono font-black tracking-[0.5em] focus:outline-none transition-colors"
                    dir="ltr"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>
                    {countdown > 0 ? (
                      <span className="font-mono text-slate-400">
                        {language === 'ar' ? `إعادة الإرسال بعد ${countdown} ثانية` : `Resend in ${countdown}s`}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="font-bold underline text-white hover:text-emerald-400 flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>{language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}</span>
                      </button>
                    )}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.trim().length < 4}
                  className="w-full py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.99] disabled:opacity-40"
                  style={{ backgroundColor: theme.hex }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isLoading 
                      ? (language === 'ar' ? 'جارٍ التحقق...' : 'Verifying...') 
                      : (language === 'ar' ? `تأكيد ودخول لوحة ${displayStoreName}` : `Verify & Sign In to ${displayStoreName}`)}
                  </span>
                </button>
              </form>
            )
          ) : (
            /* Form 2: Phone Number + Password Method */
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'رقم جوال مالك المتجر' : 'Store Owner Mobile Phone'}
                </label>

                <div className="flex gap-2" dir="ltr">
                  <div className="relative shrink-0">
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="h-full px-3 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-slate-600 appearance-none pe-7 font-mono font-bold cursor-pointer"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                          {c.flag} {c.code}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute end-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0770 123 4567"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-slate-600 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors font-mono font-bold tracking-wider"
                    />
                    <Smartphone className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 end-3.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'كلمة مرور إدارة المتجر' : 'Store Admin Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 pe-10 rounded-2xl bg-slate-950 border border-slate-800 focus:border-slate-600 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors font-mono"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 end-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || phoneNumber.trim().length < 5 || !password}
                className="w-full py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.99] disabled:opacity-40"
                style={{ backgroundColor: theme.hex }}
              >
                <Key className="w-4 h-4" />
                <span>
                  {isLoading 
                    ? (language === 'ar' ? 'جارٍ التحقق...' : 'Verifying...') 
                    : (language === 'ar' ? `دخول لوحة تحكم ${displayStoreName}` : `Sign In to ${displayStoreName}`)}
                </span>
              </button>
            </form>
          )}

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-emerald-400" />
                <span>{language === 'ar' ? 'رقم جوال التاجر المسجل لهذا المتجر:' : 'Registered Merchant Phone:'}</span>
              </span>
              <button
                type="button"
                onClick={handleUseDemoCredentials}
                className="font-bold underline inline-flex items-center gap-1 hover:opacity-80"
                style={{ color: theme.hex }}
              >
                <Sparkles className="w-3 h-3" />
                <span>{language === 'ar' ? 'تعبئة ودخول تجريبي' : 'Auto-Fill & Test'}</span>
              </button>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center justify-between" dir="ltr">
              <span className="font-bold text-emerald-400">{registeredPhone}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                {activeStore.adminPassword || 'merchant123'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-md mx-auto text-center text-[11px] text-slate-500 space-y-1 relative z-10">
        <p>© 2026 {displayStoreName} • Powered by <span className="text-slate-300 font-brand">بسطية (Bastiyah)</span></p>
        <p className="font-mono text-[10px] text-slate-600">Multi-tenant phone verification system • Secured for authorized merchant store owners</p>
      </div>
    </div>
  );
};
