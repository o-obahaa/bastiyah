import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroSectionConfig, HeroSlide, HeroDisplayMode, HeroHeight, HeroTransitionEffect, HeroTextAlign, HeroTextPosition, HeroImagePosition } from '../../types';
import {
  Sliders,
  Play,
  Copy,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Check,
  Eye,
  AlertCircle,
  Sparkles,
  Layout,
  MousePointer,
  RefreshCw,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Monitor,
  MoveHorizontal
} from 'lucide-react';
import { uploadImageToR2, validateImageFile } from '../../utils/cloudflareR2';
import { createDefaultHeroConfig, createDefaultHeroSlide } from '../../utils/heroDefaults';
import { StoreHeroSlider } from '../store/StoreHeroSlider';

type EditorTab = 'slides' | 'layout' | 'navigation' | 'autoplay' | 'style';

export const HeroSectionEditor: React.FC = () => {
  const { activeStore, updateStoreDesign, language, theme, addToast } = useStore();
  const isRtl = language === 'ar';

  // Ensure active store has a valid heroConfig or create fallback
  const heroConfig: HeroSectionConfig = activeStore.design.heroConfig || createDefaultHeroConfig(activeStore);

  const [activeTab, setActiveTab] = useState<EditorTab>('slides');
  const [selectedSlideId, setSelectedSlideId] = useState<string>(
    heroConfig.slides?.[0]?.id || ''
  );
  const [isUploadingDesktop, setIsUploadingDesktop] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [slideToDelete, setSlideToDelete] = useState<string | null>(null);

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  // Selected slide lookup
  const selectedSlide = heroConfig.slides?.find((s) => s.id === selectedSlideId) || heroConfig.slides?.[0];

  // Helper to commit config changes
  const saveConfig = (newConfig: HeroSectionConfig) => {
    updateStoreDesign({ heroConfig: newConfig });
  };

  // Switch display mode
  const handleModeChange = (mode: HeroDisplayMode) => {
    saveConfig({ ...heroConfig, mode });
    addToast(
      isRtl ? `تم التحويل إلى وضع: ${mode === 'single' ? 'بانر فردي' : 'سلايدر متحرك'}` : `Switched to ${mode === 'single' ? 'Single Banner' : 'Banner Slider'}`,
      'info'
    );
  };

  // Toggle hero section on/off
  const handleToggleEnabled = () => {
    const nextState = !heroConfig.enabled;
    saveConfig({ ...heroConfig, enabled: nextState });
    addToast(
      isRtl
        ? nextState ? 'تم تفعيل واجهة البانر وسلايدر العروض' : 'تم تعطيل واجهة البانر وسلايدر العروض'
        : nextState ? 'Hero Banner & Slider enabled' : 'Hero Banner & Slider disabled',
      'success'
    );
  };

  // Add new slide
  const handleAddSlide = () => {
    const newSlide = createDefaultHeroSlide(heroConfig.slides.length + 1);
    const updatedSlides = [...heroConfig.slides, newSlide];
    saveConfig({ ...heroConfig, slides: updatedSlides });
    setSelectedSlideId(newSlide.id);
    addToast(isRtl ? 'تمت إضافة شريحة جديدة' : 'New slide added', 'success');
  };

  // Duplicate slide
  const handleDuplicateSlide = (slideId: string) => {
    const target = heroConfig.slides.find((s) => s.id === slideId);
    if (!target) return;
    const duplicated: HeroSlide = {
      ...target,
      id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${target.title} (Copy)`,
      titleAr: target.titleAr ? `${target.titleAr} (نسخة)` : undefined,
    };
    const index = heroConfig.slides.findIndex((s) => s.id === slideId);
    const updated = [...heroConfig.slides];
    updated.splice(index + 1, 0, duplicated);
    saveConfig({ ...heroConfig, slides: updated });
    setSelectedSlideId(duplicated.id);
    addToast(isRtl ? 'تم تكرار الشريحة بنجاح' : 'Slide duplicated', 'success');
  };

  // Delete slide
  const confirmDeleteSlide = () => {
    if (!slideToDelete) return;
    if (heroConfig.slides.length <= 1) {
      addToast(
        isRtl ? 'يجب الإبقاء على شريحة واحدة على الأقل' : 'Must keep at least one slide',
        'error'
      );
      setSlideToDelete(null);
      return;
    }
    const updated = heroConfig.slides.filter((s) => s.id !== slideToDelete);
    saveConfig({ ...heroConfig, slides: updated });
    if (selectedSlideId === slideToDelete) {
      setSelectedSlideId(updated[0]?.id || '');
    }
    setSlideToDelete(null);
    addToast(isRtl ? 'تم حذف الشريحة' : 'Slide deleted', 'info');
  };

  // Reorder slides
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= heroConfig.slides.length) return;
    const updated = [...heroConfig.slides];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    saveConfig({ ...heroConfig, slides: updated });
  };

  // Update specific slide property
  const updateSlideField = (field: keyof HeroSlide, value: any) => {
    if (!selectedSlide) return;
    const updatedSlides = heroConfig.slides.map((s) =>
      s.id === selectedSlide.id ? { ...s, [field]: value } : s
    );
    saveConfig({ ...heroConfig, slides: updatedSlides });
  };

  // Upload image to R2 / local fallback
  const handleUploadImage = async (file: File, isMobile = false) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      addToast(validation.error || 'الملف غير صالح', 'error');
      return;
    }

    try {
      if (isMobile) setIsUploadingMobile(true);
      else setIsUploadingDesktop(true);
      setUploadProgress(15);

      const res = await uploadImageToR2(file, {
        storeSlug: activeStore.slug,
        onProgress: (p) => setUploadProgress(p),
      });

      if (isMobile) {
        updateSlideField('mobileImage', res.url);
      } else {
        updateSlideField('desktopImage', res.url);
      }

      addToast(
        isRtl ? 'تم رفع صورة الشريحة بنجاح!' : 'Slide image uploaded successfully!',
        'success'
      );
    } catch (err: any) {
      console.error('Image upload failed:', err);
      addToast(err.message || 'فشل رفع الصورة', 'error');
    } finally {
      setIsUploadingDesktop(false);
      setIsUploadingMobile(false);
      setUploadProgress(0);
      if (desktopFileInputRef.current) desktopFileInputRef.current.value = '';
      if (mobileFileInputRef.current) mobileFileInputRef.current.value = '';
    }
  };

  // Reset to default
  const handleResetToDefaults = () => {
    if (window.confirm(isRtl ? 'هل تريد استعادة الإعدادات الافتراضية لقسم البانر والسلايدر؟' : 'Reset hero & banner slider to defaults?')) {
      const def = createDefaultHeroConfig(activeStore);
      saveConfig(def);
      setSelectedSlideId(def.slides[0].id);
      addToast(isRtl ? 'تمت استعادة الإعدادات الافتراضية' : 'Hero settings reset to defaults', 'info');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header Bar */}
      <div className="p-6 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white">
        <div className="flex items-center gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner shrink-0"
            style={{ backgroundColor: `${theme.hex}30`, borderColor: `${theme.hex}60` }}
          >
            <Sparkles className="w-6 h-6" style={{ color: theme.hex }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-white">
                {isRtl ? 'البانر الرئيسي وسلايدر العروض' : 'Hero Banner & Promotional Slider'}
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {isRtl ? 'مخصص للمتجر' : 'Storefront Only'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isRtl
                ? 'خصص واجهة متجرك الرئيسية ببانر إعلاني فردي أو سلايدر شرائح تفاعلي'
                : 'Customize your storefront with a single hero banner or dynamic multi-slide carousel'}
            </p>
          </div>
        </div>

        {/* Master Controls: Enable Toggle & Reset */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            type="button"
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
            title={isRtl ? 'استعادة الافتراضي' : 'Reset to default'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isRtl ? 'استعادة الافتراضي' : 'Reset'}</span>
          </button>

          {/* Master Enable/Disable Toggle */}
          <div className="flex items-center gap-2.5 bg-slate-800/80 px-3.5 py-1.5 rounded-2xl border border-slate-700">
            <span className="text-xs font-bold text-slate-200">
              {heroConfig.enabled ? (isRtl ? 'مفعّل' : 'Enabled') : (isRtl ? 'معطّل' : 'Disabled')}
            </span>
            <button
              type="button"
              onClick={handleToggleEnabled}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                heroConfig.enabled ? 'bg-emerald-500' : 'bg-slate-600'
              }`}
              role="switch"
              aria-checked={heroConfig.enabled}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  heroConfig.enabled
                    ? isRtl ? '-translate-x-5' : 'translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {heroConfig.enabled ? (
        <div className="p-6 sm:p-8 space-y-8">
          {/* Mode Selector: Single Banner vs Multi-Slide Carousel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleModeChange('single')}
              className={`p-4 rounded-2xl border text-start transition-all flex items-start gap-3.5 ${
                heroConfig.mode === 'single'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${heroConfig.mode === 'single' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {isRtl ? 'بانر ترويجي فردي (Single Hero)' : 'Single Hero Banner'}
                  </span>
                  {heroConfig.mode === 'single' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  {isRtl ? 'عرض صورة أو خلفية واحدة رئيسية مع عبارات وأزرار واضحة' : 'Displays one prominent promotional image with text and primary CTAs'}
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('slider')}
              className={`p-4 rounded-2xl border text-start transition-all flex items-start gap-3.5 ${
                heroConfig.mode === 'slider'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${heroConfig.mode === 'slider' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <MoveHorizontal className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-slate-900">
                    {isRtl ? 'سلايدر شرائح متحرك (Banner Slider)' : 'Multi-Slide Carousel'}
                  </span>
                  {heroConfig.mode === 'slider' && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1 leading-relaxed">
                  {isRtl ? 'عدة شرائح متحركة تتنقل تلقائياً ويدوياً للحملات والعروض' : 'Multiple rotating slides with automatic rotation, arrows, and swipe support'}
                </p>
              </div>
            </button>
          </div>

          {/* Real-Time Live Preview Frame */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isRtl ? 'المعاينة الحية للبانر على واجهة متجرك:' : 'Live Storefront Hero Preview:'}</span>
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {isRtl ? 'تحديث فوري' : 'Live Interactive'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-900/5 p-2 overflow-hidden">
              <StoreHeroSlider config={heroConfig} isPreview={true} />
            </div>
          </div>

          {/* Editor Sub-Tabs Navigation */}
          <div className="flex items-center gap-1 sm:gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'slides', labelAr: 'الشرائح والمحتوى', labelEn: 'Slides & Content', icon: <ImageIcon className="w-3.5 h-3.5" /> },
              { id: 'layout', labelAr: 'التخطيط والأبعاد', labelEn: 'Layout & Height', icon: <Layout className="w-3.5 h-3.5" /> },
              { id: 'navigation', labelAr: 'الأسهم والتنقل', labelEn: 'Navigation', icon: <ChevronRight className="w-3.5 h-3.5" /> },
              { id: 'autoplay', labelAr: 'التشغيل التلقائي', labelEn: 'Autoplay & Motion', icon: <Play className="w-3.5 h-3.5" /> },
              { id: 'style', labelAr: 'المظهر والشفافية', labelEn: 'Style & Overlay', icon: <Sliders className="w-3.5 h-3.5" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as EditorTab)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] sm:text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{isRtl ? tab.labelAr : tab.labelEn}</span>
                {tab.id === 'slides' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeTab === 'slides' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {heroConfig.slides.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TAB 1: SLIDES & CONTENT */}
          {activeTab === 'slides' && (
            <div className="space-y-6">
              {/* Slide Selector Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {heroConfig.mode === 'single'
                      ? (isRtl ? 'الشريحة المعروضة:' : 'Banner Slide:')
                      : (isRtl ? 'قائمة الشرائح (ترتيب السلايدر):' : 'Slide Order & Management:')}
                  </span>

                  {heroConfig.mode === 'slider' && (
                    <button
                      type="button"
                      onClick={handleAddSlide}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إضافة شريحة' : 'Add Slide'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                  {heroConfig.slides.map((slide, idx) => {
                    const isSelected = selectedSlide?.id === slide.id;
                    return (
                      <div
                        key={slide.id}
                        onClick={() => setSelectedSlideId(slide.id)}
                        className={`group relative p-3 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Slide Thumbnail */}
                          <div className="w-12 h-11 rounded-xl bg-slate-900/10 overflow-hidden relative shrink-0 border border-slate-200">
                            {slide.desktopImage ? (
                              <img
                                src={slide.desktopImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                            <span className="absolute bottom-0.5 start-0.5 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                              0{idx + 1}
                            </span>
                          </div>

                          {/* Slide Title & Status */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-bold text-xs text-slate-900 line-clamp-1 leading-snug"
                                title={isRtl ? slide.titleAr || slide.title : slide.title}
                              >
                                {isRtl ? slide.titleAr || slide.title : slide.title}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {slide.badgeAr || slide.badge || (isRtl ? 'بدون شارة' : 'No badge')}
                            </p>
                          </div>
                        </div>

                        {/* Slide Quick Action Controls */}
                        {heroConfig.mode === 'slider' && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveSlide(idx, 'up');
                                }}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                                title={isRtl ? 'تحريك للأعلى' : 'Move Up'}
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === heroConfig.slides.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveSlide(idx, 'down');
                                }}
                                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                                title={isRtl ? 'تحريك للأسفل' : 'Move Down'}
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateSlide(slide.id);
                                }}
                                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                                title={isRtl ? 'تكرار' : 'Duplicate'}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSlideToDelete(slide.id);
                                }}
                                className="p-1 rounded hover:bg-rose-50 text-rose-600"
                                title={isRtl ? 'حذف' : 'Delete'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editing Selected Slide */}
              {selectedSlide && (
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {isRtl ? 'تعديل الشريحة:' : 'Editing Slide:'}{' '}
                        <span className="text-indigo-600">
                          {isRtl ? selectedSlide.titleAr || selectedSlide.title : selectedSlide.title}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600">
                        {isRtl ? 'تفعيل الشريحة' : 'Active'}
                      </label>
                      <input
                        type="checkbox"
                        checked={selectedSlide.enabled}
                        onChange={(e) => updateSlideField('enabled', e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Images Upload Section: Desktop & Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Desktop Image */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Monitor className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{isRtl ? 'صورة الشريحة (حاسوب / عام)' : 'Desktop Image'}</span>
                      </label>

                      {selectedSlide.desktopImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] group bg-slate-900">
                          <img
                            src={selectedSlide.desktopImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => desktopFileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 shadow-md flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{isRtl ? 'تغيير الصورة' : 'Change'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => !isUploadingDesktop && desktopFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer bg-white transition-all"
                        >
                          {isUploadingDesktop ? (
                            <div className="py-2 space-y-1">
                              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                              <span className="text-xs font-bold text-slate-600">{uploadProgress}%</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Upload className="w-6 h-6 text-indigo-600 mx-auto" />
                              <p className="text-xs font-bold text-slate-800">
                                {isRtl ? 'رفع صورة الحاسوب' : 'Upload Desktop Image'}
                              </p>
                              <p className="text-[10px] text-slate-400">PNG, JPG, WebP</p>
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        ref={desktopFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], false)}
                        className="hidden"
                      />
                    </div>

                    {/* Mobile Image (Optional) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-purple-600" />
                          <span>{isRtl ? 'صورة مخصصة للهاتف (اختياري)' : 'Mobile Image (Optional)'}</span>
                        </label>
                        {selectedSlide.mobileImage && (
                          <button
                            type="button"
                            onClick={() => updateSlideField('mobileImage', undefined)}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            {isRtl ? 'إزالة' : 'Remove'}
                          </button>
                        )}
                      </div>

                      {selectedSlide.mobileImage ? (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-[16/9] group bg-slate-900">
                          <img
                            src={selectedSlide.mobileImage}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => mobileFileInputRef.current?.click()}
                              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 shadow-md flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              <span>{isRtl ? 'تغيير الصورة' : 'Change'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => !isUploadingMobile && mobileFileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 hover:border-purple-500 rounded-2xl p-6 text-center cursor-pointer bg-white transition-all"
                        >
                          {isUploadingMobile ? (
                            <div className="py-2 space-y-1">
                              <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
                              <span className="text-xs font-bold text-slate-600">{uploadProgress}%</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <Smartphone className="w-6 h-6 text-purple-600 mx-auto" />
                              <p className="text-xs font-bold text-slate-800">
                                {isRtl ? 'رفع صورة عمودية للهاتف' : 'Upload Mobile Image'}
                              </p>
                              <p className="text-[10px] text-slate-400">{isRtl ? 'تظهر تلقائياً على شاشات الهواتف' : 'Used automatically on mobile'}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <input
                        ref={mobileFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0], true)}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Texts: Headings, Subtitles, Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'العنوان الرئيسي (بالعربية)' : 'Main Heading (Arabic)'}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={selectedSlide.titleAr || ''}
                        onChange={(e) => updateSlideField('titleAr', e.target.value)}
                        placeholder="مثال: تشكيلة الصيف الحصرية"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'العنوان الرئيسي (بالإنجليزية)' : 'Main Heading (English)'}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={selectedSlide.title || ''}
                        onChange={(e) => updateSlideField('title', e.target.value)}
                        placeholder="e.g. Exclusive Summer Collection"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'الوصف الفرعي (بالعربية)' : 'Subtitle (Arabic)'}
                      </label>
                      <textarea
                        dir="rtl"
                        rows={2}
                        value={selectedSlide.subtitleAr || ''}
                        onChange={(e) => updateSlideField('subtitleAr', e.target.value)}
                        placeholder="اكتشف تشكيلة واسعة بخصم يصل إلى ٣٠٪"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'الوصف الفرعي (بالإنجليزية)' : 'Subtitle (English)'}
                      </label>
                      <textarea
                        dir="ltr"
                        rows={2}
                        value={selectedSlide.subtitle || ''}
                        onChange={(e) => updateSlideField('subtitle', e.target.value)}
                        placeholder="Explore premium pieces with up to 30% discount"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'شارة ترويجية (بالعربية)' : 'Badge Label (Arabic)'}
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={selectedSlide.badgeAr || ''}
                        onChange={(e) => updateSlideField('badgeAr', e.target.value)}
                        placeholder="وصل حديثاً / عرض خاص"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'شارة ترويجية (بالإنجليزية)' : 'Badge Label (English)'}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={selectedSlide.badge || ''}
                        onChange={(e) => updateSlideField('badge', e.target.value)}
                        placeholder="New Arrival / Limited Edition"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* CTAs and Links */}
                  <div className="pt-2 border-t border-slate-200 space-y-4">
                    <span className="text-xs font-bold text-slate-800 block">
                      {isRtl ? 'الأزرار التفاعلية والروابط:' : 'Buttons & Action Links:'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Primary CTA */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-indigo-700 block">
                          {isRtl ? 'الزر الأساسي (Primary CTA):' : 'Primary Button:'}
                        </span>
                        <div>
                          <input
                            type="text"
                            value={isRtl ? selectedSlide.primaryCtaTextAr || '' : selectedSlide.primaryCtaText || ''}
                            onChange={(e) =>
                              isRtl
                                ? updateSlideField('primaryCtaTextAr', e.target.value)
                                : updateSlideField('primaryCtaText', e.target.value)
                            }
                            placeholder={isRtl ? 'نص الزر: تسوق الآن' : 'Button text: Shop Now'}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={selectedSlide.primaryCtaUrl || ''}
                            onChange={(e) => updateSlideField('primaryCtaUrl', e.target.value)}
                            placeholder="الرابط: shop أو رابط مباشر"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>

                      {/* Secondary CTA */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-700 block">
                          {isRtl ? 'الزر الثانوي (اختياري):' : 'Secondary Button (Optional):'}
                        </span>
                        <div>
                          <input
                            type="text"
                            value={isRtl ? selectedSlide.secondaryCtaTextAr || '' : selectedSlide.secondaryCtaText || ''}
                            onChange={(e) =>
                              isRtl
                                ? updateSlideField('secondaryCtaTextAr', e.target.value)
                                : updateSlideField('secondaryCtaText', e.target.value)
                            }
                            placeholder={isRtl ? 'نص الزر: استكشف المزيد' : 'Button text: Explore'}
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={selectedSlide.secondaryCtaUrl || ''}
                            onChange={(e) => updateSlideField('secondaryCtaUrl', e.target.value)}
                            placeholder="الرابط: shop أو رابط مباشر"
                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Clickable entire banner */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                        <MousePointer className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isRtl ? 'رابط لكامل الشريحة عند النقر (اختياري)' : 'Clickable Whole Banner Destination (Optional)'}</span>
                      </label>
                      <input
                        type="text"
                        value={selectedSlide.bannerLinkUrl || ''}
                        onChange={(e) => updateSlideField('bannerLinkUrl', e.target.value)}
                        placeholder="shop أو رابط خارجي https://..."
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Alignment & Positioning Controls */}
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'محاذاة النص أفـقياً' : 'Text Alignment'}
                      </label>
                      <select
                        value={selectedSlide.textAlign || 'center'}
                        onChange={(e) => updateSlideField('textAlign', e.target.value as HeroTextAlign)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="center">{isRtl ? 'وسط' : 'Center'}</option>
                        <option value="left">{isRtl ? 'يسار' : 'Left'}</option>
                        <option value="right">{isRtl ? 'يمين' : 'Right'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'موضع النص عمـودياً' : 'Text Position'}
                      </label>
                      <select
                        value={selectedSlide.textPosition || 'center'}
                        onChange={(e) => updateSlideField('textPosition', e.target.value as HeroTextPosition)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="center">{isRtl ? 'وسط' : 'Center'}</option>
                        <option value="top">{isRtl ? 'أعلى' : 'Top'}</option>
                        <option value="bottom">{isRtl ? 'أسفل' : 'Bottom'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        {isRtl ? 'تركيز صورة الخلفية' : 'Image Focal Point'}
                      </label>
                      <select
                        value={selectedSlide.imagePosition || 'center'}
                        onChange={(e) => updateSlideField('imagePosition', e.target.value as HeroImagePosition)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="center">{isRtl ? 'وسط (Center)' : 'Center'}</option>
                        <option value="top">{isRtl ? 'أعلى (Top)' : 'Top'}</option>
                        <option value="bottom">{isRtl ? 'أسفل (Bottom)' : 'Bottom'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LAYOUT & HEIGHT */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full-width vs Contained */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isRtl ? 'عرض القسم' : 'Section Width'}
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => saveConfig({ ...heroConfig, fullWidth: true })}
                      className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                        heroConfig.fullWidth
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {isRtl ? 'كامل العرض (Full-width)' : 'Full Width'}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveConfig({ ...heroConfig, fullWidth: false })}
                      className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                        !heroConfig.fullWidth
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {isRtl ? 'محتوى محاط (Contained)' : 'Contained'}
                    </button>
                  </div>
                </div>

                {/* Section Height */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isRtl ? 'ارتفاع البانر' : 'Section Height'}
                  </span>
                  <select
                    value={heroConfig.height}
                    onChange={(e) => saveConfig({ ...heroConfig, height: e.target.value as HeroHeight })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="aspect-banner">{isRtl ? 'بانر عريض متجاوب (16:5 - قياسي كالعينة)' : 'Widescreen Banner (16:5 ratio)'}</option>
                    <option value="small">{isRtl ? 'قصير (Small - ~400px)' : 'Small (~400px)'}</option>
                    <option value="medium">{isRtl ? 'متوسط (Medium - ~540px)' : 'Medium (~540px)'}</option>
                    <option value="large">{isRtl ? 'كبير (Large - ~660px)' : 'Large (~660px)'}</option>
                    <option value="fullscreen">{isRtl ? 'كامل الشاشة (Fullscreen - 90vh)' : 'Fullscreen (90vh)'}</option>
                    <option value="custom">{isRtl ? 'مخصص بالبكسل (Custom px)' : 'Custom Pixels'}</option>
                  </select>

                  {heroConfig.height === 'custom' && (
                    <div className="pt-2">
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {isRtl ? 'الارتفاع بالبكسل:' : 'Height (px):'}
                      </label>
                      <input
                        type="number"
                        min={250}
                        max={1200}
                        value={heroConfig.customHeightPx || 500}
                        onChange={(e) =>
                          saveConfig({ ...heroConfig, customHeightPx: Number(e.target.value) })
                        }
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Rounded Corners */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isRtl ? 'حواف دائرية للبانر' : 'Rounded Corners'}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'إعطاء زوايا البانر انحناء ناعم وأنيق' : 'Apply smooth rounded corners to banner'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={heroConfig.roundedCorners}
                    onChange={(e) => saveConfig({ ...heroConfig, roundedCorners: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600"
                  />
                </div>

                {/* Spacing Controls */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isRtl ? 'تباعد هوامش علوية وسفلية' : 'Vertical Spacing'}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'إضافة مسافة فاصلة قبل وبعد البانر' : 'Add padding above and below hero'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={heroConfig.spacingTop}
                    onChange={(e) =>
                      saveConfig({
                        ...heroConfig,
                        spacingTop: e.target.checked,
                        spacingBottom: e.target.checked,
                      })
                    }
                    className="w-5 h-5 rounded text-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NAVIGATION */}
          {activeTab === 'navigation' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Arrows Visibility & Style */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {isRtl ? 'أسهم التنقل (السابق والتالي)' : 'Navigation Arrows'}
                    </span>
                    <input
                      type="checkbox"
                      checked={heroConfig.showArrows}
                      onChange={(e) => saveConfig({ ...heroConfig, showArrows: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>

                  {heroConfig.showArrows && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {isRtl ? 'شكل الأزرار:' : 'Arrow Style:'}
                      </label>
                      <select
                        value={heroConfig.arrowStyle}
                        onChange={(e) => saveConfig({ ...heroConfig, arrowStyle: e.target.value as any })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="glass">{isRtl ? 'زجاجي شفاف (Glass)' : 'Glass Backdrop'}</option>
                        <option value="solid">{isRtl ? 'أبيض معتم (Solid White)' : 'Solid White'}</option>
                        <option value="outline">{isRtl ? 'مخطط شفاف (Outline)' : 'Outline'}</option>
                        <option value="ghost">{isRtl ? 'هادئ بدون حدود (Ghost)' : 'Ghost'}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Dots / Pagination Style */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {isRtl ? 'مؤشرات الشرائح (Pagination)' : 'Pagination Indicators'}
                    </span>
                    <input
                      type="checkbox"
                      checked={heroConfig.showDots}
                      onChange={(e) => saveConfig({ ...heroConfig, showDots: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>

                  {heroConfig.showDots && (
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        {isRtl ? 'شكل المؤشرات:' : 'Indicator Style:'}
                      </label>
                      <select
                        value={heroConfig.dotStyle}
                        onChange={(e) => saveConfig({ ...heroConfig, dotStyle: e.target.value as any })}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs"
                      >
                        <option value="bars">{isRtl ? 'أشرطة تقدم عريضة (Progress Bars)' : 'Progress Bars'}</option>
                        <option value="dots">{isRtl ? 'نقاط دائرية (Classic Dots)' : 'Classic Dots'}</option>
                        <option value="numbers">{isRtl ? 'أرقام رقمية (01 / 03)' : 'Slide Numbers (01 / 03)'}</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Mobile Swipe */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between sm:col-span-2">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isRtl ? 'السحب باللمس على الهواتف (Touch Swipe Gestures)' : 'Touch Swipe Navigation'}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'يتيح للعملاء السحب بإصبعهم للتنقل بين الشرائح بكل سلاسة' : 'Allows touch screen users to swipe between slides'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={heroConfig.enableSwipe}
                    onChange={(e) => saveConfig({ ...heroConfig, enableSwipe: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AUTOPLAY & MOTION */}
          {activeTab === 'autoplay' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Autoplay Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {isRtl ? 'التشغيل التلقائي (Autoplay)' : 'Autoplay Rotation'}
                    </span>
                    <input
                      type="checkbox"
                      checked={heroConfig.autoplay}
                      onChange={(e) => saveConfig({ ...heroConfig, autoplay: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {isRtl
                      ? 'تدوير الشرائح تلقائياً بعد عدد معين من الثواني'
                      : 'Automatically rotate through slides without user interaction'}
                  </p>
                </div>

                {/* Autoplay Interval */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isRtl ? 'مدة بقاء الشريحة (ثواني)' : 'Slide Duration'}
                  </span>
                  <select
                    disabled={!heroConfig.autoplay}
                    value={heroConfig.autoplayInterval}
                    onChange={(e) =>
                      saveConfig({ ...heroConfig, autoplayInterval: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50"
                  >
                    <option value={3000}>{isRtl ? '٣ ثوانٍ (سريع)' : '3 Seconds (Fast)'}</option>
                    <option value={5000}>{isRtl ? '٥ ثوانٍ (موصى به)' : '5 Seconds (Recommended)'}</option>
                    <option value={7000}>{isRtl ? '٧ ثوانٍ (هادئ)' : '7 Seconds (Relaxed)'}</option>
                    <option value={10000}>{isRtl ? '١٠ ثوانٍ (بطيء)' : '10 Seconds (Slow)'}</option>
                  </select>
                </div>

                {/* Transition Effect */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isRtl ? 'تأثير الانتقال (Transition Effect)' : 'Transition Effect'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => saveConfig({ ...heroConfig, transitionEffect: 'slide' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        heroConfig.transitionEffect === 'slide'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {isRtl ? 'انزلاق أفقي (Slide)' : 'Slide Horizontal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => saveConfig({ ...heroConfig, transitionEffect: 'fade' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        heroConfig.transitionEffect === 'fade'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      {isRtl ? 'تلاشي ناعم (Fade)' : 'Soft Fade'}
                    </button>
                  </div>
                </div>

                {/* Pause on Hover */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isRtl ? 'إيقاف مؤقت عند مرور الفأرة' : 'Pause on Hover'}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'إيقاف الدوران عندما يضع العميل المؤشر على البانر' : 'Pauses autoplay when customer hovers over banner'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={heroConfig.pauseOnHover}
                    onChange={(e) => saveConfig({ ...heroConfig, pauseOnHover: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: STYLE & OVERLAY */}
          {activeTab === 'style' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Color Overlay & Opacity Slider */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      {isRtl ? 'طبقة التظليل الشفافة (Overlay)' : 'Color Overlay'}
                    </span>
                    <input
                      type="checkbox"
                      checked={heroConfig.enableOverlay}
                      onChange={(e) => saveConfig({ ...heroConfig, enableOverlay: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                  </div>

                  {heroConfig.enableOverlay && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {isRtl ? 'درجة التظليل:' : 'Opacity:'}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-900">
                          {heroConfig.overlayOpacity}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={90}
                        step={5}
                        value={heroConfig.overlayOpacity}
                        onChange={(e) =>
                          saveConfig({ ...heroConfig, overlayOpacity: Number(e.target.value) })
                        }
                        className="w-full accent-indigo-600"
                      />
                    </div>
                  )}
                </div>

                {/* Gradient Shadow Overlay */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {isRtl ? 'تدرج ظل سفلي ناعم (Gradient Shadow)' : 'Bottom Gradient Shadow'}
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {isRtl ? 'يزيد من وضوح النصوص والأزرار فوق الصور الفاتحة' : 'Enhances text readability over bright images'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={heroConfig.overlayGradient}
                    onChange={(e) => saveConfig({ ...heroConfig, overlayGradient: e.target.checked })}
                    className="w-5 h-5 rounded text-indigo-600"
                  />
                </div>

                {/* Heading Size */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isRtl ? 'حجم الخط للعنوان الرئيسي' : 'Heading Size'}
                  </span>
                  <select
                    value={heroConfig.headingSize}
                    onChange={(e) => saveConfig({ ...heroConfig, headingSize: e.target.value as any })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="small">{isRtl ? 'صغير (Small)' : 'Small'}</option>
                    <option value="medium">{isRtl ? 'متوسط (Medium)' : 'Medium'}</option>
                    <option value="large">{isRtl ? 'كبير (Large - موصى به)' : 'Large (Recommended)'}</option>
                    <option value="xl">{isRtl ? 'ضخم (Extra Large)' : 'Extra Large'}</option>
                  </select>
                </div>

                {/* Button Style */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    {isRtl ? 'تصميم وشكل الأزرار' : 'Button Corner Shape'}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'rounded', labelAr: 'دائري ناعم', labelEn: 'Rounded' },
                      { id: 'pill', labelAr: 'كبسولة', labelEn: 'Pill' },
                      { id: 'sharp', labelAr: 'حاد', labelEn: 'Sharp' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => saveConfig({ ...heroConfig, buttonStyle: btn.id as any })}
                        className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                          heroConfig.buttonStyle === btn.id
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {isRtl ? btn.labelAr : btn.labelEn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center space-y-3 bg-slate-50/50">
          <p className="font-bold text-slate-700 text-sm">
            {isRtl ? 'قسم البانر والسلايدر المخصص معطل حالياً' : 'Hero Section & Banner Slider is currently disabled'}
          </p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isRtl
              ? 'يتم عرض القالب الافتراضي للمتجر. اضغط على زر التفعيل أعلاه لتخصيص البانر أو إضافة سلايدر عروض متحرك.'
              : 'The default store layout banner is displayed. Click Enable above to customize hero banners and slider.'}
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {slideToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-base text-slate-900">
                {isRtl ? 'حذف هذه الشريحة؟' : 'Delete this slide?'}
              </h4>
              <p className="text-xs text-slate-500">
                {isRtl ? 'لا يمكن التراجع عن هذا الإجراء بعد الحذف.' : 'This action cannot be undone.'}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSlideToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDeleteSlide}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                {isRtl ? 'تأكيد الحذف' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
