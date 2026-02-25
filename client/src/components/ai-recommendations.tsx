import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  MessageCircle, 
  Star, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Lightbulb,
  Calendar,
  BarChart3
} from "lucide-react";

interface PersonalizedRecommendation {
  id?: number;
  type: "technique" | "scenario" | "routine" | "assessment" | "chat_followup";
  priority: number;
  title: string;
  description: string;
  reasoning: string;
  expectedOutcome: string;
  personalizedMessage: string;
  actionSteps?: string[];
  relatedChatMessages?: any[];
  followUpQuestions?: string[];
  confidenceScore: number;
  expiresIn?: number;
  createdAt?: string;
  userFeedback?: number;
  feedbackComments?: string;
  wasApplied?: boolean;
  effectivenessMeasure?: number;
}

interface CoachingInsight {
  id: number;
  insightType: "pattern" | "improvement" | "risk" | "opportunity";
  category: string;
  title: string;
  description: string;
  dataPoints: any;
  actionableSteps: string[];
  severity?: "low" | "medium" | "high";
  impact: "minor" | "moderate" | "significant";
  timeframe: "immediate" | "short_term" | "long_term";
  isAcknowledged: boolean;
  createdAt: string;
}

export function AIRecommendations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRecommendation, setSelectedRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComments, setFeedbackComments] = useState("");
  const [effectivenessRating, setEffectivenessRating] = useState<number>(0);

  if (!user?.id) return null;

  // Fetch fresh personalized recommendations
  const { data: recommendations, isLoading: loadingRecommendations } = useQuery({
    queryKey: [`/api/recommendations/${user.id}`],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch stored recommendations history
  const { data: storedRecommendations } = useQuery({
    queryKey: [`/api/recommendations/${user.id}/stored`],
  });

  // Fetch coaching insights
  const { data: insights } = useQuery({
    queryKey: [`/api/insights/${user.id}`],
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async (data: { id: number; feedback?: number; comments?: string; effectivenessMeasure?: number }) => {
      const response = await apiRequest("POST", `/api/recommendations/${data.id}/feedback`, {
        feedback: data.feedback,
        comments: data.comments,
        effectivenessMeasure: data.effectivenessMeasure
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/recommendations/${user.id}/stored`] });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! This helps me provide better recommendations.",
      });
      setSelectedRecommendation(null);
      setFeedbackRating(0);
      setFeedbackComments("");
      setEffectivenessRating(0);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit feedback: " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  // Acknowledge insight mutation
  const acknowledgeInsightMutation = useMutation({
    mutationFn: async (insightId: number) => {
      const response = await apiRequest("POST", `/api/insights/${insightId}/acknowledge`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/insights/${user.id}`] });
    },
  });

  const handleFeedbackSubmit = () => {
    if (!selectedRecommendation?.id) return;
    
    feedbackMutation.mutate({
      id: selectedRecommendation.id,
      feedback: feedbackRating || undefined,
      comments: feedbackComments || undefined,
      effectivenessMeasure: effectivenessRating || undefined
    });
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return "text-red-600 bg-red-50";
    if (priority >= 7) return "text-orange-600 bg-orange-50";
    if (priority >= 5) return "text-blue-600 bg-blue-50";
    return "text-gray-600 bg-gray-50";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "technique": return <Target className="w-4 h-4" />;
      case "scenario": return <BarChart3 className="w-4 h-4" />;
      case "routine": return <Calendar className="w-4 h-4" />;
      case "assessment": return <Brain className="w-4 h-4" />;
      case "chat_followup": return <MessageCircle className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case "improvement": return "text-green-600 bg-green-50";
      case "opportunity": return "text-blue-600 bg-blue-50";
      case "risk": return "text-red-600 bg-red-50";
      case "pattern": return "text-purple-600 bg-purple-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return "Just now";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Coach Recommendations</h2>
          <p className="text-gray-600">Personalized insights based on your progress and chat history</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Brain className="w-3 h-3 mr-1" />
          Powered by Flo AI
        </Badge>
      </div>

      {/* Active Insights */}
      {insights?.insights?.filter((insight: CoachingInsight) => !insight.isAcknowledged).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              New Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.insights
                .filter((insight: CoachingInsight) => !insight.isAcknowledged)
                .slice(0, 3)
                .map((insight: CoachingInsight) => (
                  <div key={insight.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getInsightTypeColor(insight.insightType)}>
                          {insight.insightType}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {insight.impact} impact
                        </Badge>
                      </div>
                      <h4 className="font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acknowledgeInsightMutation.mutate(insight.id)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Got it
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fresh Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            Today's Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecommendations ? (
            <div className="text-center py-6">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
              <p className="text-sm text-gray-600">Analyzing your data to generate personalized recommendations...</p>
            </div>
          ) : recommendations?.recommendations?.length > 0 ? (
            <div className="space-y-4">
              {recommendations.recommendations.map((rec: PersonalizedRecommendation, index: number) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded ${getPriorityColor(rec.priority)}`}>
                        {getTypeIcon(rec.type)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{rec.title}</h3>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Badge variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        {rec.confidenceScore}%
                      </Badge>
                      {rec.expiresIn && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {rec.expiresIn}d
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-700 italic">"{rec.personalizedMessage}"</p>
                  </div>

                  {rec.actionSteps && rec.actionSteps.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Action Steps:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.actionSteps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.relatedChatMessages && rec.relatedChatMessages.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Related to our conversation:</h4>
                      <div className="bg-blue-50 rounded-lg p-3">
                        {rec.relatedChatMessages.map((msg: any, msgIndex: number) => (
                          <div key={msgIndex} className="text-sm">
                            <span className="font-medium text-blue-900">
                              {msg.role === "user" ? "You" : "Flo"}:
                            </span>
                            <span className="text-blue-800 ml-2">
                              {msg.content.substring(0, 100)}
                              {msg.content.length > 100 ? "..." : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {rec.followUpQuestions && rec.followUpQuestions.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Follow-up Questions:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {rec.followUpQuestions.map((question, qIndex) => (
                          <li key={qIndex} className="flex items-start gap-2">
                            <MessageCircle className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
                            {question}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Expected outcome: {rec.expectedOutcome}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedRecommendation(rec)}
                        >
                          Provide Feedback
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Recommendation Feedback</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">How helpful was this recommendation? (1-5)</label>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  size="sm"
                                  variant={feedbackRating === rating ? "default" : "outline"}
                                  onClick={() => setFeedbackRating(rating)}
                                >
                                  {rating}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Did you try this recommendation? Rate effectiveness (1-5)</label>
                            <div className="flex gap-1 mt-2">
                              {[1, 2, 3, 4, 5].map((rating) => (
                                <Button
                                  key={rating}
                                  size="sm"
                                  variant={effectivenessRating === rating ? "default" : "outline"}
                                  onClick={() => setEffectivenessRating(rating)}
                                >
                                  {rating}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Additional comments (optional)</label>
                            <Textarea
                              value={feedbackComments}
                              onChange={(e) => setFeedbackComments(e.target.value)}
                              placeholder="Tell me how it went, any challenges, or suggestions..."
                              className="mt-2"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              onClick={handleFeedbackSubmit}
                              disabled={feedbackMutation.isPending}
                              className="flex-1"
                            >
                              Submit Feedback
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Continue chatting with me to get personalized recommendations!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendation History */}
      {storedRecommendations?.recommendations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Recommendation History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {storedRecommendations.recommendations.map((rec: any) => (
                  <div key={rec.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{rec.personalizedMessage}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(rec.createdAt)}
                        </span>
                        {rec.userFeedback && (
                          <Badge variant="outline" className="text-xs">
                            Rated {rec.userFeedback}/5
                          </Badge>
                        )}
                        {rec.wasApplied && (
                          <Badge className="text-xs bg-green-100 text-green-800">
                            Applied
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}