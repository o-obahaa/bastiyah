import React from 'react';

export interface DynamicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  layout?: 'vertical' | 'horizontal';
  showText?: boolean;
  showEnglishText?: boolean;
  colorVariant?: 'vintage' | 'contrast' | 'amber' | 'monochrome';
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  useOfficialCalligraphy?: boolean;
}

export const DynamicLogo: React.FC<DynamicLogoProps> = ({
  size = 'hero',
  layout = 'vertical',
  showText = true,
  showEnglishText = false,
  colorVariant = 'vintage',
  subtitle,
  className = '',
  onClick,
  useOfficialCalligraphy = true,
}) => {
  // Dimension mappings for the official emblem and full artwork logo
  const dimensions = {
    sm: {
      img: 'w-10 h-10 sm:w-12 sm:h-12',
      fullLogo: 'w-16 h-auto sm:w-20 sm:h-auto',
      title: 'text-base font-black',
      sub: 'text-[10px]',
    },
    md: {
      img: 'w-20 h-20 sm:w-24 sm:h-24',
      fullLogo: 'w-28 h-auto sm:w-36 sm:h-auto',
      title: 'text-xl font-black',
      sub: 'text-xs',
    },
    lg: {
      img: 'w-36 h-36 sm:w-44 sm:h-44',
      fullLogo: 'w-48 h-auto sm:w-56 sm:h-auto',
      title: 'text-2xl sm:text-3xl font-black',
      sub: 'text-xs sm:text-sm',
    },
    hero: {
      img: 'w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 max-w-full',
      fullLogo: 'w-64 h-auto sm:w-80 sm:h-auto md:w-96 md:h-auto max-w-full',
      title: 'text-4xl sm:text-5xl lg:text-6xl font-black',
      sub: 'text-xs sm:text-sm',
    },
  }[size];

  const isVertical = layout === 'vertical' || size === 'hero' || size === 'lg';

  // Vintage & contrast color styles for the brand name (used when hybrid mode is active)
  const brandColorClasses = {
    vintage:
      'text-[#842a12] bg-gradient-to-b from-[#943317] via-[#75260f] to-[#451608] bg-clip-text text-transparent group-hover:from-[#a03819] group-hover:to-[#4a1607]',
    contrast:
      'text-[#9a3412] bg-gradient-to-r from-amber-700 via-stone-900 to-amber-800 bg-clip-text text-transparent group-hover:from-amber-600 group-hover:to-amber-900',
    amber: 'text-amber-700 group-hover:text-amber-800',
    monochrome: 'text-stone-900 group-hover:text-stone-950',
  }[colorVariant];

  // If useOfficialCalligraphy is enabled and text is desired, we render the official artwork logo
  // which contains both the stall illustration AND the authentic artist calligraphy.
  const renderFullOfficialArtwork = useOfficialCalligraphy && showText;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${
        isVertical ? 'flex-col justify-center text-center' : 'flex-row items-center gap-3 text-start'
      } select-none cursor-pointer group ${className}`}
      title="بسطية | Bastiyah"
    >
      {renderFullOfficialArtwork ? (
        /* Full Official Logo Artwork (Stall + Handcrafted Calligraphy) */
        <div className="relative inline-flex flex-col items-center justify-center">
          <img
            src="/bastiyah-logo.png"
            alt="بسطية | BASTIYAH"
            className={`${dimensions.fullLogo} object-contain transition-transform duration-300 group-hover:scale-105 pointer-events-none drop-shadow-sm`}
          />
          {showEnglishText && (
            <span className="font-sans text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#8a2f14]/80 uppercase mt-2 text-center">
              BASTIYAH
            </span>
          )}
        </div>
      ) : (
        /* Pure Emblem (Without Text) + Optional Layout Typography */
        <>
          <div className="relative inline-flex items-center justify-center">
            <img
              src="/bastiyah-emblem.png"
              alt="بسطية"
              className={`${dimensions.img} object-contain transition-transform duration-300 group-hover:scale-105 pointer-events-none drop-shadow-sm`}
            />
          </div>

          {(showText || subtitle) && (
            <div className="mt-3 sm:mt-4 flex flex-col items-center justify-center text-center w-full">
              {showText && (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="relative inline-flex items-center justify-center py-2 px-4 overflow-visible">
                    <span
                      className={`font-brand ${dimensions.title} tracking-normal ${brandColorClasses} text-center leading-[1.35] py-2 px-3 overflow-visible transition-all duration-300 inline-block`}
                    >
                      بسطية
                    </span>
                  </div>

                  {showEnglishText && (
                    <span className="font-sans text-[11px] sm:text-xs font-bold tracking-[0.25em] text-[#8a2f14]/80 uppercase mt-1 text-center">
                      BASTIYAH
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {subtitle && (
        <p className={`font-sans ${dimensions.sub} font-medium text-stone-500 mt-2 max-w-md text-center leading-relaxed`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
