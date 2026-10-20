import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
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
  ShieldCheck
} from 'lucide-react';

export const CustomerWhatsAppAuthModal: React.FC = () => {
  const {
    isCustomerAuthModalOpen,
    setIsCustomerAuthModalOpen,
    setIsCustomerAccountModalOpen,
    sendCustomerWhatsAppOtp,
    verifyCustomerWhatsAppOtp,
    currentCustomer,
    activeStore,
    language,
    theme,
    addToast
  } = useStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [simulatedCode, setSimulatedCode] = useState<string>('');
  const [formattedPhone, setFormattedPhone] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

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
    setOtpCode(['', '', '', '']);
  };

  const handleSendCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        handleClose();
        setIsCustomerAccountModalOpen(true);
      }
    }, 500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 text-slate-800 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header with WhatsApp styling */}
        <div className="bg-gradient-to-r from-[#128C7E] to-[#075E54] p-5 sm:p-6 text-white relative">
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
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">
                <span>{language === 'ar' ? 'التسجيل والتحقق بالهاتف حصراً' : 'Phone Authentication Only'}</span>
                <span>•</span>
                <span>العراق 🇮🇶</span>
              </div>
              <h3 className="text-lg font-black text-white">
                {language === 'ar' ? `تسجيل الدخول والتحقق برقم الهاتف` : `Shopper Phone Sign-In & Registration`}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  {language === 'ar'
                    ? 'التسجيل والدخول للعملاء يتم حصرياً عبر رقم الهاتف المحمول؛ سنرسل لك رمز تحقق سريعاً مكوناً من 4 أرقام عبر واتساب لتسجيل حسابك فوراً دون الحاجة لكلمات مرور.'
                    : 'Customer registration and login is exclusively handled via mobile phone number. We dispatch a 4-digit verification code via WhatsApp to authenticate your shopper account.'}
                </p>

                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'رقم الهاتف العراقي (وسيلة التسجيل والتحقق الوحيدة) *' : 'Iraqi Mobile Phone (Exclusive Registration Method) *'}
                </label>
                <div className="flex gap-2" dir="ltr">
                  <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0 select-none">
                    <span className="text-base">🇮🇶</span>
                    <span>+964</span>
                  </div>
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      required
                      autoFocus
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0770 123 4567"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                    />
                    <Smartphone className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                  <span>{language === 'ar' ? 'زين (078/079) • آسيا سيل (077) • كورك (075)' : 'Zain (078), Asiacell (077), Korek (075)'}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الاسم الكامل (اختياري لربط حسابك)' : 'Full Name (Optional)'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: حيدر علي' : 'e.g. Haidar Ali'}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:bg-white"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSending || !phoneNumber.trim()}
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
          ) : (
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

              {/* Realistic Simulated WhatsApp Notification Card */}
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
                <div className="flex items-center justify-end">
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
                <div className="flex justify-center gap-3" dir="ltr">
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
                      className={`w-13 h-14 text-center text-2xl font-mono font-black rounded-2xl border transition-all focus:outline-none ${
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
                    <span>{language === 'ar' ? 'تأكيد الرمز وتسجيل الدخول' : 'Verify & Sign In'}</span>
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
