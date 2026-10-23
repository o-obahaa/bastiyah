import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCheck,
  Clock,
  Edit3,
  Save,
  RotateCcw,
  Sparkles,
  Filter,
  Search,
  Copy,
  ExternalLink,
  Store,
  User,
  Phone,
  ShoppingBag,
  Check,
  AlertCircle,
  Trash2,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  HelpCircle,
  Eye,
  X,
  FileText,
  Radio,
  Zap,
  Truck
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import {
  WhatsAppTemplate,
  WhatsAppActivity,
  getStoredWhatsAppTemplates,
  saveStoredWhatsAppTemplate,
  resetStoredWhatsAppTemplate,
  getStoredWhatsAppActivities,
  logWhatsAppActivity,
} from '../../utils/whatsappPlatformUtils';

export const OwnerWhatsAppManager: React.FC = () => {
  const { stores, language, addToast } = useStore();

  // Sub-tabs: 'templates' vs 'activities'
  const [subTab, setSubTab] = useState<'templates' | 'activities'>('templates');

  // Templates State
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>(() => getStoredWhatsAppTemplates());
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('merchant_order_alert');
  const [activeContent, setActiveContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Activities State
  const [activities, setActivities] = useState<WhatsAppActivity[]>(() => getStoredWhatsAppActivities());
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'outbound' | 'inbound'>('all');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [selectedActivityForModal, setSelectedActivityForModal] = useState<WhatsAppActivity | null>(null);

  // New Message / Simulation Modal
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simDirection, setSimDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [simStoreSlug, setSimStoreSlug] = useState<string>(stores[0]?.slug || 'panda');
  const [simRecipientName, setSimRecipientName] = useState('');
  const [simPhone, setSimPhone] = useState('+964 770 123 4567');
  const [simCategory, setSimCategory] = useState('تنبيه تجريبي');
  const [simContent, setSimContent] = useState('');

  // Selected Template
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  useEffect(() => {
    if (activeTemplate) {
      setActiveContent(activeTemplate.content || activeTemplate.defaultContent);
      setHasUnsavedChanges(false);
    }
  }, [activeTemplate]);

  // Handle template selection
  const handleSelectTemplate = (id: string) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        language === 'ar'
          ? 'لديك تعديلات غير محفوظة على النموذج الحالي. هل تريد الانتقال دون حفظ؟'
          : 'You have unsaved changes. Switch without saving?'
      );
      if (!confirmLeave) return;
    }
    setSelectedTemplateId(id);
  };

  // Insert Variable into active content at cursor position
  const handleInsertVariable = (varKey: string) => {
    setActiveContent((prev) => `${prev} ${varKey}`);
    setHasUnsavedChanges(true);
  };

  // Save active template
  const handleSaveTemplate = () => {
    if (!activeTemplate) return;
    const updated = saveStoredWhatsAppTemplate(activeTemplate.id, activeContent);
    setTemplates(updated);
    setHasUnsavedChanges(false);
    addToast(
      language === 'ar'
        ? `✅ تم حفظ نموذج واتساب (${activeTemplate.nameAr}) بنجاح!`
        : `✅ WhatsApp template (${activeTemplate.nameEn}) saved successfully!`,
      'success'
    );
  };

  // Reset active template to default
  const handleResetTemplate = () => {
    if (!activeTemplate) return;
    const confirmReset = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من استعادة النص الافتراضي لهذا النموذج؟'
        : 'Are you sure you want to revert this template to default?'
    );
    if (!confirmReset) return;

    const updated = resetStoredWhatsAppTemplate(activeTemplate.id);
    setTemplates(updated);
    setActiveContent(activeTemplate.defaultContent);
    setHasUnsavedChanges(false);
    addToast(
      language === 'ar' ? 'تمت استعادة النص الافتراضي للنموذج بنجاح' : 'Template reverted to factory default',
      'info'
    );
  };

  // Format sample message preview with dummy data
  const sampleRenderedPreview = useMemo(() => {
    if (!activeTemplate) return '';
    let preview = activeContent || activeTemplate.defaultContent;
    activeTemplate.variables.forEach((v) => {
      preview = preview.split(v.key).join(v.sample);
    });
    return preview;
  }, [activeContent, activeTemplate]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Direction
      if (directionFilter !== 'all' && act.direction !== directionFilter) return false;
      // Store
      if (storeFilter !== 'all' && act.storeSlug !== storeFilter) return false;
      // Search
      if (activitySearchQuery.trim()) {
        const q = activitySearchQuery.toLowerCase();
        const matchesName = act.recipientName.toLowerCase().includes(q);
        const matchesPhone = act.recipientPhone.toLowerCase().includes(q);
        const matchesStore = act.storeName.toLowerCase().includes(q);
        const matchesContent = act.content.toLowerCase().includes(q);
        const matchesOrder = act.orderNumber?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesStore && !matchesContent && !matchesOrder) {
          return false;
        }
      }
      return true;
    });
  }, [activities, directionFilter, storeFilter, activitySearchQuery]);

  // Metrics
  const stats = useMemo(() => {
    const total = activities.length;
    const outbound = activities.filter((a) => a.direction === 'outbound').length;
    const inbound = activities.filter((a) => a.direction === 'inbound').length;
    return { total, outbound, inbound };
  }, [activities]);

  // Handle Dispatching New Activity / Simulation
  const handleDispatchSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simContent.trim() || !simPhone.trim()) {
      addToast(language === 'ar' ? 'يرجى كتابة نص الرسالة ورقم الهاتف' : 'Please provide message and phone', 'error');
      return;
    }

    const matchedStore = stores.find((s) => s.slug === simStoreSlug) || stores[0];

    const newAct = logWhatsAppActivity({
      direction: simDirection,
      storeId: matchedStore?.id || 'store-1',
      storeName: matchedStore?.nameAr || matchedStore?.name || 'متجر باندا',
      storeSlug: matchedStore?.slug || 'panda',
      recipientName: simRecipientName.trim() || (simDirection === 'outbound' ? 'عميل المتجر' : 'زبون المتجر'),
      recipientPhone: simPhone.trim(),
      categoryLabelAr: simCategory.trim() || (simDirection === 'outbound' ? 'إشعار صادر' : 'رسالة واردة'),
      categoryLabelEn: simDirection === 'outbound' ? 'Outbound Notification' : 'Inbound Message',
      content: simContent.trim(),
      status: simDirection === 'outbound' ? 'sent' : 'received',
    });

    setActivities(getStoredWhatsAppActivities());
    setShowSimulateModal(false);
    setSimContent('');
    setSimRecipientName('');
    addToast(
      language === 'ar'
        ? `✅ تم تسجيل الرسالة ${simDirection === 'outbound' ? 'الصادرة' : 'الواردة'} بنجاح في سجل الأنشطة!`
        : `✅ Message logged successfully into activity stream!`,
      'success'
    );
  };

  // Open Direct WhatsApp Web
  const handleOpenWhatsAppChat = (phone: string, text?: string) => {
    const clean = phone.replace(/\D/g, '');
    const url = `https://wa.me/${clean}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {language === 'ar' ? 'مركز رسائل وقوالب واتساب' : 'WhatsApp Engine & Live Inbox'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{language === 'ar' ? 'الخادم متصل' : 'Gateway Online'}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {language === 'ar'
                  ? 'إدارة وتعديل النماذج الافتراضية للرسائل التلقائية ومتابعة الرسائل الصادرة والواردة لجميع المتاجر لحظة بلحظة'
                  : 'Manage default notification forms and inspect real-time outbound & inbound WhatsApp communications'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setActivities(getStoredWhatsAppActivities());
              addToast(language === 'ar' ? 'تم تحديث سجل الأنشطة' : 'Activity log refreshed', 'info');
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title={language === 'ar' ? 'تحديث السجل' : 'Refresh Feed'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تحديث' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'إرسال / تسجيل رسالة جديدة' : 'Dispatch / Log Message'}</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">
              {language === 'ar' ? 'إجمالي الرسائل بالسجل' : 'Total Activity Log'}
            </span>
            <span className="text-xl font-black text-slate-900 font-mono mt-0.5 block">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">
              {language === 'ar' ? 'الرسائل الصادرة (إشعارات)' : 'Sent / Outbound'}
            </span>
            <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{stats.outbound}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">
              {language === 'ar' ? 'الرسائل الواردة (ردود وأوامر)' : 'Received / Inbound'}
            </span>
            <span className="text-xl font-black text-purple-700 font-mono mt-0.5 block">{stats.inbound}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shrink-0">
            <CheckCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 block">
              {language === 'ar' ? 'نسبة تسليم الرسائل' : 'Delivery Success Rate'}
            </span>
            <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">99.4%</span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            subTab === 'templates'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <FileText className={`w-4 h-4 ${subTab === 'templates' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{language === 'ar' ? 'النماذج الافتراضية والقوالب (6)' : 'Default Forms & Templates (6)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('activities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            subTab === 'activities'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Inbox className={`w-4 h-4 ${subTab === 'activities' ? 'text-amber-400' : 'text-slate-400'}`} />
          <span>{language === 'ar' ? 'سجل الأنشطة والرسائل (الصادرة والواردة)' : 'Live Activities (Sent & Received)'}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-slate-100 text-slate-700">
            {activities.length}
          </span>
        </button>
      </div>

      {/* =========================================================================
          VIEW 1: DEFAULT FORMS & TEMPLATES (EDITABLE)
          ========================================================================= */}
      {subTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Templates List */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                {language === 'ar' ? 'اختر النموذج لمعاينته وتعديله:' : 'Select Template to Edit:'}
              </span>

              <div className="space-y-2">
                {templates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => handleSelectTemplate(tpl.id)}
                      className={`w-full p-3.5 rounded-xl border text-start transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {language === 'ar' ? tpl.nameAr : tpl.nameEn}
                        </span>
                        {tpl.isDefaultModified && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 shrink-0">
                            {language === 'ar' ? 'مُعدّل' : 'Modified'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            tpl.recipientType === 'merchant'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/60'
                              : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                          }`}
                        >
                          {tpl.recipientType === 'merchant'
                            ? (language === 'ar' ? '👤 لمدير المتجر' : 'To Merchant')
                            : (language === 'ar' ? '🛍️ للزبون / المشتري' : 'To Customer')}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        {language === 'ar' ? tpl.triggerAr : tpl.triggerEn}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Template Editor & Live Preview */}
          <div className="lg:col-span-8 space-y-6">
            {activeTemplate && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
                {/* Editor Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {language === 'ar' ? activeTemplate.nameAr : activeTemplate.nameEn}
                      </h3>
                      {activeTemplate.isDefaultModified && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          {language === 'ar' ? 'محتوى مخصص ومعدل' : 'Custom Modified Content'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'ar' ? activeTemplate.triggerAr : activeTemplate.triggerEn}
                    </p>
                  </div>

                  {/* Template Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {activeTemplate.isDefaultModified && (
                      <button
                        type="button"
                        onClick={handleResetTemplate}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
                        title={language === 'ar' ? 'استعادة النص الافتراضي للمنصة' : 'Reset to default'}
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                        <span>{language === 'ar' ? 'استعادة الافتراضي' : 'Reset'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveTemplate}
                      disabled={!hasUnsavedChanges}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{language === 'ar' ? 'حفظ التعديلات' : 'Save Template'}</span>
                    </button>
                  </div>
                </div>

                {/* Dynamic Variables Badge Legend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{language === 'ar' ? 'المتغيرات الذكية المتاحة (انقر لإدراج المتغير):' : 'Available Variables (Click to Insert):'}</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      {language === 'ar' ? 'تُستبدل تلقائياً ببيانات الطلب الفعلية' : 'Replaced with live order data'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                    {activeTemplate.variables.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => handleInsertVariable(v.key)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-mono transition-all cursor-pointer shadow-2xs group"
                        title={`${language === 'ar' ? v.labelAr : v.labelEn} (مثال: ${v.sample})`}
                      >
                        <span className="font-bold text-emerald-600">{v.key}</span>
                        <span className="text-[10px] text-slate-400 group-hover:text-emerald-700">
                          ({language === 'ar' ? v.labelAr : v.labelEn})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Text Area */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <label htmlFor="template-editor" className="flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'ar' ? 'محتوى النموذج القابل للتعديل:' : 'Editable Template Content:'}</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-400">
                      {activeContent.length} {language === 'ar' ? 'حرف' : 'chars'}
                    </span>
                  </div>

                  <textarea
                    id="template-editor"
                    rows={12}
                    dir="rtl"
                    value={activeContent}
                    onChange={(e) => {
                      setActiveContent(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono text-xs sm:text-sm text-slate-800 leading-relaxed transition-all resize-y"
                    placeholder="اكتب قالب الرسالة هنا..."
                  />

                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>💡 {language === 'ar' ? 'تنسيقات واتساب المدعومة:' : 'Supported WhatsApp formats:'}</span>
                    <span className="font-mono bg-slate-100 px-1 rounded">*نص عريض*</span>
                    <span className="font-mono bg-slate-100 px-1 rounded">_نص مائل_</span>
                    <span className="font-mono bg-slate-100 px-1 rounded">~مشطوب~</span>
                    <span className="font-mono bg-slate-100 px-1 rounded">`كود`</span>
                  </p>
                </div>

                {/* WhatsApp Phone Mockup Live Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'ar' ? 'معاينة شكل الرسالة الفعلي في واتساب:' : 'Actual WhatsApp Live Chat Preview:'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {language === 'ar' ? 'بيانات حقيقية تجريبية' : 'Sample Live Render'}
                    </span>
                  </div>

                  {/* Chat Mockup Window */}
                  <div className="rounded-2xl border border-slate-200 bg-[#EFEAE2] p-4 sm:p-5 shadow-inner space-y-3">
                    {/* Mock Chat Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-black/10 text-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                          B
                        </div>
                        <div>
                          <span className="text-xs font-bold block text-slate-900 leading-tight">
                            بسطية | Bastiyah Bot
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block">متصل الآن • WhatsApp Business</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">اليوم</span>
                    </div>

                    {/* WhatsApp Chat Bubble */}
                    <div className="flex justify-start">
                      <div className="max-w-[92%] sm:max-w-[85%] bg-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm border border-slate-200/60 space-y-2 select-text">
                        <div className="text-xs sm:text-sm text-slate-900 whitespace-pre-wrap leading-relaxed font-sans" dir="rtl">
                          {sampleRenderedPreview}
                        </div>
                        <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono pt-1">
                          <span>10:35 ص</span>
                          <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: LIVE ACTIVITIES FEED (SENT & RECEIVED MESSAGES)
          ========================================================================= */}
      {subTab === 'activities' && (
        <div className="space-y-4">
          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={activitySearchQuery}
                onChange={(e) => setActivitySearchQuery(e.target.value)}
                placeholder={
                  language === 'ar'
                    ? 'بحث بالاسم، رقم الهاتف، رقم الطلب، أو نص الرسالة...'
                    : 'Search by recipient, phone, order #, or message content...'
                }
                className="w-full ps-10 pe-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Direction Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDirectionFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    directionFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'ar' ? 'الكل' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setDirectionFilter('outbound')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    directionFilter === 'outbound' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'ar' ? 'صادرة' : 'Sent'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirectionFilter('inbound')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                    directionFilter === 'inbound' ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-purple-600" />
                  <span>{language === 'ar' ? 'واردة' : 'Received'}</span>
                </button>
              </div>

              {/* Store Filter Dropdown */}
              <select
                value={storeFilter}
                onChange={(e) => setStoreFilter(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">{language === 'ar' ? 'جميع المتاجر' : 'All Stores'}</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.slug}>
                    {language === 'ar' ? s.nameAr || s.name : s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Activities List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? `الرسائل المسجلة (${filteredActivities.length})` : `Recorded Messages (${filteredActivities.length})`}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {language === 'ar' ? 'تحديث تلقائي مع كل طلب جديد' : 'Real-time sync on new orders'}
              </span>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-2">
                <MessageCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-700 text-sm">
                  {language === 'ar' ? 'لا توجد رسائل مطابقة لخيارات البحث' : 'No matching WhatsApp activities'}
                </h4>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'جرب تغيير فلاتر البحث أو اضغط على إرسال رسالة لتسجيل نشاط جديد' : 'Try adjusting filters or log a test message'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredActivities.map((act) => {
                  const isOutbound = act.direction === 'outbound';
                  return (
                    <div
                      key={act.id}
                      className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left Block: Direction Badge, Recipient & Store Info */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                            isOutbound ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {isOutbound ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-slate-900">
                              {act.recipientName}
                            </span>
                            <span className="text-xs font-mono font-medium text-slate-500 dir-ltr" dir="ltr">
                              {act.recipientPhone}
                            </span>

                            {/* Direction & Status Badge */}
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isOutbound
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                              }`}
                            >
                              {isOutbound ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-emerald-600" />
                                  <span>{language === 'ar' ? 'صادرة' : 'Outbound'}</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownLeft className="w-3 h-3 text-purple-600" />
                                  <span>{language === 'ar' ? 'واردة' : 'Inbound'}</span>
                                </>
                              )}
                            </span>

                            {/* Store Badge */}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                              {act.storeName}
                            </span>

                            {/* Category Tag */}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                              {language === 'ar' ? act.categoryLabelAr : act.categoryLabelEn}
                            </span>
                          </div>

                          {/* Message Body Snippet */}
                          <p
                            className="text-xs text-slate-600 font-sans line-clamp-2 leading-relaxed bg-slate-50/60 p-2 rounded-xl border border-slate-200/60"
                            dir="rtl"
                          >
                            {act.content}
                          </p>

                          {/* Time & Order # */}
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(act.timestamp).toLocaleTimeString('ar-IQ')}</span>
                              <span>•</span>
                              <span>{new Date(act.timestamp).toLocaleDateString('ar-IQ')}</span>
                            </span>

                            {act.orderNumber && (
                              <span className="font-mono font-semibold text-slate-600">
                                #{act.orderNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Action Buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedActivityForModal(act)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>{language === 'ar' ? 'عرض بالكامل' : 'Full View'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenWhatsAppChat(act.recipientPhone)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                          title="Open WhatsApp Web"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: FULL MESSAGE VIEW MODAL
          ========================================================================= */}
      {selectedActivityForModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedActivityForModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    selectedActivityForModal.direction === 'outbound' ? 'bg-emerald-50 text-emerald-600' : 'bg-purple-50 text-purple-600'
                  }`}
                >
                  {selectedActivityForModal.direction === 'outbound' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownLeft className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selectedActivityForModal.recipientName}</h4>
                  <span className="text-[11px] font-mono text-slate-500">{selectedActivityForModal.recipientPhone}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedActivityForModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#EFEAE2] p-4 text-slate-900 border border-slate-200 space-y-2">
              <div className="bg-white rounded-xl p-3.5 shadow-xs border border-slate-200/60 space-y-2">
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-sans" dir="rtl">
                  {selectedActivityForModal.content}
                </p>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono pt-1">
                  <span>{new Date(selectedActivityForModal.timestamp).toLocaleTimeString('ar-IQ')}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-sky-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-400">
                <span>المتجر: </span>
                <span className="font-bold text-slate-700">{selectedActivityForModal.storeName}</span>
              </div>

              <button
                type="button"
                onClick={() => handleOpenWhatsAppChat(selectedActivityForModal.recipientPhone)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'ar' ? 'متابعة في واتساب ويب' : 'Chat in WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: DISPATCH / SIMULATE NEW MESSAGE
          ========================================================================= */}
      {showSimulateModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowSimulateModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'تسجيل / إرسال رسالة واتساب' : 'Dispatch / Log WhatsApp Message'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowSimulateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDispatchSimulation} className="space-y-4">
              {/* Direction selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  {language === 'ar' ? 'اتجاه الرسالة:' : 'Message Direction:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimDirection('outbound')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      simDirection === 'outbound'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? '📤 صادرة (من المنصة/المتجر)' : 'Outbound (Sent)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSimDirection('inbound')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      simDirection === 'inbound'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>{language === 'ar' ? '📥 واردة (من التاجر/الزبون)' : 'Inbound (Received)'}</span>
                  </button>
                </div>
              </div>

              {/* Store & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'المتجر المرتبط:' : 'Related Store:'}
                  </label>
                  <select
                    value={simStoreSlug}
                    onChange={(e) => setSimStoreSlug(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-slate-900"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.slug}>
                        {language === 'ar' ? s.nameAr || s.name : s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نوع النشاط:' : 'Activity Category:'}
                  </label>
                  <input
                    type="text"
                    value={simCategory}
                    onChange={(e) => setSimCategory(e.target.value)}
                    placeholder="تنبيه طلب / أمر تحكم..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم الطرف الآخر:' : 'Contact Name:'}
                  </label>
                  <input
                    type="text"
                    required
                    value={simRecipientName}
                    onChange={(e) => setSimRecipientName(e.target.value)}
                    placeholder="مثال: طارق المنصور أو ليث العبيدي"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم الهاتف:' : 'Phone Number:'}
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    placeholder="+964 771 483 4776"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'نص الرسالة:' : 'Message Text:'}
                </label>
                <textarea
                  rows={4}
                  required
                  dir="rtl"
                  value={simContent}
                  onChange={(e) => setSimContent(e.target.value)}
                  placeholder="اكتب نص الرسالة التي تم إرسالها أو استلامها..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-slate-900 leading-relaxed font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'ar' ? 'تسجيل النشاط' : 'Log Activity'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
