import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, X, Globe, Cloud } from 'lucide-react';
import { uploadImageToR2, validateImageFile, CLOUDFLARE_R2_CONFIG } from '../../utils/cloudflareR2';
import { useStore } from '../../context/StoreContext';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  labelAr?: string;
  helperText?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Product Image',
  labelAr = 'صورة المنتج',
  helperText,
  aspectRatio = 'square',
  className = '',
}) => {
  const { language, activeStore, addToast } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [inputUrl, setInputUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isArabic = language === 'ar';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processUpload(e.target.files[0]);
    }
  };

  const processUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      addToast(validation.error || 'Invalid file', 'error');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(10);

      const result = await uploadImageToR2(file, {
        storeSlug: activeStore?.slug,
        onProgress: (p) => setUploadProgress(p),
      });

      onChange(result.url);
      setInputUrl(result.url);
      addToast(
        isArabic ? 'تم رفع الصورة بنجاح إلى سيرفر الصور (Cloudflare R2)' : 'Image successfully uploaded to Cloudflare R2!',
        'success'
      );
    } catch (err: any) {
      console.error('Upload failed:', err);
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onChange(inputUrl.trim());
      addToast(isArabic ? 'تم تحديث رابط الصورة' : 'Image URL updated', 'info');
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setInputUrl('');
  };

  const aspectClass = 
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'video' ? 'aspect-video' :
    aspectRatio === 'banner' ? 'aspect-[3/1]' : 'h-48';

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Cloud className="w-3.5 h-3.5 text-sky-500" />
          <span>{isArabic ? labelAr : label}</span>
        </label>

        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3 h-3 inline me-1" />
            {isArabic ? 'رفع ملف' : 'Upload'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-0.5 rounded-md transition-all ${
              activeTab === 'url'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3 h-3 inline me-1" />
            {isArabic ? 'رابط مباشر' : 'Link'}
          </button>
        </div>
      </div>

      {/* Main Upload / Preview Area */}
      {value ? (
        <div className="relative group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50">
          <div className={`w-full ${aspectClass} relative flex items-center justify-center bg-slate-900/5`}>
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Cloudflare Badge Overlay */}
          <div className="absolute top-2.5 start-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
            <Cloud className="w-3 h-3 text-sky-400" />
            <span>Cloudflare R2</span>
          </div>

          {/* Action Overlay */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-lg hover:bg-slate-100 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              {isArabic ? 'تغيير الصورة' : 'Change Image'}
            </button>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-lg transition-all"
              title={isArabic ? 'حذف الصورة' : 'Remove Image'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : activeTab === 'upload' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-sky-500 bg-sky-50/50 scale-[0.99]'
              : 'border-slate-200 hover:border-sky-400 hover:bg-slate-50/80 bg-white'
          }`}
        >
          {isUploading ? (
            <div className="py-4 space-y-3">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                {isArabic ? 'جاري رفع الصورة إلى Cloudflare R2...' : 'Uploading to Cloudflare R2...'}
              </div>
              <div className="w-48 mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800">
                {isArabic ? 'اسحب الصورة هنا أو اضغط للاختيار' : 'Click to upload or drag and drop'}
              </div>
              <p className="text-[11px] text-slate-400">
                PNG, JPG, WebP, SVG, AVIF (Max 10MB) • Hosted on Cloudflare R2
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://images.bastiyah.com/..."
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              {isArabic ? 'تطبيق' : 'Apply'}
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {helperText && (
        <p className="text-[11px] text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};
