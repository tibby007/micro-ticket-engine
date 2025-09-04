import React, { useState, useEffect } from 'react';
import { Users, Activity, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  searchesThisMonth: number;
  recentActivity: Array<{
    id: string;
    type: 'search' | 'signup' | 'upgrade';
    user: string;
    timestamp: string;
    details: string;
  }>;
}

export function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // This would be a real API call to n8n admin endpoint
      // For now, using mock data
      const mockStats: AdminStats = {
        totalUsers: 247,
        activeSubscriptions: 189,
        totalRevenue: 18750,
        searchesThisMonth: 1456,
        recentActivity: [
          {
            id: '1',
            type: 'signup',
            user: 'john@example.com',
            timestamp: new Date().toISOString(),
            details: 'Started Pro trial'
          },
          {
            id: '2',
            type: 'search',
            user: 'sarah@broker.com',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            details: 'Restaurants in Miami, FL - 45 leads found'
          },
          {
            id: '3',
            type: 'upgrade',
            user: 'mike@lending.com',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            details: 'Upgraded from Starter to Premium'
          }
        ]
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
    } finally {
      setLoading(false);
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
          Failed to Load Stats
        </h3>
        <button
          onClick={fetchStats}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <button
          onClick={fetchStats}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Searches This Month</p>
              <p className="text-3xl font-bold text-gray-900">{stats.searchesThisMonth}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'signup' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'search' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.type === 'signup' ? <Users className="w-5 h-5" /> :
                     activity.type === 'search' ? <Activity className="w-5 h-5" /> :
                     <DollarSign className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{activity.user}</p>
                    <p className="text-sm text-gray-600">{activity.details}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}