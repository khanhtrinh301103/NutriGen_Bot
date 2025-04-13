// frontend/src/api/AdminRoute.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../useAuth';
import { isAdminUser } from '../authService';

/**
 * Component to protect admin routes
 * Redirects to login page if user is not authenticated or not an admin
 */
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User not logged in, redirect to login
        console.log("🔒 [AdminRoute] No user logged in, redirecting to login");
        router.push('/auth/login');
      } else {
        // Check if user is admin
        const adminStatus = isAdminUser(user);
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          // User is not an admin, redirect to home
          console.log("🚫 [AdminRoute] User is not an admin, redirecting to home");
          router.push('/');
        }
      }
      setChecking(false);
    }
  }, [user, loading, router]);

  // Show nothing while checking authentication
  if (loading || checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Only render children if user is admin
  return isAdmin ? children : null;
};

export default AdminRoute;