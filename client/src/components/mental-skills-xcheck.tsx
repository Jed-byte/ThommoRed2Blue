import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, AlertCircle, TrendingUp, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertMentalSkillsXCheckSchema, type MentalSkillsXCheck } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertMentalSkillsXCheckSchema.extend({
  intensity1: z.number().min(0).max(100),
  intensity2: z.number().min(0).max(100),
  intensity3: z.number().min(0).max(100),
  decisionMaking1: z.number().min(0).max(100),
  decisionMaking2: z.number().min(0).max(100),
  decisionMaking3: z.number().min(0).max(100),
  diversions1: z.number().min(0).max(100),
  diversions2: z.number().min(0).max(100),
  diversions3: z.number().min(0).max(100),
  execution1: z.number().min(0).max(100),
  execution2: z.number().min(0).max(100),
  execution3: z.number().min(0).max(100),
});

interface MentalSkillsXCheckProps {
  userId: number;
}

export function MentalSkillsXCheck({ userId }: MentalSkillsXCheckProps) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: latestXCheck } = useQuery({
    queryKey: ['/api/mental-skills-xcheck/latest'],
    queryFn: () => fetch('/api/mental-skills-xcheck/latest').then(res => res.json()) as Promise<MentalSkillsXCheck>
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intensity1: 50,
      intensity2: 50,
      intensity3: 50,
      decisionMaking1: 50,
      decisionMaking2: 50,
      decisionMaking3: 50,
      diversions1: 50,
      diversions2: 50,
      diversions3: 50,
      execution1: 50,
      execution2: 50,
      execution3: 50,
      context: "",
      whatDidWell: "",
      whatCouldDoBetter: "",
      actionPlan: ""
    },
  });

  const createXCheckMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        intensityScores: [data.intensity1, data.intensity2, data.intensity3],
        decisionMakingScores: [data.decisionMaking1, data.decisionMaking2, data.decisionMaking3],
        diversionsScores: [data.diversions1, data.diversions2, data.diversions3],
        executionScores: [data.execution1, data.execution2, data.execution3],
        context: data.context || null,
        whatDidWell: data.whatDidWell || null,
        whatCouldDoBetter: data.whatCouldDoBetter || null,
        actionPlan: data.actionPlan || null
      };
      return apiRequest('POST', '/api/mental-skills-xcheck', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mental-skills-xcheck/latest'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "X-Check Complete!",
        description: "Your results are displayed below. Great work tracking your mental performance!",
        variant: "default",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createXCheckMutation.mutate(data);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const calculateAverage = (scores: number[] | unknown) => {
    if (!Array.isArray(scores) || scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <CardTitle>Mental Skills X-Check</CardTitle>
            </div>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
          <CardDescription>
            Rate yourself on each mental skill area from 0-100 for your last 3 holes/rounds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Context */}
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context (Round, Tournament, Practice)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Tournament Round 1" {...field} value={field.value || ""} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Intensity Scores */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Intensity Management</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <FormField
                      key={`intensity${num}`}
                      control={form.control}
                      name={`intensity${num}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hole/Round {num}</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                              <div className="text-center">
                                <Badge variant={getScoreBadgeVariant(field.value)}>
                                  {field.value}/100
                                </Badge>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Decision Making Scores */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Decision Making</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <FormField
                      key={`decisionMaking${num}`}
                      control={form.control}
                      name={`decisionMaking${num}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hole/Round {num}</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                              <div className="text-center">
                                <Badge variant={getScoreBadgeVariant(field.value)}>
                                  {field.value}/100
                                </Badge>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Diversions Scores */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Managing Diversions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <FormField
                      key={`diversions${num}`}
                      control={form.control}
                      name={`diversions${num}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hole/Round {num}</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                              <div className="text-center">
                                <Badge variant={getScoreBadgeVariant(field.value)}>
                                  {field.value}/100
                                </Badge>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Execution Scores */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Execution</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => (
                    <FormField
                      key={`execution${num}`}
                      control={form.control}
                      name={`execution${num}` as any}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hole/Round {num}</FormLabel>
                          <FormControl>
                            <div className="space-y-2">
                              <Slider
                                value={[field.value]}
                                onValueChange={(value) => field.onChange(value[0])}
                                max={100}
                                step={5}
                                className="w-full"
                              />
                              <div className="text-center">
                                <Badge variant={getScoreBadgeVariant(field.value)}>
                                  {field.value}/100
                                </Badge>
                              </div>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Reflection Questions */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Reflection</h4>
                
                <FormField
                  control={form.control}
                  name="whatDidWell"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What did I do well?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what mental skills you executed well..."
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatCouldDoBetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What could I do better?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Identify areas for improvement..."
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actionPlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action Plan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Specific steps to improve before next round..."
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={createXCheckMutation.isPending}
              >
                {createXCheckMutation.isPending ? "Saving..." : "Complete X-Check"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <CardTitle>Mental Skills X-Check</CardTitle>
          </div>
          <Button onClick={() => setShowForm(true)}>
            New X-Check
          </Button>
        </div>
        <CardDescription>
          Track your mental performance across the 4 key Red2Blue skills
        </CardDescription>
      </CardHeader>
      <CardContent>
        {latestXCheck ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Intensity</h4>
                <div className={`text-2xl font-bold ${getScoreColor(calculateAverage(latestXCheck.intensityScores as number[]))}`}>
                  {calculateAverage(latestXCheck.intensityScores as number[])}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Decision Making</h4>
                <div className={`text-2xl font-bold ${getScoreColor(calculateAverage(latestXCheck.decisionMakingScores as number[]))}`}>
                  {calculateAverage(latestXCheck.decisionMakingScores as number[])}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Diversions</h4>
                <div className={`text-2xl font-bold ${getScoreColor(calculateAverage(latestXCheck.diversionsScores as number[]))}`}>
                  {calculateAverage(latestXCheck.diversionsScores as number[])}
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-sm text-gray-600 mb-2">Execution</h4>
                <div className={`text-2xl font-bold ${getScoreColor(calculateAverage(latestXCheck.executionScores as number[]))}`}>
                  {calculateAverage(latestXCheck.executionScores as number[])}
                </div>
              </div>
            </div>

            {latestXCheck.context && (
              <div>
                <Badge variant="outline">{latestXCheck.context}</Badge>
              </div>
            )}

            {(latestXCheck.whatDidWell || latestXCheck.whatCouldDoBetter || latestXCheck.actionPlan) && (
              <div className="space-y-3">
                {latestXCheck.whatDidWell && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-green-800">What I did well</span>
                    </div>
                    <p className="text-green-700 text-sm">{latestXCheck.whatDidWell}</p>
                  </div>
                )}
                
                {latestXCheck.whatCouldDoBetter && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Areas for improvement</span>
                    </div>
                    <p className="text-yellow-700 text-sm">{latestXCheck.whatCouldDoBetter}</p>
                  </div>
                )}
                
                {latestXCheck.actionPlan && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-blue-800">Action Plan</span>
                    </div>
                    <p className="text-blue-700 text-sm">{latestXCheck.actionPlan}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No X-Check completed yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your mental performance</p>
            <Button onClick={() => setShowForm(true)}>
              Complete First X-Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}