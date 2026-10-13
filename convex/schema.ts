import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stores: defineTable({
    slug: v.string(),
    name: v.string(),
    nameAr: v.optional(v.string()),
    tagline: v.string(),
    taglineAr: v.optional(v.string()),
    description: v.string(),
    descriptionAr: v.optional(v.string()),
    category: v.string(),
    categoryAr: v.optional(v.string()),
    ownerName: v.string(),
    ownerEmail: v.string(),
    status: v.union(v.literal("active"), v.literal("maintenance"), v.literal("suspended")),
    plan: v.union(v.literal("Starter"), v.literal("Growth"), v.literal("Enterprise")),
    createdAt: v.string(),
    design: v.object({
      themeColor: v.union(
        v.literal("emerald"),
        v.literal("indigo"),
        v.literal("amber"),
        v.literal("rose"),
        v.literal("cyan"),
        v.literal("violet")
      ),
      layoutStyle: v.union(
        v.literal("modern-split"),
        v.literal("luxury-centered"),
        v.literal("minimal-editorial"),
        v.literal("vibrant-banner")
      ),
      logoEmoji: v.string(),
      headerStyle: v.union(v.literal("light"), v.literal("dark")),
      cardRadius: v.union(v.literal("rounded"), v.literal("pill"), v.literal("sharp")),
      heroBannerUrl: v.optional(v.string()),
    }),
    settings: v.object({
      storeName: v.string(),
      supportEmail: v.string(),
      currency: v.string(),
      freeShippingThreshold: v.number(),
      standardShippingFee: v.number(),
      taxRate: v.number(),
    }),
  })
    .index("by_slug", ["slug"]),

  products: defineTable({
    storeId: v.string(), // store slug or ID
    name: v.string(),
    nameAr: v.optional(v.string()),
    tagline: v.string(),
    taglineAr: v.optional(v.string()),
    description: v.string(),
    descriptionAr: v.optional(v.string()),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    rating: v.number(),
    reviewCount: v.number(),
    stock: v.number(),
    images: v.array(v.string()),
    badge: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
    tags: v.array(v.string()),
    specs: v.optional(v.any()),
    createdAt: v.string(),
  })
    .index("by_store", ["storeId"])
    .index("by_store_and_category", ["storeId", "category"]),

  orders: defineTable({
    storeId: v.string(),
    orderNumber: v.string(),
    date: v.string(),
    customer: v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      zipCode: v.string(),
      country: v.string(),
    }),
    items: v.array(
      v.object({
        productId: v.string(),
        productName: v.string(),
        productImage: v.string(),
        price: v.number(),
        quantity: v.number(),
      })
    ),
    subtotal: v.number(),
    discount: v.number(),
    shipping: v.number(),
    tax: v.number(),
    total: v.number(),
    status: v.string(),
    paymentMethod: v.string(),
    trackingNumber: v.optional(v.string()),
  })
    .index("by_store", ["storeId"]),

  customers: defineTable({
    storeId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.string(),
    city: v.string(),
    country: v.string(),
    ordersCount: v.number(),
    totalSpent: v.number(),
    joinedDate: v.string(),
  })
    .index("by_store", ["storeId"]),

  coupons: defineTable({
    storeId: v.string(),
    code: v.string(),
    discountPercent: v.number(),
    minSpend: v.number(),
    active: v.boolean(),
    description: v.string(),
  })
    .index("by_store", ["storeId"]),
});
