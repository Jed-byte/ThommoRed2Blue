import { AIRecommendations } from "@/components/ai-recommendations";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function RecommendationsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      <AIRecommendations />
    </div>
  );
}