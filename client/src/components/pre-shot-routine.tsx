import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Play, Pause, RotateCcw, Timer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { PreShotRoutine } from "@shared/schema";

interface PreShotRoutineProps {
  userId: number;
}

export function PreShotRoutineComponent({ userId }: PreShotRoutineProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const queryClient = useQueryClient();

  const { data: activeRoutine, isLoading } = useQuery({
    queryKey: ['/api/pre-shot-routines/active', userId],
    queryFn: () => fetch(`/api/pre-shot-routines/active/${userId}`).then(res => {
      if (!res.ok) return null;
      return res.json();
    }) as Promise<PreShotRoutine | null>,
    retry: false
  });

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const startRoutine = () => {
    if (!activeRoutine?.steps) return;
    
    setIsRunning(true);
    setCurrentStep(0);
    const firstStep = activeRoutine.steps[0] as any;
    setTimeLeft(firstStep.duration);
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Move to next step or finish
          setCurrentStep(curr => {
            const nextStep = curr + 1;
            if (nextStep >= activeRoutine.steps.length) {
              clearInterval(interval);
              setIsRunning(false);
              return 0;
            } else {
              const step = activeRoutine.steps[nextStep] as any;
              setTimeLeft(step.duration);
              return nextStep;
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setTimer(interval);
  };

  const pauseRoutine = () => {
    setIsRunning(false);
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  const resetRoutine = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setTimeLeft(0);
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <CardTitle>Pre-Shot Routine</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activeRoutine) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <CardTitle>Pre-Shot Routine</CardTitle>
          </div>
          <CardDescription>
            No active pre-shot routine found. Set up your routine to get started.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!activeRoutine.steps || !Array.isArray(activeRoutine.steps) || activeRoutine.steps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <CardTitle>Pre-Shot Routine</CardTitle>
          </div>
          <CardDescription>
            Routine configuration incomplete. No steps available.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const steps = activeRoutine.steps as any[];
  const currentStepData = steps[currentStep] || steps[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <CardTitle>{activeRoutine.name}</CardTitle>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{activeRoutine.totalDuration}s total</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timer Display */}
        <div className="text-center">
          {isRunning && (
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {timeLeft}s
              </div>
              <Badge variant="secondary">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
          )}
        </div>

        {/* Current Step */}
        {isRunning && currentStepData && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-blue-900">{currentStepData.name}</h4>
              <p className="text-sm text-blue-700 mt-1">{currentStepData.description}</p>
            </CardContent>
          </Card>
        )}

        {/* All Steps Preview */}
        {!isRunning && (
          <div className="space-y-3">
            <h4 className="font-semibold">Routine Steps:</h4>
            {steps.map((step: any, index: number) => (
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
  );
}