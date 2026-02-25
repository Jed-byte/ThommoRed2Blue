/**
 * Central entitlement definitions: which tier (or role) is required for each feature.
 * Used server-side for API gating; client keeps its own permissions.ts in sync with this.
 */

export type SubscriptionTier = "free" | "premium" | "ultimate";
export type FeatureKey =
  | "dashboard"
  | "techniques"
  | "scenarios"
  | "goals"
  | "progress"
  | "community"
  | "leaderboard"
  | "unlimitedChat"
  | "recommendations"
  | "insights"
  | "coachingProfile"
  | "engagement"
  | "preShotRoutines"
  | "mentalSkillsXCheck"
  | "controlCircles"
  | "dailyMood"
  | "generatePlan"
  | "shareIdea"
  | "emergencyRelief"
  | "practiceTechnique"
  | "assessmentHistory"
  | "humanCoaching";

/** Minimum tier required for each feature. "premium" = premium or ultimate; "ultimate" = ultimate only. */
export const FEATURE_MIN_TIER: Record<FeatureKey, SubscriptionTier> = {
  dashboard: "premium",
  techniques: "premium",
  scenarios: "premium",
  goals: "premium",
  progress: "premium",
  community: "premium",
  leaderboard: "premium",
  unlimitedChat: "premium",
  recommendations: "premium",
  insights: "premium",
  coachingProfile: "premium",
  engagement: "premium",
  preShotRoutines: "premium",
  mentalSkillsXCheck: "premium",
  controlCircles: "premium",
  dailyMood: "premium",
  generatePlan: "premium",
  shareIdea: "premium",
  emergencyRelief: "premium",
  practiceTechnique: "premium",
  assessmentHistory: "premium",
  humanCoaching: "ultimate",
};

const TIER_ORDER: Record<SubscriptionTier, number> = {
  free: 0,
  premium: 1,
  ultimate: 2,
};

export function hasFeatureAccess(
  subscriptionTier: SubscriptionTier | null | undefined,
  role: string | null | undefined,
  feature: FeatureKey
): boolean {
  if (role === "admin" || role === "coach") return true;
  const tier = subscriptionTier || "free";
  const minTier = FEATURE_MIN_TIER[feature];
  return TIER_ORDER[tier] >= TIER_ORDER[minTier];
}

export function getRequiredTierForFeature(feature: FeatureKey): SubscriptionTier {
  return FEATURE_MIN_TIER[feature];
}
