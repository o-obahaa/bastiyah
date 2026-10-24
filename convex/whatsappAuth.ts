import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Returns all WhatsApp auth session files stored in Convex.
 */
export const getAllSessionFiles = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("whatsapp_auth").collect();
    const result: Record<string, string> = {};
    for (const record of records) {
      result[record.key] = record.value;
    }
    return result;
  },
});

/**
 * Upserts a WhatsApp auth session file (e.g. creds.json or a key).
 */
export const saveSessionFile = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("whatsapp_auth")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("whatsapp_auth", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
      });
    }
    return { success: true };
  },
});

/**
 * Upserts multiple WhatsApp auth session files in a single fast atomic mutation.
 */
export const saveBatchSessionFiles = mutation({
  args: {
    files: v.array(v.object({ key: v.string(), value: v.string() })),
  },
  handler: async (ctx, args) => {
    for (const file of args.files) {
      const existing = await ctx.db
        .query("whatsapp_auth")
        .withIndex("by_key", (q) => q.eq("key", file.key))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          value: file.value,
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.insert("whatsapp_auth", {
          key: file.key,
          value: file.value,
          updatedAt: Date.now(),
        });
      }
    }
    return { success: true, count: args.files.length };
  },
});

/**
 * Removes a specific auth session file.
 */
export const removeSessionFile = mutation({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("whatsapp_auth")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { success: true };
  },
});

/**
 * Clears the entire WhatsApp session from Convex on logout.
 */
export const clearAllSessionFiles = mutation({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("whatsapp_auth").collect();
    for (const record of records) {
      await ctx.db.delete(record._id);
    }
    return { success: true, count: records.length };
  },
});
