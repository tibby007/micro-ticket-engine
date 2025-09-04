import React, { useState, useEffect } from 'react';
import { Plus, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { SearchWizard } from '../components/SearchWizard';
import { LeadsPipeline } from '../components/LeadsPipeline';
import { PricingTable } from '../components/PricingTable';
import { TrialBanner } from '../components/TrialBanner';
import { api } from '../services/api';

export function DashboardPage() {
  const { user, subscription, logout } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [activeJobs, setActiveJobs] = useState<string[]>([]);

  useEffect(() => {
    // Load active jobs from localStorage
    const savedJobs = localStorage.getItem('microtix_active_jobs');
    if (savedJobs) {
      setActiveJobs(JSON.parse(savedJobs));
    }
  }, []);

  const handleJobCreated = (jobId: string) => {
    const updatedJobs = [...activeJobs, jobId];
    setActiveJobs(updatedJobs);
    localStorage.setItem('microtix_active_jobs', JSON.stringify(updatedJobs));
    setShowWizard(false);
  };

  const handleBillingPortal = async () => {
    try {
      const { url } = await api.getPortal();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to open billing portal:', error);
    }
  };

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show pricing if no active subscription
  if (!subscription.active && !subscription.trialEndsAt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to MicroTix
            </h1>
            <p className="text-xl text-gray-600">
              Choose a plan to start generating leads
            </p>
          </div>
          <PricingTable />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trial Banner */}
      {subscription.trialEndsAt && (
        <TrialBanner subscription={subscription} />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">MicroTix</h1>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {subscription.usage.activeJobs} / {subscription.limits.activeJobs} active jobs
              </div>
              
              <button
                onClick={handleBillingPortal}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Billing</span>
              </button>

              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Lead Pipeline</h2>
          <button
            onClick={() => setShowWizard(true)}
            disabled={subscription.usage.activeJobs >= subscription.limits.activeJobs}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Search</span>
          </button>
        </div>

        {/* Search Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setShowWizard(false)}
                className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <SearchWizard
                subscription={subscription}
                onJobCreated={handleJobCreated}
              />
            </div>
          </div>
        )}

        {/* Pipeline */}
        <LeadsPipeline activeJobs={activeJobs} />
      </div>
    </div>
  );
}