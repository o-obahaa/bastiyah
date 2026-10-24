# Bastiyah (بسطية) Project Rules & Guidelines

Welcome to the **Bastiyah** platform codebase — a multi-tenant e-commerce system built with React 19, TypeScript, Vite, Tailwind CSS, and Convex.

---

## 1. DevOps, CI/CD & Deployment Rules
Whenever performing builds, testing, containerization, deployment, or DevOps automation tasks:
- **Rule File**: Follow `.agents/rules/devops-ci-cd.md`.
- **Pre-flight Checks**:
  - Run `npm run typecheck` (`tsc --noEmit`) to verify zero TypeScript errors.
  - Run `npm test` before finalizing features or submitting commits.
- **CI/CD Pipeline**:
  - The repository utilizes Jenkins declarative pipeline defined in `Jenkinsfile`.
  - Multi-stage Docker image defined in `Dockerfile` with optimized Nginx runner (`nginx.conf`).
  - Production container composition managed via `docker-compose.yml`.
  - Local Jenkins controller compose available at `jenkins/docker-compose.jenkins.yml`.
  - Operational instructions and Arabic documentation available in `JENKINS.md`.

---

## 2. Code Quality & Architecture Standards
- **TypeScript**: Strict type adherence without `any` overrides unless strictly required.
- **State & Concurrency**: Convex real-time reactive queries and mutations. Clean optimistic updates.
- **Multi-Tenant Isolation**: Always verify store ownership and tenant context (`storeId` / `ownerId`) when modifying mutations, queries, or manager/owner panels.
- **Bilingual Support**: Maintain both Arabic (RTL) and English (LTR) language support with clear typography and localized UI strings.
