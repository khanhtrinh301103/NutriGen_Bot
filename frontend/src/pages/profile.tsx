// frontend/src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import { auth } from '../api/firebaseConfig';
import { getUserProfile } from '../api/profile';
import { signOutUser } from '../api/authService';
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
              />
              
              {/* Khi user click vào ảnh, sẽ kích hoạt input file */}
              {user?.photoURL ? (
                <label htmlFor="profile-image-input" className="cursor-pointer">
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="h-16 w-16 rounded-full object-cover border-2 border-white cursor-pointer"
                  />
                </label>
              ) : (
                <label htmlFor="profile-image-input" className="cursor-pointer">
                  <div className="bg-white p-2 rounded-full flex items-center justify-center w-16 h-16 border-2 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </label>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-white">{user?.displayName || user?.email}</p>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <button 
            onClick={handleSignOut}
            className="px-4 py-2 bg-white text-red-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            Sign Out
          </button>
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
      </div>
    </Layout>
  );
};

export default ProfilePage;