import React, { useState, useMemo } from 'react';
import { useStore } from './context/StoreContext';
import { BastiyahTopBar } from './components/platform/BastiyahTopBar';
import { BastiyahOwnerAdmin } from './components/platform/BastiyahOwnerAdmin';
import { BastiyahLandingPage } from './components/platform/BastiyahLandingPage';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { HeroBanner } from './components/store/HeroBanner';
import { CategoryFilter } from './components/store/CategoryFilter';
import { ProductCard } from './components/store/ProductCard';
import { ProductQuickViewModal } from './components/store/ProductQuickViewModal';
import { ProductDetailPage } from './components/store/ProductDetailPage';
import { CartDrawer } from './components/store/CartDrawer';
import { CheckoutPage } from './components/store/CheckoutPage';
import { OrderSuccessPage } from './components/store/OrderSuccessPage';
import { CustomerOrdersPage } from './components/store/CustomerOrdersPage';
import { WishlistPage } from './components/store/WishlistPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { ArrowRight, ArrowLeft } from 'lucide-react';

export function App() {
  const { 
    activeStore,
    theme,
    currentPage, 
    setCurrentPage, 
    products, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery,
    t,
    language,
    getProductName
  } = useStore();

  const [sortBy, setSortBy] = useState('featured');

  // Filter & Sort Products (works for both English & Arabic search)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search query filter (matches both English and Arabic)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.nameAr && p.nameAr.toLowerCase().includes(q)) ||
          getProductName(p).toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(q)))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy, language]);

  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const displayDesc = language === 'ar' ? activeStore.descriptionAr || activeStore.description : activeStore.description;

  // 1. Main Bastiyah Platform Owner Admin Panel (owner.bastiyah.com/admin)
  if (currentPage === 'bastiyah-admin') {
    return (
      <div className={language === 'ar' ? 'font-arabic' : ''}>
        <ToastContainer />
        <BastiyahTopBar />
        <BastiyahOwnerAdmin />
      </div>
    );
  }

  // 2. Bastiyah Public Directory & Hosting Landing Page (bastiyah.com)
  if (currentPage === 'bastiyah-landing') {
    return (
      <div className={language === 'ar' ? 'font-arabic' : ''}>
        <ToastContainer />
        <BastiyahTopBar />
        <BastiyahLandingPage />
      </div>
    );
  }

  // 3. Per-Store Isolated Admin Portal ((storename).bastiyah.com/admin)
  if (currentPage === 'admin') {
    return (
      <div className={language === 'ar' ? 'font-arabic' : ''}>
        <ToastContainer />
        <BastiyahTopBar />
        <AdminLayout />
      </div>
    );
  }

  // 4. Hosted Storefront ((storename).bastiyah.com)
  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-800 ${language === 'ar' ? 'font-arabic' : ''}`}>
      {/* Notifications and Modals */}
      <ToastContainer />
      <ProductQuickViewModal />
      <CartDrawer />

      {/* Bastiyah Platform Subdomain Bar & Store Switcher */}
      <BastiyahTopBar />

      {/* Hosted Store Header */}
      <Header />

      {/* Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <div className="space-y-16">
            <HeroBanner />

            {/* Curated Store Catalog Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                    {language === 'ar'
                      ? `تشكيلة منتجات ${displayStoreName}`
                      : `${displayStoreName} Collection`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {displayDesc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentPage('shop');
                    setSelectedCategory('All');
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold transition-colors"
                  style={{ color: theme.hex }}
                >
                  <span>{t.navShopAll} ({products.length})</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Category Filter and Sorting */}
              <CategoryFilter
                sortBy={sortBy}
                setSortBy={setSortBy}
                resultCount={filteredProducts.length}
              />

              {/* Products Grid */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 mt-8 space-y-3">
                  <p className="font-bold text-slate-700">{language === 'ar' ? 'لا توجد منتجات مطابقة لخيارات البحث' : 'No products matched your criteria'}</p>
                  <p className="text-xs text-slate-400">{language === 'ar' ? 'جرب اختيار تصنيف آخر أو مسح عبارة البحث' : 'Try choosing a different category or clearing search'}</p>
                </div>
              )}
            </div>

            {/* Store Member Promo Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
              <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-slate-800">
                <div className="relative z-10 max-w-xl space-y-4">
                  <span
                    className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider"
                    style={{ backgroundColor: theme.hex }}
                  >
                    {activeStore.slug}.bastiyah.com
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black leading-tight">
                    {language === 'ar'
                      ? `تسوق بثقة من ${displayStoreName}`
                      : `Shop Exclusively at ${displayStoreName}`}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {language === 'ar' 
                      ? `شحن سريع ومجاني للطلبات فوق ${activeStore.settings.currency}${activeStore.settings.freeShippingThreshold} مع ضمان استبدال واسترجاع لمدة 30 يوماً عبر منصة بسطية.`
                      : `Complimentary express dispatch on orders over ${activeStore.settings.currency}${activeStore.settings.freeShippingThreshold} and our 30-day satisfaction guarantee powered by Bastiyah.`}
                  </p>
                  <button
                    onClick={() => {
                      setCurrentPage('shop');
                      setSelectedCategory('All');
                    }}
                    className="px-6 py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg transition-transform hover:scale-102"
                    style={{ backgroundColor: theme.hex }}
                  >
                    {t.heroBrowseCatalog}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900">
                {displayStoreName} — {t.navShopAll}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {displayDesc}
              </p>
            </div>

            <CategoryFilter
              sortBy={sortBy}
              setSortBy={setSortBy}
              resultCount={filteredProducts.length}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <p className="font-bold text-slate-700">{language === 'ar' ? 'لم يتم العثور على أي منتجات' : 'No products found matching your filter'}</p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  {t.catAll}
                </button>
              </div>
            )}
          </div>
        )}

        {currentPage === 'product-detail' && <ProductDetailPage />}
        {currentPage === 'checkout' && <CheckoutPage />}
        {currentPage === 'order-success' && <OrderSuccessPage />}
        {currentPage === 'orders' && <CustomerOrdersPage />}
        {currentPage === 'wishlist' && <WishlistPage />}
      </main>

      {/* Main Footer */}
      <Footer />
    </div>
  );
}

export default App;
