import { StoreThemeColor } from '../types';

export interface ThemeClasses {
  bg: string;
  bgHover: string;
  bgSoft: string;
  text: string;
  textDark: string;
  border: string;
  borderHover: string;
  ring: string;
  shadow: string;
  gradientText: string;
  heroGlow: string;
  hex: string;
  name: string;
  nameAr: string;
  labelEn: string;
  labelAr: string;
}

export const THEME_CONFIGS: Record<StoreThemeColor, ThemeClasses> = {
  emerald: {
    bg: 'bg-emerald-600',
    bgHover: 'hover:bg-emerald-700',
    bgSoft: 'bg-emerald-50',
    text: 'text-emerald-600',
    textDark: 'text-emerald-800',
    border: 'border-emerald-200',
    borderHover: 'hover:border-emerald-300',
    ring: 'focus:ring-emerald-500',
    shadow: 'shadow-emerald-600/25',
    gradientText: 'from-emerald-400 via-teal-300 to-sky-200',
    heroGlow: 'bg-emerald-500/20',
    hex: '#059669',
    name: 'Emerald Forest',
    nameAr: 'زمردي عصري',
    labelEn: 'Emerald Forest',
    labelAr: 'زمردي عصري',
  },
  indigo: {
    bg: 'bg-indigo-600',
    bgHover: 'hover:bg-indigo-700',
    bgSoft: 'bg-indigo-50',
    text: 'text-indigo-600',
    textDark: 'text-indigo-800',
    border: 'border-indigo-200',
    borderHover: 'hover:border-indigo-300',
    ring: 'focus:ring-indigo-500',
    shadow: 'shadow-indigo-600/25',
    gradientText: 'from-indigo-400 via-sky-300 to-violet-200',
    heroGlow: 'bg-indigo-500/20',
    hex: '#4f46e5',
    name: 'Royal Indigo',
    nameAr: 'نيلي ملكي',
    labelEn: 'Royal Indigo',
    labelAr: 'نيلي ملكي',
  },
  amber: {
    bg: 'bg-amber-600',
    bgHover: 'hover:bg-amber-700',
    bgSoft: 'bg-amber-50',
    text: 'text-amber-600',
    textDark: 'text-amber-800',
    border: 'border-amber-200',
    borderHover: 'hover:border-amber-300',
    ring: 'focus:ring-amber-500',
    shadow: 'shadow-amber-600/25',
    gradientText: 'from-amber-300 via-yellow-200 to-orange-300',
    heroGlow: 'bg-amber-500/20',
    hex: '#d97706',
    name: 'Luxury Gold & Amber',
    nameAr: 'ذهبي وعنبري فاخر',
    labelEn: 'Luxury Gold & Amber',
    labelAr: 'ذهبي وعنبري فاخر',
  },
  rose: {
    bg: 'bg-rose-600',
    bgHover: 'hover:bg-rose-700',
    bgSoft: 'bg-rose-50',
    text: 'text-rose-600',
    textDark: 'text-rose-800',
    border: 'border-rose-200',
    borderHover: 'hover:border-rose-300',
    ring: 'focus:ring-rose-500',
    shadow: 'shadow-rose-600/25',
    gradientText: 'from-rose-400 via-pink-300 to-orange-200',
    heroGlow: 'bg-rose-500/20',
    hex: '#e11d48',
    name: 'Velvet Rose Boutique',
    nameAr: 'وردي مخملي',
    labelEn: 'Velvet Rose Boutique',
    labelAr: 'وردي مخملي',
  },
  cyan: {
    bg: 'bg-cyan-600',
    bgHover: 'hover:bg-cyan-700',
    bgSoft: 'bg-cyan-50',
    text: 'text-cyan-600',
    textDark: 'text-cyan-800',
    border: 'border-cyan-200',
    borderHover: 'hover:border-cyan-300',
    ring: 'focus:ring-cyan-500',
    shadow: 'shadow-cyan-600/25',
    gradientText: 'from-cyan-400 via-sky-300 to-teal-200',
    heroGlow: 'bg-cyan-500/20',
    hex: '#0891b2',
    name: 'Oceanic Cyan',
    nameAr: 'سماوي محيطي',
    labelEn: 'Oceanic Cyan',
    labelAr: 'سماوي محيطي',
  },
  violet: {
    bg: 'bg-violet-600',
    bgHover: 'hover:bg-violet-700',
    bgSoft: 'bg-violet-50',
    text: 'text-violet-600',
    textDark: 'text-violet-800',
    border: 'border-violet-200',
    borderHover: 'hover:border-violet-300',
    ring: 'focus:ring-violet-500',
    shadow: 'shadow-violet-600/25',
    gradientText: 'from-violet-400 via-fuchsia-300 to-indigo-200',
    heroGlow: 'bg-violet-500/20',
    hex: '#7c3aed',
    name: 'Cyber Violet',
    nameAr: 'بنفسجي مستقبلي',
    labelEn: 'Cyber Violet',
    labelAr: 'بنفسجي مستقبلي',
  },
};

export const getThemeClasses = (color: StoreThemeColor = 'emerald'): ThemeClasses => {
  return THEME_CONFIGS[color] || THEME_CONFIGS.emerald;
};
