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

export const ANONYMOUS_USER_AVATAR = 
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="64" fill="%23E2E8F0"/><circle cx="64" cy="50" r="23" fill="%2394A3B8"/><path d="M28 108C28 89.2223 43.2223 74 62 74H66C84.7777 74 100 89.2223 100 108V115C89.6 123.2 77.4 128 64 128C50.6 128 38.4 123.2 28 115V108Z" fill="%2394A3B8"/></svg>';

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
  state?: string;
  address?: string;
  landmark?: string;
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

export interface NotificationSettings {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
  whatsappAlertPhone?: string;
  emailAlertAddress?: string;
}

export interface AdminNotification {
  id: string;
  type: 'new_order' | 'low_stock' | 'system';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
  customerName?: string;
  timestamp: string;
  read: boolean;
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
  notificationSettings?: NotificationSettings;
}

export type StoreThemeColor = 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'violet';

export type StoreLayoutStyle = 'modern-split' | 'luxury-centered' | 'minimal-editorial' | 'vibrant-banner';

export type HeroDisplayMode = 'single' | 'slider';
export type HeroHeight = 'small' | 'medium' | 'large' | 'fullscreen' | 'aspect-banner' | 'custom';
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

export type BadgeIconType =
  | 'truck'
  | 'rotate-ccw'
  | 'shield-check'
  | 'headphones'
  | 'award'
  | 'credit-card'
  | 'clock'
  | 'gift'
  | 'check-circle'
  | 'sparkles'
  | 'lock'
  | 'heart'
  | 'zap';

export interface TrustBadge {
  id: string;
  icon: BadgeIconType;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  enabled: boolean;
}

export type ProductCardSize = 'compact' | 'standard' | 'large' | 'spacious';

export interface StoreDesign {
  themeColor: StoreThemeColor;
  customThemeColor?: string;
  layoutStyle: StoreLayoutStyle;
  logoEmoji: string;
  headerStyle: 'light' | 'dark';
  cardRadius: 'rounded' | 'pill' | 'sharp';
  heroBannerUrl?: string;
  customLogoUrl?: string;
  logoSize?: 'sm' | 'md' | 'lg' | 'xl' | number;
  productCardSize?: ProductCardSize;
  desktopGridCols?: 2 | 3 | 4 | 5 | 6;
  mobileGridCols?: 1 | 2;
  showAnnouncementBar?: boolean;
  announcementText?: string;
  announcementTextAr?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  snapchatUrl?: string;
  heroConfig?: HeroSectionConfig;
  trustBadges?: TrustBadge[];
  showTrustBadges?: boolean;
}

export interface StoreFeaturesConfig {
  reviews: boolean;
  wishlist: boolean;
  heroSlider: boolean;
  deliveryTracking: boolean;
  whatsappOrders: boolean;
  customDiscounts: boolean;
  showBadges: boolean;
  orderTrackingLookup: boolean;
  announcements: boolean;
}

export interface StoreThemeTokens {
  primaryColor: string;
  accentColor?: string;
  fontFamily?: 'sans' | 'serif' | 'mono' | 'heading-display';
  cardBorderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  cardShadow: 'none' | 'sm' | 'md' | 'lg';
  headerLayout: 'standard' | 'minimal' | 'centered';
  footerLayout: 'simple' | 'multi-column' | 'minimal';
}

export const DEFAULT_STORE_FEATURES: StoreFeaturesConfig = {
  reviews: true,
  wishlist: true,
  heroSlider: true,
  deliveryTracking: true,
  whatsappOrders: true,
  customDiscounts: true,
  showBadges: true,
  orderTrackingLookup: true,
  announcements: true,
};

export const DEFAULT_STORE_THEME_TOKENS: StoreThemeTokens = {
  primaryColor: '#059669', // Emerald-600 default
  accentColor: '#10b981',
  fontFamily: 'sans',
  cardBorderRadius: 'xl',
  cardShadow: 'sm',
  headerLayout: 'standard',
  footerLayout: 'simple',
};

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
  logo?: string;
  design: StoreDesign;
  settings: StoreSettings;
  features?: Partial<StoreFeaturesConfig>;
  themeTokens?: Partial<StoreThemeTokens>;
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  reviews?: ProductReview[];
  adminNotifications?: AdminNotification[];
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
  | 'bastiyah-services'
  | 'bastiyah-features'
  | 'bastiyah-how-it-works'
  | 'bastiyah-pricing'
  | 'bastiyah-about'
  | 'bastiyah-faq'
  | 'bastiyah-contact'
  | 'bastiyah-stores'
  | 'bastiyah-apply'
  | 'bastiyah-products'
  | 'bastiyah-legal'
  | 'bastiyah-admin'
  | 'owner-portal'
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
