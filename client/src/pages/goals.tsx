import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Plus, Target, Trophy, Clock, Trash2, Edit3, BarChart3, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import type { UserGoal } from "@shared/schema";

const goalFormSchema = z.object({
  goalText: z.string().min(5, "Goal must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  notes: z.string().optional(),
  priority: z.number().min(1).max(5),
  targetDate: z.date().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

const goalCategories = [
  { value: "technical", label: "Technical Skills", color: "bg-blue-100 text-blue-800" },
  { value: "mental", label: "Mental Game", color: "bg-purple-100 text-purple-800" },
  { value: "physical", label: "Physical Fitness", color: "bg-green-100 text-green-800" },
  { value: "strategy", label: "Course Strategy", color: "bg-orange-100 text-orange-800" },
  { value: "equipment", label: "Equipment", color: "bg-gray-100 text-gray-800" },
  { value: "tournament", label: "Tournament", color: "bg-red-100 text-red-800" },
  { value: "other", label: "Other", color: "bg-yellow-100 text-yellow-800" }
];

const priorityLabels = {
  1: { label: "Low", color: "bg-gray-100 text-gray-800" },
  2: { label: "Below Average", color: "bg-blue-100 text-blue-800" },
  3: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  4: { label: "High", color: "bg-orange-100 text-orange-800" },
  5: { label: "Critical", color: "bg-red-100 text-red-800" }
};

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);

  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      goalText: "",
      category: "",
      notes: "",
      priority: 3,
      targetDate: undefined,
    },
  });

  // Fetch user goals
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["/api/goals", user?.id],
    enabled: !!user?.id,
  });

  // Create goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: GoalFormData) => {
      return apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Created",
        description: "Your new goal has been added successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal.",
        variant: "destructive",
      });
    },
  });

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<UserGoal> }) => {
      return apiRequest("PUT", `/api/goals/${data.id}`, data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Updated",
        description: "Your goal has been updated successfully.",
      });
      setEditingGoal(null);
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update goal.",
        variant: "destructive",
      });
    },
  });

  // Toggle completion mutation
  const toggleCompletionMutation = useMutation({
    mutationFn: async (data: { id: number; isCompleted: boolean }) => {
      return apiRequest("PATCH", `/api/goals/${data.id}/toggle`, { isCompleted: data.isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Updated",
        description: "Goal completion status updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update goal.",
        variant: "destructive",
      });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Goal Deleted",
        description: "Your goal has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete goal.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GoalFormData) => {
    if (editingGoal) {
      updateGoalMutation.mutate({ id: editingGoal.id, updates: data });
    } else {
      createGoalMutation.mutate(data);
    }
  };

  const handleEdit = (goal: UserGoal) => {
    setEditingGoal(goal);
    form.reset({
      goalText: goal.goalText,
      category: goal.category,
      notes: goal.notes || "",
      priority: goal.priority || 3,
      targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
    });
    setIsDialogOpen(true);
  };

  const handleToggleCompletion = (goal: UserGoal) => {
    toggleCompletionMutation.mutate({
      id: goal.id,
      isCompleted: !goal.isCompleted
    });
  };

  const handleDelete = (goalId: number) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      deleteGoalMutation.mutate(goalId);
    }
  };

  const getCategoryInfo = (category: string) => {
    return goalCategories.find(c => c.value === category) || goalCategories[goalCategories.length - 1];
  };

  const getPriorityInfo = (priority: number | null) => {
    return priorityLabels[priority as keyof typeof priorityLabels] || priorityLabels[3];
  };

  const completedGoals = goals.filter((goal: UserGoal) => goal.isCompleted);
  const activeGoals = goals.filter((goal: UserGoal) => !goal.isCompleted);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="h-8 w-8 text-blue-600" />
              Golf Goals
            </h1>
            <p className="text-gray-600 mt-1">Track your golf improvement goals and celebrate achievements</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingGoal(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingGoal ? "Edit Goal" : "Create New Goal"}</DialogTitle>
                <DialogDescription>
                  {editingGoal ? "Update your goal details below." : "Set a new goal to track your golf improvement."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="goalText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Goal Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Improve putting accuracy from 10 feet to 80%"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {goalCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(priorityLabels).map(([value, info]) => (
                                <SelectItem key={value} value={value}>
                                  {info.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes or action steps..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                      className="flex-1"
                    >
                      {editingGoal ? "Update Goal" : "Create Goal"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goals.length}</div>
              <p className="text-xs text-muted-foreground">
                All time goals set
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeGoals.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently working on
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedGoals.length}</div>
              <p className="text-xs text-muted-foreground">
                {goals.length > 0 ? `${Math.round((completedGoals.length / goals.length) * 100)}% completion rate` : "No goals yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Active Goals ({activeGoals.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeGoals.map((goal: UserGoal) => {
                const categoryInfo = getCategoryInfo(goal.category);
                const priorityInfo = getPriorityInfo(goal.priority);
                
                return (
                  <Card key={goal.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={categoryInfo.color} variant="secondary">
                              {categoryInfo.label}
                            </Badge>
                            <Badge className={priorityInfo.color} variant="secondary">
                              {priorityInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={goal.isCompleted || false}
                            onCheckedChange={() => handleToggleCompletion(goal)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-900 mb-3 font-medium">
                        {goal.goalText}
                      </p>
                      
                      {goal.notes && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {goal.notes}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        {goal.targetDate && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Target: {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created: {format(new Date(goal.createdAt!), "MMM dd, yyyy")}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(goal)}
                          className="flex-1"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(goal.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600" />
              Completed Goals ({completedGoals.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedGoals.map((goal: UserGoal) => {
                const categoryInfo = getCategoryInfo(goal.category);
                const priorityInfo = getPriorityInfo(goal.priority);
                
                return (
                  <Card key={goal.id} className="border-l-4 border-l-green-500 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={categoryInfo.color} variant="secondary">
                              {categoryInfo.label}
                            </Badge>
                            <Badge className="bg-green-100 text-green-800" variant="secondary">
                              Completed
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={true}
                            onCheckedChange={() => handleToggleCompletion(goal)}
                            className="data-[state=checked]:bg-green-600"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-gray-900 mb-3 font-medium line-through opacity-75">
                        {goal.goalText}
                      </p>
                      
                      {goal.notes && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {goal.notes}
                        </p>
                      )}
                      
                      <div className="space-y-2 text-xs text-gray-500">
                        {goal.completedAt && (
                          <div className="flex items-center gap-1 text-green-600">
                            <Trophy className="h-3 w-3" />
                            Completed: {format(new Date(goal.completedAt), "MMM dd, yyyy")}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created: {format(new Date(goal.createdAt!), "MMM dd, yyyy")}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(goal.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start tracking your golf improvement by setting specific, measurable goals. 
                Goals help you focus your practice and measure progress over time.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Goal
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}

        {/* Link to Golf Stats */}
        {goals.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Track Progress in Golf Stats</h3>
                  <p className="text-sm text-blue-700">
                    View your goal achievements and progress trends in your comprehensive golf statistics dashboard.
                  </p>
                </div>
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Golf Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}