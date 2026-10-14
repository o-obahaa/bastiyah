import React, { useRef, useEffect } from 'react';

export interface DynamicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  layout?: 'vertical' | 'horizontal';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const DynamicLogo: React.FC<DynamicLogoProps> = ({
  size = 'hero',
  layout = 'vertical',
  showText = true,
  subtitle,
  className = '',
  onClick,
  interactive = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Autoplay video cleanly without default browser controls
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Fallback if browser enforces interaction
      });
    }
  }, []);

  const handleEnded = () => {
    // Explicitly pause on the final colored frame (no looping)
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
      return;
    }
    // Replay smoothly on click like an interactive logo
    if (interactive && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  // Borderless, natural dimensions matching standard brand logos
  const dimensions = {
    sm: {
      video: 'w-10 h-10',
      title: 'text-base font-black',
      sub: 'text-[10px]',
    },
    md: {
      video: 'w-16 h-16',
      title: 'text-xl font-black',
      sub: 'text-xs',
    },
    lg: {
      video: 'w-32 h-32 sm:w-40 sm:h-40',
      title: 'text-3xl font-black',
      sub: 'text-xs sm:text-sm',
    },
    hero: {
      video: 'w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72',
      title: 'text-4xl sm:text-5xl font-black',
      sub: 'text-xs sm:text-sm',
    },
  }[size];

  const isVertical = layout === 'vertical' || size === 'hero' || size === 'lg';

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center ${
        isVertical ? 'flex-col justify-center text-center' : 'flex-row items-center gap-3 text-start'
      } select-none cursor-pointer group ${className}`}
      title="بسطية • انقر لإعادة الحركة"
    >
      {/* 
        Moving Logo Artwork:
        - 100% borderless: no box frame, no borders, no TV container, no shadow box.
        - mix-blend-multiply: white background of video dissolves seamlessly into the page.
        - Just like a normal SVG/PNG logo setting, the only difference is that it moves!
      */}
      <div className="relative inline-flex items-center justify-center">
        <video
          ref={videoRef}
          src="/bastiyah-logo.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={handleEnded}
          className={`${dimensions.video} object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105 pointer-events-none`}
        />
      </div>

      {/* Brand Name (بسطية) Below or Beside the Logo */}
      {showText && (
        <div className={isVertical ? 'mt-1 sm:mt-2 flex flex-col items-center' : 'flex flex-col'}>
          {/* Main Brand Arabic Name */}
          <div className="flex items-center gap-2">
            <span
              className={`font-brand ${dimensions.title} tracking-tight text-stone-900 transition-colors group-hover:text-stone-950`}
            >
              بسطية
            </span>

            {/* Platform Sub-label for Hero */}
            {size === 'hero' && (
              <span className="font-sans text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/80">
                BASTIYAH
              </span>
            )}
          </div>

          {/* Custom or Default Subtitle */}
          {subtitle ? (
            <p className={`font-sans ${dimensions.sub} font-medium text-stone-500 mt-1`}>
              {subtitle}
            </p>
          ) : size === 'hero' ? (
            <p className="font-sans text-xs sm:text-sm font-medium text-stone-500 mt-1 max-w-sm">
              المنصة السحابية للمتاجر الإلكترونية المستقلة
            </p>
          ) : size === 'lg' ? (
            <span className="font-sans text-[11px] text-stone-500 font-medium">
              المنصة السحابية للمتاجر
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
};
