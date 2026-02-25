# Architecture & Code Review — Phase 4: Sport Abstraction

This document records **Phase 4** of the architecture review: adding a sport dimension to the schema and parameterizing AI prompts so the platform can support multiple sports later while remaining golf-first today.

**Prerequisites:** [Phase 1](./ARCHITECTURE-REVIEW-PHASE-1.md), [Phase 2](./ARCHITECTURE-REVIEW-PHASE-2.md). Product context: [Product & Vision Context](./PRODUCT-AND-VISION-CONTEXT.md) (golf-only for now; Red2Blue is the methodology).

---

## 1. Phase 4 Objectives

- Add a **sport** field to the schema where relevant (users, techniques, scenarios) so content and user context can be filtered or scoped by sport later.
- **Parameterize AI prompts** in `server/gemini.ts` so Flo’s coaching language is sport-aware (e.g. “elite golf professionals” vs “elite tennis professionals”). Default remains **golf**.
- Pass **sport** from the authenticated user (or default) into all AI entry points (chat, assessment analysis, personalized plan).

---

## 2. What Was Implemented

### 2.1 Schema (`shared/schema.ts`)

- **`users.sport`**  
  - New column: `text("sport").default("golf")`.  
  - Primary sport context for coaching; existing and new users default to `"golf"`.

- **`techniques.sport`**  
  - New column: `text("sport").default("golf")`.  
  - Optional: later techniques can be filtered by sport (e.g. golf-specific vs generic).

- **`scenarios.sport`**  
  - New column: `text("sport").default("golf")`.  
  - Optional: later scenarios can be filtered by sport.

**Migration:** Run `npm run db:push` (or your Drizzle migration flow) so the new columns exist. Defaults keep existing rows and new inserts backward compatible.

### 2.2 AI layer (`server/gemini.ts`)

- **`getCoachingResponse(..., userContext?)`**  
  - `userContext` may include **`sport?: string`**.  
  - Prompt uses: “You are Flo, a Red2Blue mental performance coach for elite **{sport}** professionals.”  
  - Control-circles examples vary by sport (e.g. golf: “shot selection, course conditions”; others: “practice quality, conditions”).

- **`analyzeAssessmentResults(..., previousAssessments?, sport?)`**  
  - New optional argument **`sport`** (default `"golf"`).  
  - Prompt: “Analyze these Red2Blue mental skills assessment results for an elite **{sport}** athlete” and “Focus on practical, **{sport}**-specific insights.”

- **`generatePersonalizedPlan(..., sport?)`**  
  - New optional argument **`sport`** (default `"golf"`).  
  - Prompt: “Create a personalized Red2Blue training plan for an elite **{sport}** athlete” and “Use **{sport}**-appropriate examples (e.g. pre-shot routine for golf, pre-performance routine for others).”

- **Default:** `DEFAULT_SPORT = "golf"` used wherever sport is omitted.

### 2.3 Routes (`server/routes.ts`)

- **Landing chat** (`POST /api/landing-chat`): Passes `sport: "golf"` in context (no user).
- **Authenticated chat** (`POST /api/chat`): Passes `sport: req.user?.sport ?? "golf"` in `userContext`.
- **Assessment analysis** (after `POST /api/assessments`): Passes `sport: req.user?.sport ?? "golf"` into `analyzeAssessmentResults`.
- **Generate plan** (`POST /api/generate-plan/:userId`): Loads user, passes `sport: user?.sport ?? "golf"` into `generatePersonalizedPlan`.  
  - Call signature was corrected to `(userLevel, specificChallenges, availableTime, sport)` with goals mapped to challenges and a placeholder for time/level; full personalization from assessments/progress can be enhanced later.

### 2.4 Behaviour

- **Today:** No UI or registration change; all users and content effectively use `sport = "golf"` via defaults and route logic.
- **Later:**  
  - Set `users.sport` (e.g. on signup or profile) to support other sports.  
  - Optionally filter techniques/scenarios by `sport` in storage/API.  
  - Prompts already use the `sport` variable, so adding a new sport is mainly content and config, not prompt rewrites.

---

## 3. What’s Left for Later (Optional)

- **Registration / profile:** Allow setting `sport` on signup or in user profile and persist it in `users.sport`.
- **Techniques & scenarios:** Add optional `sport` filter to `getTechniquesByCategory`, `getScenariosByPressureLevel`, or new endpoints (e.g. `?sport=golf`) when you have non-golf content.
- **Display names:** Map internal keys to sport-specific labels (e.g. “Pre-shot routine” for golf, “Pre-performance routine” for others) in UI or a small i18n/config layer.
- **openai.ts:** If you switch or fall back to OpenAI for Flo, add the same `sport` parameter and prompt wording there for consistency.

---

## 4. Summary

- **Schema:** `users`, `techniques`, and `scenarios` now have an optional `sport` column (default `"golf"`).
- **AI:** All Flo entry points in `gemini.ts` take an optional sport and use it in prompts; default is golf.
- **Routes:** Chat, assessment analysis, and plan generation pass the user’s sport (or `"golf"`) into the AI.
- **Product:** Platform stays golf-first; structure is in place to add more sports later without changing prompt shapes.

Run **`npm run db:push`** after pulling so the new columns are applied.
