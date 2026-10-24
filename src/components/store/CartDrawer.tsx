import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Tag 
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    isCartDrawerOpen, 
    setIsCartDrawerOpen, 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    cartSubtotal, 
    cartDiscount, 
    cartShipping, 
    cartTax, 
    cartTotal, 
    appliedCoupon, 
    applyCoupon, 
    removeCoupon, 
    settings, 
    setCurrentPage,
    t,
    language,
    getProductName,
    isFeatureEnabled
  } = useStore();

  const [couponInput, setCouponInput] = useState('');
  const currency = settings.currency || 'د.ع';

  if (!isCartDrawerOpen) return null;

  const freeShippingProgress = Math.min(100, (cartSubtotal / settings.freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, settings.freeShippingThreshold - cartSubtotal);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const ok = applyCoupon(couponInput);
    if (ok) setCouponInput('');
  };

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    setCurrentPage('checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className={`fixed inset-y-0 ${language === 'ar' ? 'left-0' : 'right-0'} max-w-full flex ${language === 'ar' ? 'pr-0 sm:pr-10' : 'pl-0 sm:pl-10'}`}>
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-lg text-slate-900">{t.yourBag}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="px-5 py-3 bg-emerald-50/60 border-b border-emerald-100 text-xs">
            {cartSubtotal >= settings.freeShippingThreshold ? (
              <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>{t.freeShippingUnlocked}</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-slate-600">
                  {t.freeShippingRemaining.replace('{amount}', remainingForFreeShipping.toFixed(2))}
                </p>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{t.bagEmpty}</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {t.bagEmptyDesc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    setCurrentPage('shop');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors"
                >
                  {t.navShopAll}
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const prodName = getProductName(item.product);
                return (
                  <div key={item.product.id} className="py-4 flex gap-4 items-center">
                    <img
                      src={item.product.images[0]}
                      alt={prodName}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {prodName}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {currency}{item.product.price}
                      </p>

                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 scale-90 -ms-1">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-slate-600 font-bold hover:bg-slate-200/50"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="px-2 py-0.5 text-slate-600 font-bold hover:bg-slate-200/50 disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="text-end shrink-0">
                      <span className="text-sm font-black text-slate-900">
                        {currency}{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer with Calculations & Checkout */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* Coupon input */}
              {isFeatureEnabled('customDiscounts') && (
                <div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Tag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.couponCode}: {appliedCoupon.code} (-{appliedCoupon.discountPercent}%)</span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-emerald-700 hover:text-rose-600 font-semibold"
                      >
                        {language === 'ar' ? 'إلغاء' : 'Remove'}
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t.couponPlaceholder}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        {t.applyCoupon}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t.subtotal}</span>
                  <span className="font-semibold text-slate-900">{currency}{cartSubtotal.toFixed(2)}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>{t.discount}</span>
                    <span>-{currency}{cartDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>{t.shipping}</span>
                  <span className="font-semibold text-slate-900">
                    {cartShipping === 0 ? t.free : `${currency}${cartShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t.estimatedTax}</span>
                  <span className="font-semibold text-slate-900">{currency}{cartTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t.total}</span>
                  <span className="text-emerald-700">{currency}{cartTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleProceedToCheckout}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98"
              >
                <span>{t.proceedToCheckout}</span>
                <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{t.sslSecure}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
