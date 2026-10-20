import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { TrustBadge, BadgeIconType } from '../../types';
import {
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones,
  Award,
  CreditCard,
  Clock,
  Gift,
  CheckCircle,
  Sparkles,
  Lock,
  Heart,
  Zap,
  Plus,
  Trash2,
  Save,
  RotateCcw as ResetIcon,
  ChevronUp,
  ChevronDown,
  Eye,
  Check
} from 'lucide-react';

export const ICON_OPTIONS: { id: BadgeIconType; labelAr: string; labelEn: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'truck', labelAr: 'شحن وتوصيل', labelEn: 'Shipping', icon: Truck },
  { id: 'rotate-ccw', labelAr: 'إرجاع واستبدال', labelEn: 'Returns', icon: RotateCcw },
  { id: 'shield-check', labelAr: 'ضمان رسمي', labelEn: 'Warranty', icon: ShieldCheck },
  { id: 'headphones', labelAr: 'دعم وخدمة عملاء', labelEn: 'Support', icon: Headphones },
  { id: 'award', labelAr: 'جودة معتمدة', labelEn: 'Quality Award', icon: Award },
  { id: 'credit-card', labelAr: 'دفع آمن', labelEn: 'Secure Payment', icon: CreditCard },
  { id: 'clock', labelAr: 'سرعة وتوقيت', labelEn: 'Fast Timing', icon: Clock },
  { id: 'gift', labelAr: 'هدايا وعروض', labelEn: 'Gifts & Offers', icon: Gift },
  { id: 'check-circle', labelAr: 'فحص وموثوقية', labelEn: 'Verified', icon: CheckCircle },
  { id: 'sparkles', labelAr: 'منتجات فاخرة', labelEn: 'Premium', icon: Sparkles },
  { id: 'lock', labelAr: 'حماية وأمان', labelEn: 'Protection', icon: Lock },
  { id: 'heart', labelAr: 'رضا ومحبة', labelEn: 'Customer Love', icon: Heart },
  { id: 'zap', labelAr: 'شحن فائق السرعة', labelEn: 'Express Lightning', icon: Zap },
];

export const renderBadgeIcon = (icon: BadgeIconType | string, className = 'w-5 h-5') => {
  switch (icon) {
    case 'truck': return <Truck className={className} />;
    case 'rotate-ccw': return <RotateCcw className={className} />;
    case 'shield-check': return <ShieldCheck className={className} />;
    case 'headphones': return <Headphones className={className} />;
    case 'award': return <Award className={className} />;
    case 'credit-card': return <CreditCard className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'gift': return <Gift className={className} />;
    case 'check-circle': return <CheckCircle className={className} />;
    case 'sparkles': return <Sparkles className={className} />;
    case 'lock': return <Lock className={className} />;
    case 'heart': return <Heart className={className} />;
    case 'zap': return <Zap className={className} />;
    default: return <ShieldCheck className={className} />;
  }
};

export const getDefaultTrustBadges = (
  currency: string = '$',
  freeShippingThreshold: number = 99,
  supportEmail: string = 'concierge@royaloud.com'
): TrustBadge[] => [
  {
    id: 'badge-delivery',
    icon: 'truck',
    title: 'Free Express on orders over $99',
    titleAr: 'شحن مجاني للطلبات فوق 99$',
    description: `Complimentary delivery over ${currency}${freeShippingThreshold}`,
    descriptionAr: `توصيل مجاني للطلبات فوق ${currency}${freeShippingThreshold}`,
    enabled: true,
  },
  {
    id: 'badge-returns',
    icon: 'rotate-ccw',
    title: '30-Day Free Returns',
    titleAr: 'إرجاع مجاني لمدة 30 يوماً',
    description: 'Hassle-free return & exchanges',
    descriptionAr: 'إرجاع واستبدال مرن',
    enabled: true,
  },
  {
    id: 'badge-warranty',
    icon: 'shield-check',
    title: '2-Year Official Warranty',
    titleAr: 'ضمان رسمي شامل لمدة سنتين',
    description: 'Full coverage protection',
    descriptionAr: 'ضمان رسمي معتمد',
    enabled: true,
  },
  {
    id: 'badge-support',
    icon: 'headphones',
    title: '24/7 Dedicated Support',
    titleAr: 'دعم فني وخدمة عملاء 24/7',
    description: supportEmail || 'support@bastiyah.com',
    descriptionAr: supportEmail || 'support@bastiyah.com',
    enabled: true,
  },
];

export const TrustBadgesEditor: React.FC = () => {
  const { activeStore, updateStoreDesign, theme, language, addToast } = useStore();

  const initialBadges = (activeStore.design.trustBadges && activeStore.design.trustBadges.length > 0)
    ? activeStore.design.trustBadges
    : getDefaultTrustBadges(
        activeStore.settings.currency,
        activeStore.settings.freeShippingThreshold,
        activeStore.settings.supportEmail
      );

  const [badges, setBadges] = useState<TrustBadge[]>(initialBadges);
  const [showTrustBadges, setShowTrustBadges] = useState<boolean>(activeStore.design.showTrustBadges ?? true);
  const [activeTabBadgeId, setActiveTabBadgeId] = useState<string>(initialBadges[0]?.id || '');

  useEffect(() => {
    if (activeStore.design.trustBadges && activeStore.design.trustBadges.length > 0) {
      setBadges(activeStore.design.trustBadges);
      if (!activeTabBadgeId && activeStore.design.trustBadges[0]) {
        setActiveTabBadgeId(activeStore.design.trustBadges[0].id);
      }
    }
    setShowTrustBadges(activeStore.design.showTrustBadges ?? true);
  }, [activeStore.design.trustBadges, activeStore.design.showTrustBadges]);

  const handleSave = (updatedBadges = badges, updatedShow = showTrustBadges) => {
    updateStoreDesign({
      trustBadges: updatedBadges,
      showTrustBadges: updatedShow,
    });
    addToast(
      language === 'ar' ? '✨ تم حفظ شارات ومميزات المتجر بنجاح!' : '✨ Trust badges updated successfully!',
      'success'
    );
  };

  const handleToggleBadge = (id: string) => {
    const updated = badges.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b));
    setBadges(updated);
    handleSave(updated, showTrustBadges);
  };

  const handleUpdateBadgeField = (id: string, field: keyof TrustBadge, value: any) => {
    const updated = badges.map((b) => (b.id === id ? { ...b, [field]: value } : b));
    setBadges(updated);
  };

  const handleAddBadge = () => {
    if (badges.length >= 6) {
      addToast(
        language === 'ar' ? 'الحد الأقصى للشارات هو 6 شارات' : 'Maximum 6 badges allowed',
        'warning'
      );
      return;
    }
    const newBadge: TrustBadge = {
      id: `badge-${Date.now()}`,
      icon: 'award',
      title: '100% Genuine Quality',
      titleAr: 'منتجات أصلية ومضمونة 100%',
      description: 'Handpicked authentic inventory',
      descriptionAr: 'منتجات موثوقة ومفحوصة بالكامل',
      enabled: true,
    };
    const updated = [...badges, newBadge];
    setBadges(updated);
    setActiveTabBadgeId(newBadge.id);
    handleSave(updated, showTrustBadges);
  };

  const handleDeleteBadge = (id: string) => {
    if (badges.length <= 1) {
      addToast(
        language === 'ar' ? 'يجب الاحتفاظ بشارة واحدة على الأقل' : 'Must keep at least one badge',
        'error'
      );
      return;
    }
    const updated = badges.filter((b) => b.id !== id);
    setBadges(updated);
    if (activeTabBadgeId === id) {
      setActiveTabBadgeId(updated[0]?.id || '');
    }
    handleSave(updated, showTrustBadges);
  };

  const handleMoveBadge = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= badges.length) return;
    const reordered = [...badges];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setBadges(reordered);
    handleSave(reordered, showTrustBadges);
  };

  const handleResetDefaults = () => {
    const defaults = getDefaultTrustBadges(
      activeStore.settings.currency,
      activeStore.settings.freeShippingThreshold,
      activeStore.settings.supportEmail
    );
    setBadges(defaults);
    setActiveTabBadgeId(defaults[0]?.id || '');
    handleSave(defaults, true);
    addToast(
      language === 'ar' ? 'تمت استعادة الشارات الافتراضية' : 'Reset to default badges',
      'info'
    );
  };

  const activeBadge = badges.find((b) => b.id === activeTabBadgeId) || badges[0];

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
      {/* Header with Master Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs"
            style={{ backgroundColor: `${theme.hex}15`, color: theme.hex }}
          >
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span>{language === 'ar' ? 'شارات ومميزات المتجر (Trust Badges)' : 'Storefront Trust Badges'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {badges.length} {language === 'ar' ? 'شارات' : 'badges'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'ar'
                ? 'تخصيص شريط الضمانات والمميزات (الشحن، الإرجاع، الضمان، والدعم) الظاهر أسفل متجرك'
                : 'Customize the value props & trust guarantees shown across your storefront footer'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <span className="text-xs font-bold text-slate-700">
              {showTrustBadges
                ? (language === 'ar' ? 'ظاهرة للعملاء' : 'Visible')
                : (language === 'ar' ? 'مخفية' : 'Hidden')}
            </span>
            <input
              type="checkbox"
              checked={showTrustBadges}
              onChange={(e) => {
                setShowTrustBadges(e.target.checked);
                handleSave(badges, e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
          </label>

          <button
            type="button"
            onClick={handleResetDefaults}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title={language === 'ar' ? 'استعادة الافتراضي' : 'Reset to Defaults'}
          >
            <ResetIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showTrustBadges && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Badge Selection Tabs / Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {badges.map((b, index) => {
              const isSelected = b.id === activeBadge?.id;
              return (
                <div key={b.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveTabBadgeId(b.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : b.enabled
                        ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        : 'border-slate-200 bg-slate-100/50 text-slate-400 line-through opacity-70'
                    }`}
                  >
                    <span className="shrink-0">{renderBadgeIcon(b.icon, 'w-3.5 h-3.5')}</span>
                    <span className="truncate max-w-[140px]">
                      {language === 'ar' ? b.titleAr || b.title : b.title}
                    </span>
                    {!b.enabled && (
                      <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-mono">
                        {language === 'ar' ? 'معطل' : 'Off'}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            {badges.length < 6 && (
              <button
                type="button"
                onClick={handleAddBadge}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50 text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'إضافة شارة' : 'Add Badge'}</span>
              </button>
            )}
          </div>

          {/* Active Badge Editor Card */}
          {activeBadge && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-5">
              {/* Badge Controls Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'تعديل الشارة المحددة:' : 'Editing Badge:'}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    {language === 'ar' ? activeBadge.titleAr : activeBadge.title}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Reorder Buttons */}
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                    <button
                      type="button"
                      disabled={badges.indexOf(activeBadge) === 0}
                      onClick={() => handleMoveBadge(badges.indexOf(activeBadge), 'up')}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      title={language === 'ar' ? 'تحريك للأعلى' : 'Move up'}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-slate-200" />
                    <button
                      type="button"
                      disabled={badges.indexOf(activeBadge) === badges.length - 1}
                      onClick={() => handleMoveBadge(badges.indexOf(activeBadge), 'down')}
                      className="p-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      title={language === 'ar' ? 'تحريك للأسفل' : 'Move down'}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Toggle Active Badge */}
                  <button
                    type="button"
                    onClick={() => handleToggleBadge(activeBadge.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      activeBadge.enabled
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {activeBadge.enabled
                      ? (language === 'ar' ? '✓ مفعلة' : '✓ Enabled')
                      : (language === 'ar' ? '✕ معطلة' : '✕ Disabled')}
                  </button>

                  {/* Delete Badge */}
                  {badges.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteBadge(activeBadge.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      title={language === 'ar' ? 'حذف الشارة' : 'Delete Badge'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  {language === 'ar' ? 'اختر أيقونة الشارة:' : 'Select Badge Icon:'}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const isSelected = activeBadge.icon === opt.id;
                    const IconComp = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleUpdateBadgeField(activeBadge.id, 'icon', opt.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                          isSelected
                            ? 'border-slate-900 bg-white ring-2 ring-slate-900 shadow-sm'
                            : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
                        }`}
                        title={language === 'ar' ? opt.labelAr : opt.labelEn}
                      >
                        <span style={{ color: isSelected ? theme.hex : undefined }}>
                          <IconComp className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-semibold text-slate-700 truncate w-full">
                          {language === 'ar' ? opt.labelAr : opt.labelEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Titles (AR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عنوان الشارة الرئيسي (بالعربية) *' : 'Badge Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    value={activeBadge.titleAr}
                    onChange={(e) => handleUpdateBadgeField(activeBadge.id, 'titleAr', e.target.value)}
                    placeholder="مثال: شحن مجاني لكافة الطلبات"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عنوان الشارة الرئيسي (بالإنجليزية) *' : 'Badge Title (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={activeBadge.title}
                    onChange={(e) => handleUpdateBadgeField(activeBadge.id, 'title', e.target.value)}
                    placeholder="e.g. Free Express Delivery"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>

              {/* Descriptions / Subtitles (AR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الوصف الفرعي (بالعربية)' : 'Subtitle / Description (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={activeBadge.descriptionAr}
                    onChange={(e) => handleUpdateBadgeField(activeBadge.id, 'descriptionAr', e.target.value)}
                    placeholder="مثال: توصيل سريع ومجاني للطلبات فوق 50$"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الوصف الفرعي (بالإنجليزية)' : 'Subtitle / Description (English)'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={activeBadge.description}
                    onChange={(e) => handleUpdateBadgeField(activeBadge.id, 'description', e.target.value)}
                    placeholder="e.g. Complimentary shipping over $50"
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-xs sm:text-sm text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Real-Time Live Preview of the Badges Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ar' ? 'معاينة شريط المميزات كما يظهر لعملائك في المتجر:' : 'Live Storefront Footer Preview:'}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {language === 'ar' ? 'خلفية داكنة تحاكي الفوتر الحقيقي' : 'Exact footer styling'}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {badges
                  .filter((b) => b.enabled)
                  .map((b) => (
                    <div key={b.id} className="flex items-start gap-3">
                      <div
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0"
                        style={{ color: theme.hex }}
                      >
                        {renderBadgeIcon(b.icon, 'w-5 h-5')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate">
                          {language === 'ar' ? b.titleAr || b.title : b.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                          {language === 'ar' ? b.descriptionAr || b.description : b.description}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => handleSave(badges, showTrustBadges)}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'حفظ شارات المتجر' : 'Save Badges'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
