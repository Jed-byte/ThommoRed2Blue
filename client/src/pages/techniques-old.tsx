import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { TechniqueCard } from "@/components/technique-card";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  Zap, 
  Compass, 
  Target, 
  Anchor, 
  Clock,
  Play,
  BookOpen,
  Timer,
  Share2,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function Techniques() {
  const { data: techniques, isLoading } = useQuery({
    queryKey: ["/api/techniques"],
  });
  
  const { toast } = useToast();
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [practiceDialogOpen, setPracticeDialogOpen] = useState(false);
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<any>(null);
  const [emergencyStep, setEmergencyStep] = useState(0);
  const [ideaText, setIdeaText] = useState("");
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [practiceStep, setPracticeStep] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [activeCategory, setActiveCategory] = useState("breathing");
  
  // Emergency Relief mutation
  const emergencyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/emergency-relief", {});
    },
    onSuccess: () => {
      toast({
        title: "Emergency Relief Completed",
        description: "Great job! You've successfully completed the emergency breathing technique.",
      });
    }
  });
  
  // Practice Now mutation
  const practiceMutation = useMutation({
    mutationFn: async (techniqueId: number) => {
      await apiRequest("POST", "/api/practice-technique", { techniqueId });
    },
    onSuccess: () => {
      toast({
        title: "Practice Completed",
        description: "Great work! Your practice session has been completed and logged.",
      });
      setPracticeDialogOpen(false);
      setPracticeStep(0);
    }
  });
  
  // Idea sharing mutation
  const ideaMutation = useMutation({
    mutationFn: async (idea: string) => {
      await apiRequest("POST", "/api/share-idea", { idea });
    },
    onSuccess: () => {
      toast({
        title: "Idea Shared Successfully",
        description: "Your technique has been shared with Flo and the community. Thank you!",
      });
      setIdeaText("");
      setIdeaDialogOpen(false);
    }
  });

  // Auto-advance timer for emergency relief
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isAutoAdvancing && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isAutoAdvancing && countdown === 0) {
      // Auto advance to next step
      if (emergencyStep === 1) {
        setEmergencyStep(2);
        setCountdown(4); // Hold for 4 seconds
      } else if (emergencyStep === 2) {
        setEmergencyStep(3);
        setCountdown(6); // Exhale for 6 seconds
      } else if (emergencyStep === 3) {
        setEmergencyStep(4);
        setIsAutoAdvancing(false);
      }
    }
    
    return () => clearTimeout(timer);
  }, [isAutoAdvancing, countdown, emergencyStep]);

  const categories = [
    { 
      id: "breathing", 
      name: "Breathing", 
      icon: <Zap className="text-blue-primary" size={20} />,
      description: "Calm your nervous system instantly"
    },
    { 
      id: "focus", 
      name: "Focus", 
      icon: <Compass className="text-indigo-600" size={20} />,
      description: "Regain concentration after distractions"
    },
    { 
      id: "pressure", 
      name: "Pressure", 
      icon: <Target className="text-teal-600" size={20} />,
      description: "Turn pressure into performance"
    },
    { 
      id: "anchor", 
      name: "Anchoring", 
      icon: <Anchor className="text-purple-600" size={20} />,
      description: "Access your best mental state on demand"
    },
  ];

  const getTechniquesByCategory = (categoryId: string) => {
    return techniques?.filter((technique: any) => technique.category === categoryId) || [];
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "Instant";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
      
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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Blue Head Techniques</h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Quick, effective techniques to shift from Red Head stress to Blue Head calm performance. 
          All techniques are designed for immediate implementation on the golf course.
        </p>
        <Badge variant="outline" className="mt-4 bg-blue-light text-blue-primary border-blue-200">
          Available Offline
        </Badge>
      </div>

      {/* Emergency Quick Relief */}
      <Card className="mb-8 bg-gradient-to-r from-red-light to-orange-50 border-red-200">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-red-primary mb-2">
                Feeling Red Head Stress Right Now?
              </h2>
              <p className="text-red-600">
                Use our fastest technique for immediate relief in high-pressure moments
              </p>
            </div>
            <Button 
              size="lg" 
              className="bg-red-primary hover:bg-red-600 text-white shadow-lg"
              onClick={() => setEmergencyDialogOpen(true)}
            >
              <Zap className="mr-2" size={20} />
              Emergency Relief (30s)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Technique Categories */}
      <div className="space-y-8">
        
        {/* Category Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                activeCategory === category.id 
                  ? 'ring-2 ring-blue-primary bg-blue-light border-blue-primary' 
                  : 'hover:border-gray-300'
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activeCategory === category.id ? 'bg-blue-primary text-white' : 'bg-gray-100'
                  }`}>
                    {category.icon}
                  </div>
                  <span className="font-medium text-sm">{category.name}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Category Content */}
        {(() => {
          const activecat = categories.find(cat => cat.id === activeCategory);
          if (!activecat) return null;
          
          return (
            <div className="space-y-6">
              {/* Category Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activecat.icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activecat.name} Techniques</h2>
                <p className="text-gray-600">{activecat.description}</p>
              </div>

              {/* Techniques Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getTechniquesByCategory(activeCategory).map((technique: any, index: number) => (
                <Card key={technique.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold">{technique.name}</CardTitle>
                      <Badge className={getDifficultyColor(technique.difficulty)}>
                        {technique.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm">{technique.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      
                      {/* Duration */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock size={16} />
                        <span>{formatDuration(technique.duration)}</span>
                      </div>

                      {/* Instructions */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <BookOpen size={16} className="mr-2" />
                          Instructions
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {technique.instructions}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button 
                          className="flex-1 bg-blue-primary hover:bg-blue-deep"
                          size="sm"
                          onClick={() => {
                            setSelectedTechnique(technique);
                            setPracticeDialogOpen(true);
                          }}
                        >
                          <Play size={16} className="mr-2" />
                          Practice Now
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-300"
                        >
                          Learn More
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

              {/* Add New Technique Placeholder */}
              <Card className="border-dashed border-2 border-gray-300 hover:border-blue-primary transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-gray-400">+</span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Suggest a Technique</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Have a technique that works for you? Share it with Flo.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIdeaDialogOpen(true)}
                  >
                    Submit Idea
                  </Button>
                </CardContent>
              </Card>
            </div>
          );
        })()}
      </div>

      {/* Popular Techniques Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Most Effective Techniques</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techniques?.slice(0, 4).map((technique: any, index: number) => (
            <TechniqueCard
              key={technique.id}
              technique={technique}
              colorIndex={index}
            />
          ))}
        </div>
      </div>

      {/* Technique Usage Tips */}
      <Card className="mt-8 bg-gradient-to-r from-blue-light to-white">
        <CardContent className="p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Maximizing Technique Effectiveness</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Before the Round</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Practice 2-3 techniques during warm-up</li>
                <li>• Choose your "go-to" technique for pressure moments</li>
                <li>• Set a mental cue to remind yourself to use techniques</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">During the Round</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use between shots, not during your routine</li>
                <li>• Start with easier techniques, progress to advanced</li>
                <li>• Notice when you're shifting from Red to Blue Head</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Relief Dialog */}
      <Dialog open={emergencyDialogOpen} onOpenChange={setEmergencyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-primary">
              <Zap className="mr-2" size={20} />
              Emergency Relief (30s)
            </DialogTitle>
            <DialogDescription>
              Follow this guided breathing exercise to quickly shift from Red Head stress to Blue Head calm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {emergencyStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-light rounded-full flex items-center justify-center mx-auto">
                  <Timer className="w-8 h-8 text-red-primary" />
                </div>
                <p className="text-gray-700">
                  Ready to start your 30-second emergency breathing technique? This will help you regain control quickly.
                </p>
                <Button 
                  className="w-full bg-red-primary hover:bg-red-600"
                  onClick={() => {
                    setEmergencyStep(1);
                    setIsAutoAdvancing(true);
                    setCountdown(4);
                  }}
                >
                  Start Auto-Guided Practice
                </Button>
              </div>
            )}
            
            {emergencyStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-light rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <span className="text-3xl text-blue-primary font-bold">{countdown}</span>
                </div>
                <p className="text-lg font-medium">Breathe In</p>
                <p className="text-gray-600">Inhale slowly through your nose</p>
                <div className="text-sm text-gray-500">Auto-advancing in {countdown} seconds...</div>
              </div>
            )}
            
            {emergencyStep === 2 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-yellow-light rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl text-yellow-600 font-bold">{countdown}</span>
                </div>
                <p className="text-lg font-medium">Hold</p>
                <p className="text-gray-600">Hold your breath gently</p>
                <div className="text-sm text-gray-500">Auto-advancing in {countdown} seconds...</div>
              </div>
            )}
            
            {emergencyStep === 3 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-light rounded-full flex items-center justify-center mx-auto">
                  <span className="text-3xl text-green-600 font-bold">{countdown}</span>
                </div>
                <p className="text-lg font-medium">Breathe Out</p>
                <p className="text-gray-600">Exhale slowly through your mouth</p>
                <div className="text-sm text-gray-500">Auto-advancing in {countdown} seconds...</div>
              </div>
            )}
            
            {emergencyStep === 4 && (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-light rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-blue-primary" />
                </div>
                <p className="text-lg font-medium text-blue-primary">Emergency Relief Complete!</p>
                <p className="text-gray-600">
                  Great job! You've successfully used the 4-4-6 breathing technique. 
                  Repeat if needed or return to your golf when ready.
                </p>
                <Button 
                  className="w-full bg-blue-primary hover:bg-blue-600"
                  onClick={() => {
                    emergencyMutation.mutate();
                    setEmergencyStep(0);
                    setEmergencyDialogOpen(false);
                  }}
                >
                  Log Practice & Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Practice Now Dialog */}
      <Dialog open={practiceDialogOpen} onOpenChange={setPracticeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Play className="mr-2" size={20} />
              Practice: {selectedTechnique?.name}
            </DialogTitle>
            <DialogDescription>
              Follow the guided practice session for this technique.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-light rounded-lg p-4">
              <h4 className="font-medium text-blue-primary mb-2">Instructions</h4>
              <p className="text-sm text-gray-700">
                {selectedTechnique?.instructions}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Practice Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Find a quiet spot to practice</li>
                <li>• Focus on the technique, not the outcome</li>
                <li>• Notice how your body feels before and after</li>
                <li>• Practice regularly for best results</li>
              </ul>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setPracticeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-primary hover:bg-blue-600"
                onClick={() => {
                  if (selectedTechnique) {
                    practiceMutation.mutate(selectedTechnique.id);
                  }
                }}
                disabled={practiceMutation.isPending}
              >
                {practiceMutation.isPending ? "Completing..." : "Complete Practice"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Idea Sharing Dialog */}
      <Dialog open={ideaDialogOpen} onOpenChange={setIdeaDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share2 className="mr-2" size={20} />
              Share Your Technique Idea
            </DialogTitle>
            <DialogDescription>
              Share a technique that works for you. Flo will review it and it may be added to our anonymous community collection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Describe your technique or what works for you:
              </label>
              <Textarea
                placeholder="e.g., I use a specific pre-shot visualization that helps me stay calm under pressure..."
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <div className="bg-blue-light rounded-lg p-3">
              <p className="text-sm text-blue-primary">
                <strong>Privacy:</strong> Your idea will be shared anonymously with the community and sent to Flo for potential integration into coaching sessions.
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setIdeaText("");
                  setIdeaDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-primary hover:bg-blue-600"
                onClick={() => ideaMutation.mutate(ideaText)}
                disabled={!ideaText.trim() || ideaMutation.isPending}
              >
                {ideaMutation.isPending ? "Sharing..." : "Share Idea"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
