import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface CoachingResponse {
  message: string;
  suggestions: string[];
  redHeadIndicators?: string[];
  blueHeadTechniques?: string[];
  urgencyLevel: "low" | "medium" | "high";
}

export interface AssessmentAnalysis {
  overallState: "red_head" | "blue_head" | "transitional";
  strengths: string[];
  opportunities: string[];
  recommendedTechniques: string[];
  insights: string[];
  nextSteps: string[];
}

export async function getCoachingResponse(
  userMessage: string,
  conversationHistory: any[],
  userContext?: {
    latestAssessment?: any;
    recentProgress?: any[];
  }
): Promise<CoachingResponse> {
  try {
    const systemPrompt = `You are Flo, an expert Red2Blue mental performance coach for elite golfers. Your role is to help golfers shift from "Red Head" (stressed, reactive state) to "Blue Head" (calm, focused performance state) using proven methodology.

COMPREHENSIVE RED2BLUE KNOWLEDGE BASE:

CORE PHILOSOPHY:
Red Head State: Reactive, emotional, distracted mindset that impairs performance
- Characteristics: Overthinking, dwelling on mistakes, worrying about outcomes, physical tension, negative self-talk
- Triggers: Pressure situations, bad shots, course conditions, playing partners, expectations

Blue Head State: Calm, focused, present mindset that enhances performance  
- Characteristics: Present awareness, controlled breathing, positive self-talk, clear decisions, routine consistency
- Benefits: Better shot execution, emotional control, resilience, confidence

FUNDAMENTAL TECHNIQUES:

1. BOX BREATHING (Primary Reset Tool):
- Pattern: Inhale 4 counts → Hold 4 → Exhale 4 → Hold 4
- When to use: Before shots, between holes, during pressure moments
- Effect: Activates parasympathetic nervous system, instant calm
- Practice: 5 cycles minimum for effectiveness

2. PRE-SHOT ROUTINE (25-Second Structure):
- Physical Ritual (10s): Deep breath + balance check + club selection confidence
- Visualize Shot (6s): See ball flight, trajectory, landing with specific target
- Align & Commit (4s): Address ball, align to target, commit fully to shot
- Practice Swing (3s): One purposeful swing feeling the intended shot
- Execute (2s): Step up, settle, trust, fire

3. CONTROL CIRCLES TECHNIQUE:
Inner Circle (Complete Control): Breathing, attitude, effort, preparation, routine
Middle Circle (Influence): Strategy, course management, shot selection, practice quality
Outer Circle (No Control): Weather, course conditions, other players, results
RULE: Invest energy ONLY in Inner and Middle circles

4. 3-2-1 FOCUS RESET:
- 3 things you can see (specific details)
- 2 things you can hear (present sounds)  
- 1 thing you can feel (physical sensation)
- Purpose: Grounds attention in present moment, breaks negative thought loops

5. MENTAL SKILLS X-CHECK ASSESSMENT:
Intensity Management: Controlling arousal and energy levels
Decision Making: Clear, committed shot choices
Diversions Control: Managing distractions and staying focused  
Execution: Trusting technique and following through

SPECIFIC INTERVENTIONS:

Bad Shot Recovery:
- Immediate: Box breathing, acknowledge without judgment
- Process: "What can I learn?" vs "Why did I do that?"
- Refocus: Next shot routine, target selection
- Mantra: "This shot, right now"

Pre-Round Nerves:
- Physical: Progressive muscle relaxation, dynamic warm-up
- Mental: Visualization of successful shots and good feelings
- Process focus: Commit to routine and process goals
- Acceptance: Nervous energy is normal and useful

During Round Pressure:
- Slow down all movements and decisions
- Extra emphasis on breathing and routine
- Simplify shot selection and strategy
- Trust your practice and preparation

RED HEAD INTERVENTIONS:
Overthinking: "Stop, breathe, simplify" - Single swing thought maximum
Dwelling on Mistakes: "File it and move on" - Physical reset routine
Future Worry: "One shot at a time" - Present moment awareness
Physical Tension: Progressive muscle relaxation, breathing exercises

BLUE HEAD ENHANCEMENT:
Confidence Building: Recall past successes, positive visualization
Flow State: Challenge-skill balance, clear goals, focused attention
Resilience: Growth mindset, adversity as opportunity, long-term perspective

COACHING PRINCIPLES:
- Meet athletes where they are emotionally
- Provide immediate, actionable techniques
- Build confidence through small wins
- Focus on process over outcome
- Use confident, encouraging tone

Analyze messages for Red Head indicators and provide specific Blue Head solutions using this comprehensive methodology. Always provide practical next steps.`;

    const contextInfo = userContext ? `
User's latest assessment scores: ${JSON.stringify(userContext.latestAssessment)}
Recent progress: ${JSON.stringify(userContext.recentProgress)}
` : '';

    const messages = [
      { role: "system", content: systemPrompt + contextInfo },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      message: result.message || "I understand you're facing a challenge. Let's work through this together with some practical techniques.",
      suggestions: result.suggestions || [],
      redHeadIndicators: result.redHeadIndicators || [],
      blueHeadTechniques: result.blueHeadTechniques || [],
      urgencyLevel: result.urgencyLevel || "low"
    };
  } catch (error) {
    console.error("OpenAI coaching response error:", error);
    return {
      message: "I'm here to help you shift from Red Head to Blue Head. Can you tell me more about what's causing stress in your game right now?",
      suggestions: ["Take a deep breath", "Focus on your process", "Remember your strengths"],
      urgencyLevel: "low"
    };
  }
}

export async function analyzeAssessmentResults(
  intensityScore: number,
  decisionMakingScore: number,
  diversionsScore: number,
  executionScore: number,
  previousAssessments?: any[]
): Promise<AssessmentAnalysis> {
  try {
    const totalScore = intensityScore + decisionMakingScore + diversionsScore + executionScore;
    
    const prompt = `Analyze these Red2Blue mental skills assessment results for a golfer:

Intensity Management: ${intensityScore}/100
Decision Making: ${decisionMakingScore}/100
Focus & Diversions: ${diversionsScore}/100
Execution: ${executionScore}/100
Total: ${totalScore}/400

Previous assessments: ${JSON.stringify(previousAssessments || [])}

As Flo, the Red2Blue coach, provide analysis in JSON format with:
- overallState: "red_head", "blue_head", or "transitional"
- strengths: array of specific strengths identified
- opportunities: array of areas for improvement
- recommendedTechniques: array of specific techniques to practice
- insights: array of behavioral insights
- nextSteps: array of actionable next steps

Focus on practical, golf-specific insights and simple language.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      overallState: result.overallState || "transitional",
      strengths: result.strengths || [],
      opportunities: result.opportunities || [],
      recommendedTechniques: result.recommendedTechniques || [],
      insights: result.insights || [],
      nextSteps: result.nextSteps || []
    };
  } catch (error) {
    console.error("Assessment analysis error:", error);
    return {
      overallState: "transitional",
      strengths: ["Consistent technical skills"],
      opportunities: ["Mental game optimization"],
      recommendedTechniques: ["Box breathing", "3-2-1 focus reset"],
      insights: ["Scores indicate room for mental performance improvement"],
      nextSteps: ["Practice daily breathing exercises", "Work on pre-shot routine"]
    };
  }
}

export async function generateAIProfile(
  bio: string,
  userInfo: {
    username: string;
    dexterity?: string;
    gender?: string;
    golfHandicap?: number;
  }
): Promise<string> {
  const prompt = `
    As Flo, an expert Red2Blue mental performance coach, analyze this student's background and create a comprehensive, professional profile that will enhance their coaching experience.

    Student Information:
    - Username: ${userInfo.username}
    - Dexterity: ${userInfo.dexterity || 'Not specified'}
    - Gender: ${userInfo.gender || 'Not specified'}
    - Golf Handicap: ${userInfo.golfHandicap !== undefined ? userInfo.golfHandicap : 'Not specified'}

    Student's Bio:
    "${bio}"

    Create a smart, uniform description that includes:
    1. Athletic background assessment
    2. Mental performance strengths and potential challenges
    3. Recommended focus areas for Red2Blue training
    4. Personalized coaching approach suggestions
    5. Goal-setting recommendations

    Keep the profile professional, encouraging, and actionable. Focus on mental performance aspects that will help tailor their coaching experience.

    Respond with a well-structured profile in paragraph format.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are Flo, an expert Red2Blue mental performance coach specializing in creating personalized athlete profiles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI profile");
  }
}

export async function generatePersonalizedPlan(
  userAssessments: any[],
  userProgress: any[],
  goals?: string[]
): Promise<{
  weeklyPlan: any[];
  focusAreas: string[];
  techniques: string[];
  milestones: any[];
}> {
  try {
    const prompt = `Create a personalized Red2Blue improvement plan for a golfer based on:

Assessment History: ${JSON.stringify(userAssessments)}
Progress Data: ${JSON.stringify(userProgress)}
Goals: ${JSON.stringify(goals || [])}

Generate a JSON response with:
- weeklyPlan: array of 7 daily activities with technique focus
- focusAreas: priority areas for improvement
- techniques: recommended techniques in order of priority
- milestones: specific measurable goals for next 4 weeks

Keep recommendations practical and immediately implementable.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Plan generation error:", error);
    return {
      weeklyPlan: [],
      focusAreas: ["Breath control", "Focus consistency"],
      techniques: ["Box breathing", "3-2-1 reset"],
      milestones: []
    };
  }
}
