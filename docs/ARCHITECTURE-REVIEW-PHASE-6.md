# Architecture & Code Review — Phase 6: Deployment & Ops

This document records **Phase 6** of the architecture review: environment configuration, production startup checks, and deployment readiness.

**Prerequisites:** [Phase 1](./ARCHITECTURE-REVIEW-PHASE-1.md) through [Phase 5](./ARCHITECTURE-REVIEW-PHASE-5.md).

---

## 1. Phase 6 Objectives

- **Document** all environment variables and their purpose so deployment and local dev are clear.
- **Fail fast in production** if required env vars are missing, so misconfigurations are caught at startup.
- Capture **deployment and migration** steps for future use (DB push, optional route splitting, API versioning).

---

## 2. Product Context Update (Red2Blue Is Sport-Agnostic)

- **Red2Blue methodology is not sport-specific.** It applies to any sport or high-performance context. The platform must support expansion to **any sport** (golf first; tennis, football, etc. later) using the same methodology, with sport-specific examples and content where helpful.
- This is documented in [Product & Vision Context](./PRODUCT-AND-VISION-CONTEXT.md). Schema (`sport` on users, techniques, scenarios), Flo prompts (parameterised by sport), and content should all support multiple sports without a rewrite.

---

## 3. What Was Implemented in Phase 6

### 3.1 Environment variables documentation (`docs/ENV-VARS.md`)

- **Required in production:** `DATABASE_URL`, `GEMINI_API_KEY`, `SESSION_SECRET`, plus at least one Stripe secret key and one Stripe publishable key (with alternate names noted for key-swap setups).
- **Optional:** `NODE_ENV`, `ASSETS_PATH` / `PDF_ASSETS_PATH`, `STRIPE_WEBHOOK_SECRET`, `OPENAI_API_KEY`, `PORT`.
- **Client (Vite):** `VITE_*` variables and the note not to put secrets in them.
- **Local dev:** Example `.env` snippet and reminder to run `npm run db:push` after schema changes.

### 3.2 Production env validation (`server/env.ts`)

- **`getMissingProductionEnv()`** – Returns an array of missing required variable names (or descriptive labels for “one of these” groups).
- **`requireProductionEnv()`** – If `NODE_ENV === 'production'`, throws an error listing missing vars and pointing to `docs/ENV-VARS.md`. No-op in development.
- **Startup:** `server/index.ts` calls `requireProductionEnv()` at the start of the async startup block, so the process exits before registering routes or opening the DB if production env is incomplete.

### 3.3 Already in place (from earlier phases)

- **PDF downloads** use **`ASSETS_PATH`** or **`PDF_ASSETS_PATH`** (Phase 2). Set in production to your PDF directory or CDN base path.
- **Session secret** is required (no fallback) in `server/auth.ts` (Phase 2).

---

## 4. What’s Left for Later (Optional)

- **Migration run in deployment:** Document or automate `npm run db:push` (or a proper migration runner) in your CI/CD or deployment pipeline so schema changes are applied.
- **Port from env:** Read `process.env.PORT` in `server/index.ts` (e.g. `const port = parseInt(process.env.PORT || '5000', 10)`) so platforms like Vercel/Heroku can set the port.
- **Route splitting and API versioning:** Optionally split `server/routes.ts` into resource-based modules and prefix routes with `/api/v1/` for future breaking changes.
- **Health check:** `/api/health` already exists; ensure your hosting/load balancer uses it for readiness checks.

---

## 5. Summary

- **Env vars:** Documented in `docs/ENV-VARS.md`; production startup fails fast if required vars are missing (`server/env.ts`).
- **Red2Blue:** Documented as sport-agnostic; platform is structured to expand to any sport (see product context and Phase 4).
- **Deployment:** PDF paths and session secret are configured; migration step and port-from-env are optional next steps.
