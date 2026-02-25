# Red2Blue AI Mental Performance Platform

## Overview

Red2Blue is a comprehensive AI-powered mental performance coaching platform designed for athletes and high performers across all sports. The platform helps users transition from "Red Head" (stressed, reactive state) to "Blue Head" (calm, focused performance state) through personalized coaching, assessments, and proven psychological techniques.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom Red2Blue color scheme

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon (serverless PostgreSQL)
- **Authentication**: Express sessions with bcrypt
- **AI Integration**: Google Gemini AI API
- **Payment Processing**: Stripe integration

### Project Structure
```
├── client/          # React frontend application
├── server/          # Express backend API
├── shared/          # Shared types and schemas
├── migrations/      # Database migrations
└── attached_assets/ # Project documentation
```

## Key Components

### 1. AI Coaching System
- **Coach Flo**: Personalized AI coach with empathetic communication style
- **Conversation History**: Persistent chat sessions with context awareness
- **Adaptive Responses**: AI responses based on user assessment data and progress
- **Coaching Techniques**: Integration of proven Red2Blue mental performance methods

### 2. Assessment Tools
- **Mental Skills X-Check**: Comprehensive evaluation across four areas (Intensity, Decision Making, Diversions, Execution)
- **Control Circles**: Attention management tool categorizing concerns by control level
- **Recognition Assessment**: Performance state awareness measurement
- **Daily Mood Tracking**: Continuous mental state monitoring

### 3. Coaching Tools & Techniques
- **Pre-Performance Routine Builder**: Customizable routine creation and practice
- **Breathing Techniques**: Guided breathing exercises for stress management
- **Scenario Training**: Pressure situation simulation and response training
- **Progress Tracking**: Visual performance metrics and improvement trends

### 4. Community Features
- **Leaderboard**: Gamified progress tracking with peer comparison
- **Daily Check-ins**: Streak tracking and motivation system
- **Challenges**: Community-driven mental performance challenges
- **Progress Sharing**: Achievement and milestone celebrations

## Data Flow

### 1. User Onboarding
1. User registration with profile creation
2. Initial Mental Skills X-Check assessment
3. AI-generated coaching profile based on assessment
4. Personalized technique recommendations

### 2. Daily Coaching Flow
1. Daily mood tracking and check-in
2. AI coach interaction based on current state
3. Technique practice with progress recording
4. Assessment updates and trend analysis

### 3. Assessment & Coaching Cycle
1. Regular assessment completion
2. AI analysis of performance patterns
3. Personalized coaching recommendations
4. Progress tracking and goal adjustment

## External Dependencies

### AI Services
- **Google Gemini AI**: Primary AI coaching engine
- **OpenAI GPT-4**: Backup AI service (configured but not actively used)

### Database & Storage
- **Neon PostgreSQL**: Serverless database hosting
- **Drizzle ORM**: Type-safe database operations

### Payment & Subscriptions
- **Stripe**: Payment processing and subscription management
- **Subscription Tiers**: Free, Premium, Ultimate with feature gating

### Development Tools
- **Replit**: Development environment integration
- **TypeScript**: Type safety across the entire stack
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Development Environment
- **Replit Integration**: Configured for Replit development environment
- **Hot Reload**: Vite development server with HMR
- **Environment Variables**: Configured for DATABASE_URL, GEMINI_API_KEY, STRIPE_SECRET_KEY

### Production Deployment
- **Build Process**: Vite build for frontend, esbuild for backend
- **Static Assets**: Served from dist/public directory
- **Database Migrations**: Drizzle Kit for schema management
- **Session Management**: Express sessions with secure cookies

### Key Configuration Files
- `vite.config.ts`: Frontend build configuration
- `drizzle.config.ts`: Database schema management
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.ts`: Styling configuration

## Changelog

- August 15, 2025. **CRITICAL CHAT SYSTEM OVERHAUL COMPLETED** - Completely rebuilt AI chat system with bulletproof components to fix all user-reported issues: 1) Input field unresponsiveness and typing lag resolved with proper event handling and state isolation, 2) Scroll behavior interference eliminated with dedicated container management, 3) Message deletion/disappearing fixed with persistent state management, 4) Gemini API response accuracy dramatically improved with direct context-aware prompts and intelligent fallback system, 5) Added comprehensive timeout handling (8s) and request cancellation for performance optimization. Chat now provides relevant, accurate responses to user questions with smooth, responsive interface.
- August 07, 2025. **FINAL PLATFORM CLEANUP COMPLETED** - Removed all demo content and golf-specific signup fields. Eliminated demo upgrade buttons, golf handicap/dexterity fields, and support section from footer. Platform now completely clean and professional for business presentations across all sports.
- August 07, 2025. **PLATFORM PIVOT COMPLETED** - Successfully transformed entire platform from golf-specific to universal sports/high-performance focus. Updated assessment questions, AI coach Flo prompts, and all system messaging to be applicable across all sports and competitive contexts. Platform now truly generic for broader market appeal.
- July 29, 2025. **RESERVED VM DEPLOYMENT CONFIGURED** - Successfully changed deployment type from Autoscale to Reserved VM for better full-stack app support. Production server verified working correctly - serves static files and detects production mode properly. "Internal Server Error" in deployment identified as environment variable configuration issue, not code issue. Ready for redeploy with proper environment variables configured.
- July 29, 2025. **DEPLOYMENT READY** - Implemented comprehensive debugging and monitoring system with server/client diagnostics, health checks, error logging, deployment verification scripts, and production build optimization. All systems verified and ready for deployment to https://performance-ai-coach-markesthompson.replit.app
- July 09, 2025. Completed comprehensive branding update - replaced all instances of "Thommo" with "Flo" throughout the entire platform, including server files, client components, pages, and documentation to ensure consistent AI coach branding
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.