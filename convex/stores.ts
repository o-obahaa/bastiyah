import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stores").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const create = mutation({
  args: {
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
    plan: v.union(v.literal("Starter"), v.literal("Growth"), v.literal("Enterprise")),
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) {
      throw new Error(`Store with slug "${args.slug}" already exists`);
    }

    const storeId = await ctx.db.insert("stores", {
      ...args,
      status: "active",
      createdAt: new Date().toISOString(),
    });
    return storeId;
  },
});

export const update = mutation({
  args: {
    id: v.id("stores"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    tagline: v.optional(v.string()),
    taglineAr: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    category: v.optional(v.string()),
    categoryAr: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("maintenance"), v.literal("suspended"))),
    plan: v.optional(v.union(v.literal("Starter"), v.literal("Growth"), v.literal("Enterprise"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const updateDesign = mutation({
  args: {
    id: v.id("stores"),
    design: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { design: args.design });
  },
});

export const upsertStoreBySlug = mutation({
  args: {
    slug: v.string(),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    tagline: v.optional(v.string()),
    taglineAr: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    category: v.optional(v.string()),
    categoryAr: v.optional(v.string()),
    ownerName: v.optional(v.string()),
    ownerEmail: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("maintenance"), v.literal("suspended"))),
    plan: v.optional(v.union(v.literal("Starter"), v.literal("Growth"), v.literal("Enterprise"))),
    design: v.optional(v.any()),
    settings: v.optional(v.any()),
    features: v.optional(v.any()),
    themeTokens: v.optional(v.any()),
    logo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("stores")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      const { slug, ...patchData } = args;
      const cleanPatch: any = {};
      for (const [k, val] of Object.entries(patchData)) {
        if (val !== undefined) cleanPatch[k] = val;
      }
      await ctx.db.patch(existing._id, cleanPatch);
      return existing._id;
    } else {
      const storeId = await ctx.db.insert("stores", {
        slug: args.slug,
        name: args.name || args.slug,
        nameAr: args.nameAr,
        tagline: args.tagline || "",
        taglineAr: args.taglineAr,
        description: args.description || "",
        descriptionAr: args.descriptionAr,
        category: args.category || "General",
        categoryAr: args.categoryAr,
        ownerName: args.ownerName || "Merchant",
        ownerEmail: args.ownerEmail || `${args.slug}@bastiyah.com`,
        ownerPhone: args.ownerPhone,
        status: args.status || "active",
        plan: args.plan || "Enterprise",
        createdAt: new Date().toISOString(),
        design: args.design || {
          themeColor: "emerald",
          layoutStyle: "modern-split",
          logoEmoji: "🛍️",
          headerStyle: "light",
          cardRadius: "rounded",
          customLogoUrl: args.logo,
        },
        settings: args.settings || {
          storeName: args.name || args.slug,
          supportEmail: args.ownerEmail || `${args.slug}@bastiyah.com`,
          currency: "د.ع",
          freeShippingThreshold: 50000,
          standardShippingFee: 5000,
          taxRate: 0,
        },
        features: args.features,
        themeTokens: args.themeTokens,
        logo: args.logo,
      });
      return storeId;
    }
  },
});

export const syncAllStoresFromLocal = mutation({
  args: {
    stores: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    for (const s of args.stores) {
      if (!s.slug) continue;
      const existing = await ctx.db
        .query("stores")
        .withIndex("by_slug", (q) => q.eq("slug", s.slug))
        .first();

      const storePayload = {
        name: s.name,
        nameAr: s.nameAr,
        tagline: s.tagline,
        taglineAr: s.taglineAr,
        description: s.description,
        descriptionAr: s.descriptionAr,
        category: s.category,
        categoryAr: s.categoryAr,
        ownerName: s.ownerName,
        ownerEmail: s.ownerEmail,
        ownerPhone: s.ownerPhone,
        status: s.status || "active",
        plan: s.plan || "Enterprise",
        design: s.design,
        settings: s.settings,
        features: s.features,
        themeTokens: s.themeTokens,
        logo: s.logo || s.design?.customLogoUrl,
      };

      if (existing) {
        await ctx.db.patch(existing._id, storePayload);
      } else {
        await ctx.db.insert("stores", {
          slug: s.slug,
          createdAt: s.createdAt || new Date().toISOString(),
          ...storePayload,
        });
      }
    }
    return { success: true, count: args.stores.length };
  },
});

export const updateSettings = mutation({
  args: {
    id: v.id("stores"),
    settings: v.object({
      storeName: v.string(),
      supportEmail: v.string(),
      currency: v.string(),
      freeShippingThreshold: v.number(),
      standardShippingFee: v.number(),
      taxRate: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { settings: args.settings });
  },
});

export const updateFeatures = mutation({
  args: {
    id: v.id("stores"),
    features: v.object({
      reviews: v.optional(v.boolean()),
      wishlist: v.optional(v.boolean()),
      heroSlider: v.optional(v.boolean()),
      deliveryTracking: v.optional(v.boolean()),
      whatsappOrders: v.optional(v.boolean()),
      customDiscounts: v.optional(v.boolean()),
      showBadges: v.optional(v.boolean()),
      orderTrackingLookup: v.optional(v.boolean()),
      announcements: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { features: args.features });
  },
});

export const updateThemeTokens = mutation({
  args: {
    id: v.id("stores"),
    themeTokens: v.object({
      primaryColor: v.optional(v.string()),
      accentColor: v.optional(v.string()),
      fontFamily: v.optional(v.string()),
      cardBorderRadius: v.optional(v.string()),
      cardShadow: v.optional(v.string()),
      headerLayout: v.optional(v.string()),
      footerLayout: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { themeTokens: args.themeTokens });
  },
});

export const remove = mutation({
  args: { id: v.id("stores") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
