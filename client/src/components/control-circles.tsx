import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CircleDot, Plus, X, Eye, EyeOff, Lightbulb } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertControlCircleSchema, type ControlCircle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const formSchema = insertControlCircleSchema.extend({
  cantControlItems: z.array(z.string().min(1)),
  canInfluenceItems: z.array(z.string().min(1)),
  canControlItems: z.array(z.string().min(1)),
});

interface ControlCirclesProps {
  userId: number;
}

export function ControlCircles({ userId }: ControlCirclesProps) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: latestCircle } = useQuery({
    queryKey: ['/api/control-circles/latest'],
    queryFn: () => fetch('/api/control-circles/latest').then(res => res.json()) as Promise<ControlCircle>
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      context: "",
      reflections: "",
      cantControlItems: [""],
      canInfluenceItems: [""],
      canControlItems: [""]
    },
  });

  const { fields: cantControlFields, append: appendCantControl, remove: removeCantControl } = useFieldArray({
    control: form.control,
    name: "cantControlItems"
  });

  const { fields: canInfluenceFields, append: appendCanInfluence, remove: removeCanInfluence } = useFieldArray({
    control: form.control,
    name: "canInfluenceItems"
  });

  const { fields: canControlFields, append: appendCanControl, remove: removeCanControl } = useFieldArray({
    control: form.control,
    name: "canControlItems"
  });

  const createCircleMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const payload = {
        context: data.context || null,
        reflections: data.reflections || null,
        cantControl: data.cantControlItems.filter(item => item.trim() !== ""),
        canInfluence: data.canInfluenceItems.filter(item => item.trim() !== ""),
        canControl: data.canControlItems.filter(item => item.trim() !== "")
      };
      return apiRequest('POST', '/api/control-circles', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/control-circles/latest'] });
      setShowForm(false);
      form.reset();
      toast({
        title: "Exercise Complete!",
        description: "Your Control Circles exercise has been saved successfully.",
        variant: "default",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createCircleMutation.mutate(data);
  };

  if (showForm) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CircleDot className="h-5 w-5" />
              <CardTitle>Control Circles Exercise</CardTitle>
            </div>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
          <CardDescription>
            Identify what you can and cannot control to focus your mental energy effectively
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context (Situation/Round)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Upcoming tournament, difficult course conditions" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Can't Control */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <h4 className="font-semibold text-lg">Can't Control</h4>
                </div>
                <p className="text-sm text-gray-600">Things completely outside your influence</p>
                
                {cantControlFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name={`cantControlItems.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="e.g., Weather conditions, other players' performance"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {cantControlFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCantControl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCantControl("")}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </div>

              {/* Can Influence */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-semibold text-lg">Can Influence</h4>
                </div>
                <p className="text-sm text-gray-600">Things you can partially affect through your actions</p>
                
                {canInfluenceFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name={`canInfluenceItems.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="e.g., Course management, playing partners' mood"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {canInfluenceFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCanInfluence(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCanInfluence("")}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </div>

              {/* Can Control */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-lg">Can Control</h4>
                </div>
                <p className="text-sm text-gray-600">Things completely within your control</p>
                
                {canControlFields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-2">
                    <FormField
                      control={form.control}
                      name={`canControlItems.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input 
                              placeholder="e.g., Pre-shot routine, effort level, attitude"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {canControlFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCanControl(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendCanControl("")}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </Button>
              </div>

              <Separator />

              <FormField
                control={form.control}
                name="reflections"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reflections & Action Steps</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="How will you focus your energy on what you can control? What specific actions will you take?"
                        rows={4}
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createCircleMutation.isPending}
              >
                {createCircleMutation.isPending ? "Saving..." : "Complete Exercise"}
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
            <CircleDot className="h-5 w-5" />
            <CardTitle>Control Circles</CardTitle>
          </div>
          <Button onClick={() => setShowForm(true)}>
            New Exercise
          </Button>
        </div>
        <CardDescription>
          Focus your mental energy on what you can control
        </CardDescription>
      </CardHeader>
      <CardContent>
        {latestCircle ? (
          <div className="space-y-6">
            {latestCircle.context && (
              <div>
                <Badge variant="outline">{latestCircle.context}</Badge>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {/* Can't Control */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <h4 className="font-semibold text-red-700">Can't Control</h4>
                </div>
                <div className="space-y-2">
                  {(latestCircle.cantControl as string[] || []).map((item, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-500">
                      <p className="text-sm text-red-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Can Influence */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h4 className="font-semibold text-yellow-700">Can Influence</h4>
                </div>
                <div className="space-y-2">
                  {(latestCircle.canInfluence as string[] || []).map((item, index) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-500">
                      <p className="text-sm text-yellow-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Can Control */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h4 className="font-semibold text-green-700">Can Control</h4>
                </div>
                <div className="space-y-2">
                  {(latestCircle.canControl as string[] || []).map((item, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                      <p className="text-sm text-green-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {latestCircle.reflections && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Reflections & Action Steps</span>
                </div>
                <p className="text-blue-700 text-sm">{latestCircle.reflections}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CircleDot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Control Circles exercise completed</h3>
            <p className="text-gray-500 mb-4">Start focusing your mental energy effectively</p>
            <Button onClick={() => setShowForm(true)}>
              Complete First Exercise
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}