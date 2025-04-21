import React, { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Public routes that don't require authentication
const publicRoutes = [
  '/',           // Home page
  '/about',      // About page
  '/auth/login', // Login page
  '/auth/signup', // Signup page
  '/auth/forgotPassword' // Forgot password page
];

/**
 * Component to wrap pages that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  
  useEffect(() => {
    // Skip if still loading auth state
    if (loading) return;
    
    // If user is not authenticated
    if (!user) {
      // Check if current path requires authentication
      const isPublicRoute = publicRoutes.some(route => 
        router.pathname === route || 
        router.pathname.startsWith(`${route}/`)
      );
      
      // If route requires auth, show alert
      if (!isPublicRoute) {
        console.log("🔒 [Auth] Authentication required for:", router.pathname);
        setShowAlert(true);
        
        // Set a timeout to redirect after showing the alert
        const timer = setTimeout(() => {
          console.log("🔄 [Auth] Redirecting to login page");
          router.push({
            pathname: '/auth/login',
            query: { returnUrl: router.asPath },
          });
        }, 5000); // 5 seconds to read the message
        
        return () => clearTimeout(timer);
      }
    }
  }, [loading, user, router]);

  // Show authentication alert
  if (!loading && !user && showAlert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V3m0 18a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            You need to sign in or create an account to access this feature.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/login" className="bg-[#4b7e53] text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Sign In
            </Link>
            <Link href="/auth/signup" className="bg-gray-100 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Create Account
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Redirecting to login page in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-pulse h-[60px] w-[60px] relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-[#4b7e53] border-r-[#4b7e53]/30 border-b-[#4b7e53]/10 border-l-[#4b7e53]/60 animate-spin"></div>
          </div>
          <div className="mt-4 text-gray-600">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the protected content
  if (user) {
    return children;
  }

  // Default fallback - should not reach here
  return null;
};

export default ProtectedRoute;