import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

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
  const [isEnded, setIsEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure autoplay starts cleanly
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Fallback if browser requires user interaction for autoplay
          setIsPlaying(false);
        });
    }
  }, []);

  const handleVideoEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
    // Explicitly pause at the final colored frame
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleReplay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsEnded(false);
      setIsPlaying(true);
    }
  };

  // Size mappings
  const dimensions = {
    sm: {
      video: 'w-10 h-10',
      container: 'p-0.5',
      title: 'text-sm font-black',
      sub: 'text-[9px]',
    },
    md: {
      video: 'w-16 h-16',
      container: 'p-1',
      title: 'text-lg font-black',
      sub: 'text-[10px]',
    },
    lg: {
      video: 'w-28 h-28',
      container: 'p-1.5',
      title: 'text-2xl font-black',
      sub: 'text-xs',
    },
    hero: {
      video: 'w-48 h-48 sm:w-56 sm:h-56',
      container: 'p-2',
      title: 'text-4xl sm:text-5xl font-black',
      sub: 'text-xs sm:text-sm',
    },
  }[size];

  const isVertical = layout === 'vertical' || size === 'hero' || size === 'lg';

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex items-center ${
        isVertical ? 'flex-col justify-center text-center' : 'flex-row items-center gap-3 text-start'
      } select-none group ${className}`}
    >
      {/* Video Container with Minimalist Artisan Frame */}
      <div className="relative inline-flex items-center justify-center">
        <div
          className={`relative rounded-3xl overflow-hidden bg-white shadow-xl shadow-stone-200/60 border border-stone-200/90 transition-all duration-300 group-hover:shadow-2xl group-hover:border-stone-300 ${dimensions.container}`}
        >
          {/* Subtle Ambient Halo */}
          <div className="absolute -inset-1 bg-gradient-to-tr from-amber-200/30 via-rose-200/20 to-emerald-200/30 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none" />

          {/* Dynamic Video */}
          <video
            ref={videoRef}
            src="/bastiyah-logo.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnded}
            onPlay={() => setIsPlaying(true)}
            className={`${dimensions.video} object-cover rounded-2xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02] bg-white`}
          />

          {/* Interactive Replay Badge (shown on hover or when paused at end) */}
          {interactive && isEnded && (
            <button
              onClick={handleReplay}
              title="إعادة تشغيل شعار بسطية المتحرك"
              className={`absolute top-2.5 end-2.5 z-20 p-1.5 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 text-stone-700 shadow-sm transition-all duration-200 hover:bg-stone-900 hover:text-white hover:scale-110 ${
                isHovered ? 'opacity-100 scale-100' : 'opacity-0 sm:opacity-70 scale-90'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Minimalist Live Pulse Status */}
          <span
            className="absolute bottom-2.5 start-2.5 z-20 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white shadow-sm pointer-events-none"
            title="Active Dynamic Logo"
          />
        </div>
      </div>

      {/* Brand Name (بسطية) Below or Beside the Logo */}
      {showText && (
        <div className={isVertical ? 'mt-4 flex flex-col items-center' : 'flex flex-col'}>
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
