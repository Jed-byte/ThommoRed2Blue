import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, MessageCircle, Video, Clock, User, Star, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";

export default function HumanCoaching() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [reviewRequest, setReviewRequest] = useState("");

  // Send message to coach mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest("POST", "/api/human-coaching/message", {
        userId: user?.id,
        message,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been sent to your human coach. They'll respond within 24 hours.",
      });
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["/api/human-coaching/messages"] });
    }
  });

  // Request progress review mutation
  const reviewRequestMutation = useMutation({
    mutationFn: async (request: string) => {
      return apiRequest("POST", "/api/human-coaching/progress-review", {
        userId: user?.id,
        request,
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Review Requested",
        description: "Your progress review request has been sent. Your coach will provide feedback within 48 hours.",
      });
      setReviewRequest("");
    }
  });

  // Schedule session mutation (placeholder - would integrate with actual booking system)
  const scheduleSessionMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/human-coaching/schedule-request", {
        userId: user?.id,
        requestType: "general_coaching",
        timestamp: new Date().toISOString()
      });
    },
    onSuccess: () => {
      toast({
        title: "Session Request Sent",
        description: "Your coaching session request has been sent. Your coach will contact you to schedule within 24 hours.",
      });
    }
  });

  if (user?.subscriptionTier !== 'ultimate') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center p-8">
          <CardContent>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Human Coaching Access</h1>
            <p className="text-gray-600 mb-6">
              Human coaching is available exclusively for Ultimate subscription members.
            </p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Upgrade to Ultimate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
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
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
            <User className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Human Coaching Center</h1>
            <p className="text-gray-600">Connect with your certified Red2Blue performance coach</p>
          </div>
          <div className="ml-auto">
            <Badge className="bg-purple-100 text-purple-800">Ultimate Member</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Coach Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2" size={20} />
              Your Assigned Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">MC</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Mark Croxford</h3>
                <p className="text-gray-600 text-sm mb-2">Certified Red2Blue Performance Coach</p>
                <div className="flex items-center space-x-1 mb-3">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">15+ years experience</span>
                </div>
                <p className="text-sm text-gray-700">
                  Specializes in pressure performance, mental resilience, and competitive mindset development for elite golfers.
                </p>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">150+</div>
                <div className="text-sm text-gray-600">Golfers Coached</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">24hr</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2" size={20} />
              Coaching Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full justify-start bg-blue-600 hover:bg-blue-700"
              onClick={() => scheduleSessionMutation.mutate()}
              disabled={scheduleSessionMutation.isPending}
            >
              <Video className="mr-3" size={18} />
              {scheduleSessionMutation.isPending ? "Requesting..." : "Schedule 1-on-1 Session"}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => document.getElementById('message-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <MessageCircle className="mr-3" size={18} />
              Send Message to Coach
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => document.getElementById('review-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <CheckCircle className="mr-3" size={18} />
              Request Progress Review
            </Button>
          </CardContent>
        </Card>

        {/* Send Message */}
        <Card id="message-section">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2" size={20} />
              Message Your Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Ask about specific techniques, share your challenges, or discuss your mental game progress..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
              />
              <Button 
                onClick={() => sendMessageMutation.mutate(messageText)}
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
              <p className="text-sm text-gray-600">
                Your coach will respond within 24 hours during business days.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Progress Review Request */}
        <Card id="review-section">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2" size={20} />
              Request Progress Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="What specific areas would you like your coach to review? (assessments, technique practice, tournament preparation, etc.)"
                value={reviewRequest}
                onChange={(e) => setReviewRequest(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={() => reviewRequestMutation.mutate(reviewRequest)}
                disabled={!reviewRequest.trim() || reviewRequestMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {reviewRequestMutation.isPending ? "Requesting..." : "Request Review"}
              </Button>
              <p className="text-sm text-gray-600">
                Your coach will provide detailed feedback within 48 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2" size={20} />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Welcome to Human Coaching!</p>
                  <p className="text-sm text-gray-600">Your coach is ready to help you achieve peak performance</p>
                </div>
                <Badge variant="outline">New</Badge>
              </div>
              
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="mx-auto mb-4 text-gray-300" size={48} />
                <p>No coaching sessions yet. Schedule your first session to get started!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}