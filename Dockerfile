# ==============================================================================
# Stage 1: Build the Vite React Frontend Application
# ==============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies needed for native modules
RUN apk add --no-cache libc6-compat

# Leverage Docker cache layer for npm dependencies
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy application source code
COPY . .

# Run production build (TypeScript compile + Vite bundle)
ENV NODE_ENV=production
RUN npm run build

# ==============================================================================
# Stage 2: Serve Production Assets with Lightweight Nginx
# ==============================================================================
FROM nginx:1.27-alpine AS runner

LABEL maintainer="Bastiyah DevOps Team <devops@bastiyah.com>"
LABEL description="Bastiyah E-Commerce Multi-Store Platform Production Frontend"

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration for SPA routing & gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy bundled assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Health check to ensure nginx is serving traffic
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O - http://127.0.0.1:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
