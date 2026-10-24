---
name: devops-ci-cd
description: Enforces the use of Jenkins CI/CD, Traefik SSL reverse proxy, Sentry error observability, DevSecOps vulnerability scans, E2E synthetic testing, Uptime Kuma monitoring, automated backups, and Docker multi-stage builds when modifying, testing, containerizing, or deploying the Bastiyah platform.
trigger: always_on
---

# Bastiyah Enterprise DevOps Suite Rule (Jenkins, Docker, Traefik, Sentry, DevSecOps & Monitoring)

This rule establishes mandatory DevOps standards for the **Bastiyah (بسطية)** multi-tenant platform. It activates whenever working on builds, automated testing, containerization, Docker, CI/CD pipelines, releases, observability, security audits, or deployments.

---

## 1. Quality Gates & Pre-Flight Verification
Before pushing changes or finalizing deployments:
- **TypeScript Static Verification**: Always execute `npm run typecheck` (`tsc --noEmit`) and ensure 0 errors.
- **Unit & Cross-Store Integration Tests**: Ensure `npm test` passes.
- **End-to-End Synthetic Verification**: Run `npm run test:e2e` (validating checkout calculation and WhatsApp message encoding).
- **Security Audit**: Run `npm run security:scan` to verify zero critical package/container vulnerabilities.
- **Production Build Check**: Verify that `npm run build` succeeds cleanly.

---

## 2. Jenkins CI/CD Pipeline Standards (`Jenkinsfile`)
- **Declarative Pipeline**: Maintain and preserve the 12-stage declarative structure in `Jenkinsfile`.
- **Pipeline Stages**:
  1. `Checkout & Env`: Workspace verification and tool version logging.
  2. `Install Dependencies`: `npm ci --prefer-offline`.
  3. `Type Checking`: `npm run typecheck`.
  4. `Automated Tests`: Store routing & universal customer synchronization tests.
  5. `E2E Synthetic Testing`: `npm run test:e2e`.
  6. `DevSecOps Security Audit`: `npm run security:scan` (npm audit & Trivy).
  7. `Build Production Bundle`: `npm run build`.
  8. `Archive Artifacts`: Archiving `dist/**`.
  9. `Disaster Recovery Snapshot`: `npm run backup:create`.
  10. `Docker Build & Package`: Multi-stage container build tagged with build number and latest.
  11. `Push Docker Registry`: Secure credentials-bound registry upload.
  12. `Deploy & Health Check`: Deployment execution followed by `npm run health:check`.

---

## 3. Reverse Proxy & Wildcard SSL Gateway (Traefik v3)
- **Traefik Configuration**: Maintain `traefik/traefik.yml` and `traefik/dynamic.yml`.
- **Automatic SSL**: Let's Encrypt automated certificate resolver for `*.bastiyah.com` and custom domains.
- **Security Middlewares**: Enforce HSTS, frame denial (`SAMEORIGIN`), MIME sniffing block, rate limiting (120 req/min burst 200), and Gzip/Brotli compression.

---

## 4. Observability & Real-Time Error Tracking (Sentry)
- **Module**: `src/lib/sentry.tsx` wrapped in `src/main.tsx`.
- **Telemetry**: Capture unhandled promises, window errors, checkout funnel dropouts, and WhatsApp message state.
- **Safe Fallback**: Always maintain non-blocking silent behavior when `VITE_SENTRY_DSN` is omitted.

---

## 5. Uptime Monitoring & Synthetic Health Checks
- **Uptime Kuma**: Integrated in `docker-compose.yml` on port 3001 with persistent volume storage.
- **Health Verification**: Point synthetic monitor to `/healthz` via `npm run health:check`.

---

## 6. Disaster Recovery & Automated Backups
- **Backup Engine**: `scripts/backup-runner.js` creates timestamped gzip archives of schemas, configurations, and Convex exports.
- **Retention**: Auto-prunes archives older than 14 days.
- **Cloud S3/R2**: Uploads to S3/Cloudflare R2 when `BACKUP_S3_BUCKET` is configured.
- **Restore**: Instant restoration via `scripts/restore-backup.sh`.
