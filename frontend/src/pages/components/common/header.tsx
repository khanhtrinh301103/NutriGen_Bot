import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../../api/useAuth";

const Header = () => {
  const { user, userRole } = useAuth();
  const router = useRouter();

  const goToProfile = () => {
    router.push("/profile");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Recipes", path: "/recipes", icon: "🍽️" },
    { name: "Blog", path: "/blog", icon: "✍️" },
    { name: "About", path: "/about", icon: "ℹ️" },
  ];

  // Debug log to track user info
  console.log("📱 [Header] User info:", user?.displayName, user?.email, userRole);

  return (
    <header className="header shadow-md bg-green-600 text-white sticky top-0 z-50">
      <div className="container flex justify-between items-center h-16 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img className="h-10 w-auto" src="/Logo.png" alt="NutriGen Bot" />
          <span className="ml-3 text-2xl font-bold">NutriGen Bot</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-base font-semibold pb-1 flex items-center gap-1 transition-all duration-300 transform hover:translate-y-[-2px] hover:scale-105 hover:text-yellow-200 ${
                router.pathname === link.path
                  ? "text-yellow-300 border-b-2 border-yellow-300"
                  : "text-white"
              }`}
            >
              <span className="text-lg">{link.icon}</span> {link.name}
            </Link>
          ))}
        </nav>

        {/* Auth Buttons or User Profile */}
        <div className="flex items-center space-x-4">
          {user ? (
            <button
              onClick={goToProfile}
              className="flex items-center space-x-2 bg-white px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:ring-2 ring-emerald-200"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/40?text=U";
                  }}
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold">
                  {user.displayName
                    ? user.displayName.charAt(0).toUpperCase()
                    : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-medium text-emerald-800">
                {user.displayName || user.email.split("@")[0]}
              </span>
            </button>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="btn-primary bg-white text-[#4b7e53] transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Log In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary bg-white text-[#4b7e53] transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default Header;