import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  MessageCircle, 
  Target, 
  TrendingUp, 
  Brain, 
  Users, 
  Star,
  Zap,
  Heart,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Crown,
  Shield,
  Clock
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  benefits: string[];
  availability: "free" | "premium" | "ultimate";
  category: string;
}

const features: FeatureCard[] = [
  {
    title: "AI Coach Flo",
    description: "Your personal mental performance coach powered by advanced AI technology. Flo provides personalized coaching conversations tailored to your specific mental game challenges.",
    icon: MessageCircle,
    benefits: [
      "24/7 availability for mental coaching support",
      "Personalized advice based on your assessment data",
      "Conversation history tracking for continuous improvement",
      "Adaptive coaching style that learns your preferences"
    ],
    availability: "premium",
    category: "AI Coaching"
  },
  {
    title: "Mental Skills X-Check",
    description: "Comprehensive assessment tool that evaluates four critical mental performance areas: Intensity Management, Decision Making, Diversions Control, and Execution Focus.",
    icon: Target,
    benefits: [
      "Detailed scoring across four key mental areas",
      "Specific recommendations for improvement",
      "Progress tracking over time",
      "Visual performance analytics"
    ],
    availability: "free",
    category: "Assessment Tools"
  },
  {
    title: "Control Circles Tool",
    description: "Strategic mental framework helping you categorize thoughts and situations into Can't Control, Can Control, and Can Influence categories for enhanced focus and reduced anxiety.",
    icon: Target,
    benefits: [
      "Reduces mental overwhelm and anxiety",
      "Improves focus on actionable elements",
      "Builds mental clarity during pressure",
      "Structured problem-solving approach"
    ],
    availability: "free",
    category: "Mental Tools"
  },
  {
    title: "Daily Mood Tracking",
    description: "Track your daily emotional state and discover how it correlates with your golf performance. The system identifies patterns between mood and mental game effectiveness.",
    icon: Heart,
    benefits: [
      "Identify mood-performance patterns",
      "Data-driven insights about emotional triggers",
      "Correlation analysis with assessment scores",
      "Personalized coaching based on mood trends"
    ],
    availability: "free",
    category: "Progress Tracking"
  },
  {
    title: "Mental Techniques Library",
    description: "Extensive collection of proven mental performance techniques including breathing exercises, visualization methods, focus drills, and pressure management strategies.",
    icon: Brain,
    benefits: [
      "Categorized techniques for specific situations",
      "Step-by-step practice instructions",
      "Emergency relief techniques for high pressure",
      "Community-contributed successful methods"
    ],
    availability: "free",
    category: "Skill Development"
  },
  {
    title: "AI Recommendation Engine",
    description: "Intelligent system that analyzes your assessments, chat history, and mood patterns to generate personalized technique recommendations and practice suggestions.",
    icon: Zap,
    benefits: [
      "Personalized technique suggestions",
      "Practice routine recommendations",
      "Coaching conversation topics",
      "Performance improvement roadmaps"
    ],
    availability: "premium",
    category: "AI Intelligence"
  },
  {
    title: "Progress Analytics",
    description: "Comprehensive tracking of your mental game development including assessment improvements, technique practice frequency, mood trends, and engagement metrics.",
    icon: TrendingUp,
    benefits: [
      "Visual progress charts and trends",
      "Performance milestone tracking",
      "Detailed analytics dashboard",
      "Comparative analysis over time"
    ],
    availability: "premium",
    category: "Progress Tracking"
  },
  {
    title: "Community Features",
    description: "Connect with other elite golfers through anonymous technique sharing, community insights, and collaborative mental game development.",
    icon: Users,
    benefits: [
      "Anonymous technique sharing",
      "Community success stories",
      "Peer-contributed mental strategies",
      "Collective wisdom database"
    ],
    availability: "free",
    category: "Community"
  },
  {
    title: "Performance Insights",
    description: "AI-generated insights about your mental performance patterns, including correlation analysis between mood, assessments, and coaching effectiveness.",
    icon: BarChart3,
    benefits: [
      "Pattern recognition in performance data",
      "Correlation insights between different metrics",
      "Predictive performance indicators",
      "Personalized improvement suggestions"
    ],
    availability: "ultimate",
    category: "Advanced Analytics"
  },
  {
    title: "Emergency Relief Protocol",
    description: "Rapid calming techniques specifically designed for high-pressure moments on the golf course. Quick access tools for immediate mental state management.",
    icon: Shield,
    benefits: [
      "Immediate stress relief techniques",
      "Quick access during pressure moments",
      "Proven rapid calming methods",
      "Emergency mental state reset"
    ],
    availability: "free",
    category: "Emergency Support"
  }
];

const subscriptionTiers = [
  {
    name: "Free Tier",
    price: "$0",
    description: "Try the platform with basic features",
    features: [
      "1 Flo conversation",
      "Mental Skills X-Check",
      "Control Circles Tool",
      "Daily mood tracking",
      "Basic techniques library",
      "Community access"
    ],
    availability: "free"
  },
  {
    name: "Premium",
    price: "$490",
    description: "Full access to AI coaching and analytics (75% savings)",
    features: [
      "Unlimited Flo conversations",
      "AI recommendation engine",
      "Progress analytics dashboard",
      "All assessment tools",
      "Complete techniques library",
      "Priority support"
    ],
    availability: "premium"
  },
  {
    name: "Ultimate",
    price: "$2190",
    description: "Advanced features for elite performance",
    features: [
      "Everything in Premium",
      "Advanced performance insights",
      "Predictive analytics",
      "Priority AI processing",
      "Direct coach consultation",
      "Early access to new features"
    ],
    availability: "ultimate"
  }
];

const getAvailabilityColor = (availability: string) => {
  switch (availability) {
    case "free": return "bg-green-100 text-green-800";
    case "premium": return "bg-blue-100 text-blue-800";
    case "ultimate": return "bg-purple-100 text-purple-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getAvailabilityIcon = (availability: string) => {
  switch (availability) {
    case "free": return <CheckCircle2 className="h-3 w-3" />;
    case "premium": return <Star className="h-3 w-3" />;
    case "ultimate": return <Crown className="h-3 w-3" />;
    default: return null;
  }
};

export default function Features() {
  const categories = Array.from(new Set(features.map(f => f.category)));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Platform Features</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Comprehensive mental performance coaching tools designed for elite golfers seeking to master their mental game.
        </p>
      </div>

      {/* Feature Categories */}
      <div className="space-y-12">
        {categories.map(category => (
          <div key={category} className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.filter(f => f.category === category).map((feature, index) => (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <feature.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <Badge className={`${getAvailabilityColor(feature.availability)} flex items-center space-x-1`}>
                        {getAvailabilityIcon(feature.availability)}
                        <span className="capitalize">{feature.availability}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Key Benefits:</h4>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm text-gray-600">
                            <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Comparison */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
          <p className="text-gray-600">Select the subscription tier that matches your mental performance goals</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionTiers.map((tier, index) => (
            <Card key={index} className={`relative ${tier.availability === 'premium' ? 'border-blue-500 shadow-lg' : ''}`}>
              {tier.availability === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">{tier.price}</div>
                <p className="text-gray-600 text-sm">{tier.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${tier.availability === 'premium' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={tier.availability === 'free' ? 'outline' : 'default'}
                >
                  {tier.availability === 'free' ? 'Get Started Free' : 'Upgrade Now'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card className="bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="text-2xl text-center">How Red2Blue Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold">1</span>
              </div>
              <h3 className="font-semibold">Assess</h3>
              <p className="text-sm text-gray-600">Complete mental skills assessment to establish baseline</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold">2</span>
              </div>
              <h3 className="font-semibold">Learn</h3>
              <p className="text-sm text-gray-600">Practice proven mental techniques tailored to your needs</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold">3</span>
              </div>
              <h3 className="font-semibold">Coach</h3>
              <p className="text-sm text-gray-600">Chat with Flo for personalized mental game guidance</p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto">
                <span className="font-bold">4</span>
              </div>
              <h3 className="font-semibold">Improve</h3>
              <p className="text-sm text-gray-600">Track progress and refine mental performance over time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gray-900 text-white">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Master Your Mental Game?</h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join elite golfers who are using Red2Blue to transform their mental performance and achieve consistent excellence on the course.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
              View Pricing
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}