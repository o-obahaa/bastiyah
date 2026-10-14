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
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
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
  paymentMethod: 'Credit Card' | 'Apple Pay' | 'PayPal' | 'Cash on Delivery';
  trackingNumber?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  city: string;
  country: string;
  ordersCount: number;
  totalSpent: number;
  joinedDate: string;
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
}

export type StoreThemeColor = 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan' | 'violet';

export type StoreLayoutStyle = 'modern-split' | 'luxury-centered' | 'minimal-editorial' | 'vibrant-banner';

export interface StoreDesign {
  themeColor: StoreThemeColor;
  layoutStyle: StoreLayoutStyle;
  logoEmoji: string;
  headerStyle: 'light' | 'dark';
  cardRadius: 'rounded' | 'pill' | 'sharp';
  heroBannerUrl?: string;
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
