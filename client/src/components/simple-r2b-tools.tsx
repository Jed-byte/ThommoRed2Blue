import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Target, RefreshCw, CircleDot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AssessmentResults } from "@/components/assessment-results";

interface SimpleR2BToolsProps {
  userId: number;
  tool?: "mental-skills" | "control-circles";
}

export function SimpleR2BTools({ userId, tool = "mental-skills" }: SimpleR2BToolsProps) {
  const { toast } = useToast();
  const [completedAssessment, setCompletedAssessment] = useState<any>(null);
  const [formData, setFormData] = useState({
    context: "",
    reflections: "",
    cantControl: "",
    canInfluence: "",
    canControl: "",
    intensityScores: [70, 75, 80],
    decisionMakingScores: [70, 75, 80],
    diversionsScores: [70, 75, 80],
    executionScores: [70, 75, 80],
    whatDidWell: "",
    whatCouldDoBetter: "",
    actionPlan: ""
  });

  const mentalSkillsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/mental-skills-xcheck', data);
    },
    onSuccess: (response, variables) => {
      setCompletedAssessment(variables);
      toast({
        title: "X-Check Complete!",
        description: "Your Mental Skills assessment has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save Mental Skills X-Check",
        variant: "destructive",
      });
    }
  });

  const controlCirclesMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/control-circles', data);
    },
    onSuccess: (response, variables) => {
      setCompletedAssessment(variables);
      toast({
        title: "Exercise Complete!",
        description: "Your Control Circles exercise has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save Control Circles exercise",
        variant: "destructive",
      });
    }
  });

  const handleMentalSkillsSubmit = () => {
    const data = {
      userId,
      intensityScores: formData.intensityScores,
      decisionMakingScores: formData.decisionMakingScores,
      diversionsScores: formData.diversionsScores,
      executionScores: formData.executionScores,
      context: formData.context || "Practice session",
      whatDidWell: formData.whatDidWell || "Good focus and tempo",
      whatCouldDoBetter: formData.whatCouldDoBetter || "Better pre-shot routine",
      actionPlan: formData.actionPlan || "Practice visualization daily"
    };
    mentalSkillsMutation.mutate(data);
  };

  const handleControlCirclesSubmit = () => {
    const data = {
      userId,
      context: formData.context || "Practice session",
      reflections: formData.reflections || "Good exercise for mental clarity",
      cantControl: formData.cantControl.split(',').map(s => s.trim()).filter(Boolean),
      canInfluence: formData.canInfluence.split(',').map(s => s.trim()).filter(Boolean),
      canControl: formData.canControl.split(',').map(s => s.trim()).filter(Boolean)
    };
    controlCirclesMutation.mutate(data);
  };

  if (tool === "mental-skills") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <CardTitle>Mental Skills X-Check</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Input
              id="context"
              placeholder="e.g., Tournament Round 1"
              value={formData.context}
              onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>What did you do well?</Label>
              <Textarea
                placeholder="Describe your strengths..."
                value={formData.whatDidWell}
                onChange={(e) => setFormData(prev => ({ ...prev, whatDidWell: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>What could you do better?</Label>
              <Textarea
                placeholder="Areas for improvement..."
                value={formData.whatCouldDoBetter}
                onChange={(e) => setFormData(prev => ({ ...prev, whatCouldDoBetter: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Action Plan</Label>
            <Textarea
              placeholder="Your specific action steps..."
              value={formData.actionPlan}
              onChange={(e) => setFormData(prev => ({ ...prev, actionPlan: e.target.value }))}
            />
          </div>

          <Button 
            onClick={handleMentalSkillsSubmit}
            disabled={mentalSkillsMutation.isPending}
            className="w-full"
          >
            {mentalSkillsMutation.isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Complete X-Check
              </>
            )}
          </Button>
        </CardContent>
        
        {completedAssessment && (
          <AssessmentResults type="mental-skills" data={completedAssessment} />
        )}
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CircleDot className="h-5 w-5" />
          <CardTitle>Control Circles</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="context">Context</Label>
          <Input
            id="context"
            placeholder="e.g., Tournament Round 1"
            value={formData.context}
            onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-red-600">Can't Control (comma separated)</Label>
            <Textarea
              placeholder="e.g., Weather, Other players, Course conditions"
              value={formData.cantControl}
              onChange={(e) => setFormData(prev => ({ ...prev, cantControl: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-yellow-600">Can Influence (comma separated)</Label>
            <Textarea
              placeholder="e.g., Course strategy, Club selection, Shot selection"
              value={formData.canInfluence}
              onChange={(e) => setFormData(prev => ({ ...prev, canInfluence: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-green-600">Can Control (comma separated)</Label>
            <Textarea
              placeholder="e.g., Pre-shot routine, Breathing, Focus"
              value={formData.canControl}
              onChange={(e) => setFormData(prev => ({ ...prev, canControl: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Reflections</Label>
          <Textarea
            placeholder="What insights did you gain from this exercise?"
            value={formData.reflections}
            onChange={(e) => setFormData(prev => ({ ...prev, reflections: e.target.value }))}
          />
        </div>

        <Button 
          onClick={handleControlCirclesSubmit}
          disabled={controlCirclesMutation.isPending}
          className="w-full"
        >
          {controlCirclesMutation.isPending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Complete Exercise
            </>
          )}
        </Button>
      </CardContent>
      
      {completedAssessment && (
        <AssessmentResults type="control-circles" data={completedAssessment} />
      )}
    </Card>
  );
}