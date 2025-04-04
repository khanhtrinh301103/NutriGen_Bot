// frontend/src/pages/about.tsx
import React from 'react';
import Layout from './components/common/layout';

const AboutPage: React.FC = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#f8f3e7] via-[#f8f3e7] to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-[#4b7e53] mb-6">About NutriGen Bot</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Your personal AI-powered nutrition assistant, designed to help you achieve your health goals through personalized recipe recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-gradient-to-b from-white to-[#f8f3e7] py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-[#4b7e53] mb-8 text-center">Our Mission</h2>
            <div className="bg-gradient-to-br from-white to-[#f8f3e7] rounded-xl p-8 shadow-lg">
              <p className="text-gray-600 leading-relaxed">
                At NutriGen Bot, we believe that healthy eating should be accessible, enjoyable, and personalized. 
                Our mission is to empower individuals to make informed dietary choices by providing tailored recipe 
                recommendations that consider their unique health profiles, preferences, and goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-b from-[#f8f3e7] to-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-[#4b7e53] mb-8">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
            <a 
              href="mailto:nutrigenbot@gmail.com" 
              className="inline-block bg-[#4b7e53] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#3d6743] transition-colors shadow-md"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Additional Footer Spacing */}
      <div className="h-16 bg-white"></div>
    </Layout>
  );
};

export default AboutPage;