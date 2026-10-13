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
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { design: args.design });
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

export const remove = mutation({
  args: { id: v.id("stores") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
