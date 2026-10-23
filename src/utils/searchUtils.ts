import { Product, ProductCategory } from '../types';
import { translations, PRODUCT_ARABIC_TRANSLATIONS } from '../i18n/translations';

/**
 * Normalizes Arabic and English text for resilient, typo-tolerant search matching.
 * - Strips all Arabic diacritics / tashkeel & tatweel
 * - Normalizes Alifs: [أ إ آ ٱ] -> ا
 * - Normalizes Taa Marbuta & Haa: [ة] -> ه
 * - Normalizes Yaa / Alif Maqsura: [ي ى ئ] -> ي
 * - Normalizes Waw with Hamza: [ؤ] -> و
 * - Strips standalone Hamza [ء]
 * - Strips punctuation, quotes, symbols into spaces
 * - Lowercases English text
 */
export const normalizeSearchText = (text?: string | null): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    // Remove Arabic diacritics / tashkeel (fatha, damma, kasra, sukun, tanween, shadda, dagger alif)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Remove Tatweel / Kashida
    .replace(/\u0640/g, '')
    // Normalize Alifs
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta to Haa
    .replace(/[ة]/g, 'ه')
    // Normalize Yaa / Alif Maqsura / Hamza on Nabrah
    .replace(/[يىئ]/g, 'ي')
    // Normalize Waw with Hamza
    .replace(/[ؤ]/g, 'و')
    // Strip standalone Hamza
    .replace(/[ء]/g, '')
    // Normalize punctuation and symbols to spaces (retaining arabic & english letters and numbers)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    // Collapse consecutive whitespaces
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Strip Arabic definite article "ال" (Al-) if the word has sufficient root length.
 * e.g., "السماعة" -> "سماعة", "الشاحن" -> "شاحن", "الساعات" -> "ساعات"
 */
export const stripArabicAl = (token: string): string => {
  if (token.startsWith('ال') && token.length >= 4) {
    return token.slice(2);
  }
  return token;
};

/**
 * Common English plural/singular stemming.
 * e.g., "headphones" -> "headphone", "watches" -> "watch", "chargers" -> "charger"
 */
export const stripEnglishPlural = (token: string): string => {
  if (token.endsWith('ies') && token.length > 4) {
    return token.slice(0, -3) + 'y';
  }
  if (token.endsWith('es') && token.length > 4) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && token.length > 3 && !token.endsWith('ss')) {
    return token.slice(0, -1);
  }
  return token;
};

/**
 * Bilingual & cross-language synonym mappings.
 * Allows searching in Arabic to find English products, and searching in English to find Arabic products.
 */
const SYNONYM_GROUPS: string[][] = [
  // Audio
  ['audio', 'sound', 'headphone', 'headphones', 'earphone', 'earphones', 'earbud', 'earbuds', 'airpod', 'airpods', 'سماعة', 'سماعات', 'سماعه', 'صوتيات', 'صوت'],
  // Watches & Wearables
  ['watch', 'watches', 'smartwatch', 'smartwatches', 'wearable', 'wearables', 'band', 'ساعة', 'ساعات', 'ساعه', 'ذكية', 'ملبوسات'],
  // Phones & Tablets
  ['phone', 'phones', 'mobile', 'smartphone', 'iphone', 'ipad', 'هاتف', 'هواتف', 'جوال', 'جوالات', 'موبايل', 'ايفون', 'ايباد', 'تلفون'],
  // Computers
  ['computer', 'pc', 'laptop', 'macbook', 'كمبيوتر', 'حاسوب', 'لابتوب', 'ماكبوك'],
  // Charging & Power
  ['charger', 'chargers', 'charging', 'fast charge', 'powerbank', 'power bank', 'battery', 'شاحن', 'شواحن', 'شحن', 'سريع', 'باوربانك', 'باور بانك', 'بطارية'],
  // Cables
  ['cable', 'cables', 'wire', 'cord', 'type-c', 'lightning', 'كيبل', 'كيابل', 'كابل', 'سلك', 'اسلاك'],
  // Cases & Protection
  ['case', 'cases', 'cover', 'covers', 'protector', 'جراب', 'كفر', 'كفرات', 'غطاء', 'حافظة', 'حماية'],
  // Screens & Displays
  ['screen', 'display', 'monitor', 'شاشة', 'شاشه'],
  // Mouse & Keyboard
  ['mouse', 'keyboard', 'ماوس', 'فارة', 'كيبورد', 'لوحة مفاتيح'],
  // Camera
  ['camera', 'cam', 'كاميرا', 'كاميره', 'تصوير'],
  // Wireless / Bluetooth
  ['wireless', 'bluetooth', 'wifi', 'وايرلس', 'بلوتوث', 'لاسلكي', 'لاسلكية'],
  // Brands
  ['apple', 'ابل', 'أبل'],
  ['samsung', 'galaxy', 'سامسونج', 'جالكسي'],
  ['sony', 'سوني'],
  ['xiaomi', 'redmi', 'شاومي', 'ريدمي'],
  ['anker', 'انكر'],
  ['huawei', 'هواوي'],
  // Models / Specs
  ['pro', 'برو'],
  ['max', 'ماكس'],
  ['ultra', 'الترا'],
  ['mini', 'ميني'],
  ['plus', 'بلس'],
  // Lifestyle / Accessories
  ['perfume', 'perfumes', 'fragrance', 'oud', 'عطر', 'عطور', 'عود', 'بخور'],
  ['bag', 'backpack', 'wallet', 'حقيبة', 'شنطة', 'محفظة'],
  ['stand', 'holder', 'mount', 'حامل', 'ستاند', 'قاعدة'],
  ['gaming', 'gamer', 'games', 'العاب', 'ألعاب', 'جيمنج', 'قيمنق', 'قيمينج']
];

/**
 * Pre-compiled map from normalized synonym token to set of related tokens.
 */
const SYNONYM_MAP: Map<string, Set<string>> = new Map();
SYNONYM_GROUPS.forEach((group) => {
  const normalizedGroup = group.map((t) => normalizeSearchText(t));
  normalizedGroup.forEach((term) => {
    if (!term) return;
    if (!SYNONYM_MAP.has(term)) {
      SYNONYM_MAP.set(term, new Set());
    }
    normalizedGroup.forEach((other) => {
      if (other && other !== term) {
        SYNONYM_MAP.get(term)!.add(other);
      }
    });
  });
});

/**
 * Generate all variations of a single search token (original, stripped Al-, singular, synonyms).
 */
export const getTokenVariants = (rawToken: string): string[] => {
  const token = normalizeSearchText(rawToken);
  if (!token) return [];

  const variants = new Set<string>();
  variants.add(token);

  // Arabic "ال" prefix stripping
  const withoutAl = stripArabicAl(token);
  if (withoutAl !== token) {
    variants.add(withoutAl);
  }

  // English plural stripping
  const singular = stripEnglishPlural(token);
  if (singular !== token) {
    variants.add(singular);
  }

  // Arabic feminine/plural suffix variants (e.g. سماعات -> سماعه)
  if (token.endsWith('ات') && token.length > 4) {
    variants.add(token.slice(0, -2) + 'ه');
    variants.add(token.slice(0, -2));
  }

  // Lookup synonyms & transliterations
  const checkKeys = [token, withoutAl, singular];
  checkKeys.forEach((key) => {
    const syns = SYNONYM_MAP.get(key);
    if (syns) {
      syns.forEach((s) => variants.add(s));
    }
  });

  return Array.from(variants);
};

/**
 * Arabic category names map for bilingual matching.
 */
export const CATEGORY_NAMES_AR: Record<ProductCategory, string> = {
  'All': translations.ar.catAll,
  'Audio & Sound': translations.ar.catAudio,
  'Wearables & Tech': translations.ar.catWearables,
  'Workspace & Setup': translations.ar.catWorkspace,
  'Lifestyle & Travel': translations.ar.catLifestyle,
  'Smart Home': translations.ar.catSmartHome,
  'Perfumes & Oud': translations.ar.catPerfumes,
  'Fashion & Luxury': translations.ar.catFashion,
};

/**
 * Build rich multi-lingual search corpus for a product.
 * Includes English & Arabic titles, taglines, category, tags, specs, and full descriptions.
 */
export const buildProductCorpus = (product: Product): {
  primary: string;
  secondary: string;
  description: string;
  full: string;
} => {
  const arTranslation = PRODUCT_ARABIC_TRANSLATIONS[product.id];
  const catAr = CATEGORY_NAMES_AR[product.category] || '';

  // Primary text: names, category, tags, SKU/code
  const names = [
    product.name,
    product.nameAr,
    arTranslation?.name,
    product.category,
    catAr,
    ...(product.tags || []),
    product.sku,
    product.itemCode,
  ].filter(Boolean).join(' ');

  // Secondary text: taglines and specifications
  const specsValues = product.specs ? Object.entries(product.specs).map(([k, v]) => `${k} ${v}`).join(' ') : '';
  const secondary = [
    product.tagline,
    product.taglineAr,
    arTranslation?.tagline,
    specsValues,
  ].filter(Boolean).join(' ');

  // Full product description (both Arabic and English)
  const description = [
    product.description,
    product.descriptionAr,
    arTranslation?.description,
  ].filter(Boolean).join(' ');

  const primaryNorm = normalizeSearchText(names);
  const secondaryNorm = normalizeSearchText(secondary);
  const descNorm = normalizeSearchText(description);

  return {
    primary: primaryNorm,
    secondary: secondaryNorm,
    description: descNorm,
    full: `${primaryNorm} ${secondaryNorm} ${descNorm}`,
  };
};

export interface ProductSearchResult {
  product: Product;
  matches: boolean;
  score: number;
}

/**
 * Multi-lingual, typo-resilient product search matcher.
 * Matches across English & Arabic titles, taglines, tags, categories, specs, AND descriptions.
 * Returns match status and relevance score.
 */
export const matchProductSearch = (product: Product, searchQuery: string): ProductSearchResult => {
  const cleanQuery = searchQuery.trim();
  if (!cleanQuery) {
    return { product, matches: true, score: 0 };
  }

  const normalizedQuery = normalizeSearchText(cleanQuery);
  if (!normalizedQuery) {
    return { product, matches: false, score: 0 };
  }

  const corpus = buildProductCorpus(product);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);

  if (queryTokens.length === 0) {
    return { product, matches: true, score: 0 };
  }

  // Exact full query match bonus
  let score = 0;
  if (corpus.primary.includes(normalizedQuery)) {
    score += 150;
  } else if (corpus.secondary.includes(normalizedQuery)) {
    score += 80;
  } else if (corpus.description.includes(normalizedQuery)) {
    score += 50;
  }

  // Check that every token in the query matches at least one variant in the product corpus
  let matchedTokens = 0;

  for (const token of queryTokens) {
    const variants = getTokenVariants(token);
    let tokenMatched = false;

    for (const variant of variants) {
      if (corpus.primary.includes(variant)) {
        score += 35;
        tokenMatched = true;
        break;
      } else if (corpus.secondary.includes(variant)) {
        score += 20;
        tokenMatched = true;
        break;
      } else if (corpus.description.includes(variant)) {
        score += 10;
        tokenMatched = true;
        break;
      }
    }

    if (tokenMatched) {
      matchedTokens++;
    }
  }

  // All tokens must match (or for multi-word queries of 3+ words, at least 80% of tokens match)
  const isMatch = queryTokens.length <= 2 
    ? matchedTokens === queryTokens.length 
    : matchedTokens >= Math.ceil(queryTokens.length * 0.75);

  // Bonus for featured or in-stock products
  if (isMatch) {
    if (product.stock > 0) score += 5;
    if (product.featured) score += 5;
  }

  return {
    product,
    matches: isMatch,
    score: isMatch ? score : 0,
  };
};

/**
 * Filter and rank products by search query.
 */
export const filterProductsBySearch = (products: Product[], searchQuery: string): Product[] => {
  if (!searchQuery || !searchQuery.trim()) {
    return products;
  }

  const results: ProductSearchResult[] = [];

  for (const product of products) {
    const res = matchProductSearch(product, searchQuery);
    if (res.matches) {
      results.push(res);
    }
  }

  // Sort by search relevance score descending
  results.sort((a, b) => b.score - a.score);

  return results.map((r) => r.product);
};

/**
 * Matches category against query in either English, Arabic, or transliteration.
 */
export const matchCategorySearch = (category: ProductCategory, searchQuery: string): boolean => {
  const cleanQuery = searchQuery.trim();
  if (!cleanQuery) return false;

  const normalizedQuery = normalizeSearchText(cleanQuery);
  const catEn = normalizeSearchText(category);
  const catAr = normalizeSearchText(CATEGORY_NAMES_AR[category] || '');
  const catCombined = `${catEn} ${catAr}`;

  if (catCombined.includes(normalizedQuery)) {
    return true;
  }

  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => {
    const variants = getTokenVariants(token);
    return variants.some((v) => catCombined.includes(v));
  });
};
