/**
 * Sentry & Runtime Observability Client for Bastiyah Platform
 * 
 * Provides real-time exception reporting, user session breadcrumbs,
 * checkout funnel tracking, and automated error boundary integration.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface SentryBreadcrumb {
  category: string;
  message: string;
  level?: 'info' | 'warning' | 'error' | 'debug';
  data?: Record<string, any>;
  timestamp?: number;
}

export interface SentryUserContext {
  id?: string;
  phone?: string;
  storeId?: string;
  operator?: string;
  role?: 'owner' | 'manager' | 'customer';
}

class SentryClient {
  private dsn: string | null = null;
  private environment: string = 'development';
  private release: string = '1.0.0';
  private breadcrumbs: SentryBreadcrumb[] = [];
  private userContext: SentryUserContext = {};
  private initialized: boolean = false;

  public init() {
    if (this.initialized || typeof window === 'undefined') return;

    this.dsn = (import.meta as any).env?.VITE_SENTRY_DSN || null;
    this.environment = (import.meta as any).env?.MODE || 'production';
    this.release = (import.meta as any).env?.VITE_APP_VERSION || 'bastiyah-store@1.0.0';

    if (this.dsn) {
      console.log(`[Observability] Sentry initialized in ${this.environment} mode.`);
    }

    // Capture global unhandled exceptions
    window.addEventListener('error', (event: ErrorEvent) => {
      this.captureException(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.captureException(event.reason || new Error('Unhandled Promise Rejection'), {
        type: 'unhandledrejection',
      });
    });

    this.initialized = true;
  }

  public addBreadcrumb(breadcrumb: SentryBreadcrumb) {
    const entry = {
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
      level: breadcrumb.level || 'info',
    };
    this.breadcrumbs.push(entry);
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs.shift();
    }
  }

  public setUserContext(user: SentryUserContext) {
    this.userContext = { ...this.userContext, ...user };
  }

  public captureException(error: any, context?: Record<string, any>) {
    const errorPayload = {
      message: error?.message || String(error),
      stack: error?.stack,
      context: { ...context, user: this.userContext },
      breadcrumbs: [...this.breadcrumbs],
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      release: this.release,
      environment: this.environment,
    };

    if (this.environment !== 'production') {
      console.warn('[Observability Error Captured]:', errorPayload);
    }

    if (!this.dsn) {
      return;
    }

    // Send error event to Sentry DSN endpoint via fetch beacon
    try {
      this.sendToSentry(errorPayload);
    } catch (e) {
      console.error('[Observability] Failed to dispatch error to Sentry:', e);
    }
  }

  public captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    this.addBreadcrumb({
      category: 'message',
      message,
      level,
      data: context,
    });

    if (level === 'error') {
      this.captureException(new Error(message), context);
    }
  }

  // Specialized E-Commerce telemetry tracking
  public trackCheckoutEvent(step: 'cart_view' | 'checkout_open' | 'phone_entered' | 'order_submitted' | 'order_failed', metadata?: Record<string, any>) {
    this.addBreadcrumb({
      category: 'checkout',
      message: `Checkout Step: ${step}`,
      level: step === 'order_failed' ? 'error' : 'info',
      data: metadata,
    });
  }

  public trackWhatsAppEvent(action: 'send' | 'receive' | 'template_applied' | 'gateway_connect', status: 'success' | 'failed' | 'pending', metadata?: Record<string, any>) {
    this.addBreadcrumb({
      category: 'whatsapp',
      message: `WhatsApp ${action} - ${status}`,
      level: status === 'failed' ? 'error' : 'info',
      data: metadata,
    });
  }

  private async sendToSentry(payload: any) {
    if (!this.dsn) return;
    try {
      // Parse Sentry DSN: https://<publicKey>@<host>/<projectId>
      const match = this.dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(\d+)$/);
      if (!match) return;

      const [, publicKey, host, projectId] = match;
      const sentryUrl = `https://${host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`;

      await fetch(sentryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: Math.random().toString(36).substring(2) + Date.now().toString(36),
          timestamp: Math.floor(Date.now() / 1000),
          platform: 'javascript',
          level: 'error',
          environment: this.environment,
          release: this.release,
          message: payload.message,
          exception: {
            values: [
              {
                type: 'Error',
                value: payload.message,
                stacktrace: payload.stack ? { frames: [{ filename: payload.url, function: 'unknown' }] } : undefined,
              },
            ],
          },
          breadcrumbs: payload.breadcrumbs.map((b: SentryBreadcrumb) => ({
            category: b.category,
            message: b.message,
            level: b.level,
            timestamp: Math.floor((b.timestamp || Date.now()) / 1000),
            data: b.data,
          })),
          user: payload.context?.user,
          extra: payload.context,
        }),
      });
    } catch {
      // Ignore background network telemetry failures
    }
  }
}

export const sentry = new SentryClient();

// React Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SentryErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    sentry.captureException(error, { componentStack: errorInfo.componentStack });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center font-sans">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              حدث خطأ غير متوقع
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              تم تسجيل الخطأ تلقائياً في نظام المراقبة لحله فوراً. يرجى إعادة تحديث الصفحة أو المحاولة لاحقاً.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition duration-200 shadow-md"
              >
                إعادة تحميل الصفحة / Reload
              </button>
              <button
                onClick={() => { window.location.href = '/'; }}
                className="w-full py-2.5 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-xl transition duration-200"
              >
                العودة للرئيسية
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
