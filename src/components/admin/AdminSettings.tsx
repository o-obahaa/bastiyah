import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  Plus, 
  Tag, 
  Settings, 
  Save, 
  X, 
  Database, 
  Cloud, 
  Server, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  Banknote, 
  Phone, 
  Smartphone,
  Trash2,
  DollarSign,
  ShieldCheck,
  Check,
  Download,
  Bell,
  Volume2,
  VolumeX,
  Sparkles,
  MessageCircle,
  ExternalLink,
  Laptop,
  CheckCircle,
  Loader2,
  RefreshCw,
  QrCode,
  Radio,
  AlertCircle,
  FileText,
  Copy,
  Eye,
  Bot,
  RotateCcw,
  Edit3
} from 'lucide-react';
import { formatOrderWhatsAppMessage } from '../../utils/notificationUtils';
import { 
  WhatsAppTemplate, 
  getStoredWhatsAppTemplates, 
  renderWhatsAppTemplate,
  saveStoredWhatsAppTemplate,
  resetStoredWhatsAppTemplate,
  logWhatsAppActivity
} from '../../utils/whatsappPlatformUtils';
import { Order } from '../../types';

export const AdminSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    coupons, 
    addCoupon, 
    toggleCouponStatus, 
    deleteCoupon,
    updateHostedStore,
    t, 
    language,
    activeStore,
    isConvexConnected,
    isCloudflareConfigured,
    addToast,
    setAdminTab,
    updateNotificationSettings,
    playNotificationSound,
    requestBrowserNotifications,
    whatsappTemplates,
    updateWhatsAppTemplate,
    resetWhatsAppTemplate,
    syncWhatsAppTemplates
  } = useStore();

  const [formSettings, setFormSettings] = useState({
    storeName: settings.storeName,
    supportEmail: settings.supportEmail,
    currency: settings.currency || '$',
    freeShippingThreshold: settings.freeShippingThreshold,
    standardShippingFee: settings.standardShippingFee,
    taxRatePercent: (settings.taxRate * 100).toFixed(1),
    phoneNumber: settings.phoneNumber || '',
    bankDetails: settings.bankDetails || '',
  });

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState({
    cashOnDelivery: settings.paymentMethods?.cashOnDelivery ?? true,
    creditCard: settings.paymentMethods?.creditCard ?? false,
    bankTransfer: settings.paymentMethods?.bankTransfer ?? false,
    applePay: settings.paymentMethods?.applePay ?? false,
  });

  // Merchant login credentials & security
  const [ownerLoginPhone, setOwnerLoginPhone] = useState(activeStore.ownerPhone || '+964 770 123 4567');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // WhatsApp Gateway states
  const [isSendingWhatsAppTest, setIsSendingWhatsAppTest] = useState(false);
  const [isCheckingGateway, setIsCheckingGateway] = useState(false);
  const [isMessagePreviewOpen, setIsMessagePreviewOpen] = useState(false);
  const [hasCopiedMessage, setHasCopiedMessage] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<{
    connected: boolean;
    status: string;
    phone?: string | null;
    hasQr?: boolean;
  } | null>(null);

  const gatewayUrl = ((typeof import.meta !== 'undefined' && import.meta.env?.VITE_WHATSAPP_GATEWAY_URL) || 'https://bastiyah-whatsapp.onrender.com').trim();

  // Sample realistic order used for WhatsApp notification preview & test dispatch
  const storeTitle = activeStore.nameAr || activeStore.name;
  const storeCurrency = activeStore.settings.currency || 'د.ع';

  const previewSampleOrder: Order = {
    id: 'ord-preview-sample',
    orderNumber: `${activeStore.slug.toUpperCase().slice(0, 5)}-88240`,
    date: new Date().toISOString(),
    customer: {
      fullName: 'أحمد علي العبيدي',
      phone: '+964 771 000 0000',
      email: 'customer@example.iq',
      address: 'شارع 14 رمضان - مقابل مجمع النور التجاري',
      city: 'المنصور',
      state: 'بغداد',
      zipCode: '10001',
      country: 'Iraq'
    },
    items: [
      {
        productId: 'sample-p1',
        productName: activeStore.products[0]?.nameAr || activeStore.products[0]?.name || 'تيشيرت كاجوال قطني فاخر',
        productImage: activeStore.products[0]?.images?.[0] || '',
        price: activeStore.products[0]?.price || 25000,
        quantity: 2,
        selectedColor: 'أسود ملكي',
        selectedSize: 'L'
      },
      {
        productId: 'sample-p2',
        productName: activeStore.products[1]?.nameAr || activeStore.products[1]?.name || 'حذاء رياضي أنيق وخفيف',
        productImage: activeStore.products[1]?.images?.[0] || '',
        price: activeStore.products[1]?.price || 45000,
        quantity: 1,
        selectedColor: 'أبيض / رمادي',
        selectedSize: '42'
      }
    ],
    subtotal: ((activeStore.products[0]?.price || 25000) * 2) + (activeStore.products[1]?.price || 45000),
    discount: 5000,
    shipping: activeStore.settings.standardShippingFee || 5000,
    tax: 0,
    total: (((activeStore.products[0]?.price || 25000) * 2) + (activeStore.products[1]?.price || 45000) - 5000) + (activeStore.settings.standardShippingFee || 5000),
    status: 'processing',
    paymentMethod: 'Cash on Delivery',
    courier: 'واصل إكسبريس (Wasel Express)',
    trackingNumber: 'WAS-BG-88412',
    notes: 'يرجى الاتصال بالزبون قبل التوصيل'
  };

  // Live Platform WhatsApp Templates synchronized to this store (via StoreContext reactive state)
  const storeWhatsAppTemplates = whatsappTemplates;
  const [selectedStoreTemplateId, setSelectedStoreTemplateId] = useState<string>('merchant_order_alert');
  const [isEditingStoreTemplate, setIsEditingStoreTemplate] = useState<boolean>(false);
  const [storeTemplateContent, setStoreTemplateContent] = useState<string>('');

  const activeStoreTemplate = useMemo(() => {
    return storeWhatsAppTemplates.find((t) => t.id === selectedStoreTemplateId) || storeWhatsAppTemplates[0];
  }, [storeWhatsAppTemplates, selectedStoreTemplateId]);

  useEffect(() => {
    if (activeStoreTemplate) {
      setStoreTemplateContent(activeStoreTemplate.content || activeStoreTemplate.defaultContent);
    }
  }, [activeStoreTemplate, selectedStoreTemplateId]);

  const handleSaveStoreTemplate = () => {
    if (!activeStoreTemplate) return;
    updateWhatsAppTemplate(activeStoreTemplate.id, storeTemplateContent);
    setIsEditingStoreTemplate(false);
    addToast(
      language === 'ar'
        ? `✅ تم حفظ وتطبيق نموذج (${activeStoreTemplate.nameAr}) بنجاح!`
        : `✅ Template (${activeStoreTemplate.nameEn}) saved and applied!`,
      'success'
    );
  };

  const handleResetStoreTemplate = () => {
    if (!activeStoreTemplate) return;
    resetWhatsAppTemplate(activeStoreTemplate.id);
    setStoreTemplateContent(activeStoreTemplate.defaultContent);
    setIsEditingStoreTemplate(false);
    addToast(language === 'ar' ? 'تمت استعادة النص الافتراضي للنموذج بنجاح' : 'Reverted to default template', 'info');
  };

  const handleInsertStoreVariable = (key: string) => {
    setStoreTemplateContent((prev) => `${prev} ${key}`);
  };

  const activeStoreTemplatePreview = useMemo(() => {
    if (!activeStoreTemplate) return '';
    const rendered = renderWhatsAppTemplate(activeStoreTemplate.id, {
      storeName: storeTitle,
      orderNumber: previewSampleOrder.orderNumber,
      date: new Date().toLocaleString('ar-IQ'),
      customerName: previewSampleOrder.customer.fullName,
      customerPhone: previewSampleOrder.customer.phone,
      customerAddress: `${previewSampleOrder.customer.city} - ${previewSampleOrder.customer.address}`,
      itemsList: `1. ${activeStore.products[0]?.nameAr || activeStore.products[0]?.name || 'منتج بالمتجر'} (الكمية: 2)\n2. ${activeStore.products[1]?.nameAr || activeStore.products[1]?.name || 'منتج إضافي'} (الكمية: 1)`,
      subtotal: `${previewSampleOrder.subtotal.toLocaleString()}`,
      shipping: `${previewSampleOrder.shipping.toLocaleString()}`,
      total: `${previewSampleOrder.total.toLocaleString()}`,
      currency: storeCurrency,
      paymentMethod: 'الدفع نقداً عند الاستلام',
      courier: 'واصل إكسبريس (Wasel Express)',
      trackingNumber: 'WAS-BG-88412',
      orderUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/orders`,
      reviewUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${activeStore.slug}`,
      ownerName: activeStore.ownerName || 'مدير المتجر',
      storeUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${activeStore.slug}`,
      adminUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${activeStore.slug}/admin`,
      supportPhone: '+964 771 483 4776',
      couponCode: 'SAVE10',
      cartUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/${activeStore.slug}/cart`,
    });
    return rendered.content;
  }, [activeStoreTemplate, storeTitle, storeCurrency, previewSampleOrder, activeStore]);

  const sampleOrderMessage = formatOrderWhatsAppMessage(previewSampleOrder, storeTitle, storeCurrency);

  const handleCopyMessageForm = () => {
    navigator.clipboard.writeText(activeStoreTemplatePreview || sampleOrderMessage);
    setHasCopiedMessage(true);
    addToast(language === 'ar' ? 'تم نسخ نموذج رسالة الطلب بنجاح!' : 'Order message form copied!', 'success');
    setTimeout(() => setHasCopiedMessage(false), 2500);
  };

  const checkGatewayStatus = async () => {
    setIsCheckingGateway(true);
    try {
      const res = await fetch(`${gatewayUrl}/status`);
      if (res.ok) {
        const data = await res.json();
        setGatewayStatus(data);
      }
    } catch (err) {
      console.warn('Failed to fetch gateway status:', err);
    } finally {
      setIsCheckingGateway(false);
    }
  };

  useEffect(() => {
    checkGatewayStatus();
  }, []);

  const handleSendAutomaticWhatsAppTest = async () => {
    const targetPhone = activeStore.settings.notificationSettings?.whatsappAlertPhone || activeStore.ownerPhone || '9647714834776';
    let cleanPhone = targetPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    if (!cleanPhone.startsWith('964')) cleanPhone = `964${cleanPhone}`;

    if (!cleanPhone || cleanPhone.length < 9) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم هاتف واتساب صالح' : 'Please enter a valid WhatsApp phone number', 'error');
      return;
    }

    const messageToSend = activeStoreTemplatePreview || sampleOrderMessage;

    setIsSendingWhatsAppTest(true);
    try {
      let sentSuccess = false;

      // 1. Try sending full realistic order form via /send-message
      try {
        const res = await fetch(`${gatewayUrl}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            message: messageToSend
          })
        });

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.success) sentSuccess = true;
        }
      } catch (e) {
        // Fallback below
      }

      // 2. Fallback to /send-otp if /send-message route returns 404
      if (!sentSuccess) {
        try {
          const resOtp = await fetch(`${gatewayUrl}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phone: cleanPhone,
              code: `طلب جديد #${previewSampleOrder.orderNumber} بمبلغ ${storeCurrency}${previewSampleOrder.total.toLocaleString()} - العميل ${previewSampleOrder.customer.fullName} (${previewSampleOrder.customer.phone})`,
              storeName: storeTitle
            })
          });

          if (resOtp.ok) {
            const dataOtp = await resOtp.json().catch(() => ({}));
            if (dataOtp.success) sentSuccess = true;
          }
        } catch (e) {
          // Both failed
        }
      }

      // Automatically log to Owner WhatsApp Inbox in real-time
      try {
        logWhatsAppActivity({
          direction: 'outbound',
          storeId: activeStore.id,
          storeName: storeTitle,
          storeSlug: activeStore.slug,
          recipientName: activeStore.ownerName || 'مدير المتجر',
          recipientPhone: `+${cleanPhone}`,
          categoryLabelAr: activeStoreTemplate?.nameAr || 'فحص إشعار المتجر',
          categoryLabelEn: activeStoreTemplate?.nameEn || 'Store Alert Test',
          content: messageToSend,
          status: sentSuccess ? 'sent' : 'delivered',
          orderNumber: previewSampleOrder.orderNumber,
        });
      } catch (err) {
        console.warn('Could not log test activity:', err);
      }

      if (sentSuccess) {
        addToast(
          language === 'ar' 
            ? `✅ تم إرسال نموذج إشعار الطلب المحدث بنجاح إلى واتساب المدير (+${cleanPhone}) وتوثيقه في السجل!` 
            : `Updated order notification form sent to (+${cleanPhone}) via WhatsApp and logged!`, 
          'success'
        );
      } else {
        addToast(
          language === 'ar' ? '⚠️ خادم واتساب بانتظار مسح QR (تم تسجيل النموذج في السجل كإشعار تجريبي)' : 'WhatsApp gateway is waiting for QR scan (Logged in inbox)',
          'info'
        );
      }
    } catch (error) {
      // Log even in case of network issue
      try {
        logWhatsAppActivity({
          direction: 'outbound',
          storeId: activeStore.id,
          storeName: storeTitle,
          storeSlug: activeStore.slug,
          recipientName: activeStore.ownerName || 'مدير المتجر',
          recipientPhone: `+${cleanPhone}`,
          categoryLabelAr: activeStoreTemplate?.nameAr || 'فحص إشعار المتجر',
          categoryLabelEn: activeStoreTemplate?.nameEn || 'Store Alert Test',
          content: messageToSend,
          status: 'sent',
          orderNumber: previewSampleOrder.orderNumber,
        });
      } catch {}

      addToast(
        language === 'ar' 
          ? 'تم توثيق الرسالة في سجل صندوق رسائل الواتساب بنجاح' 
          : 'Message logged into WhatsApp inbox successfully', 
        'info'
      );
    } finally {
      setIsSendingWhatsAppTest(false);
      checkGatewayStatus();
    }
  };

  const [isNewCouponOpen, setIsNewCouponOpen] = useState(false);
  const [newCouponData, setNewCouponData] = useState({
    code: '',
    discountPercent: 15,
    minSpend: 25000,
    description: '',
  });

  const currencies = [
    { symbol: 'د.ع', label: 'IQD (د.ع) — دينار عراقي (العملة الرسمية داخل العراق)' },
    { symbol: '$', label: 'USD ($) — دولار أمريكي' },
  ];

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName: formSettings.storeName,
      supportEmail: formSettings.supportEmail,
      currency: formSettings.currency,
      freeShippingThreshold: Number(formSettings.freeShippingThreshold),
      standardShippingFee: Number(formSettings.standardShippingFee),
      taxRate: Number(formSettings.taxRatePercent) / 100,
      phoneNumber: formSettings.phoneNumber.trim(),
      bankDetails: formSettings.bankDetails.trim(),
      paymentMethods: paymentMethods,
    });
    addToast(language === 'ar' ? 'تم حفظ إعدادات المتجر بنجاح!' : 'Store settings updated!', 'success');
  };

  const handleUpdateSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerLoginPhone.trim()) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم جوال مالك المتجر' : 'Please provide owner phone number', 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      addToast(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match', 'error');
      return;
    }

    updateHostedStore(activeStore.id, {
      ownerPhone: ownerLoginPhone.trim(),
      ...(newPassword.trim() ? { adminPassword: newPassword.trim() } : {}),
    });

    setNewPassword('');
    setConfirmPassword('');
    addToast(
      language === 'ar' ? 'تم حفظ بيانات أمان الدخول ورقم الجوال بنجاح!' : 'Login phone and security settings saved!',
      'success'
    );
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponData.code.trim()) return;

    addCoupon({
      code: newCouponData.code.trim().toUpperCase(),
      discountPercent: Number(newCouponData.discountPercent),
      minSpend: Number(newCouponData.minSpend),
      active: true,
      description: newCouponData.description || `${newCouponData.discountPercent}% off orders over ${formSettings.currency}${newCouponData.minSpend}`,
    });

    setNewCouponData({ code: '', discountPercent: 15, minSpend: 25000, description: '' });
    setIsNewCouponOpen(false);
    addToast(language === 'ar' ? 'تم إنشاء كود الخصم بنجاح!' : 'Coupon created successfully!', 'success');
  };

  const handleDeleteCoupon = (code: string) => {
    if (window.confirm(language === 'ar' ? `هل أنت متأكد من حذف كود الخصم (${code})؟` : `Delete coupon ${code}?`)) {
      deleteCoupon(code);
      addToast(language === 'ar' ? 'تم حذف كود الخصم بنجاح' : 'Coupon deleted', 'info');
    }
  };

  const handleDownloadStoreBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      store: activeStore
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `store-backup-${activeStore.slug}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast(language === 'ar' ? 'تم تنزيل النسخة الاحتياطية لمتجرك بنجاح!' : 'Store backup downloaded!', 'success');
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {language === 'ar' ? 'إعدادات المتجر، الشحن، والكوبونات' : t.storeConfig}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {language === 'ar' ? 'ضبط العملة، رسوم الشحن، بوابات الدفع، وإدارة أكواد التخفيض' : t.storeConfigDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: General Store Settings & Payment Methods */}
        <div className="lg:col-span-7 space-y-8">
          {/* General Preferences */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <Settings className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">{t.storefrontPreferences}</h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'البيانات التجارية الأساسية ورسوم التوصيل' : 'Primary store operations & delivery rates'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'اسم المتجر الرسمي' : 'Store Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formSettings.storeName}
                    onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني للدعم' : 'Support Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formSettings.supportEmail}
                    onChange={(e) => setFormSettings({ ...formSettings, supportEmail: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Currency & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عملة المتجر المعتمدة' : 'Store Currency'}
                  </label>
                  <select
                    value={formSettings.currency}
                    onChange={(e) => setFormSettings({ ...formSettings, currency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                  >
                    {currencies.map((c) => (
                      <option key={c.symbol} value={c.symbol}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رقم هاتف خدمة العملاء' : 'Customer Support Phone'}
                  </label>
                  <input
                    type="text"
                    placeholder="9647XXXXXXXX"
                    value={formSettings.phoneNumber}
                    onChange={(e) => setFormSettings({ ...formSettings, phoneNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Shipping & Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? `حد الشحن المجاني (${formSettings.currency})` : 'Free Shipping Threshold'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formSettings.freeShippingThreshold}
                    onChange={(e) => setFormSettings({ ...formSettings, freeShippingThreshold: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? `رسوم التوصيل القياسية (${formSettings.currency})` : 'Standard Delivery Fee'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formSettings.standardShippingFee}
                    onChange={(e) => setFormSettings({ ...formSettings, standardShippingFee: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formSettings.taxRatePercent}
                    onChange={(e) => setFormSettings({ ...formSettings, taxRatePercent: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Trust Badges Notice & Shortcut */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {language === 'ar' ? 'شارات الثقة ومميزات المتجر (Trust Badges)' : 'Trust Badges & Guarantees'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {language === 'ar' ? 'تخصيص نصوص وأيقونات الشحن، الإرجاع، والضمان الظاهرة بالفوتر' : 'Customize icons & text for shipping, returns, warranty and support'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminTab('design')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
                >
                  {language === 'ar' ? 'تعديل الشارات في التصميم ←' : 'Edit Badges in Design →'}
                </button>
              </div>

              {/* Payment Gateways / Methods Configuration */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">
                  {language === 'ar' ? 'طرق الدفع المفعلة للعملاء' : 'Accepted Payment Gateways'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cashOnDelivery}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, cashOnDelivery: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">{language === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'التحصيل عند الباب' : 'Pay upon delivery'}</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.creditCard}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, creditCard: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">{language === 'ar' ? 'البطاقات الإلكترونية / كي كارد / ماستركارد' : 'Debit / Credit / Qi Card'}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'دفع إلكتروني فوري' : 'Online checkout'}</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.applePay}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, applePay: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <CreditCard className="w-4 h-4 text-slate-900" />
                    <div>
                      <span className="font-bold text-slate-800 block">Apple Pay</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'دفع فوري بلمسة واحدة' : 'One-tap checkout'}</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.bankTransfer}
                      onChange={(e) => setPaymentMethods({ ...paymentMethods, bankTransfer: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <Banknote className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="font-bold text-slate-800 block">{language === 'ar' ? 'التحويل المصرفي / محفظة زين كاش' : 'Direct Bank / Mobile Wallet'}</span>
                      <span className="text-[10px] text-slate-400">{language === 'ar' ? 'إيداع على حساب التاجر' : 'Wire to bank account'}</span>
                    </div>
                  </label>
                </div>

                {paymentMethods.bankTransfer && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'ar' ? 'بيانات الحساب المصرفي أو رقم محفظة زين كاش' : 'Bank Details or Zain Cash Wallet'}
                    </label>
                    <textarea
                      rows={2}
                      placeholder={language === 'ar' ? 'اسم المصرف (مثال: مصرف التي بي آي / مصرف بغداد / محفظة زين كاش 0780...)' : 'Bank name / Qi Card / Zain Cash Wallet 0780...'}
                      value={formSettings.bankDetails}
                      onChange={(e) => setFormSettings({ ...formSettings, bankDetails: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{language === 'ar' ? 'حفظ إعدادات المتجر' : t.savePreferences}</span>
                </button>
              </div>
            </form>
          </div>

          {/* New Order Notifications & Alert Settings */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'ar' ? 'إشعارات وتنبيهات الطلبات الجديدة' : 'New Order Alerts & Notifications'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'ar'
                      ? 'تنبيهك فوراً بنغمة صوتية وإشعارات سطح المكتب عند تقديم أي عميل لطلب جديد في متجرك'
                      : 'Get alerted instantly with audio chimes & desktop push notifications whenever an order is submitted'}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{language === 'ar' ? 'نظام التنبيهات نشط' : 'Alerts Active'}</span>
              </span>
            </div>

            <div className="space-y-4">
              {/* Sound Chime Alert Option */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                    {activeStore.settings.notificationSettings?.soundEnabled !== false ? (
                      <Volume2 className="w-4.5 h-4.5 text-emerald-600" />
                    ) : (
                      <VolumeX className="w-4.5 h-4.5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {language === 'ar' ? 'صوت التنبيه الموسيقي للطلبات (Sound Chime)' : 'Melodic Order Arrival Chime'}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {language === 'ar'
                        ? 'تشغيل نغمة كاشير تنبيهية مميزة تلقائياً فور تأكيد أي طلب جديد عبر المتجر'
                        : 'Play a crisp melodic cash register chime automatically upon each order confirmation'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={playNotificationSound}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'ar' ? 'تجربة الصوت 🔊' : 'Test Sound 🔊'}</span>
                  </button>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeStore.settings.notificationSettings?.soundEnabled !== false}
                      onChange={(e) => updateNotificationSettings({ soundEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative" />
                  </label>
                </div>
              </div>

              {/* Desktop Browser Push Notifications */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                    <Bell className="w-4.5 h-4.5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {language === 'ar' ? 'إشعارات سطح المكتب للمتصفح (Web Push)' : 'Desktop Browser Notifications'}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {language === 'ar'
                        ? 'إرسال إشعار فوري لسطح المكتب برقم وتفاصيل الطلب حتى لو كانت لوحة التحكم مصغرة'
                        : 'Receive desktop banners with order number & details even when the browser is minimized'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{language === 'ar' ? 'مفعّلة بالمتصفح' : 'Active in Browser'}</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={requestBrowserNotifications}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      {language === 'ar' ? 'تفعيل إشعارات المتصفح' : 'Enable Browser Push'}
                    </button>
                  )}
                </div>
              </div>

              {/* WhatsApp Notification Number & Instant Automatic Test via Render */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-900">
                      {language === 'ar' ? 'رقم الواتساب لتلقي تنبيهات الطلبات الفورية' : 'WhatsApp Order Alert Phone'}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    {language === 'ar' ? 'إرسال تلقائي عبر خادم Render' : 'Auto-dispatched via Render'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="tel"
                    dir="ltr"
                    placeholder="9647XXXXXXXX"
                    value={activeStore.settings.notificationSettings?.whatsappAlertPhone || activeStore.ownerPhone || ''}
                    onChange={(e) => updateNotificationSettings({ whatsappAlertPhone: e.target.value })}
                    className="w-full sm:flex-1 p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                  <button
                    type="button"
                    disabled={isSendingWhatsAppTest}
                    onClick={handleSendAutomaticWhatsAppTest}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 w-full sm:w-auto justify-center cursor-pointer"
                  >
                    {isSendingWhatsAppTest ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'ar' ? 'جاري الإرسال عبر Render...' : 'Dispatching via Render...'}</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'فحص الإشعار التلقائي 📲' : 'Test Auto Notification 📲'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Render Gateway Connection State */}
                <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-500">{language === 'ar' ? 'حالة خادم Render:' : 'Render Gateway:'}</span>
                    {gatewayStatus?.connected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                        {language === 'ar' ? `متصل وجاهز (+${gatewayStatus.phone || 'WhatsApp'})` : `Connected (+${gatewayStatus.phone || 'WhatsApp'})`}
                      </span>
                    ) : gatewayStatus?.status === 'WAITING_FOR_QR_SCAN' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {language === 'ar' ? 'يعمل - بانتظار مسح رمز QR' : 'Active - Waiting for QR scan'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {isCheckingGateway ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin text-slate-500" />
                            {language === 'ar' ? 'جاري الفحص...' : 'Checking...'}
                          </>
                        ) : (
                          language === 'ar' ? 'خادم Render قيد التهيئة' : 'Render Gateway Standby'
                        )}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {(!gatewayStatus?.connected) && (
                      <a
                        href={`${gatewayUrl}/qr`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-bold text-[10px] transition-colors"
                      >
                        <QrCode className="w-3 h-3" />
                        <span>{language === 'ar' ? 'ربط واتساب بالـ QR' : 'Link via QR'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={checkGatewayStatus}
                      disabled={isCheckingGateway}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors"
                      title={language === 'ar' ? 'تحديث حالة الاتصال' : 'Refresh status'}
                    >
                      <RefreshCw className={`w-3 h-3 ${isCheckingGateway ? 'animate-spin text-indigo-600' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Visual Preview & Inspector of Store WhatsApp Forms */}
                <div className="pt-2.5 border-t border-slate-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsMessagePreviewOpen(!isMessagePreviewOpen)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>{language === 'ar' ? 'معاينة نماذج رسائل واتساب المطبقة على متجرك 📋' : 'Preview Applied WhatsApp Forms 📋'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({isMessagePreviewOpen ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'عرض النماذج' : 'Show Forms')})
                      </span>
                    </button>
                    {isMessagePreviewOpen && (
                      <button
                        type="button"
                        onClick={handleCopyMessageForm}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      >
                        {hasCopiedMessage ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">{language === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{language === 'ar' ? 'نسخ هذا النموذج' : 'Copy Form'}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isMessagePreviewOpen && (
                    <div className="space-y-2.5 animate-fadeIn">
                      {/* Templates Tabs for Store View */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
                        {storeWhatsAppTemplates.map((t) => {
                          const isSelected = t.id === selectedStoreTemplateId;
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedStoreTemplateId(t.id)}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${t.enabled !== false ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span>{language === 'ar' ? t.nameAr : t.nameEn}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Active Template Meta, Actions & Status */}
                      {activeStoreTemplate && (
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                activeStoreTemplate.enabled !== false
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-rose-50 text-rose-800 border-rose-200'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${activeStoreTemplate.enabled !== false ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {activeStoreTemplate.enabled !== false
                                ? (language === 'ar' ? 'مفعّل بالمتجر' : 'Active in Store')
                                : (language === 'ar' ? 'معطّل من إدارة المنصة' : 'Disabled by Platform')}
                            </span>
                            {activeStoreTemplate.isDefaultModified ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-600" />
                                <span>{language === 'ar' ? 'نموذج محدث ومخصص' : 'Custom Modified Form'}</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {language === 'ar' ? 'النموذج الافتراضي' : 'Default Form'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                syncWhatsAppTemplates();
                                addToast(language === 'ar' ? 'تمت مزامنة أحدث النماذج بنجاح!' : 'Templates synchronized successfully!', 'info');
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                              title={language === 'ar' ? 'تحديث المزامنة مع المنصة' : 'Sync templates'}
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{language === 'ar' ? 'مزامنة 🔄' : 'Sync'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsEditingStoreTemplate(!isEditingStoreTemplate)}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                isEditingStoreTemplate
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <Edit3 className="w-3 h-3 text-emerald-600" />
                              <span>{isEditingStoreTemplate ? (language === 'ar' ? 'معاينة 👁️' : 'Preview') : (language === 'ar' ? 'تعديل هذا النموذج ✏️' : 'Edit Form')}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Editor vs Preview Mode */}
                      {isEditingStoreTemplate ? (
                        <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl animate-fadeIn">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>{language === 'ar' ? 'تعديل نص النموذج لهذا المتجر والمنصة:' : 'Edit template form text:'}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {language === 'ar' ? 'انقر لإدراج المتغيرات:' : 'Click to insert variables:'}
                            </span>
                          </div>

                          {/* Quick Insert Variables */}
                          <div className="flex flex-wrap gap-1 p-2 bg-white rounded-xl border border-slate-200">
                            {activeStoreTemplate.variables.map((v) => (
                              <button
                                key={v.key}
                                type="button"
                                onClick={() => handleInsertStoreVariable(v.key)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                              >
                                {v.key}
                              </button>
                            ))}
                          </div>

                          <textarea
                            rows={8}
                            dir="rtl"
                            value={storeTemplateContent}
                            onChange={(e) => setStoreTemplateContent(e.target.value)}
                            className="w-full p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-800 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                          />

                          <div className="flex items-center justify-between gap-2 pt-1">
                            {activeStoreTemplate.isDefaultModified && (
                              <button
                                type="button"
                                onClick={handleResetStoreTemplate}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3 text-slate-500" />
                                <span>{language === 'ar' ? 'استعادة الافتراضي' : 'Reset'}</span>
                              </button>
                            )}

                            <div className="flex items-center gap-2 mr-auto">
                              <button
                                type="button"
                                onClick={() => setIsEditingStoreTemplate(false)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
                              >
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveStoreTemplate}
                                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{language === 'ar' ? 'حفظ وتطبيق النموذج فوراً 💾' : 'Save & Apply'}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Rendered Text Box for this Store */
                        <div className="p-3.5 bg-slate-900 text-emerald-300 rounded-2xl border border-slate-800 text-[11px] font-mono leading-relaxed space-y-1 select-all shadow-inner whitespace-pre-line text-right" dir="rtl">
                          {activeStoreTemplatePreview}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* WhatsApp Interactive Orders Management Cheat-Sheet */}
                <div className="pt-3 border-t border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Bot className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'ar' ? 'إدارة الطلبات عبر محادثة واتساب (أوامر الرد الآلي 🤖)' : 'Manage Orders via WhatsApp Chat (Bot Commands 🤖)'}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {language === 'ar' 
                      ? 'يمكن لمدير المتجر التحكم الكامل بحالة أي طلب بالرد المباشر في محادثة واتساب بالكلمات التالية:'
                      : 'The store manager can update order statuses directly in the WhatsApp chat using these commands:'}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-emerald-700 flex items-center gap-1 font-mono text-[11px]">
                        <span>1️⃣ أرسل 1 أو (تأكيد #{previewSampleOrder.orderNumber})</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        {language === 'ar' ? 'قبول الطلب وتغيير حالته إلى (قيد التجهيز والتغليف 📦)' : 'Confirm order and mark as processing'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-indigo-700 flex items-center gap-1 font-mono text-[11px]">
                        <span>2️⃣ أرسل 2 أو (شحن #{previewSampleOrder.orderNumber} WAS-991)</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        {language === 'ar' ? 'تسليم للمندوب مع حفظ كود التتبع وتغيير الحالة لـ (تم الشحن 🚚)' : 'Ship order with tracking number'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-emerald-800 flex items-center gap-1 font-mono text-[11px]">
                        <span>3️⃣ أرسل 3 أو (تسليم #{previewSampleOrder.orderNumber})</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        {language === 'ar' ? 'تأكيد استلام الزبون للطلب وتحصيل المبلغ (تم التوصيل ✅)' : 'Mark as delivered and completed'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-rose-700 flex items-center gap-1 font-mono text-[11px]">
                        <span>4️⃣ أرسل 4 أو (الغاء #{previewSampleOrder.orderNumber})</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        {language === 'ar' ? 'إلغاء الطلب فوراً وتحديث اللوحة (ملغي ❌)' : 'Cancel order'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1 font-mono text-[11px]">
                        <span>5️⃣ أرسل 5 أو (تفاصيل #{previewSampleOrder.orderNumber})</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        {language === 'ar' ? 'استرجاع تفاصيل العميل، العنوان والمنتجات المطلوبة 📋' : 'Show full order items and customer address'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1 font-mono text-[11px]">
                        <span>طلبات / مساعدة</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">
                        {language === 'ar' ? 'عرض قائمة أحدث الطلبات أو قائمة أوامر التحكم' : 'List recent orders or help cheat sheet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Offline & Closed-Website Background Notification Explainer */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Laptop className="w-4 h-4 text-indigo-600" />
                  <span>{language === 'ar' ? 'كيف تعمل التنبيهات عندما يكون الموقع أو المتصفح مغلقاً؟' : 'How alerts work when the website is closed'}</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                  <p className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{language === 'ar' ? 'خدمة خلفية المتصفح (Service Worker):' : 'Background Service Worker:'}</strong> {language === 'ar' ? 'تم تسجيل ملف الخلفية بنجاح، حيث يستمر المتصفح في الاستماع وإظهار إشعارات النظام المباشرة.' : 'Background service worker is registered and triggers OS system notifications.'}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{language === 'ar' ? 'تنبيهات الواتساب الفورية (WhatsApp Direct):' : 'Instant WhatsApp Alerts:'}</strong> {language === 'ar' ? 'أضمن وسيلة لاستقبال الطلبات على هاتفك المحمول 24/7 حتى وإن كان جهاز الكمبيوتر مطفأً تماماً.' : 'Most reliable way to get order pings on your phone 24/7 even if your PC is powered off.'}</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>{language === 'ar' ? 'تطبيق الويب المستقل (PWA App):' : 'Standalone Web App (PWA):'}</strong> {language === 'ar' ? 'يمكنك تثبيت لوحة التحكم كتطبيق مستقل من خيارات المتصفح (Install App) لتعمل كتطبيق هاتف أو حاسوب دائم.' : 'Install the admin panel as an app from browser menu for dedicated OS integration.'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Store Owner Password & Security */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'أمان وتسجيل دخول مالك المتجر' : 'Store Owner Authentication & Security'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'ar' ? 'تحديث رقم الجوال المستخدم في تسجيل الدخول (SMS OTP) وكلمة المرور' : 'Update your login mobile phone (SMS OTP) and panel password'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdateSecurity} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'رقم جوال تسجيل الدخول (معتمد لرموز SMS)' : 'Merchant Login Phone (SMS OTP)'} *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={ownerLoginPhone}
                    onChange={(e) => setOwnerLoginPhone(e.target.value)}
                    placeholder="+964 770 123 4567"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                    dir="ltr"
                  />
                  <Smartphone className="w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 end-3 pointer-events-none" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'ar'
                    ? 'يُستخدم هذا الرقم للتحقق المباشر عند تسجيل الدخول إلى لوحة إدارة متجرك وتلقي رمز التحقق السري.'
                    : 'This mobile number is used to verify store owner access and receive 4-digit SMS OTP codes.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تغيير كلمة المرور (اختياري)' : 'New Password (Optional)'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'ar' ? 'حفظ إعدادات الأمان والجوال' : 'Save Security & Phone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Discount Coupons & Cloud Sync */}
        <div className="lg:col-span-5 space-y-8">
          {/* Coupon Management */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base text-slate-900">{language === 'ar' ? 'أكواد وكوبونات الخصم' : t.promoCoupons}</h3>
              </div>
              <button
                onClick={() => setIsNewCouponOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.createCoupon}</span>
              </button>
            </div>

            {/* Coupons List */}
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-slate-900 tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                        {coupon.code}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        {coupon.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {coupon.description || `Min spend ${formSettings.currency}${coupon.minSpend}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCouponStatus(coupon.code)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        coupon.active
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {coupon.active ? t.active : t.disabled}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoupon(coupon.code)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={language === 'ar' ? 'حذف الكوبون' : 'Delete coupon'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cloud Infrastructure Connection Status */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <Database className="w-5 h-5 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'حالة السحابة وقواعد البيانات' : 'Cloud Infrastructure'}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Convex Database</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isConvexConnected ? 'Connected' : 'Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-slate-800">Cloudflare Images / R2</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {isCloudflareConfigured ? 'Active' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Store Data & Disaster Recovery Backup Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'النسخ الاحتياطي وحفظ البيانات' : 'Store Data & Backup'}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {language === 'ar'
                ? 'قم بتنزيل نسخة احتياطية كاملة لمتجرك (المنتجات، الكوبونات، الطلبات، والإعدادات) في ملف JSON يمكنك الاحتفاظ به بأمان.'
                : 'Download a JSON snapshot of your store catalog, coupons, orders, and configuration.'}
            </p>

            <button
              type="button"
              onClick={handleDownloadStoreBackup}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'تحميل نسخة احتياطية للمتجر (JSON)' : 'Download Store Backup (JSON)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* New Coupon Modal */}
      {isNewCouponOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t.createCoupon}</h3>
              <button
                onClick={() => setIsNewCouponOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'رمز الكوبون (Code)' : 'Coupon Code'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WELCOME20"
                  value={newCouponData.code}
                  onChange={(e) => setNewCouponData({ ...newCouponData, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نسبة الخصم (%)' : 'Discount (%)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    required
                    value={newCouponData.discountPercent}
                    onChange={(e) => setNewCouponData({ ...newCouponData, discountPercent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? `الحد الأدنى للطلب (${formSettings.currency})` : 'Min Spend'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCouponData.minSpend}
                    onChange={(e) => setNewCouponData({ ...newCouponData, minSpend: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'وصف الكوبون الترويجي' : 'Description'}
                </label>
                <input
                  type="text"
                  placeholder="خصم ترحيبي للعملاء الجدد"
                  value={newCouponData.description}
                  onChange={(e) => setNewCouponData({ ...newCouponData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCouponOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
                >
                  {language === 'ar' ? 'إنشاء وتفعيل' : 'Create & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
