import React, { useState, useEffect } from 'react';
import { Plus, Settings, LogOut, Shield, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SearchWizard } from '../components/SearchWizard';
import { LeadsPipeline } from '../components/LeadsPipeline';
import { PricingTable } from '../components/PricingTable';
import { TrialBanner } from '../components/TrialBanner';
import { api } from '../services/api';

export function DashboardPage() {
  const { user, subscription, logout, refreshSubscription } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [activeJobs, setActiveJobs] = useState<string[]>([]);

  useEffect(() => {
    const savedJobs = localStorage.getItem('microtix_active_jobs');
    if (savedJobs) {
      try {
        setActiveJobs(JSON.parse(savedJobs));
      } catch (error) {
        console.error('Failed to parse saved jobs:', error);
        localStorage.removeItem('microtix_active_jobs');
      }
    }
  }, []);

  const handleJobCreated = (jobId: string) => {
    const updatedJobs = [...activeJobs, jobId];
    setActiveJobs(updatedJobs);
    localStorage.setItem('microtix_active_jobs', JSON.stringify(updatedJobs));
  };

  const handleJobUpdate = (jobs: string[]) => {
    setActiveJobs(jobs);
    localStorage.setItem('microtix_active_jobs', JSON.stringify(jobs));
  };

  const handleBillingPortal = async () => {
    try {
      const { url } = await api.getPortal();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to open billing portal:', error);
      alert('Failed to open billing portal. Please try again.');
    }
  };

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show pricing if no active subscription and no trial
  if (!subscription.active && !subscription.trialEndsAt) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to MicroTix
            </h1>
            <p className="text-xl text-gray-600">
              Choose a plan to start generating qualified leads
            </p>
          </div>
          <PricingTable />
        </div>
      </div>
    );
  }

  const canStartNewSearch = subscription.usage.activeJobs < subscription.limits.activeJobs;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trial Banner */}
      {subscription.trialEndsAt && subscription.status === 'trialing' && (
        <TrialBanner subscription={subscription} />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">MicroTix</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription.tier === 'starter' ? 'bg-blue-100 text-blue-800' :
                subscription.tier === 'pro' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}
              </span>
              {subscription.status === 'trialing' && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Free Trial
                </span>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{subscription.usage.activeJobs}</span> / {subscription.limits.activeJobs} active jobs
              </div>
              
              {subscription.isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-800 transition-colors"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </Link>
              )}
              
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
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Lead Pipeline</h2>
            <p className="text-gray-600 mt-1">
              Discover and manage qualified prospects for your funding offers
            </p>
          </div>
          
          <button
            onClick={() => setShowWizard(true)}
            disabled={!canStartNewSearch}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>New Lead Search</span>
          </button>
        </div>

        {!canStartNewSearch && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-yellow-800">
              You've reached your limit of {subscription.limits.activeJobs} active jobs. 
              <button 
                onClick={refreshSubscription}
                className="ml-2 text-yellow-900 underline hover:no-underline"
              >
                Refresh status
              </button> or upgrade your plan to run more searches simultaneously.
            </p>
          </div>
        )}

        {/* Search Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="relative max-w-5xl w-full">
              <SearchWizard
                subscription={subscription}
                onJobCreated={handleJobCreated}
                onClose={() => setShowWizard(false)}
              />
            </div>
          </div>
        )}

        {/* Pipeline */}
        <LeadsPipeline 
          activeJobs={activeJobs} 
          onJobUpdate={handleJobUpdate}
        />
      </div>
    </div>
  );
}