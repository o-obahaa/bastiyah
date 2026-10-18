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

export default http;
