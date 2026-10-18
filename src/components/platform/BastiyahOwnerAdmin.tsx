import React, { useState, useMemo, useRef } from 'react';
import {
  Crown,
  Globe,
  Plus,
  ExternalLink,
  Settings,
  Palette,
  Copy,
  Check,
  Trash2,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ShoppingBag,
  Store,
  Layers,
  Sparkles,
  CheckCircle2,
  Search,
  Link2,
  ArrowUpRight,
  Edit3,
  Database,
  Cloud,
  Server,
  Zap,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Download,
  Filter,
  X,
  ChevronDown,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Mail,
  User,
  Activity,
  AlertTriangle,
  ArrowUpDown,
  LogOut,
  KeyRound,
  Users,
  BarChart3,
  CreditCard,
  DollarSign,
  Package,
  Lock,
  Unlock,
  MessageCircle,
  FileText,
  Truck,
  Phone,
  Upload,
  Coins,
  FileJson,
  RotateCcw,
  CheckCheck
} from 'lucide-react';
import { ImageUploader } from '../common/ImageUploader';
import { useStore } from '../../context/StoreContext';
import { StoreThemeColor, StoreLayoutStyle, HostedStore, Order, OrderStatus } from '../../types';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getStoreDisplayUrl, getStorePathLabel, getFutureCustomDomainUrl } from '../../utils/urlUtils';

const EMOJI_OPTIONS = ['🐼', '👑', '🦢', '💎', '🌿', '⚡', '🏺', '👟', '⌚', '🎧', '🕯️', '🛍️', '👗', '☕', '🎨', '🏪'];

const CATEGORY_PRESETS = [
  { en: 'Clothing & Fashion', ar: 'أزياء وملابس' },
  { en: 'Beauty & Cosmetics', ar: 'تجميل ومستحضرات' },
  { en: 'Electronics & Tech', ar: 'إلكترونيات وتقنية' },
  { en: 'Perfumes & Oud', ar: 'عطور وعود فاخر' },
  { en: 'Home & Architecture', ar: 'منزل وديكور' },
  { en: 'Handmade & Crafts', ar: 'حرفيات وإبداع' },
  { en: 'Specialty Coffee & Artisan', ar: 'قهوة مختصة وحرفيات' },
];

export type OwnerAdminTab = 'stores' | 'analytics' | 'merchants' | 'orders' | 'plans' | 'settings';

export const BastiyahOwnerAdmin: React.FC = () => {
  const {
    stores,
    activeStore,
    switchStore,
    goToPlatform,
    createHostedStore,
    updateHostedStore,
    updateStoreDesign,
    deleteHostedStore,
    setAdminTab,
    language,
    setLanguage,
    t,
    addToast,
    isConvexConnected,
    isCloudflareConfigured,
    seedConvexDatabase,
    logoutPlatformAdmin,
    platformAdminEmail,
    updatePlatformAdminPassword,
    restorePlatformStores,
    resetStoresToDefault,
  } = useStore();

  // Active Main Tab
  const [activeOwnerTab, setActiveOwnerTab] = useState<OwnerAdminTab>('stores');

  // Cloud & Seeding states
  const [isSeeding, setIsSeeding] = useState(false);
  const [testImageUrl, setTestImageUrl] = useState('');
  const [showCloudSection, setShowCloudSection] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // View Mode for Stores tab: 'cards' vs 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Stores Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'Starter' | 'Growth' | 'Enterprise'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'revenue' | 'orders' | 'products' | 'name'>('newest');

  // Copy indicator & Modals
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<HostedStore | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<HostedStore | null>(null);

  // Edit Modal Form State
  const [editName, setEditName] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editTaglineAr, setEditTaglineAr] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editPlan, setEditPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [editStatus, setEditStatus] = useState<'active' | 'maintenance' | 'suspended'>('active');
  const [editThemeColor, setEditThemeColor] = useState<StoreThemeColor>('emerald');
  const [editLayoutStyle, setEditLayoutStyle] = useState<StoreLayoutStyle>('modern-split');
  const [editLogoEmoji, setEditLogoEmoji] = useState('🛍️');

  // Create Modal Form State
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreNameAr, setNewStoreNameAr] = useState('');
  const [newCustomSlug, setNewCustomSlug] = useState('');
  const [newSlugManuallyEdited, setNewSlugManuallyEdited] = useState(false);
  const [newTagline, setNewTagline] = useState('');
  const [newTaglineAr, setNewTaglineAr] = useState('');
  const [newCategoryIndex, setNewCategoryIndex] = useState(0);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('+964 770 123 4567');
  const [newAdminPassword, setNewAdminPassword] = useState('merchant123');
  const [newPlan, setNewPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [newThemeColor, setNewThemeColor] = useState<StoreThemeColor>('emerald');
  const [newLayoutStyle, setNewLayoutStyle] = useState<StoreLayoutStyle>('modern-split');
  const [newLogoEmoji, setNewLogoEmoji] = useState('🛍️');

  // Merchants Tab State
  const [merchantSearch, setMerchantSearch] = useState('');
  const [merchantPlanFilter, setMerchantPlanFilter] = useState<'all' | 'Starter' | 'Growth' | 'Enterprise'>('all');
  const [revealedPasswordStoreId, setRevealedPasswordStoreId] = useState<string | null>(null);

  // Orders Tab State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStoreFilter, setOrderStoreFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<(Order & {
    storeId: string;
    storeName: string;
    storeNameAr?: string;
    storeSlug: string;
    storeLogoEmoji: string;
    storeThemeColor: StoreThemeColor;
  }) | null>(null);

  // Settings Tab State
  const [newAdminPasswordInput, setNewAdminPasswordInput] = useState('');
  const [confirmAdminPasswordInput, setConfirmAdminPasswordInput] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const restoreFileInputRef = useRef<HTMLInputElement>(null);

  // Open Edit Modal
  const openEditModal = (store: HostedStore) => {
    setEditingStore(store);
    setEditName(store.name);
    setEditNameAr(store.nameAr || store.name);
    setEditSlug(store.slug);
    setEditTagline(store.tagline || '');
    setEditTaglineAr(store.taglineAr || '');
    setEditCategory(store.category);
    setEditOwnerName(store.ownerName);
    setEditOwnerEmail(store.ownerEmail);
    setEditOwnerPhone(store.ownerPhone || '+964 770 123 4567');
    setEditAdminPassword(store.adminPassword || 'merchant123');
    setEditPlan(store.plan);
    setEditStatus(store.status);
    setEditThemeColor(store.design.themeColor);
    setEditLayoutStyle(store.design.layoutStyle);
    setEditLogoEmoji(store.design.logoEmoji);
  };

  const handleSaveEditStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    const cleanedSlug = editSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/^-|-$/g, '');

    if (!cleanedSlug || cleanedSlug.length < 2) {
      addToast(language === 'ar' ? 'الرابط قصير جداً' : 'Slug is too short', 'error');
      return;
    }

    const isDuplicateSlug = stores.some(
      (s) => s.id !== editingStore.id && s.slug.toLowerCase() === cleanedSlug
    );

    if (isDuplicateSlug) {
      addToast(language === 'ar' ? 'الرابط مستخدم من متجر آخر' : 'Subdomain is already taken', 'error');
      return;
    }

    // Save Store Info Updates
    updateHostedStore(editingStore.id, {
      name: editName.trim(),
      nameAr: editNameAr.trim() || editName.trim(),
      slug: cleanedSlug,
      tagline: editTagline.trim(),
      taglineAr: editTaglineAr.trim() || editTagline.trim(),
      category: editCategory,
      ownerName: editOwnerName.trim() || 'Store Merchant',
      ownerEmail: editOwnerEmail.trim(),
      ownerPhone: editOwnerPhone.trim(),
      adminPassword: editAdminPassword.trim() || 'merchant123',
      plan: editPlan,
      status: editStatus,
    });

    // Save Design Updates
    updateStoreDesign(
      {
        themeColor: editThemeColor,
        layoutStyle: editLayoutStyle,
        logoEmoji: editLogoEmoji,
      },
      editingStore.id
    );

    setEditingStore(null);
  };

  // Quick Status Toggle on Any Store
  const handleToggleStoreStatus = (store: HostedStore, newStatus: 'active' | 'maintenance' | 'suspended') => {
    updateHostedStore(store.id, { status: newStatus });
    addToast(
      language === 'ar'
        ? `تم تحديث حالة متجر (${store.name}) إلى: ${newStatus === 'active' ? 'نشط' : newStatus === 'maintenance' ? 'صيانة' : 'معلق'}`
        : `Store (${store.name}) status updated to: ${newStatus}`,
      'success'
    );
  };

  // Quick Plan Change for Plans tab
  const handleQuickPlanChange = (storeId: string, newPlan: 'Starter' | 'Growth' | 'Enterprise') => {
    updateHostedStore(storeId, { plan: newPlan });
    const targetStore = stores.find((s) => s.id === storeId);
    addToast(
      language === 'ar'
        ? `تم تحديث باقة متجر (${targetStore?.name || storeId}) إلى: ${newPlan}`
        : `Updated store (${targetStore?.name || storeId}) plan to: ${newPlan}`,
      'success'
    );
  };

  // Auto-generate clean slug from newStoreName unless manually edited
  const handleNewStoreNameChange = (val: string) => {
    setNewStoreName(val);
    if (!newSlugManuallyEdited) {
      const auto = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setNewCustomSlug(auto);
    }
  };

  const normalizedNewSlug = newCustomSlug.replace(/^-|-$/g, '');
  const isNewSlugTaken = stores.some(
    (s) => s.slug.toLowerCase() === normalizedNewSlug.toLowerCase()
  );
  const isNewSlugValid = normalizedNewSlug.length >= 2 && !isNewSlugTaken;

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      addToast(
        language === 'ar' ? 'يرجى إدخال اسم المتجر' : 'Please enter a store name',
        'error'
      );
      return;
    }
    if (!isNewSlugValid) {
      addToast(
        language === 'ar'
          ? 'يرجى اختيار رابط فرعي صالح وغير مستخدم'
          : 'Please choose a valid, available subdomain slug',
        'error'
      );
      return;
    }

    const chosenCat = CATEGORY_PRESETS[newCategoryIndex];
    const created = createHostedStore({
      name: newStoreName,
      nameAr: newStoreNameAr || newStoreName,
      slug: normalizedNewSlug,
      tagline: newTagline || `Curated ${chosenCat.en} hosted on Bastiyah`,
      taglineAr: newTaglineAr || `أفضل منتجات ${chosenCat.ar} عبر منصة بسطية`,
      category: chosenCat.en,
      categoryAr: chosenCat.ar,
      ownerName: newOwnerName || 'Store Merchant',
      ownerEmail: newOwnerEmail || `merchant@${normalizedNewSlug}.bastiyah.com`,
      ownerPhone: newOwnerPhone.trim() || '+964 770 123 4567',
      adminPassword: newAdminPassword.trim() || 'merchant123',
      plan: newPlan,
      themeColor: newThemeColor,
      layoutStyle: newLayoutStyle,
      logoEmoji: newLogoEmoji,
    });

    // Reset Form
    setNewStoreName('');
    setNewStoreNameAr('');
    setNewCustomSlug('');
    setNewSlugManuallyEdited(false);
    setNewTagline('');
    setNewTaglineAr('');
    setNewOwnerName('');
    setNewOwnerEmail('');
    setNewOwnerPhone('+964 770 123 4567');
    setNewAdminPassword('merchant123');
    setShowCreateModal(false);

    // Switch active store
    switchStore(created.id, 'bastiyah-admin');
  };

  const handleCopyStoreLink = (store: HostedStore) => {
    const link = getStoreDisplayUrl(store.slug);
    navigator.clipboard?.writeText(link);
    setCopiedId(store.id);
    addToast(`${t.linkCopied}: ${link}`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    addToast(`${label}: ${text}`, 'info');
  };

  // Export Stores List as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Name (EN)', 'Name (AR)', 'Subdomain', 'URL', 'Plan', 'Status', 'Category', 'Owner Name', 'Owner Email', 'Products Count', 'Orders Count', 'Total Revenue ($)', 'Created At'];
    const rows = stores.map((s) => {
      const revenue = s.orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);
      return [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        `"${(s.nameAr || s.name).replace(/"/g, '""')}"`,
        s.slug,
        getStoreDisplayUrl(s.slug),
        s.plan,
        s.status,
        `"${s.category}"`,
        `"${s.ownerName.replace(/"/g, '""')}"`,
        s.ownerEmail,
        s.products.length,
        s.orders.length,
        revenue.toFixed(2),
        s.createdAt || 'N/A'
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bastiyah-stores-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(language === 'ar' ? 'تم تصدير تقرير المتاجر بنجاح' : 'Stores report exported successfully', 'success');
  };

  // Export Complete Platform Snapshot as JSON
  const handleExportJSON = () => {
    const backupData = {
      version: '2.4',
      exportedAt: new Date().toISOString(),
      platform: 'Bastiyah Multi-Tenant Cloud',
      storesCount: stores.length,
      stores,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(backupData, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `bastiyah-platform-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast(
      language === 'ar' ? 'تم تنزيل النسخة الاحتياطية الكاملة للمنصة بنجاح' : 'Full platform JSON backup downloaded successfully',
      'success'
    );
  };

  // Restore Platform Snapshot from JSON
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        const storesToRestore = Array.isArray(parsed) ? parsed : parsed.stores;
        if (Array.isArray(storesToRestore) && storesToRestore.length > 0) {
          restorePlatformStores(storesToRestore);
        } else {
          addToast(language === 'ar' ? 'ملف النسخة الاحتياطية غير صالح' : 'Invalid backup file structure', 'error');
        }
      } catch (err) {
        addToast(language === 'ar' ? 'فشل قراءة ملف النسخة الاحتياطية' : 'Failed to parse JSON file', 'error');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  // Handle Admin Password Change
  const handleUpdateAdminPasswordForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPasswordInput.length < 6) {
      addToast(
        language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Password must be at least 6 characters',
        'error'
      );
      return;
    }
    if (newAdminPasswordInput !== confirmAdminPasswordInput) {
      addToast(
        language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
        'error'
      );
      return;
    }
    updatePlatformAdminPassword(newAdminPasswordInput);
    setNewAdminPasswordInput('');
    setConfirmAdminPasswordInput('');
  };

  // Aggregated Platform KPIs
  const totalStores = stores.length;
  const activeCount = stores.filter((s) => s.status === 'active').length;
  const maintenanceCount = stores.filter((s) => s.status === 'maintenance').length;
  const suspendedCount = stores.filter((s) => s.status === 'suspended').length;
  const totalPlatformProducts = stores.reduce((acc, s) => acc + s.products.length, 0);

  // Flatten all orders across all hosted stores
  const allOrdersFlat = useMemo(() => {
    const list: Array<Order & {
      storeId: string;
      storeName: string;
      storeNameAr?: string;
      storeSlug: string;
      storeLogoEmoji: string;
      storeThemeColor: StoreThemeColor;
    }> = [];
    stores.forEach((store) => {
      store.orders.forEach((ord) => {
        list.push({
          ...ord,
          storeId: store.id,
          storeName: store.name,
          storeNameAr: store.nameAr,
          storeSlug: store.slug,
          storeLogoEmoji: store.design.logoEmoji,
          storeThemeColor: store.design.themeColor,
        });
      });
    });
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [stores]);

  const totalPlatformOrders = allOrdersFlat.length;
  const totalPlatformRevenue = allOrdersFlat
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = totalPlatformOrders > 0 ? totalPlatformRevenue / totalPlatformOrders : 0;

  // MRR & ARR Calculations
  const starterCount = stores.filter((s) => s.plan === 'Starter').length;
  const growthCount = stores.filter((s) => s.plan === 'Growth').length;
  const enterpriseCount = stores.filter((s) => s.plan === 'Enterprise').length;
  const mrr = growthCount * 29 + enterpriseCount * 99;
  const arr = mrr * 12;

  // Filtered & Sorted Stores for Tab 1
  const processedStores = useMemo(() => {
    let result = stores.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (planFilter !== 'all' && s.plan !== planFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesNameAr = (s.nameAr || '').toLowerCase().includes(q);
        const matchesSlug = s.slug.toLowerCase().includes(q);
        const matchesOwner = s.ownerName.toLowerCase().includes(q);
        const matchesEmail = s.ownerEmail.toLowerCase().includes(q);
        const matchesCategory = s.category.toLowerCase().includes(q);
        return matchesName || matchesNameAr || matchesSlug || matchesOwner || matchesEmail || matchesCategory;
      }
      return true;
    });

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
        break;
      case 'revenue':
        result.sort((a, b) => {
          const revA = a.orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
          const revB = b.orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
          return revB - revA;
        });
        break;
      case 'orders':
        result.sort((a, b) => b.orders.length - a.orders.length);
        break;
      case 'products':
        result.sort((a, b) => b.products.length - a.products.length);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        result.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        break;
    }

    return result;
  }, [stores, statusFilter, planFilter, searchQuery, sortBy]);

  // Filtered Merchants for Tab 3
  const processedMerchants = useMemo(() => {
    return stores.filter((s) => {
      if (merchantPlanFilter !== 'all' && s.plan !== merchantPlanFilter) return false;
      if (merchantSearch.trim()) {
        const q = merchantSearch.toLowerCase();
        const matchesOwner = s.ownerName.toLowerCase().includes(q);
        const matchesEmail = s.ownerEmail.toLowerCase().includes(q);
        const matchesPhone = (s.ownerPhone || '').toLowerCase().includes(q);
        const matchesStore = s.name.toLowerCase().includes(q) || (s.nameAr || '').toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
        return matchesOwner || matchesEmail || matchesPhone || matchesStore;
      }
      return true;
    });
  }, [stores, merchantPlanFilter, merchantSearch]);

  // Filtered Orders for Tab 4
  const processedOrders = useMemo(() => {
    return allOrdersFlat.filter((ord) => {
      if (orderStoreFilter !== 'all' && ord.storeId !== orderStoreFilter) return false;
      if (orderStatusFilter !== 'all' && ord.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchesId = ord.id.toLowerCase().includes(q);
        const matchesCustomer = ord.customer.fullName.toLowerCase().includes(q) || ord.customer.email.toLowerCase().includes(q) || ord.customer.phone.toLowerCase().includes(q);
        const matchesCity = ord.customer.city.toLowerCase().includes(q);
        return matchesId || matchesCustomer || matchesCity;
      }
      return true;
    });
  }, [allOrdersFlat, orderStoreFilter, orderStatusFilter, orderSearch]);

  // Top Stores Leaderboard for Tab 2
  const topStoresLeaderboard = useMemo(() => {
    return [...stores]
      .map((s) => {
        const rev = s.orders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.total, 0);
        return {
          store: s,
          revenue: rev,
          orderCount: s.orders.length,
          productCount: s.products.length,
          aov: s.orders.length > 0 ? rev / s.orders.length : 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [stores]);

  // Category breakdown for Tab 2
  const categoryStats = useMemo(() => {
    const map = new Map<string, { count: number; products: number; revenue: number; en: string; ar: string }>();
    CATEGORY_PRESETS.forEach((cat) => {
      map.set(cat.en, { count: 0, products: 0, revenue: 0, en: cat.en, ar: cat.ar });
    });
    stores.forEach((s) => {
      const rev = s.orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
      const entry = map.get(s.category) || { count: 0, products: 0, revenue: 0, en: s.category, ar: s.category };
      entry.count += 1;
      entry.products += s.products.length;
      entry.revenue += rev;
      map.set(s.category, entry);
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [stores]);

  // Order status counts
  const orderStatusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    allOrdersFlat.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status] += 1;
      }
    });
    return counts;
  }, [allOrdersFlat]);

  const OWNER_TABS = [
    {
      id: 'stores' as OwnerAdminTab,
      labelAr: 'المتاجر المسجلة',
      labelEn: 'Registered Stores',
      icon: Store,
      count: totalStores,
    },
    {
      id: 'analytics' as OwnerAdminTab,
      labelAr: 'التحليلات والمبيعات',
      labelEn: 'Analytics & GMV',
      icon: BarChart3,
    },
    {
      id: 'merchants' as OwnerAdminTab,
      labelAr: 'دليل التجار',
      labelEn: 'Merchants Directory',
      icon: Users,
      count: stores.length,
    },
    {
      id: 'orders' as OwnerAdminTab,
      labelAr: 'خلاصة الطلبات',
      labelEn: 'Live Orders Feed',
      icon: ShoppingBag,
      count: totalPlatformOrders,
    },
    {
      id: 'plans' as OwnerAdminTab,
      labelAr: 'الاشتراكات والفوترة',
      labelEn: 'Plans & MRR',
      icon: CreditCard,
    },
    {
      id: 'settings' as OwnerAdminTab,
      labelAr: 'إعدادات المنصة',
      labelEn: 'Platform Settings',
      icon: Settings,
    },
  ];

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">قيد الانتظار • Pending</span>;
      case 'processing':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">قيد التجهيز • Processing</span>;
      case 'shipped':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">تم الشحن • Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">تم التوصيل • Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">ملغي • Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 selection:bg-amber-500 selection:text-slate-950">
      
      {/* 
        ========================================================================
        1. MASTER ADMIN NAVIGATION BAR
        ========================================================================
      */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Platform Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToPlatform('landing')}
              className="flex items-center gap-3 group text-start"
              title="Return to Bastiyah Main Landing Page"
            >
              <img
                src="/bastiyah-emblem.png"
                alt="بسطية"
                className="w-10 h-10 object-contain shrink-0 transition-transform group-hover:scale-105 pointer-events-none"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-brand font-black text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                    بسطية
                  </span>
                  <span className="text-stone-500 font-light text-xs">|</span>
                  <span className="text-xs font-bold text-amber-500 tracking-wider font-sans uppercase">
                    BASTIYAH
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Owner SaaS Console
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              </div>
            </button>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Export CSV */}
            <button
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Export all stores to CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            {/* Cloud Infra Quick Toggle */}
            <button
              onClick={() => setShowCloudSection(!showCloudSection)}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                showCloudSection
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'ar' ? 'السحابة' : 'Cloud'}</span>
            </button>

            {/* Create New Store CTA Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'متجر جديد' : 'New Store'}</span>
            </button>

            {/* Back to Platform Landing */}
            <button
              onClick={() => goToPlatform('landing')}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Return to Main Landing Page"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الموقع' : 'Site'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Authenticated Platform Admin Pill & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 ps-1.5 sm:ps-2 border-s border-slate-800">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-mono text-slate-300" dir="ltr">{platformAdminEmail}</span>
              </div>

              <button
                onClick={logoutPlatformAdmin}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 transition-colors"
                title={language === 'ar' ? 'تسجيل الخروج من لوحة تحكم المنصة' : 'Log Out of Platform Admin'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'ar' ? 'خروج' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        
        {/* 
          ========================================================================
          2. OWNER NAVIGATION TABS
          ========================================================================
        */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'لوحة تحكم مالك المنصة' : 'Bastiyah Platform Owner Portal'}</span>
              <span>•</span>
              <span className="font-mono text-[11px]">Core v2.4 Enterprise</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-brand tracking-tight">
              {language === 'ar' ? 'مركز قيادة منصة بسطية السحابية' : 'Bastiyah Platform Command Center'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              MRR: <strong className="text-emerald-400">${mrr.toLocaleString()}</strong> | GMV: <strong className="text-amber-400">${totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
          </div>
        </div>

        {/* Tab Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {OWNER_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeOwnerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveOwnerTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shrink-0 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-400'}`} />
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 
          ========================================================================
          3. CLOUD INFRASTRUCTURE DRAWER (TOGGLEABLE)
          ========================================================================
        */}
        {showCloudSection && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-brand">
                    {language === 'ar' ? 'حالة البنية التحتية السحابية وقاعدة البيانات' : 'Cloud Database & Media Engine'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Convex Realtime DB + Cloudflare R2 Global Picture Storage
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsSeeding(true);
                  try {
                    await seedConvexDatabase();
                  } finally {
                    setIsSeeding(false);
                  }
                }}
                disabled={isSeeding}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>
                  {isSeeding
                    ? (language === 'ar' ? 'جارٍ المزامنة...' : 'Syncing...')
                    : (language === 'ar' ? 'مزامنة مع Convex' : 'Sync to Convex')}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-400" />
                    Convex DB
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isConvexConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {isConvexConnected ? 'Connected & Live' : 'Local Fallback Ready'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {language === 'ar'
                    ? 'قاعدة بيانات Convex اللحظية تعزل بيانات كل متجر عبر storeId وتتزامن تلقائياً.'
                    : 'Real-time multi-tenant sync partitioned strictly by storeId.'}
                </p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    Cloudflare R2
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400">
                    CDN: images.bastiyah.com
                  </span>
                </div>
                <ImageUploader
                  value={testImageUrl}
                  onChange={(url) => setTestImageUrl(url)}
                  label="Media Upload Stream Test"
                  labelAr="اختبار رفع وسائط سريع"
                  helperText="Upload any picture to verify Cloudflare R2 stream"
                  aspectRatio="video"
                />
              </div>
            </div>
          </div>
        )}

        {/* 
          ========================================================================
          TAB 1: REGISTERED STORES (المتاجر المسجلة)
          ========================================================================
        */}
        {activeOwnerTab === 'stores' && (
          <div className="space-y-6">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === 'ar' ? 'إجمالي المتاجر' : 'Total Stores'}
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Store className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-2 font-brand">{totalStores}</p>
                <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-slate-400">
                  <span className="text-emerald-400 font-bold">{activeCount} {language === 'ar' ? 'نشط' : 'active'}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{maintenanceCount} {language === 'ar' ? 'صيانة' : 'maint.'}</span>
                  {suspendedCount > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-rose-400 font-bold">{suspendedCount} {language === 'ar' ? 'معلق' : 'suspended'}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === 'ar' ? 'إجمالي المبيعات (GMV)' : 'Platform GMV'}
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-emerald-400 mt-2 font-brand">
                  ${totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-400 mt-2 font-normal">
                  {language === 'ar' ? 'مبيعات جميع المتاجر المستضافة' : 'Across all hosted storefronts'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-2 font-brand">{totalPlatformOrders}</p>
                <p className="text-xs text-slate-400 mt-2 font-normal">
                  {language === 'ar' ? 'طلبات مكتملة وقيد المعالجة' : 'Orders received on network'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {language === 'ar' ? 'إجمالي المنتجات' : 'Hosted Products'}
                  </span>
                  <div className="w-9 h-9 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-black text-white mt-2 font-brand">{totalPlatformProducts}</p>
                <p className="text-xs text-slate-400 mt-2 font-normal">
                  {language === 'ar' ? 'منتج معزول في كتالوج المتاجر' : 'Isolated catalog items'}
                </p>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', labelAr: 'جميع المتاجر', labelEn: 'All Stores', count: totalStores },
                    { id: 'active', labelAr: 'النشطة', labelEn: 'Active', count: activeCount },
                    { id: 'maintenance', labelAr: 'تحت الصيانة', labelEn: 'Maintenance', count: maintenanceCount },
                    { id: 'suspended', labelAr: 'المعلقة', labelEn: 'Suspended', count: suspendedCount },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        statusFilter === tab.id
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-slate-900 text-slate-400'}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      viewMode === 'table' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'جدول' : 'Table'}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      viewMode === 'cards' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">{language === 'ar' ? 'بطاقات' : 'Cards'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'ابحث باسم المتجر، الرابط (slug)، أو اسم المالك...'
                        : 'Search by store name, slug, owner name or email...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع الباقات' : 'All Hosting Plans'}</option>
                    <option value="Starter">Starter ($0)</option>
                    <option value="Growth">Growth ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="newest">{language === 'ar' ? 'الأحدث تسجيلاً' : 'Newest First'}</option>
                    <option value="oldest">{language === 'ar' ? 'الأقدم تسجيلاً' : 'Oldest First'}</option>
                    <option value="revenue">{language === 'ar' ? 'الأعلى مبيعاً' : 'Highest Revenue'}</option>
                    <option value="orders">{language === 'ar' ? 'الأكثر طلباً' : 'Most Orders'}</option>
                    <option value="products">{language === 'ar' ? 'الأكثر منتجات' : 'Most Products'}</option>
                    <option value="name">{language === 'ar' ? 'أبجدياً (A-Z)' : 'Name (A-Z)'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stores List: Table or Cards */}
            {processedStores.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Store className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-brand">
                  {language === 'ar' ? 'لا توجد متاجر تطابق بحثك' : 'No Stores Found Matching Your Criteria'}
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {language === 'ar'
                    ? 'جرّب تغيير كلمات البحث أو فلتر الحالة لعرض المتاجر المسجلة.'
                    : 'Try clearing your search query or adjusting your status filters.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPlanFilter('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-colors"
                >
                  {language === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
                </button>
              </div>
            ) : viewMode === 'table' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-4 text-start">{language === 'ar' ? 'المتجر والرابط' : 'Store & Subdomain'}</th>
                        <th className="py-4 px-4 text-start">{language === 'ar' ? 'المالك والاتصال' : 'Owner & Contact'}</th>
                        <th className="py-4 px-4 text-center">{language === 'ar' ? 'الباقة' : 'Plan'}</th>
                        <th className="py-4 px-4 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="py-4 px-4 text-center">{language === 'ar' ? 'المنتجات / الطلبات' : 'Products / Orders'}</th>
                        <th className="py-4 px-4 text-center">{language === 'ar' ? 'المبيعات ($)' : 'Revenue ($)'}</th>
                        <th className="py-4 px-4 text-end">{language === 'ar' ? 'إجراءات الإدارة' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {processedStores.map((store) => {
                        const storeTheme = THEME_CONFIGS[store.design.themeColor] || THEME_CONFIGS.emerald;
                        const storeRevenue = store.orders
                          .filter((o) => o.status !== 'cancelled')
                          .reduce((sum, o) => sum + o.total, 0);

                        return (
                          <tr key={store.id} className="hover:bg-slate-800/40 transition-colors group">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-white/10 shadow-sm"
                                  style={{ backgroundColor: `${storeTheme.hex}25` }}
                                >
                                  {store.design.logoEmoji}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-brand font-black text-white text-sm">
                                      {language === 'ar' ? store.nameAr || store.name : store.name}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                      {store.category}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 mt-1" dir="ltr">
                                    <button
                                      onClick={() => switchStore(store.id, 'home')}
                                      className="font-mono text-xs text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
                                    >
                                      <span>{store.slug}.bastiyah.com</span>
                                      <ArrowUpRight className="w-3 h-3 opacity-60" />
                                    </button>
                                    <button
                                      onClick={() => handleCopyStoreLink(store)}
                                      className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                                      title="Copy link"
                                    >
                                      {copiedId === store.id ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="text-xs">
                                <p className="font-bold text-slate-200">{store.ownerName}</p>
                                <p className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                                  {store.ownerEmail}
                                </p>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  store.plan === 'Enterprise'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : store.plan === 'Growth'
                                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {store.plan}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <select
                                value={store.status}
                                onChange={(e) => handleToggleStoreStatus(store, e.target.value as any)}
                                className={`text-xs font-bold px-2 py-1 rounded-xl border appearance-none cursor-pointer text-center focus:outline-none transition-colors ${
                                  store.status === 'active'
                                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                    : store.status === 'maintenance'
                                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                }`}
                              >
                                <option value="active" className="bg-slate-900 text-emerald-400">
                                  {language === 'ar' ? '● نشط (Active)' : '● Active'}
                                </option>
                                <option value="maintenance" className="bg-slate-900 text-amber-400">
                                  {language === 'ar' ? '● صيانة (Maintenance)' : '● Maintenance'}
                                </option>
                                <option value="suspended" className="bg-slate-900 text-rose-400">
                                  {language === 'ar' ? '● معلق (Suspended)' : '● Suspended'}
                                </option>
                              </select>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-center gap-2 text-xs">
                                <span className="text-slate-300 font-bold">{store.products.length} {language === 'ar' ? 'منتج' : 'prod'}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-slate-300 font-bold">{store.orders.length} {language === 'ar' ? 'طلب' : 'ord'}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span className="font-mono font-black text-emerald-400 text-sm">
                                ${storeRevenue.toFixed(2)}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-end">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(store)}
                                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                  title={language === 'ar' ? 'تعديل بيانات المتجر' : 'Edit Store Details'}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => {
                                    switchStore(store.id, 'admin');
                                    setAdminTab('dashboard');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
                                  title={language === 'ar' ? 'الدخول كمسؤول للمتجر' : 'Manage Store Admin'}
                                >
                                  <Settings className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">{language === 'ar' ? 'إدارة' : 'Manage'}</span>
                                </button>

                                <button
                                  onClick={() => switchStore(store.id, 'home')}
                                  className="px-2.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-opacity hover:opacity-90"
                                  style={{ backgroundColor: storeTheme.hex }}
                                  title={language === 'ar' ? 'زيارة المتجر' : 'Visit Live Storefront'}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">{language === 'ar' ? 'زيارة' : 'Visit'}</span>
                                </button>

                                {stores.length > 1 && (
                                  <button
                                    onClick={() => setStoreToDelete(store)}
                                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                                    title={t.deleteStore}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedStores.map((store) => {
                  const storeTheme = THEME_CONFIGS[store.design.themeColor] || THEME_CONFIGS.emerald;
                  const storeRevenue = store.orders
                    .filter((o) => o.status !== 'cancelled')
                    .reduce((sum, o) => sum + o.total, 0);

                  return (
                    <div
                      key={store.id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex flex-col justify-between shadow-lg transition-all hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-white/10 shadow-sm"
                              style={{ backgroundColor: `${storeTheme.hex}25` }}
                            >
                              {store.design.logoEmoji}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-white font-brand">
                                  {language === 'ar' ? store.nameAr || store.name : store.name}
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                                  {store.plan}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                                {language === 'ar' ? store.taglineAr || store.tagline : store.tagline}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(store)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {stores.length > 1 && (
                              <button
                                onClick={() => setStoreToDelete(store)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Subdomain Pill */}
                        <div className="mt-4 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 truncate" dir="ltr">
                            <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="font-mono text-xs text-slate-300 truncate font-semibold">
                              {store.slug}.bastiyah.com
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyStoreLink(store)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                            title="Copy link"
                          >
                            {copiedId === store.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Owner & Metrics */}
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">
                              {language === 'ar' ? 'المالك' : 'Merchant'}
                            </span>
                            <span className="font-bold text-slate-200 truncate block mt-0.5">
                              {store.ownerName}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold">
                              {language === 'ar' ? 'المبيعات' : 'Revenue'}
                            </span>
                            <span className="font-mono font-black text-emerald-400 block mt-0.5">
                              ${storeRevenue.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 mt-4 px-1">
                          <span>{store.products.length} {language === 'ar' ? 'منتج معروض' : 'products'}</span>
                          <span>{store.orders.length} {language === 'ar' ? 'طلب مسجل' : 'orders'}</span>
                          <span className="capitalize text-slate-300 font-semibold">{store.status}</span>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-800 flex items-center gap-2">
                        <button
                          onClick={() => {
                            switchStore(store.id, 'admin');
                            setAdminTab('dashboard');
                          }}
                          className="flex-1 py-2 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'إدارة المتجر' : 'Store Admin'}</span>
                        </button>

                        <button
                          onClick={() => switchStore(store.id, 'home')}
                          className="flex-1 py-2 px-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-opacity hover:opacity-90"
                          style={{ backgroundColor: storeTheme.hex }}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'زيارة المتجر' : 'Visit Store'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 
          ========================================================================
          TAB 2: ANALYTICS & PLATFORM GMV (التحليلات والمبيعات)
          ========================================================================
        */}
        {activeOwnerTab === 'analytics' && (
          <div className="space-y-6">
            {/* High-level Intelligence Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-3">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'مؤشرات أداء شبكة بسطية اللحظية' : 'Live Platform GMV & Intelligence'}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-white font-brand">
                    ${totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                    {language === 'ar'
                      ? 'إجمالي قيمة المعاملات التجارية (GMV) المنفذة عبر كافة المتاجر المستضافة بنجاح، باستثناء الطلبات الملغاة.'
                      : 'Gross Merchandise Value processed seamlessly across all multi-tenant stores, excluding cancellations.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">{language === 'ar' ? 'متوسط قيمة الطلب' : 'Average Order'}</span>
                    <span className="text-xl font-black text-amber-400 font-mono mt-1 block">
                      ${averageOrderValue.toFixed(2)}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center">
                    <span className="text-[11px] text-slate-400 font-bold block">{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</span>
                    <span className="text-xl font-black text-white font-mono mt-1 block">
                      {totalPlatformOrders}
                    </span>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 font-bold block">{language === 'ar' ? 'نسبة المتاجر النشطة' : 'Active Ratio'}</span>
                    <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                      {totalStores > 0 ? `${Math.round((activeCount / totalStores) * 100)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Network Order Status Pipeline */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white font-brand mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                <span>{language === 'ar' ? 'حالة توزيع الطلبات عبر الشبكة' : 'Network Order Status Pipeline'}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-950/70 border border-amber-500/20 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-amber-400 block">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{orderStatusCounts.pending}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {totalPlatformOrders > 0 ? `${Math.round((orderStatusCounts.pending / totalPlatformOrders) * 100)}%` : '0%'}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-sky-500/20 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-sky-400 block">{language === 'ar' ? 'قيد التجهيز' : 'Processing'}</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{orderStatusCounts.processing}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {totalPlatformOrders > 0 ? `${Math.round((orderStatusCounts.processing / totalPlatformOrders) * 100)}%` : '0%'}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-indigo-500/20 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-indigo-400 block">{language === 'ar' ? 'تم الشحن' : 'Shipped'}</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{orderStatusCounts.shipped}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {totalPlatformOrders > 0 ? `${Math.round((orderStatusCounts.shipped / totalPlatformOrders) * 100)}%` : '0%'}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-emerald-500/20 rounded-2xl p-4 text-center">
                  <span className="text-xs font-bold text-emerald-400 block">{language === 'ar' ? 'تم التوصيل' : 'Delivered'}</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{orderStatusCounts.delivered}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {totalPlatformOrders > 0 ? `${Math.round((orderStatusCounts.delivered / totalPlatformOrders) * 100)}%` : '0%'}
                  </span>
                </div>

                <div className="bg-slate-950/70 border border-rose-500/20 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                  <span className="text-xs font-bold text-rose-400 block">{language === 'ar' ? 'ملغي' : 'Cancelled'}</span>
                  <span className="text-2xl font-black text-white font-mono mt-1 block">{orderStatusCounts.cancelled}</span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {totalPlatformOrders > 0 ? `${Math.round((orderStatusCounts.cancelled / totalPlatformOrders) * 100)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Stores Leaderboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-brand flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>{language === 'ar' ? 'ترتيب المتاجر الأعلى مبيعاً (Leaderboard)' : 'Top Performing Stores Leaderboard'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar' ? 'مرتبة بحسب إجمالي المبيعات المحققة' : 'Ranked by cumulative Gross Merchandise Value'}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3 text-center w-12">#</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'المتجر' : 'Store'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'التصنيف والباقة' : 'Category & Plan'}</th>
                      <th className="py-3 px-3 text-center">{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                      <th className="py-3 px-3 text-center">{language === 'ar' ? 'متوسط الطلب' : 'AOV'}</th>
                      <th className="py-3 px-3 text-end">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Revenue'}</th>
                      <th className="py-3 px-3 text-end">{language === 'ar' ? 'إجراء' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {topStoresLeaderboard.map((item, index) => {
                      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                      return (
                        <tr key={item.store.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 text-center font-bold text-amber-400 text-sm">
                            {medal}
                          </td>

                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl select-none">{item.store.design.logoEmoji}</span>
                              <div>
                                <span className="font-bold text-white block">
                                  {language === 'ar' ? item.store.nameAr || item.store.name : item.store.name}
                                </span>
                                <span className="text-[11px] text-slate-400 font-mono" dir="ltr">
                                  {item.store.slug}.bastiyah.com
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="text-xs text-slate-300 block">{item.store.category}</span>
                            <span className="text-[10px] font-bold text-indigo-400">{item.store.plan}</span>
                          </td>

                          <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                            {item.orderCount}
                          </td>

                          <td className="py-3 px-3 text-center font-mono text-slate-300">
                            ${item.aov.toFixed(2)}
                          </td>

                          <td className="py-3 px-3 text-end font-mono font-black text-emerald-400 text-sm">
                            ${item.revenue.toFixed(2)}
                          </td>

                          <td className="py-3 px-3 text-end">
                            <button
                              onClick={() => {
                                switchStore(item.store.id, 'admin');
                                setAdminTab('dashboard');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold inline-flex items-center gap-1"
                            >
                              <span>{language === 'ar' ? 'إدارة' : 'Manage'}</span>
                              <ArrowUpRight className="w-3 h-3 text-amber-400" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Performance Matrix */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white font-brand mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>{language === 'ar' ? 'أداء القطاعات والأنشطة التجارية' : 'Category Performance Matrix'}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((cat) => {
                  const percentOfTotal = totalPlatformRevenue > 0 ? (cat.revenue / totalPlatformRevenue) * 100 : 0;
                  return (
                    <div key={cat.en} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {language === 'ar' ? cat.ar : cat.en}
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-400">
                          ${cat.revenue.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span>{cat.count} {language === 'ar' ? 'متجر' : 'stores'}</span>
                        <span>{cat.products} {language === 'ar' ? 'منتج' : 'products'}</span>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-3">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(percentOfTotal, 5))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 
          ========================================================================
          TAB 3: MERCHANTS DIRECTORY (دليل التجار)
          ========================================================================
        */}
        {activeOwnerTab === 'merchants' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-brand">
                    {language === 'ar' ? 'سجل التجار وأصحاب المتاجر' : 'Merchants & Store Owners Registry'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar'
                      ? 'قائمة بجميع التجار المسجلين في المنصة وبيانات التواصل وكلمات المرور الخاصة بهم.'
                      : 'All registered store merchants, emails, direct login credentials, and managed stores.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-bold">
                    {processedMerchants.length} {language === 'ar' ? 'تاجر مسجل' : 'Merchants'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={merchantSearch}
                    onChange={(e) => setMerchantSearch(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'ابحث باسم التاجر، البريد الإلكتروني، أو رابط المتجر...'
                        : 'Search by merchant name, email, or store subdomain...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  {merchantSearch && (
                    <button
                      onClick={() => setMerchantSearch('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-4">
                  <select
                    value={merchantPlanFilter}
                    onChange={(e) => setMerchantPlanFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع الباقات' : 'All Tiers'}</option>
                    <option value="Starter">Starter ($0)</option>
                    <option value="Growth">Growth ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Merchants Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-4 text-start">{language === 'ar' ? 'التاجر' : 'Merchant'}</th>
                      <th className="py-4 px-4 text-start">{language === 'ar' ? 'البريد الإلكتروني والاتصال' : 'Contact Email'}</th>
                      <th className="py-4 px-4 text-start">{language === 'ar' ? 'المتجر المرتبط' : 'Linked Store'}</th>
                      <th className="py-4 px-4 text-center">{language === 'ar' ? 'الباقة' : 'Plan'}</th>
                      <th className="py-4 px-4 text-center">{language === 'ar' ? 'كلمة المرور' : 'Password Key'}</th>
                      <th className="py-4 px-4 text-end">{language === 'ar' ? 'إجمالي المبيعات' : 'Revenue'}</th>
                      <th className="py-4 px-4 text-end">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {processedMerchants.map((store) => {
                      const isPassRevealed = revealedPasswordStoreId === store.id;
                      const merchantPassword = store.adminPassword || 'merchant123';
                      const storeRevenue = store.orders
                        .filter((o) => o.status !== 'cancelled')
                        .reduce((sum, o) => sum + o.total, 0);

                      return (
                        <tr key={store.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                                {store.ownerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-white text-sm block">{store.ownerName}</span>
                                <span className="text-[10px] text-slate-400">
                                  ID: <code className="font-mono text-slate-300">{store.id}</code>
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1.5" dir="ltr">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs text-emerald-400 font-bold flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{store.ownerPhone || '+964 770 123 4567'}</span>
                                </span>
                                <button
                                  onClick={() => handleCopyText(store.ownerPhone || '+964 770 123 4567', 'Merchant Phone')}
                                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
                                  title="Copy Phone"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`mailto:${store.ownerEmail}`}
                                  className="font-mono text-[11px] text-slate-400 hover:text-amber-400 hover:underline flex items-center gap-1"
                                >
                                  <Mail className="w-3 h-3 text-slate-500" />
                                  <span>{store.ownerEmail}</span>
                                </a>
                                <button
                                  onClick={() => handleCopyText(store.ownerEmail, 'Merchant Email')}
                                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
                                  title="Copy Email"
                                >
                                  <Copy className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg select-none">{store.design.logoEmoji}</span>
                              <div>
                                <span className="font-bold text-white text-xs block">
                                  {language === 'ar' ? store.nameAr || store.name : store.name}
                                </span>
                                <span className="text-[11px] text-emerald-400 font-mono" dir="ltr">
                                  {store.slug}.bastiyah.com
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                              {store.plan}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800" dir="ltr">
                              <KeyRound className="w-3 h-3 text-amber-400" />
                              <span className="font-mono text-xs text-slate-300">
                                {isPassRevealed ? merchantPassword : '••••••••'}
                              </span>
                              <button
                                onClick={() => setRevealedPasswordStoreId(isPassRevealed ? null : store.id)}
                                className="text-slate-400 hover:text-white p-0.5"
                                title={isPassRevealed ? 'Hide Password' : 'Show Password'}
                              >
                                {isPassRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => handleCopyText(merchantPassword, 'Admin Password')}
                                className="text-slate-400 hover:text-white p-0.5"
                                title="Copy Password"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-end font-mono font-bold text-emerald-400">
                            ${storeRevenue.toFixed(2)}
                          </td>

                          <td className="py-4 px-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  switchStore(store.id, 'admin');
                                  setAdminTab('dashboard');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1"
                                title="Login directly to this merchant admin portal"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <span>{language === 'ar' ? 'دخول الإدارة' : 'Login Admin'}</span>
                              </button>
                              <button
                                onClick={() => openEditModal(store)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 
          ========================================================================
          TAB 4: PLATFORM LIVE ORDERS FEED (خلاصة الطلبات)
          ========================================================================
        */}
        {activeOwnerTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-brand flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>{language === 'ar' ? 'خلاصة جميع طلبات شبكة بسطية' : 'Consolidated Platform Orders Feed'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ar'
                      ? 'بث مباشر لكافة الطلبات الواردة لجميع المتاجر المستضافة في مكان واحد.'
                      : 'Live aggregated stream of customer orders placed across every hosted store.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    {processedOrders.length} {language === 'ar' ? 'طلب مسجل' : 'Orders'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'ابحث برقم الطلب (#ORD)، اسم العميل، الهاتف أو المدينة...'
                        : 'Search by Order ID, customer name, phone, or city...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                  {orderSearch && (
                    <button
                      onClick={() => setOrderSearch('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={orderStoreFilter}
                    onChange={(e) => setOrderStoreFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع المتاجر' : 'All Stores'}</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.design.logoEmoji} {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Feed Table */}
            {processedOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
                <ShoppingBag className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h4 className="text-base font-bold text-white font-brand">
                  {language === 'ar' ? 'لا توجد طلبات تطابق الفلتر' : 'No Orders Matching Criteria'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'ar' ? 'جرّب تعديل كلمات البحث أو اختيار متجر آخر.' : 'Try adjusting your search query or store filter.'}
                </p>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-start text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-4 px-4 text-start">{language === 'ar' ? 'رقم الطلب والتاريخ' : 'Order ID & Date'}</th>
                        <th className="py-4 px-4 text-start">{language === 'ar' ? 'المتجر المستضيف' : 'Origin Store'}</th>
                        <th className="py-4 px-4 text-start">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="py-4 px-4 text-center">{language === 'ar' ? 'المنتجات' : 'Items'}</th>
                        <th className="py-4 px-4 text-center">{language === 'ar' ? 'طريقة الدفع' : 'Payment'}</th>
                        <th className="py-4 px-4 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="py-4 px-4 text-end">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                        <th className="py-4 px-4 text-end">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {processedOrders.map((ord) => {
                        const dateFormatted = new Date(ord.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <tr key={`${ord.storeId}-${ord.id}`} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-4 px-4">
                              <span className="font-mono font-bold text-amber-400 text-xs block">
                                {ord.id}
                              </span>
                              <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                                {dateFormatted}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-base select-none">{ord.storeLogoEmoji}</span>
                                <div>
                                  <span className="font-bold text-white text-xs block">
                                    {language === 'ar' ? ord.storeNameAr || ord.storeName : ord.storeName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                    {ord.storeSlug}.bastiyah.com
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-200 block text-xs">{ord.customer.fullName}</span>
                              <span className="text-[11px] text-slate-400 block font-mono">{ord.customer.phone}</span>
                              <span className="text-[10px] text-slate-500 block">{ord.customer.city}</span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-xs">
                                {ord.items.reduce((sum, item) => sum + item.quantity, 0)} {language === 'ar' ? 'قطع' : 'items'}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span className="text-xs text-slate-300 block font-medium">
                                {ord.paymentMethod}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              {getStatusBadge(ord.status)}
                            </td>

                            <td className="py-4 px-4 text-end font-mono font-black text-emerald-400 text-sm">
                              ${ord.total.toFixed(2)}
                            </td>

                            <td className="py-4 px-4 text-end">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedOrderDetails(ord)}
                                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                  title="View order details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    switchStore(ord.storeId, 'admin');
                                    setAdminTab('orders');
                                  }}
                                  className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1 transition-all"
                                  title="Fulfill order inside store admin"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span className="hidden md:inline">{language === 'ar' ? 'المتجر' : 'Store'}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 
          ========================================================================
          TAB 5: SUBSCRIPTIONS & PLANS (الاشتراكات والفوترة)
          ========================================================================
        */}
        {activeOwnerTab === 'plans' && (
          <div className="space-y-6">
            {/* SaaS Metrics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ar' ? 'الإيراد الشهري المتكرر (MRR)' : 'Monthly Recurring (MRR)'}
                </span>
                <p className="text-3xl font-black text-emerald-400 mt-2 font-brand">${mrr.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  ARR: ${(mrr * 12).toLocaleString()} / year
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ar' ? 'المشتركون بالباقات المدفوعة' : 'Paid Subscribers'}
                </span>
                <p className="text-3xl font-black text-white mt-2 font-brand">{growthCount + enterpriseCount}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  {totalStores > 0 ? `${Math.round(((growthCount + enterpriseCount) / totalStores) * 100)}%` : '0%'} {language === 'ar' ? 'من المتاجر' : 'conversion'}
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ar' ? 'باقة نمو (Growth)' : 'Growth Tier ($29)'}
                </span>
                <p className="text-3xl font-black text-indigo-400 mt-2 font-brand">{growthCount}</p>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  ${(growthCount * 29).toLocaleString()} / month
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'ar' ? 'باقة الشركات (Enterprise)' : 'Enterprise Tier ($99)'}
                </span>
                <p className="text-3xl font-black text-amber-400 mt-2 font-brand">{enterpriseCount}</p>
                <p className="text-[11px] text-slate-400 mt-2 font-mono">
                  ${(enterpriseCount * 99).toLocaleString()} / month
                </p>
              </div>
            </div>

            {/* Plan Tier Showcase Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Tier */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-lg font-bold text-white font-brand">Starter</h4>
                      <p className="text-xs text-slate-400">{language === 'ar' ? 'البداية المجانية' : 'Free Forever'}</p>
                    </div>
                    <span className="text-2xl font-black text-slate-300 font-mono">$0</span>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'رابط فرعي: slug.bastiyah.com' : 'Standard subdomain'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'حتى 10 منتجات معروضة' : 'Up to 10 hosted products'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'لوحة تحكم أساسية للمتجر' : 'Standard merchant dashboard'}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{language === 'ar' ? 'المتاجر الحالية' : 'Active Stores'}</span>
                  <span className="font-mono font-bold text-white px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800">
                    {starterCount}
                  </span>
                </div>
              </div>

              {/* Growth Tier */}
              <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
                <div className="absolute -top-3 start-6 px-3 py-0.5 rounded-full bg-indigo-600 text-[10px] font-black text-white uppercase tracking-wider">
                  {language === 'ar' ? 'الأكثر طلباً' : 'Most Popular'}
                </div>

                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-lg font-bold text-white font-brand">Growth</h4>
                      <p className="text-xs text-indigo-400">{language === 'ar' ? 'للتجار المتميزين' : 'Scaling Merchants'}</p>
                    </div>
                    <span className="text-2xl font-black text-indigo-400 font-mono">$29<span className="text-xs text-slate-400 font-normal">/mo</span></span>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'منتجات غير محدودة' : 'Unlimited products'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'دعم الدومين المخصص' : 'Custom domain ready'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'كوبونات خصم وتحليلات متقدمة' : 'Coupons & advanced metrics'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'عمولة منصة 0%' : '0% platform take-rate'}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{language === 'ar' ? 'المتاجر الحالية' : 'Active Stores'}</span>
                  <span className="font-mono font-bold text-indigo-400 px-2.5 py-1 rounded-xl bg-slate-950 border border-indigo-500/30">
                    {growthCount}
                  </span>
                </div>
              </div>

              {/* Enterprise Tier */}
              <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-amber-500/5">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div>
                      <h4 className="text-lg font-bold text-white font-brand">Enterprise</h4>
                      <p className="text-xs text-amber-400">{language === 'ar' ? 'للشركات والعلامات الكبرى' : 'High Volume VIP'}</p>
                    </div>
                    <span className="text-2xl font-black text-amber-400 font-mono">$99<span className="text-xs text-slate-400 font-normal">/mo</span></span>
                  </div>

                  <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'كل مميزات باقة Growth' : 'All Growth features included'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'مدير حساب مخصص واتصال مباشر' : 'Dedicated VIP support SLA'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'تخصيص كامل للهوية وCSS' : 'Full CSS & theme customization'}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{language === 'ar' ? 'المتاجر الحالية' : 'Active Stores'}</span>
                  <span className="font-mono font-bold text-amber-400 px-2.5 py-1 rounded-xl bg-slate-950 border border-amber-500/30">
                    {enterpriseCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Store Tier Manager */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="pb-4 border-b border-slate-800 mb-4">
                <h3 className="text-base font-bold text-white font-brand flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                  <span>{language === 'ar' ? 'إدارة ترقية باقات المتاجر الفورية' : 'Store Subscription Tier Manager'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar'
                    ? 'يمكنك ترقية أو خفض باقة أي متجر بنقرة واحدة وتحديث حسابه فوراً.'
                    : 'Instantly upgrade or downgrade any store hosting plan with real-time MRR adjustment.'}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'المتجر' : 'Store'}</th>
                      <th className="py-3 px-3 text-start">{language === 'ar' ? 'المالك' : 'Owner'}</th>
                      <th className="py-3 px-3 text-center">{language === 'ar' ? 'المنتجات' : 'Products'}</th>
                      <th className="py-3 px-3 text-center">{language === 'ar' ? 'الباقة الحالية' : 'Current Tier'}</th>
                      <th className="py-3 px-3 text-end">{language === 'ar' ? 'ترقية / تغيير الباقة' : 'Change Plan'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base select-none">{store.design.logoEmoji}</span>
                            <div>
                              <span className="font-bold text-white block">
                                {language === 'ar' ? store.nameAr || store.name : store.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                                {store.slug}.bastiyah.com
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="text-xs text-slate-300 block">{store.ownerName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{store.ownerEmail}</span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-300">
                          {store.products.length}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            store.plan === 'Enterprise'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : store.plan === 'Growth'
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {store.plan}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-end">
                          <select
                            value={store.plan}
                            onChange={(e) => handleQuickPlanChange(store.id, e.target.value as any)}
                            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="Starter">Starter ($0)</option>
                            <option value="Growth">Growth ($29)</option>
                            <option value="Enterprise">Enterprise ($99)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 
          ========================================================================
          TAB 6: PLATFORM SETTINGS & SECURITY (إعدادات المنصة والأمان)
          ========================================================================
        */}
        {activeOwnerTab === 'settings' && (
          <div className="space-y-6">
            {/* Super Admin Credentials Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-brand">
                    {language === 'ar' ? 'بيانات أمان المشرف العام للمنصة' : 'Super Admin Credentials & Security'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar'
                      ? 'الوصول إلى لوحة تحكم المنصة عبر الرابط السري (/owner) محمي بكلمة المرور هذه.'
                      : 'Master administrative access to the platform console via /owner.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {language === 'ar' ? 'حساب المشرف العام' : 'Super Admin Account'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Master Key
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">{language === 'ar' ? 'البريد الإلكتروني المعتمد:' : 'Primary Email:'}</span>
                    <p className="font-mono text-sm font-bold text-white" dir="ltr">{platformAdminEmail}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {language === 'ar'
                      ? 'يمتلك المشرف العام صلاحية الدخول لكافة المتاجر وتعديل الباقات والإشراف على قاعدة البيانات.'
                      : 'The super admin has universal access to all merchant stores, plan modifications, and backups.'}
                  </p>
                </div>

                {/* Change Admin Password Form */}
                <form onSubmit={handleUpdateAdminPasswordForm} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'ar' ? 'تغيير كلمة مرور المشرف العام' : 'Change Master Password'}
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Master Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={newAdminPasswordInput}
                        onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500 pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </label>
                    <input
                      type="password"
                      value={confirmAdminPasswordInput}
                      onChange={(e) => setConfirmAdminPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Update Master Password'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Disaster Recovery, Backup & Restore Section */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-brand">
                    {language === 'ar' ? 'النسخ الاحتياطي واستعادة البيانات' : 'Platform Backup & Disaster Recovery'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar'
                      ? 'تصدير نسخة كاملة بصيغة JSON لكافة المتاجر والطلبات والمنتجات، أو استعادتها بضغطة زر.'
                      : 'Export or restore full JSON snapshot containing all multi-tenant stores, products, orders, and designs.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Export JSON */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-brand">
                      {language === 'ar' ? 'تصدير نسخة كاملة (JSON)' : 'Export Full Snapshot'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {language === 'ar'
                        ? 'تنزيل ملف JSON يحتوي على جميع بيانات المنصة والمتاجر والطلبات.'
                        : 'Download a complete JSON database snapshot of all stores, catalogs, and orders.'}
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{language === 'ar' ? 'تنزيل النسخة الاحتياطية' : 'Download Backup'}</span>
                  </button>
                </div>

                {/* 2. Restore JSON */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-3">
                      <Upload className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-brand">
                      {language === 'ar' ? 'استعادة من ملف (JSON)' : 'Restore from Snapshot'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {language === 'ar'
                        ? 'رفع ملف نسخة احتياطية سابق واستعادة قاعدة البيانات بالكامل.'
                        : 'Upload a previously exported JSON snapshot to replace current stores.'}
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={restoreFileInputRef}
                      onChange={handleRestoreJSON}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => restoreFileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{language === 'ar' ? 'رفع واستعادة الملف' : 'Upload & Restore'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Factory Reset */}
                <div className="bg-slate-950/70 border border-rose-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-3">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-white font-brand">
                      {language === 'ar' ? 'إعادة ضبط المتاجر الافتراضية' : 'Reset Demo Stores'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {language === 'ar'
                        ? 'استعادة المتاجر النموذجية الأولية (Panda, Royal Oud, Velvet).'
                        : 'Restore initial showcase stores with fresh catalogs and sample orders.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إعادة ضبط المتاجر' : 'Reset to Defaults'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Platform System Specifications */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-white font-brand mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-400" />
                <span>{language === 'ar' ? 'مواصفات منصة بسطية السحابية' : 'Bastiyah Cloud Platform Architecture'}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'إصدار المنصة' : 'Core Version'}</span>
                  <span className="font-mono font-bold text-white mt-1 block">v2.4 Enterprise</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'قاعدة البيانات' : 'Database Engine'}</span>
                  <span className="font-mono font-bold text-white mt-1 block">Convex Realtime DB</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'شبكة الوسائط' : 'Media Storage'}</span>
                  <span className="font-mono font-bold text-white mt-1 block">Cloudflare R2 CDN</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'الشبكة السحابية' : 'Edge Network'}</span>
                  <span className="font-mono font-bold text-white mt-1 block">Vercel Global Edge</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 
        ========================================================================
        ORDER DETAILS MODAL
        ========================================================================
      */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white font-brand">
                    {language === 'ar' ? `تفاصيل الطلب: ${selectedOrderDetails.id}` : `Order Details: ${selectedOrderDetails.id}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? `المتجر: ${selectedOrderDetails.storeName}` : `Store: ${selectedOrderDetails.storeName}`} ({selectedOrderDetails.storeSlug}.bastiyah.com)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-slate-400 font-bold block uppercase">{language === 'ar' ? 'بيانات العميل' : 'Customer Info'}</span>
                <p className="font-bold text-white text-sm">{selectedOrderDetails.customer.fullName}</p>
                <p className="text-slate-300 font-mono">{selectedOrderDetails.customer.phone}</p>
                <p className="text-slate-400 font-mono">{selectedOrderDetails.customer.email}</p>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <span className="text-slate-400 font-bold block uppercase">{language === 'ar' ? 'عنوان التوصيل' : 'Shipping Address'}</span>
                <p className="text-slate-200">{selectedOrderDetails.customer.address}</p>
                <p className="text-slate-300 font-bold">{selectedOrderDetails.customer.city}</p>
                <p className="text-slate-400">{language === 'ar' ? 'طريقة الدفع:' : 'Payment:'} <span className="font-bold text-white">{selectedOrderDetails.paymentMethod}</span></p>
              </div>
            </div>

            {/* Itemized Products */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {language === 'ar' ? 'المنتجات المطلوبة' : 'Order Line Items'}
              </span>
              <div className="space-y-2">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-xl"
                      />
                      <div>
                        <p className="font-bold text-white text-xs">{item.productName}</p>
                        <p className="text-[11px] text-slate-400">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedOrderDetails.status)}
              </div>

              <div className="text-end">
                <span className="text-xs text-slate-400 block">{language === 'ar' ? 'الإجمالي النهائي' : 'Order Total'}</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  ${selectedOrderDetails.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  const targetStoreId = selectedOrderDetails.storeId;
                  setSelectedOrderDetails(null);
                  switchStore(targetStoreId, 'admin');
                  setAdminTab('orders');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'معالجة في لوحة المتجر' : 'Manage in Store Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        FACTORY RESET CONFIRMATION MODAL
        ========================================================================
      */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white font-brand">
              {language === 'ar' ? 'إعادة ضبط المتاجر النموذجية؟' : 'Reset All Stores to Defaults?'}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {language === 'ar'
                ? 'سيتم حذف جميع المتاجر والتعديلات الحالية وإعادة تعيين متاجر العرض النموذجية (Panda, Royal Oud, Velvet) بالحالة الافتراضية.'
                : 'This will reset all current stores and catalogs back to factory starter demo stores.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  resetStoresToDefault();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                {language === 'ar' ? 'نعم، إعادة الضبط' : 'Yes, Reset Defaults'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        EDIT STORE MODAL
        ========================================================================
      */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
                  {editLogoEmoji}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-brand">
                    {language === 'ar' ? `تعديل متجر (${editingStore.name})` : `Edit Store (${editingStore.name})`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono" dir="ltr">
                    {editingStore.slug}.bastiyah.com
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingStore(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStore} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم المتجر (English)' : 'Store Name (English)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم المتجر (بالعربية)' : 'Store Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الرابط الفرعي المخصص (Subdomain Slug)' : 'Custom Subdomain Slug'}
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5" dir="ltr">
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value)}
                    className="bg-transparent font-mono text-xs text-amber-400 focus:outline-none flex-1"
                  />
                  <span className="text-slate-500 text-xs font-mono">.bastiyah.com</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'شعار المتجر (Tagline - EN)' : 'Store Tagline (EN)'}
                  </label>
                  <input
                    type="text"
                    value={editTagline}
                    onChange={(e) => setEditTagline(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'شعار المتجر (Tagline - AR)' : 'Store Tagline (AR)'}
                  </label>
                  <input
                    type="text"
                    value={editTaglineAr}
                    onChange={(e) => setEditTaglineAr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'حالة المتجر' : 'Status'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">Active (نشط)</option>
                    <option value="maintenance">Maintenance (صيانة)</option>
                    <option value="suspended">Suspended (معلق)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'الباقة' : 'Plan'}
                  </label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Starter">Starter ($0)</option>
                    <option value="Growth">Growth ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'أيقونة المتجر (Emoji)' : 'Emoji Icon'}
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {EMOJI_OPTIONS.slice(0, 7).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setEditLogoEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          editLogoEmoji === emoji ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-white'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم المالك' : 'Owner Name'}
                  </label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'بريد المالك' : 'Owner Email'}
                  </label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={(e) => setEditOwnerEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{language === 'ar' ? 'رقم جوال المالك (لتسجيل الدخول)' : 'Owner Phone (for Login)'}</span>
                  </label>
                  <input
                    type="tel"
                    value={editOwnerPhone}
                    onChange={(e) => setEditOwnerPhone(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-amber-400" />
                    <span>{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
                  </label>
                  <input
                    type="text"
                    value={editAdminPassword}
                    onChange={(e) => setEditAdminPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        CREATE STORE MODAL
        ========================================================================
      */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center">
                  <Plus className="w-5 h-5 font-black" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-brand">
                    {language === 'ar' ? 'إطلاق متجر سحابي جديد' : 'Launch New Hosted Store'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar' ? 'إنشاء متجر برابط فرعي وهوية مستقلة فوراً' : 'Instant multi-tenant store provisioning'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم المتجر (English)' : 'Store Name (English)'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStoreName}
                    onChange={(e) => handleNewStoreNameChange(e.target.value)}
                    placeholder="e.g. Amber Oud"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم المتجر (بالعربية)' : 'Store Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={newStoreNameAr}
                    onChange={(e) => setNewStoreNameAr(e.target.value)}
                    placeholder="مثال: عود العنبر"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الرابط الفرعي المخصص (Subdomain Slug)' : 'Custom Subdomain Slug'} *
                </label>
                <div className="flex items-center rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5" dir="ltr">
                  <input
                    type="text"
                    required
                    value={newCustomSlug}
                    onChange={(e) => {
                      setNewSlugManuallyEdited(true);
                      setNewCustomSlug(e.target.value);
                    }}
                    placeholder="amber-oud"
                    className="bg-transparent font-mono text-xs text-amber-400 focus:outline-none flex-1"
                  />
                  <span className="text-slate-500 text-xs font-mono">.bastiyah.com</span>
                </div>
                {!isNewSlugValid && normalizedNewSlug.length > 0 && (
                  <p className="text-[11px] text-rose-400 mt-1">
                    {isNewSlugTaken
                      ? (language === 'ar' ? 'هذا الرابط مستخدم بالفعل' : 'Slug already taken')
                      : (language === 'ar' ? 'يجب أن يكون الرابط حرفين أو أكثر' : 'Slug must be at least 2 characters')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'التصنيف والنشاط' : 'Category'}
                  </label>
                  <select
                    value={newCategoryIndex}
                    onChange={(e) => setNewCategoryIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORY_PRESETS.map((cat, i) => (
                      <option key={cat.en} value={i}>
                        {cat.en} — {cat.ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'باقة الاستضافة' : 'Hosting Plan'}
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Starter">Starter ($0)</option>
                    <option value="Growth">Growth ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeOwnerNameLabel}
                  </label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={(e) => setNewOwnerName(e.target.value)}
                    placeholder="Merchant Name"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeOwnerEmailLabel}
                  </label>
                  <input
                    type="email"
                    value={newOwnerEmail}
                    onChange={(e) => setNewOwnerEmail(e.target.value)}
                    placeholder="merchant@domain.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{language === 'ar' ? 'رقم جوال المالك (لتسجيل الدخول)' : 'Owner Phone (for Login)'}</span>
                  </label>
                  <input
                    type="tel"
                    value={newOwnerPhone}
                    onChange={(e) => setNewOwnerPhone(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-amber-400" />
                    <span>{language === 'ar' ? 'كلمة المرور' : 'Password'}</span>
                  </label>
                  <input
                    type="text"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="merchant123"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={!isNewSlugValid || !newStoreName.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{language === 'ar' ? 'إطلاق المتجر فوراً' : 'Launch Store'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        DELETE STORE CONFIRMATION DIALOG
        ========================================================================
      */}
      {storeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-rose-500/30 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-white font-brand">
              {language === 'ar' ? `هل أنت متأكد من حذف متجر (${storeToDelete.name})؟` : `Delete Store (${storeToDelete.name})?`}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {language === 'ar'
                ? `سيتم إيقاف الرابط الفرعي (${storeToDelete.slug}.bastiyah.com) وحذف جميع منتجاته (${storeToDelete.products.length}) وطلباته (${storeToDelete.orders.length}) نهائياً.`
                : `This will permanently release the subdomain (${storeToDelete.slug}.bastiyah.com) and wipe its ${storeToDelete.products.length} products and ${storeToDelete.orders.length} orders.`}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setStoreToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteHostedStore(storeToDelete.id);
                  setStoreToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors"
              >
                {language === 'ar' ? 'تأكيد الحذف النهائي' : 'Yes, Delete Store'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
