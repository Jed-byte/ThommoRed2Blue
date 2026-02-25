import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface TechniqueCardProps {
  technique: {
    id: number;
    name: string;
    description: string;
    category: string;
  };
  colorIndex: number;
}

const colorClasses = [
  "from-blue-50 to-blue-100 bg-blue-primary",
  "from-indigo-50 to-indigo-100 bg-indigo-600", 
  "from-teal-50 to-teal-100 bg-teal-600",
  "from-purple-50 to-purple-100 bg-purple-600"
];

const iconMap = {
  breathing: "🫁",
  focus: "🎯", 
  pressure: "⛰️",
  anchor: "⚓"
};

export function TechniqueCard({ technique, colorIndex }: TechniqueCardProps) {
  const colorClass = colorClasses[colorIndex % colorClasses.length];
  const [fromTo, bgColor] = colorClass.split(' bg-');
  
  return (
    <Card className={`group bg-gradient-to-br ${fromTo} hover:shadow-lg transition-all cursor-pointer`}>
      <CardContent className="p-6">
        <div className={`w-12 h-12 bg-${bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
          <span className="text-white text-xl">
            {iconMap[technique.category as keyof typeof iconMap] || "🧠"}
          </span>
        </div>
        <h4 className="font-semibold text-gray-900 mb-2">{technique.name}</h4>
        <p className="text-sm text-gray-600 mb-4">{technique.description}</p>
        <div className={`flex items-center text-sm text-${bgColor} font-medium`}>
          <span>Start Exercise</span>
          <Play className="ml-2" size={14} />
        </div>
      </CardContent>
    </Card>
  );
}
