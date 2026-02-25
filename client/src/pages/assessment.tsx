import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Brain, CheckCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

const assessmentSchema = z.object({
  intensityQ1: z.string(),
  intensityQ2: z.string(),
  intensityQ3: z.string(),
  decisionQ1: z.string(),
  decisionQ2: z.string(),
  decisionQ3: z.string(),
  diversionsQ1: z.string(),
  diversionsQ2: z.string(),
  diversionsQ3: z.string(),
  executionQ1: z.string(),
  executionQ2: z.string(),
  executionQ3: z.string(),
});

const questions = {
  intensity: [
    {
      id: "intensityQ1",
      text: "When facing a critical moment in competition, how often do you feel your heart racing or hands shaking?",
      options: [
        { value: "25", label: "Almost always (Red Head)" },
        { value: "50", label: "Often" },
        { value: "75", label: "Sometimes" },
        { value: "100", label: "Rarely (Blue Head)" },
      ]
    },
    {
      id: "intensityQ2", 
      text: "How well do you control your breathing during high-pressure moments?",
      options: [
        { value: "25", label: "Very poorly - it becomes erratic" },
        { value: "50", label: "Somewhat poorly" },
        { value: "75", label: "Fairly well" },
        { value: "100", label: "Very well - stays controlled" },
      ]
    },
    {
      id: "intensityQ3",
      text: "When you feel pressure building, how quickly can you calm yourself?",
      options: [
        { value: "25", label: "I struggle to calm down" },
        { value: "50", label: "Takes several minutes" },
        { value: "75", label: "Within a minute" },
        { value: "100", label: "Almost immediately" },
      ]
    }
  ],
  decision: [
    {
      id: "decisionQ1",
      text: "How confident are you in your strategic decisions under pressure?",
      options: [
        { value: "25", label: "Very uncertain - second-guess myself" },
        { value: "50", label: "Somewhat uncertain" },
        { value: "75", label: "Generally confident" },
        { value: "100", label: "Very confident - trust my choices" },
      ]
    },
    {
      id: "decisionQ2",
      text: "When facing a challenging situation, how clear is your thinking?",
      options: [
        { value: "25", label: "Mind races, can't think clearly" },
        { value: "50", label: "Somewhat cloudy thinking" },
        { value: "75", label: "Generally clear" },
        { value: "100", label: "Crystal clear and focused" },
      ]
    },
    {
      id: "decisionQ3",
      text: "How often do you stick with your first instinct on shot selection?",
      options: [
        { value: "25", label: "Rarely - always change my mind" },
        { value: "50", label: "Sometimes" },
        { value: "75", label: "Usually" },
        { value: "100", label: "Almost always - trust my instincts" },
      ]
    }
  ],
  diversions: [
    {
      id: "diversionsQ1",
      text: "How easily are you distracted by external factors (crowd, noise, weather)?",
      options: [
        { value: "25", label: "Very easily distracted" },
        { value: "50", label: "Somewhat easily" },
        { value: "75", label: "Not very easily" },
        { value: "100", label: "Rarely distracted" },
      ]
    },
    {
      id: "diversionsQ2",
      text: "How often do past mistakes affect your current shot?",
      options: [
        { value: "25", label: "Almost always - can't let go" },
        { value: "50", label: "Often" },
        { value: "75", label: "Sometimes" },
        { value: "100", label: "Rarely - stay present focused" },
      ]
    },
    {
      id: "diversionsQ3",
      text: "How well do you maintain focus throughout an entire round?",
      options: [
        { value: "25", label: "Focus deteriorates quickly" },
        { value: "50", label: "Some lapses in focus" },
        { value: "75", label: "Generally maintain focus" },
        { value: "100", label: "Laser focus throughout" },
      ]
    }
  ],
  execution: [
    {
      id: "executionQ1",
      text: "How often do you execute your intended action under pressure?",
      options: [
        { value: "25", label: "Rarely - pressure affects execution" },
        { value: "50", label: "Sometimes" },
        { value: "75", label: "Usually" },
        { value: "100", label: "Almost always - pressure enhances performance" },
      ]
    },
    {
      id: "executionQ2",
      text: "How consistent is your pre-shot routine when stressed?",
      options: [
        { value: "25", label: "Completely abandons routine" },
        { value: "50", label: "Routine becomes rushed/inconsistent" },
        { value: "75", label: "Mostly maintains routine" },
        { value: "100", label: "Routine stays identical" },
      ]
    },
    {
      id: "executionQ3",
      text: "How well do you commit to your shots during crucial moments?",
      options: [
        { value: "25", label: "Hesitant and tentative" },
        { value: "50", label: "Some hesitation" },
        { value: "75", label: "Generally committed" },
        { value: "100", label: "Fully committed every time" },
      ]
    }
  ]
};

export default function Assessment() {
  const [currentSection, setCurrentSection] = useState(0);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/assessments", data);
    },
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/assessments/latest/${user.id}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/assessments/user/${user.id}`] });
      }
      toast({
        title: "Assessment Complete!",
        description: "Your mental skills have been analyzed. Redirecting to your dashboard...",
      });
      // Redirect to dashboard with a success indicator
      setTimeout(() => {
        setLocation("/dashboard?assessment=completed");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Assessment Failed",
        description: "Please try again. " + (error as Error).message,
        variant: "destructive",
      });
    },
  });

  const sections = [
    { name: "Intensity Management", key: "intensity", questions: questions.intensity },
    { name: "Decision Making", key: "decision", questions: questions.decision },
    { name: "Focus & Diversions", key: "diversions", questions: questions.diversions },
    { name: "Execution", key: "execution", questions: questions.execution },
  ];

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  const onSubmit = (data: z.infer<typeof assessmentSchema>) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit your assessment.",
        variant: "destructive",
      });
      return;
    }

    // Store responses without scoring since this is not right/wrong based
    const submitData = {
      responses: data, // Store all responses for analysis - userId comes from auth
    };

    console.log('Submitting assessment responses:', submitData);
    mutation.mutate(submitData);
  };

  const handleNext = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      // Auto-scroll to top of section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const isCurrentSectionComplete = () => {
    const values = form.getValues();
    return currentSectionData.questions.every(q => values[q.id as keyof typeof values]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
      
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
      <div className="text-center mb-8">
        <div className="w-16 h-16 gradient-red-blue rounded-full flex items-center justify-center mx-auto mb-4">
          <Brain className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Red2Blue Mental Skills Assessment</h1>
        <p className="text-gray-600 text-lg">
          Discover your mental performance patterns and get personalized coaching recommendations
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Section {currentSection + 1} of {sections.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {sections.map((section, index) => {
          const isPast = index < currentSection;
          
          return (
            <div
              key={section.key}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                index === currentSection
                  ? 'border-blue-primary bg-blue-light'
                  : isPast
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => {
                setCurrentSection(index);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm">{section.name}</h3>
                {isPast && <CheckCircle className="text-green-600" size={16} />}
              </div>
              <p className="text-xs text-gray-500">
                {isPast ? 'Completed' : index === currentSection ? 'Current Section' : 'Not Started'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Assessment Form */}
      <Card className="shadow-lg border-gray-100">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
          <CardTitle className="text-xl font-semibold text-gray-900">
            {currentSectionData.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {currentSectionData.questions.map((question, qIndex) => (
                <FormField
                  key={question.id}
                  control={form.control}
                  name={question.id as any}
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-lg font-medium text-gray-900">
                        {qIndex + 1}. {question.text}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-3"
                        >
                          {question.options.map((option) => (
                            <div key={option.value} className="flex items-start space-x-3">
                              <RadioGroupItem 
                                value={option.value} 
                                id={`${question.id}-${option.value}`}
                                className="mt-1"
                              />
                              <label
                                htmlFor={`${question.id}-${option.value}`}
                                className="text-gray-700 cursor-pointer flex-1 leading-relaxed"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentSection === 0}
                >
                  Previous Section
                </Button>

                {currentSection < sections.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!isCurrentSectionComplete()}
                    className="bg-blue-primary hover:bg-blue-deep"
                  >
                    Next Section
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!form.formState.isValid || mutation.isPending}
                    className="bg-success hover:bg-green-700"
                  >
                    {mutation.isPending ? "Analyzing..." : "Complete Assessment"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-light to-white rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-2">Assessment Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Answer honestly based on your recent golf performance</li>
          <li>• Think about high-pressure situations like tournaments or important matches</li>
          <li>• There are no right or wrong answers - this helps us understand your mental game</li>
          <li>• You can retake sections anytime to track your improvement</li>
        </ul>
      </div>
    </div>
  );
}
