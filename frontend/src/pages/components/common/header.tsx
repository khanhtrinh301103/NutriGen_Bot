import React from "react";
import Link from "next/link";

const Header = () => {
  return (
    <header className="header shadow-md">
      <div className="container flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img className="h-10 w-auto" src="/Logo.png" alt="NutriGen Bot" />
          <span className="ml-3 text-2xl font-bold">NutriGen Bot</span>
        </Link>

        {/* Navigation */}
        <nav className="flex space-x-8">
          <Link href="/" className="text-white hover:text-gray-300 font-semibold">
            Home
          </Link>
          <Link href="/recipes" className="text-white hover:text-gray-300 font-semibold">
            Recipes
          </Link>
          <Link href="/blog" className="text-white hover:text-gray-300 font-semibold">
            Blog
          </Link>
          <Link href="/about" className="text-white hover:text-gray-300 font-semibold">
            About
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex space-x-4">
          <Link href="/auth/login" className="btn-primary bg-white text-[#4b7e53]">
            Log In
          </Link>
          <Link href="/auth/signup" className="btn-primary bg-white text-[#4b7e53]">
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
