import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ShippingAddress } from '../../types';
import { 
  CreditCard, 
  Truck, 
  Lock, 
  ArrowLeft, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { 
    activeStore,
    cart, 
    cartSubtotal, 
    cartDiscount, 
    cartShipping, 
    cartTax, 
    cartTotal, 
    appliedCoupon, 
    placeOrder, 
    setCurrentPage,
    t,
    language,
    getProductName
  } = useStore();

  const currency = activeStore.settings.currency || '$';
  const [orderNotes, setOrderNotes] = useState('');

  const [shippingInfo, setShippingInfo] = useState<ShippingAddress>({
    fullName: language === 'ar' ? 'محمد العتيبي' : 'Alexander Wright',
    email: 'client@pandastore.com',
    phone: '+966 50 123 4567',
    address: language === 'ar' ? 'طريق الملك فهد، حي العليا' : '450 Mission Street, Suite 800',
    city: language === 'ar' ? 'الرياض' : 'San Francisco',
    state: language === 'ar' ? 'الرياض' : 'CA',
    zipCode: '12214',
    country: language === 'ar' ? 'المملكة العربية السعودية' : 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'Apple Pay' | 'PayPal' | 'Cash on Delivery'>('Credit Card');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('884');
  const [isProcessing, setIsProcessing] = useState(false);

  const BackArrow = language === 'ar' ? ArrowRight : ArrowLeft;

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">{t.bagEmpty}</h2>
        <p className="text-sm text-slate-500">{t.bagEmptyDesc}</p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors"
        >
          {t.continueShopping}
        </button>
      </div>
    );
  }

  const handleInputChange = (field: keyof ShippingAddress, val: string) => {
    setShippingInfo((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      placeOrder(shippingInfo, paymentMethod, orderNotes.trim() || undefined);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back to cart header */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('shop')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <BackArrow className="w-4 h-4" />
          <span>{t.continueShopping}</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.sslSecure}</span>
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Contact, Shipping, Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. Contact & Shipping Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.shippingDestination}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.emailAddress}
                </label>
                <input
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.phone}
                </label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.streetAddress}
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.city}
                </label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.stateRegion}
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.zipCode}
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Payment Method */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {t.paymentMethod}
              </h2>
            </div>

            {/* Payment options pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'Credit Card' as const, label: t.creditCard },
                { id: 'Apple Pay' as const, label: t.applePay },
                { id: 'PayPal' as const, label: t.payPal },
                { id: 'Cash on Delivery' as const, label: t.cashOnDelivery },
              ].map((method) => (
                <button
                  type="button"
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-2 ${
                    paymentMethod === method.id
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 ring-2 ring-emerald-200'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span className="text-center">{method.label}</span>
                </button>
              ))}
            </div>

            {/* Simulated Card inputs */}
            {paymentMethod === 'Credit Card' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.cardNumber}</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t.expiryDate}</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{t.cvv}</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Order Notes / Special Instructions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'ar' ? 'ملاحظات إضافية على الطلب' : 'Order Notes & Instructions'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'ar'
                ? 'أي تفاصيل خاصة بتسليم الشحنة، مواعيد التوصيل، أو تعليمات للمندوب المتجر.'
                : 'Special delivery instructions, timing preferences, or notes for the courier.'}
            </p>
            <textarea
              rows={3}
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب ملاحظاتك هنا (اختياري)...' : 'Write any specific notes or instructions here (optional)...'}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Right Column: Order Summary & Complete Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-4">
              {t.orderSummary} ({cart.length})
            </h3>

            {/* Items scroll */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2 divide-y divide-slate-100">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${item.selectedColor || ''}-${item.selectedSize || ''}-${idx}`} className="pt-3 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={getProductName(item.product)}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {getProductName(item.product)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      {item.selectedSize && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                          {language === 'ar' ? 'المقاس:' : 'Size:'} {item.selectedSize}
                        </span>
                      )}
                      {item.selectedColor && (
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                          {language === 'ar' ? 'اللون:' : 'Color:'} {item.selectedColor}
                        </span>
                      )}
                      <span>
                        Qty: {item.quantity} × {currency}{item.product.price}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-slate-900">
                    {currency}{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Costs calculation */}
            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-slate-900">{currency}{cartSubtotal.toFixed(2)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>{t.discount} ({appliedCoupon?.code})</span>
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
              <div className="flex justify-between text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>{t.total}</span>
                <span className="text-emerald-700">{currency}{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-600/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.processingPayment}</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>{t.placeOrder} • {currency}{cartTotal.toFixed(2)}</span>
                </>
              )}
            </button>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t.estimatedArrival}</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
