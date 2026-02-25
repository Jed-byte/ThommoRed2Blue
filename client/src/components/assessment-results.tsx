import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, AlertCircle, CheckCircle2 } from "lucide-react";

interface AssessmentResultsProps {
  type: "mental-skills" | "control-circles";
  data: any;
}

export function AssessmentResults({ type, data }: AssessmentResultsProps) {
  if (type === "mental-skills") {
    const averageIntensity = Math.round(data.intensityScores.reduce((a: number, b: number) => a + b, 0) / data.intensityScores.length);
    const averageDecision = Math.round(data.decisionMakingScores.reduce((a: number, b: number) => a + b, 0) / data.decisionMakingScores.length);
    const averageDiversions = Math.round(data.diversionsScores.reduce((a: number, b: number) => a + b, 0) / data.diversionsScores.length);
    const averageExecution = Math.round(data.executionScores.reduce((a: number, b: number) => a + b, 0) / data.executionScores.length);
    const overallScore = Math.round((averageIntensity + averageDecision + averageDiversions + averageExecution) / 4);

    const getScoreColor = (score: number) => {
      if (score >= 80) return "text-green-600";
      if (score >= 60) return "text-yellow-600";
      return "text-red-600";
    };

    const getScoreInsight = (score: number) => {
      if (score >= 80) return "Strong performance - maintain consistency";
      if (score >= 60) return "Good foundation - room for improvement";
      return "Focus area - needs immediate attention";
    };

    const getRecommendations = () => {
      const recommendations = [];
      if (averageIntensity < 70) recommendations.push("Practice breathing techniques and pre-shot routines to manage intensity");
      if (averageDecision < 70) recommendations.push("Work on commitment drills and trust-building exercises");
      if (averageDiversions < 70) recommendations.push("Develop external focus techniques and distraction management");
      if (averageExecution < 70) recommendations.push("Practice target-focused execution and follow-through consistency");
      if (recommendations.length === 0) recommendations.push("Continue current training approach - all areas showing strong performance");
      return recommendations;
    };

    return (
      <Card className="mt-4 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <Target className="h-5 w-5" />
            <span>Mental Skills Assessment Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center p-4 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Overall Mental Skills Score</h3>
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}/100</div>
            <p className="text-sm text-gray-600 mt-1">{getScoreInsight(overallScore)}</p>
          </div>

          {/* Individual Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Intensity Management</span>
                <Badge variant={averageIntensity >= 80 ? "default" : averageIntensity >= 60 ? "secondary" : "destructive"}>
                  {averageIntensity}
                </Badge>
              </div>
              <Progress value={averageIntensity} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Decision Making</span>
                <Badge variant={averageDecision >= 80 ? "default" : averageDecision >= 60 ? "secondary" : "destructive"}>
                  {averageDecision}
                </Badge>
              </div>
              <Progress value={averageDecision} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Managing Diversions</span>
                <Badge variant={averageDiversions >= 80 ? "default" : averageDiversions >= 60 ? "secondary" : "destructive"}>
                  {averageDiversions}
                </Badge>
              </div>
              <Progress value={averageDiversions} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Execution</span>
                <Badge variant={averageExecution >= 80 ? "default" : averageExecution >= 60 ? "secondary" : "destructive"}>
                  {averageExecution}
                </Badge>
              </div>
              <Progress value={averageExecution} className="h-2" />
            </div>
          </div>

          {/* Your Responses */}
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold mb-3">Your Assessment Summary</h4>
            <div className="space-y-2 text-sm">
              <div><strong>Context:</strong> {data.context}</div>
              <div><strong>What you did well:</strong> {data.whatDidWell}</div>
              <div><strong>Areas for improvement:</strong> {data.whatCouldDoBetter}</div>
              <div><strong>Your action plan:</strong> {data.actionPlan}</div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold mb-3 flex items-center text-blue-800">
              <TrendingUp className="h-4 w-4 mr-2" />
              Personalized Development Recommendations
            </h4>
            <ul className="space-y-2 text-sm text-blue-700">
              {getRecommendations().map((rec, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Impact Statement */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold mb-2 flex items-center text-yellow-800">
              <AlertCircle className="h-4 w-4 mr-2" />
              Performance Impact
            </h4>
            <p className="text-sm text-yellow-700">
              This assessment contributes to your overall Red2Blue mental performance profile. 
              Regular tracking helps identify patterns, measure progress, and personalize your training approach. 
              Your data is used to generate AI-powered coaching recommendations and track your journey from reactive "Red Head" states to focused "Blue Head" performance.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Control Circles Results
  return (
    <Card className="mt-4 border-purple-200 bg-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-purple-800">
          <Target className="h-5 w-5" />
          <span>Control Circles Exercise Results</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Control Analysis */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-700 mb-2 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              Can't Control ({data.cantControl.length})
            </h4>
            <ul className="text-sm space-y-1">
              {data.cantControl.map((item: string, index: number) => (
                <li key={index} className="text-red-600">• {item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-700 mb-2 flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Can Influence ({data.canInfluence.length})
            </h4>
            <ul className="text-sm space-y-1">
              {data.canInfluence.map((item: string, index: number) => (
                <li key={index} className="text-yellow-600">• {item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-700 mb-2 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Can Control ({data.canControl.length})
            </h4>
            <ul className="text-sm space-y-1">
              {data.canControl.map((item: string, index: number) => (
                <li key={index} className="text-green-600">• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Control Distribution Analysis */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Control Distribution Analysis</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Focus Efficiency Score</span>
              <Badge variant={data.canControl.length >= 3 ? "default" : "secondary"}>
                {Math.round((data.canControl.length / (data.canControl.length + data.canInfluence.length + data.cantControl.length)) * 100)}% on controllables
              </Badge>
            </div>
            <Progress 
              value={(data.canControl.length / (data.canControl.length + data.canInfluence.length + data.cantControl.length)) * 100} 
              className="h-2" 
            />
            <p className="text-sm text-gray-600">
              {data.canControl.length >= 3 
                ? "Excellent focus on controllable factors - this leads to better mental clarity and performance consistency."
                : "Consider identifying more controllable factors to improve your mental focus and reduce anxiety."
              }
            </p>
          </div>
        </div>

        {/* Your Exercise Summary */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-semibold mb-3">Your Exercise Summary</h4>
          <div className="space-y-2 text-sm">
            <div><strong>Context:</strong> {data.context}</div>
            <div><strong>Your reflections:</strong> {data.reflections}</div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold mb-3 flex items-center text-blue-800">
            <TrendingUp className="h-4 w-4 mr-2" />
            Key Insights & Next Steps
          </h4>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              Use your "Can Control" list as daily focus points during practice and competition
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              Accept and let go of items in your "Can't Control" list to reduce mental stress
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              Develop strategies for your "Can Influence" factors through preparation and planning
            </li>
          </ul>
        </div>

        {/* Impact Statement */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="font-semibold mb-2 flex items-center text-yellow-800">
            <AlertCircle className="h-4 w-4 mr-2" />
            Performance Impact
          </h4>
          <p className="text-sm text-yellow-700">
            Control Circles exercises build mental resilience by clarifying where to direct your energy. 
            Regular practice helps transition from reactive "Red Head" anxiety to proactive "Blue Head" focus. 
            This data helps personalize your mental training and track improvements in emotional regulation and decision-making clarity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}