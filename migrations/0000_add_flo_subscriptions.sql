CREATE TABLE "ai_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"recommendation_type" text NOT NULL,
	"target_id" integer,
	"priority" integer NOT NULL,
	"reasoning" text NOT NULL,
	"confidence_score" integer NOT NULL,
	"personalized_message" text,
	"expected_outcome" text,
	"recommendation_data" jsonb,
	"is_active" boolean DEFAULT true,
	"user_feedback" integer,
	"feedback_comments" text,
	"was_applied" boolean DEFAULT false,
	"effectiveness_measure" integer,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"responses" jsonb,
	"intensity_score" integer DEFAULT 0,
	"decision_making_score" integer DEFAULT 0,
	"diversions_score" integer DEFAULT 0,
	"execution_score" integer DEFAULT 0,
	"total_score" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "calendar_reminders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"provider" text NOT NULL,
	"reminder_time" text NOT NULL,
	"timezone" text DEFAULT 'UTC',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certification_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"tools_completed" jsonb NOT NULL,
	"assessments_completed" jsonb NOT NULL,
	"practice_scenarios" jsonb NOT NULL,
	"under_pressure_testing" jsonb NOT NULL,
	"coach_observations" text,
	"self_reflections" text,
	"certification_level" text DEFAULT 'beginner',
	"business_observation_checklist" jsonb,
	"last_progress_update" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"messages" jsonb NOT NULL,
	"message_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coaching_insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"insight_type" text NOT NULL,
	"category" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"data_points" jsonb,
	"actionable_steps" jsonb,
	"severity" text,
	"impact" text,
	"timeframe" text,
	"related_techniques" jsonb,
	"is_acknowledged" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "control_circles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cant_control" text[],
	"can_influence" text[],
	"can_control" text[],
	"reflections" text,
	"context" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_check_ins" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"completed" boolean DEFAULT false,
	"points" integer DEFAULT 10,
	"streak_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "daily_moods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"mood_score" integer NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flo_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subscription_type" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"stripe_subscription_id" text,
	"amount_paid" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mental_skills_x_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"intensity_scores" jsonb NOT NULL,
	"decision_making_scores" jsonb NOT NULL,
	"diversions_scores" jsonb NOT NULL,
	"execution_scores" jsonb NOT NULL,
	"what_did_well" text,
	"what_could_do_better" text,
	"action_plan" text,
	"context" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"scheduled_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pre_shot_routines" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"steps" jsonb NOT NULL,
	"total_duration" integer NOT NULL,
	"is_active" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "priority_planning" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"purpose" text NOT NULL,
	"primary_indicator" text NOT NULL,
	"primary_responsibility" text NOT NULL,
	"critical_building_blocks" jsonb NOT NULL,
	"responsibilities" jsonb NOT NULL,
	"key_actions" jsonb NOT NULL,
	"key_indicators" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recognition_assessments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scenario" text NOT NULL,
	"red_indicators" jsonb NOT NULL,
	"blue_indicators" jsonb NOT NULL,
	"demeanour_score" integer NOT NULL,
	"communication_score" integer NOT NULL,
	"decision_making_score" integer NOT NULL,
	"execution_score" integer NOT NULL,
	"overall_state" text NOT NULL,
	"action_plan" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scenarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"pressure_level" text NOT NULL,
	"category" text NOT NULL,
	"red_head_triggers" text[],
	"blue_head_techniques" text[]
);
--> statement-breakpoint
CREATE TABLE "screw_up_cascade" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"category" text NOT NULL,
	"screw_up_description" text NOT NULL,
	"frequency" integer NOT NULL,
	"prevention_strategy" text NOT NULL,
	"trigger_warnings" jsonb,
	"recovery_actions" jsonb,
	"tested" boolean DEFAULT false,
	"effectiveness" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "technique_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"technique_id" integer NOT NULL,
	"practice_count" integer DEFAULT 0,
	"mastery_level" text DEFAULT 'beginner',
	"last_practiced" timestamp DEFAULT now(),
	"total_time_spent" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "techniques" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"instructions" text NOT NULL,
	"duration" integer,
	"difficulty" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_coaching_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"learning_style" text,
	"preferred_session_length" integer DEFAULT 15,
	"stress_patterns" jsonb,
	"goal_preferences" jsonb,
	"response_to_feedback" text,
	"peak_performance_factors" jsonb,
	"common_struggles" jsonb,
	"motivational_triggers" jsonb,
	"technique_mastery" jsonb,
	"personality_profile" text,
	"coaching_history" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_coaching_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_engagement_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"chat_messages" integer DEFAULT 0,
	"assessments_taken" integer DEFAULT 0,
	"techniques_used" integer DEFAULT 0,
	"session_duration" integer DEFAULT 0,
	"tools_accessed" jsonb,
	"recommendations_viewed" integer DEFAULT 0,
	"recommendations_applied" integer DEFAULT 0,
	"engagement_score" integer DEFAULT 0,
	"streak_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"goal_text" text NOT NULL,
	"category" text NOT NULL,
	"priority" integer DEFAULT 3,
	"target_date" timestamp,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"notes" text,
	"related_stats" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" timestamp NOT NULL,
	"overall_score" integer NOT NULL,
	"red_head_instances" integer NOT NULL,
	"blue_head_instances" integer NOT NULL,
	"techniques_used" text[]
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"date_of_birth" timestamp,
	"dexterity" text,
	"gender" text,
	"golf_handicap" integer,
	"golf_experience" text,
	"goals" text,
	"bio" text,
	"ai_generated_profile" text,
	"profile_image_url" text,
	"is_subscribed" boolean DEFAULT false,
	"subscription_tier" text DEFAULT 'free',
	"role" text DEFAULT 'student',
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_start_date" timestamp,
	"subscription_end_date" timestamp,
	"flo_chats_used" integer DEFAULT 0,
	"flo_subscription_active" boolean DEFAULT false,
	"flo_subscription_start_date" timestamp,
	"flo_subscription_renewal_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "what_if_planning" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"scenario" text NOT NULL,
	"risk_rating" integer NOT NULL,
	"impact_rating" integer NOT NULL,
	"blue_strategy" text NOT NULL,
	"tested_under_pressure" boolean DEFAULT false,
	"effectiveness" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
