// frontend/src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import { auth } from '../api/firebaseConfig';
import { getUserProfile } from '../api/profile';
import { signOutUser } from '../api/authService';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

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
        <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-6 flex justify-between items-center rounded-xl overflow-hidden">
          <div className="flex items-center">
            <div className="mr-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="bg-white p-2 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-white">
                {user?.displayName || user?.email}
              </p>
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
          <div className="flex border-b">
            <button
              className={`py-3 px-6 font-medium ${
                activeTab === 'profile' 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
              onClick={() => handleTabChange('profile')}
            >
              Health Profile
            </button>
            <button
              className={`py-3 px-6 font-medium ${
                activeTab === 'nutrition' 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
              onClick={() => handleTabChange('nutrition')}
            >
              Nutrition Dashboard
            </button>
            <button
              className={`py-3 px-6 font-medium ${
                activeTab === 'saved' 
                  ? 'text-emerald-600 border-b-2 border-emerald-500' 
                  : 'text-gray-500 hover:text-emerald-600'
              }`}
              onClick={() => handleTabChange('saved')}
            >
              Saved Recipes
            </button>
          </div>

          <div className="mt-6">
            {activeTab === 'profile' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Your Health Profile</h2>
                    <button 
                      onClick={() => router.push('/auth/onboarding')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                  
                  {profileData && profileData.healthProfile && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-2">Basic Information</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="mb-2"><span className="font-medium">Height:</span> {profileData.healthProfile.height} cm</p>
                          <p className="mb-2"><span className="font-medium">Weight:</span> {profileData.healthProfile.weight} kg</p>
                          <p className="mb-2"><span className="font-medium">Age:</span> {profileData.healthProfile.age}</p>
                          <p><span className="font-medium">Gender:</span> {profileData.healthProfile.gender}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-2">Activity & Goals</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="mb-2"><span className="font-medium">Activity Level:</span> {profileData.healthProfile.activityLevel}</p>
                          <p><span className="font-medium">Goal:</span> {profileData.healthProfile.goal}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-2">Allergies</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          {profileData.healthProfile.allergies && profileData.healthProfile.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profileData.healthProfile.allergies.map((allergy, index) => (
                                <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No allergies specified</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-md font-medium text-gray-700 mb-2">Dietary Restrictions</h3>
                        <div className="bg-gray-50 p-4 rounded-md">
                          {profileData.healthProfile.dietaryRestrictions && profileData.healthProfile.dietaryRestrictions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profileData.healthProfile.dietaryRestrictions.map((diet, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {diet}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No dietary restrictions specified</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 bg-emerald-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Your Nutrition Summary
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {profileData && profileData.healthProfile && profileData.healthProfile.weight && profileData.healthProfile.height && profileData.healthProfile.age ? (
                        <>
                          <div className="bg-emerald-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Basal Metabolic Rate</h4>
                            <div className="text-2xl font-bold text-emerald-600 mt-2">
                              {calculateBMR(profileData.healthProfile)} calories
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Calories you burn at rest</p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Total Daily Energy</h4>
                            <div className="text-2xl font-bold text-blue-600 mt-2">
                              {calculateTDEE(profileData.healthProfile)} calories
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Calories you burn daily with activity</p>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Target Daily Calories</h4>
                            <div className="text-2xl font-bold text-purple-600 mt-2">
                              {calculateTarget(profileData.healthProfile)} calories
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {profileData.healthProfile.goal === 'Weight Loss' ? 'For weight loss' : 
                               profileData.healthProfile.goal === 'Weight Gain' ? 'For weight gain' : 
                               'For maintenance'}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="col-span-3 text-center py-8">
                          <p className="text-gray-500">
                            Please complete your health profile to see nutrition insights.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900">No saved recipes</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    You have not saved any recipes yet. Start exploring recipes and save your favorites!
                  </p>
                  <div className="mt-6">
                    <button 
                      onClick={() => router.push('/recipes')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                    >
                      Find Recipes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

// Function to calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
function calculateBMR(healthProfile) {
  const weight = Number(healthProfile.weight);
  const height = Number(healthProfile.height);
  const age = Number(healthProfile.age);
  const gender = healthProfile.gender;
  
  if (!weight || !height || !age) return 0;
  
  if (gender === 'Male') {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
  } else {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }
}

// Function to calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(healthProfile) {
  const bmr = calculateBMR(healthProfile);
  const activityLevel = healthProfile.activityLevel;
  
  let activityMultiplier = 1.2; // Sedentary
  
  switch (activityLevel) {
    case 'Lightly Active':
      activityMultiplier = 1.375;
      break;
    case 'Moderately Active':
      activityMultiplier = 1.55;
      break;
    case 'Very Active':
      activityMultiplier = 1.725;
      break;
    case 'Extremely Active':
      activityMultiplier = 1.9;
      break;
    default:
      activityMultiplier = 1.2;
  }
  
  return Math.round(bmr * activityMultiplier);
}

// Function to calculate target calories based on goal
function calculateTarget(healthProfile) {
  const tdee = calculateTDEE(healthProfile);
  const goal = healthProfile.goal;
  
  switch (goal) {
    case 'Weight Loss':
      return Math.round(tdee * 0.8); // 20% deficit
    case 'Weight Gain':
    case 'Muscle Gain':
      return Math.round(tdee * 1.15); // 15% surplus
    default:
      return tdee; // Maintenance
  }
}

export default ProfilePage;