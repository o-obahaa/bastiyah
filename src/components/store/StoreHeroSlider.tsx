import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroSectionConfig, HeroSlide, HeroHeight } from '../../types';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';

interface StoreHeroSliderProps {
  config: HeroSectionConfig;
  isPreview?: boolean;
}

export const StoreHeroSlider: React.FC<StoreHeroSliderProps> = ({ config, isPreview = false }) => {
  const { theme, setCurrentPage, setSelectedCategory, language } = useStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const isRtl = language === 'ar';
  const activeSlides = (config.slides || []).filter((s) => s.enabled);
  const slideCount = activeSlides.length;

  // Mode check
  const isSingleMode = config.mode === 'single' || slideCount <= 1;
  const currentSlide: HeroSlide | undefined = activeSlides[currentSlideIndex] || activeSlides[0];

  // Next / Prev slide handlers (RTL aware)
  const handleNext = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrentSlideIndex((prev) => (prev + 1) % slideCount);
  }, [slideCount]);

  const handlePrev = useCallback(() => {
    if (slideCount <= 1) return;
    setCurrentSlideIndex((prev) => (prev - 1 + slideCount) % slideCount);
  }, [slideCount]);

  // Autoplay management
  useEffect(() => {
    if (isSingleMode || !config.autoplay || isPaused || isPreview) return;

    // Respect reduced-motion accessibility preference
    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (mediaQuery && mediaQuery.matches) return;

    const interval = Math.max(2500, config.autoplayInterval || 5000);
    const timer = setInterval(() => {
      handleNext();
    }, interval);

    return () => clearInterval(timer);
  }, [isSingleMode, config.autoplay, config.autoplayInterval, isPaused, isPreview, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSingleMode) return;
    if (e.key === 'ArrowRight') {
      isRtl ? handlePrev() : handleNext();
    } else if (e.key === 'ArrowLeft') {
      isRtl ? handleNext() : handlePrev();
    }
  };

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!config.enableSwipe || touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const threshold = 45; // 45px swipe threshold

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped Left
        isRtl ? handlePrev() : handleNext();
      } else {
        // Swiped Right
        isRtl ? handleNext() : handlePrev();
      }
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // CTA navigation handler
  const handleCtaClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (!url) return;

    if (url === 'shop' || url === '/shop') {
      setCurrentPage('shop');
      setSelectedCategory('All');
    } else if (url.startsWith('category:')) {
      const cat = url.replace('category:', '');
      setSelectedCategory(cat as any);
      setCurrentPage('shop');
    } else if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      setCurrentPage('shop');
    }
  };

  if (!currentSlide || slideCount === 0) {
    return null;
  }

  // Section Height Classes (supporting promotional banner 16:5 aspect ratio)
  const heightClasses: Record<HeroHeight, string> = {
    small: isPreview ? 'aspect-[18/5] min-h-[160px]' : 'aspect-[18/5] min-h-[200px] w-full',
    medium: isPreview ? 'aspect-[16/5]' : 'aspect-[16/7] sm:aspect-[16/5] w-full',
    large: isPreview ? 'aspect-[14/5]' : 'aspect-[14/7] sm:aspect-[14/5] w-full',
    fullscreen: isPreview ? 'h-[480px]' : 'min-h-[85vh] sm:min-h-[90vh]',
    'aspect-banner': isPreview ? 'aspect-[16/5]' : 'aspect-[16/7] sm:aspect-[16/5] w-full',
    custom: '',
  };

  const customHeightStyle = config.height === 'custom' && config.customHeightPx
    ? { height: `${isPreview ? Math.min(config.customHeightPx, 420) : config.customHeightPx}px` }
    : undefined;

  // Max width of content box
  const contentMaxWidthClasses = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full',
  };

  // Button styles
  const buttonRadiusClass =
    config.buttonStyle === 'pill' ? 'rounded-full' : config.buttonStyle === 'sharp' ? 'rounded-none' : 'rounded-xl';

  // Heading sizes
  const headingSizeClasses = {
    small: 'text-2xl sm:text-3xl lg:text-4xl',
    medium: 'text-3xl sm:text-4xl lg:text-5xl',
    large: 'text-4xl sm:text-5xl lg:text-6xl',
    xl: 'text-4xl sm:text-6xl lg:text-7xl',
  };

  // Arrow Styles
  const arrowStyleClasses = {
    solid: 'bg-white text-slate-900 hover:bg-slate-100 shadow-xl',
    outline: 'border border-white/60 text-white hover:bg-white/20 backdrop-blur-xs',
    glass: 'bg-black/35 hover:bg-black/60 text-white backdrop-blur-md border border-white/20 shadow-lg',
    ghost: 'hover:bg-black/30 text-white',
  };

  return (
    <div
      className={`relative w-full ${config.fullWidth ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} ${
        config.spacingTop ? 'pt-6 sm:pt-8' : ''
      } ${config.spacingBottom ? 'pb-6 sm:pb-8' : ''}`}
    >
      <section
        role="region"
        aria-roledescription="carousel"
        aria-label="Promotional Banners"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full overflow-hidden select-none outline-none ${
          config.roundedCorners ? 'rounded-3xl shadow-xl' : ''
        } ${heightClasses[config.height]} bg-slate-950`}
        style={customHeightStyle}
      >
        {/* Slides Track */}
        <div className="relative w-full h-full">
          {activeSlides.map((slide, index) => {
            const isActive = index === currentSlideIndex;
            const isSlideHidden = isSingleMode ? index !== 0 : false;
            if (isSlideHidden) return null;

            // Positioning & Alignment
            const textAlignClass =
              slide.textAlign === 'left' ? 'text-start' : slide.textAlign === 'right' ? 'text-end' : 'text-center';

            const justifyPositionClass =
              slide.textPosition === 'top'
                ? 'justify-start pt-12 sm:pt-16'
                : slide.textPosition === 'bottom'
                ? 'justify-end pb-14 sm:pb-20'
                : 'justify-center';

            const alignPositionClass =
              slide.textAlign === 'left'
                ? 'items-start'
                : slide.textAlign === 'right'
                ? 'items-end'
                : 'items-center';

            // Local overlay settings
            const overlayOpacityVal =
              slide.overlayOpacity !== undefined ? slide.overlayOpacity : config.overlayOpacity ?? 40;
            const overlayColorVal = slide.overlayColor || config.overlayColor || '#090d16';

            // Transition classes
            const isFade = config.transitionEffect === 'fade';
            const transitionClass = isFade
              ? `transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`
              : `transition-transform duration-500 ease-out ${
                  isActive
                    ? 'translate-x-0 z-10'
                    : index < currentSlideIndex
                    ? isRtl ? 'translate-x-full z-0' : '-translate-x-full z-0'
                    : isRtl ? '-translate-x-full z-0' : 'translate-x-full z-0'
                }`;

            const titleText = isRtl ? slide.titleAr || slide.title : slide.title;
            const subtitleText = isRtl ? slide.subtitleAr || slide.subtitle : slide.subtitle;
            const badgeText = isRtl ? slide.badgeAr || slide.badge : slide.badge;
            const primaryCtaText = isRtl ? slide.primaryCtaTextAr || slide.primaryCtaText : slide.primaryCtaText;
            const secondaryCtaText = isRtl ? slide.secondaryCtaTextAr || slide.secondaryCtaText : slide.secondaryCtaText;

            return (
              <div
                key={slide.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${slideCount}`}
                className={`absolute inset-0 w-full h-full ${transitionClass}`}
                onClick={(e) => slide.bannerLinkUrl && handleCtaClick(e, slide.bannerLinkUrl)}
                style={{
                  cursor: slide.bannerLinkUrl ? 'pointer' : 'default',
                  backgroundColor: slide.backgroundColor || '#090d16',
                }}
              >
                {/* Background Image with Responsive Mobile Fallback */}
                {slide.desktopImage && (
                  <picture className="absolute inset-0 w-full h-full pointer-events-none">
                    {slide.mobileImage && (
                      <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                    )}
                    <img
                      src={slide.desktopImage}
                      alt={slide.imageAlt || titleText}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding={index === 0 ? 'sync' : 'async'}
                      className={`w-full h-full object-cover transition-transform duration-1000 ${
                        isActive ? 'scale-100' : 'scale-105'
                      }`}
                      style={{
                        objectPosition: slide.imagePosition || 'center',
                      }}
                    />
                  </picture>
                )}

                {/* Color Overlay & Optional Gradient */}
                {config.enableOverlay && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-all duration-300"
                    style={{
                      backgroundColor: overlayColorVal,
                      opacity: overlayOpacityVal / 100,
                    }}
                  />
                )}

                {config.overlayGradient && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `linear-gradient(to top, rgba(9,13,22,0.85) 0%, rgba(9,13,22,0.4) 40%, transparent 100%)`,
                    }}
                  />
                )}

                {/* Slide Text & Actions Content Container */}
                <div
                  className={`relative z-10 w-full h-full flex flex-col ${justifyPositionClass} px-6 sm:px-12 lg:px-16`}
                >
                  <div
                    className={`w-full mx-auto flex flex-col ${alignPositionClass} ${textAlignClass} ${
                      contentMaxWidthClasses[config.contentMaxWidth]
                    } space-y-4 sm:space-y-5`}
                  >
                    {/* Badge */}
                    {badgeText && (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-sm border border-white/20 bg-white/10 text-white animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.hex }} />
                        <span>{badgeText}</span>
                      </div>
                    )}

                    {/* Heading */}
                    {titleText && (
                      <h2
                        className={`font-black tracking-tight leading-[1.1] text-white ${
                          headingSizeClasses[config.headingSize]
                        } drop-shadow-md animate-in fade-in slide-in-from-bottom-3 duration-500`}
                      >
                        {titleText}
                      </h2>
                    )}

                    {/* Subtitle */}
                    {subtitleText && (
                      <p className="text-sm sm:text-base lg:text-lg text-slate-100/90 font-medium leading-relaxed max-w-2xl drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-600">
                        {subtitleText}
                      </p>
                    )}

                    {/* CTAs */}
                    {(primaryCtaText || secondaryCtaText) && (
                      <div className="pt-2 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        {primaryCtaText && (
                          <button
                            type="button"
                            onClick={(e) => handleCtaClick(e, slide.primaryCtaUrl)}
                            className={`px-6 sm:px-8 py-3 sm:py-3.5 ${buttonRadiusClass} text-white font-bold text-xs sm:text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group`}
                            style={{
                              backgroundColor: config.buttonThemeColor ? theme.hex : '#ffffff',
                              color: config.buttonThemeColor ? '#ffffff' : '#0f172a',
                            }}
                          >
                            <span>{primaryCtaText}</span>
                            {isRtl ? (
                              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            ) : (
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            )}
                          </button>
                        )}

                        {secondaryCtaText && (
                          <button
                            type="button"
                            onClick={(e) => handleCtaClick(e, slide.secondaryCtaUrl)}
                            className={`px-6 sm:px-8 py-3 sm:py-3.5 ${buttonRadiusClass} bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-md shadow-lg transition-all`}
                          >
                            <span>{secondaryCtaText}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows (Slider Mode only) */}
        {!isSingleMode && config.showArrows && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label={isRtl ? 'الشريحة التالية' : 'Previous slide'}
              className={`absolute top-1/2 -translate-y-1/2 start-3 sm:start-5 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                arrowStyleClasses[config.arrowStyle]
              }`}
            >
              {isRtl ? (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label={isRtl ? 'الشريحة السابقة' : 'Next slide'}
              className={`absolute top-1/2 -translate-y-1/2 end-3 sm:end-5 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                arrowStyleClasses[config.arrowStyle]
              }`}
            >
              {isRtl ? (
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </>
        )}

      </section>

      {/* Navigation Dots / Bars / Numbers (Slider Mode only - positioned cleanly below banner or inside) */}
      {!isSingleMode && config.showDots && (
        <div className={config.roundedCorners ? "flex items-center justify-center gap-2 pt-3 pb-1" : "absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2"}>
          {config.dotStyle === 'numbers' ? (
            <div className="px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md text-white font-mono text-xs font-bold border border-white/20 shadow-md">
              <span>0{currentSlideIndex + 1}</span>
              <span className="opacity-50 mx-1">/</span>
              <span className="opacity-75">0{slideCount}</span>
            </div>
          ) : config.dotStyle === 'bars' ? (
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-100 dark:bg-slate-800">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentSlideIndex
                      ? 'w-8 bg-slate-800 dark:bg-white shadow-sm'
                      : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 py-1">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentSlideIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === currentSlideIndex
                      ? 'w-2.5 h-2.5 bg-slate-700 dark:bg-white shadow-xs scale-110'
                      : 'w-2 h-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
