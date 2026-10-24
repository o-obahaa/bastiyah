---
name: devops-ci-cd
description: Enforces the use of Jenkins CI/CD, Docker multi-stage builds, automated tests, and DevOps deployment practices when modifying, testing, containerizing, or deploying the Bastiyah platform.
trigger: model_decision
---

# Bastiyah DevOps & CI/CD Pipeline Rule (Jenkins & Docker)

This rule establishes mandatory DevOps standards for the **Bastiyah (بسطية)** platform. It activates whenever working on builds, automated testing, containerization, Docker, CI/CD pipelines, releases, or deployments.

---

## 1. Quality Gates & Pre-Flight Verification
Before pushing changes intended for deployment or committing CI/CD configurations:
- **TypeScript Static Verification**: Always execute `npm run typecheck` (`tsc --noEmit`) and ensure 0 errors.
- **Automated Testing**: Ensure `npm test` passes.
- **Production Build Check**: Verify that `npm run build` succeeds without bundle or chunk generation failures.

---

## 2. Jenkins CI/CD Pipeline Standards (`Jenkinsfile`)
- **Declarative Pipeline**: Always preserve and adhere to the declarative structure in `Jenkinsfile`.
- **Pipeline Stages**:
  1. `Checkout`: Clean workspace checkout from git repository.
  2. `Setup & Cache`: Safe package restoration with `npm ci`.
  3. `Lint & Typecheck`: Static analysis and strict type checking.
  4. `Automated Tests`: Component and API integration validation.
  5. `Vite Production Build`: Optimized asset bundling with production environment injection.
  6. `Docker Build`: Building multi-stage container image tagged with `GIT_COMMIT` and `latest`.
  7. `Security & Smoke Test`: Verifying image integrity and container health response.
  8. `Deploy / Push`: Staging or production deployment with zero-downtime container replacement.
  9. `Health Check`: Polling `/healthz` or endpoint verification before completing stage.
- **Secret Management**: Never hardcode credentials, API tokens, or secrets. Always bind secrets via Jenkins Credentials Store (`withCredentials` block) for `VITE_CONVEX_URL`, `CONVEX_DEPLOY_KEY`, Docker registry auth, or webhook secrets.

---

## 3. Docker Containerization & Nginx Standards
- **Multi-Stage Build**:
  - Maintain the multi-stage architecture in `Dockerfile`:
    - **Stage 1 (Builder)**: `node:20-alpine` runs `npm ci` and `npm run build`.
    - **Stage 2 (Runner)**: `nginx:1.27-alpine-slim` serves compiled static assets with minimal footprint (< 35MB).
- **Nginx Configuration (`nginx.conf`)**:
  - Single-Page-App (SPA) fallback: `try_files $uri $uri/ /index.html;`.
  - Security headers: `X-Frame-Options SAMEORIGIN`, `X-Content-Type-Options nosniff`, `X-XSS-Protection "1; mode=block"`, `Referrer-Policy strict-origin-when-cross-origin`.
  - Compression: Gzip enabled for HTML, CSS, JS, SVG, and JSON.
  - Caching: Long-lived immutable cache for hashed assets (`/assets/`), short cache for `index.html`.
  - Health check endpoint: `/healthz` returning HTTP 200 `OK`.
- **Docker Ignore**: Keep `.dockerignore` up to date to prevent leaking node_modules, `.git`, `.env.local`, and build caches into image layers.

---

## 4. Orchestration & Local Environment
- **Platform Production**: Maintain `docker-compose.yml` configured with proper port mappings (`8080:80`), restart policies (`unless-stopped`), healthchecks, and environment variables.
- **Local Jenkins Environment**: Maintain `jenkins/docker-compose.jenkins.yml` allowing developers to spin up a fully isolated local Jenkins controller with Docker-in-Docker socket mounting (`/var/run/docker.sock`).

---

## 5. Reference Documentation
- Consult `JENKINS.md` for complete step-by-step guidance on pipeline setup, Jenkins plugins, webhook automation, Docker deployment commands, and troubleshooting in Arabic and English.
