import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Target, AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface Scenario {
  id: number;
  title: string;
  description: string;
  pressureLevel: string;
  category: string;
  redHeadTriggers: string[];
  blueHeadTechniques: string[];
}

export default function Scenarios() {
  const { data: scenarios, isLoading } = useQuery<Scenario[]>({
    queryKey: ["/api/scenarios"],
  });

  const getPressureLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "tournament":
        return Target;
      case "recovery":
        return AlertTriangle;
      case "execution":
        return CheckCircle2;
      default:
        return Brain;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Pressure Scenarios
          </h1>
          <p className="text-gray-600 text-lg">
            Practice mental resilience with realistic competitive pressure situations. Each scenario helps you recognize Red Head triggers and apply Blue Head techniques.
          </p>
        </div>

        {/* Scenarios Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scenarios?.map((scenario) => {
            const IconComponent = getCategoryIcon(scenario.category);
            
            return (
              <Card key={scenario.id} className="shadow-lg border-gray-100 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600 capitalize">
                        {scenario.category}
                      </span>
                    </div>
                    <Badge 
                      className={`${getPressureLevelColor(scenario.pressureLevel)} border`}
                    >
                      {scenario.pressureLevel} Pressure
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 leading-tight">
                    {scenario.title}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {scenario.description}
                  </p>

                  {/* Red Head Triggers */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-red-700 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Red Head Triggers
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {scenario.redHeadTriggers?.map((trigger, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-100"
                        >
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Blue Head Techniques */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-blue-700 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Blue Head Techniques
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {scenario.blueHeadTechniques?.map((technique, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100"
                        >
                          {technique}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Practice Button */}
                  <div className="pt-2">
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => {
                        // In a real implementation, this would start a guided practice session
                        alert(`Starting practice session for: ${scenario.title}\n\nThis would guide you through:\n1. Recognizing the triggers\n2. Applying the techniques\n3. Building mental resilience`);
                      }}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Practice This Scenario
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {scenarios && scenarios.length === 0 && (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Scenarios Available
            </h3>
            <p className="text-gray-600">
              Check back later for new pressure scenarios to practice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}