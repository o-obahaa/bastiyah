import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  Key,
  Globe,
  Sparkles,
  Store,
  StoreIcon
} from 'lucide-react';
import { getStoreDisplayUrl, getStorePathLabel } from '../../utils/urlUtils';

export const StoreMerchantLogin: React.FC = () => {
  const { 
    activeStore,
    theme,
    language, 
    setLanguage, 
    loginStoreAdmin, 
    setCurrentPage, 
    goToPlatform,
    stores
  } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const ArrowIcon = language === 'ar' ? ArrowRight : ArrowLeft;
  const storeAdminDisplayUrl = getStoreDisplayUrl(activeStore.slug, true);
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const displayTagline = language === 'ar' ? activeStore.taglineAr || activeStore.tagline : activeStore.tagline;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const cleanEmail = email.trim();
      const success = loginStoreAdmin(activeStore.id, cleanEmail, password);

      if (!success) {
        // Check if this email belongs to a different store
        const otherStoreMatch = stores.find(
          (s) => s.id !== activeStore.id && s.ownerEmail.toLowerCase() === cleanEmail.toLowerCase()
        );

        if (otherStoreMatch) {
          const otherName = language === 'ar' ? otherStoreMatch.nameAr || otherStoreMatch.name : otherStoreMatch.name;
          setError(
            language === 'ar'
              ? `هذا الحساب ينتمي لمتجر آخر (${otherName}) ولا يملك صلاحية إدارة متجر (${displayStoreName}). يرجى استخدام الرابط والحساب المخصصين لهذا المتجر.`
              : `This account belongs to another store (${otherName}) and cannot manage (${displayStoreName}). Each store requires its dedicated account and specific link.`
          );
        } else {
          setError(
            language === 'ar'
              ? `بيانات الدخول غير صحيحة لمتجر (${displayStoreName}). تأكد من البريد الإلكتروني للمالك وكلمة المرور.`
              : `Invalid credentials for ${displayStoreName}. Please verify the merchant owner email and password.`
          );
        }
      }
      setIsLoading(false);
    }, 400);
  };

  const handleUseDemoCredentials = () => {
    setEmail(activeStore.ownerEmail);
    setPassword(activeStore.adminPassword || 'merchant123');
    setError(null);
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden"
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
            onClick={() => goToPlatform('landing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'ar' ? 'منصة بسطية' : 'Bastiyah Platform'}</span>
          </button>

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
      <div className="max-w-md w-full mx-auto my-auto py-8 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Header & Store Identity */}
          <div className="text-center space-y-3 mb-6">
            <div 
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg border p-2 transition-transform hover:scale-105"
              style={{ 
                backgroundColor: `${theme.hex}15`, 
                borderColor: `${theme.hex}50` 
              }}
            >
              <span>{activeStore.design.logoEmoji}</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-wide">
                {displayStoreName}
              </h1>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'تسجيل دخول لوحة تحكم المتجر' : 'Store Merchant Administration Portal'}
              </p>
            </div>

            {/* Specified Store Admin Link Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono" dir="ltr">
              <ShieldCheck className="w-3.5 h-3.5" style={{ color: theme.hex }} />
              <span className="text-white font-bold">{getStorePathLabel(activeStore.slug, true)}</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto pt-1">
              {language === 'ar'
                ? `الدخول إلى لوحة إدارة متجر (${displayStoreName}) مقتصر على حساب المالك المصرح له عبر هذا الرابط المحدد.`
                : `Managing ${displayStoreName} requires the authorized merchant account through this dedicated link.`}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني لمالك المتجر' : 'Store Merchant Email'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeStore.ownerEmail}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-slate-600 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                  dir="ltr"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 end-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                {language === 'ar' ? 'كلمة مرور إدارة المتجر' : 'Store Admin Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-slate-600 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none transition-colors"
                  dir="ltr"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 end-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password}
              className="w-full py-3.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.99] disabled:opacity-40"
              style={{ backgroundColor: theme.hex }}
            >
              <Key className="w-4 h-4" />
              <span>
                {isLoading 
                  ? (language === 'ar' ? 'جارٍ التحقق...' : 'Verifying...') 
                  : (language === 'ar' ? `دخول لوحة تحكم ${displayStoreName}` : `Sign In to ${displayStoreName} Admin`)}
              </span>
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{language === 'ar' ? 'بيانات حساب التاجر المسجل لهذا المتجر:' : 'Authorized Merchant Account:'}</span>
              <button
                type="button"
                onClick={handleUseDemoCredentials}
                className="font-bold underline inline-flex items-center gap-1 hover:opacity-80"
                style={{ color: theme.hex }}
              >
                <Sparkles className="w-3 h-3" />
                <span>{language === 'ar' ? 'تعبئة تلقائية' : 'Auto-Fill'}</span>
              </button>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-300 flex items-center justify-between" dir="ltr">
              <span className="truncate max-w-[190px]">{activeStore.ownerEmail}</span>
              <span className="text-slate-600">•</span>
              <span className="font-bold" style={{ color: theme.hex }}>
                {activeStore.adminPassword || 'merchant123'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="max-w-md mx-auto text-center text-[11px] text-slate-500 space-y-1 relative z-10">
        <p>© 2026 {displayStoreName} • Powered by <span className="text-slate-300 font-brand">بسطية (Bastiyah)</span></p>
        <p className="font-mono text-[10px] text-slate-600">Isolated merchant tenant architecture • Individual credentials per store</p>
      </div>
    </div>
  );
};
