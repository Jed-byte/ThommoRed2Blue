import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AssessmentCardProps {
  title: string;
  score: number;
  description: string;
  icon: React.ReactNode;
  scoreColor: string;
}

export function AssessmentCard({ title, score, description, icon, scoreColor }: AssessmentCardProps) {
  return (
    <div className="border border-gray-100 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-light rounded-full flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-500">Current Score: {score}/100</p>
          </div>
        </div>
        <Button variant="ghost" className="text-blue-primary hover:text-blue-deep font-medium">
          Retake →
        </Button>
      </div>
      <Progress value={score} className={`w-full h-3 ${scoreColor}`} />
      <p className="text-sm text-gray-600 mt-2">{description}</p>
    </div>
  );
}
