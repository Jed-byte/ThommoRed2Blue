import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, Star, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DemoAccess() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleDemoUpgrade = async (tier: 'premium' | 'ultimate') => {
    setIsUpgrading(true);
    try {
      const response = await apiRequest("POST", "/api/demo/upgrade", { tier });
      const result = await response.json();
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Demo Access Granted!",
        description: `You now have ${tier} access for testing. Redirecting to dashboard...`,
      });
      
      // Redirect to dashboard after a moment
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
      
    } catch (error) {
      console.error('Demo upgrade error:', error);
      toast({
        title: "Demo Upgrade Failed",
        description: "There was an error granting demo access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDemoReset = async () => {
    setIsUpgrading(true);
    try {
      const response = await apiRequest("POST", "/api/demo/reset");
      const result = await response.json();
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      toast({
        title: "Account Reset",
        description: "Your account has been reset to free tier for testing.",
      });
      
    } catch (error) {
      console.error('Demo reset error:', error);
      toast({
        title: "Reset Failed",
        description: "There was an error resetting your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Demo Access</CardTitle>
            <CardDescription>Please log in to access demo features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => window.location.href = "/"}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Demo Access Center</h1>
          <p className="text-lg text-gray-600">
            Test premium and ultimate features without payment
          </p>
        </div>

        {/* Current Status */}
        <Alert className="mb-8">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Current Status:</strong> Logged in as {user.firstName} ({user.email})
            <br />
            <strong>Current Tier:</strong> <Badge variant="outline">{user.subscriptionTier || 'free'}</Badge>
          </AlertDescription>
        </Alert>

        {/* Demo Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Premium Demo */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-blue-600">Premium Demo</CardTitle>
              </div>
              <CardDescription>
                Test all premium features including unlimited AI coaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-600">
                  <strong>Features you'll get:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Unlimited AI coaching with Flo</li>
                    <li>• Advanced assessment tools</li>
                    <li>• Progress tracking & analytics</li>
                    <li>• All premium content access</li>
                    <li>• Scenario training</li>
                  </ul>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleDemoUpgrade('premium')}
                disabled={isUpgrading || user.subscriptionTier === 'premium'}
              >
                {isUpgrading ? 'Processing...' : user.subscriptionTier === 'premium' ? 'Currently Active' : 'Activate Premium Demo'}
              </Button>
            </CardContent>
          </Card>

          {/* Ultimate Demo */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-purple-600">Ultimate Demo</CardTitle>
              </div>
              <CardDescription>
                Test ultimate features including human coaching access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-600">
                  <strong>Everything in Premium plus:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• 1-on-1 human coaching sessions</li>
                    <li>• Personal coach matching</li>
                    <li>• Custom training programs</li>
                    <li>• VIP priority support</li>
                    <li>• Advanced analytics</li>
                  </ul>
                </div>
              </div>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={() => handleDemoUpgrade('ultimate')}
                disabled={isUpgrading || user.subscriptionTier === 'ultimate'}
              >
                {isUpgrading ? 'Processing...' : user.subscriptionTier === 'ultimate' ? 'Currently Active' : 'Activate Ultimate Demo'}
              </Button>
            </CardContent>
          </Card>

          {/* Reset Demo */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-6 h-6 text-gray-600" />
                <CardTitle className="text-gray-600">Reset Account</CardTitle>
              </div>
              <CardDescription>
                Reset your account back to free tier for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-600">
                  <strong>This will:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Remove premium/ultimate access</li>
                    <li>• Reset to free tier limitations</li>
                    <li>• Keep your account and data</li>
                    <li>• Allow you to test upgrade flow</li>
                  </ul>
                </div>
              </div>
              <Button 
                variant="outline"
                className="w-full"
                onClick={handleDemoReset}
                disabled={isUpgrading || user.subscriptionTier === 'free'}
              >
                {isUpgrading ? 'Processing...' : user.subscriptionTier === 'free' ? 'Already Free Tier' : 'Reset to Free'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Demo Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <strong>How to use demo access:</strong>
                <ol className="mt-2 space-y-1 ml-4 list-decimal">
                  <li>Click "Activate Premium Demo" or "Activate Ultimate Demo" above</li>
                  <li>You'll be redirected to the full dashboard with all features unlocked</li>
                  <li>Test any premium/ultimate features without payment</li>
                  <li>Use "Reset to Free" to test the upgrade flow again</li>
                </ol>
              </div>
              
              <div>
                <strong>Quick Access URLs:</strong>
                <ul className="mt-2 space-y-1 ml-4 list-disc">
                  <li><code>/dashboard</code> - Full premium/ultimate dashboard</li>
                  <li><code>/assessment</code> - Advanced assessment tools</li>
                  <li><code>/scenarios</code> - Scenario training (premium+)</li>
                  <li><code>/goals</code> - Goal setting and tracking (premium+)</li>
                  <li><code>/community</code> - Community features (premium+)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <strong className="text-yellow-800">Note:</strong>
                <span className="text-yellow-700 ml-1">
                  This demo access is for testing purposes only. In production, users would need to complete payment to access these features.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}