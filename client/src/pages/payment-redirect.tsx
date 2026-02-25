import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ExternalLink, CreditCard } from "lucide-react";

export default function PaymentRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutUrl = urlParams.get("url");
    
    if (checkoutUrl) {
      // Decode the URL if it's encoded
      const decodedUrl = decodeURIComponent(checkoutUrl);
      console.log('Redirecting to:', decodedUrl);
      
      // Immediate redirect attempt
      window.location.replace(decodedUrl);
    }
  }, []);

  const handleManualRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutUrl = urlParams.get("url");
    
    if (checkoutUrl) {
      const decodedUrl = decodeURIComponent(checkoutUrl);
      window.open(decodedUrl, '_blank');
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const checkoutUrl = urlParams.get("url");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="text-blue-600 mr-2" size={32} />
            <h1 className="text-2xl font-bold text-gray-900">Red2Blue</h1>
          </div>
          <CardTitle>Redirecting to Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600">
              You're being redirected to complete your payment securely through Stripe...
            </p>
          </div>
          
          {checkoutUrl && (
            <div className="space-y-3">
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">
                  If the redirect doesn't work automatically:
                </p>
                <Button 
                  onClick={handleManualRedirect}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="mr-2" size={16} />
                  Continue to Payment
                </Button>
              </div>
              
              <div className="text-center">
                <a 
                  href={decodeURIComponent(checkoutUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="mr-1" size={14} />
                  Open payment page in new tab
                </a>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="text-sm"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}