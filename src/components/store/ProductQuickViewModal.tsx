import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Star, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export const ProductQuickViewModal: React.FC = () => {
  const { 
    quickViewProduct, 
    setQuickViewProduct, 
    activeStore,
    addToCart, 
    setSelectedProductId, 
    setCurrentPage,
    t,
    language,
    getProductName,
    getProductDescription,
    getCategoryName
  } = useStore();

  const currency = activeStore.settings.currency || '$';
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const availableSizes = quickViewProduct?.variants?.sizes || [];
  const availableColors = quickViewProduct?.variants?.colors || [];

  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    if (quickViewProduct) {
      setActiveImageIndex(0);
      setQuantity(1);
      setSelectedSize(quickViewProduct.variants?.sizes?.[0] || '');
      setSelectedColor(quickViewProduct.variants?.colors?.[0] || '');
    }
  }, [quickViewProduct?.id]);

  if (!quickViewProduct) return null;

  const isOutOfStock = quickViewProduct.stock <= 0;
  const productName = getProductName(quickViewProduct);
  const productDesc = getProductDescription(quickViewProduct);
  const categoryName = getCategoryName(quickViewProduct.category);

  const handleGoToFullPage = () => {
    setSelectedProductId(quickViewProduct.id);
    setCurrentPage('product-detail');
    setQuickViewProduct(null);
  };

  const handleAddToCart = () => {
    addToCart(quickViewProduct, quantity, selectedColor || undefined, selectedSize || undefined);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 end-4 z-20 p-2 rounded-full bg-white/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 shadow-sm transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 max-h-[85vh] overflow-y-auto">
          {/* Gallery Side */}
          <div className="p-6 bg-slate-50 flex flex-col justify-between gap-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-inner">
              <img
                src={quickViewProduct.images[activeImageIndex] || quickViewProduct.images[0]}
                alt={productName}
                className="w-full h-full object-cover object-center"
              />
            </div>

            {quickViewProduct.images.length > 1 && (
              <div className="flex gap-2 justify-center">
                {quickViewProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-200'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-around text-[11px] text-slate-500 pt-2 border-t border-slate-200">
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-600" /> {t.free}</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 2-Yr</span>
            </div>
          </div>

          {/* Details Side */}
          <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-emerald-700">
                  {categoryName}
                </span>
                <div className="flex items-center gap-1 text-slate-700 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{quickViewProduct.rating}</span>
                  <span className="text-slate-400">({quickViewProduct.reviewCount} {t.reviews})</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {productName}
              </h2>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  {currency}{quickViewProduct.price}
                </span>
                {quickViewProduct.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {currency}{quickViewProduct.originalPrice}
                  </span>
                )}
                {quickViewProduct.stock > 0 && (
                  <span className="ms-auto text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    {t.inStock} ({quickViewProduct.stock})
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                {productDesc}
              </p>

              {/* Variants Selector */}
              {availableSizes.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-700">
                    {language === 'ar' ? 'المقاس:' : 'Size:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          selectedSize === sz
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="space-y-1.5">
                  <span className="block text-xs font-bold text-slate-700">
                    {language === 'ar' ? 'اللون:' : 'Color:'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableColors.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                          selectedColor === col
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Specs */}
              {quickViewProduct.specs && Object.keys(quickViewProduct.specs).length > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600 border border-slate-100">
                  {Object.entries(quickViewProduct.specs).slice(0, 3).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="font-medium text-slate-500">{key}:</span>
                      <span className="font-semibold text-slate-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-2 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(quickViewProduct.stock, quantity + 1))}
                    disabled={quantity >= quickViewProduct.stock || isOutOfStock}
                    className="px-3 py-2 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isOutOfStock ? t.outOfStock : `${t.addToBag} • ${currency}${(quickViewProduct.price * quantity).toFixed(0)}`}</span>
                </button>
              </div>

              <button
                onClick={handleGoToFullPage}
                className="w-full text-center text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center justify-center gap-1 py-1"
              >
                <span>{t.productOverview}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
