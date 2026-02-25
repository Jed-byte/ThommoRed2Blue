import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain } from "lucide-react";

// Fetch Stripe config from backend to get the correct publishable key
let stripePromise: Promise<any> | null = null;

async function getStripeConfig() {
  try {
    const response = await fetch('/api/stripe-config');
    const data = await response.json();
    
    if (!response.ok || !data.publishableKey) {
      throw new Error(data.error || 'Failed to get Stripe configuration');
    }
    
    console.log('Stripe Config:', {
      publishableKey: `${data.publishableKey.substring(0, 7)}...`,
      keyType: data.publishableKey.startsWith('pk_') ? 'publishable' : 'invalid'
    });
    
    return data.publishableKey;
  } catch (error) {
    console.error('Failed to fetch Stripe config:', error);
    throw error;
  }
}

// Initialize Stripe promise
stripePromise = getStripeConfig().then(publishableKey => loadStripe(publishableKey));

interface CheckoutFormProps {
  amount: number;
  tier: string;
}

function CheckoutForm({ amount, tier }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false);
  const [, setLocation] = useLocation();

  // Debug the state changes
  useEffect(() => {
    console.log('CheckoutForm render:', { 
      stripe: !!stripe, 
      elements: !!elements, 
      isPaymentElementReady,
      amount, 
      tier 
    });
  }, [stripe, elements, isPaymentElementReady, amount, tier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !isPaymentElementReady) {
      console.log('Stripe not ready:', { 
        stripe: !!stripe, 
        elements: !!elements, 
        paymentElementReady: isPaymentElementReady 
      });
      toast({
        title: "Payment Not Ready",
        description: "Please wait for the payment form to load completely.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/signup-after-payment?tier=${tier}`,
        },
      });

      if (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        sessionStorage.setItem('paidTier', tier);
        setLocation(`/signup-after-payment?tier=${tier}`);
      }
    } catch (error) {
      console.error('Payment exception:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="min-h-[200px] p-4">
        <PaymentElement 
          onReady={() => {
            console.log('PaymentElement is now ready!');
            setIsPaymentElementReady(true);
          }}
          onLoadError={(error) => {
            console.error('PaymentElement load error:', error);
            toast({
              title: "Payment Form Error",
              description: "Failed to load payment form. Please refresh and try again.",
              variant: "destructive",
            });
          }}
        />
      </div>
      
      {!isPaymentElementReady && (
        <div className="text-center text-sm text-gray-500 py-2">
          Loading secure payment form...
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={!stripe || !elements || !isPaymentElementReady || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? "Processing..." : 
         !isPaymentElementReady ? "Loading Payment Form..." :
         `Pay $${amount} - Complete Purchase`}
      </Button>
    </form>
  );
}

export default function CheckoutFinal() {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<"premium" | "ultimate">("premium");
  const [, setLocation] = useLocation();

  // Debug main component state
  useEffect(() => {
    console.log('CheckoutFinal state:', { 
      clientSecret: !!clientSecret, 
      error, 
      tier 
    });
  }, [clientSecret, error, tier]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tierParam = urlParams.get("tier") as "premium" | "ultimate";
    if (tierParam) {
      setTier(tierParam);
    }

    const amount = tierParam === "ultimate" ? 2190 : 490;
    
    apiRequest("POST", "/api/create-payment-intent", { 
      amount, 
      tier: tierParam || "premium",
      description: `Red2Blue ${tierParam === "ultimate" ? "Ultimate" : "Premium"} Access - Lifetime`
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          setError('Failed to initialize payment');
        }
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setError('Failed to initialize payment');
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Setup Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
              <ArrowLeft className="mr-2" size={16} />
              Back to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-red-blue rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Brain className="text-white" size={32} />
          </div>
          <p className="text-gray-600">Setting up secure payment...</p>
        </div>
      </div>
    );
  }

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
          <CardContent>
            <Elements 
              key={`elements-${clientSecret}`}
              stripe={stripePromise} 
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe' as const,
                  variables: {
                    colorPrimary: '#2563eb',
                  }
                }
              }}
            >
              <CheckoutForm 
                amount={currentTier.amount} 
                tier={tier}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}