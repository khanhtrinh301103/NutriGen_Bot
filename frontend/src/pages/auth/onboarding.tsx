// frontend/src/pages/auth/onboarding.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/common/layout';
import { auth } from '../../api/firebaseConfig';
import { updateUserProfile } from '../../api/profile';
import { HealthProfile } from '../../utils/nutritionCalculator';

// Onboarding Step Components
import ProgressBar from '../components/onboarding/ProgressBar';
import BasicInfoStep from '../components/onboarding/BasicInfoStep';
import ActivityGoalsStep from '../components/onboarding/ActivityGoalsStep';
import AllergiesStep from '../components/onboarding/AllergiesStep';

// Step titles for the progress bar
const STEP_TITLES = ['Basic Info', 'Activity & Goals', 'Allergies'];
const TOTAL_STEPS = 3; // Explicit constant for total number of steps

const OnboardingPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
// Initialize health profile form data with dietaryRestrictions
const [formData, setFormData] = useState<HealthProfile>({
  height: '',
  weight: '',
  age: '',
  gender: 'Male',
  activityLevel: 'Sedentary',
  goal: 'Weight Maintenance',
  allergies: [],
  dietaryRestrictions: [],
  mealsPerDay: 3,
  macroDistribution: 'Balanced'
});

  // Log the current active step whenever it changes
  useEffect(() => {
    console.log(`[DEBUG] Active step changed to: ${activeStep}`);
  }, [activeStep]);

  // Check if user is authenticated
  useEffect(() => {
    console.log('[DEBUG] Checking user authentication status');
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        console.log('[DEBUG] User is authenticated', { uid: currentUser.uid });
        setUser(currentUser);
        setLoading(false);
      } else {
        console.log('[DEBUG] User is not authenticated, redirecting to login');
        router.push('/auth/login');
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`[DEBUG] Form field changed: ${name} = ${value}`);
    
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Move to next step
  const handleNext = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default to ensure no form submission
    e.preventDefault();
    
    console.log(`[DEBUG] handleNext called, current step: ${activeStep}`);
    
    // Validate current step
    if (activeStep === 1) {
      if (!formData.height || !formData.weight || !formData.age) {
        setError('Please fill out all fields to continue.');
        console.log('[DEBUG] Validation failed: missing required fields');
        return;
      }
    }
    
    // Safe guard to prevent exceeding max steps
    if (activeStep >= TOTAL_STEPS) {
      console.log('[DEBUG] Already at last step, cannot proceed further');
      return;
    }
    
    // Clear any previous errors
    setError('');
    
    // Update step with function form to ensure we use the latest state
    setActiveStep(prevStep => {
      const nextStep = prevStep + 1;
      console.log(`[DEBUG] Moving from step ${prevStep} to step ${nextStep}`);
      return nextStep;
    });
  }, [activeStep, formData.height, formData.weight, formData.age]);

  // Move to previous step
  const handleBack = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default to ensure no form submission
    e.preventDefault();
    
    console.log(`[DEBUG] handleBack called, current step: ${activeStep}`);
    
    // Safe guard to prevent going below first step
    if (activeStep <= 1) {
      console.log('[DEBUG] Already at first step, cannot go back');
      return;
    }
    
    // Update step with function form to ensure we use the latest state
    setActiveStep(prevStep => {
      const nextStep = prevStep - 1;
      console.log(`[DEBUG] Moving back from step ${prevStep} to step ${nextStep}`);
      return nextStep;
    });
  }, [activeStep]);

  // Submit the form
  const handleSubmit = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Always prevent default form submission behavior
    e.preventDefault();
    console.log('[DEBUG] Form submit triggered');
    
    // Prevent accidental submission if not on the last step
    if (activeStep !== TOTAL_STEPS) {
      console.log(`[DEBUG] Cannot submit from step ${activeStep}, must be on step ${TOTAL_STEPS}`);
      return;
    }
    
    // Prevent double submission
    if (isSubmitting) {
      console.log('[DEBUG] Already submitting, preventing double submission');
      return;
    }
    
    if (!user) {
      console.log('[DEBUG] Cannot submit: No authenticated user');
      return;
    }
    
    try {
      console.log('[DEBUG] Submitting health profile data', formData);
      setIsSubmitting(true);
      setLoading(true);
      setError('');
      
      // Make sure all required fields are present
      const completeHealthProfile = {
        ...formData,
        // Ensure mealsPerDay and macroDistribution are set (these may be missing)
        mealsPerDay: formData.mealsPerDay || 3,
        macroDistribution: formData.macroDistribution || 'Balanced'
      };
      
      // updateUserProfile will calculate and store all the nutrition values
      await updateUserProfile(user.uid, completeHealthProfile);
      console.log('[DEBUG] Health profile successfully updated');
      
      // Redirect to home page
      router.push('/');
    } catch (err) {
      console.error('[DEBUG] Error saving health profile:', err);
      setError('Failed to save your health profile. Please try again.');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  }, [activeStep, formData, isSubmitting, router, user]);

  // Show loading spinner while checking authentication
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

  // Debug information
  console.log(`[DEBUG] Rendering onboarding page. Current step: ${activeStep}/${TOTAL_STEPS}`);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-6">
            <h1 className="text-2xl font-bold text-white">Setup Your Health Profile</h1>
            <p className="text-emerald-100 mt-2">
              Let's setup your health profile so we can personalize your nutrition experience.
            </p>
            {/* DEBUG: Display current step info */}
            <p className="text-xs text-emerald-100 mt-2">
              Step {activeStep} of {TOTAL_STEPS}
            </p>
          </div>
          
          {/* Progress Bar */}
          <ProgressBar 
            currentStep={activeStep} 
            totalSteps={TOTAL_STEPS} 
            stepTitles={STEP_TITLES} 
          />
          
          {/* Error Message */}
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
          
          {/* CRITICAL FIX: Use a div wrapper and place form handling logic in a manual event handler */}
          <div className="p-6">
            {/* Step 1: Basic Information */}
            {activeStep === 1 && (
              <BasicInfoStep formData={formData} handleChange={handleChange} />
            )}
            
            {/* Step 2: Activity & Goals */}
            {activeStep === 2 && (
              <ActivityGoalsStep formData={formData} handleChange={handleChange} />
            )}
            
            {/* Step 3: Allergies */}
            {activeStep === 3 && (
              <AllergiesStep formData={formData} setFormData={setFormData} />
            )}
            
            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {/* Back button - only show if not on first step */}
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
              
              {/* Next/Submit button - change based on current step */}
              {activeStep < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button" // CRITICAL: Changed from "submit" to "button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${isSubmitting ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Complete Setup'}
                </button>
              )}
            </div>
          </div>
          
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

export default OnboardingPage;