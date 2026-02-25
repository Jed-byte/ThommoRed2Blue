import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { User, Trophy, TrendingDown, TrendingUp, Target, Calendar } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    golfHandicap: user?.golfHandicap || 0,
    golfExperience: user?.golfExperience || "",
    goals: user?.goals || "",
    bio: user?.bio || ""
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", `/api/users/${user?.id}`, data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Check for handicap improvement
      if (user?.golfHandicap && data.golfHandicap < user.golfHandicap) {
        const improvement = user.golfHandicap - data.golfHandicap;
        toast({
          title: "🏆 Congratulations!",
          description: `Your handicap improved by ${improvement.toFixed(1)}! You've earned bonus points for your progress.`,
        });
        
        // Award bonus points for handicap improvement
        apiRequest("POST", "/api/progress", {
          userId: user.id,
          activityType: "handicap_improvement",
          points: Math.round(improvement * 10),
          details: `Handicap improved from ${user.golfHandicap} to ${data.golfHandicap}`
        });
      } else if (user?.golfHandicap && data.golfHandicap > user.golfHandicap) {
        // Handicap went up - encourage more practice
        toast({
          title: "Keep Working!",
          description: "Remember, mental training is key to consistent performance. Let's focus on your mindset skills.",
          variant: "default",
        });
      }
      
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      golfHandicap: user?.golfHandicap || 0,
      golfExperience: user?.golfExperience || "",
      goals: user?.goals || "",
      bio: user?.bio || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and track your golf performance</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {user?.subscriptionTier?.toUpperCase() || 'FREE'} MEMBER
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Golf Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Handicap</span>
              <span className="font-semibold">{user?.golfHandicap || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Experience Level</span>
              <span className="font-semibold capitalize">{user?.golfExperience || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Member Since</span>
              <span className="font-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Account Information
            </CardTitle>
            <CardDescription>
              Update your profile information and golf stats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="handicap">Golf Handicap</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="handicap"
                      type="number"
                      step="0.1"
                      min="-10"
                      max="54"
                      value={formData.golfHandicap}
                      onChange={(e) => setFormData({ ...formData, golfHandicap: parseFloat(e.target.value) || 0 })}
                      disabled={!isEditing}
                      className="flex-1"
                      placeholder="0.0 (scratch) or negative for plus"
                    />
                    {isEditing && user?.golfHandicap && (
                      <div className="flex items-center text-sm">
                        {formData.golfHandicap < user.golfHandicap ? (
                          <div className="flex items-center text-green-600">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            Improved!
                          </div>
                        ) : formData.golfHandicap > user.golfHandicap ? (
                          <div className="flex items-center text-orange-600">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            Higher
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="experience">Experience Level</Label>
                  <Select
                    value={formData.golfExperience}
                    onValueChange={(value) => setFormData({ ...formData, golfExperience: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (5-10 years)</SelectItem>
                      <SelectItem value="expert">Expert (10+ years)</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="goals">Goals</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                  disabled={!isEditing}
                  placeholder="What are your golf performance goals?"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell us about yourself and your golf journey"
                  rows={3}
                />
              </div>

              <Separator />

              <div className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Mindset Practice Reminder */}
      {user?.golfHandicap && formData.golfHandicap > user.golfHandicap && isEditing && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Target className="h-5 w-5" />
              Focus on Mental Training
            </CardTitle>
          </CardHeader>
          <CardContent className="text-orange-700">
            <p className="mb-4">
              Your handicap has increased recently. Remember, mental training is crucial for consistent performance. 
              The Red2Blue system can help you develop the mental resilience needed to improve your game.
            </p>
            <div className="space-y-2">
              <p className="font-semibold">Recommended focus areas:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Practice your pre-shot routine daily</li>
                <li>Complete mental skills assessments regularly</li>
                <li>Use pressure scenarios to build confidence</li>
                <li>Work with AI Coach Flo for personalized guidance</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}