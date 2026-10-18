import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Cloud, 
  X, 
  Star, 
  Loader2, 
  Plus, 
  Link as LinkIcon, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { uploadImageToR2, validateImageFile } from '../../utils/cloudflareR2';
import { useStore } from '../../context/StoreContext';

interface ProductMediaUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export const ProductMediaUploader: React.FC<ProductMediaUploaderProps> = ({
  images,
  onChange,
  maxImages = 8,
}) => {
  const { language, activeStore, addToast } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isArabic = language === 'ar';

  const imagePresets = [
    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Royal Oud', url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Couture Bag', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80' },
    { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80' },
    { label: 'Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80' },
    { label: 'Coffee Cup', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80' },
  ];

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      addToast(
        isArabic ? `وصلت للحد الأقصى المسموح من الصور (${maxImages})` : `Maximum ${maxImages} images allowed`,
        'warning'
      );
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setIsUploading(true);
    setUploadProgress(10);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      setCurrentUploadingFile(file.name);

      const validation = validateImageFile(file);
      if (!validation.valid) {
        addToast(`${file.name}: ${validation.error}`, 'error');
        continue;
      }

      try {
        const stepProgress = Math.round(((i + 1) / filesToUpload.length) * 90);
        setUploadProgress(stepProgress);

        const result = await uploadImageToR2(file, {
          storeSlug: activeStore?.slug,
          onProgress: (p) => setUploadProgress(Math.min(95, stepProgress + Math.round(p / 10))),
        });

        if (result.url) {
          uploadedUrls.push(result.url);
        }
      } catch (err: any) {
        console.error('File upload failed:', err);
        addToast(
          isArabic ? `فشل رفع الملف ${file.name}` : `Failed to upload ${file.name}`,
          'error'
        );
      }
    }

    if (uploadedUrls.length > 0) {
      onChange([...images, ...uploadedUrls]);
      addToast(
        isArabic
          ? `تم رفع ${uploadedUrls.length} صورة بنجاح إلى التخزين السحابي (Cloudflare R2)!`
          : `Successfully uploaded ${uploadedUrls.length} photo(s) to Cloudflare R2!`,
        'success'
      );
    }

    setIsUploading(false);
    setUploadProgress(0);
    setCurrentUploadingFile('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddDirectUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;

    if (images.length >= maxImages) {
      addToast(
        isArabic ? `الحد الأقصى للصور هو ${maxImages}` : `Maximum ${maxImages} images allowed`,
        'warning'
      );
      return;
    }

    onChange([...images, directUrl.trim()]);
    setDirectUrl('');
    setShowUrlInput(false);
    addToast(isArabic ? 'تمت إضافة رابط الصورة' : 'Image URL added', 'success');
  };

  const handleAddPreset = (url: string) => {
    if (images.includes(url)) {
      addToast(isArabic ? 'هذه الصورة مضافة مسبقاً' : 'This image is already added', 'info');
      return;
    }
    if (images.length >= maxImages) {
      addToast(
        isArabic ? `الحد الأقصى للصور هو ${maxImages}` : `Maximum ${maxImages} images allowed`,
        'warning'
      );
      return;
    }
    onChange([...images, url]);
    addToast(isArabic ? 'تمت إضافة الصورة التجريبية' : 'Preset image added', 'success');
  };

  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    onChange(newImages);
    addToast(isArabic ? 'تم تعيين الصورة كصورة رئيسية للمنتج' : 'Set as primary product photo', 'info');
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Header and Cloud Status */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="font-bold text-slate-900 block text-xs">
            {isArabic ? 'صور المنتج (رفع سحابي مباشر)' : 'Product Photos (Direct Cloud Hosting)'}
          </label>
          <span className="text-[11px] font-semibold text-slate-400">
            ({images.length}/{maxImages})
          </span>
        </div>

        {/* Cloudflare R2 Cloud Hosting Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-[10px] font-bold shadow-2xs">
          <Cloud className="w-3 h-3 text-sky-600 animate-pulse" />
          <span>{isArabic ? 'استضافة سحابية: Cloudflare R2 CDN' : 'Cloud Hosting: Cloudflare R2 CDN'}</span>
        </div>
      </div>

      {/* Main Drag & Drop Cloud Uploader Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-sky-500 bg-sky-50/60 scale-[0.99] ring-4 ring-sky-100'
            : 'border-slate-200 hover:border-sky-400 hover:bg-slate-50/80 bg-white shadow-2xs'
        }`}
      >
        {isUploading ? (
          <div className="py-4 space-y-3">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                {isArabic ? 'جاري رفع الصور إلى الاستضافة السحابية (Cloudflare R2)...' : 'Uploading photos to Cloudflare R2...'}
              </p>
              {currentUploadingFile && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-xs mx-auto">
                  {currentUploadingFile}
                </p>
              )}
            </div>
            <div className="w-56 mx-auto bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/80">
              <div
                className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500">{uploadProgress}%</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="w-11 h-11 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto shadow-xs border border-sky-100 group-hover:scale-105 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {isArabic
                  ? 'اضغط لاختيار الصور من جهازك أو اسحبها وأفلتها هنا'
                  : 'Click to select item photos from device or drag & drop here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isArabic
                  ? 'يدعم صور متعددة دفعة واحدة (JPG, PNG, WebP, SVG, AVIF حتى 10MB)'
                  : 'Supports multiple photos at once (JPG, PNG, WebP, SVG, AVIF up to 10MB)'}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-bold">
              <Cloud className="w-3 h-3 text-sky-600" />
              <span>{isArabic ? 'رفع مشفر وسريع ومباشر للسحابة' : 'Direct, secure cloud upload with zero egress fees'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Multi-file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Uploaded Photos Gallery Preview */}
      {images.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>{isArabic ? 'الصور المرفوعة للمنتج:' : 'Uploaded Product Photos:'}</span>
            <span className="text-[10px] text-slate-400">
              {isArabic ? 'الصورة الأولى هي المعروضة كواجهة للمنتج' : 'First photo is used as primary storefront image'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => {
              const isPrimary = idx === 0;
              return (
                <div
                  key={`${imgUrl}-${idx}`}
                  className={`group relative rounded-2xl overflow-hidden border-2 bg-slate-50 shadow-xs transition-all ${
                    isPrimary
                      ? 'border-emerald-600 ring-4 ring-emerald-100'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="aspect-square w-full overflow-hidden bg-slate-100 flex items-center justify-center">
                    <img
                      src={imgUrl}
                      alt={`Product photo ${idx + 1}`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Primary Badge */}
                  {isPrimary ? (
                    <div className="absolute top-2 start-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-white" />
                      <span>{isArabic ? 'الرئيسية' : 'Primary'}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="absolute top-2 start-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-0.5 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] font-bold shadow-md"
                    >
                      {isArabic ? 'تعيين كرئيسية' : 'Make Primary'}
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="absolute top-2 end-2 p-1.5 rounded-xl bg-rose-600 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-700 shadow-md transition-all"
                    title={isArabic ? 'حذف هذه الصورة' : 'Remove photo'}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  {/* Image Index */}
                  <div className="absolute bottom-1.5 end-2 px-1.5 py-0.5 rounded bg-slate-900/60 text-white text-[9px] font-mono font-bold">
                    #{idx + 1}
                  </div>
                </div>
              );
            })}

            {/* Quick add photo button in grid */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-sky-600 transition-all p-2"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[11px] font-bold">{isArabic ? 'إضافة صورة' : 'Add Photo'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alternative Options: Presets & Direct Link */}
      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {/* Toggle Direct Link input */}
        <div className="w-full sm:w-auto">
          {showUrlInput ? (
            <form onSubmit={handleAddDirectUrl} className="flex gap-2 w-full sm:w-80">
              <input
                type="url"
                placeholder="https://..."
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                {isArabic ? 'إضافة' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-slate-500 hover:text-slate-800 font-semibold inline-flex items-center gap-1"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{isArabic ? 'أو إضافة رابط صورة مباشر' : 'Or add via direct URL'}</span>
            </button>
          )}
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
            {isArabic ? 'صور مقترحة:' : 'Presets:'}
          </span>
          {imagePresets.slice(0, 4).map((preset, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => handleAddPreset(preset.url)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-semibold border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all whitespace-nowrap"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
