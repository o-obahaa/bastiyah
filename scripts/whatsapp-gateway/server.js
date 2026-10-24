import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import NodeCache from 'node-cache';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  generateMessageIDV2,
} from '@whiskeysockets/baileys';

// Global retry counter cache to resolve session drops and prevent retry loops
const msgRetryCounterCache = new NodeCache({ stdTTL: 300, useClones: false });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_session');

const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL || 'https://fine-lemming-449.convex.site';
const GATEWAY_PUBLIC_URL = process.env.GATEWAY_URL || 'https://bastiyah-whatsapp.onrender.com';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let sock = null;
let currentQrDataUrl = null;
let connectionStatus = 'DISCONNECTED'; // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'
let connectedPhone = null;

// Map sent notification messageId -> orderNumber for 100% accurate reply tracking
const sentOrderMessages = new Map();

// In-memory sliding activities log for Owner WhatsApp Inbox
const gatewayActivities = [];

function recordGatewayActivity(act) {
  if (!act || !act.content) return;
  const entry = {
    ...act,
    id: act.id || `act-gw-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: act.timestamp || new Date().toISOString(),
  };
  gatewayActivities.unshift(entry);
  if (gatewayActivities.length > 200) gatewayActivities.pop();
  return entry;
}

// In-memory + persisted message cache to resolve "Waiting for this message" decryption retries
const recentMessages = new Map();
const recentMessageTexts = new Map();
const CACHE_FILE = path.join(AUTH_DIR, 'messages_cache.json');

function loadMessageCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      if (Array.isArray(data)) {
        for (const [id, text] of data) {
          recentMessageTexts.set(id, text);
        }
      }
    }
  } catch (e) {}
}

function saveMessage(id, message, text) {
  if (!id) return;
  if (message) recentMessages.set(id, message);
  if (text) recentMessageTexts.set(id, text);

  // Maintain sliding window of 500 messages
  if (recentMessages.size > 500) {
    const firstKey = recentMessages.keys().next().value;
    recentMessages.delete(firstKey);
  }
  if (recentMessageTexts.size > 500) {
    const firstKey = recentMessageTexts.keys().next().value;
    recentMessageTexts.delete(firstKey);
  }

  // Debounced persistence to AUTH_DIR
  try {
    const entries = Array.from(recentMessageTexts.entries()).slice(-200);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(entries), 'utf8');
  } catch (e) {}
}

loadMessageCache();

// Universal Custom WhatsApp Templates Cache & Persistence
const TEMPLATES_FILE = path.join(AUTH_DIR, 'custom_templates.json');
let gatewayCustomTemplates = {};

function loadGatewayTemplates() {
  try {
    if (fs.existsSync(TEMPLATES_FILE)) {
      const data = JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf8'));
      if (data && typeof data === 'object') {
        gatewayCustomTemplates = data;
      }
    }
  } catch (e) {}
}

function saveGatewayTemplates() {
  try {
    fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(gatewayCustomTemplates), 'utf8');
  } catch (e) {}
}

loadGatewayTemplates();

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

/**
 * 1. Restore WhatsApp session files from Convex database on container startup.
 * This guarantees the user NEVER has to scan the QR code again across restarts or deploys.
 */
async function restoreSessionFromConvex() {
  try {
    const res = await fetch(`${CONVEX_SITE_URL}/whatsapp-session`);
    if (res.ok) {
      const files = await res.json();
      const fileNames = Object.keys(files);
      if (fileNames.length > 0) {
        console.log(`[Bastiyah Gateway] 🔄 Restoring ${fileNames.length} session files from Convex...`);
        for (const [filename, content] of Object.entries(files)) {
          const filePath = path.join(AUTH_DIR, filename);
          fs.writeFileSync(filePath, content, 'utf8');
        }
        console.log(`[Bastiyah Gateway] ✅ Session successfully restored from Convex! No QR scan needed.`);
        return true;
      }
    }
  } catch (err) {
    console.warn('[Bastiyah Gateway] Could not restore session from Convex:', err.message);
  }
  return false;
}

function normalizeIraqiPhone(phone) {
  if (!phone) return '';
  let clean = String(phone).replace(/\D/g, '');
  if (clean.startsWith('00')) clean = clean.slice(2);
  if (clean.startsWith('964')) clean = clean.slice(3);
  if (clean.startsWith('0')) clean = clean.slice(1);
  return `964${clean}`;
}

/**
 * Sync a single auth file to Convex cloud persistence (e.g. creds.json).
 */
async function syncSingleFileToConvex(filename) {
  try {
    const fullPath = path.join(AUTH_DIR, filename);
    if (!fs.existsSync(fullPath)) return;
    const content = fs.readFileSync(fullPath, 'utf8');
    await fetch(`${CONVEX_SITE_URL}/whatsapp-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: filename, value: content }),
    }).catch(() => {});
  } catch (err) {}
}

let syncBatchTimeout = null;

/**
 * 2. Backup session files from AUTH_DIR into Convex database via fast batch API.
 * Uses 1.2s debounce to avoid overwhelming Node event loop or Convex during handshake.
 */
async function syncAllAuthFilesToConvex() {
  if (syncBatchTimeout) clearTimeout(syncBatchTimeout);
  syncBatchTimeout = setTimeout(async () => {
    try {
      if (!fs.existsSync(AUTH_DIR)) return;
      const files = fs.readdirSync(AUTH_DIR).filter((f) => f.endsWith('.json'));
      if (files.length === 0) return;

      const batch = [];
      for (const f of files) {
        const fullPath = path.join(AUTH_DIR, f);
        const content = fs.readFileSync(fullPath, 'utf8');
        batch.push({ key: f, value: content });
      }

      // Try batch endpoint first
      const res = await fetch(`${CONVEX_SITE_URL}/whatsapp-session-batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: batch }),
      }).catch(() => null);

      if (res && res.ok) {
        console.log(`[Bastiyah Gateway] 💾 Synced ${batch.length} session files to Convex cloud persistence (batch mode).`);
        return;
      }

      // Fallback: chunked parallel sync (5 at a time)
      for (let i = 0; i < batch.length; i += 5) {
        const chunk = batch.slice(i, i + 5);
        await Promise.all(
          chunk.map((item) =>
            fetch(`${CONVEX_SITE_URL}/whatsapp-session`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            }).catch(() => {})
          )
        );
      }
      console.log(`[Bastiyah Gateway] 💾 Synced ${batch.length} session files to Convex cloud persistence.`);
    } catch (err) {
      console.warn('[Bastiyah Gateway] Error syncing auth files to Convex:', err.message);
    }
  }, 1200);
}

/**
 * 3. Clear session files from Convex on manual logout.
 */
async function clearConvexSession() {
  try {
    await fetch(`${CONVEX_SITE_URL}/whatsapp-session`, {
      method: 'DELETE',
    });
    console.log('[Bastiyah Gateway] 🗑️ Cleared Convex session storage.');
  } catch (err) {
    console.warn('[Bastiyah Gateway] Error clearing Convex session:', err.message);
  }
}

async function connectToWhatsApp() {
  // First attempt restoring any existing session from Convex
  await restoreSessionFromConvex();

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[Bastiyah Gateway] Initializing WhatsApp engine v${version.join('.')} (latest: ${isLatest})...`);

  const logger = pino({ level: 'silent' });

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    msgRetryCounterCache,
    logger,
    printQRInTerminal: true,
    browser: ['Bastiyah Store', 'Chrome', '124.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
    syncFullHistory: false,
    markOnlineOnConnect: false, // Ensures mobile devices fire notifications and chimes without suppression
    retryRequestDelayMs: 250,
    maxMsgRetryCount: 5,
    getMessage: async (key) => {
      if (!key?.id) return undefined;
      const cachedMsg = recentMessages.get(key.id);
      if (cachedMsg) return cachedMsg;
      const cachedText = recentMessageTexts.get(key.id);
      if (cachedText) {
        return { conversation: cachedText };
      }
      return undefined;
    },
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    syncSingleFileToConvex('creds.json');
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      connectionStatus = 'WAITING_FOR_QR_SCAN';
      currentQrDataUrl = await qrcode.toDataURL(qr, {
        width: 320,
        margin: 2,
        color: { dark: '#022c22', light: '#ffffff' },
      });
      console.log('\n[Bastiyah Gateway] 👉 New WhatsApp QR Code generated! Open http://localhost:' + PORT + ' to scan.\n');
    }

    if (connection === 'connecting') {
      connectionStatus = 'CONNECTING';
      console.log('[Bastiyah Gateway] Connecting to WhatsApp servers...');
    }

    if (connection === 'open') {
      connectionStatus = 'CONNECTED';
      currentQrDataUrl = null;
      connectedPhone = sock?.user?.id ? sock.user.id.split(':')[0] : 'Unknown';
      console.log(`\n✅ [Bastiyah Gateway] Successfully connected to WhatsApp! Phone: +${connectedPhone}\n`);
      // Sync keys and credentials to Convex cloud database in background
      syncAllAuthFilesToConvex();
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      connectionStatus = 'DISCONNECTED';
      connectedPhone = null;

      console.log(`[Bastiyah Gateway] Connection closed. Reason code: ${statusCode}. Logged out: ${isLoggedOut}`);

      // NEVER clear Convex session files on automatic disconnect!
      // This protects the session during container deploys, restarts, or momentary network drops.
      if (isLoggedOut) {
        console.log('[Bastiyah Gateway] WhatsApp session logged out by server. Preparing local state for new QR...');
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        } catch (e) {}
        setTimeout(connectToWhatsApp, 2500);
      } else {
        setTimeout(connectToWhatsApp, 3000);
      }
    }
  });

  // 4. Interactive WhatsApp Commands Listener (Manage Orders via Chat)
  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      if (!messages || messages.length === 0) return;

      // Cache all messages for retry receipts
      for (const msg of messages) {
        if (msg.key?.id) {
          const txt = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
          saveMessage(msg.key.id, msg.message, txt);
        }
      }

      const m = messages[0];

      if (!m.message || m.key.fromMe || m.key.remoteJid === 'status@broadcast') return;

      const senderJid = m.key.remoteJid;
      const incomingText = m.message.conversation || m.message.extendedTextMessage?.text || '';
      const stanzaId = m.message.extendedTextMessage?.contextInfo?.stanzaId;
      const mappedOrderNumber = stanzaId ? sentOrderMessages.get(stanzaId) : undefined;
      const quotedText =
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation ||
        m.message.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.text ||
        '';

      if (!incomingText.trim()) return;

      console.log(`[Bastiyah Gateway] 💬 Incoming message from ${senderJid}: "${incomingText}" (mappedOrder: ${mappedOrderNumber || 'none'})`);

      // Record inbound message for Owner Panel
      recordGatewayActivity({
        direction: 'inbound',
        storeId: 'store-1',
        storeName: 'متجر بسطية',
        storeSlug: 'panda',
        recipientName: senderJid ? `+${senderJid.replace('@s.whatsapp.net', '')}` : 'زبون المتجر',
        recipientPhone: senderJid ? `+${senderJid.replace('@s.whatsapp.net', '')}` : '',
        categoryLabelAr: 'رسالة / رد وارد من الزبون',
        categoryLabelEn: 'Inbound Customer Reply',
        content: incomingText,
        status: 'received',
        orderNumber: mappedOrderNumber,
      });

      // Forward to Convex WhatsApp command handler
      const res = await fetch(`${CONVEX_SITE_URL}/whatsapp-command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: incomingText,
          quotedText,
          orderNumber: mappedOrderNumber,
          senderPhone: senderJid ? senderJid.replace('@s.whatsapp.net', '') : '',
        }),
      });

      if (res.ok) {
        const { reply } = await res.json().catch(() => ({}));
        if (reply && typeof reply === 'string') {
          const sentReply = await sock.sendMessage(senderJid, { text: reply }, { quoted: m });
          if (sentReply?.key?.id) {
            saveMessage(sentReply.key.id, sentReply.message, reply);
          }
          console.log(`[Bastiyah Gateway] 🤖 Replied to ${senderJid} with command response.`);
        }
      }
    } catch (err) {
      console.warn('[Bastiyah Gateway] Error processing incoming command message:', err.message);
    }
  });
}

// 1. Dashboard Web UI for QR Code scanning
app.get('/', (req, res) => {
  const isConnected = connectionStatus === 'CONNECTED';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>بوابة واتساب بسطية | Bastiyah WhatsApp Gateway</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Alexandria', sans-serif; }
  </style>
</head>
<body class="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
  <div class="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
    <div class="flex items-center justify-center gap-2">
      <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-black">
        💬
      </div>
      <h1 class="text-xl font-black">بوابة واتساب المباشرة</h1>
    </div>

    ${
      isConnected
        ? `
      <div class="p-6 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 space-y-3">
        <div class="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto shadow-inner">
          ✓
        </div>
        <h2 class="text-base font-bold text-emerald-300">الرقم متصل وجاهز للإرسال!</h2>
        <p class="text-xs text-slate-300 font-mono" dir="ltr">+${connectedPhone}</p>
        <div class="pt-2">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-bold">
            🔒 الجلسة محفوظة بالسحابة (لن تطلب مسح QR مرة أخرى)
          </span>
        </div>
      </div>

      <div class="pt-2">
        <form action="/logout" method="POST">
          <button type="submit" class="w-full py-2.5 px-4 bg-slate-900 hover:bg-rose-950/60 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-bold text-slate-400 transition-colors">
            فصل الرقم / إعادة الربط برقم آخر
          </button>
        </form>
      </div>
    `
        : `
      <div class="space-y-4">
        <p class="text-xs text-slate-400 leading-relaxed">
          افتح تطبيق <strong class="text-white">واتساب</strong> في هاتفك > اضغط على <strong class="text-white">الأجهزة المرتبطة (Linked Devices)</strong> > <strong class="text-white">ربط جهاز</strong>، ثم امسح الرمز أدناه:
        </p>

        <div class="bg-white p-4 rounded-2xl inline-block shadow-lg mx-auto">
          ${
            currentQrDataUrl
              ? `<img src="${currentQrDataUrl}" alt="Scan QR Code" class="w-64 h-64 mx-auto" />`
              : `<div class="w-64 h-64 flex flex-col items-center justify-center text-slate-400 text-xs gap-2">
                  <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري إنشاء رمز الـ QR...</span>
                </div>`
          }
        </div>

        <div class="flex items-center justify-center gap-2 text-[11px] text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>يتم تحديث الرمز تلقائياً - المسح لمرة واحدة فقط</span>
        </div>
      </div>
    `
    }

    <div class="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
      <span>الحالة: <strong class="${isConnected ? 'text-emerald-400' : 'text-amber-400'}">${connectionStatus}</strong></span>
      <span>المنفذ: 3001</span>
    </div>
  </div>

  <script>
    // Auto-refresh until connected
    ${!isConnected ? `setTimeout(() => window.location.reload(), 8000);` : ''}
  </script>
</body>
</html>`;

  res.send(html);
});

// 2. Status Endpoint
app.get('/status', (req, res) => {
  res.json({
    connected: connectionStatus === 'CONNECTED',
    status: connectionStatus,
    phone: connectedPhone,
    hasQr: Boolean(currentQrDataUrl),
  });
});

// QR shortcut
app.get('/qr', (req, res) => {
  res.redirect('/');
});

// Live Activities for Owner Panel
app.get('/activities', (req, res) => {
  res.json({
    success: true,
    activities: gatewayActivities,
  });
});

app.post('/log-activity', (req, res) => {
  if (req.body && req.body.content) {
    recordGatewayActivity(req.body);
  }
  res.json({ success: true });
});

// Universal Templates synchronization across Owner & Store Manager panels
app.get('/templates', (req, res) => {
  res.json({
    success: true,
    templates: gatewayCustomTemplates,
  });
});

app.post('/templates', (req, res) => {
  try {
    const { templateId, content, enabled, fullMap } = req.body || {};
    if (fullMap && typeof fullMap === 'object') {
      gatewayCustomTemplates = { ...gatewayCustomTemplates, ...fullMap };
      saveGatewayTemplates();
      return res.json({ success: true, templates: gatewayCustomTemplates });
    }
    if (templateId) {
      if (content === '' || content === null) {
        // Revert to factory default
        delete gatewayCustomTemplates[templateId];
      } else {
        gatewayCustomTemplates[templateId] = {
          content,
          enabled: enabled !== undefined ? enabled : gatewayCustomTemplates[templateId]?.enabled ?? true,
          updatedAt: Date.now(),
        };
      }
      saveGatewayTemplates();
      return res.json({ success: true, templates: gatewayCustomTemplates });
    }
    res.status(400).json({ success: false, error: 'templateId or fullMap is required' });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// 3. Send WhatsApp OTP endpoint
app.post('/send-otp', async (req, res) => {
  try {
    const { phone, code, storeName } = req.body;

    if (!phone || !code) {
      return res.status(400).json({ success: false, error: 'phone and code are required' });
    }

    if (connectionStatus !== 'CONNECTED' || !sock) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp gateway is not connected. Please scan QR at gateway URL',
      });
    }

    // Clean and strictly normalize phone number
    const cleanPhone = normalizeIraqiPhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Invalid recipient phone number' });
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;
    let targetJid = jid;

    // Pre-check registration & resolve canonical JID
    try {
      const [onWa] = await sock.onWhatsApp(jid);
      if (onWa && onWa.exists && onWa.jid) {
        targetJid = onWa.jid;
      }
    } catch (e) {}

    const store = storeName || 'بسطية';
    const messageText = `مرحباً بك في *${store}* 🛍️\n\nرمز تسجيل دخولك إلى حسابك هو:\n*${code}*\n\n(الرمز صالح لمدة 10 دقائق. لا تشارك الرمز مع أي شخص).`;

    // 1. Prime the recipient session & presence to prevent "Waiting for this message" delays
    await sock.presenceSubscribe(targetJid).catch(() => {});
    await sock.sendPresenceUpdate('composing', targetJid).catch(() => {});

    // 2. Pre-generate and cache message ID before sending so instant retry finds it
    const messageId = generateMessageIDV2(sock?.user?.id);
    saveMessage(messageId, { conversation: messageText }, messageText);

    // 3. Send WhatsApp message with pre-registered messageId
    const sent = await sock.sendMessage(targetJid, { text: messageText }, { messageId });
    if (sent?.key?.id && sent.key.id !== messageId) {
      saveMessage(sent.key.id, sent.message, messageText);
    }

    const finalMsgId = sent?.key?.id || messageId;
    console.log(`[Bastiyah Gateway] ✅ OTP [${code}] dispatched to ${cleanPhone} via WhatsApp! MsgId: ${finalMsgId}`);

    return res.json({
      success: true,
      messageId: finalMsgId,
      recipient: cleanPhone,
    });
  } catch (err) {
    console.error('[Bastiyah Gateway] Error sending WhatsApp message:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch WhatsApp message',
    });
  }
});

// 4. Send Custom Message / Order Notification endpoint
app.post('/send-message', async (req, res) => {
  try {
    const { phone, message, category, orderNumber, recipientName, storeName, storeSlug, storeId } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }

    if (connectionStatus !== 'CONNECTED' || !sock) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp gateway is not connected. Please scan QR at gateway URL',
      });
    }

    // Clean and strictly normalize phone number
    const cleanPhone = normalizeIraqiPhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ success: false, error: 'Invalid recipient phone number' });
    }

    const jid = `${cleanPhone}@s.whatsapp.net`;
    let targetJid = jid;

    // Pre-check registration & resolve canonical JID
    try {
      const [onWa] = await sock.onWhatsApp(jid);
      if (onWa && onWa.exists && onWa.jid) {
        targetJid = onWa.jid;
      }
    } catch (e) {}

    // 1. Prime the recipient session & presence to prevent "Waiting for this message" delays
    await sock.presenceSubscribe(targetJid).catch(() => {});
    await sock.sendPresenceUpdate('composing', targetJid).catch(() => {});

    // 2. Pre-generate and cache message ID before sending so instant retry finds it
    const messageId = generateMessageIDV2(sock?.user?.id);
    saveMessage(messageId, { conversation: message }, message);

    // 3. Send WhatsApp message with pre-registered messageId
    const sent = await sock.sendMessage(targetJid, { text: message }, { messageId });
    if (sent?.key?.id && sent.key.id !== messageId) {
      saveMessage(sent.key.id, sent.message, message);
    }

    const resolvedMsgId = sent?.key?.id || messageId;

    // Map WhatsApp message ID to orderNumber for 100% exact reply matching
    const orderMatch = orderNumber ? [null, orderNumber] : message.match(/#([A-Za-z0-9]+-[0-9]+|[0-9]{4,6})/);
    const finalOrderNumber = orderMatch ? orderMatch[1].toUpperCase() : undefined;
    if (finalOrderNumber && resolvedMsgId) {
      sentOrderMessages.set(resolvedMsgId, finalOrderNumber);
    }

    // Record outbound activity for Owner WhatsApp Inbox
    const isCustomer = category === 'customer_confirmation' || category === 'customer_notification';
    recordGatewayActivity({
      direction: 'outbound',
      storeId: storeId || 'store-1',
      storeName: storeName || 'متجر بسطية',
      storeSlug: storeSlug || 'panda',
      recipientName: recipientName || (isCustomer ? 'زبون المتجر' : 'مدير المتجر'),
      recipientPhone: `+${cleanPhone}`,
      categoryLabelAr: isCustomer ? 'تأكيد استلام الطلب للزبون' : 'إشعار صادر لمدير المتجر',
      categoryLabelEn: isCustomer ? 'Customer Confirmation' : 'Outbound Store Alert',
      content: message,
      status: 'sent',
      orderNumber: finalOrderNumber,
    });

    console.log(`[Bastiyah Gateway] ✅ Message dispatched to ${recipientName || (isCustomer ? 'customer' : 'manager')} [${cleanPhone}] via WhatsApp! MsgId: ${resolvedMsgId}`);

    return res.json({
      success: true,
      messageId: resolvedMsgId,
      recipient: cleanPhone,
    });
  } catch (err) {
    console.error('[Bastiyah Gateway] Error sending WhatsApp message:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to dispatch WhatsApp message',
    });
  }
});

// 5. Logout / Reset Endpoint
app.post('/logout', async (req, res) => {
  try {
    if (sock) {
      await sock.logout();
    }
  } catch (e) {}
  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (e) {}
  await clearConvexSession();
  connectionStatus = 'DISCONNECTED';
  connectedPhone = null;
  currentQrDataUrl = null;
  setTimeout(connectToWhatsApp, 1000);
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`💬 Bastiyah WhatsApp Gateway Server running on port ${PORT}`);
  console.log(`👉 Open http://localhost:${PORT} in your browser to scan QR`);
  console.log(`======================================================\n`);
  connectToWhatsApp();

  // Heartbeat keep-alive ping every 8 minutes to prevent Render free-tier instance from sleeping
  setInterval(() => {
    fetch(`${GATEWAY_PUBLIC_URL}/status`)
      .then(() => console.log('[Bastiyah Gateway] 💓 Heartbeat keep-alive ping dispatched.'))
      .catch(() => {});
  }, 8 * 60 * 1000);
});
