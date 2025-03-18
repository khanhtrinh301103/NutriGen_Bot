// frontend/src/pages/components/common/header.tsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "../../../api/firebaseConfig";
import { useRouter } from "next/router";

const Header = () => {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const goToProfile = () => {
    router.push('/profile');
  };

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

        {/* Auth Buttons or User Profile */}
        <div className="flex items-center space-x-4">
          {user ? (
            <button 
              onClick={goToProfile}
              className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full transition-all hover:bg-gray-100"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-emerald-800">
                {user.displayName || user.email.split('@')[0]}
              </span>
            </button>
          ) : (
            <>
              <Link href="/auth/login" className="btn-primary bg-white text-[#4b7e53]">
                Log In
              </Link>
              <Link href="/auth/signup" className="btn-primary bg-white text-[#4b7e53]">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;