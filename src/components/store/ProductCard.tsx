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

  const radiusClass =
    activeStore.design.cardRadius === 'sharp'
      ? 'rounded-none'
      : activeStore.design.cardRadius === 'pill'
      ? 'rounded-3xl'
      : 'rounded-2xl';

  return (
    <div
      className={`group bg-white ${radiusClass} border border-slate-200/90 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer" onClick={handleCardClick}>
        <img
          src={product.images[0]}
          alt={productName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm text-white"
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
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 w-fit">
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
          className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-slate-400 hover:text-rose-500 hover:scale-110 active:scale-90 transition-all"
          title={isFavorited ? 'Remove' : 'Save'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'text-rose-500 fill-rose-500' : ''}`} />
        </button>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-x-0 bottom-3 px-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setQuickViewProduct(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white text-slate-800 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 backdrop-blur-sm transition-transform hover:scale-102"
          >
            <Eye className="w-3.5 h-3.5" style={{ color: theme.hex }} />
            <span>{t.quickView}</span>
          </button>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between gap-2.5 sm:gap-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold tracking-wide uppercase text-[10px] sm:text-[11px]" style={{ color: theme.hex }}>
              {categoryName}
            </span>
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs">{product.rating}</span>
              <span className="text-slate-400 text-[9px] sm:text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          <h3
            onClick={handleCardClick}
            className="font-bold text-xs sm:text-sm md:text-base text-slate-900 line-clamp-1 transition-colors cursor-pointer"
            title={productName}
          >
            {productName}
          </h3>

          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {productTagline}
          </p>
        </div>

        {/* Price and Cart button footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <div className="flex items-baseline gap-1 sm:gap-1.5">
              <span className="text-sm sm:text-base md:text-lg font-black text-slate-900">
                {activeStore.settings.currency}{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  {activeStore.settings.currency}{product.originalPrice}
                </span>
              )}
            </div>

            {isOutOfStock ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-rose-500 block">{t.outOfStock}</span>
            ) : isLowStock ? (
              <span className="text-[9px] sm:text-[10px] font-bold text-amber-600 block">{t.onlyLeft.replace('{count}', String(product.stock))}</span>
            ) : (
              <span className="text-[9px] sm:text-[10px] font-semibold block" style={{ color: theme.hex }}>{t.inStock}</span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all active:scale-95 shrink-0 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'text-white shadow-md hover:opacity-95'
            }`}
            style={!isOutOfStock ? { backgroundColor: theme.hex } : undefined}
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{t.addToBag}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
