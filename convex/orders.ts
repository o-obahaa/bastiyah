import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByStore = query({
  args: { storeId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    storeId: v.string(),
    orderNumber: v.string(),
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
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      date: new Date().toISOString(),
    });

    // Check if customer already exists for this store, update or create customer
    const existingCustomer = await ctx.db
      .query("customers")
      .withIndex("by_store", (q) => q.eq("storeId", args.storeId))
      .filter((q) => q.eq(q.field("email"), args.customer.email))
      .first();

    if (existingCustomer) {
      await ctx.db.patch(existingCustomer._id, {
        ordersCount: existingCustomer.ordersCount + 1,
        totalSpent: existingCustomer.totalSpent + args.total,
      });
    } else {
      await ctx.db.insert("customers", {
        storeId: args.storeId,
        name: args.customer.fullName,
        email: args.customer.email,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        city: args.customer.city,
        country: args.customer.country,
        ordersCount: 1,
        totalSpent: args.total,
        joinedDate: new Date().toISOString().split("T")[0],
      });
    }

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: { status: string; trackingNumber?: string } = {
      status: args.status,
    };
    if (args.trackingNumber !== undefined) {
      updates.trackingNumber = args.trackingNumber;
    }
    await ctx.db.patch(args.id, updates);
  },
});

export const updateStatusByOrderNumber = mutation({
  args: {
    orderNumber: v.string(),
    status: v.string(),
    trackingNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const cleanNum = args.orderNumber.trim().toUpperCase().replace('#', '');
    const orders = await ctx.db.query("orders").collect();
    const order = orders.find((o) => o.orderNumber.toUpperCase().replace('#', '') === cleanNum || o.orderNumber.toUpperCase().endsWith(cleanNum));

    if (!order) {
      return { success: false, error: `الطلب رقم #${args.orderNumber} غير موجود في المتجر` };
    }

    const updates: { status: string; trackingNumber?: string } = {
      status: args.status,
    };
    if (args.trackingNumber) {
      updates.trackingNumber = args.trackingNumber;
    }

    await ctx.db.patch(order._id, updates);
    return { success: true, order: { ...order, ...updates } };
  },
});

export const getOrderByNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, args) => {
    const cleanNum = args.orderNumber.trim().toUpperCase().replace('#', '');
    const orders = await ctx.db.query("orders").collect();
    return orders.find((o) => o.orderNumber.toUpperCase().replace('#', '') === cleanNum || o.orderNumber.toUpperCase().endsWith(cleanNum)) || null;
  },
});

export const getRecentOrders = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    return await ctx.db.query("orders").order("desc").take(limit);
  },
});
