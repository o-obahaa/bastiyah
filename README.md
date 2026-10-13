# Bastiyah (بسطية) — Multi-Store E-Commerce Hosting Platform

**Bastiyah (بسطية)** is a modern, bilingual (English & Arabic with full native RTL), multi-tenant online store hosting platform built with **React 18**, **TypeScript**, and **Tailwind CSS**.

The platform enables hosting multiple independent web-stores through custom subdomains (`[storename].bastiyah.com`), where each store has its own visual design, color theme, and isolated management portal.

---

## 🌟 Complete Multi-Store Separation Architecture

### 1. 🏢 Bastiyah Main Platform (`https://bastiyah.com`)
- The central portal and public directory of all hosted web-stores.
- Platform landing page explaining custom link provisioning, hosting tiers, and platform features.
- Public directory linking to each hosted store's live storefront and merchant admin.

### 2. 🛍️ Fully Isolated Storefronts (`https://[storename].bastiyah.com`)
- **Visual & Brand Separation**: Each store displays its own custom identity, logo icon, color palette, hero banners, and collections.
- **Cart & Wishlist Isolation**: Carts and wishlists are strictly partitioned per store (an item added in Panda Store will never appear in Royal Oud).
- **No Shared Platform Bar**: Storefronts operate as pure standalone websites without intrusive platform switchers.

### 3. 🛡️ Isolated Store Merchant Admin (`https://[storename].bastiyah.com/admin`)
- Dedicated portal for the store's merchant to manage inventory, fulfill orders, review customers, and customize the store's design.

### 4. 👑 Platform Owner Control Center (`https://bastiyah.com/owner` or `https://owner.bastiyah.com`)
- Master control center for the platform owner to provision new custom links, track platform GMV and orders, and manage all tenants.

### 🎨 Independent Design Studio per Store
- **Color Theme Palettes**: Emerald Forest, Royal Indigo, Luxury Gold & Amber, Velvet Rose, Oceanic Cyan, Cyber Violet.
- **Hero Layout Variations**: Modern Split Showcase, Luxury Centered Maison, Minimal Editorial Atelier, Vibrant Campaign Banner.
- **Customization**: Logo emblem emojis, light/dark header styles, and rounded/sharp card borders.

### 🛡️ Isolated Store Management (`/store/[storename]/admin`)
- Each store operates with its own private catalog, orders fulfillment, customer registry, and promotional coupons.
- Add, edit, and restock products with multi-currency pricing and category management.

### 🌍 Comprehensive English & Arabic (العربية) Support
- Instant bilingual toggle with full Right-to-Left (RTL) layout switching.
- Premium typography powered by Cairo and Plus Jakarta Sans.

---

## 🚀 Getting Started

```bash
# Navigate to the project directory
cd "/Users/bahaa/Desktop/online store"

# Install dependencies
npm install

# Start development server
npm run dev
```

Local URL: **http://localhost:3000**
