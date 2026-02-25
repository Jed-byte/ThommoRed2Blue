# Red2Blue AI Mental Performance Platform

## Overview
Red2Blue is a comprehensive AI-powered mental performance coaching platform designed for elite golfers and high performers. The platform helps users transition from "Red Head" (stressed, reactive state) to "Blue Head" (calm, focused performance state) through personalized coaching, assessments, and proven psychological techniques.

## Features
- AI Coach "Flo" with personalized coaching
- Mental performance assessments and tracking
- Stripe-integrated payment tiers ($490 Premium, $2190 Ultimate)
- Comprehensive Red2Blue certification curriculum
- Emergency relief techniques and guided practice sessions

## Technology Stack
- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: Google Gemini AI API
- **Payments**: Stripe integration
- **Deployment**: Vercel

## Environment Variables
See **[docs/ENV-VARS.md](docs/ENV-VARS.md)** for the full list. In production, the server will not start if required variables are missing.

Required: `DATABASE_URL`, `GEMINI_API_KEY`, `SESSION_SECRET`, and Stripe keys (secret + publishable). Optional: `ASSETS_PATH` or `PDF_ASSETS_PATH` for PDF downloads, `STRIPE_WEBHOOK_SECRET` for webhooks.

## Local Development
```bash
npm install
npm run dev
```

## Deployment
This app is configured for Vercel deployment with automatic builds. For a concise **session summary** (what changed) and **deployment checklist** (what to do before going live), see **[docs/SESSION-SUMMARY-AND-DEPLOYMENT-CHECKLIST.md](docs/SESSION-SUMMARY-AND-DEPLOYMENT-CHECKLIST.md)**.