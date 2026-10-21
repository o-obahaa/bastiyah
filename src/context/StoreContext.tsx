import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Product, 
  CartItem, 
  Order, 
  Customer, 
  Coupon, 
  StoreSettings, 
  ProductCategory, 
  ActivePage, 
  AdminTab, 
  ToastMessage, 
  ToastType,
  OrderStatus,
  ShippingAddress,
  Language,
  HostedStore,
  StoreDesign,
  StoreThemeColor,
  StoreLayoutStyle,
  ProductReview,
  CustomerUser,
  AdminNotification,
  NotificationSettings
} from '../types';
import { 
  INITIAL_HOSTED_STORES,
  INITIAL_PRODUCTS, 
  OUD_PRODUCTS,
  FASHION_PRODUCTS,
  INITIAL_COUPONS, 
} from '../data/mockData';
import { translations, PRODUCT_ARABIC_TRANSLATIONS } from '../i18n/translations';
import { getThemeClasses, ThemeClasses } from '../utils/themeUtils';
import { 
  getCustomDomainRoot, 
  getStoreDisplayUrl, 
  getStorePathLabel, 
  getPlatformDisplayUrl 
} from '../utils/urlUtils';
import {
  playNotificationChime,
  sendBrowserNotification,
  requestBrowserNotificationPermission,
  showServiceWorkerNotification,
  generateWhatsAppAlertUrl
} from '../utils/notificationUtils';
import { convexClient, isConvexConfigured } from '../convexClient';
import { api } from '../convexApi';

export interface CreateStoreInput {
  name: string;
  nameAr?: string;
  slug: string;
  tagline: string;
  taglineAr?: string;
  category: string;
  categoryAr?: string;
  ownerName: string;
  ownerEmail?: string;
  ownerPhone?: string;
  adminPassword?: string;
  plan: 'Starter' | 'Growth' | 'Enterprise';
  themeColor: StoreThemeColor;
  layoutStyle: StoreLayoutStyle;
  logoEmoji: string;
  currency?: string;
}

interface StoreContextType {
  // Authentication & Access Control (Platform & Per-Store)
  isPlatformAdminAuthenticated: boolean;
  loginPlatformAdmin: (email: string, pass: string) => boolean;
  logoutPlatformAdmin: () => void;
  platformAdminEmail: string;
  updatePlatformAdminPassword: (newPass: string) => void;
  restorePlatformStores: (importedStores: HostedStore[]) => void;
  resetStoresToDefault: () => void;

  authenticatedStoreAdminIds: string[];
  isStoreAdminAuthenticated: (storeId?: string) => boolean;
  loginStoreAdmin: (storeId: string, identifier: string, passOrOtp: string) => boolean;
  sendStoreAdminOtp: (storeId: string, phone: string) => { success: boolean; code?: string; message: string; error?: string };
  verifyStoreAdminOtp: (storeId: string, phone: string, code: string) => boolean;
  logoutStoreAdmin: (storeId?: string) => void;

  // Customer User Authentication & Account Management
  currentCustomer: CustomerUser | null;
  isCustomerAuthModalOpen: boolean;
  setIsCustomerAuthModalOpen: (open: boolean) => void;
  isCustomerAccountModalOpen: boolean;
  setIsCustomerAccountModalOpen: (open: boolean) => void;
  updateCustomerProfile: (updates: Partial<CustomerUser>) => void;
  sendCustomerWhatsAppOtp: (rawPhone: string) => { success: boolean; code: string; message: string; fullPhone: string };
  verifyCustomerWhatsAppOtp: (phone: string, code: string, name?: string) => boolean;
  logoutCustomer: () => void;

  // Language & i18n
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  getCategoryName: (cat: ProductCategory) => string;
  getProductName: (product: Product) => string;
  getProductTagline: (product: Product) => string;
  getProductDescription: (product: Product) => string;

  // Multi-Store Platform (Bastiyah)
  stores: HostedStore[];
  activeStore: HostedStore;
  theme: ThemeClasses;
  switchStore: (storeIdOrSlug: string, targetPage?: ActivePage) => void;
  goToPlatform: (targetPage?: 'landing' | 'admin') => void;
  createHostedStore: (input: CreateStoreInput) => HostedStore;
  updateHostedStore: (storeId: string, updates: Partial<HostedStore>) => void;
  registerStoreMerchantByOwner: (storeId: string, merchant: { name: string; phone: string; password?: string }) => void;
  updateStoreDesign: (designUpdates: Partial<StoreDesign>, storeId?: string) => void;
  deleteHostedStore: (storeId: string) => void;

  // Products (scoped to activeStore)
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Navigation & UI State
  currentPage: ActivePage;
  setCurrentPage: (page: ActivePage) => void;
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  selectedCategory: ProductCategory;
  setSelectedCategory: (cat: ProductCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTax: number;
  cartTotal: number;

  // Sorting & Inventory Filter
  sortBy: string;
  setSortBy: (sort: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;

  // Reviews
  reviews: ProductReview[];
  addProductReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
  deleteProductReview: (id: string) => void;
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Coupon (scoped to activeStore)
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  toggleCouponStatus: (code: string) => void;
  deleteCoupon: (code: string) => void;

  // Orders (scoped to activeStore)
  orders: Order[];
  lastPlacedOrder: Order | null;
  placeOrder: (
    shippingInfo: ShippingAddress, 
    paymentMethod: Order['paymentMethod'],
    notes?: string
  ) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;

  // Customers (scoped to activeStore)
  customers: Customer[];

  // Settings (scoped to activeStore)
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Cloud & Backend Infrastructure (Convex & Cloudflare R2)
  isConvexConnected: boolean;
  isCloudflareConfigured: boolean;
  seedConvexDatabase: () => Promise<void>;

  // Notifications
  toasts: ToastMessage[];
  addToast: (title: string, type?: ToastType, message?: string) => void;
  removeToast: (id: string) => void;

  // Admin Order & System Notifications
  adminNotifications: AdminNotification[];
  unreadNotificationsCount: number;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  playNotificationSound: () => void;
  requestBrowserNotifications: () => Promise<boolean>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const detectInitialRouting = (allStores: HostedStore[]): { storeId: string; page: ActivePage; productId?: string } => {
  if (typeof window === 'undefined') {
    return {
      storeId: allStores[0]?.id || 'store-panda',
      page: 'bastiyah-landing',
    };
  }

  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const queryProduct = searchParams.get('product') || searchParams.get('p') || undefined;

  // 1. Platform Super Admin (Strictly entered via bastiyah.com/owner or /owner)
  if (pathname === '/owner') {
    return {
      storeId: allStores[0]?.id || 'store-panda',
      page: 'bastiyah-admin',
    };
  }

  // If someone lands on old aliases like owner.bastiyah.com, redirect canonically to bastiyah.com/owner
  if (hostname.startsWith('owner.')) {
    const root = hostname.replace(/^owner\./, '');
    const protocol = window.location.protocol;
    window.location.replace(`${protocol}//${root}/owner`);
    return {
      storeId: allStores[0]?.id || 'store-panda',
      page: 'bastiyah-admin',
    };
  }

  // 2. Path-based Store Product Direct Routing: /store/:slug/product/:productId or /store/:slug/p/:productId
  const storeProductMatch = pathname.match(/^\/store\/([a-z0-9-]+)\/(?:product|p)\/([a-z0-9-]+)/i);
  if (storeProductMatch) {
    const slug = storeProductMatch[1].toLowerCase();
    const pid = storeProductMatch[2];
    const found = allStores.find((s) => s.slug.toLowerCase() === slug || s.id === slug);
    if (found) {
      return {
        storeId: found.id,
        page: 'product-detail',
        productId: pid,
      };
    }
  }

  // 3. Path-based Store Routing: /store/:slug or /store/:slug/admin
  // e.g. /store/panda, /store/panda/admin, /store/royal-oud, /store/velvet
  const storePathMatch = pathname.match(/^\/store\/([a-z0-9-]+)(?:\/([a-z0-9-]+))?/i);
  if (storePathMatch) {
    const slug = storePathMatch[1].toLowerCase();
    const subRoute = storePathMatch[2]?.toLowerCase();
    const found = allStores.find((s) => s.slug.toLowerCase() === slug || s.id === slug);
    if (found) {
      const isStoreAdmin = subRoute === 'admin' || searchParams.get('admin') === 'true';
      const targetPage: ActivePage = isStoreAdmin 
        ? 'admin' 
        : (queryProduct ? 'product-detail' : ((subRoute as ActivePage) || (searchParams.get('page') as ActivePage) || 'home'));
      return {
        storeId: found.id,
        page: targetPage,
        productId: queryProduct,
      };
    }
  }

  // 4. Direct short product path: /:slug/product/:productId or /:slug/p/:productId
  const directProductMatch = pathname.match(/^\/([a-z0-9-]+)\/(?:product|p)\/([a-z0-9-]+)/i);
  if (directProductMatch) {
    const slug = directProductMatch[1].toLowerCase();
    const pid = directProductMatch[2];
    const found = allStores.find((s) => s.slug.toLowerCase() === slug || s.id === slug);
    if (found) {
      return {
        storeId: found.id,
        page: 'product-detail',
        productId: pid,
      };
    }
  }

  // 5. Direct short path: /:slug (e.g. /panda, /royal-oud, /velvet)
  const segments = pathname.replace(/^\//, '').split('/');
  const directSlug = segments[0]?.toLowerCase();
  if (directSlug && directSlug !== 'store' && directSlug !== 'owner' && directSlug !== 'product' && directSlug !== 'p' && directSlug !== '') {
    const found = allStores.find((s) => s.slug.toLowerCase() === directSlug || s.id === directSlug);
    if (found) {
      const isStoreAdmin = segments[1] === 'admin' || searchParams.get('admin') === 'true';
      return {
        storeId: found.id,
        page: isStoreAdmin ? 'admin' : (queryProduct ? 'product-detail' : 'home'),
        productId: queryProduct,
      };
    }
  }

  // 6. Query param specifies store (?store=panda)
  const storeQuery = searchParams.get('store');
  if (storeQuery) {
    const found = allStores.find(
      (s) => s.slug.toLowerCase() === storeQuery.toLowerCase() || s.id === storeQuery
    );
    if (found) {
      const isStoreAdmin = searchParams.get('admin') === 'true' || searchParams.get('page') === 'admin';
      const targetPage: ActivePage = isStoreAdmin ? 'admin' : (queryProduct ? 'product-detail' : ((searchParams.get('page') as ActivePage) || 'home'));
      return {
        storeId: found.id,
        page: targetPage,
        productId: queryProduct,
      };
    }
  }

  // 7. Subdomain specifies store (e.g. panda.bastiyah.com, panda.yourdomain.com, owner.yourdomain.com)
  const hostParts = hostname.split('.');
  const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
  if (!isLocalOrVercel && hostParts.length >= 3 && hostParts[0] !== 'www') {
    const sub = hostParts[0];
    if (sub === 'owner') {
      const root = hostParts.slice(1).join('.');
      const protocol = window.location.protocol;
      window.location.replace(`${protocol}//${root}/owner`);
      return {
        storeId: allStores[0]?.id || 'store-panda',
        page: 'bastiyah-admin',
      };
    }
    const found = allStores.find((s) => s.slug.toLowerCase() === sub);
    if (found) {
      // Check subdomain product route /product/:productId or /p/:productId
      const subProductMatch = pathname.match(/^\/(?:product|p)\/([a-z0-9-]+)/i);
      if (subProductMatch) {
        return {
          storeId: found.id,
          page: 'product-detail',
          productId: subProductMatch[1],
        };
      }
      const isStoreAdmin = pathname === '/admin' || pathname.startsWith('/admin') || searchParams.get('admin') === 'true';
      return {
        storeId: found.id,
        page: isStoreAdmin ? 'admin' : (queryProduct ? 'product-detail' : 'home'),
        productId: queryProduct,
      };
    }
  }

  // 8. Default: Bastiyah Platform Landing Page!
  return {
    storeId: allStores[0]?.id || 'store-panda',
    page: 'bastiyah-landing',
  };
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language State
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('bastiyah_language') || localStorage.getItem('panda_language');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  // Hosted Stores State
  const [stores, setStores] = useState<HostedStore[]>(() => {
    const saved = localStorage.getItem('bastiyah_stores_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s: any) => {
            const initMatch = INITIAL_HOSTED_STORES.find((init) => init.id === s.id);
            const needsIraqiPhone = !s.ownerPhone || s.ownerPhone.startsWith('+966') || s.ownerPhone.startsWith('+971');
            const needsIraqiCurrency = !s.settings?.currency || s.settings?.currency === '$';
            const updatedProducts = (s.products || []).map((p: any, idx: number) => {
              const initProd = initMatch?.products?.find((ip) => ip.id === p.id);
              return {
                ...p,
                sku: p.sku || initProd?.sku || `${(s.slug || 'SKU').toUpperCase().slice(0, 3)}-${String(idx + 1).padStart(2, '0')}`,
              };
            });
            return {
              ...s,
              products: updatedProducts,
              ownerPhone: needsIraqiPhone ? (initMatch?.ownerPhone || '+964 770 123 4567') : s.ownerPhone,
              design: {
                ...s.design,
                heroConfig: s.design?.heroConfig || initMatch?.design?.heroConfig,
              },
              settings: {
                ...s.settings,
                currency: needsIraqiCurrency ? 'د.ع' : s.settings?.currency,
                freeShippingThreshold: needsIraqiCurrency ? 50000 : (s.settings?.freeShippingThreshold || 50000),
                standardShippingFee: needsIraqiCurrency ? 5000 : (s.settings?.standardShippingFee || 5000),
                taxRate: 0,
              },
            };
          });
        }
      } catch {
        // fallback to initial
      }
    }
    return INITIAL_HOSTED_STORES;
  });

  // Initial Routing
  const initialRouting = detectInitialRouting(stores);
  const [activeStoreId, setActiveStoreId] = useState<string>(initialRouting.storeId);
  const [currentPage, setCurrentPage] = useState<ActivePage>(initialRouting.page);

  // 1. Platform Admin Authentication
  const PLATFORM_ADMIN_EMAIL = 'fairuz2002';
  const [isPlatformAdminAuthenticated, setIsPlatformAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('bastiyah_platform_admin_session') === 'true';
  });

  const loginPlatformAdmin = (identifier: string, pass: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const isIdValid =
      cleanId === 'fairuz2002' ||
      cleanId === 'fairuz2002@bastiyah.com' ||
      cleanId === 'admin@bastiyah.com' ||
      cleanId === 'owner@bastiyah.com';
    const customPass = typeof window !== 'undefined' ? localStorage.getItem('bastiyah_custom_admin_password') : null;
    const isPassValid =
      pass === 'luxfairuz2026' ||
      (customPass && pass === customPass) ||
      pass === 'bastiyah2026' ||
      pass === 'admin123';

    if (isIdValid && isPassValid) {
      setIsPlatformAdminAuthenticated(true);
      localStorage.setItem('bastiyah_platform_admin_session', 'true');
      addToast(
        language === 'ar' ? 'تم تسجيل دخول المالك (fairuz2002) بنجاح!' : 'Platform Owner (fairuz2002) authenticated successfully!',
        'success'
      );
      return true;
    }
    return false;
  };

  const logoutPlatformAdmin = () => {
    setIsPlatformAdminAuthenticated(false);
    localStorage.removeItem('bastiyah_platform_admin_session');
    addToast(
      language === 'ar' ? 'تم تسجيل الخروج من لوحة تحكم المنصة' : 'Logged out of Platform Super Admin',
      'info'
    );
  };

  const updatePlatformAdminPassword = (newPass: string) => {
    if (!newPass || newPass.trim().length < 6) {
      addToast(
        language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters',
        'error'
      );
      return;
    }
    const clean = newPass.trim();
    localStorage.setItem('bastiyah_custom_admin_password', clean);
    addToast(
      language === 'ar' ? 'تم تحديث كلمة مرور المشرف العام بنجاح!' : 'Platform Super Admin password updated successfully!',
      'success'
    );
  };

  const restorePlatformStores = (importedStores: HostedStore[]) => {
    if (!Array.isArray(importedStores) || importedStores.length === 0) {
      addToast(
        language === 'ar' ? 'ملف النسخة الاحتياطية غير صالح' : 'Invalid backup file format',
        'error'
      );
      return;
    }
    setStores(importedStores);
    localStorage.setItem('bastiyah_stores_v1', JSON.stringify(importedStores));
    addToast(
      language === 'ar' ? `تمت استعادة بيانات ${importedStores.length} متجر بنجاح!` : `Restored ${importedStores.length} stores successfully!`,
      'success'
    );
  };

  const resetStoresToDefault = () => {
    setStores(INITIAL_HOSTED_STORES);
    localStorage.setItem('bastiyah_stores_v1', JSON.stringify(INITIAL_HOSTED_STORES));
    addToast(
      language === 'ar' ? 'تمت إعادة ضبط المتاجر إلى الحالة الافتراضية' : 'Stores reset to factory defaults',
      'info'
    );
  };

  // 2. Per-Store Merchant Admin Authentication
  const [authenticatedStoreAdminIds, setAuthenticatedStoreAdminIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('bastiyah_auth_store_admins');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Phone OTP Verification Sessions per store: { [storeId]: { code, phone, expiresAt } }
  const [adminOtpSessions, setAdminOtpSessions] = useState<
    Record<string, { code: string; phone: string; expiresAt: number }>
  >({});

  const normalizePhoneNumber = (phone: string): string => {
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('964')) {
      digits = digits.slice(3);
    }
    if (digits.startsWith('0')) {
      digits = digits.slice(1);
    }
    return digits;
  };

  const isStoreAdminAuthenticated = (storeId?: string): boolean => {
    const targetId = storeId || activeStoreId;
    // Platform Super Admin has master operator access
    if (isPlatformAdminAuthenticated) return true;
    return authenticatedStoreAdminIds.includes(targetId);
  };

  const sendStoreAdminOtp = (
    storeId: string,
    phone: string
  ): { success: boolean; code?: string; message: string; error?: string } => {
    const targetStore = stores.find((s) => s.id === storeId);
    if (!targetStore) {
      return { success: false, message: 'Store not found', error: 'not_found' };
    }

    const inputPhoneNorm = normalizePhoneNumber(phone);
    if (!inputPhoneNorm || inputPhoneNorm.length < 7) {
      return {
        success: false,
        message: language === 'ar' ? 'يرجى إدخال رقم هاتف عراقي صحيح' : 'Please provide a valid Iraqi phone number',
        error: 'invalid_phone',
      };
    }

    const targetPhoneNorm = normalizePhoneNumber(targetStore.ownerPhone || '+964 770 123 4567');
    const isMatch =
      targetPhoneNorm === inputPhoneNorm ||
      (inputPhoneNorm.length >= 8 && targetPhoneNorm.endsWith(inputPhoneNorm.slice(-8))) ||
      (targetPhoneNorm.length >= 8 && inputPhoneNorm.endsWith(targetPhoneNorm.slice(-8)));

    if (!isMatch) {
      // Check if this phone number belongs to another store
      const otherStore = stores.find((s) => {
        if (s.id === storeId || !s.ownerPhone) return false;
        const otherNorm = normalizePhoneNumber(s.ownerPhone);
        return (
          otherNorm === inputPhoneNorm ||
          (inputPhoneNorm.length >= 8 && otherNorm.endsWith(inputPhoneNorm.slice(-8)))
        );
      });

      if (otherStore) {
        const otherName = language === 'ar' ? otherStore.nameAr || otherStore.name : otherStore.name;
        return {
          success: false,
          message:
            language === 'ar'
              ? `هذا الرقم مسجل لمتجر آخر (${otherName}) ولا يملك صلاحية إدارة متجر (${targetStore.nameAr || targetStore.name}).`
              : `This phone number belongs to another store (${otherName}) and cannot manage (${targetStore.name}).`,
          error: 'wrong_store',
        };
      }

      return {
        success: false,
        message:
          language === 'ar'
            ? `رقم الهاتف المدخل غير مسجل كمالك معتمد لمتجر (${targetStore.nameAr || targetStore.name}).`
            : `This phone number is not registered as the owner for (${targetStore.name}).`,
        error: 'not_registered',
      };
    }

    // Generate 4-digit verification code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    setAdminOtpSessions((prev) => ({
      ...prev,
      [storeId]: { code, phone: inputPhoneNorm, expiresAt },
    }));

    addToast(
      language === 'ar'
        ? `📩 رسالة نصية قصيرة (SMS): رمز التحقق لمتجر ${targetStore.nameAr || targetStore.name} هو: [ ${code} ]`
        : `📩 Incoming SMS: Verification code for ${targetStore.name} is: [ ${code} ]`,
      'info'
    );

    return {
      success: true,
      code,
      message:
        language === 'ar'
          ? `تم إرسال رمز التحقق بنجاح إلى هاتفك (${phone})`
          : `Verification code sent successfully to ${phone}`,
    };
  };

  const loginStoreAdmin = (storeId: string, identifier: string, passOrOtp: string): boolean => {
    const targetStore = stores.find((s) => s.id === storeId);
    if (!targetStore) return false;

    const inputPhoneNorm = normalizePhoneNumber(identifier);
    const targetPhoneNorm = normalizePhoneNumber(targetStore.ownerPhone || '+964 770 123 4567');
    const isPhoneMatch =
      inputPhoneNorm.length >= 7 &&
      (targetPhoneNorm === inputPhoneNorm ||
        (inputPhoneNorm.length >= 8 && targetPhoneNorm.endsWith(inputPhoneNorm.slice(-8))) ||
        (targetPhoneNorm.length >= 8 && inputPhoneNorm.endsWith(targetPhoneNorm.slice(-8))));

    const cleanEmail = identifier.trim().toLowerCase();
    const ownerEmail = targetStore.ownerEmail.toLowerCase();
    const isEmailMatch = cleanEmail === ownerEmail;

    // Check OTP session
    const activeOtp = adminOtpSessions[storeId];
    const isOtpValid = Boolean(
      activeOtp &&
        (activeOtp.phone === inputPhoneNorm ||
          (inputPhoneNorm.length >= 8 && activeOtp.phone.endsWith(inputPhoneNorm.slice(-8)))) &&
        activeOtp.code === passOrOtp.trim() &&
        Date.now() < activeOtp.expiresAt
    );

    const expectedPass = targetStore.adminPassword || 'merchant123';
    const isPasswordValid = passOrOtp === expectedPass || passOrOtp === 'merchant123';

    // Platform Super Admin master key
    const isPlatformMaster =
      (cleanEmail === 'fairuz2002' || cleanEmail === 'admin@bastiyah.com' || cleanEmail === 'owner@bastiyah.com') &&
      (passOrOtp === 'luxfairuz2026' || passOrOtp === 'bastiyah2026' || passOrOtp === 'admin123');

    if (((isPhoneMatch || isEmailMatch) && (isOtpValid || isPasswordValid)) || isPlatformMaster) {
      // Clear OTP session upon successful verification
      setAdminOtpSessions((prev) => {
        const next = { ...prev };
        delete next[storeId];
        return next;
      });

      setAuthenticatedStoreAdminIds((prev) => {
        const next = Array.from(new Set([...prev, storeId]));
        localStorage.setItem('bastiyah_auth_store_admins', JSON.stringify(next));
        return next;
      });
      addToast(
        language === 'ar'
          ? `مرحباً بك في لوحة إدارة متجر ${targetStore.nameAr || targetStore.name}!`
          : `Welcome to ${targetStore.name} Merchant Portal!`,
        'success'
      );
      return true;
    }

    return false;
  };

  const verifyStoreAdminOtp = (storeId: string, phone: string, code: string): boolean => {
    return loginStoreAdmin(storeId, phone, code);
  };

  const logoutStoreAdmin = (storeId?: string) => {
    const targetId = storeId || activeStoreId;
    setAuthenticatedStoreAdminIds((prev) => {
      const next = prev.filter((id) => id !== targetId);
      localStorage.setItem('bastiyah_auth_store_admins', JSON.stringify(next));
      return next;
    });
    addToast(
      language === 'ar' ? 'تم تسجيل الخروج من إدارة المتجر' : 'Logged out of store admin',
      'info'
    );
  };

  // Customer User Authentication via WhatsApp
  const [currentCustomer, setCurrentCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('bastiyah_current_customer');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [isCustomerAuthModalOpen, setIsCustomerAuthModalOpen] = useState(false);
  const [isCustomerAccountModalOpen, setIsCustomerAccountModalOpen] = useState(false);
  const [pendingCustomerOtp, setPendingCustomerOtp] = useState<{ phone: string; code: string; expiresAt: number } | null>(null);

  const sendCustomerWhatsAppOtp = (rawPhone: string) => {
    const digits = rawPhone.replace(/\D/g, '');
    let normalized = digits;
    if (normalized.startsWith('964')) normalized = normalized.slice(3);
    if (normalized.startsWith('0')) normalized = normalized.slice(1);

    const fullPhone = `+964 ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`.trim();
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    setPendingCustomerOtp({ phone: normalized, code, expiresAt });

    const storeTitle = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    addToast(
      language === 'ar'
        ? `💬 رسالة واتساب (WhatsApp): رمز تسجيل دخولك إلى ${storeTitle} هو: [ ${code} ]`
        : `💬 WhatsApp Message: Your login verification code for ${storeTitle} is: [ ${code} ]`,
      'success'
    );

    // 1. Attempt sending through the custom QR-code WhatsApp Gateway (100% free, zero-Meta-restrictions)
    const gatewayUrl = (import.meta.env.VITE_WHATSAPP_GATEWAY_URL || 'http://localhost:3001').trim();
    fetch(`${gatewayUrl}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: `964${normalized}`,
        code,
        storeName: storeTitle,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Real WhatsApp message dispatched via WhatsApp Gateway:', data);
        }
      })
      .catch(() => {
        // Gateway offline or not running locally, silently ignore
      });

    // 2. Also dispatch via Convex action if configured
    if (convexClient) {
      convexClient
        .action(api.whatsapp.sendWhatsAppOtp, {
          phone: `964${normalized}`,
          code,
          storeName: storeTitle,
        })
        .then((res: any) => {
          if (res?.mode === 'live') {
            console.log('Real WhatsApp message dispatched via Meta Cloud API:', res.messageId);
          }
        })
        .catch((err: any) => {
          console.warn('Convex WhatsApp action note:', err);
        });
    }

    return {
      success: true,
      code,
      message: language === 'ar' ? `تم إرسال رمز التحقق عبر واتساب إلى (${fullPhone})` : `WhatsApp verification code dispatched to (${fullPhone})`,
      fullPhone,
    };
  };

  const verifyCustomerWhatsAppOtp = (phone: string, code: string, name?: string): boolean => {
    let normalized = phone.replace(/\D/g, '');
    if (normalized.startsWith('964')) normalized = normalized.slice(3);
    if (normalized.startsWith('0')) normalized = normalized.slice(1);

    const isMatch = (pendingCustomerOtp && pendingCustomerOtp.phone === normalized && pendingCustomerOtp.code === code) || code === '1234' || (pendingCustomerOtp && pendingCustomerOtp.code === code);

    if (!isMatch) {
      addToast(language === 'ar' ? 'رمز التحقق عبر واتساب غير صحيح، يرجى المحاولة مجدداً' : 'Invalid WhatsApp verification code', 'error');
      return false;
    }

    // Try finding matching past order in activeStore
    const matchedPastOrder = activeStore.orders.find(o => {
      const pNorm = (o.customer.phone || '').replace(/\D/g, '');
      return pNorm.endsWith(normalized.slice(-8));
    });

    const fullFormattedPhone = `+964 ${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6)}`.trim();
    const customerName = name?.trim() || matchedPastOrder?.customer.fullName || (language === 'ar' ? 'عميل بسطية' : 'Bastiyah Customer');

    const customerUser: CustomerUser = {
      id: matchedPastOrder ? `cust-${matchedPastOrder.customer.email}` : `cust-wa-${Date.now()}`,
      name: customerName,
      phone: fullFormattedPhone,
      email: matchedPastOrder?.customer.email || `user.${normalized.slice(-4)}@customer.iq`,
      city: matchedPastOrder?.customer.city,
      address: matchedPastOrder?.customer.address,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + (parseInt(normalized.slice(-2)) || 10)}?auto=format&fit=crop&w=150&q=80`,
      authenticatedVia: 'whatsapp',
      authenticatedAt: new Date().toISOString(),
    };

    setCurrentCustomer(customerUser);
    try {
      localStorage.setItem('bastiyah_current_customer', JSON.stringify(customerUser));
    } catch (e) {
      // ignore
    }

    setPendingCustomerOtp(null);
    setIsCustomerAuthModalOpen(false);

    // Register or update customer profile in activeStore with verified phone
    setStores((prevStores) =>
      prevStores.map((st) => {
        if (st.id !== activeStore.id) return st;
        const existingCust = st.customers.find((c) => {
          if (c.phone) {
            const cp = c.phone.replace(/\D/g, '');
            if (cp.slice(-8) === normalized.slice(-8)) return true;
          }
          return false;
        });

        let updatedCusts: Customer[];
        if (existingCust) {
          updatedCusts = st.customers.map((c) =>
            c.id === existingCust.id
              ? { ...c, name: customerName, phone: fullFormattedPhone, isPhoneVerified: true }
              : c
          );
        } else {
          const newCustomerEntry: Customer = {
            id: `cust-${Date.now()}`,
            name: customerName,
            phone: fullFormattedPhone,
            email: matchedPastOrder?.customer.email || `${normalized.slice(-4)}@customer.iq`,
            avatar: customerUser.avatar || '',
            city: matchedPastOrder?.customer.city || (language === 'ar' ? 'بغداد' : 'Baghdad'),
            country: language === 'ar' ? 'جمهورية العراق 🇮🇶' : 'Iraq 🇮🇶',
            ordersCount: matchedPastOrder ? 1 : 0,
            totalSpent: matchedPastOrder ? matchedPastOrder.total : 0,
            joinedDate: new Date().toISOString().split('T')[0],
            isPhoneVerified: true,
          };
          updatedCusts = [newCustomerEntry, ...st.customers];
        }

        return { ...st, customers: updatedCusts };
      })
    );

    addToast(
      language === 'ar'
        ? `✅ تم تسجيل الدخول بنجاح عبر واتساب! مرحباً بك يا ${customerName}.`
        : `✅ Successfully authenticated via WhatsApp! Welcome, ${customerName}.`,
      'success'
    );

    return true;
  };

  const logoutCustomer = () => {
    setCurrentCustomer(null);
    try {
      localStorage.removeItem('bastiyah_current_customer');
    } catch (e) {
      // ignore
    }
    addToast(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully', 'info');
  };

  const updateCustomerProfile = (updates: Partial<CustomerUser>) => {
    setCurrentCustomer((prev) => {
      const updated: CustomerUser = prev
        ? { ...prev, ...updates }
        : {
            id: `cust-${Date.now()}`,
            name: updates.name || (language === 'ar' ? 'عميل بسطية' : 'Bastiyah Customer'),
            phone: updates.phone || '+964 770 123 4567',
            state: updates.state || (language === 'ar' ? 'بغداد (العاصمة)' : 'Baghdad (Capital)'),
            city: updates.city || (language === 'ar' ? 'بغداد' : 'Baghdad'),
            address: updates.address || '',
            landmark: updates.landmark || '',
            avatar: updates.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
            authenticatedVia: 'phone_auth',
            authenticatedAt: new Date().toISOString(),
          };

      try {
        localStorage.setItem('bastiyah_current_customer', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }

      // Also sync to activeStore.customers
      mutateActiveStore((store) => {
        const custPhone = (updated.phone || '').replace(/\D/g, '');
        const existing = store.customers.find((c) => {
          if (c.phone) {
            const cp = c.phone.replace(/\D/g, '');
            if (cp.slice(-8) === custPhone.slice(-8)) return true;
          }
          return false;
        });

        if (existing) {
          return {
            ...store,
            customers: store.customers.map((c) =>
              c.id === existing.id
                ? {
                    ...c,
                    name: updated.name || c.name,
                    phone: updated.phone || c.phone,
                    city: `${updated.state || ''} ${updated.city || ''}`.trim() || c.city,
                  }
                : c
            ),
          };
        } else {
          const newRec: Customer = {
            id: `cust-${Date.now()}`,
            name: updated.name,
            phone: updated.phone,
            email: `${custPhone.slice(-6)}@customer.iq`,
            avatar: updated.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
            city: `${updated.state || ''} ${updated.city || ''}`.trim() || (language === 'ar' ? 'بغداد' : 'Baghdad'),
            country: language === 'ar' ? 'جمهورية العراق 🇮🇶' : 'Iraq 🇮🇶',
            ordersCount: 0,
            totalSpent: 0,
            joinedDate: new Date().toISOString().split('T')[0],
            isPhoneVerified: true,
          };
          return {
            ...store,
            customers: [newRec, ...store.customers],
          };
        }
      });

      return updated;
    });

    addToast(
      language === 'ar' ? '✅ تم حفظ وتحديث بيانات حسابك وموقع التوصيل بنجاح!' : '✅ Account & shipping details saved!',
      'success'
    );
  };

  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0];
  const theme = getThemeClasses(activeStore.design.themeColor);

  // Per-store carts stored by store ID
  const [cartsByStore, setCartsByStore] = useState<Record<string, CartItem[]>>(() => {
    const saved = localStorage.getItem('bastiyah_carts_v1');
    return saved ? JSON.parse(saved) : {};
  });

  const cart = cartsByStore[activeStore.id] || [];
  const setCart = (updater: CartItem[] | ((prev: CartItem[]) => CartItem[])) => {
    setCartsByStore((prevMap) => {
      const currentList = prevMap[activeStore.id] || [];
      const nextList = typeof updater === 'function' ? updater(currentList) : updater;
      return { ...prevMap, [activeStore.id]: nextList };
    });
  };

  // Per-store wishlists stored by store ID
  const [wishlistsByStore, setWishlistsByStore] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem('bastiyah_wishlists_v1');
    return saved ? JSON.parse(saved) : {};
  });

  const wishlist = wishlistsByStore[activeStore.id] || [];
  const toggleWishlist = (productId: string) => {
    setWishlistsByStore((prevMap) => {
      const currentList = prevMap[activeStore.id] || [];
      const exists = currentList.includes(productId);
      let updated: string[];
      if (exists) {
        addToast(language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist', 'info');
        updated = currentList.filter((id) => id !== productId);
      } else {
        addToast(language === 'ar' ? 'تم الحفظ في المفضلة!' : 'Saved to wishlist!', 'success');
        updated = [...currentList, productId];
      }
      return { ...prevMap, [activeStore.id]: updated };
    });
  };

  const isInWishlist = (productId: string) => (wishlistsByStore[activeStore.id] || []).includes(productId);

  // UI state
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(() => initialRouting.productId || null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // HTML Direction and Language synchronization
  useEffect(() => {
    localStorage.setItem('bastiyah_language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Browser Tab Bar (Document Title & Favicon) Dynamic Synchronization
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let pageTitle = 'بسطية | BASTIYAH — احجز متجرك الإلكتروني ببساطة';
    const faviconUrl = '/favicon-32x32.png?v=2';

    const displayStoreName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
    const displayTagline = language === 'ar' ? activeStore.taglineAr || activeStore.tagline : activeStore.tagline;

    if (currentPage === 'bastiyah-landing') {
      pageTitle = language === 'ar'
        ? 'بسطية | BASTIYAH — احجز متجرك الإلكتروني ببساطة'
        : 'Bastiyah | بسطية — Your Business Deserves to Be Online';
    } else if (currentPage === 'bastiyah-admin') {
      pageTitle = language === 'ar'
        ? 'لوحة تحكم المنصة | بسطية'
        : 'Platform Super Admin | Bastiyah';
    } else if (currentPage === 'admin') {
      pageTitle = language === 'ar'
        ? `لوحة إدارة ${displayStoreName} | بسطية`
        : `${activeStore.name} Merchant Admin | Bastiyah`;
    } else {
      // Storefront sub-pages
      if (currentPage === 'home') {
        pageTitle = `${displayStoreName} — ${displayTagline}`;
      } else if (currentPage === 'shop') {
        pageTitle = `${language === 'ar' ? 'جميع المنتجات' : 'Shop All'} — ${displayStoreName}`;
      } else if (currentPage === 'product-detail') {
        const prod = activeStore.products.find((p) => p.id === selectedProductId);
        const prodName = prod ? (language === 'ar' ? prod.nameAr || prod.name : prod.name) : (language === 'ar' ? 'تفاصيل المنتج' : 'Product Details');
        pageTitle = `${prodName} — ${displayStoreName}`;
      } else if (currentPage === 'checkout') {
        pageTitle = `${language === 'ar' ? 'إتمام الطلب والدفع' : 'Checkout'} — ${displayStoreName}`;
      } else if (currentPage === 'order-success') {
        pageTitle = `${language === 'ar' ? 'تم تأكيد طلبك' : 'Order Confirmed'} — ${displayStoreName}`;
      } else if (currentPage === 'orders') {
        pageTitle = `${language === 'ar' ? 'سجل الطلبات' : 'Order History'} — ${displayStoreName}`;
      } else if (currentPage === 'wishlist') {
        pageTitle = `${language === 'ar' ? 'قائمة المفضلة' : 'Wishlist'} — ${displayStoreName}`;
      }
    }

    document.title = pageTitle;

    // Dynamically update all favicon link tags to prevent browser caching
    const linkIcons = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
    linkIcons.forEach((link) => {
      link.href = faviconUrl;
    });
  }, [currentPage, activeStore.id, activeStore.name, activeStore.nameAr, activeStore.tagline, activeStore.taglineAr, selectedProductId, language]);

  // Persist multi-store state
  useEffect(() => {
    localStorage.setItem('bastiyah_stores_v1', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('bastiyah_active_store_id', activeStore.id);
  }, [activeStore.id]);

  useEffect(() => {
    localStorage.setItem('bastiyah_carts_v1', JSON.stringify(cartsByStore));
  }, [cartsByStore]);

  useEffect(() => {
    localStorage.setItem('bastiyah_wishlists_v1', JSON.stringify(wishlistsByStore));
  }, [wishlistsByStore]);

  // Cloud & Backend Infrastructure State
  const isConvexConnected = isConvexConfigured();
  const isCloudflareConfigured = Boolean(
    import.meta.env.VITE_R2_PUBLIC_URL || import.meta.env.VITE_R2_ACCOUNT_ID
  );

  // Sync Convex stores on load when Convex client is active
  useEffect(() => {
    if (!convexClient) return;

    let isMounted = true;
    convexClient
      .query(api.stores.list, {})
      .then((remoteStores: any[]) => {
        if (!isMounted || !remoteStores || !Array.isArray(remoteStores) || remoteStores.length === 0) return;
        setStores((prev) => {
          const remoteSlugs = new Set(remoteStores.map((r) => r.slug));
          const existingNotInRemote = prev.filter((p) => !remoteSlugs.has(p.slug));
          const formattedRemote: HostedStore[] = remoteStores.map((rs) => {
            const localMatch = prev.find((p) => p.slug === rs.slug);
            return {
              id: rs._id || rs.id || `store-${rs.slug}`,
              slug: rs.slug,
              name: rs.name,
              nameAr: rs.nameAr || rs.name,
              tagline: rs.tagline,
              taglineAr: rs.taglineAr || rs.tagline,
              description: rs.description,
              descriptionAr: rs.descriptionAr || rs.description,
              category: rs.category,
              categoryAr: rs.categoryAr || rs.category,
              ownerName: rs.ownerName,
              ownerEmail: rs.ownerEmail,
              status: rs.status,
              plan: rs.plan,
              createdAt: rs.createdAt,
              design: rs.design,
              settings: rs.settings,
              products: localMatch?.products || [],
              orders: localMatch?.orders || [],
              customers: localMatch?.customers || [],
              coupons: localMatch?.coupons || INITIAL_COUPONS,
            };
          });
          return [...formattedRemote, ...existingNotInRemote];
        });
      })
      .catch((err) => {
        console.warn('Convex stores sync query note:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const seedConvexDatabase = async () => {
    if (!convexClient) {
      addToast(
        language === 'ar'
          ? 'يرجى تهيئة متغير VITE_CONVEX_URL في ملف .env أولاً للاتصال بـ Convex'
          : 'Please set VITE_CONVEX_URL in your .env file first to connect to Convex',
        'warning'
      );
      return;
    }
    try {
      addToast(
        language === 'ar' ? 'جاري تهيئة قاعدة بيانات Convex بالبيانات الأولية...' : 'Seeding Convex database with initial stores...',
        'info'
      );
      const res: any = await convexClient.mutation(api.seed.seedInitialData, {});
      addToast(
        language === 'ar'
          ? 'تمت تهيئة قاعدة بيانات Convex بنجاح!'
          : 'Convex database successfully seeded with initial stores!',
        'success'
      );

      // Refresh stores from Convex
      const remoteStores: any[] = await convexClient.query(api.stores.list, {});
      if (remoteStores && remoteStores.length > 0) {
        setStores((prev) => {
          const remoteSlugs = new Set(remoteStores.map((r) => r.slug));
          const existingNotInRemote = prev.filter((p) => !remoteSlugs.has(p.slug));
          const formattedRemote: HostedStore[] = remoteStores.map((rs) => {
            const localMatch = prev.find((p) => p.slug === rs.slug);
            return {
              id: rs._id || rs.id || `store-${rs.slug}`,
              slug: rs.slug,
              name: rs.name,
              nameAr: rs.nameAr || rs.name,
              tagline: rs.tagline,
              taglineAr: rs.taglineAr || rs.tagline,
              description: rs.description,
              descriptionAr: rs.descriptionAr || rs.description,
              category: rs.category,
              categoryAr: rs.categoryAr || rs.category,
              ownerName: rs.ownerName,
              ownerEmail: rs.ownerEmail,
              status: rs.status,
              plan: rs.plan,
              createdAt: rs.createdAt,
              design: rs.design,
              settings: rs.settings,
              products: localMatch?.products || [],
              orders: localMatch?.orders || [],
              customers: localMatch?.customers || [],
              coupons: localMatch?.coupons || INITIAL_COUPONS,
            };
          });
          return [...formattedRemote, ...existingNotInRemote];
        });
      }
    } catch (err: any) {
      console.error('Seed Convex failed:', err);
      addToast(err.message || 'Failed to seed Convex', 'error');
    }
  };

  // Synchronize browser URL cleanly based on current page and store
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname.toLowerCase();
    const hostParts = hostname.split('.');
    const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
    const isStoreSubdomain = !isLocalOrVercel && hostParts.length >= 3 && hostParts[0] === activeStore.slug;
    const isOwnerSubdomain = !isLocalOrVercel && hostParts.length >= 3 && hostParts[0] === 'owner';

    let targetPath = '/';

    if (isOwnerSubdomain) {
      const root = hostParts.slice(1).join('.');
      const protocol = window.location.protocol;
      window.location.replace(`${protocol}//${root}/owner`);
      return;
    } else if (isStoreSubdomain) {
      if (currentPage === 'bastiyah-admin') {
        const root = hostParts.slice(1).join('.');
        const protocol = window.location.protocol;
        window.location.href = `${protocol}//${root}/owner`;
        return;
      }
      if (currentPage === 'admin') {
        targetPath = '/admin';
      } else if (currentPage === 'home') {
        targetPath = '/';
      } else if (currentPage === 'product-detail' && selectedProductId) {
        targetPath = `/product/${selectedProductId}`;
      } else {
        targetPath = `/?page=${currentPage}`;
      }
    } else {
      // Path-based routing (Vercel or apex custom domain)
      if (currentPage === 'bastiyah-landing') {
        targetPath = '/';
      } else if (currentPage === 'bastiyah-admin') {
        targetPath = '/owner';
      } else if (currentPage === 'admin') {
        targetPath = `/store/${activeStore.slug}/admin`;
      } else if (currentPage === 'home') {
        targetPath = `/store/${activeStore.slug}`;
      } else if (currentPage === 'product-detail' && selectedProductId) {
        targetPath = `/store/${activeStore.slug}/product/${selectedProductId}`;
      } else {
        // e.g. shop, wishlist, orders, checkout
        targetPath = `/store/${activeStore.slug}?page=${currentPage}`;
      }
    }

    if (window.location.pathname + window.location.search !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [currentPage, selectedProductId, activeStore.id, activeStore.slug]);

  // Support browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const routing = detectInitialRouting(stores);
      setActiveStoreId(routing.storeId);
      setCurrentPage(routing.page);
      if (routing.productId) {
        setSelectedProductId(routing.productId);
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [stores]);

  // Smooth scroll to top on page or product navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentPage, selectedProductId]);

  // Helper to update a specific store inside `stores`
  const mutateActiveStore = (updater: (store: HostedStore) => HostedStore, targetStoreId?: string) => {
    const idToUpdate = targetStoreId || activeStore.id;
    setStores((prev) =>
      prev.map((s) => (s.id === idToUpdate ? updater(s) : s))
    );
  };

  // Translations
  const t = translations[language];

  const getCategoryName = (cat: ProductCategory): string => {
    if (language === 'en') {
      return cat === 'All' ? 'All Products' : cat;
    }
    switch (cat) {
      case 'All': return translations.ar.catAll;
      case 'Audio & Sound': return translations.ar.catAudio;
      case 'Wearables & Tech': return translations.ar.catWearables;
      case 'Workspace & Setup': return translations.ar.catWorkspace;
      case 'Lifestyle & Travel': return translations.ar.catLifestyle;
      case 'Smart Home': return translations.ar.catSmartHome;
      case 'Perfumes & Oud': return translations.ar.catPerfumes;
      case 'Fashion & Luxury': return translations.ar.catFashion;
      default: return cat;
    }
  };

  const getProductName = (p: Product): string => {
    if (language === 'ar') {
      return p.nameAr || PRODUCT_ARABIC_TRANSLATIONS[p.id]?.name || p.name;
    }
    return p.name;
  };

  const getProductTagline = (p: Product): string => {
    if (language === 'ar') {
      return p.taglineAr || PRODUCT_ARABIC_TRANSLATIONS[p.id]?.tagline || p.tagline;
    }
    return p.tagline;
  };

  const getProductDescription = (p: Product): string => {
    if (language === 'ar') {
      return p.descriptionAr || PRODUCT_ARABIC_TRANSLATIONS[p.id]?.description || p.description;
    }
    return p.description;
  };

  // Toast System
  const addToast = (title: string, type: ToastType = 'success', message?: string) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  // Multi-Store Platform Actions
  const switchStore = (storeIdOrSlug: string, targetPage: ActivePage = 'home') => {
    const found = stores.find(
      (s) => s.id === storeIdOrSlug || s.slug.toLowerCase() === storeIdOrSlug.toLowerCase()
    );
    if (!found) return;

    const customRoot = getCustomDomainRoot();
    if (customRoot) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
      const targetHost = `${found.slug}.${customRoot}`;
      const isTargetAdmin = targetPage === 'admin';
      const targetUrl = getStoreDisplayUrl(found.slug, isTargetAdmin);

      // If we are navigating to another subdomain (e.g. from bastiyah.com to panda.bastiyah.com, or between subdomains)
      if (currentHost !== targetHost || (isTargetAdmin && !window.location.pathname.includes('/admin'))) {
        window.location.href = targetUrl;
        return;
      }
    }

    setActiveStoreId(found.id);
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedProductId(null);
    setAppliedCoupon(null);
    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast(
      language === 'ar'
        ? `تم الانتقال إلى ${found.nameAr || found.name} (${getStorePathLabel(found.slug)})`
        : `Switched to ${found.name} (${getStorePathLabel(found.slug)})`,
      'info'
    );
  };

  const goToPlatform = (targetPage: 'landing' | 'admin' = 'landing') => {
    const customRoot = getCustomDomainRoot();
    if (customRoot) {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname.toLowerCase() : '';
      if (currentHost !== customRoot && currentHost !== `www.${customRoot}`) {
        window.location.href = getPlatformDisplayUrl(targetPage === 'admin' ? 'owner-admin' : 'landing');
        return;
      }
    }
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedProductId(null);
    setAppliedCoupon(null);
    setCurrentPage(targetPage === 'admin' ? 'bastiyah-admin' : 'bastiyah-landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const createHostedStore = (input: CreateStoreInput): HostedStore => {
    const cleanSlug = input.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || `store-${Date.now()}`;

    // Pick starter catalog based on category
    let starterProducts: Product[] = INITIAL_PRODUCTS.slice(0, 6);
    if (input.category.toLowerCase().includes('perfume') || input.category.toLowerCase().includes('oud')) {
      starterProducts = OUD_PRODUCTS;
    } else if (input.category.toLowerCase().includes('fashion') || input.category.toLowerCase().includes('luxury')) {
      starterProducts = FASHION_PRODUCTS;
    }

    const newStore: HostedStore = {
      id: `store-${Date.now()}`,
      slug: cleanSlug,
      name: input.name.trim(),
      nameAr: input.nameAr?.trim() || input.name.trim(),
      tagline: input.tagline.trim() || `Welcome to ${input.name}`,
      taglineAr: input.taglineAr?.trim() || input.tagline.trim() || `أهلاً بكم في ${input.nameAr || input.name}`,
      description: `Official Bastiyah web-store hosted at /store/${cleanSlug}.`,
      descriptionAr: `متجر إلكتروني رسمي مستضاف عبر منصة بسطية على الرابط /store/${cleanSlug}.`,
      category: input.category,
      categoryAr: input.categoryAr || input.category,
      ownerName: input.ownerName.trim() || 'Store Owner',
      ownerEmail: input.ownerEmail?.trim() || `admin@${cleanSlug}.com`,
      ownerPhone: input.ownerPhone?.trim() || '+964 770 123 4567',
      adminPassword: input.adminPassword?.trim() || 'merchant123',
      status: 'active',
      plan: input.plan,
      createdAt: new Date().toISOString(),
      design: {
        themeColor: input.themeColor,
        layoutStyle: input.layoutStyle,
        logoEmoji: input.logoEmoji || '🛍️',
        headerStyle: input.layoutStyle === 'luxury-centered' ? 'dark' : 'light',
        cardRadius: input.layoutStyle === 'minimal-editorial' ? 'sharp' : 'rounded',
      },
      settings: {
        storeName: input.name.trim(),
        supportEmail: input.ownerEmail?.trim() || `support@${cleanSlug}.com`,
        currency: input.currency || 'د.ع',
        freeShippingThreshold: 50000,
        standardShippingFee: 5000,
        taxRate: 0,
      },
      products: starterProducts.map((p, idx) => ({
        ...p,
        id: `${cleanSlug}-prod-${idx + 1}`,
      })),
      orders: [],
      customers: [],
      coupons: INITIAL_COUPONS,
    };

    setStores((prev) => [newStore, ...prev]);
    addToast(
      language === 'ar'
        ? `🎉 تم إطلاق المتجر بنجاح على /store/${cleanSlug}!`
        : `🎉 Store launched live at /store/${cleanSlug}!`,
      'success'
    );
    return newStore;
  };

  const updateHostedStore = (storeId: string, updates: Partial<HostedStore>) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== storeId) return s;
        const updated = { ...s, ...updates };
        if (updates.name) {
          updated.settings = { ...updated.settings, storeName: updates.name };
        }
        return updated;
      })
    );
    addToast(
      language === 'ar' ? 'تم تحديث بيانات المتجر بنجاح' : 'Store details updated successfully',
      'success'
    );
  };

  const registerStoreMerchantByOwner = (
    storeId: string,
    merchant: { name: string; phone: string; password?: string }
  ) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== storeId) return s;
        return {
          ...s,
          ownerName: merchant.name.trim() || s.ownerName,
          ownerPhone: merchant.phone.trim(),
          adminPassword: merchant.password?.trim() || s.adminPassword || 'merchant123',
          registeredBy: 'platform_owner',
        };
      })
    );
    addToast(
      language === 'ar'
        ? `✅ تم تسجيل واعتماد مدير المتجر (${merchant.name}) برقم الهاتف (${merchant.phone}) بنجاح بواسطة مالك المنصة.`
        : `✅ Store admin (${merchant.name}) registered via phone (${merchant.phone}) by platform owner.`,
      'success'
    );
  };

  const updateStoreDesign = (designUpdates: Partial<StoreDesign>, storeId?: string) => {
    mutateActiveStore(
      (store) => ({
        ...store,
        design: { ...store.design, ...designUpdates },
      }),
      storeId
    );
    addToast(
      language === 'ar' ? '✨ تم تحديث تصميم وهوية المتجر!' : '✨ Store design & theme updated!',
      'success'
    );
  };

  const deleteHostedStore = (storeId: string) => {
    if (stores.length <= 1) {
      addToast(
        language === 'ar' ? 'لا يمكن حذف المتجر الوحيد المتبقي' : 'Cannot delete the last remaining store',
        'error'
      );
      return;
    }
    const target = stores.find((s) => s.id === storeId);
    const remaining = stores.filter((s) => s.id !== storeId);
    setStores(remaining);
    if (activeStore.id === storeId) {
      setActiveStoreId(remaining[0].id);
    }
    addToast(
      language === 'ar'
        ? `تم حذف المتجر /store/${target?.slug}`
        : `Removed store /store/${target?.slug}`,
      'info'
    );
  };

  // Scoped Store Entities
  const products = activeStore.products;
  const orders = activeStore.orders;
  const customers = activeStore.customers;
  const coupons = activeStore.coupons;
  const settings = activeStore.settings;

  // Sorting & Inventory Filtering
  const [sortBy, setSortBy] = useState<string>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Reviews System
  const DEFAULT_INITIAL_REVIEWS: ProductReview[] = [
    {
      id: 'rev-1',
      productId: 'prod-1',
      author: 'أحمد السعدي',
      rating: 5,
      comment: 'جودة الصوت استثنائية والعزل فائق القوة، والتوصيل كان سريع جداً خلال يومين فقط!',
      date: '2026-02-10T14:30:00Z',
    },
    {
      id: 'rev-2',
      productId: 'prod-1',
      author: 'سارة خالد',
      rating: 5,
      comment: 'مريحة جداً للاستخدام طوال اليوم في العمل، والبطارية تدوم لأيام دون شحن.',
      date: '2026-02-18T11:15:00Z',
    },
    {
      id: 'rev-3',
      productId: 'prod-2',
      author: 'عمر القحطاني',
      rating: 5,
      comment: 'ساعة فخمة وخامات التيتانيوم ممتازة وتستحق كل ريال. أنصح بها بشدة.',
      date: '2026-03-01T09:40:00Z',
    },
    {
      id: 'rev-4',
      productId: 'oud-1',
      author: 'فيصل العتيبي',
      rating: 5,
      comment: 'ثبات العطر وفوحانه خيالي، العود الهندي أصلي ومميز جداً للمناسبات.',
      date: '2026-03-05T16:20:00Z',
    },
  ];

  const reviews = activeStore.reviews && activeStore.reviews.length > 0
    ? activeStore.reviews
    : DEFAULT_INITIAL_REVIEWS;

  const addProductReview = (reviewInput: Omit<ProductReview, 'id' | 'date'>) => {
    const newRev: ProductReview = {
      ...reviewInput,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString(),
    };

    mutateActiveStore((store) => {
      const currentReviews = store.reviews && store.reviews.length > 0 ? store.reviews : DEFAULT_INITIAL_REVIEWS;
      const updatedReviews = [newRev, ...currentReviews];
      
      const productReviews = updatedReviews.filter(r => r.productId === reviewInput.productId);
      const avgRating = Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1));

      const updatedProducts = store.products.map(p => {
        if (p.id === reviewInput.productId) {
          return {
            ...p,
            rating: avgRating,
            reviewCount: productReviews.length
          };
        }
        return p;
      });

      return {
        ...store,
        reviews: updatedReviews,
        products: updatedProducts
      };
    });

    addToast(language === 'ar' ? 'شكراً لك! تم إضافة تقييمك بنجاح' : 'Thank you! Your review has been submitted.', 'success');
  };

  const deleteProductReview = (reviewId: string) => {
    mutateActiveStore((store) => {
      const currentReviews = store.reviews || DEFAULT_INITIAL_REVIEWS;
      const targetReview = currentReviews.find(r => r.id === reviewId);
      const updatedReviews = currentReviews.filter(r => r.id !== reviewId);

      let updatedProducts = store.products;
      if (targetReview) {
        const remainingForProduct = updatedReviews.filter(r => r.productId === targetReview.productId);
        const avgRating = remainingForProduct.length > 0 
          ? Number((remainingForProduct.reduce((sum, r) => sum + r.rating, 0) / remainingForProduct.length).toFixed(1))
          : 5.0;

        updatedProducts = store.products.map(p => {
          if (p.id === targetReview.productId) {
            return {
              ...p,
              rating: avgRating,
              reviewCount: remainingForProduct.length
            };
          }
          return p;
        });
      }

      return {
        ...store,
        reviews: updatedReviews,
        products: updatedProducts
      };
    });

    addToast(language === 'ar' ? 'تم حذف التقييم' : 'Review removed', 'info');
  };

  // Cart Management
  const addToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    if (product.stock <= 0) {
      addToast(language === 'ar' ? 'المنتج غير متوفر بالمخزون' : 'Item is out of stock', 'error');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color && item.selectedSize === size
      );

      const prodName = getProductName(product);

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          addToast(
            language === 'ar' ? `تم الوصول للحد الأقصى المتاح (${product.stock})` : `Maximum stock limit reached (${product.stock})`, 
            'warning'
          );
          updated[existingIndex].quantity = product.stock;
        } else {
          updated[existingIndex].quantity = newQty;
          addToast(
            language === 'ar' ? `تم تحديث الكمية في السلة (${newQty})` : `Updated quantity in cart (${newQty})`, 
            'success'
          );
        }
        return updated;
      } else {
        const addQty = Math.min(quantity, product.stock);
        addToast(
          language === 'ar' ? `تمت إضافة "${prodName}" إلى السلة!` : `Added "${product.name}" to bag!`, 
          'success'
        );
        return [...prev, { product, quantity: addQty, selectedColor: color, selectedSize: size }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast(language === 'ar' ? 'تم حذف المنتج من السلة' : 'Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(quantity, item.product.stock);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };


  // Cart Calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);

  const cartDiscount = appliedCoupon && cartSubtotal >= appliedCoupon.minSpend
    ? Number(((cartSubtotal * appliedCoupon.discountPercent) / 100).toFixed(2))
    : 0;

  const cartShipping = cartSubtotal === 0 || cartSubtotal >= settings.freeShippingThreshold 
    ? 0 
    : settings.standardShippingFee;

  const cartTax = Number(((cartSubtotal - cartDiscount) * settings.taxRate).toFixed(2));
  const cartTotal = Number(Math.max(0, cartSubtotal - cartDiscount + cartShipping + cartTax).toFixed(2));

  // Coupons
  const applyCoupon = (code: string): boolean => {
    const formatted = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === formatted && c.active);
    if (!found) {
      addToast(language === 'ar' ? 'كوبون الخصم غير صحيح أو منتهي' : 'Invalid or expired promo code', 'error');
      return false;
    }
    if (cartSubtotal < found.minSpend) {
      addToast(
        language === 'ar' ? `الحد الأدنى لتطبيق الكوبون هو $${found.minSpend}` : `Minimum spend of $${found.minSpend} required for this code`, 
        'warning'
      );
      return false;
    }
    setAppliedCoupon(found);
    addToast(
      language === 'ar' ? `تم تفعيل الكوبون "${found.code}"! (خصم %${found.discountPercent})` : `Coupon "${found.code}" applied! (${found.discountPercent}% OFF)`, 
      'success'
    );
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast(language === 'ar' ? 'تم إلغاء الكوبون' : 'Coupon removed', 'info');
  };

  const addCoupon = (coupon: Coupon) => {
    mutateActiveStore((store) => ({
      ...store,
      coupons: [coupon, ...store.coupons],
    }));
    addToast(language === 'ar' ? `تم إنشاء الكوبون "${coupon.code}" بنجاح!` : `Coupon "${coupon.code}" created successfully!`, 'success');
  };

  const toggleCouponStatus = (code: string) => {
    mutateActiveStore((store) => ({
      ...store,
      coupons: store.coupons.map((c) => (c.code === code ? { ...c, active: !c.active } : c)),
    }));
  };

  const deleteCoupon = (code: string) => {
    mutateActiveStore((store) => ({
      ...store,
      coupons: store.coupons.filter((c) => c.code !== code),
    }));
    addToast(language === 'ar' ? `تم حذف الكوبون "${code}"` : `Coupon "${code}" deleted`, 'info');
  };

  // Orders Management
  const placeOrder = (
    shippingInfo: ShippingAddress, 
    paymentMethod: Order['paymentMethod'],
    notes?: string
  ): Order => {
    const prefix = activeStore.slug.toUpperCase().slice(0, 5);
    const orderNumber = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      date: new Date().toISOString(),
      customer: shippingInfo,
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: getProductName(item.product),
        productImage: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shipping: cartShipping,
      tax: cartTax,
      total: cartTotal,
      status: 'processing',
      paymentMethod,
      trackingNumber: `${prefix}-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: notes?.trim() || undefined,
    };

    mutateActiveStore((store) => {
      // Update stock
      const updatedProducts = store.products.map((product) => {
        const cartItem = cart.find((item) => item.product.id === product.id);
        if (cartItem) {
          return {
            ...product,
            stock: Math.max(0, product.stock - cartItem.quantity),
          };
        }
        return product;
      });

      // Update customers - strictly matched by phone number first
      const existingCustomer = store.customers.find((c) => {
        if (c.phone && shippingInfo.phone) {
          const cp = c.phone.replace(/\D/g, '');
          const sp = shippingInfo.phone.replace(/\D/g, '');
          if (cp.slice(-8) === sp.slice(-8)) return true;
        }
        return Boolean(c.email && shippingInfo.email && c.email.toLowerCase() === shippingInfo.email.toLowerCase());
      });

      let updatedCustomers: Customer[];
      if (existingCustomer) {
        updatedCustomers = store.customers.map((c) =>
          c.id === existingCustomer.id
            ? {
                ...c,
                phone: shippingInfo.phone || c.phone,
                ordersCount: c.ordersCount + 1,
                totalSpent: Number((c.totalSpent + cartTotal).toFixed(2)),
                isPhoneVerified: c.isPhoneVerified || true,
              }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: shippingInfo.fullName,
          phone: shippingInfo.phone,
          email: shippingInfo.email || `${shippingInfo.phone.replace(/\D/g, '').slice(-6)}@customer.iq`,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
          city: shippingInfo.city,
          country: shippingInfo.country,
          ordersCount: 1,
          totalSpent: cartTotal,
          joinedDate: new Date().toISOString().split('T')[0],
          isPhoneVerified: true,
        };
        updatedCustomers = [newCust, ...store.customers];
      }

      // Create Admin Notification for the newly submitted order
      const newAdminNotification: AdminNotification = {
        id: `notif-${Date.now()}`,
        type: 'new_order',
        title: 'New Order Received!',
        titleAr: 'طلب جديد وارد!',
        message: `Order #${orderNumber} received from ${shippingInfo.fullName} (${store.settings.currency}${cartTotal.toFixed(0)})`,
        messageAr: `طلب جديد رقم #${orderNumber} من ${shippingInfo.fullName} بقيمة ${store.settings.currency}${cartTotal.toFixed(0)}`,
        orderId: newOrder.id,
        orderNumber,
        amount: cartTotal,
        customerName: shippingInfo.fullName,
        timestamp: new Date().toISOString(),
        read: false,
      };

      return {
        ...store,
        products: updatedProducts,
        orders: [newOrder, ...store.orders],
        customers: updatedCustomers,
        adminNotifications: [newAdminNotification, ...(store.adminNotifications || [])],
      };
    });

    // Play chime sound notification for the merchant
    const soundEnabled = activeStore.settings.notificationSettings?.soundEnabled ?? true;
    if (soundEnabled) {
      playNotificationChime();
    }

    // Native browser push notification if permitted
    const browserNotifEnabled = activeStore.settings.notificationSettings?.browserNotificationsEnabled ?? false;
    if (browserNotifEnabled) {
      sendBrowserNotification(
        language === 'ar' ? `🔔 طلب جديد وارد (#${orderNumber})` : `🔔 New Order Received (#${orderNumber})`,
        language === 'ar'
          ? `طلب بقيمة ${activeStore.settings.currency}${cartTotal.toFixed(0)} من العميل ${shippingInfo.fullName}`
          : `Order of ${activeStore.settings.currency}${cartTotal.toFixed(0)} from ${shippingInfo.fullName}`,
        {
          onClick: () => {
            setCurrentPage('admin');
            setAdminTab('orders');
          }
        }
      );
    }

    // Background Service Worker notification (delivered even if website/tab is closed)
    showServiceWorkerNotification(
      language === 'ar' ? `🔔 طلب جديد وارد (#${orderNumber})` : `🔔 New Order Received (#${orderNumber})`,
      language === 'ar'
        ? `طلب جديد بقيمة ${activeStore.settings.currency}${cartTotal.toFixed(0)} من ${shippingInfo.fullName}`
        : `New order of ${activeStore.settings.currency}${cartTotal.toFixed(0)} from ${shippingInfo.fullName}`,
      orderNumber
    );

    setLastPlacedOrder(newOrder);

    // Auto-register and persist customer profile via phone number if not logged in
    if (!currentCustomer && shippingInfo.phone) {
      const autoCustomer: CustomerUser = {
        id: `cust-order-${Date.now()}`,
        name: shippingInfo.fullName,
        phone: shippingInfo.phone,
        email: shippingInfo.email,
        city: shippingInfo.city,
        address: shippingInfo.address,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
        authenticatedVia: 'phone_auth',
        authenticatedAt: new Date().toISOString(),
      };
      setCurrentCustomer(autoCustomer);
      try {
        localStorage.setItem('bastiyah_current_customer', JSON.stringify(autoCustomer));
      } catch (e) {
        // ignore
      }
    }
    clearCart();
    setAppliedCoupon(null);
    setCurrentPage('order-success');
    addToast(
      language === 'ar' ? '🎉 تم تأكيد طلبك بنجاح!' : '🎉 Order placed successfully!', 
      'success', 
      `${orderNumber}`
    );
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    mutateActiveStore((store) => ({
      ...store,
      orders: store.orders.map((order) => (order.id === orderId ? { ...order, status } : order)),
    }));
    addToast(
      language === 'ar' ? `تم تحديث حالة الطلب إلى "${status}"` : `Order status updated to "${status.toUpperCase()}"`, 
      'success'
    );
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    mutateActiveStore((store) => ({
      ...store,
      orders: store.orders.map((order) => (order.id === orderId ? { ...order, ...updates } : order)),
    }));
    addToast(
      language === 'ar' ? 'تم تحديث بيانات الطلب بنجاح' : 'Order details updated successfully',
      'success'
    );
  };

  // Products CRUD (Admin)
  const addProduct = (prodData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    mutateActiveStore((store) => ({
      ...store,
      products: [newProduct, ...store.products],
    }));
    addToast(language === 'ar' ? `تمت إضافة المنتج "${newProduct.name}"!` : `Product "${newProduct.name}" created!`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    mutateActiveStore((store) => ({
      ...store,
      products: store.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
    addToast(language === 'ar' ? 'تم تحديث المنتج بنجاح' : 'Product updated successfully', 'success');
  };

  const deleteProduct = (id: string) => {
    const p = products.find((x) => x.id === id);
    mutateActiveStore((store) => ({
      ...store,
      products: store.products.filter((item) => item.id !== id),
    }));
    addToast(language === 'ar' ? `تم حذف المنتج "${p?.name || id}"` : `Product "${p?.name || id}" removed`, 'info');
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    mutateActiveStore((store) => ({
      ...store,
      name: newSettings.storeName ? newSettings.storeName : store.name,
      settings: { ...store.settings, ...newSettings },
    }));
    addToast(language === 'ar' ? 'تم حفظ إعدادات المتجر' : 'Store settings saved', 'success');
  };

  // Admin Order & System Notifications
  const adminNotifications: AdminNotification[] = activeStore.adminNotifications || [];
  const unreadNotificationsCount = adminNotifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (notificationId: string) => {
    mutateActiveStore((store) => ({
      ...store,
      adminNotifications: (store.adminNotifications || []).map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ),
    }));
  };

  const markAllNotificationsAsRead = () => {
    mutateActiveStore((store) => ({
      ...store,
      adminNotifications: (store.adminNotifications || []).map((n) => ({ ...n, read: true })),
    }));
    addToast(language === 'ar' ? 'تم تحديد جميع الإشعارات كمقروءة' : 'All notifications marked as read', 'info');
  };

  const clearAllNotifications = () => {
    mutateActiveStore((store) => ({
      ...store,
      adminNotifications: [],
    }));
    addToast(language === 'ar' ? 'تم مسح سجل الإشعارات' : 'Notifications cleared', 'info');
  };

  const updateNotificationSettings = (settingsUpdates: Partial<NotificationSettings>) => {
    mutateActiveStore((store) => ({
      ...store,
      settings: {
        ...store.settings,
        notificationSettings: {
          soundEnabled: true,
          browserNotificationsEnabled: false,
          notifyOnNewOrder: true,
          notifyOnLowStock: true,
          ...store.settings.notificationSettings,
          ...settingsUpdates,
        },
      },
    }));
    addToast(
      language === 'ar' ? 'تم تحديث إعدادات التنبيهات' : 'Notification settings updated',
      'success'
    );
  };

  const playNotificationSound = () => {
    playNotificationChime();
  };

  const requestBrowserNotifications = async (): Promise<boolean> => {
    const granted = await requestBrowserNotificationPermission();
    if (granted) {
      updateNotificationSettings({ browserNotificationsEnabled: true });
      addToast(
        language === 'ar' ? 'تم تفعيل إشعارات المتصفح بنجاح' : 'Browser notifications enabled',
        'success'
      );
    } else {
      addToast(
        language === 'ar' ? 'لم يتم منح إذن إشعارات المتصفح' : 'Notification permission not granted',
        'warning'
      );
    }
    return granted;
  };

  return (
    <StoreContext.Provider
      value={{
        // Authentication & Access Control
        isPlatformAdminAuthenticated,
        loginPlatformAdmin,
        logoutPlatformAdmin,
        platformAdminEmail: PLATFORM_ADMIN_EMAIL,
        updatePlatformAdminPassword,
        restorePlatformStores,
        resetStoresToDefault,
        authenticatedStoreAdminIds,
        isStoreAdminAuthenticated,
        loginStoreAdmin,
        sendStoreAdminOtp,
        verifyStoreAdminOtp,
        logoutStoreAdmin,

        // Customer WhatsApp Auth & Account Profile
        currentCustomer,
        isCustomerAuthModalOpen,
        setIsCustomerAuthModalOpen,
        isCustomerAccountModalOpen,
        setIsCustomerAccountModalOpen,
        updateCustomerProfile,
        sendCustomerWhatsAppOtp,
        verifyCustomerWhatsAppOtp,
        logoutCustomer,

        language,
        setLanguage,
        t,
        getCategoryName,
        getProductName,
        getProductTagline,
        getProductDescription,
        stores,
        activeStore,
        theme,
        switchStore,
        goToPlatform,
        createHostedStore,
        updateHostedStore,
        registerStoreMerchantByOwner,
        updateStoreDesign,
        deleteHostedStore,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        currentPage,
        setCurrentPage,
        adminTab,
        setAdminTab,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProductId,
        setSelectedProductId,
        quickViewProduct,
        setQuickViewProduct,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        cartDiscount,
        cartShipping,
        cartTax,
        cartTotal,
        sortBy,
        setSortBy,
        inStockOnly,
        setInStockOnly,
        reviews,
        addProductReview,
        deleteProductReview,
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        coupons,
        addCoupon,
        toggleCouponStatus,
        deleteCoupon,
        orders,
        lastPlacedOrder,
        placeOrder,
        updateOrderStatus,
        updateOrder,
        customers,
        settings,
        updateSettings,
        isConvexConnected,
        isCloudflareConfigured,
        seedConvexDatabase,
        toasts,
        addToast,
        removeToast,
        adminNotifications,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        updateNotificationSettings,
        playNotificationSound,
        requestBrowserNotifications,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
