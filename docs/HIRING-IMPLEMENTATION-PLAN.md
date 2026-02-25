# Hiring Plan: Implementation Time & Skills

This document helps you scope and hire for **deploying the Red2Blue platform** and for **follow-on work** (ops improvements, document ingestion). It gives time estimates and the technical skills the person needs.

**Context:** The codebase has already been through a full architecture review (Phases 1–6). What remains is **getting it live** and, optionally, **extra features/ops**. Use [SESSION-SUMMARY-AND-DEPLOYMENT-CHECKLIST.md](./SESSION-SUMMARY-AND-DEPLOYMENT-CHECKLIST.md) for the exact deployment steps.

---

## 1. Scope Options (what you’re hiring for)

| Scope | What’s included | Typical use |
|------|------------------|-------------|
| **A. Deployment only** | Required + recommended steps to get the app running in production. | First launch, MVP live. |
| **B. Deployment + ops** | Scope A + optional ops (migrations in CI/CD, port from env, health check). | Slightly more robust production setup. |
| **C. Document ingestion & Flo grounding** | Design and implement ingesting course material and grounding Flo’s answers on that content (e.g. RAG). | Core product value: Flo teaches your methodology. |

You can hire for A only, A+B, or A+B+C depending on budget and priorities.

---

## 2. Scope A: Deployment only (get the app live)

**Goal:** App runs in production; users can sign up, pay, and use Flo and premium features. No new features, only configuration and one-off setup.

### Tasks

| # | Task | Effort | Notes |
|---|------|--------|--------|
| 1 | Apply DB schema (e.g. `npm run db:push`) to production DB | 0.5–1 day | Needs production DB URL; may include backup/verification. |
| 2 | Set up production environment (e.g. Vercel/Railway) and configure **all required env vars** (see [ENV-VARS.md](./ENV-VARS.md)) | 0.5–1 day | DATABASE_URL, GEMINI_API_KEY, SESSION_SECRET, Stripe keys, NODE_ENV=production. |
| 3 | Configure Stripe (webhook URL, `STRIPE_WEBHOOK_SECRET`, test live mode if needed) | 0.5 day | Required for reliable subscriptions. |
| 4 | Set `ASSETS_PATH` or `PDF_ASSETS_PATH` if PDF downloads are used (or document that they’re disabled) | 0.25 day | Otherwise download endpoints return 503. |
| 5 | Verify app starts (env validation passes), run smoke tests (auth, one payment flow, one Flo chat) | 0.5–1 day | Catch misconfig before go-live. |

**Total Scope A:** about **2.5–4 days** for someone who has done this stack before (Node/Express, Postgres, Vercel or similar). Add 1–2 days if they need to learn your repo and hosting.

### Skills required (Scope A)

| Skill | Level | Why |
|-------|--------|-----|
| **Node.js / Express** | Comfortable | Server runs on Express; env and startup behaviour matter. |
| **PostgreSQL** | Basic | Run migrations, confirm schema; may need to inspect DB. |
| **Drizzle ORM** | Basic | Run `db:push` or existing migrations; understand schema. |
| **Environment variables & 12-factor config** | Comfortable | All config via env; production vs dev. |
| **Stripe** | Basic | Dashboard (webhooks, keys), maybe one test payment. |
| **Hosting (e.g. Vercel, Railway)** | Basic | Deploy Node app, set env vars, see logs. |
| **Git** | Basic | Clone, branch, read docs in repo. |

**Nice to have:** Previous experience with session-based auth, React/Vite (to sanity-check front-end after deploy). No AI/ML skills needed for Scope A.

---

## 3. Scope B: Deployment + ops (recommended production hardening)

**Goal:** Everything in Scope A, plus small code/config changes so deployment is repeatable and the host can manage the process.

### Extra tasks (on top of A)

| # | Task | Effort | Notes |
|---|------|--------|--------|
| 6 | Read `PORT` from env in `server/index.ts` and use it in `app.listen` | 0.25 day | One small code change; many hosts require this. |
| 7 | Document or add a CI/CD step to run DB migrations (e.g. `npm run db:push`) on deploy or in a release pipeline | 0.5 day | Prevents schema drift. |
| 8 | Confirm `/api/health` (or equivalent) exists and document it for load balancer / platform health checks | 0.25 day | Often no code change. |

**Total Scope B (extra over A):** about **1 day**.  
**Total A+B:** about **3.5–5 days**.

### Additional skills (Scope B)

| Skill | Level | Why |
|-------|--------|-----|
| **CI/CD** | Basic | Add migration step to pipeline or document manual step. |
| **Server/process basics** | Basic | PORT, process lifecycle, health checks. |

---

## 4. Scope C: Document ingestion & Flo grounding

**Goal:** Ingest the founder’s course material (documents, session notes) and ground Flo’s answers on that content (e.g. RAG or similar) so Flo teaches the Red2Blue methodology instead of generic advice. See [Product & Vision Context](./PRODUCT-AND-VISION-CONTEXT.md) and Phase 2 “Product priority – Document ingestion & Flo grounding”.

### Tasks (high level)

| # | Task | Effort | Notes |
|---|------|--------|--------|
| 1 | **Design** storage and pipeline for course documents (format, chunking, metadata, updates) | 1–2 days | Decisions: where to store docs, how to chunk, how to version. |
| 2 | **Implement** ingestion pipeline (upload/import, chunk, index or store for retrieval) | 2–4 days | Depends on choice: e.g. vector DB + embeddings vs simpler keyword/store. |
| 3 | **Integrate** retrieval with existing Flo flow in `server/gemini.ts` (get relevant chunks, add to prompt or context) | 1–2 days | Wire “Flo answer” path to use retrieved content. |
| 4 | **Admin or tooling** to add/update documents (even minimal) | 0.5–1 day | So you can add new material without code deploys. |
| 5 | **Test & tune** (quality of answers, chunk size, number of chunks, prompts) | 1–2 days | Iteration on relevance and response quality. |

**Total Scope C:** about **5.5–11 days** (roughly 2–2.5 weeks full-time), depending on approach (e.g. simple “inject first N chunks” vs full RAG with vector search).

### Skills required (Scope C)

| Skill | Level | Why |
|-------|--------|-----|
| **Node.js / TypeScript** | Strong | Integrate with existing Express, `gemini.ts`, storage. |
| **LLM APIs (e.g. Gemini)** | Comfortable | Prompts, context windows, how to pass retrieved text. |
| **RAG or retrieval design** | Comfortable | Chunking, embeddings, retrieval strategy (or simpler alternatives). |
| **Vector DB or search** | Basic–Comfortable | If using embeddings (e.g. Pinecone, pgvector, or similar). |
| **PostgreSQL / Drizzle** | Basic | If storing chunks or metadata in existing DB. |
| **Document processing** | Basic | PDF/text parsing, chunking, metadata (e.g. session/topic). |

**Nice to have:** Experience with LangChain or similar RAG frameworks; experience tuning prompts for “answer from this context only”.

---

## 5. Summary: time and role by scope

| Scope | Total time (estimate) | Role you’re hiring for |
|-------|------------------------|-------------------------|
| **A. Deployment only** | **3–5 days** | DevOps / full-stack dev with Node + hosting experience. |
| **B. Deployment + ops** | **4–6 days** | Same as A, with light CI/CD and server basics. |
| **C. Document ingestion & Flo** | **5.5–11 days** (on top of A or B) | Backend/ML engineer with LLM + RAG or retrieval experience. |

- **A or B:** One person (full-stack or DevOps) can do it in under two weeks, including handover and docs.
- **C:** Same person if they have RAG/LLM experience, or a second person (backend/ML) after deployment is done.

---

## 6. Suggested job description snippets

**For Scope A (or A+B):**

- “Deploy our existing Node.js/Express + React/Vite app to production (e.g. Vercel/Railway). Tasks: run DB migrations (Drizzle/Postgres), set production env vars, configure Stripe and webhooks, optional: read PORT from env and add migration step to CI/CD. Stack: Node, Express, PostgreSQL, Drizzle, Stripe, Google Gemini API. Documentation and deployment checklist provided in repo.”
- **Skills:** Node/Express, PostgreSQL, env-based config, Stripe basics, one modern hosting platform. 3–6 days.

**For Scope C:**

- “Design and implement document ingestion and RAG (or equivalent) so our AI coach (Gemini-based) answers from our proprietary course content. Tasks: storage and pipeline for documents, chunking and retrieval, integration with existing chat/coach API, minimal admin to add/update content. Stack: Node/TypeScript, Drizzle, Gemini API; optional: vector DB or pgvector.”
- **Skills:** Node/TypeScript, LLM APIs, RAG or retrieval design, document processing. 2–2.5 weeks.

---

## 7. Handover checklist (for you)

Before the contractor starts:

- [ ] They have access to the repo (and docs in `docs/`).
- [ ] They have (or can create) staging/production DB and hosting accounts.
- [ ] You’ve shared: [SESSION-SUMMARY-AND-DEPLOYMENT-CHECKLIST.md](./SESSION-SUMMARY-AND-DEPLOYMENT-CHECKLIST.md), [ENV-VARS.md](./ENV-VARS.md), and this plan.
- [ ] For Scope C: they have (or you provide) sample course material and a clear “what Flo should and shouldn’t say” brief.

After delivery:

- [ ] All required env vars documented and set in production.
- [ ] One successful payment and one Flo chat verified in production.
- [ ] You know how to run DB migrations for future schema changes (or it’s in CI/CD).
