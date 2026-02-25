import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Calendar, Flame, Star, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface LeaderboardEntry {
  id: number;
  username: string;
  points: number;
  streak: number;
  tier: 'free' | 'premium' | 'ultimate';
  lastCheckIn: string;
  rank: number;
}

interface DailyCheckInProps {
  userId: number;
}

export function CommunityLeaderboard({ userId }: DailyCheckInProps) {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [celebrateCheckIn, setCelebrateCheckIn] = useState(false);
  const queryClient = useQueryClient();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['/api/leaderboard'],
  });

  const { data: userCheckIn } = useQuery({
    queryKey: ['/api/check-in/today', userId],
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/check-in', { userId });
    },
    onSuccess: () => {
      setCelebrateCheckIn(true);
      setTimeout(() => setCelebrateCheckIn(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/check-in/today', userId] });
    },
  });

  const handleDailyCheckIn = () => {
    checkInMutation.mutate();
  };

  const generateCalendarLink = (provider: 'google' | 'outlook' | 'icloud') => {
    const title = "Daily Mindset Practice - Red2Blue";
    const description = "5-minute mindset coaching session to enhance mental performance";
    const startDate = new Date();
    startDate.setHours(9, 0, 0, 0); // 9 AM default
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 5);

    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    switch (provider) {
      case 'google':
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(description)}&recur=RRULE:FREQ=DAILY`;
      case 'outlook':
        return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}&body=${encodeURIComponent(description)}`;
      case 'icloud':
        return `webcal://calendar.icloud.com/calendar/compose?subject=${encodeURIComponent(title)}&startdt=${formatDate(startDate)}&enddt=${formatDate(endDate)}&description=${encodeURIComponent(description)}`;
      default:
        return '';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ultimate': return <Star className="w-4 h-4 text-purple-500" />;
      case 'premium': return <Trophy className="w-4 h-4 text-blue-500" />;
      default: return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ultimate': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Check-in Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50"></div>
        <CardHeader className="relative">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Daily Mindset Check-in</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Current Streak: {userCheckIn?.streakCount || 0} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="font-medium">Points: {userCheckIn?.totalPoints || 0}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCalendarModal(true)}
                className="flex items-center space-x-1"
              >
                <Calendar className="w-4 h-4" />
                <span>Set Reminder</span>
              </Button>
              
              <AnimatePresence>
                {!userCheckIn?.completedToday && (
                  <motion.div
                    initial={{ scale: 1 }}
                    animate={{ scale: celebrateCheckIn ? 1.1 : 1 }}
                    exit={{ scale: 0 }}
                  >
                    <Button
                      onClick={handleDailyCheckIn}
                      disabled={checkInMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {checkInMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Checking in...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>Check in (5 min)</span>
                        </div>
                      )}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {userCheckIn?.completedToday && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="font-medium">Completed Today!</span>
                </motion.div>
              )}
            </div>
          </div>

          {celebrateCheckIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
            >
              <div className="text-2xl mb-2">🎉</div>
              <p className="font-medium text-green-800">Great job! You've earned 10 points!</p>
              <p className="text-sm text-green-600">Keep up your mindset practice streak!</p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>Community Leaderboard</span>
            <Badge variant="secondary" className="ml-auto">Live</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry: LeaderboardEntry, index: number) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    entry.id === userId ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{entry.username}</span>
                        {getTierIcon(entry.tier)}
                        <Badge variant="secondary" className={getTierColor(entry.tier)}>
                          {entry.tier}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{entry.points} points</span>
                        <div className="flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{entry.streak} day streak</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < 3 && (
                    <div className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar Reminder Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold mb-4">Set Daily Reminder</h3>
            <p className="text-gray-600 mb-6">
              Add a 5-minute daily mindset practice to your calendar. Consistency is key to mental performance!
            </p>
            
            <div className="space-y-3">
              <Button
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => window.open(generateCalendarLink('google'), '_blank')}
              >
                <Calendar className="w-4 h-4" />
                <span>Add to Google Calendar</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => window.open(generateCalendarLink('outlook'), '_blank')}
              >
                <Calendar className="w-4 h-4" />
                <span>Add to Outlook</span>
              </Button>
              
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
                onClick={() => window.open(generateCalendarLink('icloud'), '_blank')}
              >
                <Calendar className="w-4 h-4" />
                <span>Add to iCloud</span>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowCalendarModal(false)}
            >
              Close
            </Button>
          </motion.div>
        </div>
      )}
    </div>
  );
}