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
  path: "/whatsapp-session-batch",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { files } = await request.json();
      if (!Array.isArray(files)) {
        return new Response(JSON.stringify({ error: "files array is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      await ctx.runMutation("whatsappAuth:saveBatchSessionFiles" as any, { files });
      return new Response(JSON.stringify({ success: true, count: files.length }), {
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
      const { text, quotedText, orderNumber: explicitOrderNumber } = await request.json();
      if (!text || typeof text !== "string") {
        return new Response(JSON.stringify({ reply: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      const raw = text.trim();

      // Extract order number: prioritize explicit orderNumber mapped from stanzaId, then quotedText, then raw text
      let orderNumber: string | null = explicitOrderNumber ? explicitOrderNumber.toUpperCase().replace('#', '') : null;

      if (!orderNumber && quotedText) {
        const quotedMatch = quotedText.match(/#?([A-Za-z]{3,10}-[0-9]{4,6}|[0-9]{4,6})/i);
        if (quotedMatch) {
          orderNumber = quotedMatch[1].toUpperCase();
        }
      }

      if (!orderNumber) {
        const rawMatch = raw.match(/#?([A-Za-z]{3,10}-[0-9]{4,6}|[0-9]{4,6})/i);
        if (rawMatch) {
          orderNumber = rawMatch[1].toUpperCase();
        }
      }

      const lower = raw.toLowerCase();

      // 1. MAIN INTERACTIVE BOT MENU
      if (["قائمة", "منيو", "menu", "مساعدة", "اوامر", "أوامر", "تعليمات", "help", "commands", "?"].includes(lower)) {
        const menuText =
          `🤖 *بوت إدارة متجر بستية - القائمة التفاعلية:* \n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `أرسل رقم الخيار للتحكم بالمتجر:\n\n` +
          `1️⃣ *عرض أحدث الطلبات* (أرسل 1)\n` +
          `2️⃣ *إحصائيات المبيعات والأرباح* (أرسل 2)\n` +
          `3️⃣ *تأكيد أحدث طلب وارد* (أرسل 3)\n` +
          `4️⃣ *دليل أوامر الشحن والإلغاء* (أرسل 4)\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💡 *للتحكم السريع بأي طلب:*\n` +
          `رد مباشرة على إشعار أي طلب بالرقم:\n` +
          `• 1️⃣ لتأكيد وتجهيز الطلب\n` +
          `• 2️⃣ لشحن الطلب للمندوب\n` +
          `• 3️⃣ لتأكيد التسليم واستلام المبلغ\n` +
          `• 4️⃣ لإلغاء الطلب`;
        return new Response(JSON.stringify({ reply: menuText }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // 2. STORE SALES & REVENUE STATS (Option 2 or 'احصائيات' or 'مبيعات')
      if (["احصائيات", "إحصائيات", "مبيعات", "ارباح", "أرباح", "stats", "revenue"].includes(lower) || (lower === "2" && !orderNumber)) {
        const summary: any = await ctx.runQuery("orders:getStoreSummary" as any, {});
        const statsText =
          `📊 *إحصائيات مبيعات متجر بستية:*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 إجمالي الطلبات: *${summary.totalOrders} طلب*\n` +
          `🟡 قيد المراجعة والتجهيز: *${summary.pendingOrders} طلب*\n` +
          `✅ الطلبات المسلمة بنجاح: *${summary.deliveredOrders} طلب*\n` +
          `❌ الطلبات الملغاة: *${summary.cancelledOrders} طلب*\n` +
          `💵 إجمالي المبيعات المحصلة: *د.ع ${summary.totalRevenue.toLocaleString()}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💡 أرسل *1* لعرض أحدث الطلبات، أو *قائمة* للقائمة الرئيسية.`;
        return new Response(JSON.stringify({ reply: statsText }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // 3. RECENT ORDERS LIST (Option 1 or 'طلبات')
      if (["طلبات", "الطلبات", "orders", "recent"].includes(lower) || (lower === "1" && !orderNumber)) {
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
        listText += `💡 للتحكم بأي طلب: أرسل *تأكيد [رقم الطلب]* أو *شحن [رقم الطلب]*`;
        return new Response(JSON.stringify({ reply: listText }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // 4. CHEAT SHEET (Option 4)
      if (lower === "4" && !orderNumber) {
        const guideText =
          `📖 *دليل أوامر البوت السريعة:*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `• *تأكيد [رقم الطلب]* 👈 قبول وتجهيز الطلب\n` +
          `• *شحن [رقم الطلب] [كود التتبع]* 👈 شحن الطلب\n` +
          `• *تسليم [رقم الطلب]* 👈 تم التوصيل واستلام المبلغ\n` +
          `• *الغاء [رقم الطلب]* 👈 إلغاء الطلب\n` +
          `• *تفاصيل [رقم الطلب]* 👈 عرض محتويات وعنوان الطلب\n` +
          `• *طلبات* 👈 عرض أحدث الطلبات\n` +
          `• *مبيعات* 👈 إحصائيات المبيعات والأرباح\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💡 أرسل *قائمة* للعودة للقائمة التفاعلية.`;
        return new Response(JSON.stringify({ reply: guideText }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // If no order number specified in message or quote, but action number 1-5 sent, resolve to latest order
      let targetOrderNumber = orderNumber;
      if (!targetOrderNumber) {
        const latestOrder: any = await ctx.runQuery("orders:getLatestOrder" as any, {});
        if (latestOrder) {
          targetOrderNumber = latestOrder.orderNumber;
        }
      }

      // If still no order number matched for order actions, prompt user
      if (!targetOrderNumber) {
        const isActionKeyword = /^(تأكيد|تاكيد|تجهيز|قبول|شحن|تسليم|تم|الغاء|إلغاء|تفاصيل|معلومات|confirm|ship|deliver|cancel|info|[1-5])/i.test(raw);
        if (isActionKeyword) {
          return new Response(
            JSON.stringify({
              reply: `⚠️ يرجى تحديد رقم الطلب أو كتابة \`قائمة\` لعرض خيارات البوت.`,
            }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }
        return new Response(JSON.stringify({ reply: null }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 5. CONFIRM / PROCESSING (Option 1 or 'تأكيد')
      if (/^(تأكيد|تاكيد|تجهيز|قبول|موافقة|confirm|1\b)/i.test(raw)) {
        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber: targetOrderNumber,
          status: "processing",
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `✅ *تم تأكيد الطلب #${targetOrderNumber} بنجاح!*\n\nالحالة الآن: *قيد التجهيز والتغليف* 📦\nيمكنك شحنه لاحقاً بإرسال: \`شحن #${targetOrderNumber} [كود التتبع]\` أو الرد برقم 2.`,
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

      // 6. SHIP WITH OPTIONAL TRACKING (Option 2 with order context or 'شحن')
      if (/^(شحن|ارسال|إرسال|ship|2\b)/i.test(raw)) {
        let trackingCode: string | undefined = undefined;
        const stripped = raw
          .replace(/^(شحن|ارسال|إرسال|ship|2\b)/i, "")
          .replace(new RegExp(`#?${targetOrderNumber}`, "gi"), "")
          .trim();
        if (stripped) {
          trackingCode = stripped;
        }

        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber: targetOrderNumber,
          status: "shipped",
          trackingNumber: trackingCode,
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `🚚 *تم شحن الطلب #${targetOrderNumber} بنجاح!*\n\nالحالة الآن: *تم الشحن وتسليمه للمندوب* 🚀${trackingCode ? `\n📍 كود التتبع: \`${trackingCode}\`` : ""}\nتم تحديث لوحة التحكم تلقائياً.`,
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

      // 7. DELIVERED (Option 3 or 'تسليم' / 'تم')
      if (/^(تسليم|تم|وصل|deliver|done|3\b)/i.test(raw)) {
        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber: targetOrderNumber,
          status: "delivered",
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `🎉 *تم تسليم الطلب #${targetOrderNumber} بنجاح!*\n\nالحالة الآن: *تم التوصيل واستلام المبلغ (مكتمل)* ✅`,
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

      // 8. CANCEL (Option 4 or 'الغاء')
      if (/^(الغاء|إلغاء|رفض|cancel|4\b)/i.test(raw)) {
        const res: any = await ctx.runMutation("orders:updateStatusByOrderNumber" as any, {
          orderNumber: targetOrderNumber,
          status: "cancelled",
        });
        if (res.success) {
          return new Response(
            JSON.stringify({
              reply: `❌ *تم إلغاء الطلب #${targetOrderNumber}.*\nتم تحديث حالة الطلب في لوحة التحكم إلى (ملغي).`,
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

      // 9. ORDER DETAILS / INFO (Option 5 or 'تفاصيل')
      if (/^(تفاصيل|معلومات|استعلام|بيانات|info|5\b)/i.test(raw)) {
        const order: any = await ctx.runQuery("orders:getOrderByNumber" as any, { orderNumber: targetOrderNumber });
        if (!order) {
          return new Response(
            JSON.stringify({ reply: `⚠️ لم يتم العثور على تفاصيل الطلب #${targetOrderNumber}. يرجى إرسال: تفاصيل [رقم الطلب]` }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }

        const itemsList = (order.items && order.items.length > 0)
          ? order.items
              .map((it: any, i: number) => `  ${i + 1}. *${it.productName}*\n     الكمية: ${it.quantity} × د.ع ${(it.price || 0).toLocaleString()}`)
              .join("\n")
          : "  • منتجات الطلب مسجلة بالمتجر";

        const addressText = [order.customer?.state, order.customer?.city, order.customer?.address].filter(Boolean).join(" - ");

        const infoMsg =
          `📋 *تفاصيل الطلب المستعلم عنه: #${order.orderNumber}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 *اسم الزبون:* *${order.customer?.fullName || "عميل المتجر"}*\n` +
          `📞 *رقم الهاتف:* ${order.customer?.phone || "غير مسجل"}\n` +
          `📍 *عنوان التوصيل:* ${addressText || "العراق"}\n\n` +
          `📦 *المنتجات المطلوبة:*\n${itemsList}\n\n` +
          `💵 *المبلغ المطلوب تحصيله:* *د.ع ${(order.total || 0).toLocaleString()}*\n` +
          `💳 *طريقة الدفع:* ${order.paymentMethod || "الدفع عند الاستلام"}\n` +
          `📊 *حالة الطلب الحالية:* *${order.status}*\n` +
          (order.trackingNumber ? `🚚 *كود التتبع:* \`${order.trackingNumber}\`\n` : "") +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `⚡ *خيارات التحكم السريع بهذا الطلب #${order.orderNumber}:*\n` +
          `• 1️⃣ تأكيد وقبول الطلب (أرسل 1)\n` +
          `• 2️⃣ شحن الطلب للمندوب (أرسل 2)\n` +
          `• 3️⃣ تم التوصيل واستلام المبلغ (أرسل 3)\n` +
          `• 4️⃣ إلغاء الطلب (أرسل 4)`;
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

/**
 * 4. Register order in Convex cloud from StoreContext or notification dispatch
 */
http.route({
  path: "/register-order",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const order = await request.json();
      if (!order || !order.orderNumber) {
        return new Response(JSON.stringify({ error: "orderNumber is required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const cleanNum = order.orderNumber.trim().toUpperCase().replace('#', '');
      const existing: any = await ctx.runQuery("orders:getOrderByNumber" as any, { orderNumber: cleanNum });

      if (!existing || existing.customer?.fullName === "عميل المتجر") {
        await ctx.runMutation("orders:create" as any, {
          storeId: order.storeId || "panda",
          orderNumber: cleanNum,
          customer: {
            fullName: order.customer?.fullName || "عميل المتجر",
            email: order.customer?.email || `${cleanNum.toLowerCase()}@customer.iq`,
            phone: order.customer?.phone || "",
            address: order.customer?.address || "العراق",
            city: order.customer?.city || "بغداد",
            state: order.customer?.state || "بغداد",
            zipCode: order.customer?.zipCode || "10001",
            country: order.customer?.country || "Iraq",
          },
          items: (order.items || []).map((it: any) => ({
            productId: it.productId || "p1",
            productName: it.productName || "منتج",
            productImage: it.productImage || "",
            price: it.price || 0,
            quantity: it.quantity || 1,
          })),
          subtotal: order.subtotal || order.total || 0,
          discount: order.discount || 0,
          shipping: order.shipping || 0,
          tax: order.tax || 0,
          total: order.total || 0,
          status: order.status || "pending",
          paymentMethod: order.paymentMethod || "Cash on Delivery",
          trackingNumber: order.trackingNumber,
        });
      }

      return new Response(JSON.stringify({ success: true, orderNumber: cleanNum }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
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
