# Architecture & Code Review — Phase 3: Correctness & Schema

This document describes **Phase 3** of the architecture review: aligning the database schema with how the application uses it, and persisting features that are currently mock or broken.

**Prerequisites:** [Phase 1 – Discovery & Current State](./ARCHITECTURE-REVIEW-PHASE-1.md), [Phase 2 – Security & Auth](./ARCHITECTURE-REVIEW-PHASE-2.md).

---

## 1. Phase 3 Objectives

- Align the **`user_progress`** table (and `InsertUserProgress`) with how routes and storage use it, so progress and engagement data are stored correctly.
- **Re-enable share-idea engagement tracking** once `user_progress` (or a dedicated engagement path) supports it.
- Persist **notifications** in the database using the existing `notifications` table and enforce own-user (or admin) on read/update.

---

## 2. Already Addressed (in Phase 2)

- **share-idea `createChatSession`:** Fixed in Phase 2. `POST /api/share-idea` now calls `storage.createChatSession` with the correct payload `{ userId, messages }`. The engagement/progress block was removed because it used fields not present on `user_progress`; re-adding it is part of this phase once the schema is aligned.

---

## 3. What Was Implemented (Phase 3 Complete)

### 3.1 user_progress schema and storage

- **Schema** (`shared/schema.ts`): Added default `0` for `overallScore`, `redHeadInstances`, `blueHeadInstances` so inserts can omit them. Added nullable columns: `emergencyRelief`, `practiceMinutes`, `chatMessages`, `engagementScore`.
- **Storage**: Added `updateUserProgress(id, updates)` to `IStorage` and both MemStorage and DB storage. DB `createUserProgress` normalises `date` (string → Date) when inserting.
- **Routes**: `POST /api/emergency-relief` and `POST /api/practice-technique` now get or create today’s progress row, then **update** that row (no duplicate rows per day). `POST /api/share-idea` records engagement in `user_progress`: increments `chatMessages` and `engagementScore` for today (get or create then update).
- **Migration:** Run `npm run db:push` (or your Drizzle migration) so the new `user_progress` columns exist.

### 3.2 Notifications persistence

- **Storage**: Added `createNotification`, `getNotification(id)`, `getNotificationsByUserId(userId)`, `updateNotification(id, updates)` to `IStorage` and both implementations (MemStorage uses an in-memory Map; DB storage uses the `notifications` table).
- **Routes**: `POST /api/notifications` creates a notification with `userId` from the session (no body userId). `GET /api/notifications/:userId` returns persisted notifications (with `requireOwnUserOrAdmin`). `PATCH /api/notifications/:id` marks a notification as read; ownership is enforced (only the notification’s `userId` or admin can update).

---

## 4. Original Plan (for reference)

### 4.1 userProgress schema vs usage

**Current schema** (`shared/schema.ts` – `userProgress` table):

- `userId`, `date`, `overallScore`, `redHeadInstances`, `blueHeadInstances`, `techniquesUsed` (array of text).
- All of `overallScore`, `redHeadInstances`, `blueHeadInstances` are **required** (`.notNull()`).

**Current usage in routes/storage:**

- Some code paths pass or expect: `techniquesUsed` as a number, `emergencyRelief`, `practiceMinutes`, `chatMessages`, `engagementScore`, etc. Those fields do **not** exist on the table, so inserts can fail or be incorrect.

**Recommended approach:**

1. Decide which metrics you want to store per user per day (e.g. overall score, red/blue instances, technique count, emergency-relief count, practice minutes, chat messages, engagement score).
2. Either:
   - **Option A:** Add nullable columns to `user_progress` for the extra metrics (e.g. `emergencyRelief`, `practiceMinutes`, `chatMessages`, `engagementScore`) and make `overallScore` / `redHeadInstances` / `blueHeadInstances` nullable or defaulted where they’re not always set; or  
   - **Option B:** Introduce a separate table (e.g. `user_engagement_daily`) for engagement-style metrics and keep `user_progress` for score/red/blue/techniques only.
3. Add a Drizzle migration (or `db:push`) and update all call sites (e.g. `POST /api/emergency-relief`, `POST /api/practice-technique`, `POST /api/share-idea`, any progress aggregation) to use the chosen schema.
4. Re-enable the share-idea engagement block in `server/routes.ts` so idea-sharing is recorded once the schema supports it.

**Files to touch:**

- `shared/schema.ts` – table definition and insert schema.
- `server/routes.ts` – emergency-relief, practice-technique, share-idea, and any other progress/engagement writes.
- `server/storage.ts` – `createUserProgress`, `getUserProgress`, and any helpers that build or read progress rows.

### 4.2 Notifications (original plan)

**Current state (pre-Phase 3):**

- `notifications` table exists in the schema.
- Routes (e.g. `POST /api/notifications`, `GET /api/notifications/:userId`) currently use **mock in-memory** data or placeholders; nothing is persisted.

**Recommended approach:**

1. Use the existing `notifications` table and `InsertNotification` schema.
2. In `server/storage.ts`, implement (or extend) `createNotification`, `getUserNotifications`, `updateNotification` (e.g. mark read), and wire them to the DB.
3. In `server/routes.ts`, replace mock responses with calls to storage; keep `requireAuth` and `requireOwnUserOrAdmin('userId')` so users only see their own notifications (or admins see as needed).

**Files to touch:**

- `server/storage.ts` – notification CRUD.
- `server/routes.ts` – notification endpoints.

---

## 5. Summary

| Item | Status |
|------|--------|
| share-idea `createChatSession` | Done (Phase 2) |
| userProgress schema vs usage | **Done** – New columns, defaults, `updateUserProgress`, routes fixed; run `npm run db:push` for DB. |
| Share-idea engagement tracking | **Done** – Recorded in `user_progress` (chatMessages, engagementScore). |
| Notifications persistence | **Done** – Storage CRUD + GET/POST/PATCH routes; ownership enforced on PATCH. |

Phase 3 is **implemented**. See Phase 2 doc for the link to this file.