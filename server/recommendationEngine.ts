import { storage } from "./storage";
import { getCoachingResponse, generatePersonalizedPlan } from "./gemini";
import type { User, Assessment, ChatSession, UserCoachingProfile, InsertAiRecommendation, InsertCoachingInsight, InsertUserEngagementMetric } from "@shared/schema";

export interface RecommendationContext {
  user: User;
  recentAssessments: Assessment[];
  chatHistory: ChatSession[];
  engagementMetrics: any[];
  coachingProfile?: UserCoachingProfile;
}

export interface PersonalizedRecommendation {
  type: "technique" | "scenario" | "routine" | "assessment" | "chat_followup";
  priority: number;
  title: string;
  description: string;
  reasoning: string;
  expectedOutcome: string;
  personalizedMessage: string;
  actionSteps: string[];
  relatedChatMessages?: any[];
  followUpQuestions?: string[];
  confidenceScore: number;
  expiresIn?: number; // days
}

export class RecommendationEngine {
  
  async generatePersonalizedRecommendations(userId: number): Promise<PersonalizedRecommendation[]> {
    const context = await this.buildUserContext(userId);
    const recommendations: PersonalizedRecommendation[] = [];

    // Generate chat history-based recommendations
    const chatRecommendations = await this.generateChatBasedRecommendations(context);
    recommendations.push(...chatRecommendations);

    // Generate assessment-based recommendations
    const assessmentRecommendations = await this.generateAssessmentBasedRecommendations(context);
    recommendations.push(...assessmentRecommendations);

    // Generate engagement-based recommendations
    const engagementRecommendations = await this.generateEngagementBasedRecommendations(context);
    recommendations.push(...engagementRecommendations);

    // Sort by priority and confidence
    const sortedRecommendations = recommendations.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.confidenceScore - a.confidenceScore;
    });

    // Store recommendations in database
    await this.storeRecommendations(userId, sortedRecommendations.slice(0, 10));

    return sortedRecommendations.slice(0, 5); // Return top 5
  }

  private async buildUserContext(userId: number): Promise<RecommendationContext> {
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    const recentAssessments = await storage.getUserAssessments(userId);
    const chatHistory = await storage.getUserChatSessions(userId);
    const engagementMetrics = await storage.getUserEngagementMetrics(userId, 30);
    const coachingProfile = await storage.getUserCoachingProfile(userId);

    return {
      user,
      recentAssessments: recentAssessments.slice(0, 5), // Last 5 assessments
      chatHistory: chatHistory.slice(0, 10), // Last 10 chat sessions
      engagementMetrics,
      coachingProfile
    };
  }

  private async generateChatBasedRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    
    if (context.chatHistory.length === 0) return recommendations;

    // Analyze recent chat messages for patterns and follow-up opportunities
    for (const session of context.chatHistory.slice(0, 3)) {
      const messages = session.messages as any[];
      if (!Array.isArray(messages)) continue;

      // Look for unresolved issues or practice recommendations
      const userMessages = messages.filter(m => m.role === "user");
      const assistantMessages = messages.filter(m => m.role === "assistant");

      for (let i = 0; i < userMessages.length; i++) {
        const userMsg = userMessages[i];
        const assistantReply = assistantMessages[i];

        if (this.containsPracticeRequest(userMsg.content) && assistantReply) {
          // Create follow-up recommendation for practice techniques mentioned
          recommendations.push({
            type: "chat_followup",
            priority: 8,
            title: "Follow-up on Practice Recommendation",
            description: `Check progress on the technique we discussed: ${this.extractTechnique(assistantReply.content)}`,
            reasoning: "User received specific practice recommendations but we haven't followed up on their implementation",
            expectedOutcome: "Better understanding of technique effectiveness and areas for refinement",
            personalizedMessage: `Hi ${context.user.username}, how did the ${this.extractTechnique(assistantReply.content)} practice go? I'd love to hear about your experience.`,
            actionSteps: [
              "Ask about practice frequency and consistency",
              "Assess effectiveness of the recommended technique", 
              "Identify any challenges or obstacles",
              "Adjust technique or provide alternatives if needed"
            ],
            relatedChatMessages: [userMsg, assistantReply],
            followUpQuestions: [
              "How many times did you practice this technique?",
              "What situations did you use it in?",
              "What worked well and what was challenging?",
              "How did it affect your performance?"
            ],
            confidenceScore: 85,
            expiresIn: 7
          });
        }

        if (this.containsStressPattern(userMsg.content)) {
          // Create stress management recommendation
          recommendations.push({
            type: "technique",
            priority: 9,
            title: "Personalized Stress Management Strategy",
            description: "Based on your recent discussions about pressure situations, here's a targeted approach",
            reasoning: "User has mentioned specific stress triggers in recent conversations",
            expectedOutcome: "Improved ability to manage pressure and maintain focus during critical moments",
            personalizedMessage: `I noticed you've been discussing pressure situations. Let's build a specific strategy for your stress triggers.`,
            actionSteps: [
              "Practice the 4-7-8 breathing technique daily",
              "Implement pre-shot routine consistently",
              "Use positive self-talk during pressure moments",
              "Track stress levels and recovery patterns"
            ],
            relatedChatMessages: [userMsg],
            confidenceScore: 90,
            expiresIn: 14
          });
        }
      }
    }

    return recommendations;
  }

  private async generateAssessmentBasedRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    
    if (context.recentAssessments.length === 0) return recommendations;

    const latestAssessment = context.recentAssessments[0];
    const previousAssessment = context.recentAssessments[1];

    // Identify areas needing improvement
    const weakestArea = this.identifyWeakestArea(latestAssessment);
    const improvingArea = previousAssessment ? this.identifyImprovingArea(latestAssessment, previousAssessment) : null;

    if (weakestArea) {
      recommendations.push({
        type: "technique",
        priority: 10,
        title: `Targeted ${weakestArea.name} Improvement Plan`,
        description: `Personalized strategy to boost your ${weakestArea.name.toLowerCase()} from ${weakestArea.score}/100`,
        reasoning: `Your ${weakestArea.name.toLowerCase()} score of ${weakestArea.score} indicates this is your primary area for growth`,
        expectedOutcome: `15-20 point improvement in ${weakestArea.name.toLowerCase()} within 2-3 weeks`,
        personalizedMessage: `Let's focus on strengthening your ${weakestArea.name.toLowerCase()}. I have a specific plan tailored to your current level.`,
        actionSteps: this.getActionStepsForArea(weakestArea.name),
        confidenceScore: 95,
        expiresIn: 21
      });
    }

    if (improvingArea) {
      recommendations.push({
        type: "routine",
        priority: 7,
        title: `Maintain Momentum in ${improvingArea.name}`,
        description: `You've improved ${improvingArea.improvement} points - let's keep this progress going`,
        reasoning: `Positive trend detected in ${improvingArea.name.toLowerCase()} scores`,
        expectedOutcome: `Sustained improvement and confidence building in ${improvingArea.name.toLowerCase()}`,
        personalizedMessage: `Great progress on ${improvingArea.name.toLowerCase()}! Here's how to maintain this momentum.`,
        actionSteps: [
          "Continue current successful practices",
          "Gradually increase difficulty level",
          "Track progress weekly",
          "Celebrate small wins"
        ],
        confidenceScore: 80,
        expiresIn: 14
      });
    }

    return recommendations;
  }

  private async generateEngagementBasedRecommendations(context: RecommendationContext): Promise<PersonalizedRecommendation[]> {
    const recommendations: PersonalizedRecommendation[] = [];
    
    if (context.engagementMetrics.length === 0) return recommendations;

    const recentEngagement = context.engagementMetrics[0];
    const avgEngagement = context.engagementMetrics.reduce((sum, metric) => sum + (metric.engagementScore || 0), 0) / context.engagementMetrics.length;

    if ((recentEngagement.engagementScore || 0) < avgEngagement * 0.7) {
      recommendations.push({
        type: "scenario",
        priority: 6,
        title: "Re-engagement Strategy",
        description: "Let's get you back on track with some engaging practice scenarios",
        reasoning: "Recent engagement has dropped below your usual level",
        expectedOutcome: "Renewed motivation and consistent practice habits",
        personalizedMessage: "I've noticed you might need a fresh approach. Here are some engaging activities to reignite your passion.",
        actionSteps: [
          "Try shorter, focused practice sessions",
          "Set small, achievable daily goals",
          "Mix up routine with new scenarios",
          "Connect with community challenges"
        ],
        confidenceScore: 75,
        expiresIn: 10
      });
    }

    return recommendations;
  }

  private async storeRecommendations(userId: number, recommendations: PersonalizedRecommendation[]): Promise<void> {
    for (const rec of recommendations) {
      await storage.createAiRecommendation({
        userId,
        recommendationType: rec.type,
        priority: rec.priority,
        reasoning: rec.reasoning,
        confidenceScore: rec.confidenceScore,
        personalizedMessage: rec.personalizedMessage,
        expectedOutcome: rec.expectedOutcome,
        recommendationData: {
          title: rec.title,
          description: rec.description,
          actionSteps: rec.actionSteps,
          relatedChatMessages: rec.relatedChatMessages,
          followUpQuestions: rec.followUpQuestions
        },
        expiresAt: rec.expiresIn ? new Date(Date.now() + rec.expiresIn * 24 * 60 * 60 * 1000) : null
      });
    }
  }

  async generateChatFollowUp(userId: number, chatSessionId: number): Promise<string[]> {
    const session = await storage.getChatSession(chatSessionId);
    if (!session) return [];

    const messages = session.messages as any[];
    if (!Array.isArray(messages)) return [];

    const followUpQuestions = [];
    const lastAssistantMessage = messages.filter(m => m.role === "assistant").pop();

    if (lastAssistantMessage) {
      if (this.containsTechniqueRecommendation(lastAssistantMessage.content)) {
        followUpQuestions.push(
          "How has the practice been going with the technique I suggested?",
          "Have you noticed any improvements in your performance?",
          "What challenges have you encountered while practicing?"
        );
      }

      if (this.containsScenarioDiscussion(lastAssistantMessage.content)) {
        followUpQuestions.push(
          "Have you experienced a similar situation since we talked?",
          "How did you handle it using what we discussed?",
          "What would you like to work on next?"
        );
      }
    }

    return followUpQuestions;
  }

  async trackRecommendationEffectiveness(recommendationId: number, userFeedback: number, comments?: string): Promise<void> {
    await storage.updateRecommendationFeedback(recommendationId, userFeedback, comments);
    
    // Generate insight based on feedback
    if (userFeedback >= 4) {
      const recommendation = (await storage.getUserRecommendations(0)).find(r => r.id === recommendationId);
      if (recommendation) {
        await storage.createCoachingInsight({
          userId: recommendation.userId,
          insightType: "improvement",
          category: "recommendation_success",
          title: "Effective Recommendation Strategy",
          description: `User responded positively (${userFeedback}/5) to ${recommendation.recommendationType} recommendation`,
          dataPoints: { feedback: userFeedback, comments },
          actionableSteps: ["Replicate similar recommendation patterns", "Build on successful strategies"],
          impact: "significant",
          timeframe: "immediate"
        });
      }
    }
  }

  // Helper methods
  private containsPracticeRequest(content: string): boolean {
    const keywords = ["practice", "technique", "exercise", "drill", "routine", "how do i", "help me"];
    return keywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private containsStressPattern(content: string): boolean {
    const stressKeywords = ["nervous", "anxious", "pressure", "stress", "worried", "tight", "tense"];
    return stressKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private containsTechniqueRecommendation(content: string): boolean {
    const techniqueKeywords = ["breathing", "visualization", "routine", "focus", "technique"];
    return techniqueKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private containsScenarioDiscussion(content: string): boolean {
    const scenarioKeywords = ["situation", "when you", "if you", "during", "pressure moment"];
    return scenarioKeywords.some(keyword => content.toLowerCase().includes(keyword));
  }

  private extractTechnique(content: string): string {
    // Simple extraction - in production would use more sophisticated NLP
    const techniques = ["breathing", "visualization", "pre-shot routine", "focus point"];
    for (const technique of techniques) {
      if (content.toLowerCase().includes(technique)) {
        return technique;
      }
    }
    return "the suggested technique";
  }

  private identifyWeakestArea(assessment: Assessment): { name: string; score: number } | null {
    const areas = [
      { name: "Intensity", score: assessment.intensityScore },
      { name: "Decision Making", score: assessment.decisionMakingScore },
      { name: "Diversions", score: assessment.diversionsScore },
      { name: "Execution", score: assessment.executionScore }
    ];
    
    return areas.reduce((weakest, current) => 
      current.score < weakest.score ? current : weakest
    );
  }

  private identifyImprovingArea(current: Assessment, previous: Assessment): { name: string; improvement: number } | null {
    const improvements = [
      { name: "Intensity", improvement: current.intensityScore - previous.intensityScore },
      { name: "Decision Making", improvement: current.decisionMakingScore - previous.decisionMakingScore },
      { name: "Diversions", improvement: current.diversionsScore - previous.diversionsScore },
      { name: "Execution", improvement: current.executionScore - previous.executionScore }
    ];

    const bestImprovement = improvements.reduce((best, current) => 
      current.improvement > best.improvement ? current : best
    );

    return bestImprovement.improvement > 5 ? bestImprovement : null;
  }

  private getActionStepsForArea(area: string): string[] {
    const actionSteps: Record<string, string[]> = {
      "Intensity": [
        "Practice daily 10-minute breathing exercises",
        "Use visualization before each practice session",
        "Implement progressive muscle relaxation",
        "Track intensity levels throughout the day"
      ],
      "Decision Making": [
        "Practice the STOP-THINK-ACT method",
        "Review course strategy before each round",
        "Analyze successful and poor decisions post-round",
        "Use decision trees for complex situations"
      ],
      "Diversions": [
        "Practice single-point focus exercises",
        "Use the 'parking lot' technique for distracting thoughts",
        "Develop consistent refocusing rituals",
        "Practice in distracting environments"
      ],
      "Execution": [
        "Break down swing into checkpoints",
        "Practice commitment to shot selection",
        "Use positive self-talk during execution",
        "Develop post-shot routines regardless of outcome"
      ]
    };

    return actionSteps[area] || ["Work with your coach on this area"];
  }
}

export const recommendationEngine = new RecommendationEngine();