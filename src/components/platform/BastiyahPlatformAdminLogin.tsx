import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Crown, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Key,
  Globe,
  Sparkles
} from 'lucide-react';
import { getPlatformOrigin } from '../../utils/urlUtils';

export const BastiyahPlatformAdminLogin: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    loginPlatformAdmin, 
    goToPlatform, 
    platformAdminEmail 
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const platformAdminUrl = `${getPlatformOrigin()}/owner`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const success = loginPlatformAdmin(email.trim(), password);
      if (!success) {
        setError(
          language === 'ar'
            ? 'بيانات المشرف غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور الخاصة بإدارة المنصة.'
            : 'Invalid platform administrator credentials. Please check your admin email and password.'
        );
      }
      setIsLoading(false);
    }, 400);
  };

  const handleUseDemoCredentials = () => {
    setEmail(platformAdminEmail || 'admin@bastiyah.com');
    setPassword('bastiyah2026');
    setError(null);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-stone-950 via-slate-950 to-stone-900 text-stone-100 flex flex-col justify-between p-4 sm:p-6"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Top Bar with Language and Return to Landing */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
        <button
          onClick={() => goToPlatform('landing')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 text-xs font-bold transition-all"
        >
          <ArrowIcon className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'العودة لموقع بسطية' : 'Return to Bastiyah'}</span>
        </button>

        <button
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{language === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto py-8">
        <div className="bg-stone-900/90 backdrop-blur-xl border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header & Emblem */}
          <div className="text-center space-y-3 mb-6 relative z-10">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className="font-brand font-black text-2xl text-white tracking-wide">
                  {language === 'ar' ? 'بسطية' : 'BASTIYAH'}
                </span>
                <span className="text-stone-500">|</span>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                  SUPER ADMIN
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-stone-300">
                {language === 'ar' 
                  ? 'تسجيل دخول المشرف العام لمنصة بسطية' 
                  : 'Platform Super Administrator Portal'}
              </h1>
            </div>

            {/* Specified Link Verification Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950 border border-amber-500/30 text-[11px] font-mono text-amber-300/90" dir="ltr">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{platformAdminUrl}</span>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm mx-auto pt-1">
              {language === 'ar'
                ? 'منطقة وصول محمية مخصصة لإدارة منصة بسطية والمتاجر المسجلة. الدخول مقتصر على حساب المشرف العام عبر هذا الرابط فقط.'
                : 'Restricted area for platform administrators only. Access requires an authorized admin account through this specific link.'}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني للمشرف العام' : 'Platform Admin Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bastiyah.com"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-xs sm:text-sm text-white placeholder:text-stone-600 focus:outline-none transition-colors"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-stone-500 absolute top-1/2 -translate-y-1/2 end-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                {language === 'ar' ? 'كلمة مرور حساب المشرف' : 'Admin Security Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-950 border border-stone-800 focus:border-amber-500 text-xs sm:text-sm text-white placeholder:text-stone-600 focus:outline-none transition-colors"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-stone-500 absolute top-1/2 -translate-y-1/2 end-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-stone-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.99]"
            >
              <Key className="w-4 h-4" />
              <span>
                {isLoading 
                  ? (language === 'ar' ? 'جارٍ التحقق...' : 'Authenticating...') 
                  : (language === 'ar' ? 'دخول لوحة تحكم المنصة' : 'Sign In to Super Admin')}
              </span>
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-stone-800 text-center space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>{language === 'ar' ? 'بيانات المشرف التجريبية للاختبار:' : 'Authorized Demo Admin Account:'}</span>
              <button
                type="button"
                onClick={handleUseDemoCredentials}
                className="text-amber-400 hover:text-amber-300 font-bold underline inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>{language === 'ar' ? 'تعبئة تلقائية' : 'Auto-Fill'}</span>
              </button>
            </div>
            <div className="bg-stone-950/80 p-2.5 rounded-xl border border-stone-800/80 font-mono text-[11px] text-stone-300 flex items-center justify-between" dir="ltr">
              <span>admin@bastiyah.com</span>
              <span className="text-stone-500">•</span>
              <span className="text-amber-400">bastiyah2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-md mx-auto text-center text-[11px] text-stone-500 space-y-1">
        <p>© 2026 BASTIYAH • Secure Multi-Store Platform Architecture</p>
        <p className="font-mono text-[10px] text-stone-600">Access limited strictly to verified platform administrators.</p>
      </div>
    </div>
  );
};
