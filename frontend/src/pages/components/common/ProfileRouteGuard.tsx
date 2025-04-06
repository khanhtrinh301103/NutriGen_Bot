// frontend/src/pages/components/common/ProfileRouteGuard.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { validateHealthProfile } from '../../../api/profileValidation';
import { useAuth } from '../../../api/useAuth';

interface ProfileGuardProps {
  children: React.ReactNode;
}

const ProfileRouteGuard: React.FC<ProfileGuardProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user || loading) return;
      
      try {
        console.log("🔒 [Guard] Checking if health profile is complete");
        const validation = await validateHealthProfile();
        
        if (!validation.isComplete) {
          console.log("⚠️ [Guard] Profile incomplete, showing message");
          setValidationMessage(validation.message || "Please complete your health profile before accessing recipes.");
          
          // Add a small delay before redirecting to allow message to be seen
          setTimeout(() => {
            console.log("🔄 [Guard] Redirecting to profile page");
            router.push('/profile');
          }, 3000);
        } else {
          console.log("✅ [Guard] Profile complete, allowing access");
          setValidationMessage(null);
        }
      } catch (error) {
        console.error("❌ [Guard] Error checking profile:", error);
        setValidationMessage("An error occurred. Please try again later.");
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [user, loading, router]);

  // Show loading state while checking profile
  if (loading || isChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4b7e53]"></div>
        <p className="mt-4 text-gray-600">Checking your profile...</p>
      </div>
    );
  }

  // Show validation message if profile is incomplete
  if (validationMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-lg mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {validationMessage}
              </p>
              <p className="mt-3 text-sm text-yellow-700">
                Redirecting you to your profile page...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If everything is good, render the children
  return <>{children}</>;
};

export default ProfileRouteGuard;