import React, { useState, useMemo } from 'react';
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
  SlidersHorizontal,
  Mail,
  User,
  Activity,
  AlertTriangle,
  ArrowUpDown
} from 'lucide-react';
import { ImageUploader } from '../common/ImageUploader';
import { useStore } from '../../context/StoreContext';
import { StoreThemeColor, StoreLayoutStyle, HostedStore } from '../../types';
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
  } = useStore();

  const [isSeeding, setIsSeeding] = useState(false);
  const [testImageUrl, setTestImageUrl] = useState('');
  const [showCloudSection, setShowCloudSection] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // View Mode: 'cards' vs 'table'
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'Starter' | 'Growth' | 'Enterprise'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'revenue' | 'orders' | 'products' | 'name'>('newest');

  // Editing & Modals
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
  const [editPlan, setEditPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [editStatus, setEditStatus] = useState<'active' | 'maintenance' | 'suspended'>('active');
  const [editThemeColor, setEditThemeColor] = useState<StoreThemeColor>('emerald');
  const [editLayoutStyle, setEditLayoutStyle] = useState<StoreLayoutStyle>('modern-split');
  const [editLogoEmoji, setEditLogoEmoji] = useState('🛍️');

  // Form State for Creating a New Store
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreNameAr, setNewStoreNameAr] = useState('');
  const [newCustomSlug, setNewCustomSlug] = useState('');
  const [newSlugManuallyEdited, setNewSlugManuallyEdited] = useState(false);
  const [newTagline, setNewTagline] = useState('');
  const [newTaglineAr, setNewTaglineAr] = useState('');
  const [newCategoryIndex, setNewCategoryIndex] = useState(0);
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newPlan, setNewPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [newThemeColor, setNewThemeColor] = useState<StoreThemeColor>('emerald');
  const [newLayoutStyle, setNewLayoutStyle] = useState<StoreLayoutStyle>('modern-split');
  const [newLogoEmoji, setNewLogoEmoji] = useState('🛍️');

  // Handle Opening Edit Modal
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

  // Aggregated Platform KPIs
  const totalStores = stores.length;
  const activeCount = stores.filter((s) => s.status === 'active').length;
  const maintenanceCount = stores.filter((s) => s.status === 'maintenance').length;
  const suspendedCount = stores.filter((s) => s.status === 'suspended').length;
  const totalPlatformOrders = stores.reduce((acc, s) => acc + s.orders.length, 0);
  const totalPlatformProducts = stores.reduce((acc, s) => acc + s.products.length, 0);
  const totalPlatformRevenue = stores.reduce(
    (acc, s) =>
      acc +
      s.orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    0
  );

  // Filtered & Sorted Stores
  const processedStores = useMemo(() => {
    let result = stores.filter((s) => {
      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      // Plan filter
      if (planFilter !== 'all' && s.plan !== planFilter) return false;
      // Search filter
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

    // Sorting
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

  const layoutLabels: Record<StoreLayoutStyle, string> = {
    'modern-split': t.layoutModernSplit,
    'luxury-centered': t.layoutLuxuryCentered,
    'minimal-editorial': t.layoutMinimalEditorial,
    'vibrant-banner': t.layoutVibrantBanner,
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
                <span className="text-[10px] text-slate-400 font-mono">
                  Master Platform Admin
                </span>
              </div>
            </button>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick Export CSV */}
            <button
              onClick={handleExportCSV}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Export all stores to CSV"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            {/* Cloudflare / Convex Toggle */}
            <button
              onClick={() => setShowCloudSection(!showCloudSection)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                showCloudSection
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">{language === 'ar' ? 'البنية السحابية' : 'Cloud Infra'}</span>
            </button>

            {/* Create New Store CTA Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ar' ? 'إضافة متجر جديد' : 'New Store'}</span>
            </button>

            {/* Back to Platform Landing */}
            <button
              onClick={() => goToPlatform('landing')}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              title="Return to Main Landing Page"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الرئيسية' : 'Main Site'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <span>{language === 'en' ? 'العربية' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* 
          ========================================================================
          2. HEADER TITLE & PLATFORM KPIS
          ========================================================================
        */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-2">
              <Crown className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'لوحة تحكم مالك المنصة' : 'Bastiyah Platform Owner Portal'}</span>
              <span>•</span>
              <span className="font-mono">*.bastiyah.com</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white font-brand tracking-tight">
              {language === 'ar' ? 'إدارة المتاجر المسجلة' : 'Registered Stores Management'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'تحكم كامل بجميع المتاجر المستضافة على منصة بسطية: تفعيل، إيقاف، تعديل الروابط المخصصة، وتتبع المبيعات والمنتجات.'
                : 'Complete control over all hosted stores on Bastiyah: status toggles, custom subdomain links, plans, and real-time metrics.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
            >
              <Link2 className="w-4 h-4 text-amber-400" />
              <span>{t.customLinkGenerator}</span>
            </button>
          </div>
        </div>

        {/* Platform KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Stores */}
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

          {/* 2. Platform GMV / Revenue */}
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

          {/* 3. Total Orders */}
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

          {/* 4. Total Hosted Products */}
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

        {/* 
          ========================================================================
          3. CLOUD INFRASTRUCTURE (CONVEX & CLOUDFLARE R2) [COLLAPSIBLE]
          ========================================================================
        */}
        {showCloudSection && (
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center justify-between pb-5 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-brand">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              {/* Convex Status Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
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

              {/* Cloudflare R2 Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    Cloudflare R2
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400">
                    CDN: images.bastiyah.com
                  </span>
                </div>
                <div>
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
          </div>
        )}

        {/* 
          ========================================================================
          4. STORE MANAGEMENT CONTROL BAR (TABS, SEARCH, FILTERS & VIEW MODE)
          ========================================================================
        */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          
          {/* Top Row: Status Filter Tabs + View Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', labelAr: 'جميع المتاجر', labelEn: 'All Stores', count: totalStores },
                { id: 'active', labelAr: 'النشطة', labelEn: 'Active', count: activeCount, color: 'text-emerald-400' },
                { id: 'maintenance', labelAr: 'تحت الصيانة', labelEn: 'Maintenance', count: maintenanceCount, color: 'text-amber-400' },
                { id: 'suspended', labelAr: 'المعلقة', labelEn: 'Suspended', count: suspendedCount, color: 'text-rose-400' },
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

            {/* View Mode Switcher: Cards vs Table */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'table'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <TableIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'جدول' : 'Table'}</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'بطاقات' : 'Cards'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Search, Plan Filter, and Sorting */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Live Search Input */}
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

            {/* Plan Filter */}
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

            {/* Sort Options */}
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

        {/* 
          ========================================================================
          5. REGISTERED STORES DISPLAY (TABLE OR CARDS)
          ========================================================================
        */}
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
          /* ====================================================================
             TABLE VIEW FOR REGISTERED STORES
             ==================================================================== */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-4 text-start">{language === 'ar' ? 'المتجر والرابط المخصص' : 'Store & Subdomain'}</th>
                    <th className="py-4 px-4 text-start">{language === 'ar' ? 'المالك وبيانات الاتصال' : 'Owner & Contact'}</th>
                    <th className="py-4 px-4 text-center">{language === 'ar' ? 'الباقة' : 'Plan'}</th>
                    <th className="py-4 px-4 text-center">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="py-4 px-4 text-center">{language === 'ar' ? 'المنتجات والطلبات' : 'Products / Orders'}</th>
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
                      <tr
                        key={store.id}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* 1. Store & Link */}
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

                        {/* 2. Owner & Contact */}
                        <td className="py-4 px-4">
                          <div className="text-xs">
                            <p className="font-bold text-slate-200">{store.ownerName}</p>
                            <p className="text-slate-400 font-mono text-[11px] truncate max-w-[180px]">
                              {store.ownerEmail}
                            </p>
                          </div>
                        </td>

                        {/* 3. Hosting Plan */}
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

                        {/* 4. Status (with Quick Change Dropdown) */}
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

                        {/* 5. Products & Orders count */}
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="text-slate-300 font-bold">{store.products.length} {language === 'ar' ? 'منتج' : 'prod'}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-slate-300 font-bold">{store.orders.length} {language === 'ar' ? 'طلب' : 'ord'}</span>
                          </div>
                        </td>

                        {/* 6. Revenue */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            ${storeRevenue.toFixed(2)}
                          </span>
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="py-4 px-4 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button */}
                            <button
                              onClick={() => openEditModal(store)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title={language === 'ar' ? 'تعديل بيانات المتجر' : 'Edit Store Details'}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Impersonate / Enter Store Admin */}
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

                            {/* Visit Storefront */}
                            <button
                              onClick={() => switchStore(store.id, 'home')}
                              className="px-2.5 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-opacity hover:opacity-90"
                              style={{ backgroundColor: storeTheme.hex }}
                              title={language === 'ar' ? 'زيارة المتجر' : 'Visit Live Storefront'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span className="hidden md:inline">{language === 'ar' ? 'زيارة' : 'Visit'}</span>
                            </button>

                            {/* Delete Button */}
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
          /* ====================================================================
             CARD GRID VIEW FOR REGISTERED STORES
             ==================================================================== */
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
                    {/* Top Header */}
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
                          <span className="text-xs text-slate-400 block mt-0.5">
                            {store.category}
                          </span>
                        </div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={store.status}
                        onChange={(e) => handleToggleStoreStatus(store, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border appearance-none cursor-pointer text-center focus:outline-none transition-colors ${
                          store.status === 'active'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : store.status === 'maintenance'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        <option value="active" className="bg-slate-900 text-emerald-400">
                          {language === 'ar' ? 'نشط' : 'Active'}
                        </option>
                        <option value="maintenance" className="bg-slate-900 text-amber-400">
                          {language === 'ar' ? 'صيانة' : 'Maint.'}
                        </option>
                        <option value="suspended" className="bg-slate-900 text-rose-400">
                          {language === 'ar' ? 'معلق' : 'Suspended'}
                        </option>
                      </select>
                    </div>

                    {/* Subdomain Pill */}
                    <div className="mt-4 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950 border border-slate-800" dir="ltr">
                      <button
                        onClick={() => switchStore(store.id, 'home')}
                        className="font-mono text-xs text-emerald-400 hover:underline truncate"
                      >
                        https://{store.slug}.bastiyah.com
                      </button>
                      <button
                        onClick={() => handleCopyStoreLink(store)}
                        className="text-slate-500 hover:text-white p-1 rounded"
                        title="Copy link"
                      >
                        {copiedId === store.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Owner & Tagline */}
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 min-h-[2rem]">
                      {language === 'ar' ? store.taglineAr || store.tagline : store.tagline}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                      <span>
                        {language === 'ar' ? 'المالك:' : 'Merchant:'}{' '}
                        <strong className="text-slate-200">{store.ownerName}</strong>
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">{store.ownerEmail}</span>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المنتجات' : 'Products'}</span>
                        <span className="font-bold text-white text-sm">{store.products.length}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'الطلبات' : 'Orders'}</span>
                        <span className="font-bold text-white text-sm">{store.orders.length}</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                        <span className="text-[10px] text-slate-400 block">{language === 'ar' ? 'المبيعات' : 'Revenue'}</span>
                        <span className="font-bold text-emerald-400 text-sm font-mono">${storeRevenue.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openEditModal(store)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Edit store"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          switchStore(store.id, 'admin');
                          setAdminTab('dashboard');
                        }}
                        className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'إدارة' : 'Manage'}</span>
                      </button>

                      <button
                        onClick={() => switchStore(store.id, 'home')}
                        className="px-3.5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-opacity hover:opacity-90"
                        style={{ backgroundColor: storeTheme.hex }}
                      >
                        <span>{language === 'ar' ? 'زيارة' : 'Visit'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      {stores.length > 1 && (
                        <button
                          onClick={() => setStoreToDelete(store)}
                          className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-slate-800 transition-colors"
                          title="Delete store"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 
        ========================================================================
        6. FULL STORE EDIT MODAL (POPUP WINDOW)
        ========================================================================
      */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl">
                  {editLogoEmoji}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-brand">
                    {language === 'ar' ? `تعديل بيانات متجر: ${editingStore.name}` : `Edit Store: ${editingStore.name}`}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    ID: {editingStore.id} • {editingStore.slug}.bastiyah.com
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingStore(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditStore} className="space-y-5">
              
              {/* Store Names (EN & AR) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم المتجر (الإنجليزية) *' : 'Store Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم المتجر (العربية)' : 'Store Name (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editNameAr}
                    onChange={(e) => setEditNameAr(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 font-brand"
                  />
                </div>
              </div>

              {/* Dedicated Subdomain Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الرابط الفرعي المخصص على بسطية *' : 'Dedicated Subdomain Slug *'}
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-amber-500" dir="ltr">
                  <span className="text-xs font-mono text-slate-500">https://</span>
                  <input
                    type="text"
                    required
                    value={editSlug}
                    onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="bg-transparent text-emerald-400 font-mono font-bold text-sm focus:outline-none flex-1 min-w-0 px-1"
                  />
                  <span className="text-xs font-mono text-slate-500">.bastiyah.com</span>
                </div>
              </div>

              {/* Taglines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'الوصف الترويجي (EN)' : 'Tagline (English)'}
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
                    {language === 'ar' ? 'الوصف الترويجي (العربية)' : 'Tagline (Arabic)'}
                  </label>
                  <input
                    type="text"
                    value={editTaglineAr}
                    onChange={(e) => setEditTaglineAr(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-brand"
                  />
                </div>
              </div>

              {/* Owner Info & Plan & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'اسم صاحب المتجر' : 'Owner / Merchant Name'}
                  </label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={(e) => setEditOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Plan, Status & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'الباقة المستضافة' : 'Hosting Plan'}
                  </label>
                  <select
                    value={editPlan}
                    onChange={(e) => setEditPlan(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Starter">Starter ($0)</option>
                    <option value="Growth">Growth ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'حالة المتجر' : 'Store Status'}
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="active">{language === 'ar' ? 'نشط (Active)' : 'Active'}</option>
                    <option value="maintenance">{language === 'ar' ? 'تحت الصيانة (Maintenance)' : 'Maintenance'}</option>
                    <option value="suspended">{language === 'ar' ? 'معلق (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {language === 'ar' ? 'نشاط المتجر' : 'Category'}
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Theme & Design Selection */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  {language === 'ar' ? 'لون الهوية والشعار' : 'Theme Color & Logo'}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {(Object.keys(THEME_CONFIGS) as StoreThemeColor[]).map((cKey) => {
                    const cfg = THEME_CONFIGS[cKey];
                    const isSelected = editThemeColor === cKey;
                    return (
                      <button
                        key={cKey}
                        type="button"
                        onClick={() => setEditThemeColor(cKey)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform ${
                          isSelected ? 'scale-125 ring-2 ring-white' : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: cfg.hex }}
                        title={cfg.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {EMOJI_OPTIONS.map((emo) => (
                    <button
                      key={emo}
                      type="button"
                      onClick={() => setEditLogoEmoji(emo)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all ${
                        editLogoEmoji === emo
                          ? 'border-amber-500 bg-amber-500/20 scale-110'
                          : 'border-slate-800 bg-slate-950 hover:bg-slate-800'
                      }`}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
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
        7. CREATE NEW STORE MODAL
        ========================================================================
      */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-5 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-brand">
                    {language === 'ar' ? 'إنشاء متجر مستضاف جديد' : 'Provision New Hosted Store'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Instant *.bastiyah.com deployment with isolated database
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t.storeNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={newStoreName}
                  onChange={(e) => handleNewStoreNameChange(e.target.value)}
                  placeholder="e.g. Silk & Stone"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {t.storeNameArLabel}
                </label>
                <input
                  type="text"
                  value={newStoreNameAr}
                  onChange={(e) => setNewStoreNameAr(e.target.value)}
                  placeholder="مثال: حرير وحجر"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 font-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {language === 'ar' ? 'الرابط الفرعي المخصص *' : 'Custom Subdomain Slug *'}
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-amber-500" dir="ltr">
                  <span className="text-xs font-mono text-slate-500">https://</span>
                  <input
                    type="text"
                    required
                    value={newCustomSlug}
                    onChange={(e) => {
                      setNewSlugManuallyEdited(true);
                      setNewCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                    }}
                    placeholder="store-name"
                    className="bg-transparent text-emerald-400 font-mono font-bold text-sm focus:outline-none flex-1 min-w-0 px-1"
                  />
                  <span className="text-xs font-mono text-slate-500">.bastiyah.com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storeCategoryLabel}
                  </label>
                  <select
                    value={newCategoryIndex}
                    onChange={(e) => setNewCategoryIndex(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {CATEGORY_PRESETS.map((cat, idx) => (
                      <option key={cat.en} value={idx}>
                        {language === 'ar' ? cat.ar : cat.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    {t.storePlanLabel}
                  </label>
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Starter">Starter ($0)</option>
                    <option value="Growth">Growth ($29)</option>
                    <option value="Enterprise">Enterprise ($99)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
        8. DELETE STORE CONFIRMATION DIALOG
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
