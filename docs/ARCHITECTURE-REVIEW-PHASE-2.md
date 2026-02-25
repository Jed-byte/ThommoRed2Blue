# Architecture & Code Review â€” Phase 2: Security & Auth

This document records **Phase 2** of the architecture review: securing user-scoped routes, protecting debug/diagnostics, and restricting demo endpoints. It also documents what is **deferred to later phases** for future work.

**Prerequisite:** [Phase 1 â€“ Discovery & Current State](./ARCHITECTURE-REVIEW-PHASE-1.md)

---

## 1. Phase 2 Objectives

- Add authentication and â€œown user or adminâ€ checks to every user-scoped API route.
- Restrict or remove debug/diagnostics endpoints in production.
- Restrict demo upgrade/reset to non-production only.
- Document remaining work for Phase 3+.

---

## 2. What Was Implemented in Phase 2

### 2.1 Auth helper: own user or admin

- **File:** `server/auth.ts`
- **Change:** New middleware `requireOwnUserOrAdmin(paramName?)` that, after `requireAuth`, ensures the request is either for the authenticated userâ€™s data or the user has role `admin`. Uses route param (e.g. `userId`) or optional body field so it works for both `GET /api/.../:userId` and `POST /api/...` with `body.userId`.

### 2.2 User-scoped routes now protected

These routes now use `requireAuth` and, where they operate on a specific user, enforce â€œown user or adminâ€ via `requireOwnUserOrAdmin('userId')` or an inline check:

| Route | Change |
|-------|--------|
| `GET /api/assessments/user/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |
| `GET /api/chat/sessions/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |
| `GET /api/progress/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |
| `GET /api/progress/techniques/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |
| `GET /api/pre-shot-routines/active/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |
| `GET /api/pre-shot-routines/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |
| `GET /api/check-in/today/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |
| `POST /api/progress` | `requireAuth`; body `userId` must equal `req.user.id` (or admin) |
| `POST /api/check-in` | `requireAuth`; body `userId` must equal `req.user.id` (or admin) |
| `POST /api/pre-shot-routines` | `requireAuth`; body `userId` must equal `req.user.id` (or admin) |
| `POST /api/progress/practice-session` | `requireAuth`; body `userId` must equal `req.user.id` (or admin) |
| `POST /api/generate-plan/:userId` | `requireAuth` + `requireOwnUserOrAdmin('userId')` |

Routes that already had `requireAuth` and a `:userId` param now use `requireOwnUserOrAdmin('userId')` where applicable (e.g. notifications, recommendations, insights, coaching-profile, engagement, chat limitations, goals) so users cannot access another userâ€™s data unless they are admin.

### 2.3 Debug and diagnostics

- **`GET /api/debug/users`** (`server/routes.ts`): Now protected with `requireAuth` and `requireAdmin`. Only admins can list users.
- **`GET /api/diagnostics`** (`server/index.ts`): Returns 404 when `NODE_ENV === 'production'` so env and logs are not exposed in production.

### 2.4 Demo endpoints

- **`POST /api/demo/upgrade`** and **`POST /api/demo/reset`** (`server/routes.ts`): In production (`NODE_ENV === 'production'`), respond with 404 and a short message so demo tier changes are disabled in production.

### 2.5 Low-hanging fruit (done in Phase 2)

- **Download routes:** Replaced hardcoded Replit paths with configurable **`ASSETS_PATH`** or **`PDF_ASSETS_PATH`**. If unset, downloads return 503 with a clear message. Set e.g. `ASSETS_PATH=/path/to/your/pdfs` in production (or the Replit path) so the same filenames are served.

---

## 3. Whatâ€™s Left for Later Phases (Documented for Later)

### Phase 3 â€“ Correctness & schema (done)

- See [Phase 3 â€“ Correctness & Schema](./ARCHITECTURE-REVIEW-PHASE-3.md). Implemented: user_progress schema extended and aligned, share-idea engagement re-enabled, notifications persisted in DB.

### Phase 4 â€“ Sport abstraction (done)
### Phase 4 â€“ Sport abstraction (done)

- See [Phase 4 â€“ Sport Abstraction](./ARCHITECTURE-REVIEW-PHASE-4.md). Schema has `sport` on users, techniques, scenarios; Flo prompts in `gemini.ts` are parameterized by sport; routes pass sport into AI. Optional later: registration/profile sport, filter techniques/scenarios by sport, display-name mapping, and `openai.ts` parity.

### Phase 5 â€“ Access control & paywall

- See [Phase 5 – Access Control & Paywall](./ARCHITECTURE-REVIEW-PHASE-5.md). Centralised entitlements in `shared/entitlements.ts`; `requirePremium` and `requireUltimate` applied to all relevant routes. Demo endpoints remain disabled in production (Phase 2).

### Phase 6 â€“ Deployment & ops

- See [Phase 6 – Deployment & Ops](./ARCHITECTURE-REVIEW-PHASE-6.md). Env vars in [ENV-VARS.md](./ENV-VARS.md); production startup fails fast if required vars missing (`server/env.ts`).

### Product priority â€“ Document ingestion & Flo grounding

- **Context:** The platform's core value is dispersing the founder's 4-session course material and having Flo discuss the Red2Blue methodology (see [Product & Vision Context](./PRODUCT-AND-VISION-CONTEXT.md)).
- **Needed:** Architecture to **ingest** course material (documents, session notes) and **ground Flo** on that content (e.g. RAG over ingested docs, or indexed chunks fed into Floâ€™s context) so Flo teaches the methodology, not generic advice.
- **Implies:** Storage/indexing for course documents, pipeline to process and chunk them, and integration with the existing Flo/Gemini flow so prompts include or retrieve from this knowledge base. Course/session structure (e.g. 4 sessions, topics) may be useful in the data model.

---

## 4. Summary

- **Phase 2** adds authentication and â€œown user or adminâ€ enforcement to user-scoped routes, protects debug/diagnostics, and restricts demo upgrade/reset to non-production.
- **Already done in earlier work:** Session secret required (no fallback); duplicate `POST /api/chat` removed; `getCoachingResponse` arguments fixed for authenticated chat.
- **Later phases:** Schema/correctness (Phase 3), sport abstraction (Phase 4), paywall/entitlements (Phase 5), deployment and ops (Phase 6). Details above are enough to pick up each phase when youâ€™re ready.
