import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { StoreProvider } from './context/StoreContext';
import { ConvexProvider } from 'convex/react';
import { convexClient } from './convexClient';
import './index.css';

const RootApp: React.FC = () => {
  const content = (
    <StoreProvider>
      <App />
    </StoreProvider>
  );

  if (convexClient) {
    return <ConvexProvider client={convexClient}>{content}</ConvexProvider>;
  }

  return content;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
