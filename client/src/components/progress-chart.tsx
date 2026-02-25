import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ProgressChartProps {
  data?: any[];
}

export function ProgressChart({ data }: ProgressChartProps) {
  // Mock chart data for demonstration
  const chartData = data || [];
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  // Generate mock progress values for visualization
  const progressValues = [33, 50, 67, 80, 100, 85, 90];
  
  return (
    <Card className="shadow-sm border-gray-100">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900">Weekly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        
        {/* Mock Chart Area */}
        <div className="h-64 bg-gradient-to-t from-blue-50 to-white rounded-xl border border-gray-100 flex items-end justify-center p-6">
          <div className="flex items-end space-x-2 h-full w-full max-w-sm">
            {progressValues.map((value, index) => {
              const height = `${value}%`;
              const isEarly = value < 60;
              const isMid = value >= 60 && value < 80;
              const isHigh = value >= 80;
              
              let barClass = "gradient-red-coral"; // Red to coral for low scores
              if (isMid) barClass = "gradient-coral-blue"; // Coral to blue for mid scores  
              if (isHigh) barClass = "gradient-blue-deep"; // Blue gradient for high scores
              
              return (
                <div
                  key={index}
                  className={`flex-1 ${barClass} rounded-t transition-all hover:opacity-80`}
                  style={{ height }}
                />
              );
            })}
          </div>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 mt-4">
          {weekDays.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-success/10 rounded-xl">
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-success" size={16} />
            <span className="text-success font-medium">+15% improvement this week</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">Your Blue Head consistency is trending upward</p>
        </div>
      </CardContent>
    </Card>
  );
}
