// frontend/src/pages/auth/onboarding.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/common/layout';
import { auth } from '../../api/firebaseConfig';
import { updateUserProfile } from '../../api/profile';

const OnboardingPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'Male',
    activityLevel: 'Sedentary',
    goal: 'Weight Maintenance',
    allergies: []
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNext = () => {
    // Validate current step
    if (activeStep === 1) {
      if (!formData.height || !formData.weight || !formData.age) {
        setError('Please fill out all fields to continue.');
        return;
      }
    }
    
    setError('');
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      await updateUserProfile(user.uid, formData);
      
      // Redirect to home page or profile page
      router.push('/');
    } catch (err) {
      console.error('Error saving health profile:', err);
      setError('Failed to save your health profile. Please try again.');
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6">
            <h1 className="text-2xl font-bold text-white">Setup Your Health Profile</h1>
            <p className="text-emerald-100 mt-2">
              Lets setup your health profile so we can personalize your nutrition experience.
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="px-6 pt-6">
            <div className="flex justify-between mb-2">
              <span className="text-xs font-medium">Basic Info</span>
              <span className="text-xs font-medium">Activity & Goals</span>
              <span className="text-xs font-medium">Allergies</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${(activeStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v4a1 1 0 11-2 0v-4a1 1 0 112 0zm0-4a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6">
            {/* Step 1: Basic Information */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">Height (cm) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      id="height"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Activity & Goals */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Activity & Goals</h2>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
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
                    <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1">Your Goal</label>
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
                  
                  {/* Display calculated nutrition info based on input */}
                  {formData.weight && formData.height && formData.age && (
                    <div className="mt-8 bg-emerald-50 p-4 rounded-lg">
                      <h3 className="font-medium text-emerald-800 mb-2">Based on your information:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Basal Metabolic Rate</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {calculateBMR(formData)} calories
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Daily Energy Expenditure</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {calculateTDEE(formData)} calories
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Target Calories</p>
                          <p className="text-lg font-bold text-emerald-600">
                            {calculateTarget(formData)} calories
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 3: Allergies */}
            {activeStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Allergies & Dietary Restrictions</h2>
                <p className="text-gray-600 mb-4">
                  Select any allergies you have. We will exclude recipes containing these ingredients.
                </p>
                
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
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`allergy-${allergy}`} className="ml-2 text-sm text-gray-700">
                        {allergy}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        You can always update these preferences later in your profile settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
              ) : (
                <div></div> // Empty div to maintain flex spacing
              )}
              
              {activeStep <= 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Complete Setup
                </button>
              )}
            </div>
          </form>
          
          {/* Skip Button */}
          <div className="px-6 pb-6 text-center">
            <button 
              type="button" 
              onClick={() => router.push('/')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
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
      return Math.round(tdee * 1.15); // 15% surplus
    case 'Muscle Gain':
      return Math.round(tdee * 1.2); // 20% surplus for muscle building
    case 'Improve Health':
      return Math.round(tdee * 0.95); // Slight 5% deficit for health improvement
    case 'Weight Maintenance':
    default:
      return tdee; // Maintenance
  }
}

export default OnboardingPage;