import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Returns all custom WhatsApp templates saved across the platform.
 */
export const getTemplates = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("whatsapp_templates").collect();
  },
});

/**
 * Upserts a custom WhatsApp template (from Site Owner or Store Manager).
 */
export const saveTemplate = mutation({
  args: {
    templateId: v.string(),
    content: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("whatsapp_templates")
      .withIndex("by_templateId", (q) => q.eq("templateId", args.templateId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        enabled: args.enabled,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("whatsapp_templates", {
        templateId: args.templateId,
        content: args.content,
        enabled: args.enabled,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Resets a custom template override, reverting to platform default.
 */
export const resetTemplate = mutation({
  args: {
    templateId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("whatsapp_templates")
      .withIndex("by_templateId", (q) => q.eq("templateId", args.templateId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return true;
  },
});
