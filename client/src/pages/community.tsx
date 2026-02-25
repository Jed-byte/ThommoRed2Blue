import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityLeaderboard } from "@/components/community-leaderboard";
import { VisualProgressTracker } from "@/components/visual-progress-tracker";
import { CoachingAnimations } from "@/components/coaching-animations";
import { Users, Trophy, TrendingUp, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface CommunityProps {
  userId: number;
}

export default function Community({ userId }: CommunityProps) {
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft size={18} className="mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Red2Blue Community
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Connect with fellow elite performers, track your progress, and stay motivated 
            through friendly competition and shared mindset excellence.
          </p>
        </div>

        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>My Progress</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard" className="space-y-6">
            <CommunityLeaderboard userId={userId} />
            
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Daily Mindset Challenge</span>
                </CardTitle>
                <CardDescription>
                  Join thousands of golfers practicing 5 minutes of mindset training daily
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-lg font-semibold mb-2">Today's Focus: Pressure Response</h3>
                  <p className="text-gray-600 mb-4">
                    Practice the box breathing technique before a challenging shot or situation.
                    Visualize yourself staying calm and executing perfectly under pressure.
                  </p>
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      "The mind is everything. What you think you become." - Buddha
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <VisualProgressTracker userId={userId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Coaching Animations */}
      {showWelcomeAnimation && (
        <CoachingAnimations
          context="welcome"
          onComplete={() => setShowWelcomeAnimation(false)}
        />
      )}
    </div>
  );
}