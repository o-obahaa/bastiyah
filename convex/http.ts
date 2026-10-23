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

export default http;
