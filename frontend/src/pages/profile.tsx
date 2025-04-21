// frontend/src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import { auth } from '../api/firebaseConfig';
import { getUserProfile } from '../api/profile';
import { signOutUser, changePassword } from '../api/authService';
import { updateProfile } from "firebase/auth";

// Import component modules
import ProfileTabs from './components/profile/ProfileTabs';
import HealthProfileSection from './components/profile/HealthProfileSection';
import NutritionDashboard from './components/profile/NutritionDashboard';
import SavedRecipes from './components/profile/SavedRecipes';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  
  // Password change modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Define all handler functions at the beginning of the component
  const handleTabChange = (tab) => {
    console.log(`Changed tab to: ${tab}`);
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    try {
      console.log("Signing out user...");
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Password change handlers
  const handleOpenPasswordModal = () => {
    // Check if user account is from Google
    if (profileData?.provider === "google") {
      setPasswordError("Your account is registered with Google, so you cannot change the password.");
      setShowPasswordModal(true);
      return;
    }
    
    setShowPasswordModal(true);
    // Reset fields when opening modal
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    
    // Reset password visibility
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };
  
  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
  };
  
  // Toggle password visibility handlers
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  
  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // If Google account, don't proceed
    if (profileData?.provider === "google") {
      return;
    }
    
    // Reset messages
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      console.log("Changing password...");
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Password changed successfully');
      
      // Clear fields after successful change
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Close modal after a delay
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      console.error("Error changing password:", error);
      
      // Display friendly error messages
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setPasswordError('Current password is incorrect');
      } else if (error.code === 'auth/requires-recent-login') {
        setPasswordError('Please sign out and sign in again before changing your password');
      } else {
        setPasswordError('An error occurred while changing your password. Please try again.');
      }
    } finally {
      setPasswordLoading(false);
    }
  };
  
  const handleUploadPhoto = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", user.uid); // Gửi UID lên backend

    try {
      console.log("Uploading photo to backend...");
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      console.log("Uploaded photo URL:", data.photoUrl);

      // Cập nhật ảnh lên Firebase Auth
      await updateProfile(auth.currentUser, { photoURL: data.photoUrl });

      // Cập nhật UI
      setUser({ ...user, photoURL: data.photoUrl });
    } catch (error) {
      console.error("Error uploading photo:", error);
    }
  };
  
  // Function to reload profile data
  const handleProfileUpdated = async () => {
    try {
      setLoading(true);
      console.log("Reloading profile data...");
      const userData = await getUserProfile(user.uid);
      setProfileData(userData);
      setLoading(false);
    } catch (error) {
      console.error("Error reloading profile:", error);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        try {
          // Get user profile data
          const userData = await getUserProfile(currentUser.uid);
          setProfileData(userData);
          
          // Check if required health profile fields are empty
          if (!userData || 
              !userData.healthProfile || 
              !userData.healthProfile.height || 
              !userData.healthProfile.weight || 
              !userData.healthProfile.age) {
            
            console.log("Health profile incomplete, redirecting to onboarding...");
            router.push('/auth/onboarding');
            return;
          }
          
        } catch (error) {
          console.error("Error loading profile:", error);
        }
        
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-6 flex justify-between items-center rounded-xl">
          <div className="flex items-center">
            <div className="mr-4 relative">
              {/* Input file ẩn, chỉ mở khi user click vào avatar */}
              <input 
                type="file" 
                onChange={handleUploadPhoto} 
                className="hidden" 
                id="profile-image-input"
                accept="image/*"
              />
              
              {/* Khi user click vào ảnh, sẽ kích hoạt input file */}
              {user?.photoURL ? (
                <label htmlFor="profile-image-input" className="cursor-pointer group relative block h-16 w-16 rounded-full">
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="h-16 w-16 rounded-full object-cover border-2 border-white transition-all duration-300"
                  />
                  {/* Overlay mờ khi hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-300"></div>
                  
                  {/* Hiệu ứng viền sáng khi hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-400/30 transition-all duration-300"></div>
                </label>
              ) : (
                <label htmlFor="profile-image-input" className="cursor-pointer group relative block h-16 w-16">
                  <div className="bg-white p-2 rounded-full flex items-center justify-center w-16 h-16 border-2 border-white transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  {/* Overlay mờ khi hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-300"></div>
                  
                  {/* Hiệu ứng viền sáng khi hover */}
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-emerald-400 group-hover:shadow-lg group-hover:shadow-emerald-400/30 transition-all duration-300"></div>
                </label>
              )}
              
              {/* Tooltip "Edit Photo" khi hover */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-medium rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                Edit Photo
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-white">{user?.displayName || user?.email}</p>
            </div>
          </div>
          
          {/* Account Actions */}
          <div className="flex space-x-2">
            {/* Change Password Button */}
            <button 
              onClick={handleOpenPasswordModal}
              className="px-4 py-2 bg-white text-emerald-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              Change Password
            </button>
            
            {/* Sign Out Button */}
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-8">
          {/* Tab Navigation */}
          <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="mt-6">
            {/* Tab Content */}
            {activeTab === 'profile' && (
              <HealthProfileSection 
                user={user} 
                profileData={profileData} 
                loading={loading}
                onProfileUpdated={handleProfileUpdated}
              />
            )}

            {activeTab === 'nutrition' && (
              <NutritionDashboard 
                user={user} 
                profileData={profileData} 
                loading={loading}
                onProfileUpdated={handleProfileUpdated}
              />
            )}

            {activeTab === 'saved' && (
              <SavedRecipes user={user} />
            )}
          </div>
        </div>
        
        {/* Password Change Modal - Updated to match the design in the image */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-6 text-center">Change Password</h3>
              
              {/* Show warning for Google accounts */}
              {profileData?.provider === "google" ? (
                <div>
                  <div className="bg-amber-100 text-amber-800 p-4 rounded-md mb-4">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="font-medium">Your account is registered with Google, so you cannot change the password here.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleClosePasswordModal}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange}>
                  {/* Current Password */}
                  <div className="mb-4">
                    <label htmlFor="currentPassword" className="block text-gray-700 font-medium mb-2 text-center">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500"
                        onClick={toggleCurrentPasswordVisibility}
                      >
                        {showCurrentPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  
                  {/* New Password */}
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-gray-700 font-medium mb-2 text-center">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                        minLength={6}
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500"
                        onClick={toggleNewPasswordVisibility}
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm New Password */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2 text-center">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        required
                      />
                      <button 
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-500"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {passwordError && (
                    <div className="mb-4 text-red-600 text-center">
                      {passwordError}
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {passwordSuccess && (
                    <div className="mb-4 text-green-600 text-center">
                      {passwordSuccess}
                    </div>
                  )}
                  
                  {/* Buttons */}
                  <div className="flex justify-center space-x-2 mt-6">
                    <button
                      type="button"
                      onClick={handleClosePasswordModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors duration-200"
                      disabled={passwordLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors duration-200"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;