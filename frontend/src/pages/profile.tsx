// frontend/src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import { auth } from '../api/firebaseConfig';
import { getUserProfile, updateUserProfile, uploadProfileImage } from '../api/profile';
import { signOutUser } from '../api/authService';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log("File selected:", file.name, file.type, file.size);
    
    // 이미지 파일인지 확인
    if (!file.type.startsWith('image/')) {
      console.error("Not an image file");
      return;
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("File too large");
      return;
    }
    
    setSelectedImage(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
  };
  

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // 이미지 업로드 처리
      if (selectedImage) {
        try {
          setUploadingImage(true);
          console.log("Starting image upload process...");
          await uploadProfileImage(selectedImage);
          console.log("Image upload successful");
        } catch (imgError) {
          console.error("Image upload failed:", imgError);
          // 이미지 업로드 실패 시에도 프로필 정보는 업데이트
        } finally {
          setUploadingImage(false);
        }
      }
      
      // 프로필 정보 업데이트
      await updateUserProfile(user.uid, editData);
      
      // 프로필 데이터 다시 로드
      const userData = await getUserProfile(user.uid);
      setProfileData(userData);
      
      const freshData = await getUserProfile(user.uid);
      setProfileData(freshData);
      
      // 편집 모드 종료
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Profile save error:", error);
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
                      {/* Profile Picture Upload Section */}
                      <div className="md:col-span-2 mb-6">
                        <h3 className="text-md font-medium text-gray-700 mb-4">Profile Picture</h3>
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="h-24 w-24 rounded-full object-cover border-2 border-emerald-500"
                              />
                            ) : user?.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt="Current profile" 
                                className="h-24 w-24 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-24 w-24 rounded-full bg-emerald-100 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <label htmlFor="profile-image" className="block text-sm font-medium text-gray-700 mb-2">
                              Change profile picture
                            </label>
                            <div className="flex items-center">
                              <label className="block">
                                <span className="sr-only">Choose profile photo</span>
                                <input 
                                  type="file" 
                                  id="profile-image"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="block w-full text-sm text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-md file:border-0
                                    file:text-sm file:font-medium
                                    file:bg-emerald-50 file:text-emerald-700
                                    hover:file:bg-emerald-100"
                                />
                              </label>
                              {selectedImage && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    setSelectedImage(null);
                                    setImagePreview(null);
                                  }}
                                  className="ml-2 text-sm text-red-500 hover:text-red-700"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                              JPG, PNG or GIF up to 5MB
                            </p>
                          </div>
                        </div>
                        
                        {uploadingImage && (
                          <div className="mt-2 flex items-center text-sm text-emerald-600">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Uploading image...
                          </div>
                        )}
                      </div>

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