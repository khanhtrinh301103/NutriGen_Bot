import React from "react";
import { BeakerIcon, ShieldCheckIcon, ChartBarIcon, FunnelIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Layout from "./components/common/layout";

const SECTION_STYLES = {
  padding: "py-16",
  container: "max-w-6xl mx-auto px-4"
};

const HEADING_STYLES = {
  secondary: "text-3xl font-bold text-[#4b7e53]"
};

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className={`${SECTION_STYLES.padding} bg-gradient-to-b from-[#f8f3e7] via-[#f8f3e7] to-white`}>
        <div className={`${SECTION_STYLES.container} flex flex-col md:flex-row items-center gap-12`}>
          {/* Left Section */}
          <div className="text md:w-1/2">
            <h1 className="text-5xl font-bold leading-tight">
              Discover Recipes <br />
              <span className="text-[#4b7e53]">Tailored for Your Health</span>
            </h1>
            <p className="mt-4 text-lg text-gray-700 leading-relaxed">
              Find delicious meals that match your dietary needs, health goals,
              and personal preferences. All recipes are personalized based on
              your unique health profile.
            </p>
            <div className="mt-6 flex gap-4">
              <Link href="/recipes" className="btn-primary">Find Recipes</Link>
            </div>
          </div>

          {/* Right Section */}
          <div className="image md:w-1/2">
            <img
              src="/mainfood.jpg"
              alt="Healthy food"
              className="rounded-lg shadow-lg w-full h-auto max-w-[500px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://via.placeholder.com/500x350?text=NutriGen+Food";
              }}
            />
          </div>
        </div>
      </section>

      {/* Why NutriGen Bot Section */}
      <section className={`${SECTION_STYLES.padding} bg-gradient-to-b from-white to-[#f3f8f4]`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-[#4b7e53] text-2xl font-semibold uppercase tracking-wider text-center mb-2">
            FEATURES
          </h2>
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose NutriGen Bot?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1: Personalization */}
            <div className="bg-gradient-to-br from-white to-[#f8f3e7] rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="mb-4 flex justify-center">
                <BeakerIcon className="h-12 w-12 text-[#4b7e53]" />
              </div>
              <h4 className="text-xl font-semibold text-[#4b7e53] mb-3">
                Personalized Recipes
              </h4>
              <p className="text-gray-600">
                Get recipe recommendations tailored to your health goals and preferences.
              </p>
            </div>

            {/* Feature 2: Allergy Safety */}
            <div className="bg-gradient-to-br from-white to-[#f8f3e7] rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="mb-4 flex justify-center">
                <ShieldCheckIcon className="h-12 w-12 text-[#4b7e53]" />
              </div>
              <h4 className="text-xl font-semibold text-[#4b7e53] mb-3">
                Allergy Safe
              </h4>
              <p className="text-gray-600">
                Receive recipes that are safe based on your allergy information.
              </p>
            </div>

            {/* Feature 3: Nutrition Analysis */}
            <div className="bg-gradient-to-br from-white to-[#f8f3e7] rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="mb-4 flex justify-center">
                <ChartBarIcon className="h-12 w-12 text-[#4b7e53]" />
              </div>
              <h4 className="text-xl font-semibold text-[#4b7e53] mb-3">
                Nutrition Balance
              </h4>
              <p className="text-gray-600">
                Get detailed nutritional information for each recipe.
              </p>
            </div>

            {/* Feature 4: Quick Filter */}
            <div className="bg-gradient-to-br from-white to-[#f8f3e7] rounded-xl p-6 text-center hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="mb-6 flex justify-center">
                <FunnelIcon className="h-14 w-14 text-[#4b7e53]" aria-hidden="true" />
              </div>
              <h4 className="text-xl font-semibold text-[#4b7e53] mb-3">
                Quick Filter
              </h4>
              <p className="text-gray-600">
                Easily find recipes by cuisine type, cooking time, and ingredients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`${SECTION_STYLES.padding} bg-gradient-to-b from-[#f3f8f4] to-[#f8f3e7]`}>
        <div className="max-w-6xl mx-auto px-4">
          <h2 className={`${HEADING_STYLES.secondary} text-center mb-16`}>
            How It Works
          </h2>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#4b7e53] -translate-y-1/2 opacity-20"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-white to-[#f3f8f4] rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-[#4b7e53] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-semibold text-[#4b7e53] mb-3">
                    Set Up Profile
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Tell us about your health information and dietary preferences.
                  </p>
                  <Link 
                    href="/onboarding"
                    className="inline-block bg-[#4b7e53] text-white px-6 py-2 rounded-lg hover:bg-[#3d6743] transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-white to-[#f3f8f4] rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-[#4b7e53] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-semibold text-[#4b7e53] mb-3">
                    Set Your Goals
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Define your health goals and daily nutritional targets.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>• Weight Management</p>
                    <p>• Muscle Gain</p>
                    <p>• Healthy Diet</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-white to-[#f3f8f4] rounded-xl p-6 text-center shadow-md hover:shadow-lg transition-all">
                  <div className="w-12 h-12 bg-[#4b7e53] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-semibold text-[#4b7e53] mb-3">
                    Get Recommendations
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Receive personalized recipe recommendations based on your profile.
                  </p>
                  <Link 
                    href="/recipes"
                    className="inline-block bg-[#4b7e53] text-white px-6 py-2 rounded-lg hover:bg-[#3d6743] transition-colors"
                  >
                    Explore Recipes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className={`${SECTION_STYLES.padding} bg-gradient-to-b from-[#f8f3e7] via-white to-white`}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className={`${HEADING_STYLES.secondary} mb-6`}>
            Ready to Discover Your Personalized Recipes?
          </h2>
          <p className="text-lg mb-8 text-gray-600">
            Access your personalized recipe recommendations based on your health profile.
          </p>
          <Link 
            href="/profile"
            className="inline-block bg-[#4b7e53] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3d6743] transition-colors shadow-md"
          >
            View My Profile
          </Link>
        </div>
      </section>

      {/* 추가적인 Footer 여백 확보 */}
      <div className="h-16 bg-white"></div>
    </Layout>
  );
};

export default HomePage;
