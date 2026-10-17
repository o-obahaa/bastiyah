import React, { useRef } from 'react';
import { X, Download, Printer, Copy, Check, QrCode, ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getStoreDisplayUrl, getStorePathLabel } from '../../utils/urlUtils';

interface StoreQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreQrCodeModal: React.FC<StoreQrCodeModalProps> = ({ isOpen, onClose }) => {
  const { activeStore, language, addToast } = useStore();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const storeUrl = getStoreDisplayUrl(activeStore.slug, false);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(storeUrl)}&margin=12`;
  const storeName = language === 'ar' ? activeStore.nameAr || activeStore.name : activeStore.name;
  const storeTagline = language === 'ar' ? activeStore.taglineAr || activeStore.tagline : activeStore.tagline;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    addToast(language === 'ar' ? 'تم نسخ الرابط بنجاح!' : 'Store link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qr-code-${activeStore.slug}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      addToast(language === 'ar' ? 'تم تحميل رمز QR بنجاح!' : 'QR code downloaded!', 'success');
    } catch {
      window.open(qrImageUrl, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'رمز الاستجابة السريعة (QR Code)' : 'Store QR Code'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'ar' ? 'امسح الرمز لزيارة المتجر مباشرة' : 'Scan to open your store instantly'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable / Scan Card Body */}
        <div className="p-6 text-center space-y-4 print:p-8">
          <div className="p-6 bg-gradient-to-b from-slate-50 to-white rounded-2xl border-2 border-slate-200/90 shadow-xs space-y-4 inline-block w-full max-w-xs mx-auto">
            {/* Store branding */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-3xl">{activeStore.design.logoEmoji || '🛍️'}</span>
              <h4 className="font-black text-slate-900 text-base">{storeName}</h4>
              <p className="text-xs text-slate-500 line-clamp-1">{storeTagline}</p>
            </div>

            {/* QR Image */}
            <div className="aspect-square bg-white p-3 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center mx-auto max-w-[220px]">
              <img
                src={qrImageUrl}
                alt={`QR code for ${activeStore.name}`}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
              />
            </div>

            {/* Store display link */}
            <div className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200 break-all">
              {getStorePathLabel(activeStore.slug, false)}
            </div>

            <p className="text-[10px] text-slate-400">
              {language === 'ar' ? 'مدعوم بواسطة منصة بسطية | Bastiyah' : 'Powered by Bastiyah Platform'}
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2 print:hidden">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'تحميل' : 'Download'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (language === 'ar' ? 'تم!' : 'Copied!') : (language === 'ar' ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
