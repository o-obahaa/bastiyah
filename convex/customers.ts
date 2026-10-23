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

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("customers")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
  },
});

export const upsertCustomer = mutation({
  args: {
    storeId: v.string(),
    name: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    state: v.optional(v.string()),
    avatar: v.optional(v.string()),
    city: v.string(),
    country: v.string(),
    isPhoneVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customers")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .filter((q) => q.eq(q.field("phone"), args.phone))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email || existing.email,
        phone: args.phone,
        address: args.address || existing.address,
        state: args.state || existing.state,
        city: args.city,
        isPhoneVerified: args.isPhoneVerified ?? true,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("customers", {
        storeId: args.storeId,
        name: args.name,
        phone: args.phone,
        email: args.email || `${args.phone.slice(-6)}@customer.iq`,
        avatar: args.avatar || "ANONYMOUS",
        city: args.city,
        state: args.state,
        address: args.address,
        country: args.country,
        ordersCount: 0,
        totalSpent: 0,
        joinedDate: new Date().toISOString().split("T")[0],
        isPhoneVerified: args.isPhoneVerified ?? true,
      });
    }
  },
});

