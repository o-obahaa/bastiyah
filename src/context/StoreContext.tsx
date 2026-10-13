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
  plan: 'Starter' | 'Growth' | 'Enterprise';
  themeColor: StoreThemeColor;
  layoutStyle: StoreLayoutStyle;
  logoEmoji: string;
  currency?: string;
}

interface StoreContextType {
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

  // Customers (scoped to activeStore)
  customers: Customer[];

  // Settings (scoped to activeStore)
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;

  // Notifications
  toasts: ToastMessage[];
  addToast: (title: string, type?: ToastType, message?: string) => void;
  removeToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

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

  // Active Store ID
  const [activeStoreId, setActiveStoreId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const storeSlug = params.get('store');
      if (storeSlug) {
        const found = stores.find(
          (s) => s.slug.toLowerCase() === storeSlug.toLowerCase()
        );
        if (found) return found.id;
      }

      // Check hostname subdomain (e.g. panda.bastiyah.com or panda.localhost)
      const hostParts = window.location.hostname.split('.');
      if (hostParts.length >= 2 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
        const sub = hostParts[0].toLowerCase();
        const found = stores.find((s) => s.slug.toLowerCase() === sub);
        if (found) return found.id;
      }
    }
    const saved = localStorage.getItem('bastiyah_active_store_id');
    const existing = stores.find((s) => s.id === saved);
    return existing ? existing.id : stores[0]?.id || INITIAL_HOSTED_STORES[0].id;
  });

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

  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('bastiyah_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // UI state
  const [currentPage, setCurrentPage] = useState<ActivePage>('home');
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

  // Persist multi-store state
  useEffect(() => {
    localStorage.setItem('bastiyah_stores_v1', JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem('bastiyah_active_store_id', activeStore.id);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('store', activeStore.slug);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeStore.id, activeStore.slug]);

  useEffect(() => {
    localStorage.setItem('bastiyah_carts_v1', JSON.stringify(cartsByStore));
  }, [cartsByStore]);

  useEffect(() => {
    localStorage.setItem('bastiyah_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

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
    setActiveStoreId(found.id);
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedProductId(null);
    setAppliedCoupon(null);
    setCurrentPage(targetPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast(
      language === 'ar'
        ? `تم الانتقال إلى ${found.nameAr || found.name} (${found.slug}.bastiyah.com)`
        : `Switched to ${found.name} (${found.slug}.bastiyah.com)`,
      'info'
    );
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
      description: `Official Bastiyah web-store hosted at ${cleanSlug}.bastiyah.com.`,
      descriptionAr: `متجر إلكتروني رسمي مستضاف عبر منصة بسطية على الرابط ${cleanSlug}.bastiyah.com.`,
      category: input.category,
      categoryAr: input.categoryAr || input.category,
      ownerName: input.ownerName.trim() || 'Store Owner',
      ownerEmail: input.ownerEmail.trim() || `admin@${cleanSlug}.bastiyah.com`,
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
        supportEmail: input.ownerEmail.trim() || `support@${cleanSlug}.bastiyah.com`,
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
        ? `🎉 تم إطلاق المتجر بنجاح على ${cleanSlug}.bastiyah.com!`
        : `🎉 Store launched live at ${cleanSlug}.bastiyah.com!`,
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
        ? `تم حذف المتجر ${target?.slug}.bastiyah.com`
        : `Removed store ${target?.slug}.bastiyah.com`,
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

  // Wishlist Management
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast(language === 'ar' ? 'تمت الإزالة من المفضلة' : 'Removed from wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        addToast(language === 'ar' ? 'تم الحفظ في المفضلة!' : 'Saved to wishlist!', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

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
        customers,
        settings,
        updateSettings,
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
