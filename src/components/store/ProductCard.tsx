import React from 'react';
import { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { Star, ShoppingBag, Eye, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { 
    activeStore,
    theme,
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    setQuickViewProduct, 
    setSelectedProductId, 
    setCurrentPage,
    t,
    language,
    getProductName,
    getProductTagline,
    getCategoryName
  } = useStore();

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 10;

  const handleCardClick = () => {
    setSelectedProductId(product.id);
    setCurrentPage('product-detail');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const getBadgeLabel = (badge?: string) => {
    if (!badge) return '';
    if (language === 'ar') {
      switch (badge) {
        case 'Best Seller': return 'الأكثر مبيعاً';
        case 'Hot Sale': return 'تخفيض حصري';
        case 'New Arrival': return 'وصل حديثاً';
        case 'Limited Stock': return 'كمية محدودة';
        default: return badge;
      }
    }
    return badge;
  };

  const productName = getProductName(product);
  const productTagline = getProductTagline(product);
  const categoryName = getCategoryName(product.category);

  const cardSize = activeStore.design.productCardSize || 'standard';
  const isCompact = cardSize === 'compact' || activeStore.design.desktopGridCols === 5 || activeStore.design.desktopGridCols === 6;
  const isLargeOrSpacious = cardSize === 'large' || cardSize === 'spacious' || activeStore.design.desktopGridCols === 2 || activeStore.design.desktopGridCols === 3;

  const radiusClass =
    activeStore.design.cardRadius === 'sharp'
      ? 'rounded-none'
      : activeStore.design.cardRadius === 'pill'
      ? 'rounded-3xl'
      : 'rounded-2xl';

  return (
    <div
      className={`group bg-white ${radiusClass} border border-slate-200/90 hover:border-slate-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden relative`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer" onClick={handleCardClick}>
        <img
          src={product.images[0]}
          alt={productName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.badge && (
            <span
              className={`${isCompact ? 'text-[10px] sm:text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1'} font-black uppercase tracking-wider rounded-full shadow-md text-white backdrop-blur-xs`}
              style={{
                backgroundColor:
                  product.badge === 'Hot Sale'
                    ? '#f43f5e'
                    : product.badge === 'Limited Stock'
                    ? '#f59e0b'
                    : theme.hex,
              }}
            >
              {getBadgeLabel(product.badge)}
            </span>
          )}
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={`${isCompact ? 'text-[10px] sm:text-xs px-2 py-0.5' : 'text-xs px-2.5 py-0.5'} font-black rounded-full bg-rose-50 text-rose-700 border border-rose-200 shadow-xs w-fit`}>
              {t.save} {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-3 end-3 z-10 ${isCompact ? 'w-8 h-8' : 'w-9 h-9'} rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-90 transition-all`}
          title={isFavorited ? 'Remove' : 'Save'}
        >
          <Heart className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} ${isFavorited ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-x-0 bottom-3 px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full py-2.5 bg-white/95 hover:bg-white text-slate-800 font-bold text-xs sm:text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 backdrop-blur-sm transition-transform hover:scale-102"
          >
            <Eye className="w-4 h-4" style={{ color: theme.hex }} />
            <span>{t.quickView}</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className={`${isCompact ? 'p-3 sm:p-3.5' : isLargeOrSpacious ? 'p-4 sm:p-5' : 'p-3.5 sm:p-4'} flex flex-col flex-1 justify-between`}>
        <div className="flex-1 flex flex-col">
          {/* Category & Star Rating Header Row */}
          <div className="flex items-center justify-between mb-1.5 gap-1.5">
            <span 
              className={`font-semibold uppercase tracking-wider ${isCompact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'} truncate flex-1 min-w-0`} 
              style={{ color: theme.hex }}
            >
              {categoryName}
            </span>
            <div className="flex items-center gap-1 bg-amber-50/90 border border-amber-200/70 px-1.5 py-0.5 rounded-md text-amber-950 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-[11px] font-black font-mono leading-none">{product.rating}</span>
              {!isCompact && (
                <span className="text-slate-400 text-[10px] leading-none hidden sm:inline">({product.reviewCount})</span>
              )}
            </div>
          </div>

          {/* Product Name (Properly sized so full text appears clearly) */}
          <h3
            onClick={handleCardClick}
            className={`font-bold ${
              isCompact 
                ? 'text-xs sm:text-[13px] line-clamp-2 sm:line-clamp-3 leading-snug' 
                : isLargeOrSpacious 
                ? 'text-base sm:text-lg leading-snug line-clamp-2 sm:line-clamp-3' 
                : 'text-[13px] sm:text-sm md:text-base leading-snug line-clamp-2 sm:line-clamp-3'
            } text-slate-900 hover:text-emerald-700 transition-colors cursor-pointer`}
            title={productName}
          >
            {productName}
          </h3>

          {/* Product Tagline / Short description */}
          {productTagline && (
            <p className={`${isCompact ? 'text-[10px] sm:text-[11px]' : 'text-[11px] sm:text-xs'} text-slate-500 mt-1 line-clamp-2 leading-relaxed`}>
              {productTagline}
            </p>
          )}
        </div>

        {/* Price and Cart button footer */}
        <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            {/* Price and Currency together - NEVER wrapped or broken */}
            <div className="flex items-baseline gap-1 whitespace-nowrap">
              <span className={`${isCompact ? 'text-base sm:text-lg' : isLargeOrSpacious ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'} font-black text-slate-950 font-brand tracking-tight`}>
                {product.price.toLocaleString()}
              </span>
              <span className={`${isCompact ? 'text-[10px] sm:text-xs' : 'text-xs'} font-bold text-slate-600`}>
                {activeStore.settings.currency || 'د.ع'}
              </span>
            </div>

            {/* Struck-through original price (if discounted) */}
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] text-slate-400 line-through font-medium whitespace-nowrap block">
                {product.originalPrice.toLocaleString()} {activeStore.settings.currency || 'د.ع'}
              </span>
            )}

            {/* Stock indicator: only show if out of stock or low stock (Available note removed) */}
            {isOutOfStock ? (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-rose-600 leading-none">{t.outOfStock}</span>
              </div>
            ) : isLowStock ? (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-bold text-amber-700 leading-none">
                  {t.onlyLeft.replace('{count}', String(product.stock))}
                </span>
              </div>
            ) : null}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`${
              isCompact 
                ? 'px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs' 
                : isLargeOrSpacious 
                ? 'px-4 py-2.5 sm:px-5 sm:py-3 text-sm' 
                : 'px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm'
            } rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg active:scale-95 shrink-0 whitespace-nowrap ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'text-white hover:brightness-105'
            }`}
            style={!isOutOfStock ? { backgroundColor: theme.hex } : undefined}
          >
            <ShoppingBag className={`${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
            <span>{t.addToBag}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
