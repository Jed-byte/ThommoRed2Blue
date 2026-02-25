import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, Brain, AlertTriangle, CheckCircle, Clock, Star, TrendingUp, Eye, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const controlCircleSchema = z.object({
  context: z.string().min(1, "Context is required"),
  cantControl: z.array(z.string()).min(1, "Add at least one item you can't control"),
  canInfluence: z.array(z.string()).min(1, "Add at least one item you can influence"),
  canControl: z.array(z.string()).min(1, "Add at least one item you can control"),
  reflections: z.string().optional()
});

const recognitionSchema = z.object({
  scenario: z.string().min(1, "Scenario is required"),
  redIndicators: z.array(z.string()).min(1, "Add at least one red indicator"),
  blueIndicators: z.array(z.string()).min(1, "Add at least one blue indicator"),
  demeanourScore: z.number().min(1).max(10),
  communicationScore: z.number().min(1).max(10),
  decisionMakingScore: z.number().min(1).max(10),
  executionScore: z.number().min(1).max(10),
  overallState: z.enum(["red", "blue", "transitional"]),
  actionPlan: z.string().optional()
});

const whatIfSchema = z.object({
  scenario: z.string().min(1, "Scenario is required"),
  riskRating: z.number().min(1).max(10),
  impactRating: z.number().min(1).max(10),
  blueStrategy: z.string().min(1, "Blue strategy is required"),
  notes: z.string().optional()
});

const screwUpSchema = z.object({
  category: z.enum(["golf", "general", "performance"]),
  screwUpDescription: z.string().min(1, "Description is required"),
  frequency: z.number().min(1).max(10),
  preventionStrategy: z.string().min(1, "Prevention strategy is required"),
  triggerWarnings: z.array(z.string()).optional(),
  recoveryActions: z.array(z.string()).optional()
});

const prioritySchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  primaryIndicator: z.string().min(1, "Primary indicator is required"),
  primaryResponsibility: z.string().min(1, "Primary responsibility is required"),
  criticalBuildingBlocks: z.array(z.string()).min(1, "Add at least one building block"),
  responsibilities: z.array(z.string()).min(1, "Add at least one responsibility"),
  keyActions: z.array(z.string()).min(1, "Add at least one key action"),
  keyIndicators: z.array(z.string()).min(1, "Add at least one indicator")
});

export default function CoachingTools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");

  // Control Circles form
  const controlCircleForm = useForm({
    resolver: zodResolver(controlCircleSchema),
    defaultValues: {
      context: "",
      cantControl: [""],
      canInfluence: [""],
      canControl: [""],
      reflections: ""
    }
  });

  // Recognition Assessment form
  const recognitionForm = useForm({
    resolver: zodResolver(recognitionSchema),
    defaultValues: {
      scenario: "",
      redIndicators: [""],
      blueIndicators: [""],
      demeanourScore: 5,
      communicationScore: 5,
      decisionMakingScore: 5,
      executionScore: 5,
      overallState: "transitional" as const,
      actionPlan: ""
    }
  });

  // What If Planning form
  const whatIfForm = useForm({
    resolver: zodResolver(whatIfSchema),
    defaultValues: {
      scenario: "",
      riskRating: 5,
      impactRating: 5,
      blueStrategy: "",
      notes: ""
    }
  });

  // Screw Up Cascade form
  const screwUpForm = useForm({
    resolver: zodResolver(screwUpSchema),
    defaultValues: {
      category: "golf" as const,
      screwUpDescription: "",
      frequency: 5,
      preventionStrategy: "",
      triggerWarnings: [""],
      recoveryActions: [""]
    }
  });

  // Priority Planning form
  const priorityForm = useForm({
    resolver: zodResolver(prioritySchema),
    defaultValues: {
      purpose: "",
      primaryIndicator: "",
      primaryResponsibility: "",
      criticalBuildingBlocks: [""],
      responsibilities: [""],
      keyActions: [""],
      keyIndicators: [""]
    }
  });

  // Fetch certification progress
  const { data: certificationProgress } = useQuery({
    queryKey: [`/api/certification-progress/${user?.id}`],
    enabled: !!user?.id
  });

  // Control Circles mutation
  const controlCircleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof controlCircleSchema>) => {
      return apiRequest("POST", "/api/control-circles", data);
    },
    onSuccess: () => {
      toast({ title: "Control Circle created successfully!" });
      controlCircleForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/control-circles/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Recognition Assessment mutation
  const recognitionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof recognitionSchema>) => {
      return apiRequest("POST", "/api/recognition-assessments", data);
    },
    onSuccess: () => {
      toast({ title: "Recognition Assessment completed!" });
      recognitionForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/recognition-assessments/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // What If Planning mutation
  const whatIfMutation = useMutation({
    mutationFn: async (data: z.infer<typeof whatIfSchema>) => {
      return apiRequest("POST", "/api/what-if-plans", data);
    },
    onSuccess: () => {
      toast({ title: "What If Plan created successfully!" });
      whatIfForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/what-if-plans/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Screw Up Cascade mutation
  const screwUpMutation = useMutation({
    mutationFn: async (data: z.infer<typeof screwUpSchema>) => {
      return apiRequest("POST", "/api/screw-up-cascades", data);
    },
    onSuccess: () => {
      toast({ title: "Screw Up Cascade created successfully!" });
      screwUpForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/screw-up-cascades/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  // Priority Planning mutation
  const priorityMutation = useMutation({
    mutationFn: async (data: z.infer<typeof prioritySchema>) => {
      return apiRequest("POST", "/api/priority-plans", data);
    },
    onSuccess: () => {
      toast({ title: "Priority Plan created successfully!" });
      priorityForm.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/priority-plans/${user?.id}`] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const addArrayField = (formName: "controlCircle" | "recognition" | "whatIf" | "screwUp" | "priority", field: string) => {
    const form = formName === "controlCircle" ? controlCircleForm : 
                 formName === "recognition" ? recognitionForm :
                 formName === "whatIf" ? whatIfForm :
                 formName === "screwUp" ? screwUpForm : priorityForm;
    
    const currentValues = form.getValues(field as any) || [];
    form.setValue(field as any, [...currentValues, ""]);
  };

  const removeArrayField = (formName: "controlCircle" | "recognition" | "whatIf" | "screwUp" | "priority", field: string, index: number) => {
    const form = formName === "controlCircle" ? controlCircleForm : 
                 formName === "recognition" ? recognitionForm :
                 formName === "whatIf" ? whatIfForm :
                 formName === "screwUp" ? screwUpForm : priorityForm;
    
    const currentValues = form.getValues(field as any) || [];
    if (currentValues.length > 1) {
      form.setValue(field as any, currentValues.filter((_: any, i: number) => i !== index));
    }
  };

  const certificationTools = [
    { name: "Control Circles", completed: false, category: "Foundation" },
    { name: "Recognition Assessment", completed: false, category: "Assessment" },
    { name: "What If Planning", completed: false, category: "Preparation" },
    { name: "Screw Up Cascade", completed: false, category: "Prevention" },
    { name: "Priority Planning", completed: false, category: "Strategic" },
  ];

  const overallProgress = (certificationProgress?.toolsCompleted?.length || 0) / certificationTools.length * 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Red2Blue Coaching Tools</h1>
            <p className="text-gray-600 mt-2">Complete certification curriculum for mental performance mastery</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Level: {certificationProgress?.certificationLevel || "Beginner"}
          </Badge>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Certification Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {certificationTools.map((tool) => (
                  <div key={tool.name} className="flex items-center space-x-2">
                    <CheckCircle className={`h-4 w-4 ${tool.completed ? 'text-green-500' : 'text-gray-300'}`} />
                    <div>
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-gray-500">{tool.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 text-xs">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="pre-shot">Pre-Shot</TabsTrigger>
          <TabsTrigger value="mental-skills">X-Check</TabsTrigger>
          <TabsTrigger value="control-circles">Circles</TabsTrigger>
          <TabsTrigger value="mindset-map">Map</TabsTrigger>
          <TabsTrigger value="what-if">What Ifs</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("pre-shot")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Pre-Shot Routine
                </CardTitle>
                <CardDescription>
                  Build consistent pre-performance routines for optimal mental preparation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Develop repeatable preparation sequences for consistency.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("mental-skills")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Mental Skills X-Check
                </CardTitle>
                <CardDescription>
                  Comprehensive assessment of mental performance across four key areas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Evaluate intensity, decisions, focus, and execution.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("control-circles")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-red-600" />
                  Control Circles
                </CardTitle>
                <CardDescription>
                  Identify what you can control, influence, and must accept. The foundation of mental clarity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Develop awareness of attention control and energy management.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("mindset-map")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Mindset Map
                </CardTitle>
                <CardDescription>
                  Visual framework for understanding Red Head vs Blue Head mental states.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Map mental states and transition strategies.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("what-if")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  What Ifs Planning
                </CardTitle>
                <CardDescription>
                  Prepare strategies for challenging scenarios before they happen.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Proactive preparation and strategy development.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("recognition")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-yellow-600" />
                  Recognition Radar
                </CardTitle>
                <CardDescription>
                  Identify red and blue behaviors and triggers in yourself and others.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Build awareness of performance states and triggers.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("screw-up")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Screw Up Cascade
                </CardTitle>
                <CardDescription>
                  Identify common mistakes and develop prevention strategies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Mistake prevention and recovery planning.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("priority")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  Priority Planner
                </CardTitle>
                <CardDescription>
                  Structure your focus on what matters most for peak performance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Purpose:</strong> Strategic focus and priority management.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Certification Status
                </CardTitle>
                <CardDescription>
                  Track your progress toward Red2Blue certification.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Complete all tools and practice under pressure to advance your certification level.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="control-circles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Control Circles Tool</CardTitle>
                  <CardDescription>
                    Clarity around what you can and cannot control helps direct your attention and energy effectively.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Guide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={controlCircleForm.handleSubmit((data) => controlCircleMutation.mutate(data))} className="space-y-6">
                <div>
                  <Label htmlFor="context">Context/Situation</Label>
                  <Input 
                    id="context"
                    placeholder="e.g., Tournament final round, Practice session"
                    {...controlCircleForm.register("context")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-red-600">Can't Control</Label>
                    <p className="text-xs text-gray-500 mb-2">Things completely outside your influence</p>
                    {controlCircleForm.watch("cantControl").map((_, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input 
                          placeholder="e.g., Weather, Other players"
                          {...controlCircleForm.register(`cantControl.${index}`)}
                        />
                        {controlCircleForm.watch("cantControl").length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeArrayField("controlCircle", "cantControl", index)}
                          >
                            −
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addArrayField("controlCircle", "cantControl")}
                    >
                      Add Item
                    </Button>
                  </div>

                  <div>
                    <Label className="text-yellow-600">Can Influence</Label>
                    <p className="text-xs text-gray-500 mb-2">Things you can partially affect</p>
                    {controlCircleForm.watch("canInfluence").map((_, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input 
                          placeholder="e.g., Team dynamics, Playing partners"
                          {...controlCircleForm.register(`canInfluence.${index}`)}
                        />
                        {controlCircleForm.watch("canInfluence").length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeArrayField("controlCircle", "canInfluence", index)}
                          >
                            −
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addArrayField("controlCircle", "canInfluence")}
                    >
                      Add Item
                    </Button>
                  </div>

                  <div>
                    <Label className="text-green-600">Can Control</Label>
                    <p className="text-xs text-gray-500 mb-2">Things completely within your control</p>
                    {controlCircleForm.watch("canControl").map((_, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input 
                          placeholder="e.g., Breathing, Pre-shot routine"
                          {...controlCircleForm.register(`canControl.${index}`)}
                        />
                        {controlCircleForm.watch("canControl").length > 1 && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeArrayField("controlCircle", "canControl", index)}
                          >
                            −
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => addArrayField("controlCircle", "canControl")}
                    >
                      Add Item
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reflections">Reflections</Label>
                  <Textarea 
                    id="reflections"
                    placeholder="Reflect on what happens when your attention stays on what you don't have control over. How does having clarity around this help?"
                    {...controlCircleForm.register("reflections")}
                  />
                </div>

                <Button type="submit" disabled={controlCircleMutation.isPending}>
                  {controlCircleMutation.isPending ? "Saving..." : "Save Control Circle"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pre-shot" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pre-Shot Routine Builder</CardTitle>
                  <CardDescription>
                    Build consistent, repeatable routines for optimal mental preparation before each shot.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Guide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Coming soon: Interactive pre-shot routine builder with timing, visualization, and physical preparation steps.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mental-skills" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mental Skills X-Check</CardTitle>
                  <CardDescription>
                    Comprehensive assessment across four key mental performance areas: Intensity, Decision Making, Diversions, and Execution.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Guide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Coming soon: Complete mental skills assessment tool with scoring and personalized feedback.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mindset-map" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Mindset Map</CardTitle>
                  <CardDescription>
                    Visual framework for understanding and transitioning between Red Head and Blue Head mental states.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Guide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Coming soon: Interactive mindset mapping tool with state transitions and recovery strategies.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="what-if" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>What If's Planning Tool</CardTitle>
                  <CardDescription>
                    Prepare strategies for challenging scenarios before they happen. Build mental resilience through scenario planning.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Guide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Coming soon: Scenario planning tool for pressure situations, course challenges, and performance obstacles.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recognition Radar</CardTitle>
                  <CardDescription>
                    Identify red and blue behaviors and triggers in yourself and others. Build awareness for better performance states.
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF Guide
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Coming soon: Behavioral awareness tool for recognizing performance state indicators and triggers.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
      </Tabs>
    </div>
  );
}