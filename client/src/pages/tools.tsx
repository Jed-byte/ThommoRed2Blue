import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Timer, Target, CircleDot, Brain, ArrowLeft, AlertTriangle, Eye } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PreShotRoutineBuilder } from "@/components/pre-shot-routine-builder";
import { SimpleR2BTools } from "@/components/simple-r2b-tools";
import { useAuth } from "@/hooks/useAuth";

export default function Tools() {
  const { user } = useAuth();
  const userId = user?.id || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Cerosity Mental Performance Tools
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Professional coaching tools designed to develop elite mental performance. 
              These evidence-based methodologies help you transition from reactive "Red Head" 
              states to focused "Blue Head" performance.
            </p>
          </div>

          {/* Tools Tabs */}
          <Tabs defaultValue="pre-shot-routine" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:grid-cols-6 text-xs">
              <TabsTrigger value="pre-shot-routine" className="flex items-center space-x-2">
                <Timer className="h-4 w-4" />
                <span className="hidden sm:inline">Pre-Shot Routine</span>
                <span className="sm:hidden">Routine</span>
              </TabsTrigger>
              <TabsTrigger value="mental-skills" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Mental Skills X-Check</span>
                <span className="sm:hidden">X-Check</span>
              </TabsTrigger>
              <TabsTrigger value="control-circles" className="flex items-center space-x-2">
                <CircleDot className="h-4 w-4" />
                <span className="hidden sm:inline">Control Circles</span>
                <span className="sm:hidden">Control</span>
              </TabsTrigger>
              <TabsTrigger value="mindset-map" className="flex items-center space-x-2">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Mindset Map</span>
                <span className="sm:hidden">Mindset</span>
              </TabsTrigger>
              <TabsTrigger value="what-ifs" className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">What If's</span>
                <span className="sm:hidden">What If's</span>
              </TabsTrigger>
              <TabsTrigger value="recognition" className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">Recognition Radar</span>
                <span className="sm:hidden">Recognition</span>
              </TabsTrigger>
            </TabsList>

            {/* Pre-Shot Routine */}
            <TabsContent value="pre-shot-routine" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-blue-900">Pre-Shot Routine Playbook</CardTitle>
                        <CardDescription className="text-blue-700">
                          Master your 25-second routine for consistent performance under pressure. 
                          This systematic approach helps you enter the Blue Head state before every shot.
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF Guide
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-blue-800">
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Key Benefits:</h4>
                        <ul className="space-y-1">
                          <li>• Consistent mental preparation</li>
                          <li>• Reduced anxiety and tension</li>
                          <li>• Improved focus and concentration</li>
                          <li>• Enhanced confidence and trust</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">When to Use:</h4>
                        <ul className="space-y-1">
                          <li>• Before every shot in competition</li>
                          <li>• During practice sessions</li>
                          <li>• High-pressure situations</li>
                          <li>• When feeling rushed or tense</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <PreShotRoutineBuilder userId={userId} />
              </div>
            </TabsContent>

            {/* Mental Skills X-Check */}
            <TabsContent value="mental-skills" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-green-900">Mental Skills X-Check Tool</CardTitle>
                        <CardDescription className="text-green-700">
                          Track and evaluate your performance across the four core Cerosity mental skills. 
                          Use this systematic review to identify strengths and areas for improvement.
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF Guide
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-green-800">
                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Intensity Management</h4>
                        <p>Control your energy and arousal levels for optimal performance</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Decision Making</h4>
                        <p>Make clear, confident choices without second-guessing</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Managing Diversions</h4>
                        <p>Stay focused despite external distractions and interruptions</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Execution</h4>
                        <p>Trust your preparation and commit fully to each shot</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <SimpleR2BTools userId={userId} tool="mental-skills" />
              </div>
            </TabsContent>

            {/* Control Circles */}
            <TabsContent value="control-circles" className="space-y-6">
              <div className="grid gap-6">
                <Card className="bg-purple-50 border-purple-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-purple-900">R2B Control Circles Tool</CardTitle>
                        <CardDescription className="text-purple-700">
                          Focus your mental energy on what truly matters. This exercise helps you distinguish 
                          between what you can control, influence, or must accept, leading to better mental clarity.
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF Guide
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="text-purple-800">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-semibold mb-2">Can't Control</h4>
                        <p>External factors completely outside your influence - accept and let go</p>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-semibold mb-2">Can Influence</h4>
                        <p>Factors you can partially affect through your actions and preparation</p>
                      </div>
                      <div className="text-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                        <h4 className="font-semibold mb-2">Can Control</h4>
                        <p>Your thoughts, actions, and responses - focus your energy here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <SimpleR2BTools userId={userId} tool="control-circles" />
              </div>
            </TabsContent>

            {/* Mindset Map */}
            <TabsContent value="mindset-map" className="space-y-6">
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-orange-900">R2B Mindset Map</CardTitle>
                      <CardDescription className="text-orange-700">
                        Visual framework for understanding the journey from Red Head reactive states 
                        to Blue Head performance states. Use this as your mental performance compass.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF Guide
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Red Head State */}
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                      <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        Red Head State
                      </h3>
                      <div className="space-y-3 text-sm text-red-700">
                        <div>
                          <h4 className="font-semibold">Characteristics:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Reactive and emotional</li>
                            <li>Overthinking and analysis paralysis</li>
                            <li>Tense and anxious</li>
                            <li>Focused on outcomes</li>
                            <li>Self-doubt and negative self-talk</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold">Triggers:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Bad shots or mistakes</li>
                            <li>Pressure situations</li>
                            <li>External distractions</li>
                            <li>Performance expectations</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Blue Head State */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                        Blue Head State
                      </h3>
                      <div className="space-y-3 text-sm text-blue-700">
                        <div>
                          <h4 className="font-semibold">Characteristics:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Calm and composed</li>
                            <li>Clear thinking and decision making</li>
                            <li>Relaxed confidence</li>
                            <li>Process-focused</li>
                            <li>Trust and commitment</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold">Enablers:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Consistent routines</li>
                            <li>Present moment awareness</li>
                            <li>Positive self-talk</li>
                            <li>Clear intentions</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transition Strategies */}
                  <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Red to Blue Transition Strategies</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700">
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">Reset Techniques</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>3-2-1 breathing reset</li>
                          <li>Physical movement routine</li>
                          <li>Positive anchor word</li>
                          <li>Refocus on process cues</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">Mental Tools</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Visualization and imagery</li>
                          <li>Self-talk restructuring</li>
                          <li>Attention control</li>
                          <li>Confidence building</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-blue-600 mb-2">Performance Anchors</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Pre-shot routine consistency</li>
                          <li>Target commitment</li>
                          <li>Tempo and rhythm</li>
                          <li>Trust in preparation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* What If's Planning */}
            <TabsContent value="what-ifs" className="space-y-6">
              <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-orange-900">What If's Planning Tool</CardTitle>
                      <CardDescription className="text-orange-700">
                        Prepare strategies for challenging scenarios before they happen. Build mental resilience 
                        through proactive scenario planning and contingency strategies.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF Guide
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-orange-800">
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Purpose & Benefits:</h4>
                      <ul className="space-y-1">
                        <li>• Reduce anxiety through preparation</li>
                        <li>• Build confidence in challenging situations</li>
                        <li>• Develop quick decision-making skills</li>
                        <li>• Create contingency strategies</li>
                        <li>• Improve mental resilience</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Common Scenarios to Plan For:</h4>
                      <ul className="space-y-1">
                        <li>• Pressure shots in competition</li>
                        <li>• Adverse weather conditions</li>
                        <li>• Equipment malfunctions</li>
                        <li>• Performance distractions</li>
                        <li>• Physical discomfort or fatigue</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                    <p className="text-sm">
                      <strong>Interactive tool coming soon:</strong> Create detailed scenario plans with risk assessment, 
                      strategy development, and mental preparation techniques for any challenging situation you might face.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recognition Radar */}
            <TabsContent value="recognition" className="space-y-6">
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-purple-900">Recognition Radar</CardTitle>
                      <CardDescription className="text-purple-700">
                        Identify red and blue behaviors and triggers in yourself and others. 
                        Build awareness for better performance state management and team dynamics.
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF Guide
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Red Behaviors */}
                    <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                      <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                        Red Behaviors to Recognize
                      </h3>
                      <div className="space-y-3 text-sm text-red-700">
                        <div>
                          <h4 className="font-semibold">Physical Signs:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Tense body language</li>
                            <li>Rapid or shallow breathing</li>
                            <li>Fidgeting or restlessness</li>
                            <li>Clenched jaw or fists</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold">Mental/Emotional:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Negative self-talk</li>
                            <li>Overthinking decisions</li>
                            <li>Frustration or anger</li>
                            <li>Loss of confidence</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Blue Behaviors */}
                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                      <h3 className="text-lg font-bold text-blue-800 mb-3 flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                        Blue Behaviors to Cultivate
                      </h3>
                      <div className="space-y-3 text-sm text-blue-700">
                        <div>
                          <h4 className="font-semibold">Physical Signs:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Relaxed posture</li>
                            <li>Controlled breathing</li>
                            <li>Fluid movements</li>
                            <li>Confident stance</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold">Mental/Emotional:</h4>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Positive self-talk</li>
                            <li>Clear decision making</li>
                            <li>Calm confidence</li>
                            <li>Present moment focus</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recognition Practice */}
                  <div className="p-4 bg-purple-100 border-2 border-purple-200 rounded-lg">
                    <h3 className="text-lg font-bold text-purple-800 mb-3">Recognition Practice</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-700">
                      <div>
                        <h4 className="font-semibold mb-2">Self-Awareness:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Regular mental state check-ins</li>
                          <li>Body scan awareness</li>
                          <li>Trigger identification</li>
                          <li>Pattern recognition</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Team Awareness:</h4>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>Reading teammates' states</li>
                          <li>Supportive communication</li>
                          <li>Group energy management</li>
                          <li>Positive influence strategies</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Interactive tool coming soon:</strong> Practice identifying red and blue behaviors 
                      with video scenarios, assessment tools, and personalized feedback for improved awareness.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}