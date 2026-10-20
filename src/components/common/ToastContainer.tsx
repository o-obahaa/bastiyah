import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:bottom-6 sm:end-6 z-[9999] flex flex-col gap-2.5 sm:max-w-sm sm:w-full pointer-events-none"
      style={{ isolation: 'isolate' }}
    >
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
          info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />,
        };

        const borders = {
          success: 'border-s-4 border-s-emerald-500 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95',
          error: 'border-s-4 border-s-rose-500 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95',
          warning: 'border-s-4 border-s-amber-500 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95',
          info: 'border-s-4 border-s-indigo-500 border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-xl shadow-2xl backdrop-blur-md border ${borders[toast.type]} transition-all duration-300 animate-in fade-in slide-in-from-bottom-2`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 -m-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
