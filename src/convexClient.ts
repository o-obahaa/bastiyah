import { ConvexReactClient } from 'convex/react';

// Read Convex URL from environment variables with production fallback
const rawConvexUrl = (import.meta.env?.VITE_CONVEX_URL || 'https://aromatic-vole-851.convex.cloud').trim();

export const isConvexConfigured = (): boolean => {
  return Boolean(rawConvexUrl && rawConvexUrl.startsWith('https://') && !rawConvexUrl.includes('placeholder'));
};

export const convexClient: ConvexReactClient | null = isConvexConfigured() && rawConvexUrl
  ? new ConvexReactClient(rawConvexUrl)
  : null;

export const CONVEX_DEPLOYMENT_URL = rawConvexUrl || '';
