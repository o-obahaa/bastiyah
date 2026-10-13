import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    nameAr: v.optional(v.string()),
    tagline: v.string(),
    taglineAr: v.optional(v.string()),
    description: v.string(),
    descriptionAr: v.optional(v.string()),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    category: v.string(),
    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),
    stock: v.number(),
    images: v.array(v.string()),
    badge: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
    tags: v.array(v.string()),
    specs: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      rating: args.rating ?? 5.0,
      reviewCount: args.reviewCount ?? 1,
      createdAt: new Date().toISOString(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    nameAr: v.optional(v.string()),
    tagline: v.optional(v.string()),
    taglineAr: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    category: v.optional(v.string()),
    stock: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    badge: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    specs: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
