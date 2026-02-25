import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, TrendingDown, TrendingUp, AlertTriangle, Calendar, MessageSquare } from "lucide-react";
import { ProgressChart } from "@/components/progress-chart";

interface StudentSummary {
  id: number;
  username: string;
  email: string;
  lastAssessment?: {
    totalScore: number;
    intensityScore: number;
    decisionMakingScore: number;
    diversionsScore: number;
    executionScore: number;
    createdAt: string;
  };
  assessmentCount: number;
  lastActivity: string;
  riskLevel: 'low' | 'medium' | 'high';
  trends: {
    direction: 'improving' | 'declining' | 'stable';
    change: number;
  };
}

export default function CoachDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const { data: students, isLoading } = useQuery({
    queryKey: ['/api/coach/students'],
    queryFn: () => fetch('/api/coach/students', { credentials: 'include' }).then(res => res.json()) as Promise<StudentSummary[]>
  });

  const { data: studentDetail } = useQuery({
    queryKey: ['/api/coach/student-detail', selectedStudent],
    queryFn: () => selectedStudent 
      ? fetch(`/api/coach/student-detail/${selectedStudent}`, { credentials: 'include' }).then(res => res.json())
      : null,
    enabled: !!selectedStudent
  });

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const studentsArray = Array.isArray(students) ? students : [];
  const highRiskStudents = studentsArray.filter(s => s.riskLevel === 'high');
  const decliningStudents = studentsArray.filter(s => s.trends.direction === 'declining');
  const recentAssessments = studentsArray.filter(s => s.lastAssessment && 
    new Date(s.lastActivity) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Coach Dashboard</h1>
            <p className="text-lg text-gray-600">
              Monitor student progress and identify coaching opportunities
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold">{students?.length || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Risk</p>
                    <p className="text-2xl font-bold text-red-600">{highRiskStudents.length}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Declining</p>
                    <p className="text-2xl font-bold text-orange-600">{decliningStudents.length}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                    <p className="text-2xl font-bold text-green-600">{recentAssessments.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts */}
          {highRiskStudents.length > 0 && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>{highRiskStudents.length} student(s)</strong> require immediate attention due to declining performance or low assessment scores.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Student Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              <TabsTrigger value="follow-ups">Follow-up Actions</TabsTrigger>
            </TabsList>

            {/* Student Overview */}
            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Student Performance Summary</CardTitle>
                    <CardDescription>
                      Click on a student to view detailed analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {students?.map((student) => (
                      <div
                        key={student.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedStudent === student.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedStudent(student.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{student.username}</h4>
                          <div className="flex items-center space-x-2">
                            {getTrendIcon(student.trends.direction)}
                            <Badge variant={getRiskBadgeVariant(student.riskLevel)}>
                              {student.riskLevel} risk
                            </Badge>
                          </div>
                        </div>
                        
                        {student.lastAssessment && (
                          <div className="grid grid-cols-4 gap-2 text-sm">
                            <div className="text-center">
                              <p className="text-gray-600">Intensity</p>
                              <p className={getScoreColor(student.lastAssessment.intensityScore)}>
                                {student.lastAssessment.intensityScore}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Decision</p>
                              <p className={getScoreColor(student.lastAssessment.decisionMakingScore)}>
                                {student.lastAssessment.decisionMakingScore}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Diversions</p>
                              <p className={getScoreColor(student.lastAssessment.diversionsScore)}>
                                {student.lastAssessment.diversionsScore}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-600">Execution</p>
                              <p className={getScoreColor(student.lastAssessment.executionScore)}>
                                {student.lastAssessment.executionScore}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                          <span>{student.assessmentCount} assessments</span>
                          <span>Last: {new Date(student.lastActivity).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Student Detail */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedStudent 
                        ? `${students?.find(s => s.id === selectedStudent)?.username} - Detailed View`
                        : 'Select a Student'
                      }
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedStudent && studentDetail ? (
                      <div className="space-y-6">
                        {/* Progress Chart */}
                        <div>
                          <h4 className="font-semibold mb-3">Assessment Trend</h4>
                          <ProgressChart data={studentDetail.assessmentHistory} />
                        </div>

                        {/* Recent Tools Usage */}
                        <div>
                          <h4 className="font-semibold mb-3">Tool Usage</h4>
                          <div className="space-y-2">
                            {studentDetail.toolUsage?.map((tool: any, index: number) => (
                              <div key={index} className="flex justify-between items-center">
                                <span>{tool.name}</span>
                                <Badge variant="outline">{tool.lastUsed}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Coaching Recommendations */}
                        <div>
                          <h4 className="font-semibold mb-3">Coaching Focus Areas</h4>
                          <div className="space-y-2">
                            {studentDetail.recommendations?.map((rec: string, index: number) => (
                              <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                                {rec}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex items-center space-x-2"
                            onClick={() => {
                              const selectedStudentData = studentsArray.find(s => s.id === selectedStudent);
                              if (selectedStudentData) {
                                const subject = `Red2Blue Coaching Follow-up - ${selectedStudentData.username}`;
                                const body = `Hi ${selectedStudentData.username},

I wanted to follow up on your recent mental performance assessment and training progress.

Based on your latest results:
- Total Score: ${selectedStudentData.lastAssessment?.totalScore || 'No assessment'}%
- Risk Level: ${selectedStudentData.riskLevel}
- Performance Trend: ${selectedStudentData.trends.direction}

I'd like to schedule a coaching session to discuss your progress and work on specific techniques to enhance your mental game.

Please reply with your availability for a 30-minute session this week.

Best regards,
Your Red2Blue Coach`;
                                
                                window.location.href = `mailto:${selectedStudentData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                              }
                            }}
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>Send Message</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const selectedStudentData = studentsArray.find(s => s.id === selectedStudent);
                              if (selectedStudentData) {
                                // Create notification for user
                                const notification = {
                                  userId: selectedStudentData.id,
                                  type: 'check-in-scheduled',
                                  title: 'Check-in Scheduled',
                                  message: `Your coach has scheduled a check-in session. Please prepare your recent practice notes and any questions about your mental performance training.`,
                                  scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
                                };
                                
                                // Send notification to backend
                                fetch('/api/notifications', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  credentials: 'include',
                                  body: JSON.stringify(notification)
                                });
                                
                                alert(`Check-in scheduled for ${selectedStudentData.username}. They will be notified when they next log in.`);
                              }
                            }}
                          >
                            Schedule Check-in
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        Select a student from the list to view detailed analysis
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Detailed Analysis */}
            <TabsContent value="detailed">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive analysis across all students
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 py-8 text-center">
                    Advanced analytics and trend analysis coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Follow-up Actions */}
            <TabsContent value="follow-ups">
              <Card>
                <CardHeader>
                  <CardTitle>Automated Follow-up System</CardTitle>
                  <CardDescription>
                    Configure threshold-based interventions and scheduled check-ins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Risk-Based Alerts</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Automatically notify when student scores drop below thresholds
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <label className="block text-gray-600">Intensity Threshold</label>
                          <input 
                            type="number" 
                            defaultValue="60" 
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600">Decision Making</label>
                          <input 
                            type="number" 
                            defaultValue="60" 
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600">Diversions</label>
                          <input 
                            type="number" 
                            defaultValue="60" 
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-600">Execution</label>
                          <input 
                            type="number" 
                            defaultValue="60" 
                            className="w-full p-2 border rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">Scheduled Check-ins</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Automatic reminders for regular student follow-ups
                      </p>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Weekly progress review for high-risk students</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span>Bi-weekly check-in for all active students</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span>Monthly assessment reminder</span>
                        </label>
                      </div>
                    </div>

                    <Button>Save Follow-up Settings</Button>
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