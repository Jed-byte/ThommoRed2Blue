import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Clock, 
  TrendingUp, 
  Award, 
  Play, 
  CheckCircle,
  Brain,
  Focus,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TechniqueProgress {
  id: number;
  techniqueId: number;
  techniqueName: string;
  category: string;
  practiceCount: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  totalTimeSpent: number;
  lastPracticed: string;
  streakDays: number;
}

interface VisualProgressTrackerProps {
  userId: number;
}

export function VisualProgressTracker({ userId }: VisualProgressTrackerProps) {
  const [selectedTechnique, setSelectedTechnique] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const queryClient = useQueryClient();

  const { data: progressData = [], isLoading } = useQuery({
    queryKey: ['/api/progress/techniques', userId],
  });

  const practiceSessionMutation = useMutation({
    mutationFn: async (techniqueId: number) => {
      return apiRequest('POST', '/api/progress/practice-session', {
        userId,
        techniqueId,
        duration: 5 // 5 minute session
      });
    },
    onSuccess: () => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['/api/progress/techniques', userId] });
    },
  });

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-100';
      case 'advanced': return 'text-blue-600 bg-blue-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const getMasteryProgress = (level: string, practiceCount: number) => {
    const thresholds = {
      beginner: 10,
      intermediate: 25,
      advanced: 50,
      expert: 100
    };

    const currentThreshold = thresholds[level as keyof typeof thresholds];
    const nextLevel = level === 'expert' ? 'expert' : 
                     level === 'advanced' ? 'expert' :
                     level === 'intermediate' ? 'advanced' : 'intermediate';
    
    if (level === 'expert') return 100;
    
    const progress = Math.min((practiceCount / currentThreshold) * 100, 100);
    return progress;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'focus': return <Focus className="w-5 h-5" />;
      case 'visualization': return <Brain className="w-5 h-5" />;
      case 'pressure': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  const handlePracticeSession = (techniqueId: number) => {
    setSelectedTechnique(techniqueId);
    practiceSessionMutation.mutate(techniqueId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Mental Technique Mastery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {progressData.map((technique: TechniqueProgress) => (
                <motion.div
                  key={technique.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative"
                >
                  <Card className={`transition-all duration-300 ${
                    selectedTechnique === technique.techniqueId && isAnimating 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:shadow-md'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {getCategoryIcon(technique.category)}
                          </div>
                          <div>
                            <h4 className="font-medium text-lg">{technique.techniqueName}</h4>
                            <p className="text-sm text-gray-500 capitalize">{technique.category}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getMasteryColor(technique.masteryLevel)}>
                            {technique.masteryLevel}
                          </Badge>
                          
                          <Button
                            size="sm"
                            onClick={() => handlePracticeSession(technique.techniqueId)}
                            disabled={practiceSessionMutation.isPending}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            {practiceSessionMutation.isPending && selectedTechnique === technique.techniqueId ? (
                              <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Training...</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <Play className="w-3 h-3" />
                                <span>Practice</span>
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress to {technique.masteryLevel === 'expert' ? 'Master' : 'next level'}</span>
                          <span>{Math.round(getMasteryProgress(technique.masteryLevel, technique.practiceCount))}%</span>
                        </div>
                        <Progress 
                          value={getMasteryProgress(technique.masteryLevel, technique.practiceCount)} 
                          className="h-2"
                        />
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center space-x-1">
                            <Target className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-500">Sessions</span>
                          </div>
                          <p className="font-bold text-lg">{technique.practiceCount}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-center space-x-1">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-500">Time</span>
                          </div>
                          <p className="font-bold text-lg">{formatTimeSpent(technique.totalTimeSpent)}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-center space-x-1">
                            <Award className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-500">Streak</span>
                          </div>
                          <p className="font-bold text-lg">{technique.streakDays || 0}</p>
                        </div>
                      </div>

                      {/* Achievement Animation */}
                      <AnimatePresence>
                        {selectedTechnique === technique.techniqueId && isAnimating && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95 rounded-lg"
                          >
                            <div className="text-center">
                              <motion.div
                                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: 1 }}
                                className="w-16 h-16 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                              >
                                <CheckCircle className="w-8 h-8 text-white" />
                              </motion.div>
                              <p className="font-bold text-lg text-blue-600">Great Session!</p>
                              <p className="text-sm text-gray-600">+5 minutes practice time</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Progress Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Mental Performance Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">
                {progressData.reduce((sum: number, t: TechniqueProgress) => sum + t.practiceCount, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">
                {formatTimeSpent(progressData.reduce((sum: number, t: TechniqueProgress) => sum + t.totalTimeSpent, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Practice</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-600">
                {progressData.filter((t: TechniqueProgress) => t.masteryLevel === 'expert').length}
              </p>
              <p className="text-sm text-gray-600">Expert Level</p>
            </div>
            
            <div className="text-center p-4 bg-white rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-600">
                {Math.max(...progressData.map((t: TechniqueProgress) => t.streakDays || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Best Streak</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}