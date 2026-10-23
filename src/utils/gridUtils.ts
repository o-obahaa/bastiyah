import { StoreDesign, ProductCardSize } from '../types';

export interface GridPresetOption {
  id: ProductCardSize;
  titleEn: string;
  titleAr: string;
  badgeEn: string;
  badgeAr: string;
  descEn: string;
  descAr: string;
  desktopCols: 2 | 3 | 4 | 5 | 6;
  mobileCols: 1 | 2;
  iconName: string;
}

export const PRODUCT_GRID_PRESETS: GridPresetOption[] = [
  {
    id: 'compact',
    titleEn: 'Compact / High-Density Grid',
    titleAr: 'مدمج ومكثف (عدد أكبر بالصف)',
    badgeEn: '5-6 Cards / Row',
    badgeAr: '5 إلى 6 منتجات بالصف',
    descEn: 'Fits more products on screen with streamlined cards. Ideal for stores with large inventories and deep catalogs.',
    descAr: 'يعرض عدداً أكبر من المنتجات في الشاشة الواحدة ببطاقات مدمجة. ممتاز للمتاجر ذات الكتالوجات الواسعة ومتعددة الأقسام.',
    desktopCols: 5,
    mobileCols: 2,
    iconName: 'LayoutGrid',
  },
  {
    id: 'standard',
    titleEn: 'Standard Balanced Grid',
    titleAr: 'القياسي المتوازن (الأكثر شعبية)',
    badgeEn: '4 Cards / Row',
    badgeAr: '4 منتجات بالصف (قياسي)',
    descEn: 'Default global e-commerce standard. Perfect balance between thumbnail visibility, legible typography, and item density.',
    descAr: 'التنسيق التجاري القياسي المعتمد عالمياً، يحقق توازناً مثالياً بين وضوح صور المنتجات ومقروئية الأسعار وتفاصيل البطاقة.',
    desktopCols: 4,
    mobileCols: 2,
    iconName: 'Grid',
  },
  {
    id: 'large',
    titleEn: 'Large / Prominent Grid',
    titleAr: 'كبير وبارز (تفاصيل أوضح)',
    badgeEn: '3 Cards / Row',
    badgeAr: '3 منتجات بالصف',
    descEn: 'Generous product cards with big imagery and spacious descriptions. Best for fashion, shoes, gadgets & perfumery.',
    descAr: 'بطاقات عريضة بصور فوتوغرافية كبيرة وتفاصيل موسعة. الخيار الأمثل لمتاجر الأزياء، الأحذية، العطور والمنتجات الفاخرة.',
    desktopCols: 3,
    mobileCols: 2,
    iconName: 'Maximize2',
  },
  {
    id: 'spacious',
    titleEn: 'Extra-Large Editorial Showcase',
    titleAr: 'عريض وفخم (معرض استعراضي)',
    badgeEn: '2 Cards / Row',
    badgeAr: 'منتجان فقط بالصف',
    descEn: 'Magazine-grade editorial presentation with grand hero thumbnails. Ideal for high-end boutique brands and luxury art.',
    descAr: 'طابع المجلات التحريرية العالمية بأكبر حجم للبطاقات لعرض فخم للمقتنيات الثمينة والمعارض والمصممين المستقلين.',
    desktopCols: 2,
    mobileCols: 1,
    iconName: 'Columns2',
  },
];

/**
 * Computes responsive Tailwind grid class string based on the store's design settings.
 */
export function getProductGridClasses(design?: StoreDesign | null): string {
  const size: ProductCardSize = design?.productCardSize || 'standard';
  const customDesktop = design?.desktopGridCols;
  const customMobile = design?.mobileGridCols;

  // If store manager explicitly set custom desktop/mobile column counts:
  if (customDesktop || customMobile) {
    const mobCol = customMobile === 1 ? 'grid-cols-1' : 'grid-cols-2';
    
    let deskCol = 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6';
    if (customDesktop === 6) {
      deskCol = 'sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4';
    } else if (customDesktop === 5) {
      deskCol = 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4.5';
    } else if (customDesktop === 3) {
      deskCol = 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8';
    } else if (customDesktop === 2) {
      deskCol = 'sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-8 max-w-5xl mx-auto';
    } else if (customDesktop === 4) {
      deskCol = 'sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6';
    }

    return `grid ${mobCol} ${deskCol}`;
  }

  // Pre-configured sizes
  switch (size) {
    case 'compact':
      return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4';
    case 'large':
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8';
    case 'spacious':
      return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-8 max-w-5xl mx-auto';
    case 'standard':
    default:
      return 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6';
  }
}
