// frontend/src/pages/adminUI/index.tsx
import React, { useEffect, useState } from 'react';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { getDashboardStats } from '../../api/adminAPI/adminDashboard';
import AdminDashboardCharts from './components/AdminDashboardCharts';

const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const stats = await getDashboardStats();
        setDashboardStats(stats);
        setError('');
        console.log("📊 [Admin Dashboard] Loaded dashboard statistics", stats);
      } catch (err) {
        console.error("❌ [Admin Dashboard] Error fetching dashboard statistics:", err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <AdminRoute>
      <AdminLayout title="Admin Dashboard">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">System Overview</h2>
          </header>

          {/* Thẻ thống kê chính */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm font-medium text-gray-500 uppercase">Total Users</p>
              <p className="mt-2 text-4xl font-semibold text-gray-900">
                {dashboardStats?.totalUsers ?? 0}
              </p>
            </div>
            {/* Bạn có thể bổ sung thêm các card khác nếu có */}
          </section>

          {/* Phần biểu đồ */}
          <section>
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
              <AdminDashboardCharts 
                genderRatio={dashboardStats.genderRatio}
                healthGoals={dashboardStats.healthGoals}
                activityLevels={dashboardStats.activityLevels}
                topDietaryRestrictions={dashboardStats.topDietaryRestrictions}
                topAllergies={dashboardStats.topAllergies}
              />
            )}
          </section>
        </main>
      </AdminLayout>
    </AdminRoute>
  );
};

export default AdminDashboard;
