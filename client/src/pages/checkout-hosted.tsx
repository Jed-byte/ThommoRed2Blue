import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, CreditCard } from "lucide-react";

export default function CheckoutHosted() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<"premium" | "ultimate">("premium");
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tierParam = urlParams.get("tier") as "premium" | "ultimate";
    if (tierParam) {
      setTier(tierParam);
    }
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const amount = tier === "ultimate" ? 2190 : 490;
      
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        tier,
        amount,
        success_url: `${window.location.origin}/signup-after-payment?tier=${tier}`,
        cancel_url: window.location.href
      });

      const data = await response.json();
      
      if (data.url) {
        console.log('Redirecting to Stripe URL:', data.url);
        
        // Store the URL for manual link fallback
        setCheckoutUrl(data.url);
        
        // Use the payment redirect page as an intermediate step
        const redirectUrl = `/payment-redirect?url=${encodeURIComponent(data.url)}`;
        setLocation(redirectUrl);
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setError('Failed to initialize payment. Please try again.');
      setLoading(false);
    }
  };

  const tierInfo = {
    premium: { amount: 490, name: "Premium Access" },
    ultimate: { amount: 2190, name: "Ultimate Access" }
  };

  const currentTier = tierInfo[tier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="mb-4">
            <ArrowLeft className="mr-2" size={16} />
            Back to Pricing
          </Button>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Brain className="text-blue-600 mr-2" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Red2Blue</h1>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Complete Your {currentTier.name}
            </h2>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              ${currentTier.amount} - {currentTier.name}
            </CardTitle>
            <p className="text-center text-gray-600">
              One-time payment • Lifetime access • No recurring fees
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Secure Payment Processing</h3>
              <p className="text-blue-700 text-sm">
                Your payment will be processed securely through Stripe. 
                You'll be redirected to enter your payment details safely.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-red-700">{error}</p>
                {checkoutUrl && (
                  <div className="mt-3">
                    <a 
                      href={checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <CreditCard className="mr-2" size={16} />
                      Click here to continue payment
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">{currentTier.name}</span>
                <span className="font-semibold">${currentTier.amount}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Processing Fee</span>
                <span className="font-semibold">$0</span>
              </div>
              <div className="flex items-center justify-between py-2 font-bold text-lg">
                <span>Total</span>
                <span>${currentTier.amount}</span>
              </div>
            </div>

            <Button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2" size={20} />
                  Proceed to Secure Payment
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Powered by Stripe • Your payment information is secure and encrypted
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}