# Architecture & Code Review — Phase 1: Discovery & Current State

This document is **Phase 1** of a phased architecture and code review for the Red2Blue AI Performance Coach codebase. It covers the current architecture, entry points, data model, and initial findings.

---

## 1. High-Level Architecture

### 1.1 System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (React + Vite)                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Wouter    │  │ React Query  │  │ useAuth()   │  │ permissions.ts      │ │
│  │   Router    │  │ (TanStack)   │  │ (session)   │  │ (tier/feature gate) │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └──────────┬───────────┘ │
│         │                │                 │                     │             │
│         └────────────────┴─────────────────┴─────────────────────┘             │
│                                    │                                           │
│                          /api/* (fetch, session cookie)                        │
└────────────────────────────────────┼───────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SERVER (Node.js + Express)                            │
│  ┌─────────────────────────────────────────────────────────────────────────┐  │
│  │ express-session (connect-pg-simple) → req.session.userId                │  │
│  │ requireAuth / requirePremium / requireAdmin / requireCoach              │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │  routes.ts  │  │  storage    │  │  gemini.ts  │  │ recommendationEngine│   │
│  │  (monolith) │──│  (IStorage) │  │  (Flo AI)   │  │  (personalized recs)│   │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └──────────┬──────────┘   │
│         │                │                                                      │
│         │                ▼                                                      │
│         │         ┌─────────────┐  ┌─────────────┐                               │
│         └────────►│  db.ts      │  │ Stripe      │                               │
│                   │  (Drizzle)  │  │ (payments)  │                               │
│                   └──────┬──────┘  └─────────────┘                               │
└──────────────────────────┼──────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PostgreSQL (Neon serverless driver)  │  Stripe API  │  Google Gemini API    │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Entry**: `client/index.html` → `main.tsx` → `App.tsx` (router); `server/index.ts` → `registerRoutes(app)`.
- **Auth**: Session-based; `session.userId` set on login/register; middleware `requireAuth` loads `req.user` from `storage.getUser(session.userId)`.
- **Access control**: Role-based (`admin`, `coach`, `student`) + subscription tier (`free`, `premium`, `ultimate`). Client-side feature flags in `client/src/lib/permissions.ts`; server uses `requirePremium`, `requireAdmin`, `requireCoach` on selected routes only.

---

## 2. Main Entry Points & Structure

| Layer        | Path / Module        | Purpose |
|-------------|----------------------|---------|
| **Server**  | `server/index.ts`    | Express app, JSON/urlencoded, logging, error handler, Vite/static, health + diagnostics; calls `registerRoutes(app)`. |
| **Routes**  | `server/routes.ts`    | Single ~2.1k-line file: session, auth, Stripe, all REST API routes (auth, chat, assessments, techniques, scenarios, pre-shot routines, goals, admin, etc.). |
| **DB**      | `server/db.ts`       | Neon serverless Pool + Drizzle with full schema. |
| **Schema**  | `shared/schema.ts`   | Drizzle table definitions + Zod insert schemas + shared types. |
| **Storage** | `server/storage.ts`  | `IStorage` interface + `MemStorage` (in-memory) and DB-backed implementation; used by routes and auth. |
| **Auth**    | `server/auth.ts`     | Session config (PG store), `requireAuth` / `requirePremium` / `requireAdmin` / `requireCoach`, bcrypt, `registerUser` / `loginUser`. |
| **AI**      | `server/gemini.ts`   | Flo coach: `getCoachingResponse(message, history, context)`, assessment analysis, personalized plan. |
| **Client**  | `client/src/App.tsx` | Wouter router; unauthenticated vs authenticated route sets; tier-based redirect (e.g. `canAccessDashboard` → Home vs FreeDashboard). |

---

## 3. Database & Schema Summary

- **ORM**: Drizzle with `shared/schema.ts`; migrations via `drizzle.config.ts` (output `./migrations`).
- **Tables (high level)**:
  - **Identity & billing**: `users` (incl. `golfHandicap`, `golfExperience`, `subscriptionTier`, `role`, Stripe IDs, FLO chat limits), `flo_subscriptions`, `sessions` (session store).
  - **Content & progress**: `assessments`, `chat_sessions`, `user_progress`, `techniques`, `scenarios`, `pre_shot_routines`, `mental_skills_x_checks`, `control_circles`, `recognition_assessments`, `what_if_planning`, `screw_up_cascade`, `priority_planning`, `certification_progress`, `technique_progress`, `daily_check_ins`, `daily_moods`, `calendar_reminders`.
  - **AI / recommendations**: `user_coaching_profiles`, `ai_recommendations`, `coaching_insights`, `user_engagement_metrics`.
  - **Other**: `user_goals`, `notifications`.

- **Golf-specific / sport-coupled**:
  - `users`: `golfHandicap`, `golfExperience`.
  - `scenarios`: `category` described as "golf-specific categories".
  - `screw_up_cascade`: `category` includes `"golf"`.
  - `user_goals`: `category` includes `"handicap"`.
  - Naming: `pre_shot_routines` is golf-centric (could map to “pre-performance” for other sports).

---

## 4. API Surface (Security & Consistency)

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`. Session cookie; no JWT.
- **Payments**: `POST /api/create-payment-intent`, `POST /api/create-checkout-session` (no auth), `POST /api/webhook/stripe` (signature verified), `POST /api/payment/create` (requireAuth), demo upgrade/reset.
- **User-scoped data**: Many routes take `:userId` in path or `userId` in body. Some enforce “own user only” (e.g. assessments latest), others do not (e.g. `GET /api/assessments/user/:userId` has no auth — **critical**). `GET /api/progress/:userId`, `GET /api/chat/sessions/:userId`, etc. are not consistently protected.
- **Sensitive / debug**: `GET /api/debug/users` returns user list and exists in production code path; `GET /api/diagnostics` exposes environment and logs. Both should be disabled or strictly restricted in production.
- **Duplicate route**: `POST /api/chat` is defined twice (lines ~529 and ~948). The second definition (with `requireAuth` and FLO limits) overwrites the first; the first (no auth, different `getCoachingResponse` usage) is dead code and confusing.

---

## 5. Critical Issues (Blocking / Security / Correctness)

### 5.1 Security & access control

| Issue | Location | Severity |
|-------|----------|----------|
| **No auth on several user-scoped routes** | `GET /api/assessments/user/:userId`, `GET /api/progress/:userId`, `GET /api/chat/sessions/:userId`, `GET /api/pre-shot-routines/:userId`, etc. | **Critical** – any user can access another user’s data by guessing IDs. |
| **Debug/users endpoint exposed** | `GET /api/debug/users` | **Critical** – user enumeration and info leak. |
| **Diagnostics endpoint exposes env/logs** | `GET /api/diagnostics` | **High** – should be off or admin-only in production. |
| **Demo upgrade/reset without restriction** | `POST /api/demo/upgrade`, `POST /api/demo/reset` | **High** – anyone logged in can self-grant premium/ultimate. |
| **Session secret fallback** | `auth.ts`: `secret: sessionSecret \|\| 'your-secret-key-here'` | **High** – weak default if `SESSION_SECRET` is unset. |

### 5.2 Correctness & schema

| Issue | Location | Severity |
|-------|----------|----------|
| **Wrong arguments to getCoachingResponse** | `routes.ts` ~1522: `getCoachingResponse(message, userId)` — signature is `(userMessage, conversationHistory, userContext?)` | **Critical** – chat will behave incorrectly or throw. |
| **createChatSession misuse in share-idea** | `routes.ts` share-idea: passes `message`, `aiResponse`, `sentiment`, etc. to `createChatSession`; schema expects `{ userId, messages }` | **High** – type/schema violation and likely runtime/DB errors. |
| **userProgress schema vs usage** | Schema: `overallScore`, `redHeadInstances`, `blueHeadInstances`, `techniquesUsed` (array). Routes/storage sometimes use `techniquesUsed` as number, or `emergencyRelief`, `practiceMinutes`, `chatMessages`, `engagementScore` | **High** – schema and code out of sync; migrations may be missing. |

### 5.3 Deployment & environment

| Issue | Location | Severity |
|-------|----------|----------|
| **Hardcoded Replit asset paths** | `routes.ts` download routes: `/home/runner/workspace/attached_assets/...` | **High** – 404s when not on Replit. |
| **Duplicate POST /api/chat** | `routes.ts`: two `app.post("/api/chat", ...)` definitions | **Medium** – dead code and confusion; first handler never runs. |

---

## 6. Golf-Specific vs Extensible Areas

### 6.1 Tightly coupled to golf

- **Schema**: `users.golfHandicap`, `users.golfExperience`; `scenarios.category` (golf-specific); `screw_up_cascade.category` (`"golf"`); `user_goals.category` (`"handicap"`); naming of `pre_shot_routines`.
- **AI prompts**: `server/gemini.ts` and `server/openai.ts` reference “golf,” “pre-shot routine,” “course,” “shot” in system prompts and fallbacks.
- **Auth/registration**: `auth.ts` and registration flow accept/persist `golfHandicap`, `golfExperience`.
- **UI copy**: “Red2Blue,” “Flo,” “Cero Golf” in README and likely in client (landing, checkout).

### 6.2 Already generic or easy to generalize

- **Core mental model**: Control circles, box breathing, 3-2-1 focus, intensity/decision/diversions/execution scores are sport-agnostic.
- **Techniques / scenarios**: Stored in DB with `category`; could add `sport` or use category to drive sport-specific content.
- **Roles and tiers**: `role` (admin, coach, student) and `subscriptionTier` (free, premium, ultimate) are already generic.
- **Permissions**: `permissions.ts` is feature-based; no golf in the permission keys.

---

## 7. Scalability & Maintainability

- **Monolithic routes**: One large `routes.ts` (~2.1k lines) makes it hard to add new sports or features without touching many unrelated routes. No route modules or resource-based grouping.
- **Storage**: Single `IStorage` implementation with many methods; adding new domains (e.g. “sport”) will keep expanding this interface unless domain services or repositories are introduced.
- **No formal API versioning**: All routes under `/api/` with no `/v1/` or similar; breaking changes will be harder to manage.
- **Config**: Port 5000 hardcoded in `server/index.ts`; env handling exists but is mixed (e.g. Stripe key env var naming).

---

## 8. What’s in place for your goals

| Goal | Current state |
|------|----------------|
| **Multi-sport** | No `sport` or equivalent in schema; prompts and several tables are golf-specific. Adding a sport dimension will require schema and prompt refactors. |
| **Tiered access / content restrictions** | Tiers and roles exist; `permissions.ts` and some `requirePremium`/admin/coach usage. Many APIs do not enforce tier or “own user” consistently. |
| **Monetization / paywall** | Stripe one-time and checkout sessions, webhook, FLO chat limits. Demo endpoints undermine paywall; no central “entitlement” layer. |
| **Production readiness** | Session store (PG), health check, and error handling exist. Debug/diagnostics, missing auth on routes, and Replit-specific paths are blockers. |

---

## 9. Next Phases (Preview)

- **Phase 2 – Security & auth**: Fix all unauthenticated/unauthorized user-data routes; remove or protect debug/diagnostics; lock demo routes; enforce session secret; add consistent “own user or admin” checks.
- **Phase 3 – Correctness & schema**: Fix `getCoachingResponse` and `createChatSession` usage; align `userProgress` (and any similar) with schema and migrations; remove duplicate `POST /api/chat`.
- **Phase 4 – Sport abstraction**: Introduce `sport` (or equivalent) in schema and APIs; refactor prompts and content to be sport-aware; generalize naming (e.g. pre-shot → pre-performance) where appropriate.
- **Phase 5 – Access control & paywall**: Centralize entitlement checks; align every feature with permissions; remove or gate demo upgrade/reset.
- **Phase 6 – Deployment & ops**: Replace Replit asset paths with config; add migrations and DB bootstrap; document env vars and deployment; consider splitting routes and adding API versioning.

---

## 10. Summary

- **Architecture**: Classic Express + React SPA with session auth, Drizzle/PostgreSQL, Stripe, and Gemini; single large routes file and no API versioning.
- **Critical**: Unprotected user-data endpoints, exposed debug/diagnostics, wrong `getCoachingResponse` usage, and session secret fallback must be fixed before production.
- **High**: Demo upgrade/reset, Replit-only asset paths, `createChatSession`/share-idea and `userProgress` schema mismatches.
- **Multi-sport / paywall / production**: Possible with current stack, but require systematic auth/tier enforcement, schema and prompt abstraction for sport, and cleanup of deployment/config and dead code.

Phase 2 will focus on the **Security & Auth** fixes and a prioritized list of code changes with concrete file/line references.
