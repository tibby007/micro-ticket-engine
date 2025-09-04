import React, { useState, useEffect } from 'react';
import { Clock, CreditCard, X } from 'lucide-react';
import { api } from '../services/api';
import type { Subscription } from '../types';

interface TrialBannerProps {
  subscription: Subscription;
}

export function TrialBanner({ subscription }: TrialBannerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!subscription.trialEndsAt) return;

    const updateCountdown = () => {
      const now = new Date().getTime();
      const trialEnd = new Date(subscription.trialEndsAt!).getTime();
      const difference = trialEnd - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expired');
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [subscription.trialEndsAt]);

  const handleActivateNow = async () => {
    try {
      const { url } = await api.getPortal();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  if (!subscription.trialEndsAt || new Date(subscription.trialEndsAt) <= new Date() || !isVisible) {
    return null;
  }

  return (
    <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between shadow-lg relative">
      <div className="flex items-center space-x-3">
        <Clock className="w-5 h-5 animate-pulse" />
        <span className="font-semibold">
          ⚡ Trial expires in {timeLeft} - Upgrade now to keep your leads!
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        <button
          onClick={handleActivateNow}
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors flex items-center space-x-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Upgrade Now</span>
        </button>
        
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-200 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}