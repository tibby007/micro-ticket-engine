import { useState, useEffect } from 'react';
import { Plus, Settings, LogOut, Shield, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AuthPage } from './AuthPage';
import { SearchWizard } from '../components/SearchWizard';
import { LeadsPipeline } from '../components/LeadsPipeline';
import { PricingTable } from '../components/PricingTable';
import { TrialBanner } from '../components/TrialBanner';
import { api } from '../services/api';
  
export function DashboardPage() {
  const { user, subscription, loading, logout, refreshSubscription } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [activeJobs, setActiveJobs] = useState<string[]>([]);
  const [checkoutMessage, setCheckoutMessage] = useState('');

  // Handle checkout success/cancel messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkout = urlParams.get('checkout');
    
    if (checkout === 'success') {
      setCheckoutMessage('Payment successful! Your subscription has been activated.');
      refreshSubscription();
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (checkout === 'cancel') {
      setCheckoutMessage('Payment was cancelled. You can try again anytime.');
      // Clear URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshSubscription]);

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
    refreshSubscription(); // Refresh to update usage stats
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Error</h2>
          <p className="text-gray-600 mb-4">Failed to load subscription information.</p>
          <button
            onClick={refreshSubscription}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const canStartNewSearch = (subscription?.usage?.activeJobs ?? 0) < (subscription?.limits?.activeJobs ?? 0) && subscription?.active;
  const isTrialExpired = subscription?.trialEndsAt && new Date(subscription.trialEndsAt) <= new Date();
  
  // Admin users bypass subscription restrictions. Prefer backend flag, fallback to email allowlist.
  const adminEmails = ['support@emergestack.dev', 'cltibbs2@gmail.com'];
  const isAdmin = Boolean(subscription?.isAdmin) || (user?.email ? adminEmails.includes(user.email) : false);
  const canStartNewSearchWithAdmin = isAdmin || canStartNewSearch;
  const showInactiveWarning = !isAdmin && (isTrialExpired || !subscription?.active);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trial Banner */}
      {subscription?.trialEndsAt && subscription?.status === 'trialing' && (
        <TrialBanner subscription={subscription} />
      )}

      {/* Checkout Message */}
      {checkoutMessage && (
        <div className={`px-4 py-3 text-center ${
          checkoutMessage.includes('successful') 
            ? 'bg-green-600 text-white' 
            : 'bg-yellow-600 text-white'
        }`}>
          {checkoutMessage}
          <button
            onClick={() => setCheckoutMessage('')}
            className="ml-4 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">MicroTix</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                subscription?.tier === 'starter' ? 'bg-blue-100 text-blue-800' :
                subscription?.tier === 'pro' ? 'bg-purple-100 text-purple-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {subscription?.tier ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1) : 'Loading...'}
              </span>
              {subscription?.status === 'trialing' && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Free Trial
                </span>
              )}
              {subscription && !subscription.active && !isAdmin && (
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Inactive
                </span>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{subscription?.usage?.activeJobs ?? 0}</span> / {isAdmin ? '∞' : (subscription?.limits?.activeJobs ?? 0)} active jobs
                <br />
                <span className="font-medium">{subscription?.usage?.leadsThisMonth ?? 0}</span> leads this month
              </div>
              
              {isAdmin && (
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
        {/* Trial Expired or Inactive Subscription */}
        {subscription && showInactiveWarning && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  {isTrialExpired ? 'Trial Expired' : 'Subscription Inactive'}
                </h3>
                <p className="text-red-700">
                  {isTrialExpired 
                    ? 'Your free trial has ended. Upgrade to continue generating leads.'
                    : 'Your subscription is inactive. Please update your billing information.'
                  }
                </p>
              </div>
              <button
                onClick={() => setShowPricing(true)}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

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
            disabled={!canStartNewSearchWithAdmin}
            className={`px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 shadow-lg ${
              isAdmin 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            <Plus className="w-5 h-5" />
            <span>{isAdmin ? 'New Lead Search (Admin)' : 'New Lead Search'}</span>
          </button>
        </div>

        {!canStartNewSearchWithAdmin && !isAdmin && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
            <p className="text-yellow-800">
              {subscription && !subscription.active 
                ? 'Your subscription is inactive. Please upgrade to start new searches.'
                : `You've reached your limit of ${subscription?.limits?.activeJobs ?? 0} active jobs.`
              }
              {subscription?.active && (
                <>
                  <button 
                    onClick={refreshSubscription}
                    className="ml-2 text-yellow-900 underline hover:no-underline"
                  >
                    Refresh status
                  </button> or upgrade your plan to run more searches simultaneously.
                </>
              )}
            </p>
          </div>
        )}

        {/* Pricing Modal */}
        {showPricing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="relative max-w-7xl w-full bg-white rounded-2xl p-8">
              <button
                onClick={() => setShowPricing(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
              <PricingTable />
            </div>
          </div>
        )}

        {/* Search Wizard Modal */}
        {showWizard && subscription && canStartNewSearchWithAdmin && (
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
