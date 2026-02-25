import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Timer, Play, Pause, RotateCcw, Plus, Edit, Trash2, Save, Target } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertPreShotRoutineSchema, type PreShotRoutine } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

const routineStepSchema = z.object({
  name: z.string().min(1, "Step name required"),
  description: z.string().min(1, "Step description required"),
  duration: z.number().min(1, "Duration must be at least 1 second").max(60, "Duration cannot exceed 60 seconds"),
});

const formSchema = z.object({
  name: z.string().min(1, "Routine name required"),
  description: z.string().optional(),
  userId: z.number(),
  steps: z.array(routineStepSchema).min(1, "At least one step required"),
  isActive: z.boolean().default(true),
});

interface PreShotRoutineBuilderProps {
  userId: number;
}

export function PreShotRoutineBuilder({ userId }: PreShotRoutineBuilderProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<PreShotRoutine | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's routines
  const { data: routines = [], isLoading } = useQuery({
    queryKey: ['/api/pre-shot-routines', userId],
    queryFn: () => fetch(`/api/pre-shot-routines/${userId}`).then(res => {
      if (!res.ok) return [];
      return res.json();
    }) as Promise<PreShotRoutine[]>,
    retry: false
  });

  // Get active routine
  const activeRoutine = routines.find(r => r.isActive);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      userId,
      steps: [
        { name: "Setup & Alignment", description: "Position yourself and align to target", duration: 10 },
        { name: "Breathing", description: "Take deep breaths to center yourself", duration: 5 },
        { name: "Visualization", description: "See the perfect shot in your mind", duration: 8 },
        { name: "Final Check", description: "Quick final alignment check", duration: 3 }
      ],
      isActive: true
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps",
  });

  // Create routine mutation
  const createRoutineMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        ...data,
        steps: JSON.stringify(data.steps)
      };
      return apiRequest('POST', '/api/pre-shot-routines', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pre-shot-routines', userId] });
      setShowCreateDialog(false);
      form.reset();
      toast({
        title: "Routine Created",
        description: "Your pre-shot routine has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create routine. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update routine mutation
  const updateRoutineMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<PreShotRoutine> }) => {
      return apiRequest('PUT', `/api/pre-shot-routines/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pre-shot-routines', userId] });
      setEditingRoutine(null);
      toast({
        title: "Routine Updated",
        description: "Your pre-shot routine has been updated successfully.",
      });
    }
  });

  // Delete routine mutation
  const deleteRoutineMutation = useMutation({
    mutationFn: async (routineId: number) => {
      return apiRequest('DELETE', `/api/pre-shot-routines/${routineId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/pre-shot-routines', userId] });
      toast({
        title: "Routine Deleted",
        description: "Routine has been removed from your profile.",
      });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingRoutine) {
      updateRoutineMutation.mutate({
        id: editingRoutine.id,
        updates: {
          ...data,
          steps: JSON.stringify(data.steps)
        }
      });
    } else {
      createRoutineMutation.mutate(data);
    }
  };

  const startRoutine = () => {
    if (!activeRoutine?.steps) return;
    
    setIsRunning(true);
    setCurrentStep(0);
    const steps = JSON.parse(activeRoutine.steps as string);
    const firstStep = steps[0];
    setTimeLeft(firstStep.duration);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCurrentStep(curr => {
            const nextStep = curr + 1;
            if (nextStep >= steps.length) {
              clearInterval(interval);
              setIsRunning(false);
              toast({
                title: "Routine Complete",
                description: "Great job! Your pre-shot routine is finished.",
              });
              return 0;
            } else {
              const step = steps[nextStep];
              setTimeLeft(step.duration);
              return nextStep;
            }
          });
          return steps[currentStep + 1]?.duration || 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseRoutine = () => {
    setIsRunning(false);
  };

  const resetRoutine = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTimeLeft(0);
  };

  const setActiveRoutine = (routineId: number) => {
    // First deactivate all routines
    routines.forEach(routine => {
      if (routine.id !== routineId && routine.isActive) {
        updateRoutineMutation.mutate({
          id: routine.id,
          updates: { isActive: false }
        });
      }
    });
    
    // Then activate the selected routine
    updateRoutineMutation.mutate({
      id: routineId,
      updates: { isActive: true }
    });
  };

  const editRoutine = (routine: PreShotRoutine) => {
    const steps = routine.steps ? JSON.parse(routine.steps as string) : [];
    form.reset({
      name: routine.name,
      description: routine.description || "",
      userId: routine.userId,
      steps,
      isActive: routine.isActive || false
    });
    setEditingRoutine(routine);
    setShowCreateDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Routine Practice */}
      {activeRoutine && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-5 w-5" />
                <CardTitle>{activeRoutine.name}</CardTitle>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <CardDescription>
              {activeRoutine.description || "Practice your pre-shot routine"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Step Display */}
            {isRunning && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="text-center space-y-2">
                    <div className="text-3xl font-bold text-blue-900">{timeLeft}s</div>
                    <h4 className="font-semibold text-blue-900">
                      {JSON.parse(activeRoutine.steps as string)[currentStep]?.name}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {JSON.parse(activeRoutine.steps as string)[currentStep]?.description}
                    </p>
                    <div className="text-xs text-blue-600">
                      Step {currentStep + 1} of {JSON.parse(activeRoutine.steps as string).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Steps Preview */}
            {!isRunning && (
              <div className="space-y-3">
                <h4 className="font-semibold">Routine Steps:</h4>
                {JSON.parse(activeRoutine.steps as string).map((step: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{step.name}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                    <Badge variant="outline">{step.duration}s</Badge>
                  </div>
                ))}
              </div>
            )}

            <Separator />

            {/* Controls */}
            <div className="flex justify-center space-x-2">
              {!isRunning ? (
                <Button onClick={startRoutine} className="flex items-center space-x-2">
                  <Play className="h-4 w-4" />
                  <span>Start Routine</span>
                </Button>
              ) : (
                <Button onClick={pauseRoutine} variant="secondary" className="flex items-center space-x-2">
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </Button>
              )}
              <Button onClick={resetRoutine} variant="outline" className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Routine Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>My Pre-Shot Routines</span>
              </CardTitle>
              <CardDescription>
                Create, edit, and manage your personalized pre-shot routines
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingRoutine(null);
                    form.reset({
                      name: "",
                      description: "",
                      userId,
                      steps: [
                        { name: "Setup & Alignment", description: "Position yourself and align to target", duration: 10 },
                        { name: "Breathing", description: "Take deep breaths to center yourself", duration: 5 },
                        { name: "Visualization", description: "See the perfect shot in your mind", duration: 8 },
                        { name: "Final Check", description: "Quick final alignment check", duration: 3 }
                      ],
                      isActive: routines.length === 0
                    });
                  }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Routine</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRoutine ? "Edit Routine" : "Create New Pre-Shot Routine"}
                  </DialogTitle>
                  <DialogDescription>
                    Build a personalized routine that will be saved to your profile
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Routine Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Tournament Routine" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Routine for important tournaments" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Routine Steps</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ name: "", description: "", duration: 5 })}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Step
                        </Button>
                      </div>
                      
                      {fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                          <div className="grid grid-cols-12 gap-4 items-end">
                            <div className="col-span-3">
                              <FormField
                                control={form.control}
                                name={`steps.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Step Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Breathing" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="col-span-5">
                              <FormField
                                control={form.control}
                                name={`steps.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Take 3 deep breaths to center yourself" {...field} />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <FormField
                                control={form.control}
                                name={`steps.${index}.duration`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Duration (sec)</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        max="60" 
                                        {...field} 
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="col-span-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createRoutineMutation.isPending || updateRoutineMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {editingRoutine ? "Update Routine" : "Save Routine"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {routines.length === 0 ? (
            <div className="text-center py-8">
              <Timer className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Pre-Shot Routines</h3>
              <p className="text-gray-500 mb-4">Create your first personalized routine to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {routines.map((routine) => (
                <Card key={routine.id} className={`${routine.isActive ? 'border-blue-500 bg-blue-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{routine.name}</h4>
                          {routine.isActive && <Badge variant="default" className="text-xs">Active</Badge>}
                        </div>
                        {routine.description && (
                          <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {routine.steps ? JSON.parse(routine.steps as string).length : 0} steps • 
                          Total: {routine.steps ? JSON.parse(routine.steps as string).reduce((sum: number, step: any) => sum + step.duration, 0) : 0}s
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!routine.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveRoutine(routine.id)}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => editRoutine(routine)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => deleteRoutineMutation.mutate(routine.id)}
                          disabled={routine.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}