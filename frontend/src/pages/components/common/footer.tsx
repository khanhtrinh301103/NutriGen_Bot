import React from "react";
import Link from "next/link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#4b7e53] text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center">
              <img className="h-10 w-auto" src="/Logo.png" alt="NutriGen Bot" />
              <span className="ml-2 text-xl font-bold">NutriGen Bot</span>
            </Link>
            <p className="mt-2 text-sm text-gray-200">
              Your Daily Diet Assistant
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              NAVIGATION
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/recipes" 
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Recipes
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog" 
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="flex flex-col items-center text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              LEGAL
            </h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-400/20 mt-8 pt-8">
          <p className="text-center text-sm text-gray-200">
            © {currentYear} NutriGen Bot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
