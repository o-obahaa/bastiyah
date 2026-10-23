import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_DIR = path.join(__dirname, 'auth_session');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let sock = null;
let currentQrDataUrl = null;
let connectionStatus = 'DISCONNECTED'; // 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'
let connectedPhone = null;

// Ensure auth directory exists
if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  console.log(`[Bastiyah Gateway] Initializing WhatsApp engine v${version.join('.')} (latest: ${isLatest})...`);

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ['Bastiyah Store', 'Chrome', '124.0.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
  });

  sock.ev.on('creds.update', saveCreds);

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
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      connectionStatus = 'DISCONNECTED';
      connectedPhone = null;

      console.log(`[Bastiyah Gateway] Connection closed. Reason code: ${statusCode}. Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log('[Bastiyah Gateway] Session logged out. Clearing auth credentials...');
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        } catch (e) {}
        setTimeout(connectToWhatsApp, 2000);
      }
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
        <p class="text-[11px] text-emerald-400/80">يتم إرسال أكواد التحقق للزبائن فوراً من هاتفك بدون أي شروط من فيسبوك.</p>
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
          <span>يتم تحديث الرمز تلقائياً</span>
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
        error: 'WhatsApp gateway is not connected. Please scan QR at http://localhost:3001',
      });
    }

    // Clean phone number
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    if (!cleanPhone.startsWith('964')) cleanPhone = `964${cleanPhone}`;

    const jid = `${cleanPhone}@s.whatsapp.net`;
    const store = storeName || 'بسطية';

    const messageText = `مرحباً بك في *${store}* 🛍️\n\nرمز تسجيل دخولك إلى حسابك هو:\n*${code}*\n\n(الرمز صالح لمدة 10 دقائق. لا تشارك الرمز مع أي شخص).`;

    const sent = await sock.sendMessage(jid, { text: messageText });

    console.log(`[Bastiyah Gateway] ✅ OTP [${code}] dispatched to ${cleanPhone} via WhatsApp! MsgId: ${sent?.key?.id}`);

    return res.json({
      success: true,
      messageId: sent?.key?.id,
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
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ success: false, error: 'phone and message are required' });
    }

    if (connectionStatus !== 'CONNECTED' || !sock) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp gateway is not connected. Please scan QR at gateway URL',
      });
    }

    // Clean phone number
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('00')) cleanPhone = cleanPhone.slice(2);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    if (!cleanPhone.startsWith('964')) cleanPhone = `964${cleanPhone}`;

    const jid = `${cleanPhone}@s.whatsapp.net`;

    const sent = await sock.sendMessage(jid, { text: message });

    console.log(`[Bastiyah Gateway] ✅ Message dispatched to manager [${cleanPhone}] via WhatsApp! MsgId: ${sent?.key?.id}`);

    return res.json({
      success: true,
      messageId: sent?.key?.id,
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
});
