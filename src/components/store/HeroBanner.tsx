import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowRight, Sparkles, Star, Globe, Palette } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { 
    activeStore,
    theme,
    setCurrentPage, 
    setSelectedCategory, 
    setSelectedProductId,
    setAdminTab,
    products, 
    t, 
    language, 
    getProductName, 
    getProductTagline, 
    getCategoryName 
  } = useStore();

  const featuredProduct = products.find((p) => p.featured) || products[0];
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const displayTagline = language === 'ar' ? activeStore.taglineAr || activeStore.tagline : activeStore.tagline;
  const displayDesc = language === 'ar' ? activeStore.descriptionAr || activeStore.description : activeStore.description;
  const layoutStyle = activeStore.design.layoutStyle;

  // LAYOUT 1: LUXURY CENTERED (e.g. Royal Oud Maison)
  if (layoutStyle === 'luxury-centered') {
    return (
      <div className="relative overflow-hidden bg-slate-950 text-white py-20 sm:py-28 border-b border-slate-800">
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 20%, ${theme.hex}, transparent 70%)`,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-bold tracking-widest uppercase">
            <span>{activeStore.design.logoEmoji}</span>
            <span style={{ color: theme.hex }}>{activeStore.slug}.bastiyah.vercel.app</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            {displayStoreName}
          </h1>

          <p className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${theme.gradientText} bg-clip-text text-transparent max-w-3xl mx-auto`}>
            {displayTagline}
          </p>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {displayDesc}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setCurrentPage('shop');
                setSelectedCategory('All');
              }}
              className="px-8 py-4 rounded-full text-white font-black text-sm sm:text-base flex items-center gap-2 shadow-xl transition-transform hover:scale-105"
              style={{ backgroundColor: theme.hex }}
            >
              <span>{t.heroBrowseCatalog}</span>
              <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => {
                setCurrentPage('admin');
                setAdminTab('design');
              }}
              className="px-6 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm flex items-center gap-2 backdrop-blur-md transition-all"
            >
              <Palette className="w-4 h-4" style={{ color: theme.hex }} />
              <span>{t.storeDesignTab}</span>
            </button>
          </div>

          {/* Featured Trio Showcase */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-5 text-start">
            {products.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedProductId(item.id);
                  setCurrentPage('product-detail');
                }}
                className="cursor-pointer group rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-600 p-4 flex items-center gap-4 transition-all"
              >
                <img
                  src={item.images[0]}
                  alt={getProductName(item)}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.hex }}>
                    {getCategoryName(item.category)}
                  </p>
                  <h4 className="font-bold text-white text-sm truncate mt-0.5">
                    {getProductName(item)}
                  </h4>
                  <p className="text-base font-black text-white mt-1">
                    {activeStore.settings.currency}{item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 2: MINIMAL EDITORIAL (e.g. Velvet Atelier)
  if (layoutStyle === 'minimal-editorial') {
    return (
      <div className="bg-white border-b border-slate-200 py-14 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border border-slate-900 text-slate-900 text-xs font-bold uppercase tracking-widest">
                <span>{activeStore.design.logoEmoji}</span>
                <span>{activeStore.slug}.bastiyah.vercel.app</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 leading-[1.08]">
                {displayStoreName}
              </h1>

              <p className="text-lg sm:text-xl font-semibold text-slate-800">
                {displayTagline}
              </p>

              <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-lg">
                {displayDesc}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setCurrentPage('shop');
                    setSelectedCategory('All');
                  }}
                  className="px-8 py-4 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all"
                >
                  <span>{t.heroBrowseCatalog}</span>
                  <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    setCurrentPage('admin');
                    setAdminTab('design');
                  }}
                  className="px-6 py-4 border border-slate-300 hover:border-slate-900 text-slate-800 font-bold text-sm uppercase tracking-wider transition-all"
                >
                  {t.storeDesignTab}
                </button>
              </div>
            </div>

            {featuredProduct && (
              <div className="lg:col-span-6">
                <div
                  onClick={() => {
                    setSelectedProductId(featuredProduct.id);
                    setCurrentPage('product-detail');
                  }}
                  className="cursor-pointer group relative overflow-hidden border border-slate-200 bg-slate-50 p-4 sm:p-6"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                    <img
                      src={featuredProduct.images[0]}
                      alt={getProductName(featuredProduct)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.hex }}>
                        {getCategoryName(featuredProduct.category)}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">
                        {getProductName(featuredProduct)}
                      </h3>
                    </div>
                    <span className="text-2xl font-black text-slate-900">
                      {activeStore.settings.currency}{featuredProduct.price}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 3: VIBRANT BANNER
  if (layoutStyle === 'vibrant-banner') {
    return (
      <div
        className="relative overflow-hidden text-white py-16 sm:py-24"
        style={{
          background: `linear-gradient(135deg, ${theme.hex} 0%, #0f172a 85%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-bold">
              <Globe className="w-3.5 h-3.5" />
              <span className="font-mono">{activeStore.slug}.bastiyah.vercel.app</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              {activeStore.design.logoEmoji} {displayStoreName}
            </h1>

            <p className="text-xl sm:text-2xl font-bold text-white/95">
              {displayTagline}
            </p>

            <p className="text-sm sm:text-base text-white/80 max-w-xl leading-relaxed">
              {displayDesc}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => {
                  setCurrentPage('shop');
                  setSelectedCategory('All');
                }}
                className="px-7 py-3.5 rounded-2xl bg-white text-slate-950 font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
              >
                <span>{t.heroBrowseCatalog}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // DEFAULT LAYOUT 4: MODERN SPLIT (e.g. Panda Store)
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white py-16 sm:py-24">
      {/* Decorative background glows */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: theme.hex }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-white text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{displayStoreName}</span>
              <span className="opacity-50">•</span>
              <span className="font-mono text-emerald-300" dir="ltr">{activeStore.slug}.bastiyah.vercel.app</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              {displayTagline}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              {displayDesc}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  setCurrentPage('shop');
                  setSelectedCategory('All');
                }}
                className="px-7 py-3.5 rounded-xl text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all hover:scale-102 active:scale-98"
                style={{ backgroundColor: theme.hex }}
              >
                <span>{t.heroBrowseCatalog}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setCurrentPage('admin');
                  setAdminTab('design');
                }}
                className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-slate-700 transition-all backdrop-blur-sm flex items-center gap-2"
              >
                <Palette className="w-4 h-4" style={{ color: theme.hex }} />
                <span>{t.storeDesignTab}</span>
              </button>
            </div>

            {/* Social proof metrics */}
            <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800/80 max-w-lg">
              <div>
                <p className="text-2xl font-black text-white">{t.heroMetric1Value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.heroMetric1Label}</p>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-black text-white">{t.heroMetric2Value}</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 -mt-1" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{t.heroMetric2Label}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">{t.heroMetric3Value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t.heroMetric3Label}</p>
              </div>
            </div>
          </div>

          {/* Right Hero showcase card */}
          {featuredProduct && (
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-slate-800/80 to-slate-900/90 border border-slate-700/60 p-6 shadow-2xl backdrop-blur-xl">
                {/* Floating promo badge */}
                <div className="absolute top-8 start-8 z-10 px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md">
                  {t.heroSpotlightDeal}
                </div>

                <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden mb-6 bg-slate-950/50 group">
                  <img
                    src={featuredProduct.images[0]}
                    alt={getProductName(featuredProduct)}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: theme.hex }}>
                      {getCategoryName(featuredProduct.category)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{featuredProduct.rating}</span>
                      <span className="text-slate-400">({featuredProduct.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white line-clamp-1">
                    {getProductName(featuredProduct)}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {getProductTagline(featuredProduct)}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-700/60">
                    <div>
                      <span className="text-2xl font-black text-white">
                        {activeStore.settings.currency}{featuredProduct.price}
                      </span>
                      {featuredProduct.originalPrice && (
                        <span className="text-sm text-slate-400 line-through ms-2">
                          {activeStore.settings.currency}{featuredProduct.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedProductId(featuredProduct.id);
                        setCurrentPage('product-detail');
                      }}
                      className="px-4 py-2 rounded-lg text-white text-xs font-bold transition-all flex items-center gap-1.5"
                      style={{ backgroundColor: theme.hex }}
                    >
                      <span>{t.heroExplore}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
