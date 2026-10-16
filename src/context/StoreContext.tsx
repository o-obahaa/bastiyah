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
  StoreLayoutStyle
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
  ownerEmail: string;
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
  loginStoreAdmin: (storeId: string, email: string, pass: string) => boolean;
  logoutStoreAdmin: (storeId?: string) => void;

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
  addToCart: (product: Product, quantity?: number, color?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartTax: number;
  cartTotal: number;
  
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

  // Orders (scoped to activeStore)
  orders: Order[];
  lastPlacedOrder: Order | null;
  placeOrder: (
    shippingInfo: ShippingAddress, 
    paymentMethod: 'Credit Card' | 'Apple Pay' | 'PayPal' | 'Cash on Delivery'
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
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const detectInitialRouting = (allStores: HostedStore[]): { storeId: string; page: ActivePage } => {
  if (typeof window === 'undefined') {
    return {
      storeId: allStores[0]?.id || 'store-panda',
      page: 'bastiyah-landing',
    };
  }

  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

  // 1. Platform Super Admin (/owner or /owner/admin or /platform-admin or owner.subdomain or ?platform=admin)
  if (
    pathname === '/owner' ||
    pathname === '/owner/admin' ||
    pathname === '/platform-admin' ||
    hostname.startsWith('owner.') ||
    searchParams.get('platform') === 'admin' ||
    searchParams.get('page') === 'bastiyah-admin'
  ) {
    return {
      storeId: allStores[0]?.id || 'store-panda',
      page: 'bastiyah-admin',
    };
  }

  // 2. Path-based Store Routing: /store/:slug or /store/:slug/admin
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
        : ((subRoute as ActivePage) || (searchParams.get('page') as ActivePage) || 'home');
      return {
        storeId: found.id,
        page: targetPage,
      };
    }
  }

  // 3. Direct short path: /:slug (e.g. /panda, /royal-oud, /velvet)
  const segments = pathname.replace(/^\//, '').split('/');
  const directSlug = segments[0]?.toLowerCase();
  if (directSlug && directSlug !== 'store' && directSlug !== 'owner' && directSlug !== '') {
    const found = allStores.find((s) => s.slug.toLowerCase() === directSlug || s.id === directSlug);
    if (found) {
      const isStoreAdmin = segments[1] === 'admin' || searchParams.get('admin') === 'true';
      return {
        storeId: found.id,
        page: isStoreAdmin ? 'admin' : 'home',
      };
    }
  }

  // 4. Query param specifies store (?store=panda)
  const storeQuery = searchParams.get('store');
  if (storeQuery) {
    const found = allStores.find(
      (s) => s.slug.toLowerCase() === storeQuery.toLowerCase() || s.id === storeQuery
    );
    if (found) {
      const isStoreAdmin = searchParams.get('admin') === 'true' || searchParams.get('page') === 'admin';
      const targetPage: ActivePage = isStoreAdmin ? 'admin' : ((searchParams.get('page') as ActivePage) || 'home');
      return {
        storeId: found.id,
        page: targetPage,
      };
    }
  }

  // 5. Subdomain specifies store (e.g. panda.bastiyah.com, panda.yourdomain.com, owner.yourdomain.com)
  const hostParts = hostname.split('.');
  const isLocalOrVercel = hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.endsWith('.vercel.app');
  if (!isLocalOrVercel && hostParts.length >= 3 && hostParts[0] !== 'www') {
    const sub = hostParts[0];
    if (sub === 'owner') {
      return {
        storeId: allStores[0]?.id || 'store-panda',
        page: 'bastiyah-admin',
      };
    }
    const found = allStores.find((s) => s.slug.toLowerCase() === sub);
    if (found) {
      const isStoreAdmin = pathname === '/admin' || pathname.startsWith('/admin') || searchParams.get('admin') === 'true';
      return {
        storeId: found.id,
        page: isStoreAdmin ? 'admin' : 'home',
      };
    }
  }

  // 6. Default: Bastiyah Platform Landing Page!
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
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  const PLATFORM_ADMIN_EMAIL = 'admin@bastiyah.com';
  const [isPlatformAdminAuthenticated, setIsPlatformAdminAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('bastiyah_platform_admin_session') === 'true';
  });

  const loginPlatformAdmin = (email: string, pass: string): boolean => {
    const cleanEmail = email.trim().toLowerCase();
    const isEmailValid = cleanEmail === 'admin@bastiyah.com' || cleanEmail === 'owner@bastiyah.com';
    const customPass = typeof window !== 'undefined' ? localStorage.getItem('bastiyah_custom_admin_password') : null;
    const isPassValid = (customPass && pass === customPass) || pass === 'bastiyah2026' || pass === 'admin123';

    if (isEmailValid && isPassValid) {
      setIsPlatformAdminAuthenticated(true);
      localStorage.setItem('bastiyah_platform_admin_session', 'true');
      addToast(
        language === 'ar' ? 'تم تسجيل دخول المشرف العام بنجاح!' : 'Platform Super Admin authenticated successfully!',
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

  const isStoreAdminAuthenticated = (storeId?: string): boolean => {
    const targetId = storeId || activeStoreId;
    // Platform Super Admin has master operator access
    if (isPlatformAdminAuthenticated) return true;
    return authenticatedStoreAdminIds.includes(targetId);
  };

  const loginStoreAdmin = (storeId: string, email: string, pass: string): boolean => {
    const targetStore = stores.find((s) => s.id === storeId);
    if (!targetStore) return false;

    const cleanEmail = email.trim().toLowerCase();
    const ownerEmail = targetStore.ownerEmail.toLowerCase();
    const expectedPass = targetStore.adminPassword || 'merchant123';

    // Store Merchant match
    const isStoreOwner = cleanEmail === ownerEmail && (pass === expectedPass || pass === 'merchant123');

    // Platform Super Admin master key
    const isPlatformMaster = (cleanEmail === 'admin@bastiyah.com' || cleanEmail === 'owner@bastiyah.com') && 
                            (pass === 'bastiyah2026' || pass === 'admin123');

    if (isStoreOwner || isPlatformMaster) {
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
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
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
      targetPath = '/';
    } else if (isStoreSubdomain) {
      if (currentPage === 'admin') {
        targetPath = '/admin';
      } else if (currentPage === 'home') {
        targetPath = '/';
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
      } else {
        // e.g. shop, wishlist, orders, checkout
        targetPath = `/store/${activeStore.slug}?page=${currentPage}`;
      }
    }

    if (window.location.pathname + window.location.search !== targetPath) {
      window.history.replaceState({}, '', targetPath);
    }
  }, [currentPage, activeStore.id, activeStore.slug]);

  // Support browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const routing = detectInitialRouting(stores);
      setActiveStoreId(routing.storeId);
      setCurrentPage(routing.page);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [stores]);

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
    setToasts((prev) => [...prev, { id, type, title, message }]);
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
      ownerEmail: input.ownerEmail.trim() || `admin@${cleanSlug}.com`,
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
        supportEmail: input.ownerEmail.trim() || `support@${cleanSlug}.com`,
        currency: input.currency || '$',
        freeShippingThreshold: 100,
        standardShippingFee: 9.99,
        taxRate: 0.08,
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

  // Cart Management
  const addToCart = (product: Product, quantity = 1, color?: string) => {
    if (product.stock <= 0) {
      addToast(language === 'ar' ? 'المنتج غير متوفر بالمخزون' : 'Item is out of stock', 'error');
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
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
        return [...prev, { product, quantity: addQty, selectedColor: color }];
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

  // Orders Management
  const placeOrder = (
    shippingInfo: ShippingAddress, 
    paymentMethod: 'Credit Card' | 'Apple Pay' | 'PayPal' | 'Cash on Delivery'
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
      })),
      subtotal: cartSubtotal,
      discount: cartDiscount,
      shipping: cartShipping,
      tax: cartTax,
      total: cartTotal,
      status: 'processing',
      paymentMethod,
      trackingNumber: `${prefix}-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
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

      // Update customers
      const existingCustomer = store.customers.find(
        (c) => c.email.toLowerCase() === shippingInfo.email.toLowerCase()
      );
      let updatedCustomers: Customer[];
      if (existingCustomer) {
        updatedCustomers = store.customers.map((c) =>
          c.id === existingCustomer.id
            ? {
                ...c,
                ordersCount: c.ordersCount + 1,
                totalSpent: Number((c.totalSpent + cartTotal).toFixed(2)),
              }
            : c
        );
      } else {
        const newCust: Customer = {
          id: `cust-${Date.now()}`,
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
          city: shippingInfo.city,
          country: shippingInfo.country,
          ordersCount: 1,
          totalSpent: cartTotal,
          joinedDate: new Date().toISOString().split('T')[0],
        };
        updatedCustomers = [newCust, ...store.customers];
      }

      return {
        ...store,
        products: updatedProducts,
        orders: [newOrder, ...store.orders],
        customers: updatedCustomers,
      };
    });

    setLastPlacedOrder(newOrder);
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
        logoutStoreAdmin,

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
        wishlist,
        toggleWishlist,
        isInWishlist,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        coupons,
        addCoupon,
        toggleCouponStatus,
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
