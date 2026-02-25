import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Auto-redirect to signup after a few seconds
    const timer = setTimeout(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const tier = urlParams.get('tier') || 'premium';
      setLocation(`/signup-after-payment?tier=${tier}`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  const handleContinue = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tier = urlParams.get('tier') || 'premium';
    setLocation(`/signup-after-payment?tier=${tier}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Brain className="text-blue-600" size={20} />
              <span>Welcome to Red2Blue</span>
            </div>
            
            <p className="text-gray-600">
              Your payment has been processed successfully. Complete your account setup to start your mental performance journey.
            </p>

            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                🎯 Lifetime access activated<br />
                🤖 AI coaching unlocked<br />
                📊 All features available
              </p>
            </div>

            <Button 
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Complete Account Setup
              <ArrowRight className="ml-2" size={16} />
            </Button>

            <p className="text-xs text-gray-500">
              Redirecting automatically in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}