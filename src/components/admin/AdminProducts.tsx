import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  X,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Sparkles,
  ArrowUpDown,
  Filter,
  Eye,
  Percent,
  Package,
  Copy,
  Star,
  DollarSign
} from 'lucide-react';
import { ProductMediaUploader } from '../common/ProductMediaUploader';

export const AdminProducts: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    activeStore,
    t, 
    language, 
    getProductName, 
    getCategoryName,
    addToast
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'inStock' | 'lowStock' | 'outOfStock'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currency = activeStore.settings.currency || '$';

  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    tagline: '',
    taglineAr: '',
    description: '',
    descriptionAr: '',
    category: 'Audio & Sound' as ProductCategory,
    price: 99,
    originalPrice: '' as string | number,
    stock: 25,
    badge: '' as string,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    tags: 'modern, premium, smart',
    sizes: 'S, M, L, XL',
    colors: 'Black, Silver, Gold',
    featured: true,
  });

  const categories: ProductCategory[] = [
    'Audio & Sound',
    'Wearables & Tech',
    'Workspace & Setup',
    'Lifestyle & Travel',
    'Smart Home',
    'Perfumes & Oud',
    'Fashion & Luxury',
  ];

  const imagePresets = [
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Royal Oud', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Couture Bag', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
    { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
    { label: 'Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
    { label: 'Coffee Cup', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
  ];

  const filteredProducts = products.filter((p) => {
    const pName = getProductName(p);
    const pNameAr = p.nameAr || '';
    const q = searchTerm.toLowerCase();
    const matchesSearch = pName.toLowerCase().includes(q) ||
                          pNameAr.toLowerCase().includes(q) ||
                          p.category.toLowerCase().includes(q) ||
                          (p.tags && p.tags.some(t => t.toLowerCase().includes(q)));
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    
    let matchesStock = true;
    if (stockFilter === 'inStock') matchesStock = p.stock > 10;
    if (stockFilter === 'lowStock') matchesStock = p.stock > 0 && p.stock <= 10;
    if (stockFilter === 'outOfStock') matchesStock = p.stock === 0;

    return matchesSearch && matchesCat && matchesStock;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      nameAr: '',
      tagline: '',
      taglineAr: '',
      description: '',
      descriptionAr: '',
      category: 'Audio & Sound',
      price: 99,
      originalPrice: '',
      stock: 25,
      badge: '',
      images: [imagePresets[0].url],
      tags: 'smart, premium',
      sizes: 'S, M, L, XL',
      colors: 'Black, Silver',
      featured: true,
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      nameAr: p.nameAr || '',
      tagline: p.tagline,
      taglineAr: p.taglineAr || '',
      description: p.description,
      descriptionAr: p.descriptionAr || '',
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice && p.originalPrice > p.price ? p.originalPrice : '',
      stock: p.stock,
      badge: p.badge || '',
      images: p.images && p.images.length > 0 ? [...p.images] : [imagePresets[0].url],
      tags: p.tags?.join(', ') || '',
      sizes: p.variants?.sizes?.join(', ') || '',
      colors: p.variants?.colors?.join(', ') || '',
      featured: p.featured ?? true,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast(language === 'ar' ? 'يرجى إدخال اسم المنتج' : 'Please provide product name', 'error');
      return;
    }

    const sizeList = formData.sizes.split(',').map((s) => s.trim()).filter(Boolean);
    const colorList = formData.colors.split(',').map((c) => c.trim()).filter(Boolean);
    const validImages = formData.images.filter((img) => img && img.trim().length > 0);
    if (validImages.length === 0) {
      validImages.push(imagePresets[0].url);
    }

    const origPriceNum = formData.originalPrice !== '' && formData.originalPrice !== undefined ? Number(formData.originalPrice) : undefined;
    const hasDiscount = origPriceNum !== undefined && !isNaN(origPriceNum) && origPriceNum > Number(formData.price);

    const payload = {
      name: formData.name.trim(),
      nameAr: formData.nameAr.trim() || formData.name.trim(),
      tagline: formData.tagline.trim() || formData.name.trim(),
      taglineAr: formData.taglineAr.trim() || formData.nameAr.trim() || formData.name.trim(),
      description: formData.description.trim(),
      descriptionAr: formData.descriptionAr.trim() || formData.description.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: hasDiscount ? origPriceNum : undefined,
      stock: Number(formData.stock),
      badge: (formData.badge && formData.badge.trim() ? formData.badge.trim() : undefined) as any,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
      images: validImages,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
      variants: {
        sizes: sizeList.length > 0 ? sizeList : undefined,
        colors: colorList.length > 0 ? colorList : undefined,
      },
      featured: formData.featured,
      specs: editingProduct ? editingProduct.specs : { Warranty: '1 Year', Quality: 'Authentic' },
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      addToast(language === 'ar' ? 'تم تحديث بيانات المنتج بنجاح!' : 'Product updated successfully!', 'success');
    } else {
      addProduct(payload);
      addToast(language === 'ar' ? 'تمت إضافة المنتج الجديد للكتالوج!' : 'New product created successfully!', 'success');
    }

    setIsAddModalOpen(false);
  };

  const handleStockStepper = (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta);
    updateProduct(productId, { stock: newStock });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(language === 'ar' ? `هل أنت متأكد من حذف المنتج (${name})؟` : `Are you sure you want to delete ${name}?`)) {
      deleteProduct(id);
      addToast(language === 'ar' ? 'تم حذف المنتج من المتجر' : 'Product deleted', 'info');
    }
  };

  const handleDuplicateProduct = (p: Product) => {
    const duplicated: Omit<Product, 'id' | 'createdAt'> = {
      name: `${p.name} (Copy)`,
      nameAr: p.nameAr ? `${p.nameAr} (نسخة)` : `${p.name} (نسخة)`,
      tagline: p.tagline,
      taglineAr: p.taglineAr,
      description: p.description,
      descriptionAr: p.descriptionAr,
      category: p.category,
      price: p.price,
      originalPrice: p.originalPrice,
      stock: p.stock,
      badge: p.badge,
      rating: p.rating,
      reviewCount: 0,
      images: [...p.images],
      tags: [...(p.tags || [])],
      featured: false,
      specs: p.specs ? { ...p.specs } : { Warranty: '1 Year', Quality: 'Authentic' },
    };
    addProduct(duplicated);
    addToast(language === 'ar' ? 'تم نسخ المنتج بنجاح!' : 'Product duplicated successfully!', 'success');
  };

  const handleToggleFeatured = (p: Product) => {
    const newFeatured = !p.featured;
    updateProduct(p.id, { featured: newFeatured });
    addToast(
      language === 'ar'
        ? (newFeatured ? 'تم تمييز المنتج في واجهة المتجر' : 'تم إلغاء تمييز المنتج')
        : (newFeatured ? 'Marked as featured' : 'Unmarked from featured'),
      'success'
    );
  };

  const totalUnitsInStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalCatalogValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const lowStockProductsCount = products.filter(p => p.stock <= 10).length;

  const handleExportCSV = () => {
    if (products.length === 0) {
      addToast(language === 'ar' ? 'لا توجد منتجات لتصديرها' : 'No products to export', 'info');
      return;
    }

    const headers = ['ID', 'Name (EN)', 'Name (AR)', 'Category', 'Price', 'Original Price', 'Stock', 'Badge', 'Rating'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name}"`,
      `"${p.nameAr || ''}"`,
      `"${p.category}"`,
      p.price.toFixed(2),
      (p.originalPrice || 0).toFixed(2),
      p.stock,
      `"${p.badge || ''}"`,
      p.rating
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `products-${activeStore.slug}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(language === 'ar' ? 'تم تصدير كتالوج المنتجات (CSV) بنجاح!' : 'Products exported to CSV successfully!', 'success');
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          addToast(
            language === 'ar' ? 'ملف CSV لا يحتوي على أي صفوف بيانات' : 'CSV file contains no product rows',
            'warning'
          );
          return;
        }

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, '').toLowerCase());

        let importedCount = 0;
        for (let i = 1; i < lines.length; i++) {
          const rawLine = lines[i];
          const values: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let c = 0; c < rawLine.length; c++) {
            const char = rawLine[c];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          if (values.length === 0 || !values.some((v) => v.length > 0)) continue;

          const getVal = (possibleHeaders: string[]): string => {
            for (const ph of possibleHeaders) {
              const idx = headers.findIndex((h) => h.includes(ph));
              if (idx !== -1 && values[idx] !== undefined) {
                return values[idx].replace(/^["']|["']$/g, '').trim();
              }
            }
            return '';
          };

          const name = getVal(['name (en)', 'name', 'اسم']) || `Product ${products.length + importedCount + 1}`;
          const nameAr = getVal(['name (ar)', 'arabic', 'عربي']) || name;
          const categoryRaw = getVal(['category', 'تصنيف']) || 'Audio & Sound';
          const price = parseFloat(getVal(['price', 'سعر'])) || 99;
          const origPriceRaw = parseFloat(getVal(['original', 'before', 'خصم']));
          const originalPrice = !isNaN(origPriceRaw) && origPriceRaw > price ? origPriceRaw : undefined;
          const stock = parseInt(getVal(['stock', 'مخزون', 'كمية'])) || 20;
          const badgeRaw = getVal(['badge', 'شارة']);
          const badge = badgeRaw && badgeRaw.trim() ? (badgeRaw.trim() as any) : undefined;
          const tagsStr = getVal(['tags', 'وسوم']) || 'catalog, item';
          const sizesStr = getVal(['sizes', 'مقاسات', 'size']);
          const colorsStr = getVal(['colors', 'ألوان', 'color']);
          const imageUrl = getVal(['image', 'صورة', 'url']) || imagePresets[0].url;

          const validCat = categories.find((c) => c.toLowerCase() === categoryRaw.toLowerCase()) || 'Audio & Sound';

          addProduct({
            name,
            nameAr,
            tagline: name,
            taglineAr: nameAr,
            description: `${name} — Premium quality product.`,
            descriptionAr: `${nameAr} — منتج فاخر عالي الجودة بتصميم استثنائي.`,
            category: validCat,
            price,
            originalPrice,
            stock,
            badge,
            rating: 5.0,
            reviewCount: 1,
            images: [imageUrl],
            tags: tagsStr.split(/[,;]/).map((t) => t.trim()).filter(Boolean),
            variants: {
              sizes: sizesStr ? sizesStr.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : undefined,
              colors: colorsStr ? colorsStr.split(/[,;]/).map((c) => c.trim()).filter(Boolean) : undefined,
            },
            featured: false,
            specs: { Quality: 'Authentic', Warranty: '1 Year' },
          });

          importedCount++;
        }

        if (fileInputRef.current) fileInputRef.current.value = '';
        addToast(
          language === 'ar' ? `تم استيراد ${importedCount} منتج بنجاح إلى الكتالوج!` : `Imported ${importedCount} products successfully!`,
          'success'
        );
      } catch (err: any) {
        console.error('Import CSV error:', err);
        addToast(language === 'ar' ? 'فشل استيراد ملف CSV' : 'Failed to import CSV file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Hidden file input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv,text/csv"
        onChange={handleImportCSV}
        className="hidden"
      />

      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'ar' ? 'كتالوج المنتجات والمخزون' : t.products} ({products.length})
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'ar' ? 'إضافة وتعديل المنتجات، نسخ العناصر، استيراد/تصدير CSV وضبط المخزون' : 'Add, duplicate, and manage catalog items, inventory and pricing'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all"
            title={language === 'ar' ? 'استيراد منتجات من ملف CSV' : 'Import products from CSV'}
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'ar' ? 'استيراد CSV' : 'Import CSV'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-2xs transition-all"
            title={language === 'ar' ? 'تصدير الكتالوج إلى CSV' : 'Export products'}
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'ar' ? 'تصدير CSV' : 'Export'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Catalog Quick Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'إجمالي الأصناف' : 'Total Items'}</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{products.length}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'الوحدات المتوفرة بالمخزون' : 'Units in Stock'}</span>
          <span className="text-lg font-black text-emerald-700 mt-0.5 block">{totalUnitsInStock}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'القيمة التقديرية للمخزون' : 'Total Inventory Value'}</span>
          <span className="text-lg font-black text-slate-900 mt-0.5 block">{currency}{totalCatalogValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-400 block">{language === 'ar' ? 'تنبيهات انخفاض المخزون' : 'Low Stock Items'}</span>
          <span className={`text-lg font-black mt-0.5 block ${lowStockProductsCount > 0 ? 'text-amber-600' : 'text-slate-900'}`}>{lowStockProductsCount}</span>
        </div>
      </div>

      {/* Stock Level Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setStockFilter('All')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            stockFilter === 'All'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'جميع المنتجات' : 'All Products'} ({products.length})
        </button>

        <button
          onClick={() => setStockFilter('inStock')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            stockFilter === 'inStock'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'متوفر بالمخزون' : 'In Stock'} ({products.filter(p => p.stock > 10).length})
        </button>

        <button
          onClick={() => setStockFilter('lowStock')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            stockFilter === 'lowStock'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'منخفض المخزون (≤10)' : 'Low Stock'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-[10px]">
            {products.filter(p => p.stock > 0 && p.stock <= 10).length}
          </span>
        </button>

        <button
          onClick={() => setStockFilter('outOfStock')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            stockFilter === 'outOfStock'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-white text-rose-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'نفد من المخزون' : 'Out of Stock'} ({products.filter(p => p.stock === 0).length})
        </button>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={language === 'ar' ? 'البحث بالاسم العربي، الإنجليزي، الوسوم، أو القسم...' : 'Search products by name, tag, category...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs ${
              language === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'
            }`}
          />
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${
            language === 'ar' ? 'right-3' : 'left-3'
          }`} />
        </div>

        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="All">{language === 'ar' ? 'جميع الأقسام' : 'All Categories'}</option>
          {categories.map((c) => (
            <option key={c} value={c}>{getCategoryName(c)}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{language === 'ar' ? 'تفاصيل المنتج' : t.item}</th>
                <th className="py-3.5 px-4">{t.category}</th>
                <th className="py-3.5 px-4">{t.price}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'المخزون' : t.stock}</th>
                <th className="py-3.5 px-4">{language === 'ar' ? 'الشارة' : 'Badge'}</th>
                <th className="py-3.5 px-4 text-end">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>{language === 'ar' ? 'لا توجد منتجات مطابقة للبحث' : 'No products found.'}</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const pName = getProductName(p);
                  const isLow = p.stock <= 10;
                  const discountPercent = p.originalPrice && p.originalPrice > p.price
                    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
                    : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=100&q=80'}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm truncate">
                              {pName}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate">
                              {p.tagline}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] whitespace-nowrap">
                          {getCategoryName(p.category)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-black text-slate-900 text-xs sm:text-sm">
                            {currency}{p.price.toFixed(2)}
                          </span>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <span className="text-[11px] text-slate-400 line-through">
                              {currency}{p.originalPrice.toFixed(2)}
                            </span>
                          )}
                          {discountPercent > 0 && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1 rounded">
                              -{discountPercent}%
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {/* Interactive Stock Stepper */}
                        <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                          <button
                            onClick={() => handleStockStepper(p.id, p.stock, -1)}
                            className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-700 hover:bg-slate-200 font-bold text-xs shadow-2xs"
                            title="-1"
                          >
                            -
                          </button>

                          <span className={`px-2 font-mono font-bold text-xs min-w-[28px] text-center ${
                            p.stock === 0 ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                          }`}>
                            {p.stock}
                          </span>

                          <button
                            onClick={() => handleStockStepper(p.id, p.stock, 1)}
                            className="w-5 h-5 flex items-center justify-center bg-white rounded text-slate-700 hover:bg-slate-200 font-bold text-xs shadow-2xs"
                            title="+1"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {p.badge ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
                            {p.badge}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-end">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              p.featured
                                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                                : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50/50'
                            }`}
                            title={p.featured ? (language === 'ar' ? 'مميز في الواجهة' : 'Featured') : (language === 'ar' ? 'تمييز في الواجهة' : 'Mark as featured')}
                          >
                            <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-400' : ''}`} />
                          </button>

                          <button
                            onClick={() => handleDuplicateProduct(p)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title={language === 'ar' ? 'استنساخ المنتج' : 'Duplicate product'}
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title={t.editProduct}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(p.id, pName)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t.deleteProduct}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div 
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">
                {editingProduct ? (language === 'ar' ? 'تعديل بيانات المنتج' : 'Edit Product') : (language === 'ar' ? 'إضافة منتج جديد للكتالوج' : 'Add New Product')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Product Names (AR & EN) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم المنتج بالعربية *' : 'Product Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="rtl"
                    placeholder="مثال: سماعة رأس لاسلكية احترافية"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم المنتج بالإنجليزية *' : 'Product Name (English) *'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    placeholder="e.g. Studio Pro Wireless Headphones"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              {/* Taglines */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'وصف تسويقي قصير (عربي)' : 'Short Tagline (Arabic)'}
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="عزل ضوضاء فائق وبطارية تدوم 40 ساعة"
                    value={formData.taglineAr}
                    onChange={(e) => setFormData({ ...formData, taglineAr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'وصف تسويقي قصير (إنجليزي)' : 'Short Tagline (English)'}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Active noise cancelling with 40h battery"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Category & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {t.category}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{getCategoryName(c)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      {language === 'ar' ? 'شارة المنتج' : 'Badge'}
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({language === 'ar' ? 'اختياري' : 'Optional'})
                    </span>
                  </div>
                  <select
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="">{language === 'ar' ? 'بدون شارة (افتراضي)' : 'No Badge (None)'}</option>
                    <option value="New Arrival">{language === 'ar' ? 'جديد (New Arrival)' : 'New Arrival'}</option>
                    <option value="Best Seller">{language === 'ar' ? 'الأكثر مبيعاً (Best Seller)' : 'Best Seller'}</option>
                    <option value="Hot Sale">{language === 'ar' ? 'عرض خاص (Hot Sale)' : 'Hot Sale'}</option>
                    <option value="Limited Stock">{language === 'ar' ? 'كمية محدودة (Limited Stock)' : 'Limited Stock'}</option>
                  </select>
                </div>
              </div>

              {/* Price, Original Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? `سعر البيع (${currency}) *` : `Price (${currency}) *`}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700 block">
                      {language === 'ar' ? `السعر قبل الخصم (${currency})` : `Original Price (${currency})`}
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      ({language === 'ar' ? 'اختياري' : 'Optional'})
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={language === 'ar' ? 'فارغ إذا لم يوجد خصم' : 'Leave empty if no discount'}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value === '' ? '' : Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-600"
                  />
                  {formData.originalPrice !== '' && Number(formData.originalPrice) > Number(formData.price) && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-1">
                      {language === 'ar'
                        ? `خصم بنسبة ${Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}%`
                        : `${Math.round(((Number(formData.originalPrice) - Number(formData.price)) / Number(formData.originalPrice)) * 100)}% Discount`}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'كمية المخزون' : t.stock} *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Direct Cloud Hosting Product Photos Uploader */}
              <ProductMediaUploader
                images={formData.images}
                onChange={(newImages) => setFormData({ ...formData, images: newImages })}
              />

              {/* Product Variants (Sizes & Colors) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المقاسات المتاحة (مفصولة بفواصل)' : 'Available Sizes (comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="S, M, L, XL, XXL"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {language === 'ar' ? 'اتركها فارغة إذا لم تكن هناك مقاسات' : 'Leave empty if no sizes apply'}
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الألوان المتاحة (مفصولة بفواصل)' : 'Available Colors (comma separated)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Black, Silver, Gold, Navy"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {language === 'ar' ? 'اتركها فارغة إذا لم تكن هناك ألوان' : 'Leave empty if no colors apply'}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'وسوم البحث (مفصولة بفواصل)' : 'Tags (comma separated)'}
                </label>
                <input
                  type="text"
                  placeholder="wireless, premium, bluetooth"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Descriptions */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'الوصف الكامل للمنتج (عربي)' : 'Full Description (Arabic)'}
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  placeholder="اكتب مواصفات وتفاصيل المنتج للعملاء..."
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Modal Buttons */}
              <div className="p-4 border-t border-slate-200 flex justify-end gap-2 -mx-6 -mb-6 bg-slate-50 rounded-b-3xl">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                >
                  {editingProduct ? (language === 'ar' ? 'حفظ التعديلات' : 'Save Changes') : (language === 'ar' ? 'إضافة المنتج' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
