import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

/**
 * 1. Meta WhatsApp Cloud API Webhook:
 * - GET: Webhook verification handshake with Meta (hub.challenge / hub.verify_token)
 * - POST: Incoming message updates and delivery receipts (sent, delivered, read)
 */
http.route({
  path: "/whatsapp-webhook",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    // Secret token agreed between you and Meta (defaults to bastiyah_wa_secret_2026)
    const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || "bastiyah_wa_secret_2026";

    if (mode === "subscribe" && token === expectedToken) {
      console.log("WhatsApp Webhook verified successfully by Meta!");
      return new Response(challenge || "", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    console.warn("WhatsApp Webhook verification failed: token mismatch", {
      receivedToken: token,
      expectedToken,
    });
    return new Response("Forbidden", { status: 403 });
  }),
});

http.route({
  path: "/whatsapp-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      console.log("WhatsApp Webhook event received:", JSON.stringify(payload));

      // Return 200 OK immediately as required by Meta within 3 seconds
      return new Response(JSON.stringify({ status: "success", received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Error processing WhatsApp Webhook POST event:", err);
      return new Response(JSON.stringify({ status: "error" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * 2. Self-Hosted WhatsApp Session Persistence:
 * Syncs Baileys auth files to Convex so that Render never loses session on restart or sleep.
 */
http.route({
  path: "/whatsapp-session",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const files = await ctx.runQuery("whatsappAuth:getAllSessionFiles" as any, {});
    return new Response(JSON.stringify(files), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }),
});

http.route({
  path: "/whatsapp-session",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { key, value } = await request.json();
      if (!key || value === undefined) {
        return new Response(JSON.stringify({ error: "key and value are required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await ctx.runMutation("whatsappAuth:saveSessionFile" as any, { key, value });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

http.route({
  path: "/whatsapp-session",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const key = url.searchParams.get("key");

      if (key) {
        await ctx.runMutation("whatsappAuth:removeSessionFile" as any, { key });
      } else {
        await ctx.runMutation("whatsappAuth:clearAllSessionFiles" as any, {});
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

/**
 * 3. WhatsApp Interactive Store Management Commands:
 * Allows the store manager to manage orders directly through WhatsApp conversation!
 * Supports: تأكيد, شحن, تسليم, الغاء, تفاصيل, طلبات, مساعدة
 */
http.route({
  path: "/whatsapp-command",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { text, quotedText } = await request.json();
      if (!text || typeof text !== "string") {
        return new Response(JSON.stringify({ reply: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const raw = text.trim();
      const combined = `${raw} ${quotedText || ""}`;

      // Extract order number from text or quoted text (e.g. #PAN-88240 or PAN-88240 or #88240)
      const orderMatch = combined.match(/#?([A-Za-z0-9]+-[0-9]+|[0-9]{4,6})/);
      const orderNumber = orderMatch ? orderMatch[1].toUpperCase() : null;

      const lower = raw.toLowerCase();

      // 1. HELP MENU
      if (["مساعدة", "اوامر", "أوامر", "تعليمات", "help", "commands", "?"].includes(lower)) {
        const helpText =
          `🤖 *أوامر إدارة متجر بستية عبر واتساب:*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `• *تأكيد [رقم الطلب]* 👈 تحويل لقيد التجهيز\n` +
          `• *شحن [رقم الطلب] [كود التتبع]* 👈 تعيين الشحن والتتبع\n` +
          `• *تسليم [رقم الطلب]* 👈 تم التوصيل للزبون\n` +
          `• *الغاء [رقم الطلب]* 👈 إلغاء الطلب\n` +
          `• *تفاصيل [رقم الطلب]* 👈 عرض بيانات ومحتوى الطلب\n` +
          `• *طلبات* 👈 عرض أحدث الطلبات المسجلة\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💡 *مثال:* تأكيد #PAN-88240 أو الرد على إشعار الطلب بكلمة (تأكيد) أو (شحن)`;
        return new Response(JSON.stringify({ reply: helpText }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // 2. RECENT ORDERS LIST
      if (["طلبات", "الطلبات", "orders", "recent"].includes(lower)) {
        const recent: any[] = await ctx.runQuery("orders:getRecentOrders" as any, { limit: 5 });
        if (!recent || recent.length === 0) {
          return new Response(
            JSON.stringify({ reply: "📋 لا توجد طلبات مسجلة في المتجر حالياً." }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }
        const statusMap: Record<string, string> = {
          pending: "قيد المراجعة 🟡",
          processing: "قيد التجهيز 📦",
          shipped: "تم الشحن 🚚",
          delivered: "تم التوصيل ✅",
          cancelled: "ملغي ❌",
        };
        let listText = `📋 *أحدث 5 طلبات في المتجر:*\n━━━━━━━━━━━━━━━━━━━━\n`;
        recent.forEach((o, i) => {
          listText += `${i + 1}. *#${o.orderNumber}* (${o.customer.fullName})\n   المبلغ: د.ع ${o.total.toLocaleString()} | الحالة: ${statusMap[o.status] || o.status}\n\n`;
        });
        listText += `💡 للتحكم بأي طلب أرسل: *تأكيد [رقم الطلب]* أو *شحن [رقم الطلب]*`;
        return new Response(JSON.stringify({ reply: listText }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // If no order number matched for order actions, check if it's an action keyword
      if (!orderNumber) {
        const isActionKeyword = /^(تأكيد|تاكيد|تجهيز|قبول|شحن|تسليم|تم|الغاء|إلغاء|تفاصيل|معلومات|confirm|ship|deliver|cancel|info)/i.test(raw);
        if (isActionKeyword) {
          return new Response(
            JSON.stringify({
              reply: `⚠️ يرجى تحديد رقم الطلب مع الأمر.\nمثال: \`تأكيد #PAN-88240\` أو اكتب \`مساعدة\` لعرض قائمة الأوامر.`,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }
        return new Response(JSON.stringify({ reply: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 3. CONFIRM / PROCESSING
      if (/^(تأكيد|تاكيد|تجهيز|قبول|موافقة|confirm|1\b)/i.test(raw)) {
        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber,
          status: "processing",
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `✅ *تم تأكيد الطلب #${orderNumber} بنجاح!*\n\nالحالة الآن: *قيد التجهيز والتغليف* 📦\nيمكنك شحنه لاحقاً بإرسال: \`شحن #${orderNumber} [كود التتبع]\``,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        } else {
          return new Response(JSON.stringify({ reply: `⚠️ ${res.error}` }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      }

      // 4. SHIP WITH OPTIONAL TRACKING
      if (/^(شحن|ارسال|إرسال|ship)/i.test(raw)) {
        const parts = raw.split(/\s+/).filter(Boolean);
        const trackingCode = parts.length >= 3 ? parts.slice(2).join(" ") : undefined;

        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber,
          status: "shipped",
          trackingNumber: trackingCode,
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `🚚 *تم شحن الطلب #${orderNumber} بنجاح!*\n\nالحالة الآن: *تم الشحن وتسليمه للمندوب* 🚀${trackingCode ? `\n📍 كود التتبع: \`${trackingCode}\`` : ""}\nتم تحديث لوحة التحكم تلقائياً.`,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        } else {
          return new Response(JSON.stringify({ reply: `⚠️ ${res.error}` }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      }

      // 5. DELIVERED
      if (/^(تسليم|تم|وصل|deliver|done)/i.test(raw)) {
        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber,
          status: "delivered",
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `🎉 *تم تسليم الطلب #${orderNumber} بنجاح!*\n\nالحالة الآن: *تم التوصيل واستلام المبلغ (مكتمل)* ✅`,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        } else {
          return new Response(JSON.stringify({ reply: `⚠️ ${res.error}` }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      }

      // 6. CANCEL
      if (/^(الغاء|إلغاء|رفض|cancel)/i.test(raw)) {
        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber,
          status: "cancelled",
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `❌ *تم إلغاء الطلب #${orderNumber}.*\nتم تحديث حالة الطلب في لوحة التحكم إلى (ملغي).`,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        } else {
          return new Response(JSON.stringify({ reply: `⚠️ ${res.error}` }), {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          });
        }
      }

      // 7. ORDER DETAILS / INFO
      if (/^(تفاصيل|معلومات|استعلام|بيانات|info)/i.test(raw)) {
        const order: any = await ctx.runQuery("orders:getOrderByNumber" as any, { orderNumber });
        if (!order) {
          return new Response(
            JSON.stringify({ reply: `⚠️ لم يتم العثور على طلب برقم #${orderNumber}.` }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }

        const itemsList = order.items
          .map((it: any, i: number) => `  ${i + 1}. *${it.productName}* × ${it.quantity}`)
          .join("\n");
        const infoMsg =
          `📋 *تفاصيل الطلب #${order.orderNumber}:*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 *الزبون:* ${order.customer.fullName} (${order.customer.phone})\n` +
          `📍 *العنوان:* ${order.customer.city} - ${order.customer.address}\n\n` +
          `📦 *المنتجات:*\n${itemsList}\n\n` +
          `💵 *الإجمالي:* د.ع ${order.total.toLocaleString()}\n` +
          `📊 *الحالة:* ${order.status}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💡 للتحكم: أرسل *تأكيد #${order.orderNumber}* أو *شحن #${order.orderNumber}*`;
        return new Response(JSON.stringify({ reply: infoMsg }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      return new Response(JSON.stringify({ reply: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
