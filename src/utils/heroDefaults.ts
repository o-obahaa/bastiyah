import { HeroSectionConfig, HeroSlide, HostedStore } from '../types';

export function createDefaultHeroSlide(index = 1): HeroSlide {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    enabled: true,
    title: index === 1 ? 'New Season Arrivals' : 'Exclusive Deals & Offers',
    titleAr: index === 1 ? 'تشكيلة الموسم الجديدة' : 'عروض حصرية وخصومات خاصة',
    subtitle: index === 1 ? 'Discover premium products crafted with precision and passion.' : 'Up to 30% off selected luxury items for a limited time.',
    subtitleAr: index === 1 ? 'اكتشف أرقى المنتجات المصممة بأعلى معايير الجودة والاتقان.' : 'خصم يصل إلى ٣٠٪ على منتجات مختارة لفترة محدودة.',
    badge: index === 1 ? 'New Collection' : 'Special Offer',
    badgeAr: index === 1 ? 'وصل حديثاً' : 'عرض خاص',
    desktopImage: index === 1
      ? 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80',
    primaryCtaText: 'Shop Now',
    primaryCtaTextAr: 'تسوق الآن',
    primaryCtaUrl: 'shop',
    secondaryCtaText: 'Explore More',
    secondaryCtaTextAr: 'استكشف المزيد',
    secondaryCtaUrl: 'shop',
    textAlign: 'center',
    textPosition: 'center',
    textColor: 'light',
    overlayOpacity: 45,
  };
}

export function createDefaultHeroConfig(store?: HostedStore): HeroSectionConfig {
  const storeNameAr = store?.nameAr || store?.name || 'متجرنا';
  const storeName = store?.name || 'Our Store';
  const storeTaglineAr = store?.taglineAr || store?.tagline || 'أفضل المنتجات بأفضل الأسعار';
  const storeTagline = store?.tagline || 'Premium Quality Products';

  const firstSlideImage = store?.products?.[0]?.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80';
  const secondSlideImage = store?.products?.[1]?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80';

  return {
    enabled: true,
    mode: 'slider',
    fullWidth: false,
    height: 'aspect-banner',
    roundedCorners: true,
    contentMaxWidth: 'xl',
    spacingTop: true,
    spacingBottom: false,
    showArrows: true,
    arrowStyle: 'glass',
    showDots: true,
    dotStyle: 'dots',
    enableSwipe: true,
    autoplay: true,
    autoplayInterval: 5000,
    transitionEffect: 'slide',
    transitionDuration: 500,
    pauseOnHover: true,
    enableOverlay: true,
    overlayColor: '#090d16',
    overlayOpacity: 40,
    overlayGradient: true,
    headingSize: 'large',
    buttonStyle: 'rounded',
    buttonThemeColor: true,
    slides: [
      {
        id: `slide-${store?.id || 'demo'}-1`,
        enabled: true,
        title: storeTagline,
        titleAr: storeTaglineAr,
        subtitle: `Welcome to ${storeName}. Exceptional craftsmanship and curated luxury goods.`,
        subtitleAr: `مرحباً بك في ${storeNameAr}. تجربة تسوق استثنائية مع خيارات راقية وتوصيل سريع.`,
        badge: 'Featured Collection',
        badgeAr: 'التشكيلة المميزة',
        desktopImage: firstSlideImage,
        primaryCtaText: 'Shop Catalog',
        primaryCtaTextAr: 'تصفح الكتالوج',
        primaryCtaUrl: 'shop',
        secondaryCtaText: 'Best Sellers',
        secondaryCtaTextAr: 'الأكثر طلباً',
        secondaryCtaUrl: 'shop',
        textAlign: 'center',
        textPosition: 'center',
        textColor: 'light',
        overlayOpacity: 40,
      },
      {
        id: `slide-${store?.id || 'demo'}-2`,
        enabled: true,
        title: 'Limited Exclusive Edition',
        titleAr: 'إصدارات حصرية محدودة',
        subtitle: 'Handpicked products guaranteed for superior quality and performance.',
        subtitleAr: 'مختارات من أفضل منتجاتنا بجودة مضمونة وضمان استرجاع مرن.',
        badge: 'Special Offer',
        badgeAr: 'عرض خاص',
        desktopImage: secondSlideImage,
        primaryCtaText: 'Order Today',
        primaryCtaTextAr: 'اطلب اليوم',
        primaryCtaUrl: 'shop',
        textAlign: 'center',
        textPosition: 'center',
        textColor: 'light',
        overlayOpacity: 45,
      },
    ],
  };
}
