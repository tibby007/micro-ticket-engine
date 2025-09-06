import { useState, useEffect } from 'react';
import { Users, Activity, DollarSign, RefreshCw, AlertTriangle, Server, CreditCard, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import { api } from '../services/api';
import type { AdminStats } from '../types';

export function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryingJob, setRetryingJob] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const adminStats = await api.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      // Mock data for development
      setStats({
        totalUsers: 247,
        activeSubscriptions: 189,
        totalRevenue: 18750,
        searchesThisMonth: 1456,
        leadsGenerated: 12450,
        recentActivity: [
          {
            id: '1',
            type: 'signup',
            user: 'john@broker.com',
            timestamp: new Date().toISOString(),
            details: 'Started Pro trial'
          },
          {
            id: '2',
            type: 'lead_generated',
            user: 'sarah@lending.com',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            details: 'Restaurants in Miami, FL - 45 leads found'
          },
          {
            id: '3',
            type: 'upgrade',
            user: 'mike@capital.com',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            details: 'Upgraded from Starter to Premium'
          },
          {
            id: '4',
            type: 'trial_started',
            user: 'lisa@finance.com',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            details: 'Started 2-day free trial'
          }
        ],
        systemHealth: {
          n8nStatus: 'healthy',
          stripeStatus: 'healthy',
          lastHealthCheck: new Date().toISOString()
        },
        tierDistribution: {
          starter: 89,
          pro: 78,
          premium: 22
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetryJob = async (jobId: string) => {
    setRetryingJob(jobId);
    try {
      await api.retryJob(jobId);
      alert('Job retry initiated successfully');
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Failed to retry job:', error);
      alert('Failed to retry job. Please try again.');
    } finally {
      setRetryingJob(null);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup': return <Users className="w-5 h-5" />;
      case 'search': return <Activity className="w-5 h-5" />;
      case 'upgrade': return <TrendingUp className="w-5 h-5" />;
      case 'trial_started': return <Clock className="w-5 h-5" />;
      case 'trial_ended': return <CreditCard className="w-5 h-5" />;
      case 'lead_generated': return <Users className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'signup': return 'bg-blue-100 text-blue-600';
      case 'search': return 'bg-green-100 text-green-600';
      case 'upgrade': return 'bg-purple-100 text-purple-600';
      case 'trial_started': return 'bg-yellow-100 text-yellow-600';
      case 'trial_ended': return 'bg-red-100 text-red-600';
      case 'lead_generated': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Failed to Load Admin Stats
        </h3>
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">System overview and management</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Server className="w-6 h-6 text-gray-600" />
              <span className="font-medium">n8n Workflows</span>
            </div>
            <span className={`font-semibold ${getHealthStatusColor(stats.systemHealth.n8nStatus)}`}>
              {stats.systemHealth.n8nStatus}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-gray-600" />
              <span className="font-medium">Stripe Billing</span>
            </div>
            <span className={`font-semibold ${getHealthStatusColor(stats.systemHealth.stripeStatus)}`}>
              {stats.systemHealth.stripeStatus}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-gray-600" />
              <span className="font-medium">Last Check</span>
            </div>
            <span className="text-sm text-gray-600">
              {new Date(stats.systemHealth.lastHealthCheck).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              <p className="text-xs text-gray-500 mt-1">Paying customers</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Recurring revenue</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads Generated</p>
              <p className="text-3xl font-bold text-gray-900">{stats.leadsGenerated}</p>
              <p className="text-xs text-gray-500 mt-1">Total leads this month</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Subscription Tiers</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.tierDistribution.starter}</div>
              <div className="text-sm text-gray-600">Starter Plans</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.tierDistribution.pro}</div>
              <div className="text-sm text-gray-600">Pro Plans</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.tierDistribution.premium}</div>
              <div className="text-sm text-gray-600">Premium Plans</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Distribution */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Subscription Tiers</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.tierDistribution.starter}</div>
              <div className="text-sm text-gray-600">Starter Plans</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.tierDistribution.pro}</div>
              <div className="text-sm text-gray-600">Pro Plans</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.tierDistribution.premium}</div>
              <div className="text-sm text-gray-600">Premium Plans</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                  {activity.type === 'lead_generated' && (
                    <button
                      onClick={() => handleRetryJob(activity.id)}
                      disabled={retryingJob === activity.id}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 disabled:opacity-50"
                    >
                      {retryingJob === activity.id ? 'Retrying...' : 'Retry'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}