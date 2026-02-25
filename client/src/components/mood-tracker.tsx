import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Zap, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MoodTrackerProps {
  userId: number;
}

export function MoodTracker({ userId }: MoodTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [moodScore, setMoodScore] = useState([50]);
  const [notes, setNotes] = useState("");
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Check if user has already submitted mood today
  const { data: todaysMood } = useQuery({
    queryKey: [`/api/daily-mood/${userId}/${today}`],
    retry: false,
  });

  useEffect(() => {
    if (todaysMood) {
      setMoodScore([todaysMood.moodScore]);
      setNotes(todaysMood.notes || "");
      setHasSubmittedToday(true);
    }
  }, [todaysMood]);

  const moodMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/daily-mood', data);
    },
    onSuccess: () => {
      setHasSubmittedToday(true);
      queryClient.invalidateQueries({ queryKey: [`/api/daily-mood/${userId}/${today}`] });
      toast({
        title: "Mood Recorded",
        description: "Your daily mood has been saved to your profile.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save your mood. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateMoodMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', `/api/daily-mood/${todaysMood?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/daily-mood/${userId}/${today}`] });
      toast({
        title: "Mood Updated",
        description: "Your daily mood has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update your mood. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    const data = {
      userId,
      date: today,
      moodScore: moodScore[0],
      notes: notes.trim() || null,
    };

    if (hasSubmittedToday && todaysMood) {
      updateMoodMutation.mutate(data);
    } else {
      moodMutation.mutate(data);
    }
  };

  const getMoodLabel = (score: number) => {
    if (score <= 20) return { label: "Red Head - High Stress", color: "bg-red-500", icon: Brain };
    if (score <= 40) return { label: "Pink - Transitioning", color: "bg-pink-500", icon: Heart };
    if (score <= 60) return { label: "Purple - Neutral", color: "bg-purple-500", icon: Heart };
    if (score <= 80) return { label: "Light Blue - Calm", color: "bg-blue-400", icon: Zap };
    return { label: "Blue Head - Peak Focus", color: "bg-blue-600", icon: Zap };
  };

  const moodInfo = getMoodLabel(moodScore[0]);
  const IconComponent = moodInfo.icon;

  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <IconComponent className="h-5 w-5 text-blue-primary" />
          <span>How do you feel today?</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Mood Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-600">Red Head</span>
            <Badge 
              className={`${moodInfo.color} text-white border-none`}
              variant="secondary"
            >
              {moodScore[0]}/100
            </Badge>
            <span className="text-sm font-medium text-blue-600">Blue Head</span>
          </div>
          
          <div className="relative">
            <Slider
              value={moodScore}
              onValueChange={setMoodScore}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={moodMutation.isPending || updateMoodMutation.isPending}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">{moodInfo.label}</p>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Notes (optional)
          </label>
          <Textarea
            placeholder="What's affecting your mood today? Any specific thoughts or situations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            disabled={moodMutation.isPending || updateMoodMutation.isPending}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={moodMutation.isPending || updateMoodMutation.isPending}
          className="w-full"
        >
          {moodMutation.isPending || updateMoodMutation.isPending ? (
            <>
              <Brain className="mr-2 h-4 w-4 animate-spin" />
              {hasSubmittedToday ? "Updating..." : "Saving..."}
            </>
          ) : hasSubmittedToday ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Update Today's Mood
            </>
          ) : (
            <>
              <Heart className="mr-2 h-4 w-4" />
              Record Today's Mood
            </>
          )}
        </Button>

        {/* Correlation Info */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <strong>Performance Insight:</strong> Your daily mood data correlates with assessment results to identify patterns and optimize your mental training approach.
          </p>
        </div>

      </CardContent>
    </Card>
  );
}