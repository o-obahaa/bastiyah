# Bastiyah (بسطية) — Multi-Store E-Commerce Hosting Platform

**Bastiyah (بسطية)** is a modern, bilingual (English & Arabic with full native RTL), multi-tenant online store hosting platform built with **React 18**, **TypeScript**, and **Tailwind CSS**.

The platform enables hosting multiple independent web-stores through custom subdomain links (`(storename).bastiyah.com`), where each store has its own visual design, color theme, and isolated management portal.

---

## 🌟 Key Architecture & Features

### 👑 Bastiyah Super Admin (Website Owner Control Center)
- Accessible via the **Bastiyah Owner Admin** button (`owner.bastiyah.com/admin`).
- **Custom Link Generator**: Provision new web-stores on custom links (`(storename).bastiyah.com`) with instant availability verification.
- **Platform-wide KPIs**: Aggregated Gross Merchandise Value (GMV), total orders, and product count across all hosted merchants.
- **Merchant Management**: 1-click access to any store's public storefront or private administrative dashboard.

### 🌐 Live Subdomain Bar & Store Switcher
- Persistent top platform bar showing the active custom link (`https://(storename).bastiyah.com`).
- One-click copy link action and instant store switcher dropdown.
- Browser URL query synchronization (`?store=<slug>`).

### 🎨 Independent Design Studio per Store
- **Color Theme Palettes**: Emerald Forest, Royal Indigo, Luxury Gold & Amber, Velvet Rose, Oceanic Cyan, Cyber Violet.
- **Hero Layout Variations**: Modern Split Showcase, Luxury Centered Maison, Minimal Editorial Atelier, Vibrant Campaign Banner.
- **Customization**: Logo emblem emojis, light/dark header styles, and rounded/sharp card borders.

### 🛡️ Isolated Store Management (`(storename).bastiyah.com/admin`)
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
