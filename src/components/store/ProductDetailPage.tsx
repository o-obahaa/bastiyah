import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Share2 
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { 
    products, 
    selectedProductId, 
    setSelectedProductId, 
    setCurrentPage, 
    setSelectedCategory, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    addToast,
    t,
    language,
    getProductName,
    getProductTagline,
    getProductDescription,
    getCategoryName
  } = useStore();

  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'shipping'>('specs');

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const productName = getProductName(product);
  const productTagline = getProductTagline(product);
  const productDesc = getProductDescription(product);
  const categoryName = getCategoryName(product.category);

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast(language === 'ar' ? 'تم نسخ رابط المنتج إلى الحافظة!' : 'Product link copied to clipboard!', 'info');
  };

  const BreadcrumbArrow = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <button 
          onClick={() => setCurrentPage('home')}
          className="hover:text-emerald-600 transition-colors"
        >
          {t.home}
        </button>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <button 
          onClick={() => { setCurrentPage('shop'); setSelectedCategory('All'); }}
          className="hover:text-emerald-600 transition-colors"
        >
          {t.shop}
        </button>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <button 
          onClick={() => { setCurrentPage('shop'); setSelectedCategory(product.category); }}
          className="hover:text-emerald-600 transition-colors"
        >
          {categoryName}
        </button>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{productName}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
        {/* Gallery column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md relative">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={productName}
              className="w-full h-full object-cover object-center"
            />
            {product.badge && (
              <span className="absolute top-4 start-4 px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === idx
                      ? 'border-emerald-600 ring-4 ring-emerald-100 shadow-sm'
                      : 'border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-emerald-700 tracking-wider uppercase">
                {categoryName}
              </span>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400">({product.reviewCount} {t.reviews})</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {productName}
            </h1>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              {productTagline}
            </p>
          </div>

          {/* Price & Savings */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-slate-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{language === 'ar' ? 'الضرائب تُحسب عند الدفع' : 'Taxes calculated at checkout'}</p>
            </div>

            <div className="text-end">
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  {t.outOfStock}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {t.inStock} ({product.stock})
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Quantity and CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="px-4 py-3 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-slate-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="px-4 py-3 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-40"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={isOutOfStock}
                className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? t.outOfStock : `${t.addToBag} • $${(product.price * quantity).toFixed(0)}`}</span>
              </button>

              {/* Wishlist button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm ${
                  isFavorited ? 'text-rose-500 fill-rose-500 bg-rose-50 border-rose-200' : 'text-slate-600'
                }`}
                title="Wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>

              {/* Share button */}
              <button
                onClick={handleShare}
                className="p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
                title={t.share}
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50">
              <Truck className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-900">{language === 'ar' ? 'شحن سريع' : 'Free Express'}</span>
              <span>{language === 'ar' ? 'للطلبات فوق 99$' : 'Over $99'}</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50">
              <RotateCcw className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-900">{language === 'ar' ? 'إرجاع 30 يوماً' : '30 Days'}</span>
              <span>{language === 'ar' ? 'إرجاع سهل' : 'Easy returns'}</span>
            </div>
            <div className="flex flex-col items-center text-center p-2 rounded-xl bg-slate-50">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
              <span className="font-bold text-slate-900">{language === 'ar' ? 'ضمان سنتين' : '2-Yr Warranty'}</span>
              <span>{language === 'ar' ? 'ضمان شامل' : 'Official coverage'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Specs, Reviews, Shipping */}
      <div className="mb-20">
        <div className="border-b border-slate-200 flex gap-8">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.specifications}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.customerReviews} ({product.reviewCount})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'shipping'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.shippingPolicy}
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl">
              <h3 className="font-bold text-base text-slate-900 mb-4">{t.hardwareSpecs}</h3>
              <dl className="divide-y divide-slate-100">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="py-3 flex justify-between text-sm">
                    <dt className="font-medium text-slate-500">{key}</dt>
                    <dd className="font-semibold text-slate-900">{val}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                <h4 className="font-bold text-slate-900 mb-2">{t.productOverview}</h4>
                <p>{productDesc}</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div className="text-center">
                  <span className="text-4xl font-black text-slate-900">{product.rating}</span>
                  <div className="flex items-center justify-center gap-1 text-amber-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{product.reviewCount} {t.reviews}</span>
                </div>
                <div className="flex-1 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>5 ★</span>
                    <div className="h-2 rounded-full bg-slate-100 flex-1 overflow-hidden">
                      <div className="h-full bg-amber-400 w-[92%]" />
                    </div>
                    <span>92%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>4 ★</span>
                    <div className="h-2 rounded-full bg-slate-100 flex-1 overflow-hidden">
                      <div className="h-full bg-amber-400 w-[6%]" />
                    </div>
                    <span>6%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3 ★</span>
                    <div className="h-2 rounded-full bg-slate-100 flex-1 overflow-hidden">
                      <div className="h-full bg-amber-400 w-[2%]" />
                    </div>
                    <span>2%</span>
                  </div>
                </div>
              </div>

              {/* Sample reviews */}
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">
                      {language === 'ar' ? 'سلطان الخالدي • مشترٍ معتمد' : 'Julian K. • Verified Buyer'}
                    </span>
                    <span className="text-slate-400">{language === 'ar' ? 'منذ 3 أيام' : '3 days ago'}</span>
                  </div>
                  <div className="flex text-amber-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {language === 'ar' 
                      ? '"جودة تصنيع استثنائية وأداء لا تشوبه شائبة. خامات تضاهي أعلى المعايير العالمية وتجربة استخدام ممتازة جداً."'
                      : '"Exceptional craftsmanship. The build quality and attention to detail surpassed my expectations. Seamless integration with my setup."'}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">
                      {language === 'ar' ? 'ريم الشهري • مشترٍ معتمد' : 'Avery M. • Verified Buyer'}
                    </span>
                    <span className="text-slate-400">{language === 'ar' ? 'منذ أسبوع' : '1 week ago'}</span>
                  </div>
                  <div className="flex text-amber-400 my-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {language === 'ar'
                      ? '"وصل الشحن في وقت قياسي ومغلف بإحكام واحترافية. المنتج يبدو على الحقيقة أجمل بكثير من الصور، أنصح به بشدة!"'
                      : '"Shipped lightning fast in secure recyclable packaging. Looks even sleeker in person than on camera. Highly recommend!"'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl space-y-4 text-sm text-slate-600">
              <h3 className="font-bold text-base text-slate-900">{t.shippingPolicy}</h3>
              <p>
                {language === 'ar'
                  ? 'يتم تجهيز وشحن جميع الطلبات خلال 24 ساعة عمل عبر مراكز الشحن المعتمدة لمتجر باندا. الشحن السريع مجاني لجميع الطلبات بقيمة 99$ فأكثر.'
                  : 'All orders are dispatched within 24 business hours from our certified fulfillment hubs. Free standard courier delivery is included on all domestic orders totaling $99 or more.'}
              </p>
              <ul className="list-disc ps-5 space-y-1">
                <li>
                  <strong>{language === 'ar' ? 'الشحن السريع المحلي:' : 'Domestic Express:'}</strong>{' '}
                  {language === 'ar' ? 'خلال 1-2 يوم عمل مع رقم تتبع مباشر.' : '1-2 business days with live GPS track and trace.'}
                </li>
                <li>
                  <strong>{language === 'ar' ? 'الشحن الدولي المباشر:' : 'International Priority:'}</strong>{' '}
                  {language === 'ar' ? 'خلال 3-5 أيام عمل مع إنهاء الإجراءات الجمركية مسبقاً.' : '3-5 business days with duties pre-cleared.'}
                </li>
                <li>
                  <strong>{language === 'ar' ? 'سياسة الإرجاع المرن:' : 'Returns:'}</strong>{' '}
                  {language === 'ar' ? 'إرجاع مجاني خلال 30 يوماً واسترداد كامل للمبلغ بدون أي تعقيد.' : '30-day money-back guarantee, no questions asked. Return shipping label provided free of charge.'}
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6">{t.youMayAlsoLike}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
