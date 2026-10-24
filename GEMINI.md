# Bastiyah (بسطية) Project Rules & Guidelines

Welcome to the **Bastiyah** platform codebase — a multi-tenant e-commerce system built with React, TypeScript, Vite, Tailwind CSS, Convex, and an Enterprise DevOps Suite.

---

## 1. Enterprise DevOps Suite & CI/CD Pipeline
Whenever performing builds, testing, containerization, deployment, observability, or DevOps automation:
- **Rule Specification**: Follow `.agents/rules/devops-ci-cd.md`.
- **Pre-flight Quality Gates**:
  - `npm run typecheck` (`tsc --noEmit`) to verify 0 TypeScript errors.
  - `npm test` for unit & cross-store synchronization tests.
  - `npm run test:e2e` for End-to-End synthetic checkout and WhatsApp verification.
  - `npm run security:scan` for npm & Trivy security auditing.
  - `npm run health:check` for `/healthz` latency verification.
- **Continuous Integration (Jenkins)**:
  - Declarative pipeline defined in `Jenkinsfile` with 12 enterprise stages.
  - Local Jenkins controller compose at `jenkins/docker-compose.jenkins.yml`.
- **Infrastructure & Gateway**:
  - Traefik v3 reverse proxy with automated Let's Encrypt Wildcard SSL in `traefik/` & `docker-compose.yml`.
  - Multi-stage Docker image in `Dockerfile` with hardened `nginx.conf`.
  - Uptime Kuma 24/7 service monitoring on port 3001.
- **Observability**:
  - Sentry real-time runtime tracking in `src/lib/sentry.tsx`.
- **Disaster Recovery**:
  - Automated backups via `npm run backup:create` with optional Cloudflare R2 / AWS S3 sync and restore via `npm run backup:restore`.
- **Full Operational Reference**:
  - Detailed Arabic and English documentation in `JENKINS.md`.

---

## 2. Code Quality & Architecture Standards
- **TypeScript**: Strict type adherence without `any` overrides unless strictly required.
- **State & Concurrency**: Convex real-time reactive queries and mutations.
- **Multi-Tenant Isolation**: Always verify store ownership and tenant context (`storeId` / `ownerId`) across managers and storefronts.
- **Bilingual Support**: Maintain both Arabic (RTL) and English (LTR) language support with clear typography and localized UI strings.
