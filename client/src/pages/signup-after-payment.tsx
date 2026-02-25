import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { StableSignUpForm } from '@/components/stable-signup-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckCircle } from 'lucide-react';

export default function SignupAfterPayment() {
  const [location] = useLocation();
  const [tier, setTier] = useState<string>('free');

  useEffect(() => {
    // Get tier from URL params or sessionStorage
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const tierFromUrl = urlParams.get('tier');
    const tierFromStorage = sessionStorage.getItem('paidTier');
    
    const selectedTier = tierFromUrl || tierFromStorage || 'free';
    setTier(selectedTier);
    
    // Clear the stored tier since we're using it now
    sessionStorage.removeItem('paidTier');
  }, [location]);

  const tierInfo = {
    premium: { name: "Premium Access", amount: 490 },
    ultimate: { name: "Ultimate Access", amount: 2190 }
  };

  const currentTier = tierInfo[tier as keyof typeof tierInfo];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Payment Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600">Complete your account setup to access your {currentTier?.name}</p>
        </div>

        {/* Payment Summary */}
        {currentTier && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center">
                <Brain className="mr-2" size={20} />
                Red2Blue {currentTier.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-green-700">Lifetime Access Purchased</span>
                <span className="text-2xl font-bold text-green-800">${currentTier.amount}</span>
              </div>
              <p className="text-sm text-green-600 mt-2">
                No recurring charges • Full access to all features
              </p>
            </CardContent>
          </Card>
        )}

        {/* Signup Form */}
        <StableSignUpForm 
          selectedTier={tier}
          isPaidUser={true}
          onBack={() => window.location.href = '/'}
        />
      </div>
    </div>
  );
}