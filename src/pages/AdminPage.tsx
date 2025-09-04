import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { AdminPanel } from '../components/AdminPanel';

export function AdminPage() {
  const user = { email: 'admin@microtix.com' };
  const logout = () => alert('Logout would happen here');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Super Admin</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Logged in as: <strong>{user?.email}</strong>
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <AdminPanel />
      </div>
    </div>
  );
}