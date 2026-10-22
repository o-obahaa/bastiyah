/**
 * Iraqi Shipping & Logistics Companies Configuration and Tracking Code Generator
 * Compatible with major delivery services operating across the 18 Iraqi Governorates.
 */

export interface IraqiCourierInfo {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  trackingFormat: string;
  trackingUrl?: (code: string) => string;
  badgeAr?: string;
  badgeEn?: string;
}

export const IRAQI_COURIERS: IraqiCourierInfo[] = [
  {
    id: 'wasel',
    name: 'Wasel Express Iraq',
    nameAr: 'واصل إكسبريس (Wasel Express)',
    code: 'WAS',
    trackingFormat: 'WAS-[GOV]-[SERIAL6]',
    trackingUrl: (code) => `https://waselexpress.com/track?code=${encodeURIComponent(code)}`,
    badgeAr: 'الأوسع انتشاراً في كافة المحافظات',
    badgeEn: 'All 18 Governorates Coverage',
  },
  {
    id: 'zajel',
    name: 'Al-Zajel Express Iraq',
    nameAr: 'الزاجل إكسبريس (Al-Zajel)',
    code: 'ZJL',
    trackingFormat: 'ZJL-[GOV]-[SERIAL6]',
    trackingUrl: (code) => `https://zajelexpress.com/track/${encodeURIComponent(code)}`,
    badgeAr: 'شحن سريع وموثوق بين المحافظات',
    badgeEn: 'Inter-Governorate Fast Freight',
  },
  {
    id: 'aramex',
    name: 'Aramex Iraq',
    nameAr: 'أرامكس العراق (Aramex)',
    code: 'ARX',
    trackingFormat: 'ARX-[GOV]-[SERIAL7]',
    trackingUrl: (code) => `https://www.aramex.com/track/results?shipmentNumber=${encodeURIComponent(code)}`,
    badgeAr: 'شبكة شحن محلية ودولية متكاملة',
    badgeEn: 'Domestic & International Network',
  },
  {
    id: 'mrsool',
    name: 'Mrsool Iraq',
    nameAr: 'مرسول العراق (Mrsool)',
    code: 'MRS',
    trackingFormat: 'MRS-[GOV]-[SERIAL6]',
    badgeAr: 'توصيل فوري وسريع داخل المدن',
    badgeEn: 'Same-day Intra-city Express',
  },
  {
    id: 'warkaa',
    name: 'Al-Warkaa Express',
    nameAr: 'الوركاء إكسبريس (Al-Warkaa)',
    code: 'WRK',
    trackingFormat: 'WRK-[GOV]-[SERIAL6]',
    badgeAr: 'شحن طرود المتاجر الإلكترونية',
    badgeEn: 'E-Commerce Parcel Logistics',
  },
  {
    id: 'buraq',
    name: 'Al-Buraq Express',
    nameAr: 'البراق للتوصيل السريع (Al-Buraq)',
    code: 'BRQ',
    trackingFormat: 'BRQ-[GOV]-[SERIAL6]',
    badgeAr: 'توصيل شحنات وطرود المحافظات',
    badgeEn: 'Governorate Parcel Service',
  },
  {
    id: 'iraqi-post',
    name: 'Iraqi Post (ITPC)',
    nameAr: 'البريد العراقي (Iraqi Post - ITPC)',
    code: 'ITP',
    trackingFormat: 'IQ[9DIGITS]IQ',
    trackingUrl: (code) => `https://post.iq/track?id=${encodeURIComponent(code)}`,
    badgeAr: 'الرمز البريدي الرسمي للدولة',
    badgeEn: 'Official Postal Code Format',
  },
  {
    id: 'dhl',
    name: 'DHL Express Iraq',
    nameAr: 'دي إتش إل العراق (DHL Express)',
    code: 'DHL',
    trackingFormat: 'DHL-IQ-[SERIAL7]',
    trackingUrl: (code) => `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(code)}`,
    badgeAr: 'توصيل فائق السرعة',
    badgeEn: 'Premium Express Delivery',
  },
  {
    id: 'local',
    name: 'Direct Store Courier',
    nameAr: 'مندوب المتجر المباشر (توصيل فوري)',
    code: 'LOC',
    trackingFormat: 'IQ-[GOV]-LOC-[SERIAL5]',
    badgeAr: 'تنسيق مباشر مع مندوب المتجر',
    badgeEn: 'Direct Doorstep Courier',
  },
];

/**
 * Maps governorate names to their official standard 2-letter Iraqi postal code.
 */
export const getGovCode = (govName?: string): string => {
  if (!govName) return 'BG';
  const name = govName.toLowerCase();
  if (name.includes('بصر') || name.includes('basra')) return 'BA';
  if (name.includes('أربيل') || name.includes('اربيل') || name.includes('erbil')) return 'ER';
  if (name.includes('نجف') || name.includes('najaf')) return 'NA';
  if (name.includes('كربلاء') || name.includes('karbala')) return 'KA';
  if (name.includes('نينوى') || name.includes('موصل') || name.includes('nineveh') || name.includes('mosul')) return 'NI';
  if (name.includes('كركوك') || name.includes('kirkuk')) return 'KI';
  if (name.includes('سليمان') || name.includes('sulaymaniyah')) return 'SU';
  if (name.includes('دهوك') || name.includes('duhok')) return 'DA';
  if (name.includes('بابل') || name.includes('حلة') || name.includes('babylon') || name.includes('hillah')) return 'BB';
  if (name.includes('أنبار') || name.includes('انبار') || name.includes('رمادي') || name.includes('anbar')) return 'AN';
  if (name.includes('ديالى') || name.includes('diyala')) return 'DI';
  if (name.includes('قار') || name.includes('ناصرية') || name.includes('dhi qar')) return 'DQ';
  if (name.includes('ميسان') || name.includes('عمارة') || name.includes('maysan')) return 'MA';
  if (name.includes('مثنى') || name.includes('سماوة') || name.includes('muthanna')) return 'MU';
  if (name.includes('قادسية') || name.includes('ديوانية') || name.includes('qadisiyyah')) return 'QA';
  if (name.includes('واسط') || name.includes('كوت') || name.includes('wasit')) return 'WA';
  if (name.includes('صلاح الدين') || name.includes('تكريت') || name.includes('سامراء') || name.includes('saladin')) return 'SD';
  return 'BG'; // Baghdad is the default
};

/**
 * Generate a realistic tracking code compatible with logistics companies operating in Iraq.
 */
export const generateIraqiTrackingNumber = (courierNameOrId?: string, govName?: string): string => {
  const gov = getGovCode(govName);
  const s5 = Math.floor(10000 + Math.random() * 90000);
  const s6 = Math.floor(100000 + Math.random() * 900000);
  const s7 = Math.floor(1000000 + Math.random() * 9000000);
  const s9 = Math.floor(100000000 + Math.random() * 900000000);

  const key = (courierNameOrId || 'wasel').toLowerCase();

  if (key.includes('wasel') || key.includes('واصل') || key === 'was') {
    return `WAS-${gov}-${s6}`;
  }
  if (key.includes('zajel') || key.includes('زاجل') || key === 'zjl') {
    return `ZJL-${gov}-${s6}`;
  }
  if (key.includes('aramex') || key.includes('أرامكس') || key.includes('ارامكس') || key === 'arx') {
    return `ARX-${gov}-${s7}`;
  }
  if (key.includes('mrsool') || key.includes('مرسول') || key === 'mrs') {
    return `MRS-${gov}-${s6}`;
  }
  if (key.includes('post') || key.includes('بريد') || key === 'itp') {
    return `IQ${s9}IQ`;
  }
  if (key.includes('warkaa') || key.includes('وركاء') || key === 'wrk') {
    return `WRK-${gov}-${s6}`;
  }
  if (key.includes('buraq') || key.includes('براق') || key === 'brq') {
    return `BRQ-${gov}-${s6}`;
  }
  if (key.includes('dhl')) {
    return `DHL-IQ-${s7}`;
  }
  if (key.includes('local') || key.includes('مندوب') || key.includes('توصيل') || key === 'loc') {
    return `IQ-${gov}-LOC-${s5}`;
  }

  // Universal Iraqi Domestic Tracking Code
  return `WAS-${gov}-${s6}`;
};

/**
 * Lookup courier details from name or ID
 */
export const findIraqiCourier = (nameOrId?: string): IraqiCourierInfo | undefined => {
  if (!nameOrId) return undefined;
  const n = nameOrId.toLowerCase();
  return IRAQI_COURIERS.find(c => 
    c.id === n || 
    c.code.toLowerCase() === n || 
    c.name.toLowerCase().includes(n) || 
    c.nameAr.toLowerCase().includes(n) ||
    n.includes(c.id) ||
    n.includes(c.code.toLowerCase())
  );
};

/**
 * Returns tracking URL if supported by the company
 */
export const getIraqiTrackingUrl = (trackingNumber: string, courierNameOrId?: string): string | null => {
  const courier = findIraqiCourier(courierNameOrId || trackingNumber);
  if (courier && courier.trackingUrl) {
    return courier.trackingUrl(trackingNumber);
  }
  // If starts with WAS
  if (trackingNumber.startsWith('WAS-')) {
    return `https://waselexpress.com/track?code=${encodeURIComponent(trackingNumber)}`;
  }
  // If starts with ZJL
  if (trackingNumber.startsWith('ZJL-')) {
    return `https://zajelexpress.com/track/${encodeURIComponent(trackingNumber)}`;
  }
  // If starts with ARX
  if (trackingNumber.startsWith('ARX-')) {
    return `https://www.aramex.com/track/results?shipmentNumber=${encodeURIComponent(trackingNumber)}`;
  }
  // If starts with IQ...IQ
  if (trackingNumber.startsWith('IQ') && trackingNumber.endsWith('IQ')) {
    return `https://post.iq/track?id=${encodeURIComponent(trackingNumber)}`;
  }
  return null;
};
