import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("coupons")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.string(),
    code: v.string(),
    discountPercent: v.number(),
    minSpend: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("coupons")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .filter((q) => q.eq(q.field("code"), args.code.toUpperCase().trim()))
      .first();

    if (existing) {
      throw new Error(`Coupon code ${args.code} already exists for this store`);
    }

    return await ctx.db.insert("coupons", {
      ...args,
      code: args.code.toUpperCase().trim(),
      active: true,
    });
  },
});

export const toggleStatus = mutation({
  args: {
    id: v.id("coupons"),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { active: args.active });
  },
});
