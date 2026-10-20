export type Language = 'en' | 'ar';

export type ProductCategory = 
  | 'All' 
  | 'Audio & Sound' 
  | 'Wearables & Tech' 
  | 'Workspace & Setup' 
  | 'Lifestyle & Travel' 
  | 'Smart Home'
  | 'Perfumes & Oud'
  | 'Fashion & Luxury';

export interface Product {
  id: string;
  sku?: string; // Internal management item code (رمز إدارة المنتج / كود الصنف الداخلي - not visible for customers)
  itemCode?: string;
  name: string;
  nameAr?: string;
  tagline: string;
  taglineAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  featured?: boolean;
  isNew?: boolean;
  badge?: 'Best Seller' | 'New Arrival' | 'Hot Sale' | 'Limited Stock';
  tags: string[];
  specs: Record<string, string>;
  variants?: {
    sizes?: string[];
    colors?: string[];
  };
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  author: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  customer: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'Credit Card' | 'Apple Pay' | 'PayPal' | 'Cash on Delivery' | 'Zain Cash' | 'FastPay' | 'Qi Card';
  trackingNumber?: string;
  courier?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar: string;
  city: string;
  country: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
  isPhoneVerified?: boolean;
}

export interface CustomerUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  state?: string;
  address?: string;
  landmark?: string;
  avatar?: string;
  authenticatedVia: 'whatsapp' | 'sms' | 'phone_auth';
  authenticatedAt: string;
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minSpend: number;
  active: boolean;
  description: string;
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRate: number; // e.g. 0.08 for 8%
  phoneNumber?: string;
  paymentMethods?: {
    cashOnDelivery: boolean;
    creditCard: boolean;
    bankTransfer: boolean;
    applePay: boolean;
  };
  bankDetails?: string;
}

export type StoreThemeColor = 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'violet';

export type StoreLayoutStyle = 'modern-split' | 'luxury-centered' | 'minimal-editorial' | 'vibrant-banner';

export type HeroDisplayMode = 'single' | 'slider';
export type HeroHeight = 'small' | 'medium' | 'large' | 'fullscreen' | 'custom';
export type HeroTransitionEffect = 'slide' | 'fade';
export type HeroTextAlign = 'left' | 'center' | 'right';
export type HeroTextPosition = 'top' | 'center' | 'bottom';
export type HeroImagePosition = 'center' | 'top' | 'bottom' | 'left' | 'right';

export interface HeroSlide {
  id: string;
  enabled: boolean;
  title: string;
  titleAr?: string;
  subtitle?: string;
  subtitleAr?: string;
  badge?: string;
  badgeAr?: string;
  // Images
  desktopImage: string;
  mobileImage?: string;
  imageAlt?: string;
  imagePosition?: HeroImagePosition;
  // Call to Actions
  primaryCtaText?: string;
  primaryCtaTextAr?: string;
  primaryCtaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaTextAr?: string;
  secondaryCtaUrl?: string;
  bannerLinkUrl?: string; // Optional clickable whole banner link
  // Slide-specific appearance overrides
  textAlign?: HeroTextAlign;
  textPosition?: HeroTextPosition;
  textColor?: 'light' | 'dark' | 'custom';
  customTextColor?: string;
  backgroundColor?: string;
  overlayColor?: string;
  overlayOpacity?: number; // 0-100
}

export interface HeroSectionConfig {
  enabled: boolean;
  mode: HeroDisplayMode; // 'single' | 'slider'
  
  // Layout
  fullWidth: boolean;
  height: HeroHeight;
  customHeightPx?: number;
  mobileHeight?: 'small' | 'medium' | 'large' | 'auto';
  roundedCorners: boolean;
  contentMaxWidth: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  spacingTop?: boolean;
  spacingBottom?: boolean;

  // Navigation (Slider mode)
  showArrows: boolean;
  arrowStyle: 'solid' | 'outline' | 'ghost' | 'glass';
  showDots: boolean;
  dotStyle: 'dots' | 'bars' | 'numbers';
  enableSwipe: boolean;

  // Autoplay (Slider mode)
  autoplay: boolean;
  autoplayInterval: number; // ms, e.g. 5000
  transitionEffect: HeroTransitionEffect; // 'slide' | 'fade'
  transitionDuration: number; // ms, e.g. 500
  pauseOnHover: boolean;

  // Global Overlay & Style
  enableOverlay: boolean;
  overlayColor: string;
  overlayOpacity: number; // 0-100
  overlayGradient: boolean;
  
  // Typography & Button Defaults
  headingSize: 'small' | 'medium' | 'large' | 'xl';
  buttonStyle: 'rounded' | 'pill' | 'sharp';
  buttonThemeColor: boolean;

  // Ordered slide records
  slides: HeroSlide[];
}

export interface StoreDesign {
  themeColor: StoreThemeColor;
  layoutStyle: StoreLayoutStyle;
  logoEmoji: string;
  headerStyle: 'light' | 'dark';
  cardRadius: 'rounded' | 'pill' | 'sharp';
  heroBannerUrl?: string;
  customLogoUrl?: string;
  showAnnouncementBar?: boolean;
  announcementText?: string;
  announcementTextAr?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  snapchatUrl?: string;
  heroConfig?: HeroSectionConfig;
}

export interface HostedStore {
  id: string;
  slug: string; // e.g. "panda" -> panda.bastiyah.com
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  description: string;
  descriptionAr: string;
  category: string;
  categoryAr: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  adminPassword?: string;
  status: 'active' | 'maintenance' | 'suspended';
  plan: 'Starter' | 'Growth' | 'Enterprise';
  createdAt: string;
  design: StoreDesign;
  settings: StoreSettings;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  reviews?: ProductReview[];
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export type ActivePage = 
  | 'bastiyah-landing'
  | 'bastiyah-admin'
  | 'home' 
  | 'shop' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'order-success' 
  | 'orders' 
  | 'wishlist' 
  | 'admin';

export type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'design' | 'settings';
