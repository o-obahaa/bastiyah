import React, { useState, useMemo, useRef } from 'react';
import {
  Crown,
  Globe,
  Plus,
  PlusCircle,
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
  CheckCheck,
  Building2,
  Sparkle,
  ArrowRight,
  Send
} from 'lucide-react';
import { ImageUploader } from '../common/ImageUploader';
import { useStore } from '../../context/StoreContext';
import { StoreThemeColor, StoreLayoutStyle, HostedStore, Order, OrderStatus } from '../../types';
import { THEME_CONFIGS } from '../../utils/themeUtils';
import { getStoreDisplayUrl, getStorePathLabel, getFutureCustomDomainUrl } from '../../utils/urlUtils';

const EMOJI_OPTIONS = ['🛍️', '👑', '☕', '👗', '⚡', '🏺', '🌿', '💎', '🦢', '🐼', '👟', '⌚', '🎧', '🕯️', '🎨', '🏪'];

const CATEGORY_PRESETS = [
  { en: 'Specialty Coffee & Artisan', ar: 'قهوة مختصة وحرفيات' },
  { en: 'Perfumes & Oud', ar: 'عطور وعود فاخر' },
  { en: 'Clothing & Fashion', ar: 'أزياء وملابس' },
  { en: 'Electronics & Tech', ar: 'إلكترونيات وتقنية' },
  { en: 'Beauty & Cosmetics', ar: 'تجميل ومستحضرات' },
  { en: 'Home & Architecture', ar: 'منزل وديكور' },
  { en: 'Handmade & Crafts', ar: 'حرفيات وإبداع' },
];

const LAYOUT_OPTIONS: Array<{ id: StoreLayoutStyle; labelEn: string; labelAr: string; descEn: string; descAr: string }> = [
  { id: 'modern-split', labelEn: 'Modern Split', labelAr: 'عصري منقسم', descEn: 'Split hero with card highlight', descAr: 'واجهة عصرية منقسمة مع إبراز البطاقات' },
  { id: 'luxury-centered', labelEn: 'Luxury Centered', labelAr: 'ملكي فاخر', descEn: 'Centered luxury aesthetic with dark banner', descAr: 'طابع فاخر متمركز مع خلفية داكنة' },
  { id: 'minimal-editorial', labelEn: 'Minimal Editorial', labelAr: 'تبسيطي تحريري', descEn: 'Magazine typography and sharp frames', descAr: 'خطوط عريضة أنيقة وطابع المجلات' },
  { id: 'vibrant-banner', labelEn: 'Vibrant Banner', labelAr: 'بانر حيوي', descEn: 'Full-bleed banner with dynamic gradients', descAr: 'بانر ملون عريض مع تدرجات جذابة' },
];

const THEME_COLOR_OPTIONS: Array<{ id: StoreThemeColor; labelEn: string; labelAr: string; bgClass: string }> = [
  { id: 'emerald', labelEn: 'Emerald Green', labelAr: 'أخضر زمردي', bgClass: 'bg-emerald-500' },
  { id: 'indigo', labelEn: 'Royal Indigo', labelAr: 'نيلي ملكي', bgClass: 'bg-indigo-600' },
  { id: 'amber', labelEn: 'Warm Amber', labelAr: 'عنبري دافئ', bgClass: 'bg-amber-500' },
  { id: 'rose', labelEn: 'Velvet Rose', labelAr: 'وردي فيلفيت', bgClass: 'bg-rose-500' },
  { id: 'cyan', labelEn: 'Electric Cyan', labelAr: 'سماوي كهربائي', bgClass: 'bg-cyan-500' },
  { id: 'violet', labelEn: 'Imperial Violet', labelAr: 'بنفسجي إمبراطوري', bgClass: 'bg-violet-600' },
];

const CURRENCY_OPTIONS = [
  { code: 'IQD', symbol: 'د.ع', labelEn: 'Iraqi Dinar (د.ع)', labelAr: 'دينار عراقي (د.ع)' },
  { code: 'USD', symbol: '$', labelEn: 'US Dollar ($)', labelAr: 'دولار أمريكي ($)' },
  { code: 'SAR', symbol: 'ر.س', labelEn: 'Saudi Riyal (ر.س)', labelAr: 'ريال سعودي (ر.س)' },
  { code: 'AED', symbol: 'د.إ', labelEn: 'UAE Dirham (د.إ)', labelAr: 'درهم إماراتي (د.إ)' },
];

const QUICK_PRESETS = [
  {
    name: 'Artisan Specialty Coffee',
    nameAr: 'مقهى الحرفيين المختص',
    slug: 'artisan-coffee',
    category: 'Specialty Coffee & Artisan',
    categoryAr: 'قهوة مختصة وحرفيات',
    themeColor: 'amber' as StoreThemeColor,
    layoutStyle: 'modern-split' as StoreLayoutStyle,
    logoEmoji: '☕',
    tagline: 'Artisan roasted beans & specialty brews',
    taglineAr: 'محاصيل بن مختصة وتحميص طازج فاخر',
    plan: 'Growth' as const,
  },
  {
    name: 'Royal Oud & Perfumes',
    nameAr: 'العود الملكي للعطور',
    slug: 'royal-oud',
    category: 'Perfumes & Oud',
    categoryAr: 'عطور وعود فاخر',
    themeColor: 'amber' as StoreThemeColor,
    layoutStyle: 'luxury-centered' as StoreLayoutStyle,
    logoEmoji: '👑',
    tagline: 'Authentic royal oud and luxury oriental fragrances',
    taglineAr: 'أرقى دهن العود والأطياب الملكية الفاخرة',
    plan: 'Enterprise' as const,
  },
  {
    name: 'Velvet Haute Couture',
    nameAr: 'بوتيك فيلفيت للأزياء',
    slug: 'velvet-boutique',
    category: 'Clothing & Fashion',
    categoryAr: 'أزياء وملابس',
    themeColor: 'rose' as StoreThemeColor,
    layoutStyle: 'minimal-editorial' as StoreLayoutStyle,
    logoEmoji: '👗',
    tagline: 'Contemporary luxury fashion & curated wardrobe',
    taglineAr: 'أزياء راقية وتصاميم معاصرة للمناسبات',
    plan: 'Growth' as const,
  },
  {
    name: 'Volt Tech & Audio',
    nameAr: 'فولت للإلكترونيات الذكية',
    slug: 'volt-tech',
    category: 'Electronics & Tech',
    categoryAr: 'إلكترونيات وتقنية',
    themeColor: 'cyan' as StoreThemeColor,
    layoutStyle: 'vibrant-banner' as StoreLayoutStyle,
    logoEmoji: '⚡',
    tagline: 'Premium electronics, gadgets and audiophile tech',
    taglineAr: 'أحدث الأجهزة الذكية وملحقات الصوت الاحترافية',
    plan: 'Growth' as const,
  },
  {
    name: 'Lumina Home & Decor',
    nameAr: 'لومينا للمنزل العصري',
    slug: 'lumina-home',
    category: 'Home & Architecture',
    categoryAr: 'منزل وديكور',
    themeColor: 'emerald' as StoreThemeColor,
    layoutStyle: 'modern-split' as StoreLayoutStyle,
    logoEmoji: '🏺',
    tagline: 'Scandinavian furniture & interior architectural design',
    taglineAr: 'إكسسوارات ديكور اسكندنافية ولمسات معمارية أنيقة',
    plan: 'Starter' as const,
  },
];

export type OwnerAdminTab = 'stores' | 'analytics' | 'merchants' | 'orders' | 'plans' | 'settings';

export const BastiyahOwnerAdmin: React.FC = () => {
  const {
    stores,
    activeStore,
    universalCustomers: platformUniversalCustomers,
    switchStore,
    goToPlatform,
    createHostedStore,
    updateHostedStore,
    registerStoreMerchantByOwner,
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
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Stores Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'Starter' | 'Growth' | 'Enterprise'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'revenue' | 'orders' | 'products' | 'name'>('newest');

  // Quick Inline Store Add state
  const [quickStoreName, setQuickStoreName] = useState('');
  const [quickCategoryIndex, setQuickCategoryIndex] = useState(0);
  const [quickPlan, setQuickPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');

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
  const [editCategoryAr, setEditCategoryAr] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editOwnerPhone, setEditOwnerPhone] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');
  const [editPlan, setEditPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [editStatus, setEditStatus] = useState<'active' | 'maintenance' | 'suspended'>('active');
  const [editThemeColor, setEditThemeColor] = useState<StoreThemeColor>('emerald');
  const [editLayoutStyle, setEditLayoutStyle] = useState<StoreLayoutStyle>('modern-split');
  const [editLogoEmoji, setEditLogoEmoji] = useState('🛍️');
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Comprehensive Create Modal Form State
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
  const [newCurrency, setNewCurrency] = useState('IQD');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Merchants Tab State
  const [merchantSearch, setMerchantSearch] = useState('');
  const [merchantPlanFilter, setMerchantPlanFilter] = useState<'all' | 'Starter' | 'Growth' | 'Enterprise'>('all');
  const [customerSearch, setCustomerSearch] = useState('');
  const [revealedPasswordStoreId, setRevealedPasswordStoreId] = useState<string | null>(null);
  const [showAddMerchantModal, setShowAddMerchantModal] = useState(false);
  const [newMerchantStoreId, setNewMerchantStoreId] = useState(stores[0]?.id || '');
  const [newMerchantName, setNewMerchantName] = useState('');
  const [newMerchantPhone, setNewMerchantPhone] = useState('+964 770 123 4567');
  const [newMerchantPassword, setNewMerchantPassword] = useState('merchant123');

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

  // Clipboard copy safe helper
  const safeCopy = (text: string, label: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
      } catch (_) {}
      document.body.removeChild(el);
    }
    addToast(`${label}: ${text}`, 'info');
  };

  const handleCopyStoreLink = (store: HostedStore) => {
    const link = getStoreDisplayUrl(store.slug);
    safeCopy(link, t.linkCopied || 'Store link copied');
    setCopiedId(store.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper to open Edit Modal
  const openEditModal = (store: HostedStore) => {
    setEditingStore(store);
    setEditName(store.name);
    setEditNameAr(store.nameAr || store.name);
    setEditSlug(store.slug);
    setEditTagline(store.tagline || '');
    setEditTaglineAr(store.taglineAr || '');
    setEditCategory(store.category);
    setEditCategoryAr(store.categoryAr || store.category);
    setEditOwnerName(store.ownerName);
    setEditOwnerEmail(store.ownerEmail);
    setEditOwnerPhone(store.ownerPhone || '+964 770 123 4567');
    setEditAdminPassword(store.adminPassword || 'merchant123');
    setEditPlan(store.plan);
    setEditStatus(store.status);
    setEditThemeColor(store.design.themeColor);
    setEditLayoutStyle(store.design.layoutStyle);
    setEditLogoEmoji(store.design.logoEmoji);
    setShowEditPassword(false);
  };

  const handleSaveEditStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    const cleanedSlug = editSlug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
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

    // updateHostedStore already dispatches success toast internally
    updateHostedStore(editingStore.id, {
      name: editName.trim(),
      nameAr: editNameAr.trim() || editName.trim(),
      slug: cleanedSlug,
      tagline: editTagline.trim(),
      taglineAr: editTaglineAr.trim() || editTagline.trim(),
      category: editCategory,
      categoryAr: editCategoryAr || editCategory,
      ownerName: editOwnerName.trim() || 'Store Merchant',
      ownerEmail: editOwnerEmail.trim(),
      ownerPhone: editOwnerPhone.trim(),
      adminPassword: editAdminPassword.trim() || 'merchant123',
      plan: editPlan,
      status: editStatus,
    });

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
  };

  // Quick Plan Change for Plans tab
  const handleQuickPlanChange = (storeId: string, newPlan: 'Starter' | 'Growth' | 'Enterprise') => {
    updateHostedStore(storeId, { plan: newPlan });
  };

  // Auto-generate clean slug from newStoreName unless manually edited
  const handleNewStoreNameChange = (val: string) => {
    setNewStoreName(val);
    if (!newSlugManuallyEdited) {
      let auto = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      if (!auto || auto.length < 2) {
        auto = `store-${stores.length + 1}`;
      }
      setNewCustomSlug(auto);
    }
  };

  const normalizedNewSlug = newCustomSlug.replace(/^-|-$/g, '');
  const isNewSlugTaken = stores.some(
    (s) => s.slug.toLowerCase() === normalizedNewSlug.toLowerCase()
  );
  const isNewSlugValid = normalizedNewSlug.length >= 2 && !isNewSlugTaken;

  // Handle Full Modal Store Creation
  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) {
      addToast(language === 'ar' ? 'يرجى إدخال اسم المتجر' : 'Please enter a store name', 'error');
      return;
    }
    if (!isNewSlugValid) {
      addToast(
        language === 'ar' ? 'يرجى اختيار رابط فرعي صالح وغير مستخدم' : 'Please choose a valid, available subdomain slug',
        'error'
      );
      return;
    }

    const chosenCat = CATEGORY_PRESETS[newCategoryIndex];
    const currencySymbol = CURRENCY_OPTIONS.find((c) => c.code === newCurrency)?.symbol || 'د.ع';

    // createHostedStore already dispatches success toast internally
    createHostedStore({
      name: newStoreName.trim(),
      nameAr: newStoreNameAr.trim() || newStoreName.trim(),
      slug: normalizedNewSlug,
      tagline: newTagline.trim() || `Curated ${chosenCat.en} hosted on Bastiyah`,
      taglineAr: newTaglineAr.trim() || `أفضل منتجات ${chosenCat.ar} عبر منصة بسطية`,
      category: chosenCat.en,
      categoryAr: chosenCat.ar,
      ownerName: newOwnerName.trim() || 'Store Merchant',
      ownerEmail: newOwnerEmail.trim() || `merchant@${normalizedNewSlug}.bastiyah.com`,
      ownerPhone: newOwnerPhone.trim() || '+964 770 123 4567',
      adminPassword: newAdminPassword.trim() || 'merchant123',
      plan: newPlan,
      themeColor: newThemeColor,
      layoutStyle: newLayoutStyle,
      logoEmoji: newLogoEmoji,
      currency: currencySymbol,
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
  };

  // Handle Fast Inline Store Creation
  const handleQuickAddStore = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!quickStoreName.trim()) {
      addToast(language === 'ar' ? 'يرجى إدخال اسم المتجر للإطلاق السريع' : 'Please enter a store name', 'error');
      return;
    }

    let slug = quickStoreName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    if (!slug || slug.length < 2) {
      slug = `store-${Date.now().toString().slice(-4)}`;
    }

    // Ensure unique slug
    if (stores.some((s) => s.slug.toLowerCase() === slug.toLowerCase())) {
      slug = `${slug}-${Date.now().toString().slice(-3)}`;
    }

    const cat = CATEGORY_PRESETS[quickCategoryIndex];
    createHostedStore({
      name: quickStoreName.trim(),
      nameAr: quickStoreName.trim(),
      slug,
      tagline: `Official store hosted on Bastiyah`,
      taglineAr: `متجر إلكتروني رسمي مستضاف عبر بسطية`,
      category: cat.en,
      categoryAr: cat.ar,
      ownerName: 'Store Merchant',
      ownerEmail: `admin@${slug}.bastiyah.com`,
      ownerPhone: '+964 770 123 4567',
      adminPassword: 'merchant123',
      plan: quickPlan,
      themeColor: 'emerald',
      layoutStyle: 'modern-split',
      logoEmoji: '🛍️',
      currency: 'د.ع',
    });

    setQuickStoreName('');
  };

  // Fast launch with template preset
  const handleLaunchWithPreset = (preset: typeof QUICK_PRESETS[0]) => {
    let slug = preset.slug;
    if (stores.some((s) => s.slug.toLowerCase() === slug.toLowerCase())) {
      slug = `${slug}-${Date.now().toString().slice(-3)}`;
    }

    createHostedStore({
      name: preset.name,
      nameAr: preset.nameAr,
      slug,
      tagline: preset.tagline,
      taglineAr: preset.taglineAr,
      category: preset.category,
      categoryAr: preset.categoryAr,
      ownerName: 'Store Merchant',
      ownerEmail: `merchant@${slug}.bastiyah.com`,
      ownerPhone: '+964 770 123 4567',
      adminPassword: 'merchant123',
      plan: preset.plan,
      themeColor: preset.themeColor,
      layoutStyle: preset.layoutStyle,
      logoEmoji: preset.logoEmoji,
      currency: 'د.ع',
    });
  };

  const handleAddMerchantByOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const targetStoreId = newMerchantStoreId || stores[0]?.id;
    if (!targetStoreId) {
      addToast(language === 'ar' ? 'يرجى اختيار المتجر' : 'Please select a store', 'error');
      return;
    }
    if (!newMerchantPhone.trim() || newMerchantPhone.trim().length < 8) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم هاتف صالح لمدير المتجر' : 'Please provide a valid phone number', 'error');
      return;
    }
    registerStoreMerchantByOwner(targetStoreId, {
      name: newMerchantName.trim() || 'Store Merchant',
      phone: newMerchantPhone.trim(),
      password: newMerchantPassword.trim() || 'merchant123',
    });
    setShowAddMerchantModal(false);
    setNewMerchantName('');
    setNewMerchantPhone('+964 770 123 4567');
    setNewMerchantPassword('merchant123');
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
          addToast(language === 'ar' ? 'تمت استعادة المنصة بنجاح' : 'Platform restored successfully', 'success');
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
    addToast(language === 'ar' ? 'تم تحديث كلمة المرور للمشرف العام' : 'Master password updated successfully', 'success');
  };

  // Direct order status update across stores from Owner Console
  const handleUpdatePlatformOrderStatus = (newStatus: OrderStatus) => {
    if (!selectedOrderDetails) return;
    const store = stores.find((s) => s.id === selectedOrderDetails.storeId);
    if (!store) return;
    const updatedOrders = store.orders.map((o) =>
      o.id === selectedOrderDetails.id ? { ...o, status: newStatus } : o
    );
    updateHostedStore(store.id, { orders: updatedOrders });
    setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
    addToast(
      language === 'ar' ? `تم تحديث حالة الطلب إلى "${newStatus}" بنجاح` : `Order status updated to "${newStatus}" successfully`,
      'success'
    );
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

  // Universal Cross-Store Customers:
  // Aggregated dynamically from registered platform accounts, store customer lists, and all actual orders.
  // Real orders count and total spent are linked 100% directly to allOrdersFlat (no random data).
  const universalCustomers = useMemo(() => {
    type UniversalEntry = {
      id: string;
      name: string;
      phone?: string;
      email?: string;
      city?: string;
      state?: string;
      address?: string;
      ordersCount: number;
      totalSpent: number;
      storeCount: number;
      stores: string[];
      lastOrderDate?: string;
      authenticatedVia?: string;
      authenticatedAt?: string;
    };

    const normalizeKey = (phone?: string, email?: string, name?: string) => {
      if (phone) {
        const clean = phone.replace(/\D/g, '');
        if (clean.length >= 7) return `phone:${clean.slice(-10)}`;
      }
      if (email && email.includes('@')) return `email:${email.trim().toLowerCase()}`;
      if (name) return `name:${name.trim().toLowerCase()}`;
      return '';
    };

    const map = new Map<string, UniversalEntry>();

    // 1. Ingest registered universal users from platform auth
    platformUniversalCustomers?.forEach((u) => {
      const key = normalizeKey(u.phone, u.email, u.name);
      if (!key) return;
      map.set(key, {
        id: u.id,
        name: u.name,
        phone: u.phone,
        email: u.email,
        city: u.city,
        state: u.state,
        address: u.address,
        ordersCount: 0,
        totalSpent: 0,
        storeCount: 0,
        stores: [],
        authenticatedVia: u.authenticatedVia,
        authenticatedAt: u.authenticatedAt,
      });
    });

    // 2. Ingest customer directories from all hosted stores
    stores.forEach((store) => {
      store.customers?.forEach((c) => {
        const key = normalizeKey(c.phone, c.email, c.name);
        if (!key) return;
        const existing = map.get(key);
        if (existing) {
          if (!existing.phone && c.phone) existing.phone = c.phone;
          if (!existing.email && c.email) existing.email = c.email;
          if (!existing.city && c.city) existing.city = c.city;
          if (!existing.stores.includes(store.name)) {
            existing.stores.push(store.name);
          }
        } else {
          map.set(key, {
            id: c.id,
            name: c.name,
            phone: c.phone,
            email: c.email,
            city: c.city,
            ordersCount: 0,
            totalSpent: 0,
            storeCount: 1,
            stores: [store.name],
          });
        }
      });
    });

    // 3. Ingest and link all live orders across all stores (allOrdersFlat)
    allOrdersFlat.forEach((ord) => {
      const cust = ord.customer;
      const key = normalizeKey(cust.phone, cust.email, cust.fullName);
      if (!key) return;

      let entry = map.get(key);
      if (!entry) {
        entry = {
          id: `cust-ord-${cust.phone?.replace(/\D/g, '') || ord.id}`,
          name: cust.fullName,
          phone: cust.phone,
          email: cust.email,
          city: cust.city,
          state: cust.state,
          address: cust.address,
          ordersCount: 0,
          totalSpent: 0,
          storeCount: 0,
          stores: [],
        };
        map.set(key, entry);
      }

      // Link order directly
      entry.ordersCount += 1;
      if (ord.status !== 'cancelled') {
        entry.totalSpent += ord.total;
      }
      if (!entry.stores.includes(ord.storeName)) {
        entry.stores.push(ord.storeName);
      }
      if (!entry.lastOrderDate || new Date(ord.date).getTime() > new Date(entry.lastOrderDate).getTime()) {
        entry.lastOrderDate = ord.date;
      }
    });

    // Finalize store counts
    map.forEach((entry) => {
      entry.storeCount = entry.stores.length;
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent || b.ordersCount - a.ordersCount);
  }, [platformUniversalCustomers, stores, allOrdersFlat]);

  // Filtered Universal Customers for Tab 3 Search
  const processedUniversalCustomers = useMemo(() => {
    if (!customerSearch.trim()) return universalCustomers;
    const q = customerSearch.toLowerCase().trim();
    const cleanQ = q.replace(/\D/g, '');
    return universalCustomers.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (cleanQ.length >= 4 && c.phone && c.phone.replace(/\D/g, '').includes(cleanQ)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        c.stores.some((s: string) => s.toLowerCase().includes(q))
      );
    });
  }, [universalCustomers, customerSearch]);

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
        return (
          s.ownerName.toLowerCase().includes(q) ||
          s.ownerEmail.toLowerCase().includes(q) ||
          (s.ownerPhone || '').includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [stores, merchantPlanFilter, merchantSearch]);

  // Cross-Store Filtered Orders for Tab 4
  const processedOrders = useMemo(() => {
    return allOrdersFlat.filter((ord) => {
      if (orderStoreFilter !== 'all' && ord.storeId !== orderStoreFilter) return false;
      if (orderStatusFilter !== 'all' && ord.status !== orderStatusFilter) return false;
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        return (
          ord.id.toLowerCase().includes(q) ||
          ord.orderNumber.toLowerCase().includes(q) ||
          ord.customer.fullName.toLowerCase().includes(q) ||
          ord.customer.phone.toLowerCase().includes(q) ||
          ord.storeName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allOrdersFlat, orderStoreFilter, orderStatusFilter, orderSearch]);

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
      labelAr: 'المتاجر المستضافة',
      labelEn: 'Hosted Stores',
      icon: Store,
      count: totalStores,
    },
    {
      id: 'analytics' as OwnerAdminTab,
      labelAr: 'المبيعات والتحليلات',
      labelEn: 'Analytics & GMV',
      icon: BarChart3,
    },
    {
      id: 'merchants' as OwnerAdminTab,
      labelAr: 'دليل التجار والعملاء',
      labelEn: 'Merchants & Shoppers',
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
      labelAr: 'الباقات والاشتراكات',
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
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">قيد الانتظار • Pending</span>;
      case 'processing':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">قيد التجهيز • Processing</span>;
      case 'shipped':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">تم الشحن • Shipped</span>;
      case 'delivered':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">تم التوصيل • Delivered</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">ملغي • Cancelled</span>;
      default:
        return null;
    }
  };

  const getPlanPill = (plan: HostedStore['plan']) => {
    switch (plan) {
      case 'Enterprise':
        return <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">Enterprise ($99)</span>;
      case 'Growth':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Growth ($29)</span>;
      case 'Starter':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">Starter ($0)</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 selection:bg-amber-500/20 selection:text-amber-900 font-sans">
      
      {/* Background ambient accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -start-32 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -end-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      {/* 
        ========================================================================
        1. MASTER ADMIN NAVIGATION BAR (LIGHT THEME BENTO HEADER)
        ========================================================================
      */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Platform Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => goToPlatform('landing')}
              className="flex items-center gap-3 group text-start focus:outline-none"
              title="Return to Bastiyah Main Landing Page"
            >
              <img
                src="/bastiyah-emblem.png"
                alt="بسطية"
                className="w-10 h-10 object-contain shrink-0 transition-transform group-hover:scale-105 pointer-events-none"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-brand font-black text-xl tracking-tight text-slate-900 group-hover:text-amber-600 transition-colors">
                    بسطية
                  </span>
                  <span className="text-slate-300 font-light text-xs">|</span>
                  <span className="text-xs font-bold text-amber-600 tracking-wider font-sans uppercase">
                    BASTIYAH
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Owner SaaS Console
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            </button>
          </div>

          {/* Top Actions Bar */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Export CSV */}
            <button
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all shadow-xs"
              title="Export all stores to CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            {/* Cloud Infra Quick Toggle */}
            <button
              onClick={() => setShowCloudSection(!showCloudSection)}
              className={`hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shadow-xs ${
                showCloudSection
                  ? 'bg-sky-50 text-sky-700 border-sky-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'ar' ? 'السحابة' : 'Cloud'}</span>
            </button>

            {/* PRIMARY: Create New Store CTA Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{language === 'ar' ? '+ إضافة متجر جديد' : '+ New Store'}</span>
            </button>

            {/* Back to Platform Landing */}
            <button
              onClick={() => goToPlatform('landing')}
              className="p-2.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all shadow-xs flex items-center gap-1.5"
              title="Return to Main Landing Page"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الموقع' : 'Site'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all shadow-xs"
            >
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>

            {/* Authenticated Platform Admin Pill & Logout */}
            <div className="flex items-center gap-1.5 sm:gap-2 ps-1.5 sm:ps-2 border-s border-slate-200">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[11px] font-mono text-slate-700" dir="ltr">{platformAdminEmail}</span>
              </div>

              <button
                onClick={logoutPlatformAdmin}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-all shadow-xs"
                title={language === 'ar' ? 'تسجيل الخروج من لوحة تحكم المنصة' : 'Log Out of Platform Admin'}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'ar' ? 'خروج' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8 relative z-10">
        
        {/* 
          ========================================================================
          2. OWNER HERO TITLE & METRIC TICKER
          ========================================================================
        */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'ar' ? 'لوحة تحكم مالك المنصة' : 'Bastiyah Platform Owner Portal'}</span>
              <span>•</span>
              <span className="font-mono text-[11px] text-amber-700">Core v2.4 Enterprise</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-brand tracking-tight">
              {language === 'ar' ? 'مركز قيادة منصة بسطية السحابية' : 'Bastiyah Platform Command Center'}
            </h1>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">MRR:</span>
              <strong className="text-indigo-600 font-bold">${mrr.toLocaleString()}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">GMV:</span>
              <strong className="text-emerald-600 font-bold">${totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5">
              <span className="text-slate-500">{language === 'ar' ? 'المتاجر:' : 'Stores:'}</span>
              <strong className="text-amber-600 font-bold">{totalStores}</strong>
            </span>
          </div>
        </div>

        {/* 
          ========================================================================
          3. REAL BENTO BOX KPI GRID (6 KEY METRICS)
          ========================================================================
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          
          {/* Card 1: Platform GMV */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'ar' ? 'إجمالي المبيعات' : 'Platform GMV'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-emerald-600 font-brand truncate">
                ${totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {language === 'ar' ? `معدل الطلب: $${averageOrderValue.toFixed(2)}` : `AOV: $${averageOrderValue.toFixed(2)}`}
              </p>
            </div>
          </div>

          {/* Card 2: Live Network Orders */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
                {totalPlatformOrders}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold">
                <span className="text-amber-600">{orderStatusCounts.pending} {language === 'ar' ? 'انتظار' : 'pnd'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600">{orderStatusCounts.delivered} {language === 'ar' ? 'تم' : 'dlv'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Hosted Stores */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'ar' ? 'المتاجر المستضافة' : 'Hosted Stores'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Store className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
                {totalStores}
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold">
                <span className="text-emerald-600">{activeCount} {language === 'ar' ? 'نشط' : 'act'}</span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600">{maintenanceCount} {language === 'ar' ? 'صيانة' : 'mnt'}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Universal Shoppers */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'ar' ? 'عملاء الشبكة' : 'Universal Shoppers'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
                {universalCustomers.length}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                {language === 'ar' ? 'مشترين عبر المنصة' : 'Cross-store buyers'}
              </p>
            </div>
          </div>

          {/* Card 5: Monthly Recurring Revenue */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'ar' ? 'عوائد الاشتراكات MRR' : 'MRR Subscriptions'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xl sm:text-2xl font-black text-indigo-600 font-brand">
                ${mrr.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                ARR: ${arr.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Card 6: Cloud & Realtime Status (wired with isCloudflareConfigured) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {language === 'ar' ? 'السحابة وقاعدة البيانات' : 'Cloud Status'}
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isConvexConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-bold text-slate-800">
                  {isConvexConnected ? 'Convex Live' : 'Local Fallback'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${isCloudflareConfigured ? 'bg-sky-500' : 'bg-slate-400'}`} />
                <span className="text-slate-500 truncate">
                  R2 CDN: {isCloudflareConfigured ? 'Connected' : 'Local Storage'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 
          ========================================================================
          4. NAVIGATION TABS BAR
          ========================================================================
        */}
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
                    ? 'bg-slate-900 text-white shadow-sm font-black'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 shadow-xs'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isActive ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600 border border-slate-200'
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
          5. CLOUD INFRASTRUCTURE DRAWER (TOGGLEABLE)
          ========================================================================
        */}
        {showCloudSection && (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                    {language === 'ar' ? 'حالة البنية التحتية السحابية وقاعدة البيانات' : 'Cloud Database & Media Engine'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Convex Realtime DB + Cloudflare R2 Global Media Storage
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  setIsSeeding(true);
                  try {
                    await seedConvexDatabase();
                    addToast(language === 'ar' ? 'تمت مزامنة قاعدة البيانات بنجاح' : 'Database synced to Convex', 'success');
                  } finally {
                    setIsSeeding(false);
                  }
                }}
                disabled={isSeeding}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
              >
                <Database className={`w-3.5 h-3.5 text-amber-400 ${isSeeding ? 'animate-spin' : ''}`} />
                <span>
                  {isSeeding
                    ? (language === 'ar' ? 'جارٍ المزامنة...' : 'Syncing...')
                    : (language === 'ar' ? 'مزامنة مع Convex' : 'Sync to Convex')}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-600" />
                    Convex Realtime DB
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isConvexConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                    {isConvexConnected ? 'Connected & Live' : 'Local Fallback Ready'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'قاعدة بيانات Convex اللحظية تعزل بيانات كل متجر عبر storeId وتتزامن تلقائياً.'
                    : 'Real-time multi-tenant database partitioned strictly by storeId with instant subscriptions.'}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-sky-600" />
                    Cloudflare R2 CDN
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isCloudflareConfigured ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-slate-200 text-slate-700'}`}>
                    {isCloudflareConfigured ? 'CDN: Active (R2)' : 'Local Storage Mode'}
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
          TAB 1: REGISTERED STORES (المتاجر المستضافة)
          ========================================================================
        */}
        {activeOwnerTab === 'stores' && (
          <div className="space-y-6">

            {/* 
              ====================================================================
              PRIMARY: QUICK-ADD STORE BANNER & TEMPLATE PRESETS (BENTO CARD)
              ====================================================================
            */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-white border border-amber-200/80 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left/Top Content */}
                <div className="space-y-2 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-900 text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'ar' ? 'إطلاق متجر سحابي فوري' : 'Instant Store Provisioning'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-brand">
                    {language === 'ar' ? 'أنشئ متجراً جديداً في ثوانٍ معدودة' : 'Provision a New Store in Seconds'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {language === 'ar'
                      ? 'اختر قالباً جاهزاً أو أدخل اسم المتجر وحدد نشاطه وباقته ليتم حجز الرابط وتجهيز الكتالوج فوراً.'
                      : 'Choose a curated template preset or quickly enter a name with category and tier for automated provisioning.'}
                  </p>
                </div>

                {/* Right/Bottom Fast Creation Action */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <form onSubmit={handleQuickAddStore} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <div className="relative w-full sm:w-52">
                      <Store className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={quickStoreName}
                        onChange={(e) => setQuickStoreName(e.target.value)}
                        placeholder={language === 'ar' ? 'اسم المتجر السريع...' : 'Quick store name...'}
                        className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
                      />
                    </div>

                    {/* Quick Category Selector */}
                    <select
                      value={quickCategoryIndex}
                      onChange={(e) => setQuickCategoryIndex(Number(e.target.value))}
                      className="px-2.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500 shadow-xs"
                      title={language === 'ar' ? 'تصنيف المتجر' : 'Category'}
                    >
                      {CATEGORY_PRESETS.map((cat, i) => (
                        <option key={cat.en} value={i}>
                          {language === 'ar' ? cat.ar : cat.en}
                        </option>
                      ))}
                    </select>

                    {/* Quick Plan Selector */}
                    <select
                      value={quickPlan}
                      onChange={(e) => setQuickPlan(e.target.value as any)}
                      className="px-2.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 shadow-xs"
                      title={language === 'ar' ? 'باقة المتجر' : 'Plan'}
                    >
                      <option value="Starter">Starter ($0)</option>
                      <option value="Growth">Growth ($29)</option>
                      <option value="Enterprise">Enterprise ($99)</option>
                    </select>

                    <button
                      type="submit"
                      disabled={!quickStoreName.trim()}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all shrink-0"
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      <span>{language === 'ar' ? 'إطلاق سريع' : 'Quick Launch'}</span>
                    </button>
                  </form>

                  <div className="hidden sm:block text-slate-300">|</div>

                  {/* Open Comprehensive Modal Button */}
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                    <span>{language === 'ar' ? 'معالج مخصص' : 'Custom Wizard'}</span>
                  </button>
                </div>
              </div>

              {/* Template Presets Bar */}
              <div className="mt-5 pt-4 border-t border-amber-200/60">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-600">
                  <Sparkle className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'ar' ? 'قوالب جاهزة للإطلاق بنقرة واحدة:' : 'One-Click Launch Template Presets:'}</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {QUICK_PRESETS.map((preset) => (
                    <button
                      key={preset.slug}
                      onClick={() => handleLaunchWithPreset(preset)}
                      className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-slate-200/80 hover:border-amber-400 text-xs font-bold text-slate-800 shrink-0 shadow-xs hover:shadow-sm transition-all"
                      title={language === 'ar' ? `إطلاق متجر ${preset.nameAr} فوراً` : `Launch ${preset.name} instantly`}
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">{preset.logoEmoji}</span>
                      <span>{language === 'ar' ? preset.nameAr : preset.name}</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-black border border-amber-200">
                        {preset.plan}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                
                {/* Status Filter Tabs */}
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
                          ? 'bg-slate-900 text-white shadow-xs font-black'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === tab.id ? 'bg-slate-800 text-amber-300' : 'bg-slate-200 text-slate-600'}`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end sm:self-auto">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'بطاقات' : 'Cards'}</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                    title="Table View"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'جدول' : 'Table'}</span>
                  </button>
                </div>
              </div>

              {/* Search & Multi-criteria Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'ar'
                        ? 'ابحث باسم المتجر، الرابط (slug)، أو اسم المالك...'
                        : 'Search by store name, slug, owner name or email...'
                    }
                    className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-amber-500"
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
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 focus:outline-none focus:bg-white focus:border-amber-500"
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

            {/* STORES CONTENT: Cards vs Table View */}
            {processedStores.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs">
                <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 font-brand">
                  {language === 'ar' ? 'لم يتم العثور على أي متجر يطابق البحث' : 'No stores match your search criteria'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'ar' ? 'جرب تغيير معايير البحث أو إضافة متجر جديد' : 'Try clearing filters or provision a new store'}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{language === 'ar' ? 'إضافة متجر جديد' : 'Create New Store'}</span>
                </button>
              </div>
            ) : viewMode === 'cards' ? (
              /* Bento Grid Cards View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {processedStores.map((store) => {
                  const revenue = store.orders
                    .filter((o) => o.status !== 'cancelled')
                    .reduce((sum, o) => sum + o.total, 0);
                  const isCurrentActive = activeStore.id === store.id;

                  return (
                    <div
                      key={store.id}
                      className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                        isCurrentActive ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/80'
                      }`}
                    >
                      <div>
                        {/* Top Store Header */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                              {store.design.logoEmoji || '🛍️'}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-base font-bold text-slate-900 font-brand group-hover:text-amber-600 transition-colors">
                                  {language === 'ar' ? (store.nameAr || store.name) : store.name}
                                </h3>
                                {isCurrentActive && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                    {language === 'ar' ? 'الحالي' : 'Active'}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleCopyStoreLink(store)}
                                className="flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-amber-600 transition-colors mt-0.5"
                                title="Copy Store Link"
                              >
                                <span>{store.slug}.bastiyah.com</span>
                                {copiedId === store.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 opacity-60" />}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {getPlanPill(store.plan)}
                          </div>
                        </div>

                        {/* Direct Status Switcher Bar */}
                        <div className="mt-3 flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                          <span className="text-[11px] font-bold text-slate-500">{language === 'ar' ? 'الحالة:' : 'Status:'}</span>
                          <div className="flex items-center gap-1">
                            {(['active', 'maintenance', 'suspended'] as const).map((st) => (
                              <button
                                key={st}
                                onClick={() => handleToggleStoreStatus(store, st)}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                                  store.status === st
                                    ? st === 'active'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : st === 'maintenance'
                                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                                      : 'bg-rose-600 text-white shadow-xs'
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                                }`}
                              >
                                {st === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : st === 'maintenance' ? (language === 'ar' ? 'صيانة' : 'Maint.') : (language === 'ar' ? 'معلق' : 'Susp.')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Metrics Bento Row */}
                        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'ar' ? 'المبيعات' : 'Revenue'}</span>
                            <span className="text-xs font-black text-emerald-600 font-mono mt-0.5 block truncate">
                              ${revenue.toFixed(2)}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
                            <span className="text-xs font-black text-slate-800 font-mono mt-0.5 block">
                              {store.products.length}
                            </span>
                          </div>
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-500 font-bold uppercase block">{language === 'ar' ? 'الطلبات' : 'Orders'}</span>
                            <span className="text-xs font-black text-indigo-600 font-mono mt-0.5 block">
                              {store.orders.length}
                            </span>
                          </div>
                        </div>

                        {/* Owner & Category info */}
                        <div className="mt-3 text-xs space-y-1 text-slate-600">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">{language === 'ar' ? 'النشاط:' : 'Category:'}</span>
                            <span className="font-bold text-slate-700">{language === 'ar' ? (store.categoryAr || store.category) : store.category}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">{language === 'ar' ? 'المالك:' : 'Merchant:'}</span>
                            <span className="font-medium text-slate-700">{store.ownerName} ({store.ownerPhone || 'N/A'})</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons Row */}
                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Visit Storefront */}
                          <a
                            href={getStoreDisplayUrl(store.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 shadow-xs"
                            title={language === 'ar' ? 'فتح واجهة المتجر' : 'Visit Storefront'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit Store Info */}
                          <button
                            onClick={() => openEditModal(store)}
                            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200/80 shadow-xs"
                            title={language === 'ar' ? 'تعديل بيانات المتجر' : 'Edit Store'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Store */}
                          <button
                            onClick={() => setStoreToDelete(store)}
                            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-rose-200 shadow-xs"
                            title={language === 'ar' ? 'حذف المتجر' : 'Delete Store'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Open Merchant Admin */}
                        <button
                          onClick={() => {
                            switchStore(store.id, 'admin');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Settings className="w-3.5 h-3.5 text-amber-400" />
                          <span>{language === 'ar' ? 'إدارة المتجر' : 'Store Admin'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* High-Density Data Table View */
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'المتجر' : 'Store'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'الرابط الفرعي' : 'Subdomain'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'التصنيف' : 'Category'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'الباقة' : 'Plan'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'المبيعات والطلبات' : 'Revenue & Orders'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="py-3 px-4 text-end">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {processedStores.map((store) => {
                        const revenue = store.orders
                          .filter((o) => o.status !== 'cancelled')
                          .reduce((sum, o) => sum + o.total, 0);

                        return (
                          <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{store.design.logoEmoji}</span>
                                <div>
                                  <p className="font-bold text-slate-900">{language === 'ar' ? (store.nameAr || store.name) : store.name}</p>
                                  <p className="text-[11px] text-slate-500">{store.ownerName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600" dir="ltr">
                              <button
                                onClick={() => handleCopyStoreLink(store)}
                                className="hover:text-amber-600 flex items-center gap-1"
                              >
                                <span>{store.slug}.bastiyah.com</span>
                                <Copy className="w-3 h-3 opacity-60" />
                              </button>
                            </td>
                            <td className="py-3.5 px-4 text-slate-700">
                              {language === 'ar' ? (store.categoryAr || store.category) : store.category}
                            </td>
                            <td className="py-3.5 px-4">
                              {getPlanPill(store.plan)}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-mono">
                                <span className="font-bold text-emerald-600">${revenue.toFixed(2)}</span>
                                <span className="text-slate-400 text-[11px] ms-1.5">({store.orders.length} {language === 'ar' ? 'طلب' : 'orders'})</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <select
                                value={store.status}
                                onChange={(e) => handleToggleStoreStatus(store, e.target.value as any)}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
                              >
                                <option value="active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                                <option value="maintenance">{language === 'ar' ? 'صيانة' : 'Maintenance'}</option>
                                <option value="suspended">{language === 'ar' ? 'معلق' : 'Suspended'}</option>
                              </select>
                            </td>
                            <td className="py-3.5 px-4 text-end">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={getStoreDisplayUrl(store.slug)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                  title="View"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button
                                  onClick={() => openEditModal(store)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => switchStore(store.id, 'admin')}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]"
                                >
                                  {language === 'ar' ? 'لوحة المتجر' : 'Admin'}
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
          TAB 2: ANALYTICS & GMV (المبيعات والتحليلات)
          ========================================================================
        */}
        {activeOwnerTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Top Revenue Summary Banner */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  {language === 'ar' ? 'إجمالي المبيعات المحققة عبر كافة المتاجر المستضافة' : 'Cross-Store Gross Merchandise Value (GMV)'}
                </span>
                <p className="text-3xl sm:text-4xl font-black text-slate-900 font-brand">
                  ${totalPlatformRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'ar' ? `من إجمالي ${totalPlatformOrders} طلب عبر الشبكة بمتوسط قيمة سلة $${averageOrderValue.toFixed(2)}` : `From ${totalPlatformOrders} orders across the network with an AOV of $${averageOrderValue.toFixed(2)}`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'تصدير تقرير المبيعات' : 'Export GMV Report'}</span>
                </button>
              </div>
            </div>

            {/* Top Performing Stores Leaderboard */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-brand flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                <span>{language === 'ar' ? 'ترتيب المتاجر حسب المبيعات (GMV Leaderboard)' : 'Top Performing Stores by Revenue'}</span>
              </h3>

              <div className="space-y-3">
                {stores
                  .map((s) => {
                    const rev = s.orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
                    return { ...s, totalRev: rev };
                  })
                  .sort((a, b) => b.totalRev - a.totalRev)
                  .map((st, idx) => {
                    const percentage = totalPlatformRevenue > 0 ? (st.totalRev / totalPlatformRevenue) * 100 : 0;
                    return (
                      <div key={st.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            <span className="text-base">{st.design.logoEmoji}</span>
                            <span className="font-bold text-slate-900">{language === 'ar' ? (st.nameAr || st.name) : st.name}</span>
                            <span className="text-slate-400 font-mono text-[11px]">({st.slug}.bastiyah.com)</span>
                          </div>
                          <div className="text-end font-mono">
                            <strong className="text-emerald-600 text-sm font-black">${st.totalRev.toFixed(2)}</strong>
                            <span className="text-slate-500 text-[11px] ms-2">({st.orders.length} {language === 'ar' ? 'طلب' : 'orders'})</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(percentage, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Category Distribution Grid */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-brand flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>{language === 'ar' ? 'توزيع المبيعات والمتاجر حسب القطاعات' : 'Category Distribution & Performance'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoryStats.map((cat) => (
                  <div key={cat.en} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-xs">{language === 'ar' ? cat.ar : cat.en}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                        {cat.count} {language === 'ar' ? 'متاجر' : 'stores'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-slate-500">{cat.products} {language === 'ar' ? 'منتج' : 'products'}</span>
                      <strong className="text-emerald-600 font-bold">${cat.revenue.toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 
          ========================================================================
          TAB 3: MERCHANTS & SHOPPERS (دليل التجار والعملاء)
          ========================================================================
        */}
        {activeOwnerTab === 'merchants' && (
          <div className="space-y-6">

            {/* Merchants Header Bar */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    <span>{language === 'ar' ? 'دليل مدراء وتجار المتاجر' : 'Store Merchants Directory'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'إدارة حسابات تسجيل دخول التجار وأرقام هواتفهم وكلمات المرور الخاصة بإدارة كل متجر.'
                      : 'Store managers credentials, login phones, and merchant credentials management.'}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddMerchantModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? '+ تسجيل مدير متجر جديد' : '+ Register Merchant'}</span>
                </button>
              </div>

              {/* Search & Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-8 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={merchantSearch}
                    onChange={(e) => setMerchantSearch(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث باسم التاجر، رقم الهاتف، أو اسم المتجر...' : 'Search by merchant name, phone, or store...'}
                    className="w-full ps-9 pe-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>
                <div className="sm:col-span-4">
                  <select
                    value={merchantPlanFilter}
                    onChange={(e) => setMerchantPlanFilter(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-amber-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع الباقات' : 'All Plans'}</option>
                    <option value="Starter">Starter</option>
                    <option value="Growth">Growth</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Merchants Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-4 text-start">{language === 'ar' ? 'التاجر والمدير' : 'Merchant'}</th>
                      <th className="py-3 px-4 text-start">{language === 'ar' ? 'المتجر المسند' : 'Assigned Store'}</th>
                      <th className="py-3 px-4 text-start">{language === 'ar' ? 'الهاتف (لتسجيل الدخول)' : 'Login Phone'}</th>
                      <th className="py-3 px-4 text-start">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                      <th className="py-3 px-4 text-start">{language === 'ar' ? 'كلمة المرور' : 'Password'}</th>
                      <th className="py-3 px-4 text-end">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {processedMerchants.map((store) => {
                      const isRevealed = revealedPasswordStoreId === store.id;

                      return (
                        <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            {store.ownerName}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-base">{store.design.logoEmoji}</span>
                              <span className="font-bold text-slate-800">{language === 'ar' ? (store.nameAr || store.name) : store.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700" dir="ltr">
                            <button
                              onClick={() => safeCopy(store.ownerPhone || '', 'Phone')}
                              className="hover:text-amber-600 flex items-center gap-1"
                              title="Copy Phone"
                            >
                              <span>{store.ownerPhone || 'N/A'}</span>
                              <Copy className="w-3 h-3 opacity-60" />
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]" dir="ltr">
                            {store.ownerEmail}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <div className="flex items-center gap-1.5">
                              <span>{isRevealed ? (store.adminPassword || 'merchant123') : '••••••••'}</span>
                              <button
                                onClick={() => setRevealedPasswordStoreId(isRevealed ? null : store.id)}
                                className="text-slate-400 hover:text-slate-700 p-1"
                                title="Reveal"
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-end">
                            <button
                              onClick={() => switchStore(store.id, 'admin')}
                              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]"
                            >
                              {language === 'ar' ? 'دخول لوحة المتجر' : 'Access Admin'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Universal Customers Insights Section */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-brand flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span>{language === 'ar' ? 'سجل العملاء الموحد عبر المنصة (Universal Customer Insights)' : 'Universal Cross-Store Shoppers'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'بيانات المشترين الفعلية المرتبطة لحظياً بطلبات كافة المتاجر المستضافة بدون بيانات وهمية' : 'Live unified shopper registry strictly linked to actual multi-store checkouts with zero fake data'}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 self-start sm:self-auto">
                  {processedUniversalCustomers.length} {language === 'ar' ? 'عميل مسجل' : 'Registered Customers'}
                </span>
              </div>

              {/* Customer Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث عن عميل بالاسم، رقم الهاتف، المدينة، أو المتجر...' : 'Search customers by name, phone, city, or store...'}
                  className="w-full ps-9 pe-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-purple-500"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'الهاتف' : 'Phone'}</th>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'الطلبات' : 'Orders'}</th>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}</th>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'المتاجر المرتبطة' : 'Linked Stores'}</th>
                      <th className="py-2.5 px-4 text-end">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {processedUniversalCustomers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                          {language === 'ar' ? 'لا يوجد عملاء مطابقين لنتائج البحث' : 'No customers match the current search filter'}
                        </td>
                      </tr>
                    ) : (
                      processedUniversalCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-900">{cust.name}</p>
                            {cust.city && (
                              <span className="text-[10px] text-slate-500 font-normal">
                                📍 {cust.city}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600" dir="ltr">{cust.phone || cust.email || 'N/A'}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {cust.ordersCount}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-600">${cust.totalSpent.toFixed(2)}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {cust.stores.length > 0 ? (
                                cust.stores.map((sName) => (
                                  <span key={sName} className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                                    {sName}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">
                                  {language === 'ar' ? 'حساب جديد' : 'New account'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-end">
                            <button
                              onClick={() => {
                                setOrderSearch(cust.phone || cust.name);
                                setActiveOwnerTab('orders');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[11px] border border-purple-200 transition-colors"
                              title={language === 'ar' ? 'عرض طلبات العميل عبر كافة المتاجر' : 'View customer orders across all stores'}
                            >
                              {language === 'ar' ? 'عرض الطلبات' : 'View Orders'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 
          ========================================================================
          TAB 4: LIVE CROSS-STORE ORDERS FEED (خلاصة الطلبات)
          ========================================================================
        */}
        {activeOwnerTab === 'orders' && (
          <div className="space-y-6">

            {/* Filter and Control Bar */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-500" />
                    <span>{language === 'ar' ? 'خلاصة الطلبات اللحظية الموحدة' : 'Live Cross-Store Orders Feed'}</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'متابعة كافة طلبات المتاجر لحظة بلحظة مع إمكانية الفرز حسب المتجر وحالة الشحن.'
                      : 'Real-time aggregated feed of all store checkouts across the entire network.'}
                  </p>
                </div>

                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
                  {processedOrders.length} {language === 'ar' ? 'طلب مسجل' : 'Orders'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                <div className="sm:col-span-6 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder={language === 'ar' ? 'ابحث برقم الطلب، اسم العميل، أو المتجر...' : 'Search by order number, customer, or store...'}
                    className="w-full ps-9 pe-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={orderStoreFilter}
                    onChange={(e) => setOrderStoreFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-amber-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع المتاجر' : 'All Stores'}</option>
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-amber-500"
                  >
                    <option value="all">{language === 'ar' ? 'جميع الحالات' : 'All Order Statuses'}</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Feed List */}
            {processedOrders.length === 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center shadow-xs">
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 font-brand">
                  {language === 'ar' ? 'لا توجد طلبات مطابقة' : 'No orders found matching filters'}
                </h3>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-start">
                    <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'المتجر' : 'Store'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'العميل' : 'Customer'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'الإجمالي' : 'Total'}</th>
                        <th className="py-3 px-4 text-start">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                        <th className="py-3 px-4 text-end">{language === 'ar' ? 'إجراءات' : 'Actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {processedOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            {ord.orderNumber || ord.id}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span>{ord.storeLogoEmoji}</span>
                              <span className="font-bold text-slate-800">{ord.storeName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{ord.customer.fullName}</p>
                            <p className="text-[11px] text-slate-500 font-mono" dir="ltr">{ord.customer.phone}</p>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {new Date(ord.date).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 text-sm">
                            ${ord.total.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            {getStatusBadge(ord.status)}
                          </td>
                          <td className="py-3.5 px-4 text-end">
                            <button
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors"
                            >
                              {language === 'ar' ? 'عرض التفاصيل' : 'Details'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 
          ========================================================================
          TAB 5: PLANS & SUBSCRIPTIONS (الباقات والاشتراكات)
          ========================================================================
        */}
        {activeOwnerTab === 'plans' && (
          <div className="space-y-6">

            {/* Plans Bento Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Starter Plan */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Starter</span>
                    <span className="text-xs font-bold text-slate-500">{starterCount} {language === 'ar' ? 'متاجر نشطة' : 'Stores'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-4 font-brand">$0 <span className="text-xs font-normal text-slate-500">/ month</span></h3>
                  <p className="text-xs text-slate-500 mt-1">Free Tier for hobbyists & new creators</p>
                  
                  <ul className="mt-5 space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Up to 50 Products</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Standard Subdomain (.bastiyah.com)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Basic WhatsApp Orders</li>
                  </ul>
                </div>
              </div>

              {/* Growth Plan */}
              <div className="bg-white border-2 border-indigo-500/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 end-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl">
                  Popular
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">Growth</span>
                    <span className="text-xs font-bold text-slate-500">{growthCount} {language === 'ar' ? 'متاجر نشطة' : 'Stores'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-4 font-brand">$29 <span className="text-xs font-normal text-slate-500">/ month</span></h3>
                  <p className="text-xs text-slate-500 mt-1">Growing brands & professional storefronts</p>
                  
                  <ul className="mt-5 space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Unlimited Products & Catalogs</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Custom Domain Support (CNAME)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Advanced Analytics & Reports</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Coupons & Hero Carousel</li>
                  </ul>
                </div>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-gradient-to-br from-amber-500/10 via-white to-white border border-amber-300 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">Enterprise</span>
                    <span className="text-xs font-bold text-slate-500">{enterpriseCount} {language === 'ar' ? 'متاجر نشطة' : 'Stores'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mt-4 font-brand">$99 <span className="text-xs font-normal text-slate-500">/ month</span></h3>
                  <p className="text-xs text-slate-500 mt-1">High-volume merchants & bespoke brands</p>
                  
                  <ul className="mt-5 space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 0% Platform Transaction Fee</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Dedicated R2 Asset Pipeline</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Multi-Staff Roles & OTP Login</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> VIP 24/7 Priority Support</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Direct Plan Switcher Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-brand flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span>{language === 'ar' ? 'إدارة باقات المتاجر الحالية' : 'Store Subscriptions & Upgrades'}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-start">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'المتجر' : 'Store'}</th>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'المالك' : 'Owner'}</th>
                      <th className="py-2.5 px-4 text-start">{language === 'ar' ? 'الباقة الحالية' : 'Current Plan'}</th>
                      <th className="py-2.5 px-4 text-end">{language === 'ar' ? 'ترقية / تعديل الباقة' : 'Change Tier'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {store.design.logoEmoji} {store.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{store.ownerName}</td>
                        <td className="py-3 px-4">{getPlanPill(store.plan)}</td>
                        <td className="py-3 px-4 text-end">
                          <select
                            value={store.plan}
                            onChange={(e) => handleQuickPlanChange(store.id, e.target.value as any)}
                            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer"
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
          TAB 6: PLATFORM SETTINGS & BACKUP (إعدادات المنصة والأمان)
          ========================================================================
        */}
        {activeOwnerTab === 'settings' && (
          <div className="space-y-6">

            {/* Super Admin Credentials Section */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                    {language === 'ar' ? 'بيانات أمان المشرف العام للمنصة' : 'Super Admin Credentials & Security'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'الوصول إلى لوحة تحكم المنصة عبر الرابط السري (/owner) محمي بكلمة المرور هذه.'
                      : 'Master administrative access to the platform console via /owner.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {language === 'ar' ? 'حساب المشرف العام' : 'Super Admin Account'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Master Key
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">{language === 'ar' ? 'اسم المستخدم المعتمد للمالك:' : 'Authorized Owner Username:'}</span>
                    <p className="font-mono text-sm font-bold text-slate-900" dir="ltr">{platformAdminEmail}</p>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {language === 'ar'
                      ? 'يمتلك المشرف العام صلاحية الدخول لكافة المتاجر وتعديل الباقات والإشراف على قاعدة البيانات.'
                      : 'The super admin has universal access to all merchant stores, plan modifications, and backups.'}
                  </p>
                </div>

                {/* Change Admin Password Form */}
                <form onSubmit={handleUpdateAdminPasswordForm} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'ar' ? 'تغيير كلمة مرور المشرف العام' : 'Change Master Password'}
                  </span>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Master Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={newAdminPasswordInput}
                        onChange={(e) => setNewAdminPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 pe-10 shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                    </label>
                    <input
                      type="password"
                      value={confirmAdminPasswordInput}
                      onChange={(e) => setConfirmAdminPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{language === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Update Master Password'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Disaster Recovery, Backup & Restore Section */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                    {language === 'ar' ? 'النسخ الاحتياطي واستعادة البيانات' : 'Platform Backup & Disaster Recovery'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar'
                      ? 'تصدير نسخة كاملة بصيغة JSON لكافة المتاجر والطلبات والمنتجات، أو استعادتها بضغطة زر.'
                      : 'Export or restore full JSON snapshot containing all multi-tenant stores, products, orders, and designs.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* 1. Export JSON */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-200">
                      <FileJson className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-brand">
                      {language === 'ar' ? 'تصدير نسخة كاملة (JSON)' : 'Export Full Snapshot'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {language === 'ar'
                        ? 'تنزيل ملف JSON يحتوي على جميع بيانات المنصة والمتاجر والطلبات.'
                        : 'Download a complete JSON database snapshot of all stores, catalogs, and orders.'}
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{language === 'ar' ? 'تنزيل النسخة الاحتياطية' : 'Download Backup'}</span>
                  </button>
                </div>

                {/* 2. Restore JSON */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 border border-indigo-200">
                      <Upload className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-brand">
                      {language === 'ar' ? 'استعادة من ملف (JSON)' : 'Restore from Snapshot'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
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
                      className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300 shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{language === 'ar' ? 'رفع واستعادة الملف' : 'Upload & Restore'}</span>
                    </button>
                  </div>
                </div>

                {/* 3. Factory Reset */}
                <div className="bg-slate-50 border border-rose-200 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 border border-rose-200">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 font-brand">
                      {language === 'ar' ? 'إعادة ضبط المتاجر الافتراضية' : 'Reset Demo Stores'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {language === 'ar'
                        ? 'استعادة المتاجر النموذجية الأولية (Panda, Royal Oud, Velvet).'
                        : 'Restore initial showcase stores with fresh catalogs and sample orders.'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-rose-200 shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? 'إعادة ضبط المتاجر' : 'Reset to Defaults'}</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Platform System Specifications */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 font-brand mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-600" />
                <span>{language === 'ar' ? 'مواصفات منصة بسطية السحابية' : 'Bastiyah Cloud Platform Architecture'}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'إصدار المنصة' : 'Core Version'}</span>
                  <span className="font-mono font-bold text-slate-900 mt-1 block">v2.4 Enterprise</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'قاعدة البيانات' : 'Database Engine'}</span>
                  <span className="font-mono font-bold text-slate-900 mt-1 block">Convex Realtime DB</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'شبكة الوسائط' : 'Media Storage'}</span>
                  <span className="font-mono font-bold text-slate-900 mt-1 block">{isCloudflareConfigured ? 'Cloudflare R2' : 'Local Storage'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-500 font-bold block">{language === 'ar' ? 'الشبكة السحابية' : 'Edge Network'}</span>
                  <span className="font-mono font-bold text-slate-900 mt-1 block">Vercel Global Edge</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 
        ========================================================================
        MODAL 1: COMPREHENSIVE CREATE NEW STORE MODAL WITH LIVE PREVIEW
        ========================================================================
      */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-sm">
                  <Plus className="w-5 h-5 font-black" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 font-brand">
                    {language === 'ar' ? 'إطلاق متجر سحابي متكامل جديد' : 'Launch New Hosted Store'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'إنشاء متجر برابط فرعي وهوية مستقلة وباقة مخصصة مع معاينة حية' : 'Provision multi-tenant store with real-time card preview and catalog setup'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Split Body: Form & Live Card Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Configuration Form */}
              <form onSubmit={handleCreateStore} className="lg:col-span-7 space-y-4">
                
                {/* Store Names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم المتجر (English)' : 'Store Name (English)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={newStoreName}
                      onChange={(e) => handleNewStoreNameChange(e.target.value)}
                      placeholder="e.g. Amber Oud"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم المتجر (بالعربية)' : 'Store Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={newStoreNameAr}
                      onChange={(e) => setNewStoreNameAr(e.target.value)}
                      placeholder="مثال: عود العنبر"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Subdomain Slug with Validation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'ar' ? 'الرابط الفرعي المخصص (Subdomain)' : 'Custom Subdomain'} *
                  </label>
                  <div className="flex items-center rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 shadow-xs" dir="ltr">
                    <input
                      type="text"
                      required
                      value={newCustomSlug}
                      onChange={(e) => {
                        setNewSlugManuallyEdited(true);
                        setNewCustomSlug(e.target.value);
                      }}
                      placeholder="amber-oud"
                      className="bg-transparent font-mono text-xs text-amber-700 focus:outline-none flex-1 font-bold"
                    />
                    <span className="text-slate-400 text-xs font-mono">.bastiyah.com</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    {isNewSlugValid ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {language === 'ar' ? 'الرابط متاح للاستخدام' : 'Subdomain slug available'}
                      </span>
                    ) : normalizedNewSlug.length > 0 ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {isNewSlugTaken
                          ? (language === 'ar' ? 'هذا الرابط مستخدم بالفعل' : 'Slug already taken')
                          : (language === 'ar' ? 'يجب أن يكون الرابط حرفين أو أكثر' : 'Slug must be at least 2 characters')}
                      </span>
                    ) : (
                      <span className="text-slate-400">{language === 'ar' ? 'يتم توليده تلقائياً من اسم المتجر' : 'Auto-generated from store name'}</span>
                    )}
                  </div>
                </div>

                {/* Taglines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الوصف الترويجي (English)' : 'Tagline (English)'}
                    </label>
                    <input
                      type="text"
                      value={newTagline}
                      onChange={(e) => setNewTagline(e.target.value)}
                      placeholder="e.g. Pure authentic fragrances"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الوصف الترويجي (بالعربية)' : 'Tagline (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={newTaglineAr}
                      onChange={(e) => setNewTaglineAr(e.target.value)}
                      placeholder="مثال: أروع العطور الشرقية الأصيلة"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>
                </div>

                {/* Category, Plan & Currency Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'التصنيف والنشاط' : 'Category'}
                    </label>
                    <select
                      value={newCategoryIndex}
                      onChange={(e) => setNewCategoryIndex(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    >
                      {CATEGORY_PRESETS.map((cat, i) => (
                        <option key={cat.en} value={i}>
                          {language === 'ar' ? cat.ar : cat.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'باقة الاستضافة' : 'Hosting Plan'}
                    </label>
                    <select
                      value={newPlan}
                      onChange={(e) => setNewPlan(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    >
                      <option value="Starter">Starter ($0 / mo)</option>
                      <option value="Growth">Growth ($29 / mo)</option>
                      <option value="Enterprise">Enterprise ($99 / mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'العملة الأساسية' : 'Currency'}
                    </label>
                    <select
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    >
                      {CURRENCY_OPTIONS.map((c) => (
                        <option key={c.code} value={c.code}>
                          {language === 'ar' ? c.labelAr : c.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Layout Style Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ar' ? 'نمط الواجهة والتصميم' : 'Store Layout Style'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LAYOUT_OPTIONS.map((lo) => (
                      <button
                        key={lo.id}
                        type="button"
                        onClick={() => setNewLayoutStyle(lo.id)}
                        className={`p-2.5 rounded-xl border text-start transition-all ${
                          newLayoutStyle === lo.id
                            ? 'bg-amber-50/80 border-amber-500 text-amber-950 ring-2 ring-amber-500/20'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <p className="font-bold text-xs">{language === 'ar' ? lo.labelAr : lo.labelEn}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{language === 'ar' ? lo.descAr : lo.descEn}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme & Design Selection */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    {language === 'ar' ? 'تخصيص الهوية واللون والشعار' : 'Theme & Visual Styling'}
                  </span>
                  
                  {/* Color Chips */}
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1.5">{language === 'ar' ? 'لون الهوية الرئيسي:' : 'Primary Accent Color:'}</span>
                    <div className="flex items-center gap-2">
                      {THEME_COLOR_OPTIONS.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setNewThemeColor(col.id)}
                          title={language === 'ar' ? col.labelAr : col.labelEn}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform ${col.bgClass} ${newThemeColor === col.id ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'}`}
                        >
                          {newThemeColor === col.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emoji Picker */}
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1.5">{language === 'ar' ? 'أيقونة الشعار (Emoji):' : 'Logo Emoji:'}</span>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                      {EMOJI_OPTIONS.map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setNewLogoEmoji(em)}
                          className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all shrink-0 ${
                            newLogoEmoji === em ? 'bg-amber-100 border-2 border-amber-500 shadow-xs scale-110' : 'bg-white border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Merchant Credentials */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم التاجر' : 'Merchant Name'}
                    </label>
                    <input
                      type="text"
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      placeholder="Store Merchant"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الهاتف (لتسجيل الدخول)' : 'Owner Phone'}
                    </label>
                    <input
                      type="tel"
                      value={newOwnerPhone}
                      onChange={(e) => setNewOwnerPhone(e.target.value)}
                      placeholder="+964 770 123 4567"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="merchant123"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs pe-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>

                  <button
                    type="submit"
                    disabled={!isNewSlugValid || !newStoreName.trim()}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إطلاق المتجر فوراً' : 'Launch Store'}</span>
                  </button>
                </div>
              </form>

              {/* Right Column: Live Interactive Card Preview */}
              <div className="lg:col-span-5 flex flex-col justify-center space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    {language === 'ar' ? 'معاينة حية لبطاقة المتجر:' : 'Live Store Card Preview:'}
                  </span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-black">
                    Live
                  </span>
                </div>

                {/* Preview Box */}
                <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 shadow-lg space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                        {newLogoEmoji}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base font-brand">
                          {language === 'ar' ? (newStoreNameAr.trim() || newStoreName.trim() || 'اسم المتجر') : (newStoreName.trim() || 'Store Name')}
                        </h4>
                        <p className="text-[11px] font-mono text-amber-700" dir="ltr">
                          {normalizedNewSlug || 'subdomain'}.bastiyah.com
                        </p>
                      </div>
                    </div>
                    {getPlanPill(newPlan)}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase block">{language === 'ar' ? 'المبيعات' : 'GMV'}</span>
                      <span className="font-mono font-bold text-emerald-600">$0.00</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase block">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
                      <span className="font-mono font-bold text-slate-800">6 (Starter)</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase block">{language === 'ar' ? 'العملة' : 'Currency'}</span>
                      <span className="font-bold text-slate-800">{CURRENCY_OPTIONS.find((c) => c.code === newCurrency)?.symbol || '$'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'ar' ? 'النشاط:' : 'Category:'}</span>
                      <span className="font-bold text-slate-800">{language === 'ar' ? CATEGORY_PRESETS[newCategoryIndex].ar : CATEGORY_PRESETS[newCategoryIndex].en}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'ar' ? 'النمط:' : 'Layout:'}</span>
                      <span className="font-bold text-slate-800">{newLayoutStyle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{language === 'ar' ? 'المالك:' : 'Merchant:'}</span>
                      <span className="font-bold text-slate-800">{newOwnerName || 'Store Merchant'}</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                  {language === 'ar'
                    ? 'سيتم تفعيل المتجر وعزل بياناته السحابية فور الضغط على زر الإطلاق.'
                    : 'Store will be immediately provisioned with isolated multi-tenant routing.'}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 2: COMPREHENSIVE EDIT STORE MODAL
        ========================================================================
      */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center text-xl">
                  {editLogoEmoji}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-brand">
                    {language === 'ar' ? `تعديل متجر (${editingStore.nameAr || editingStore.name})` : `Edit Store (${editingStore.name})`}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono" dir="ltr">
                    {editingStore.slug}.bastiyah.com
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingStore(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStore} className="mt-6 space-y-5">
              
              {/* Section 1: Branding & Identity */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  {language === 'ar' ? '1. الهوية والاسم والرابط' : '1. Identity & Subdomain'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم المتجر (English)' : 'Store Name (English)'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم المتجر (بالعربية)' : 'Store Name (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={editNameAr}
                      onChange={(e) => setEditNameAr(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الرابط الفرعي (Subdomain Slug)' : 'Subdomain Slug'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'النشاط / التصنيف' : 'Category'}
                    </label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      placeholder="e.g. Perfumes & Oud"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الوصف الترويجي (English)' : 'Tagline (English)'}
                    </label>
                    <input
                      type="text"
                      value={editTagline}
                      onChange={(e) => setEditTagline(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'الوصف الترويجي (بالعربية)' : 'Tagline (Arabic)'}
                    </label>
                    <input
                      type="text"
                      value={editTaglineAr}
                      onChange={(e) => setEditTaglineAr(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Visual Styling & Design */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                  {language === 'ar' ? '2. المظهر والتصميم وهوية المتجر' : '2. Theme & Visual Appearance'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">{language === 'ar' ? 'لون الهوية الرئيسي:' : 'Theme Color:'}</span>
                    <div className="flex items-center gap-2">
                      {THEME_COLOR_OPTIONS.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setEditThemeColor(col.id)}
                          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform ${col.bgClass} ${editThemeColor === col.id ? 'ring-2 ring-offset-2 ring-slate-900 scale-110 shadow-sm' : 'opacity-80 hover:opacity-100'}`}
                        >
                          {editThemeColor === col.id && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">{language === 'ar' ? 'نمط الواجهة:' : 'Layout Style:'}</span>
                    <select
                      value={editLayoutStyle}
                      onChange={(e) => setEditLayoutStyle(e.target.value as StoreLayoutStyle)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                    >
                      {LAYOUT_OPTIONS.map((lo) => (
                        <option key={lo.id} value={lo.id}>
                          {language === 'ar' ? lo.labelAr : lo.labelEn}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1.5">{language === 'ar' ? 'أيقونة الشعار (Emoji):' : 'Logo Emoji:'}</span>
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {EMOJI_OPTIONS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEditLogoEmoji(em)}
                        className={`w-8 h-8 rounded-xl text-base flex items-center justify-center transition-all shrink-0 ${
                          editLogoEmoji === em ? 'bg-amber-100 border-2 border-amber-500 shadow-xs scale-110' : 'bg-white border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 3: Plan & Status */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  {language === 'ar' ? '3. الباقة وحالة المتجر' : '3. Hosting Plan & Status'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'باقة الاستضافة' : 'Hosting Plan'}
                    </label>
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    >
                      <option value="Starter">Starter ($0)</option>
                      <option value="Growth">Growth ($29)</option>
                      <option value="Enterprise">Enterprise ($99)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'حالة المتجر' : 'Store Status'}
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    >
                      <option value="active">Active (نشط)</option>
                      <option value="maintenance">Maintenance (تحت الصيانة)</option>
                      <option value="suspended">Suspended (معلق)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Merchant Credentials */}
              <div className="space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 block">
                  {language === 'ar' ? '4. بيانات المالك وحساب التاجر' : '4. Owner & Merchant Account'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'اسم المالك / التاجر' : 'Owner Name'}
                    </label>
                    <input
                      type="text"
                      value={editOwnerName}
                      onChange={(e) => setEditOwnerName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'رقم الهاتف' : 'Owner Phone'}
                    </label>
                    <input
                      type="tel"
                      value={editOwnerPhone}
                      onChange={(e) => setEditOwnerPhone(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Owner Email'}
                    </label>
                    <input
                      type="email"
                      value={editOwnerEmail}
                      onChange={(e) => setEditOwnerEmail(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'ar' ? 'كلمة مرور إدارة المتجر' : 'Store Admin Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editAdminPassword}
                        onChange={(e) => setEditAdminPassword(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-amber-500 shadow-xs pe-8"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 3: ORDER DETAILS MODAL
        ========================================================================
      */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-brand">
                    {language === 'ar' ? `تفاصيل الطلب: ${selectedOrderDetails.orderNumber || selectedOrderDetails.id}` : `Order Details: ${selectedOrderDetails.orderNumber || selectedOrderDetails.id}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? `المتجر: ${selectedOrderDetails.storeName}` : `Store: ${selectedOrderDetails.storeName}`} ({selectedOrderDetails.storeSlug}.bastiyah.com)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <span className="text-slate-500 font-bold block uppercase">{language === 'ar' ? 'بيانات العميل' : 'Customer Info'}</span>
                <p className="font-bold text-slate-900 text-sm">{selectedOrderDetails.customer.fullName}</p>
                <p className="text-slate-600 font-mono" dir="ltr">{selectedOrderDetails.customer.phone}</p>
                <p className="text-slate-500 font-mono" dir="ltr">{selectedOrderDetails.customer.email}</p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
                <span className="text-slate-500 font-bold block uppercase">{language === 'ar' ? 'عنوان التوصيل' : 'Shipping Address'}</span>
                <p className="text-slate-700">{selectedOrderDetails.customer.address}</p>
                <p className="text-slate-800 font-bold">{selectedOrderDetails.customer.city}</p>
                <p className="text-slate-500">{language === 'ar' ? 'طريقة الدفع:' : 'Payment:'} <span className="font-bold text-slate-900">{selectedOrderDetails.paymentMethod}</span></p>
              </div>
            </div>

            {/* Itemized Products */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'ar' ? 'المنتجات المطلوبة' : 'Order Line Items'}
              </span>
              <div className="space-y-2">
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-12 h-12 object-cover rounded-xl border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{item.productName}</p>
                        <p className="text-[11px] text-slate-500">
                          ${item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total & Direct Status Footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-500 font-bold">{language === 'ar' ? 'تحديث الحالة:' : 'Change Status:'}</span>
                <select
                  value={selectedOrderDetails.status}
                  onChange={(e) => handleUpdatePlatformOrderStatus(e.target.value as OrderStatus)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:bg-white focus:border-amber-500 cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {getStatusBadge(selectedOrderDetails.status)}
              </div>

              <div className="text-end">
                <span className="text-xs text-slate-500 block">{language === 'ar' ? 'الإجمالي النهائي' : 'Order Total'}</span>
                <span className="text-2xl font-black text-emerald-600 font-mono">
                  ${selectedOrderDetails.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetStoreId = selectedOrderDetails.storeId;
                  setSelectedOrderDetails(null);
                  switchStore(targetStoreId, 'admin');
                  setAdminTab('orders');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <Settings className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'ar' ? 'معالجة في لوحة المتجر' : 'Manage in Store Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 4: REGISTER MERCHANT MODAL
        ========================================================================
      */}
      {showAddMerchantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-brand flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>{language === 'ar' ? 'تسجيل مدير متجر جديد' : 'Register Store Merchant'}</span>
              </h3>
              <button onClick={() => setShowAddMerchantModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMerchantByOwner} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'المتجر المسند' : 'Store'}</label>
                <select
                  value={newMerchantStoreId || stores[0]?.id}
                  onChange={(e) => setNewMerchantStoreId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.slug})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'اسم التاجر / المدير' : 'Merchant Name'}</label>
                <input
                  type="text"
                  required
                  value={newMerchantName}
                  onChange={(e) => setNewMerchantName(e.target.value)}
                  placeholder="e.g. Ahmed Al-Baghdadi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'رقم الهاتف (لتسجيل الدخول عبر OTP)' : 'Phone (for OTP Login)'}</label>
                <input
                  type="tel"
                  required
                  value={newMerchantPhone}
                  onChange={(e) => setNewMerchantPhone(e.target.value)}
                  placeholder="+964 770 123 4567"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{language === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                <input
                  type="text"
                  value={newMerchantPassword}
                  onChange={(e) => setNewMerchantPassword(e.target.value)}
                  placeholder="merchant123"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMerchantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  {language === 'ar' ? 'تسجيل المدير' : 'Register Merchant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 5: DELETE STORE CONFIRMATION DIALOG
        ========================================================================
      */}
      {storeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 font-brand">
              {language === 'ar' ? `حذف متجر (${storeToDelete.nameAr || storeToDelete.name}) نهائياً؟` : `Delete Store (${storeToDelete.name})?`}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {language === 'ar'
                ? 'سيتم حذف المتجر وكافة منتجاته وطلباته نهائياً من قاعدة بيانات المنصة. لا يمكن التراجع عن هذا الإجراء.'
                : 'This will permanently remove the store, its catalogs, orders, and subdomains.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setStoreToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  deleteHostedStore(storeToDelete.id);
                  setStoreToDelete(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                {language === 'ar' ? 'نعم، حذف المتجر' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        MODAL 6: FACTORY RESET CONFIRMATION MODAL
        ========================================================================
      */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 rounded-3xl w-full max-w-md p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3 border border-rose-200">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900 font-brand">
              {language === 'ar' ? 'إعادة ضبط المتاجر النموذجية؟' : 'Reset All Stores to Defaults?'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {language === 'ar'
                ? 'سيتم حذف كافة التعديلات واسترجاع المتاجر الافتراضية النموذجية (Panda, Royal Oud, Velvet).'
                : 'This will reset all current stores back to factory demo starter stores.'}
            </p>

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  resetStoresToDefault();
                  setShowResetConfirm(false);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                {language === 'ar' ? 'نعم، إعادة الضبط' : 'Yes, Reset Defaults'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
