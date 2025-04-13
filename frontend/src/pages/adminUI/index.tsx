// frontend/src/pages/adminUI/index.tsx
import React, { useEffect, useState } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { getAdminStats } from '../../api/adminAPI/adminAPI';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const adminStats = await getAdminStats();
        setStats(adminStats);
        setError('');
        console.log("📊 [Admin] Successfully loaded admin statistics");
      } catch (err) {
        console.error("❌ [Admin] Error fetching admin stats:", err);
        setError('Failed to load admin statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  return (
    <AdminRoute>
      <AdminLayout title="Admin Dashboard">
        {/* Content */}
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-6 text-gray-800">System Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalUsers}</dd>
                    </div>
                  </div>
                  <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeUsers}</dd>
                    </div>
                  </div>
                  <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Recipes</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalRecipes}</dd>
                    </div>
                  </div>
                  <div className="bg-indigo-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">Recipe Searches</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.recipeSearches}</dd>
                    </div>
                  </div>
                  <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <dt className="text-sm font-medium text-gray-500 truncate">New Users Today</dt>
                      <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.newUsersToday}</dd>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h2 className="text-xl font-semibold mb-6 text-gray-800">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                          <p>Manage user accounts, permissions, and activities.</p>
                        </div>
                        <div className="mt-5">
                          <a href="/adminUI/UserManagement" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Manage Users
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">Recipe Management</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                          <p>Manage recipes, categories, and featured content.</p>
                        </div>
                        <div className="mt-5">
                          <a href="/adminUI/RecipeManagement" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Manage Recipes
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900">Nutrition Database</h3>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                          <p>Update and maintain nutrition data and dietary information.</p>
                        </div>
                        <div className="mt-5">
                          <a href="/adminUI/NutritionData" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            Manage Nutrition Data
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminDashboard;