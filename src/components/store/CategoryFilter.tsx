import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCategory } from '../../types';
import { 
  Headphones, 
  Watch, 
  Laptop, 
  Luggage, 
  Home, 
  Grid2X2,
  SlidersHorizontal,
  Sparkles,
  Crown,
  X
} from 'lucide-react';

interface CategoryFilterProps {
  sortBy: string;
  setSortBy: (val: string) => void;
  resultCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  sortBy,
  setSortBy,
  resultCount,
}) => {
  const { 
    products,
    theme,
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery, 
    t, 
    getCategoryName 
  } = useStore();

  const iconMap: Record<ProductCategory, React.ReactNode> = {
    'All': <Grid2X2 className="w-4 h-4" />,
    'Audio & Sound': <Headphones className="w-4 h-4" />,
    'Wearables & Tech': <Watch className="w-4 h-4" />,
    'Workspace & Setup': <Laptop className="w-4 h-4" />,
    'Lifestyle & Travel': <Luggage className="w-4 h-4" />,
    'Smart Home': <Home className="w-4 h-4" />,
    'Perfumes & Oud': <Sparkles className="w-4 h-4" />,
    'Fashion & Luxury': <Crown className="w-4 h-4" />,
  };

  // Show 'All' + categories present in this store's products
  const presentCategories = Array.from(new Set(products.map((p) => p.category)));
  const categoryList: ProductCategory[] = ['All', ...presentCategories];

  return (
    <div className="space-y-4">
      {/* Category horizontal scrolling bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full sm:w-auto">
          {categoryList.map((catLabel) => {
            const isActive = selectedCategory === catLabel;
            return (
              <button
                key={catLabel}
                onClick={() => setSelectedCategory(catLabel)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
                style={isActive ? { backgroundColor: theme.hex } : undefined}
              >
                {iconMap[catLabel] || <Grid2X2 className="w-4 h-4" />}
                <span>{getCategoryName(catLabel)}</span>
              </button>
            );
          })}
        </div>

        {/* Sort & Count Controls */}
        <div className="flex items-center gap-3 ms-auto">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            {t.showingItems} <strong className="text-slate-800">{resultCount}</strong> {t.items}
          </span>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="featured">{t.sortFeatured}</option>
              <option value="price-low">{t.sortPriceLow}</option>
              <option value="price-high">{t.sortPriceHigh}</option>
              <option value="rating">{t.sortRating}</option>
              <option value="newest">{t.sortNewest}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Search query alert pill if active */}
      {searchQuery && (
        <div className="flex items-center gap-2 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800">
          <span>{t.searchResultsFor} <strong>"{searchQuery}"</strong></span>
          <button
            onClick={() => setSearchQuery('')}
            className="ms-auto text-slate-700 hover:text-slate-950 p-1 flex items-center gap-1 font-semibold"
          >
            {t.clear} <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
