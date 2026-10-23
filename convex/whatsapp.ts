"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sends a real WhatsApp OTP verification code using Meta WhatsApp Business Cloud API.
 * Graph API endpoint: https://graph.facebook.com/v20.0/{PHONE_NUMBER_ID}/messages
 */
export const sendWhatsAppOtp = action({
  args: {
    phone: v.string(), // E.164 without spaces, e.g. "9647701234567"
    code: v.string(),  // 4-digit or 6-digit OTP
    storeName: v.optional(v.string()),
    templateName: v.optional(v.string()),
    languageCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    // Clean phone number (strip '+', spaces, dashes)
    let recipient = args.phone.replace(/\D/g, "");
    if (recipient.startsWith("00")) {
      recipient = recipient.slice(2);
    }

    // Simulation fallback if credentials are not yet saved in Convex Dashboard
    if (!phoneNumberId || !accessToken) {
      console.log(
        `[WhatsApp Simulation] Recipient: ${recipient}, OTP: ${args.code}. (Configure WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN in Convex to send real live WhatsApp messages)`
      );
      return {
        success: true,
        mode: "simulation" as const,
        code: args.code,
        message: "Simulation mode active. Set Convex environment variables to deliver live messages.",
      };
    }

    const templateName = args.templateName || process.env.WHATSAPP_TEMPLATE_NAME || "bastiyah_order_update";
    const languageCode = args.languageCode || "ar";

    // 1. WhatsApp Template message payload matching approved bastiyah_order_update
    const templatePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: args.code,
              },
            ],
          },
        ],
      },
    };

    // 2. Direct session text message fallback
    const directTextPayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: false,
        body: `رمز تسجيل دخولك إلى ${args.storeName || "بسطية"} هو: *${args.code}*\nصالح لمدة 10 دقائق. لا تشارك الرمز مع أي شخص.`,
      },
    };

    try {
      // First attempt template message
      let res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(templatePayload),
      });

      let data = await res.json();

      // If template not found or template error, attempt direct text message
      if (!res.ok) {
        console.warn("Template attempt note, trying text payload:", data?.error?.message);
        res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(directTextPayload),
        });
        data = await res.json();
      }

      if (!res.ok) {
        console.error("Meta WhatsApp Cloud API error:", data);
        return {
          success: false,
          error: data.error?.message || "Failed to deliver WhatsApp message via Meta Cloud API",
          details: data,
        };
      }

      return {
        success: true,
        mode: "live" as const,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: any) {
      console.error("WhatsApp dispatch network error:", err);
      return {
        success: false,
        error: err.message || "Network error contacting Meta WhatsApp Cloud API",
      };
    }
  },
});

/**
 * Sends a generic WhatsApp notification message (e.g. new order alert to store manager).
 */
export const sendWhatsAppMessage = action({
  args: {
    phone: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    let recipient = args.phone.replace(/\D/g, "");
    if (recipient.startsWith("00")) recipient = recipient.slice(2);
    if (recipient.startsWith("0")) recipient = recipient.slice(1);
    if (!recipient.startsWith("964")) recipient = `964${recipient}`;

    if (!phoneNumberId || !accessToken) {
      console.log(`[WhatsApp Simulation] Order alert to ${recipient}:\n${args.message}`);
      return { success: true, mode: "simulation" as const };
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipient,
      type: "text",
      text: {
        preview_url: false,
        body: args.message,
      },
    };

    try {
      const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      return { success: res.ok, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
});

export const getPhoneInfo = action({
  args: {},
  handler: async () => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !accessToken) {
      return { configured: false, error: "Missing WhatsApp credentials in Convex" };
    }
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    return { configured: true, data };
  },
});

export const registerPhoneNumber = action({
  args: { pin: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    if (!phoneNumberId || !accessToken) {
      return { success: false, error: "Missing WhatsApp credentials in Convex" };
    }
    const pin = args.pin || "123456";
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/register`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        pin,
      }),
    });
    const data = await res.json();
    return data;
  },
});

