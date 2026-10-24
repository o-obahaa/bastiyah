import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StoreProvider } from './context/StoreContext';
import { ConvexProvider } from 'convex/react';
import { convexClient } from './convexClient';
import { registerServiceWorker } from './utils/notificationUtils';
import { sentry, SentryErrorBoundary } from './lib/sentry';
import './index.css';

// Initialize Sentry error observability & performance telemetry
sentry.init();

// Automatically register background service worker for offline & closed-browser push notifications
if (typeof window !== 'undefined') {
  registerServiceWorker();
}

const RootApp: React.FC = () => {
  const content = (
    <StoreProvider>
      <App />
    </StoreProvider>
  );

  if (convexClient) {
    return (
      <SentryErrorBoundary>
        <ConvexProvider client={convexClient}>{content}</ConvexProvider>
      </SentryErrorBoundary>
    );
  }

  return <SentryErrorBoundary>{content}</SentryErrorBoundary>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);

