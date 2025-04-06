// frontend/src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import { auth } from '../api/firebaseConfig';
import { getUserProfile, updateUserProfile } from '../api/profile';
import { signOutUser } from '../api/authService';
import { updateProfile } from "firebase/auth";

// Định nghĩa các thông báo tương ứng với các mục tiêu
const goalMessages = {
  'Weight Loss': 'For weight loss',
  'Weight Gain': 'For weight gain',
  'Weight Maintenance': 'For maintenance',
  'Muscle Gain': 'For muscle gain',
  'Improve Health': 'For health improvement'
};

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'Male',
    activityLevel: 'Sedentary',
    goal: 'Weight Maintenance',
    allergies: [],
    dietaryRestrictions: []
  });
  
  // New state variables for nutrition settings
  const [isEditingNutrition, setIsEditingNutrition] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [nutritionEditData, setNutritionEditData] = useState({
    mealsPerDay: 3,
    macroDistribution: 'Balanced'
  });
  
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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userData = await getUserProfile(currentUser.uid);
          setProfileData(userData);
        } catch (error) {
          console.error("Error loading profile:", error);
        }
        setLoading(false);
      } else {
        router.push('/auth/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Initialize nutrition edit data when profile data changes
  useEffect(() => {
    if (profileData && profileData.healthProfile) {
      setNutritionEditData({
        mealsPerDay: profileData.healthProfile.mealsPerDay || 3,
        macroDistribution: profileData.healthProfile.macroDistribution || 'Balanced'
      });
    }
  }, [profileData]);

  // Xử lý Upload Ảnh
  const handleUploadPhoto = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("uid", user.uid); // Gửi UID lên backend

    try {
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

  // Initialize edit data when profile data is loaded
  useEffect(() => {
    if (profileData && profileData.healthProfile) {
      setEditData({
        height: profileData.healthProfile.height || '',
        weight: profileData.healthProfile.weight || '',
        age: profileData.healthProfile.age || '',
        gender: profileData.healthProfile.gender || 'Male',
        activityLevel: profileData.healthProfile.activityLevel || 'Sedentary',
        goal: profileData.healthProfile.goal || 'Weight Maintenance',
        allergies: profileData.healthProfile.allergies || [],
        dietaryRestrictions: profileData.healthProfile.dietaryRestrictions || []
      });
    }
  }, [profileData]);

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

  const handleEditDataChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleAllergiesChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setEditData({
        ...editData,
        allergies: [...editData.allergies, value]
      });
    } else {
      setEditData({
        ...editData,
        allergies: editData.allergies.filter(item => item !== value)
      });
    }
  };

  const handleDietaryRestrictionsChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setEditData({
        ...editData,
        dietaryRestrictions: [...editData.dietaryRestrictions, value]
      });
    } else {
      setEditData({
        ...editData,
        dietaryRestrictions: editData.dietaryRestrictions.filter(item => item !== value)
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await updateUserProfile(user.uid, editData);
      
      // Reload profile data
      const userData = await getUserProfile(user.uid);
      setProfileData(userData);
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing nutrition settings
  const handleEditNutrition = (field) => {
    setIsEditingNutrition(true);
    setEditingField(field);
    if (profileData && profileData.healthProfile) {
      setNutritionEditData({
        ...nutritionEditData,
        [field]: profileData.healthProfile[field] || (field === 'mealsPerDay' ? 3 : 'Balanced')
      });
    }
  };

  // Handle nutrition edit data changes
  const handleNutritionEditChange = (e) => {
    const { name, value } = e.target;
    setNutritionEditData({
      ...nutritionEditData,
      [name]: value
    });
  };

  // Handle saving nutrition settings
  const handleSaveNutritionSetting = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Create update object with only the field being edited
      const updateData = {
        [editingField]: nutritionEditData[editingField]
      };
      
      await updateUserProfile(user.uid, updateData);
      
      // Reload profile data
      const userData = await getUserProfile(user.uid);
      setProfileData(userData);
      
      setIsEditingNutrition(false);
      setEditingField(null);
    } catch (error) {
      console.error("Error saving nutrition setting:", error);
    } finally {
      setLoading(false);
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
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">{isEditing ? 'Edit Profile' : 'Your Health Profile'}</h2>
                    {!isEditing && (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information Section */}
                        <div>
                          <h3 className="text-md font-medium text-gray-700 mb-4">Basic Information</h3>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                              <input
                                type="number"
                                id="height"
                                name="height"
                                value={editData.height}
                                onChange={handleEditDataChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                              <input
                                type="number"
                                id="weight"
                                name="weight"
                                value={editData.weight}
                                onChange={handleEditDataChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                              <input
                                type="number"
                                id="age"
                                name="age"
                                value={editData.age}
                                onChange={handleEditDataChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                              <select
                                id="gender"
                                name="gender"
                                value={editData.gender}
                                onChange={handleEditDataChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Activity & Goals Section */}
                        <div>
                          <h3 className="text-md font-medium text-gray-700 mb-4">Activity & Goals</h3>
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
                              <select
                                id="activityLevel"
                                name="activityLevel"
                                value={editData.activityLevel}
                                onChange={handleEditDataChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="Sedentary">Sedentary (little or no exercise)</option>
                                <option value="Lightly Active">Lightly active (light exercise 1-3 days/week)</option>
                                <option value="Moderately Active">Moderately active (moderate exercise 3-5 days/week)</option>
                                <option value="Very Active">Very active (hard exercise 6-7 days/week)</option>
                                <option value="Extremely Active">Extremely active (very hard exercise & physical job)</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                              <select
                                id="goal"
                                name="goal"
                                value={editData.goal}
                                onChange={handleEditDataChange}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-emerald-500 focus:border-emerald-500"
                              >
                                <option value="Weight Loss">Weight Loss</option>
                                <option value="Weight Maintenance">Weight Maintenance</option>
                                <option value="Weight Gain">Weight Gain</option>
                                <option value="Muscle Gain">Muscle Gain</option>
                                <option value="Improve Health">Improve Health</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        
                        {/* Allergies Section */}
                        <div className="md:col-span-2">
                          <h3 className="text-md font-medium text-gray-700 mb-4">Allergies</h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'].map((allergy) => (
                              <div key={allergy} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`allergy-${allergy}`}
                                  name="allergies"
                                  value={allergy}
                                  checked={editData.allergies.includes(allergy)}
                                  onChange={handleAllergiesChange}
                                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`allergy-${allergy}`} className="ml-2 text-sm text-gray-700">
                                  {allergy}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dietary Restrictions Section */}
                        <div className="md:col-span-2">
                          <h3 className="text-md font-medium text-gray-700 mb-4">Dietary Restrictions</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo', 'Pescatarian', 'Mediterranean'].map((diet) => (
                              <div key={diet} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`diet-${diet}`}
                                  name="dietaryRestrictions"
                                  value={diet}
                                  checked={editData.dietaryRestrictions.includes(diet)}
                                  onChange={handleDietaryRestrictionsChange}
                                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`diet-${diet}`} className="ml-2 text-sm text-gray-700">
                                  {diet}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-end space-x-4">
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          disabled={loading}
                          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    profileData && profileData.healthProfile && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Basic Information
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <span className="text-gray-600">Height:</span>
                              <span className="font-medium text-gray-900">{profileData.healthProfile.height || 'Not set'} cm</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <span className="text-gray-600">Weight:</span>
                              <span className="font-medium text-gray-900">{profileData.healthProfile.weight || 'Not set'} kg</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <span className="text-gray-600">Age:</span>
                              <span className="font-medium text-gray-900">{profileData.healthProfile.age || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <span className="text-gray-600">Gender:</span>
                              <span className="font-medium text-gray-900">{profileData.healthProfile.gender || 'Not set'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Activity & Goals
                          </h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <span className="text-gray-600">Activity Level:</span>
                              <span className="font-medium text-gray-900">{profileData.healthProfile.activityLevel || 'Not set'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <span className="text-gray-600">Goal:</span>
                              <span className="font-medium text-gray-900">{profileData.healthProfile.goal || 'Not set'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Allergies
                          </h3>
                          {profileData.healthProfile.allergies && profileData.healthProfile.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profileData.healthProfile.allergies.map((allergy, index) => (
                                <span key={index} className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full border border-red-100">
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No allergies specified</p>
                          )}
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                          <h3 className="text-lg font-semibold text-emerald-700 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Dietary Restrictions
                          </h3>
                          {profileData.healthProfile.dietaryRestrictions && profileData.healthProfile.dietaryRestrictions.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {profileData.healthProfile.dietaryRestrictions.map((diet, index) => (
                                <span key={index} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full border border-emerald-100">
                                  {diet}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">No dietary restrictions specified</p>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="max-w-5xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:px-6 bg-emerald-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Your Nutrition Summary
                    </h3>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    {profileData && profileData.healthProfile && profileData.healthProfile.weight && profileData.healthProfile.height && profileData.healthProfile.age ? (
                      <>
                        <h4 className="text-md font-medium text-gray-700 mb-4">Daily Caloric Needs</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="bg-emerald-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Basal Metabolic Rate</h4>
                            <div className="text-2xl font-bold text-emerald-600 mt-2">
                              {calculateBMR(profileData.healthProfile)} calories
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Calories you burn at rest</p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Total Daily Energy Expenditure</h4>
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
                              {goalMessages[profileData.healthProfile.goal] || 'For maintenance'}
                            </p>
                          </div>
                        </div>
                        
                        <h4 className="text-md font-medium text-gray-700 mb-4">Per Meal Breakdown</h4>
                        <div className="bg-gray-50 p-5 rounded-lg mb-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                              <h4 className="text-sm font-medium text-gray-500">Calories Per Meal</h4>
                              <div className="text-xl font-bold text-purple-600 mt-2">
                                {calculateCaloriesPerMeal(profileData.healthProfile)} calories
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Based on {profileData.healthProfile.mealsPerDay || 3} meals per day
                              </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                              <h4 className="text-sm font-medium text-gray-500">Protein Per Meal</h4>
                              <div className="text-xl font-bold text-green-600 mt-2">
                                {calculateProteinPerMeal(profileData.healthProfile)}g
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Builds and repairs muscle tissue
                              </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                              <h4 className="text-sm font-medium text-gray-500">Carbs Per Meal</h4>
                              <div className="text-xl font-bold text-amber-600 mt-2">
                                {calculateCarbsPerMeal(profileData.healthProfile)}g
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Primary energy source
                              </p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg text-center shadow-sm">
                              <h4 className="text-sm font-medium text-gray-500">Fat Per Meal</h4>
                              <div className="text-xl font-bold text-blue-600 mt-2">
                                {calculateFatPerMeal(profileData.healthProfile)}g
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Hormone production and nutrient absorption
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <h4 className="text-md font-medium text-gray-700 mb-4">Daily Macronutrient Distribution</h4>
                        <div className="bg-gray-50 p-5 rounded-lg">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium text-gray-700">Daily Protein</h4>
                                <span className="text-xs text-gray-500">{calculateMacroPercentage(profileData.healthProfile, 'protein')}%</span>
                              </div>
                              <div className="mt-2 h-3 relative max-w-xl rounded-full overflow-hidden">
                                <div className="w-full h-full bg-gray-200 absolute"></div>
                                <div className="h-full bg-green-500 absolute" style={{width: `${calculateMacroPercentage(profileData.healthProfile, 'protein')}%`}}></div>
                              </div>
                              <p className="mt-2 text-sm font-medium text-gray-900">{calculateDailyProtein(profileData.healthProfile)}g</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium text-gray-700">Daily Carbs</h4>
                                <span className="text-xs text-gray-500">{calculateMacroPercentage(profileData.healthProfile, 'carbs')}%</span>
                              </div>
                              <div className="mt-2 h-3 relative max-w-xl rounded-full overflow-hidden">
                                <div className="w-full h-full bg-gray-200 absolute"></div>
                                <div className="h-full bg-amber-500 absolute" style={{width: `${calculateMacroPercentage(profileData.healthProfile, 'carbs')}%`}}></div>
                              </div>
                              <p className="mt-2 text-sm font-medium text-gray-900">{calculateDailyCarbs(profileData.healthProfile)}g</p>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                              <div className="flex justify-between items-center">
                                <h4 className="text-sm font-medium text-gray-700">Daily Fat</h4>
                                <span className="text-xs text-gray-500">{calculateMacroPercentage(profileData.healthProfile, 'fat')}%</span>
                              </div>
                              <div className="mt-2 h-3 relative max-w-xl rounded-full overflow-hidden">
                                <div className="w-full h-full bg-gray-200 absolute"></div>
                                <div className="h-full bg-blue-500 absolute" style={{width: `${calculateMacroPercentage(profileData.healthProfile, 'fat')}%`}}></div>
                              </div>
                              <p className="mt-2 text-sm font-medium text-gray-900">{calculateDailyFat(profileData.healthProfile)}g</p>
                            </div>
                          </div>
                        </div>

                          {/* New Nutrition Settings Section */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                          <h4 className="text-md font-medium text-gray-700 mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Number of meals per day
                          </h4>
                          
                          <div className="bg-gray-50 p-5 rounded-lg">
                            {/* Meals Per Day Setting */}
                            <div className="bg-white p-5 rounded-lg shadow-sm max-w-md mx-auto">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-md font-medium text-gray-700">Meals Per Day</h4>
                                {!isEditingNutrition ? (
                                  <button 
                                    onClick={() => handleEditNutrition('mealsPerDay')}
                                    className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                                  >
                                    Edit
                                  </button>
                                ) : editingField === 'mealsPerDay' && (
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={handleSaveNutritionSetting}
                                      className="px-3 py-1 text-sm text-emerald-600 hover:text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-50 transition-colors"
                                    >
                                      Save
                                    </button>
                                    <button 
                                      onClick={() => setIsEditingNutrition(false)}
                                      className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {!isEditingNutrition || editingField !== 'mealsPerDay' ? (
                                <div className="flex items-center justify-between py-3 px-5 bg-emerald-50 rounded-lg">
                                  <div>
                                    <span className="text-4xl font-bold text-emerald-600">{profileData.healthProfile.mealsPerDay || 3}</span>
                                    <span className="ml-2 text-sm text-gray-500">meals per day</span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    <span className="block text-center">Affects calories &</span>
                                    <span className="block text-center">nutrient distribution</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2 bg-gray-50 rounded-lg">
                                  <select
                                    id="mealsPerDay"
                                    name="mealsPerDay"
                                    value={nutritionEditData.mealsPerDay}
                                    onChange={handleNutritionEditChange}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 text-lg"
                                  >
                                    <option value={1}>1 meal per day</option>
                                    <option value={2}>2 meals per day</option>
                                    <option value={3}>3 meals per day</option>
                                    <option value={4}>4 meals per day</option>
                                    <option value={5}>5 meals per day</option>
                                    <option value={6}>6 meals per day</option>
                                  </select>
                                  <p className="mt-2 text-xs text-gray-500 text-center">This will display how your daily calories and nutrients are distributed throughout the day.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          Please complete your health profile to see nutrition insights.
                        </p>
                      </div>
                    )}
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
      return Math.round(tdee * 1.15); // 15% surplus
    case 'Muscle Gain':
      return Math.round(tdee * 1.2); // 20% surplus for muscle building
    case 'Improve Health':
      return Math.round(tdee * 0.95); // 5% deficit for gradual improvement
    case 'Weight Maintenance':
    default:
      return tdee; // Maintenance
  }
}

// Function to calculate calories per meal based on target and meals per day
function calculateCaloriesPerMeal(healthProfile) {
  const dailyCalories = calculateTarget(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  return Math.round(dailyCalories / mealsPerDay);
}

// Function to get macro distribution percentages based on selected plan
function getMacroDistribution(macroDistribution) {
  switch (macroDistribution) {
    case 'HighProtein':
      return { protein: 0.45, carbs: 0.25, fat: 0.3 };
    case 'LowCarb':
      return { protein: 0.4, carbs: 0.2, fat: 0.4 };
    case 'Ketogenic':
      return { protein: 0.35, carbs: 0.05, fat: 0.6 };
    case 'Balanced':
    default:
      return { protein: 0.3, carbs: 0.4, fat: 0.3 };
  }
}

// Function to calculate macro percentage for progress bars
function calculateMacroPercentage(healthProfile, macroType) {
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  return Math.round(macroDistribution[macroType] * 100);
}

// Function to calculate daily protein in grams
function calculateDailyProtein(healthProfile) {
  const dailyCalories = calculateTarget(healthProfile);
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  
  // 1g protein = 4 calories
  return Math.round((dailyCalories * macroDistribution.protein) / 4);
}

// Function to calculate daily carbs in grams
function calculateDailyCarbs(healthProfile) {
  const dailyCalories = calculateTarget(healthProfile);
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  
  // 1g carbs = 4 calories
  return Math.round((dailyCalories * macroDistribution.carbs) / 4);
}

// Function to calculate daily fat in grams
function calculateDailyFat(healthProfile) {
  const dailyCalories = calculateTarget(healthProfile);
  const macroDistribution = getMacroDistribution(healthProfile.macroDistribution || 'Balanced');
  
  // 1g fat = 9 calories
  return Math.round((dailyCalories * macroDistribution.fat) / 9);
}

// Function to calculate protein per meal in grams
function calculateProteinPerMeal(healthProfile) {
  const dailyProtein = calculateDailyProtein(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  return Math.round(dailyProtein / mealsPerDay);
}

// Function to calculate carbs per meal in grams
function calculateCarbsPerMeal(healthProfile) {
  const dailyCarbs = calculateDailyCarbs(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  return Math.round(dailyCarbs / mealsPerDay);
}

// Function to calculate fat per meal in grams
function calculateFatPerMeal(healthProfile) {
  const dailyFat = calculateDailyFat(healthProfile);
  const mealsPerDay = healthProfile.mealsPerDay || 3;
  
  return Math.round(dailyFat / mealsPerDay);
}

export default ProfilePage;