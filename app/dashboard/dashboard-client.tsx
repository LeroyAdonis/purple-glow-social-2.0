'use client';

import { useState, useEffect } from 'react';
import ClientDashboardView from '../../components/client-dashboard-view';
import { useRouter } from 'next/navigation';

interface DashboardClientProps {
  userName: string;
  userEmail: string;
  userImage?: string | null;
  userId: string;
}

export default function DashboardClient({ 
  userName, 
  userEmail, 
  userImage,
  userId 
}: DashboardClientProps) {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);

  // Fetch user tier and credits from database
  const [userTier, setUserTier] = useState<'free' | 'pro' | 'business'>('free');
  const [userCredits, setUserCredits] = useState(10);

  // Fetch user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserTier(data.tier || 'free');
          setUserCredits(data.credits || 10);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    
    fetchUserData();
  }, [userId]);

  const handleCreditPurchase = (credits: number, amount: number) => {
    // In production, this would call an API
    console.log(`Purchasing ${credits} credits for R${amount}`);
    setUserCredits(prev => prev + credits);
    setSuccessData({ type: 'credit', credits, amount });
    setShowSuccessModal(true);
  };

  const handleSubscribe = (planId: string, billingCycle: string) => {
    // In production, this would call an API
    console.log(`Subscribing to ${planId} - ${billingCycle}`);
    if (planId === 'pro') {
      setUserTier('pro');
      setUserCredits(prev => prev + 500);
    } else if (planId === 'business') {
      setUserTier('business');
      setUserCredits(prev => prev + 2000);
    }
    setSuccessData({ type: 'subscription', plan: planId, billingCycle });
    setShowSuccessModal(true);
  };

  const handleNavigateBack = () => {
    // Navigate back to landing page
    router.push('/');
  };

  return (
    <ClientDashboardView
      userName={userName}
      userEmail={userEmail}
      userTier={userTier}
      userCredits={userCredits}
      onNavigateBack={handleNavigateBack}
      onCreditPurchase={handleCreditPurchase}
      onSubscribe={handleSubscribe}
      successData={successData}
      showSuccessModal={showSuccessModal}
      setShowSuccessModal={setShowSuccessModal}
    />
  );
}
