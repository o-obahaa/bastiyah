import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from './ProductCard';
import { getProductGridClasses } from '../../utils/gridUtils';
import { getPagePath } from '../../utils/urlUtils';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  Share2,
  MessageSquarePlus,
  User,
  Clock,
  Trash2,
  Zap,
  FileText,
  MapPin,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Move
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { 
    products, 
    activeStore,
    selectedProductId, 
    setSelectedProductId, 
    setCurrentPage, 
    setSelectedCategory, 
    addToCart, 
    toggleWishlist, 
    isInWishlist, 
    addToast,
    reviews,
    addProductReview,
    deleteProductReview,
    isStoreAdminAuthenticated,
    t,
    language,
    getProductName,
    getProductTagline,
    getProductDescription,
    getCategoryName,
    isFeatureEnabled
  } = useStore();

  const currency = activeStore.settings.currency || 'د.ع';
  const product = products.find((p) => p.id === selectedProductId) || products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');

  const availableSizes = product?.variants?.sizes || [];
  const availableColors = product?.variants?.colors || [];

  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || '');
  const [selectedColor, setSelectedColor] = useState<string>(availableColors[0] || '');

  const discountPercent = product?.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Review form states
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Zoom & Close-Look Lightbox Modal State
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(1)), 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
    setIsDragging(false);
  };

  const handleOpenZoomModal = () => {
    handleResetZoom();
    setIsZoomModalOpen(true);
  };

  const handleCloseZoomModal = () => {
    setIsZoomModalOpen(false);
    handleResetZoom();
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (zoomScale > 1) {
      handleResetZoom();
    } else {
      setZoomScale(2.5);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (product) {
      setSelectedSize(product.variants?.sizes?.[0] || '');
      setSelectedColor(product.variants?.colors?.[0] || '');
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [product?.id]);

  if (!product) return null;

  const isFavorited = isInWishlist(product.id);
  const isOutOfStock = product.stock <= 0;
  const productName = getProductName(product);
  const productTagline = getProductTagline(product);
  const productDesc = getProductDescription(product);
  const categoryName = getCategoryName(product.category);

  // Reviews for this product
  const productReviews = reviews.filter((r) => r.productId === product.id);

  // Related products from same category
  const relatedProducts = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  const getSpecifiedProductUrl = () => {
    if (typeof window === 'undefined') return '';
    const hostParts = window.location.hostname.split('.');
    const isLocalOrVercel = window.location.hostname.includes('localhost') || 
                            window.location.hostname.includes('127.0.0.1') || 
                            window.location.hostname.endsWith('.vercel.app');
    const isStoreSubdomain = !isLocalOrVercel && hostParts.length >= 3 && hostParts[0] === activeStore.slug;
    
    if (isStoreSubdomain) {
      return `${window.location.origin}/product/${product.id}`;
    }
    return `${window.location.origin}/store/${activeStore.slug}/product/${product.id}`;
  };

  const handleShare = () => {
    const url = getSpecifiedProductUrl() || window.location.href;
    navigator.clipboard?.writeText(url);
    addToast(language === 'ar' ? 'تم نسخ رابط المنتج المخصص إلى الحافظة بنجاح!' : 'Specified product link copied to clipboard!', 'info');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity, selectedColor || undefined, selectedSize || undefined);
    setCurrentPage('checkout');
  };

  const handlePrevImage = () => {
    if (!product?.images?.length) return;
    setSelectedImage((prev) => (prev > 0 ? prev - 1 : product.images.length - 1));
  };

  const handleNextImage = () => {
    if (!product?.images?.length) return;
    setSelectedImage((prev) => (prev < product.images.length - 1 ? prev + 1 : 0));
  };

  // Lock body scroll when zoom modal is active
  useEffect(() => {
    if (isZoomModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isZoomModalOpen]);

  // Keyboard navigation for zoom modal
  useEffect(() => {
    if (!isZoomModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseZoomModal();
      } else if (e.key === 'ArrowRight') {
        if (language === 'ar') handlePrevImage(); else handleNextImage();
        handleResetZoom();
      } else if (e.key === 'ArrowLeft') {
        if (language === 'ar') handleNextImage(); else handlePrevImage();
        handleResetZoom();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      } else if (e.key === '0') {
        handleResetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZoomModalOpen, language, product?.images?.length]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewAuthor.trim() || !newReviewComment.trim()) {
      addToast(language === 'ar' ? 'يرجى كتابة الاسم والتعليق' : 'Please provide your name and review', 'warning');
      return;
    }
    setIsSubmittingReview(true);
    addProductReview({
      productId: product.id,
      author: newReviewAuthor.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
    });
    setNewReviewAuthor('');
    setNewReviewComment('');
    setNewReviewRating(5);
    setIsSubmittingReview(false);
  };

  const BreadcrumbArrow = language === 'ar' ? ChevronLeft : ChevronRight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
        <a 
          href={getPagePath('home', activeStore.slug)}
          className="hover:text-emerald-600 transition-colors"
        >
          {t.home}
        </a>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <a 
          href={getPagePath('shop', activeStore.slug)}
          onClick={() => { setSelectedCategory('All'); }}
          className="hover:text-emerald-600 transition-colors"
        >
          {t.shop}
        </a>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <a 
          href={`${getPagePath('shop', activeStore.slug)}?category=${encodeURIComponent(product.category)}`}
          onClick={() => { setSelectedCategory(product.category); }}
          className="hover:text-emerald-600 transition-colors"
        >
          {categoryName}
        </a>
        <BreadcrumbArrow className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold truncate max-w-xs">{productName}</span>
      </nav>

      {/* Main Product Showcase Grid - 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-10 items-start mb-16">
        
        {/* Column 1: Gallery (Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            onClick={handleOpenZoomModal}
            className="aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm relative group cursor-zoom-in select-none"
            title={language === 'ar' ? 'انقر لتكبير ومعاينة أدق التفاصيل' : 'Click to inspect & zoom'}
          >
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={productName}
              className="w-full h-full object-cover object-center transition-all duration-300 group-hover:scale-105"
            />
            
            {/* Hover overlay hint button for close look / zoom */}
            <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 text-slate-900 font-bold text-xs shadow-xl backdrop-blur-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 border border-slate-200/60">
                <ZoomIn className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ar' ? 'انقر للتكبير ومعاينة أدق التفاصيل' : 'Click to inspect & zoom'}</span>
              </span>
            </div>

            {/* Top-end Badge (e.g. HOT SALE) */}
            {product.badge && (
              <span className="absolute top-4 end-4 z-10 px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow pointer-events-none">
                {product.badge}
              </span>
            )}

            {/* Floating Quick Action Buttons: Share & Wishlist */}
            <div className="absolute top-4 start-4 z-10 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md backdrop-blur-sm border border-slate-200/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                title={t.share}
              >
                <Share2 className="w-4 h-4" />
              </button>
              {isFeatureEnabled('wishlist') && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className={`w-10 h-10 rounded-full shadow-md backdrop-blur-sm border transition-all hover:scale-105 active:scale-95 flex items-center justify-center ${
                    isFavorited 
                      ? 'bg-rose-50 text-rose-500 border-rose-200' 
                      : 'bg-white/90 hover:bg-white text-slate-700 border-slate-200/80'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-rose-500' : ''}`} />
                </button>
              )}
            </div>

            {/* Next and Back Buttons */}
            {product.images.length > 1 && (
              <div onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                  aria-label={language === 'ar' ? 'الصورة السابقة' : 'Previous picture'}
                  className="absolute top-1/2 -translate-y-1/2 start-3 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-slate-800 shadow-md hover:shadow-xl backdrop-blur-sm border border-slate-200/80 transition-all hover:scale-105 active:scale-95 focus:outline-none"
                >
                  {language === 'ar' ? (
                    <ChevronRight className="w-5 h-5" />
                  ) : (
                    <ChevronLeft className="w-5 h-5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                  aria-label={language === 'ar' ? 'الصورة التالية' : 'Next picture'}
                  className="absolute top-1/2 -translate-y-1/2 end-3 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 hover:bg-white text-slate-800 shadow-md hover:shadow-xl backdrop-blur-sm border border-slate-200/80 transition-all hover:scale-105 active:scale-95 focus:outline-none"
                >
                  {language === 'ar' ? (
                    <ChevronLeft className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                {/* Picture Counter */}
                <div className="absolute bottom-3 end-3 px-2.5 py-1 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-xs font-bold tabular-nums shadow select-none">
                  {selectedImage + 1} / {product.images.length}
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1 pt-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
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

        {/* Column 2: Product Info & Variants (Span 4) */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <span className="font-bold text-xs text-emerald-700 tracking-wider uppercase">
              {categoryName}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug mt-1.5">
              {productName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              {productTagline}
            </p>
            
            {/* Rating row */}
            {isFeatureEnabled('reviews') && (
              <div className="flex items-center gap-2 mt-2.5 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-slate-800 font-bold">{product.rating}</span>
                </div>
                <span className="text-slate-400">
                  ({productReviews.length || product.reviewCount} {t.reviews})
                </span>
              </div>
            )}
          </div>

          {/* Price display with discount badge */}
          <div className="pt-4 border-t border-slate-100">
            {discountPercent > 0 && (
              <div className="mb-1">
                <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                  {language === 'ar' ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {currency}{product.price.toLocaleString()}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm text-slate-400 line-through">
                  {currency}{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Variant Selectors: Colors */}
          {availableColors.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'ar' ? 'اللون المتاح:' : 'Select Color:'}
                <span className="ms-2 font-bold text-emerald-700">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedColor === color
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-600 ring-2 ring-emerald-200 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Variant Selectors: Sizes */}
          {availableSizes.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'ar' ? 'المقاس / السعة:' : 'Select Size:'}
                <span className="ms-2 font-bold text-slate-900">{selectedSize}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedSize === size
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Product Description Overview */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'ar' ? 'وصف ومميزات المنتج' : 'Product Description'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {productDesc || productTagline}
            </p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-lg font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Buy Box Card (Span 3 - Sticky) */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            {/* Out of stock banner if applicable */}
            {isOutOfStock && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center text-xs font-bold text-rose-700">
                {t.outOfStock}
              </div>
            )}

            {/* Total price calculation */}
            <div className="space-y-0.5">
              <span className="text-xs text-slate-400 font-medium">{language === 'ar' ? 'المجموع الإجمالي' : 'Total Price'}</span>
              <div className="text-2xl font-black text-slate-900">
                {currency}{(product.price * quantity).toLocaleString()}
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 ps-1">{language === 'ar' ? 'الكمية المطلوبة:' : 'Quantity:'}</span>
              <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-xs">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-black text-slate-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || isOutOfStock}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-2.5 pt-1">
              {/* Add to Cart button */}
              <button
                type="button"
                onClick={() => addToCart(product, quantity, selectedColor || undefined, selectedSize || undefined)}
                disabled={isOutOfStock}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:bg-slate-200 disabled:text-slate-400"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? t.outOfStock : t.addToBag}</span>
              </button>

              {/* Buy Now button */}
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full py-3 px-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{language === 'ar' ? 'اشترِ الآن' : 'Buy Now'}</span>
              </button>
            </div>

            {/* Delivery row indicator */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{language === 'ar' ? 'توصيل مباشر لباب المنزل • الدفع نقداً عند الاستلام' : 'Doorstep express delivery • Cash on delivery'}</span>
            </div>

            {/* Trust Badges vertical list */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">{language === 'ar' ? 'توصيل سريع' : 'Fast Delivery'}</span>
                  <span className="text-[11px] text-slate-500">{language === 'ar' ? 'شحن موثوق لجميع المحافظات' : 'Reliable delivery to all areas'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">{language === 'ar' ? 'ضمان أصلي' : 'Authentic'}</span>
                  <span className="text-[11px] text-slate-500">{language === 'ar' ? 'منتج معتمد وجودة مضمونة' : '100% verified authentic'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">{language === 'ar' ? 'إرجاع 30 يوماً' : '30-Day Returns'}</span>
                  <span className="text-[11px] text-slate-500">{language === 'ar' ? 'إرجاع واستبدال مرن' : 'Hassle-free return policy'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 block leading-tight">{language === 'ar' ? 'دائماً موثوقة' : 'Always Trusted'}</span>
                  <span className="text-[11px] text-slate-500">{language === 'ar' ? 'تسوق آمن والدفع عند المعاينة' : 'Safe shopping guaranteed'}</span>
                </div>
              </div>
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
          {isFeatureEnabled('reviews') && (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
                activeTab === 'reviews'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.customerReviews} ({productReviews.length})
            </button>
          )}
        </div>

        <div className="py-6">
          {activeTab === 'specs' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl">
              <h3 className="font-bold text-base text-slate-900 mb-4">{t.hardwareSpecs}</h3>
              <dl className="divide-y divide-slate-100">
                {Object.entries(product.specs || {}).map(([key, val]) => (
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

          {activeTab === 'reviews' && isFeatureEnabled('reviews') && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl space-y-8">
              {/* Rating Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                <div className="text-center sm:text-start">
                  <span className="text-4xl font-black text-slate-900">{product.rating}</span>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-amber-400 my-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= Math.round(product.rating) ? 'fill-current' : 'text-slate-200'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">
                    {productReviews.length} {t.reviews}
                  </span>
                </div>
                <div className="flex-1 w-full space-y-1.5 text-xs text-slate-600">
                  {[5, 4, 3, 2, 1].map((rVal) => {
                    const count = productReviews.filter(r => r.rating === rVal).length;
                    const pct = productReviews.length > 0 ? Math.round((count / productReviews.length) * 100) : 0;
                    return (
                      <div key={rVal} className="flex items-center gap-2">
                        <span className="w-6 font-semibold">{rVal} ★</span>
                        <div className="h-2 rounded-full bg-slate-100 flex-1 overflow-hidden">
                          <div className="h-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-end text-slate-400">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write Review Form */}
              <form onSubmit={handleAddReview} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <MessageSquarePlus className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ar' ? 'أضف تقييمك ورأيك في المنتج' : 'Write a Customer Review'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">
                    {language === 'ar' ? 'التقييم:' : 'Rating:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= newReviewRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {language === 'ar' ? 'اسمك الكريم' : 'Your Name'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newReviewAuthor}
                      onChange={(e) => setNewReviewAuthor(e.target.value)}
                      placeholder={language === 'ar' ? 'مثال: فيصل العتيبي' : 'e.g. Liam Smith'}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {language === 'ar' ? 'تجربتك مع المنتج' : 'Review details'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب رأيك بالتفصيل لمساعدة العملاء الآخرين...' : 'Share details of your experience to help others...'}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'نشر التقييم' : 'Submit Review'}</span>
                </button>
              </form>

              {/* Real Reviews List */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-sm">
                  {language === 'ar' ? `آراء المشترين (${productReviews.length})` : `Customer Feedback (${productReviews.length})`}
                </h4>

                {productReviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {language === 'ar' ? 'كن أول من يقيم هذا المنتج!' : 'Be the first to review this product!'}
                  </div>
                ) : (
                  productReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-2 relative group">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{rev.author}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">
                              {language === 'ar' ? 'مشترٍ موثوق' : 'Verified Buyer'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(rev.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>

                          {/* Admin delete review button if merchant logged in */}
                          {isStoreAdminAuthenticated() && (
                            <button
                              onClick={() => deleteProductReview(rev.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title={language === 'ar' ? 'حذف التقييم (مشرف)' : 'Delete review'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>

                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-slate-200">
          <h2 className="text-2xl font-black text-slate-900 mb-6">{t.youMayAlsoLike}</h2>
          <div className={getProductGridClasses(activeStore.design)}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Product Image Close-Look & Zoom Lightbox Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col justify-between overflow-hidden animate-in fade-in duration-200 select-none"
          onClick={handleCloseZoomModal}
        >
          {/* Top Bar: Title, Zoom Controls & Close Button */}
          <div
            className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/80 to-transparent z-20 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Product Name & Image Counter */}
            <div className="flex items-center gap-3 text-white min-w-0">
              <span className="text-xs sm:text-sm font-bold truncate max-w-[180px] sm:max-w-md text-slate-200">
                {productName}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white text-xs font-mono font-bold shrink-0">
                {selectedImage + 1} / {product.images.length}
              </span>
            </div>

            {/* Central Zoom Controls Pill */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/15 text-white">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title={language === 'ar' ? 'تصغير (-)' : 'Zoom out (-)'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <span className="px-2 font-mono text-xs font-bold text-emerald-400 select-none min-w-[3.5rem] text-center">
                {Math.round(zoomScale * 100)}%
              </span>

              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                title={language === 'ar' ? 'تكبير (+)' : 'Zoom in (+)'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {zoomScale > 1 && (
                <button
                  type="button"
                  onClick={handleResetZoom}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 flex items-center gap-1 transition-all cursor-pointer"
                  title={language === 'ar' ? 'استعادة الحجم الطبيعي (0)' : 'Reset zoom (0)'}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">{language === 'ar' ? 'إعادة' : 'Reset'}</span>
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseZoomModal}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-white/10 cursor-pointer"
              title={language === 'ar' ? 'إغلاق (Esc)' : 'Close (Esc)'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Zoom Viewport (Image Area) */}
          <div
            className={`flex-1 relative flex items-center justify-center overflow-hidden p-4 select-none ${
              zoomScale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleCloseZoomModal();
              }
            }}
            onDoubleClick={handleToggleZoom}
          >
            {/* The Scaled/Panned Image Container */}
            <div
              className="max-h-[72vh] max-w-[90vw] flex items-center justify-center select-none"
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            >
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={productName}
                draggable={false}
                className={`max-h-[72vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl select-none transition-shadow ${
                  zoomScale > 1 ? 'shadow-black/80' : ''
                }`}
              />
            </div>

            {/* Next and Previous Arrow Buttons inside Zoom Viewport */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (language === 'ar') handlePrevImage(); else handleNextImage();
                    handleResetZoom();
                  }}
                  className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-xl z-20 cursor-pointer"
                  title={language === 'ar' ? 'الصورة السابقة' : 'Previous image'}
                >
                  {language === 'ar' ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (language === 'ar') handleNextImage(); else handlePrevImage();
                    handleResetZoom();
                  }}
                  className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all hover:scale-110 active:scale-90 shadow-xl z-20 cursor-pointer"
                  title={language === 'ar' ? 'الصورة التالية' : 'Next image'}
                >
                  {language === 'ar' ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                </button>
              </>
            )}

            {/* Panning / Zooming visual indicator when zoomed */}
            {zoomScale > 1 && (
              <div className="absolute top-4 start-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white/95 text-xs font-semibold border border-white/15 flex items-center gap-1.5 pointer-events-none shadow-lg animate-in fade-in">
                <Move className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'ar' ? 'اسحب الصورة للتحريك والاستكشاف' : 'Drag to pan around details'}</span>
              </div>
            )}
          </div>

          {/* Bottom Bar: Thumbnails & Helpful Hints */}
          <div
            className="p-4 bg-gradient-to-t from-black/80 to-transparent z-20 space-y-2.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Thumbnails Strip */}
            {product.images.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto py-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedImage(idx);
                      handleResetZoom();
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      selectedImage === idx
                        ? 'border-emerald-500 ring-2 ring-emerald-400/50 scale-105 shadow-lg'
                        : 'border-white/20 opacity-50 hover:opacity-100 hover:border-white/40'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover select-none" />
                  </button>
                ))}
              </div>
            )}

            {/* Usage Tip Badge */}
            <div className="text-center text-[11px] text-white/60 font-medium select-none">
              {language === 'ar'
                ? '💡 انقر مرتين للتكبير السريع • عجلة الفأرة للتقريب والتبعيد • اسحب لتحريك الصورة • اضغط ESC للإغلاق'
                : '💡 Double click to zoom • Scroll to zoom in/out • Drag to pan • Press ESC to exit'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
