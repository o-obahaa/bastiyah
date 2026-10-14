import React from 'react';

export interface DynamicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  layout?: 'vertical' | 'horizontal';
  showText?: boolean;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
}

export const DynamicLogo: React.FC<DynamicLogoProps> = ({
  size = 'hero',
  layout = 'vertical',
  showText = true,
  subtitle,
  className = '',
  onClick,
}) => {
  // Dimension mappings for the official emblem artwork
  const dimensions = {
    sm: {
      img: 'w-10 h-10 sm:w-12 sm:h-12',
      title: 'text-base font-black',
      sub: 'text-[10px]',
    },
    md: {
      img: 'w-20 h-20 sm:w-24 sm:h-24',
      title: 'text-xl font-black',
      sub: 'text-xs',
    },
    lg: {
      img: 'w-36 h-36 sm:w-44 sm:h-44',
      title: 'text-2xl sm:text-3xl font-black',
      sub: 'text-xs sm:text-sm',
    },
    hero: {
      img: 'w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 max-w-full',
      title: 'text-4xl sm:text-5xl lg:text-6xl font-black',
      sub: 'text-xs sm:text-sm',
    },
  }[size];

  const isVertical = layout === 'vertical' || size === 'hero' || size === 'lg';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${
        isVertical ? 'flex-col justify-center text-center' : 'flex-row items-center gap-3 text-start'
      } select-none cursor-pointer group ${className}`}
      title="بسطية | Bastiyah"
    >
      {/* Official Transparent Stall Emblem (Without Text) */}
      <div className="relative inline-flex items-center justify-center">
        <img
          src="/bastiyah-emblem.png"
          alt="بسطية"
          className={`${dimensions.img} object-contain transition-transform duration-300 group-hover:scale-105 pointer-events-none drop-shadow-sm`}
        />
      </div>

      {/* Brand Names (بسطية & BASTIYAH) Centered Vertically - Without Any Pill */}
      {(showText || subtitle) && (
        <div className="mt-3 sm:mt-4 flex flex-col items-center justify-center text-center w-full">
          {showText && (
            <div className="flex flex-col items-center justify-center text-center">
              {/* Arabic Name Centered */}
              <span
                className={`font-brand ${dimensions.title} tracking-tight text-stone-900 transition-colors group-hover:text-stone-950 text-center leading-tight`}
              >
                بسطية
              </span>

              {/* English Name Centered Directly Below */}
              <span className="font-sans text-[11px] sm:text-xs font-bold tracking-[0.25em] text-stone-400 uppercase mt-1 text-center">
                BASTIYAH
              </span>
            </div>
          )}

          {subtitle && (
            <p className={`font-sans ${dimensions.sub} font-medium text-stone-500 mt-2 max-w-md text-center leading-relaxed`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
