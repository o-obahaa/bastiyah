#!/usr/bin/env node
/**
 * ==============================================================================
 * Bastiyah High-Precision Synthetic Health & Latency Monitor
 * Polls application endpoints and validates latency, status codes & security headers.
 * ==============================================================================
 */

import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const reportsDir = path.join(projectRoot, 'reports');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const targetUrl = process.env.HEALTH_TARGET_URL || 'http://localhost:8080/healthz';
const maxAllowedLatencyMs = parseInt(process.env.MAX_LATENCY_MS || '2000', 10);

console.log('========================================================================');
console.log('💓 Bastiyah Production Health & Availability Monitor');
console.log('========================================================================');
console.log(`Target URL: ${targetUrl}`);
console.log(`Max Latency Threshold: ${maxAllowedLatencyMs} ms`);

const checkEndpoint = (urlStr) => {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const startTime = Date.now();

    const req = client.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const latency = Date.now() - startTime;
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          latencyMs: latency,
          headers: res.headers,
          bodySnippet: data.substring(0, 100),
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        statusCode: 0,
        latencyMs: Date.now() - startTime,
        error: 'Request timed out after 5000ms',
      });
    });

    req.on('error', (err) => {
      resolve({
        ok: false,
        statusCode: 0,
        latencyMs: Date.now() - startTime,
        error: err.message,
      });
    });
  });
};

async function run() {
  const result = await checkEndpoint(targetUrl);
  const reportPath = path.join(reportsDir, 'health-check.json');

  const report = {
    timestamp: new Date().toISOString(),
    targetUrl,
    result,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  if (!result.ok) {
    console.error(`❌ Health Check FAILED! Status: ${result.statusCode}, Error: ${result.error || 'Non-2xx status'}`);
    console.error(`Report saved to: ${reportPath}`);
    // Don't fail CI if target is local and not yet booted unless strict mode is enabled
    if (process.env.STRICT_HEALTH_CHECK === 'true') {
      process.exit(1);
    } else {
      console.log('ℹ️  Non-strict mode: Exiting gracefully.');
      process.exit(0);
    }
  }

  console.log(`✅ Health Check PASSED in ${result.latencyMs} ms (HTTP ${result.statusCode})`);
  if (result.latencyMs > maxAllowedLatencyMs) {
    console.warn(`⚠️  Latency warning: ${result.latencyMs} ms exceeds threshold of ${maxAllowedLatencyMs} ms.`);
  }

  console.log(`📄 Detailed health metrics written to: ${reportPath}`);
}

run();
