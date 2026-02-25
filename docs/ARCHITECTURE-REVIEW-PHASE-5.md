# Architecture & Code Review — Phase 5: Access Control & Paywall

This document records **Phase 5** of the architecture review: centralising entitlement definitions and gating premium/ultimate features on the server so the paywall is enforced in one place.

**Prerequisites:** [Phase 1](./ARCHITECTURE-REVIEW-PHASE-1.md), [Phase 2](./ARCHITECTURE-REVIEW-PHASE-2.md).

---

## 1. Phase 5 Objectives

- **Centralise** which tier (or role) is required for each feature so backend and frontend stay aligned.
- **Gate server-side:** ensure every premium-only and ultimate-only feature uses `requirePremium` or `requireUltimate` so free users cannot access paid features via the API.
- Keep **chat** as auth + FLO limits (free gets limited messages); keep **assessments** and **auth/me** as auth-only where free is allowed.

---

## 2. What Was Implemented

### 2.1 Shared entitlements (`shared/entitlements.ts`)

- **`FEATURE_MIN_TIER`** – Map of feature key to minimum tier (`"free" | "premium" | "ultimate"`). Covers: dashboard, techniques, scenarios, goals, progress, community, leaderboard, unlimitedChat, recommendations, insights, coachingProfile, engagement, preShotRoutines, mentalSkillsXCheck, controlCircles, dailyMood, generatePlan, shareIdea, emergencyRelief, practiceTechnique, assessmentHistory, **humanCoaching** (ultimate only).
- **`hasFeatureAccess(subscriptionTier, role, feature)`** – Returns whether the user’s tier/role has access (admin/coach always true).
- **`getRequiredTierForFeature(feature)`** – Returns the minimum tier for a feature.

The client can import from `shared/entitlements` (or keep `permissions.ts` in sync) so tier rules live in one place.

### 2.2 Auth middleware (`server/auth.ts`)

- **`requirePremium`** – Now allows **premium**, **ultimate**, **admin**, and **coach**. Previously it only allowed `subscriptionTier === 'premium'`, which blocked ultimate users; that is fixed.
- **`requireUltimate`** – New. Allows **ultimate**, **admin**, and **coach**. Use for human-coaching and any future ultimate-only features.

### 2.3 Route gating (`server/routes.ts`)

**Premium (requireAuth + requirePremium):**

- Leaderboard, check-in (today + submit), notifications (create + get)
- Progress (techniques, practice-session, create, get by userId)
- Assessment history: `GET /api/assessments/user/:userId`
- Chat sessions list: `GET /api/chat/sessions/:userId`
- Techniques, scenarios (list)
- Pre-shot routines (create, get active, get by userId)
- Mental skills x-check (create, get latest, list)
- Control circles (create, get latest, list)
- Daily mood (create, get by userId/date, update), mood-correlation
- Generate plan
- Resilience context
- Recommendations (get, get stored, post feedback)
- Chat followup
- Insights (get, acknowledge)
- Coaching profile (get, post)
- Engagement (get)
- Emergency relief, practice-technique, share-idea
- Goals (CRUD + toggle)
- Community ideas

**Ultimate (requireAuth + requireUltimate):**

- `POST /api/human-coaching/message`
- `POST /api/human-coaching/progress-review`
- `POST /api/human-coaching/schedule-request`

**Auth only (no tier gate):**

- `POST /api/assessments` – free can submit basic assessment
- `GET /api/assessments/latest/:userId` – free can see latest result
- `POST /api/chat` – free gets limited messages via FLO limits; 403 when limit reached
- `GET /api/chat/limitations/:userId`
- `PATCH /api/users/:id` – profile update
- Payment, demo (demo already restricted to non-production in Phase 2), auth, downloads (no auth), landing-chat (no auth)

### 2.4 Demo endpoints

- Already restricted to non-production in Phase 2 (404 in production). No change in Phase 5.

---

## 3. Summary

- **Entitlements:** `shared/entitlements.ts` defines feature → min tier; use it for any new feature or for a future `requireFeature('featureKey')` middleware.
- **requirePremium:** Allows premium + ultimate + admin/coach; applied to all premium-only routes.
- **requireUltimate:** Allows ultimate + admin/coach; applied to human-coaching routes.
- **Paywall:** Free users get 403 on premium/ultimate APIs without a valid subscription; chat remains limited by FLO count instead of a hard block.

Client-side `permissions.ts` should stay in sync with these rules (e.g. by importing from `shared/entitlements` or duplicating the tier map). If you add a new feature, add it to `FEATURE_MIN_TIER` and gate the corresponding route(s).
