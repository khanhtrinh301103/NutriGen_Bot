// frontend/src/pages/profile.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from './components/common/layout';
import { auth } from '../api/firebaseConfig';
import { getUserProfile, updateUserProfile } from '../api/profile';
import { signOutUser } from '../api/authService';

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'Male',
    activityLevel: 'Sedentary',
    goal: 'Weight Maintenance',
    allergies: []
  });
  const [profileImage, setProfileImage] = useState(null);
const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setImagePreview(currentUser.photoURL || '');
        try {
          const profileData = await getUserProfile(currentUser.uid);
          if (profileData && profileData.healthProfile) {
            setFormData({
              height: profileData.healthProfile.height || '',
              weight: profileData.healthProfile.weight || '',
              age: profileData.healthProfile.age || '',
              gender: profileData.healthProfile.gender || 'Male',
              activityLevel: profileData.healthProfile.activityLevel || 'Sedentary',
              goal: profileData.healthProfile.goal || 'Weight Maintenance',
              allergies: profileData.healthProfile.allergies || []
            });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUserProfile(user.uid, formData, profileImage);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert('Failed to update profile. Please try again.');
    }
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
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="h-16 w-16 rounded-full object-cover border-2 border-white" />
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
                {user.displayName || user.email}
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
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-emerald-700">
                        Complete your health profile to get personalized recipes and nutrition recommendations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Picture Section */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
                  <div className="flex items-center">
                    <div className="mr-6">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile Preview" className="h-24 w-24 rounded-full object-cover" />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-emerald-50 file:text-emerald-700
                            hover:file:bg-emerald-100
                          "
                        />
                      </label>
                      <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="height" className="block mb-2">Height (cm)</label>
                        <input
                          type="number"
                          id="height"
                          name="height"
                          value={formData.height}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="weight" className="block mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          id="weight"
                          name="weight"
                          value={formData.weight}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="age" className="block mb-2">Age</label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="gender" className="block mb-2">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Activity & Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="activityLevel" className="block mb-2">Activity Level</label>
                        <select
                          id="activityLevel"
                          name="activityLevel"
                          value={formData.activityLevel}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="Sedentary">Sedentary (little or no exercise)</option>
                          <option value="Lightly Active">Lightly active (light exercise 1-3 days/week)</option>
                          <option value="Moderately Active">Moderately active (moderate exercise 3-5 days/week)</option>
                          <option value="Very Active">Very active (hard exercise 6-7 days/week)</option>
                          <option value="Extremely Active">Extremely active (very hard exercise & physical job)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="goal" className="block mb-2">Goal</label>
                        <select
                          id="goal"
                          name="goal"
                          value={formData.goal}
                          onChange={handleChange}
                          className="w-full p-2 border border-gray-300 rounded"
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

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Allergies & Dietary Restrictions</h2>
                    <p className="mb-4">Select any allergies to exclude them from your recipe recommendations.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['Dairy', 'Egg', 'Gluten', 'Grain', 'Peanut', 'Seafood', 'Sesame', 'Shellfish', 'Soy', 'Sulfite', 'Tree Nut', 'Wheat'].map((allergy) => (
                        <div key={allergy} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`allergy-${allergy}`}
                            name="allergies"
                            value={allergy}
                            checked={formData.allergies.includes(allergy)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  allergies: [...formData.allergies, allergy]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  allergies: formData.allergies.filter(a => a !== allergy)
                                });
                              }
                            }}
                            className="mr-2"
                          />
                          <label htmlFor={`allergy-${allergy}`}>{allergy}</label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn-primary hover:bg-emerald-700"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
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
                      {formData.weight && formData.height && formData.age ? (
                        <>
                          <div className="bg-emerald-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Basal Metabolic Rate</h4>
                            <div className="text-2xl font-bold text-emerald-600 mt-2">
                              {calculateBMR(formData)} calories
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Calories you burn at rest</p>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Total Daily Energy</h4>
                            <div className="text-2xl font-bold text-blue-600 mt-2">
                              {calculateTDEE(formData)} calories
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Calories you burn daily with activity</p>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg text-center">
                            <h4 className="text-sm font-medium text-gray-500">Target Daily Calories</h4>
                            <div className="text-2xl font-bold text-purple-600 mt-2">
                              {calculateTarget(formData)} calories
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.goal === 'Weight Loss' ? 'For weight loss' : 
                               formData.goal === 'Weight Gain' ? 'For weight gain' : 
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
                    You havent saved any recipes yet. Start exploring recipes and save your favorites!
                  </p>
                  <div className="mt-6">
                    <button className="btn-primary hover:bg-emerald-700">
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
function calculateBMR(formData) {
  const weight = Number(formData.weight);
  const height = Number(formData.height);
  const age = Number(formData.age);
  const gender = formData.gender;
  
  if (!weight || !height || !age) return 0;
  
  if (gender === 'Male') {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
  } else {
    return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
  }
}

// Function to calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(formData) {
  const bmr = calculateBMR(formData);
  const activityLevel = formData.activityLevel;
  
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
function calculateTarget(formData) {
  const tdee = calculateTDEE(formData);
  const goal = formData.goal;
  
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