// frontend/src/pages/about.tsx
import React from 'react';
import Layout from './components/common/layout';
import Link from 'next/link';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gray-50">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              About NutriGen Bot
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl text-white text-opacity-90">
              Your personal nutrition assistant for healthy eating based on your unique profile.
            </p>
          </div>
        </div>

        {/* Content section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="prose prose-lg prose-emerald mx-auto">
            <h2 className="text-3xl font-bold text-emerald-800 mb-6">Our Mission</h2>
            <p className="text-gray-600">
              NutriGen Bot was created with a simple mission: to make healthy eating accessible,
              personalized, and enjoyable for everyone. We believe that nutrition should be tailored
              to individual needs, preferences, and health goals.
            </p>
            
            <p className="text-gray-600">
              In a world of overwhelming food choices and contradicting nutrition advice, we want to simplify
              the journey to better health through personalized nutrition guidance based on scientific principles.
            </p>

            <div className="my-12 bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3">
                <div className="p-8 bg-emerald-50 flex flex-col items-center text-center">
                  <div className="rounded-full bg-emerald-100 p-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Personalization</h3>
                  <p className="mt-2 text-gray-600">
                    We provide nutrition recommendations based on your unique body metrics, goals, and preferences.
                  </p>
                </div>
                
                <div className="p-8 bg-white flex flex-col items-center text-center">
                  <div className="rounded-full bg-emerald-100 p-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Science-Based</h3>
                  <p className="mt-2 text-gray-600">
                    Our recommendations are grounded in nutritional science and evidence-based practices.
                  </p>
                </div>
                
                <div className="p-8 bg-emerald-50 flex flex-col items-center text-center">
                  <div className="rounded-full bg-emerald-100 p-3 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Simplicity</h3>
                  <p className="mt-2 text-gray-600">
                    We make nutrition simple with easy-to-follow recipes and straightforward guidance.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-emerald-800 mt-12 mb-6">How It Works</h2>
            <p className="text-gray-600">
              NutriGen Bot uses advanced algorithms to analyze your health profile, dietary preferences,
              and nutritional needs to recommend recipes that are perfect for you. Our platform considers
              factors such as:
            </p>
            
            <ul className="list-disc pl-6 mt-4 mb-6 text-gray-600">
              <li className="mb-2">Your height, weight, age, and gender</li>
              <li className="mb-2">Activity level and exercise frequency</li>
              <li className="mb-2">Health goals (weight loss, maintenance, or gain)</li>
              <li className="mb-2">Food allergies and intolerances</li>
              <li className="mb-2">Dietary restrictions and preferences</li>
            </ul>
            
            <p className="text-gray-600">
              Based on this information, we calculate your basal metabolic rate (BMR), total daily
              energy expenditure (TDEE), and recommend a target calorie intake. We then filter and
              recommend recipes that align with your nutritional needs and preferences.
            </p>
            
            <div className="my-12 bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 md:p-10 bg-emerald-600 text-white">
                <h2 className="text-3xl font-bold mb-4">Our Features</h2>
                <p className="text-emerald-50 text-lg">
                  Discover how NutriGen Bot can transform your approach to healthy eating
                </p>
              </div>
              <div className="px-6 py-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Personalized Recipe Recommendations
                  </h3>
                  <p className="text-gray-600">
                    Get recipe suggestions tailored specifically to your health profile, dietary restrictions,
                    and nutritional goals.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Comprehensive Recipe Search
                  </h3>
                  <p className="text-gray-600">
                    Search for recipes based on ingredients, cuisines, meal types, and more. Filter results
                    based on cooking time, nutritional content, and dietary requirements.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Recipe Details
                  </h3>
                  <p className="text-gray-600">
                    View detailed information about each recipe, including ingredients, step-by-step instructions,
                    cooking time, and complete nutritional breakdown.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Save Your Favorites
                  </h3>
                  <p className="text-gray-600">
                    Save recipes you love to your personal collection for quick access later.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Blog & Community
                  </h3>
                  <p className="text-gray-600">
                    Read and share nutrition tips, cooking tricks, and success stories with our growing community
                    of health-conscious food lovers.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Nutritional Analytics
                  </h3>
                  <p className="text-gray-600">
                    Track your nutritional intake and see how your favorite recipes align with your personal 
                    health goals.
                  </p>
                </div>
              </div>
            </div>

            <div className="my-12 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-8 flex flex-col items-center text-center shadow-md">
              <h2 className="text-3xl font-bold text-emerald-800 mb-6">Get Started Today</h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl">
                Ready to discover recipes tailored to your health needs? Create an account, complete your
                health profile, and start exploring personalized recipe recommendations today!
              </p>
              <Link 
                href="/auth/signup" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Sign Up Now
              </Link>
            </div>

            <h2 className="text-3xl font-bold text-emerald-800 mt-12 mb-6">Data Privacy</h2>
            <p className="text-gray-600">
              We take your privacy seriously. Your health information is stored securely and used only
              to provide personalized recipe recommendations. We do not share your data with third parties
              for marketing purposes.
            </p>
            <p className="text-gray-600 mt-4">
              For more information about how we handle your data, please review our{' '}
              <Link href="/privacy-policy" className="text-emerald-600 hover:text-emerald-700">
                Privacy Policy
              </Link>.
            </p>
            
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-emerald-100">
              <div className="flex items-center space-x-2 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">Secure & Trusted</h3>
              </div>
              <p className="text-gray-600">
                We use industry-standard encryption and security measures to protect your personal information. 
                Your data is securely stored and accessed only for providing our services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;