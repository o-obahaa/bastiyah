import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { getPagePath } from '../../utils/urlUtils';

export const WishlistPage: React.FC = () => {
  const { 
    wishlist, 
    products, 
    toggleWishlist, 
    addToCart, 
    setCurrentPage, 
    setSelectedProductId,
    t,
    language,
    activeStore,
    getProductName,
    getCategoryName
  } = useStore();

  const currency = activeStore.settings?.currency || (language === 'ar' ? 'د.ع' : 'IQD');

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistedProducts.forEach((p) => {
      if (p.stock > 0) {
        addToCart(p, 1);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{t.savedWishlist}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {wishlist.length} {t.savedForLater}
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <button
            onClick={handleAddAllToCart}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all w-fit"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            <span>{t.addAllToBag}</span>
          </button>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{t.wishlistEmpty}</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t.wishlistEmptyDesc}
          </p>
          <a
            href={getPagePath('shop', activeStore.slug)}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors inline-block"
          >
            {t.navShopAll}
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistedProducts.map((product) => {
            const productName = getProductName(product);
            const categoryName = getCategoryName(product.category);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="relative aspect-square bg-slate-100">
                  <a 
                    href={getPagePath('product-detail', activeStore.slug, product.id)}
                    className="block w-full h-full cursor-pointer"
                    onClick={() => {
                      setSelectedProductId(product.id);
                    }}
                  >
                    <img
                      src={product.images[0]}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="absolute top-3 end-3 p-2 rounded-full bg-white/90 text-rose-500 hover:bg-white shadow-sm"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      {categoryName}
                    </span>
                    <h3
                      className="font-bold text-sm text-slate-900 truncate hover:text-emerald-600 cursor-pointer mt-0.5"
                    >
                      <a
                        href={getPagePath('product-detail', activeStore.slug, product.id)}
                        onClick={() => {
                          setSelectedProductId(product.id);
                        }}
                      >
                        {productName}
                      </a>
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-black text-slate-900 text-base">
                        {product.price.toLocaleString()} {currency}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {product.originalPrice.toLocaleString()} {currency}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{product.stock <= 0 ? t.outOfStock : t.addToBag}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
