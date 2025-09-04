import React from 'react';
import { Zap } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-6 animate-pulse-slow">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">MicroTix</h2>
        <p className="text-blue-200">Loading your dashboard...</p>
      </div>
    </div>
  );
}