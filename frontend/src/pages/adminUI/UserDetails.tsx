// frontend/src/pages/adminUI/UserDetails.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminRoute from '../../api/adminAPI/AdminRoute';
import AdminLayout from './components/AdminLayout';
import { getUserDetails } from '../../api/adminAPI/UserDetailsService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserDetailsHeader from './components/UserDetailsHeader';
import UserDetailsTabs from './components/UserDetailsTabs';

const UserDetails = () => {
  const router = useRouter();
  const { userId } = router.query;
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId as string);
    }
  }, [userId]);
  
  const fetchUserDetails = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 [Admin] Fetching details for user ID: ${id}`);
      
      const userDetails = await getUserDetails(id);
      console.log('✅ [Admin] User details fetched:', userDetails);
      setUser(userDetails);
    } catch (error) {
      console.error("❌ [Admin] Error fetching user details:", error);
      setError("Failed to load user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (loading) {
    return (
      <AdminRoute>
        <AdminLayout title="User Details">
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }
  
  if (error) {
    return (
      <AdminRoute>
        <AdminLayout title="User Details">
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Link href="/adminUI/UserManagement">
              <Button variant="outline" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to User Management
              </Button>
            </Link>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }
  
  if (!user) {
    return (
      <AdminRoute>
        <AdminLayout title="User Details">
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>User Not Found</AlertTitle>
              <AlertDescription>User not found or data could not be loaded</AlertDescription>
            </Alert>
            <Link href="/adminUI/UserManagement">
              <Button variant="outline" className="flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />
                Back to User Management
              </Button>
            </Link>
          </div>
        </AdminLayout>
      </AdminRoute>
    );
  }
  
  return (
    <AdminRoute>
      <AdminLayout title={`Profile: ${user?.fullName || 'User'}`}>
        <div className="space-y-6">
          <UserDetailsHeader user={user} />
          <UserDetailsTabs user={user} formatDate={formatDate} />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
};

export default UserDetails;