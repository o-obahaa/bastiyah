import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    email: v.string(),
    avatar: v.string(),
    city: v.string(),
    country: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("customers", {
      ...args,
      ordersCount: 0,
      totalSpent: 0,
      joinedDate: new Date().toISOString().split("T")[0],
    });
  },
});
