// frontend/src/pages/adminUI/components/AdminLayout.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signOutUser } from '../../../api/authService';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Dashboard' }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto border-r" style={{ backgroundColor: '#4b7e53' }}>
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-white font-bold text-xl">NutriGen Admin</span>
            </div>
            <div className="flex flex-col flex-grow px-4 mt-5">
              <nav className="flex-1 space-y-1" style={{ backgroundColor: '#4b7e53' }}>
                <Link href="/adminUI" legacyBehavior>
                  <a className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    router.pathname === '/adminUI' 
                      ? 'text-white' 
                      : 'text-green-100 hover:text-white'
                  }`} style={{ backgroundColor: router.pathname === '/adminUI' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                    <svg className="mr-3 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l6 6L21 4" />
                    </svg>
                    Dashboard
                  </a>
                </Link>
                <Link href="/adminUI/UserManagement" legacyBehavior>
                  <a className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    router.pathname === '/adminUI/UserManagement' 
                      ? 'text-white' 
                      : 'text-green-100 hover:text-white'
                  }`} style={{ backgroundColor: router.pathname === '/adminUI/UserManagement' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                    <svg className="mr-3 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Users
                  </a>
                </Link>
                <Link href="/adminUI/SearchManagement" legacyBehavior>
                  <a className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    router.pathname === '/adminUI/SearchManagement' 
                      ? 'text-white' 
                      : 'text-green-100 hover:text-white'
                  }`} style={{ backgroundColor: router.pathname === '/adminUI/SearchManagement' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                    <svg className="mr-3 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Management
                  </a>
                </Link>
                <Link href="/adminUI/NutritionData" legacyBehavior>
                  <a className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    router.pathname === '/adminUI/NutritionData' 
                      ? 'text-white' 
                      : 'text-green-100 hover:text-white'
                  }`} style={{ backgroundColor: router.pathname === '/adminUI/NutritionData' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                    <svg className="mr-3 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm8-1v16M8 9h8m-8 4h8" />
                    </svg>
                    Nutrition
                  </a>
                </Link>
              </nav>
              <div className="mt-auto">
                <button
                  onClick={handleSignOut}
                  className="group flex items-center px-4 py-2 text-sm font-medium text-green-100 rounded-md hover:text-white"
                  style={{ transition: 'all 0.2s' }}
                >
                  <svg className="mr-3 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden fixed inset-0 flex z-40" style={{ display: isMobileMenuOpen ? 'flex' : 'none' }}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="relative flex-1 flex flex-col max-w-xs w-full" style={{ backgroundColor: '#4b7e53' }}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <span className="text-white font-bold text-xl">NutriGen Admin</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              <Link href="/adminUI" legacyBehavior>
                <a className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  router.pathname === '/adminUI' 
                    ? 'text-white' 
                    : 'text-green-100 hover:text-white'
                }`} style={{ backgroundColor: router.pathname === '/adminUI' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                  <svg className="mr-4 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l6 6L21 4" />
                  </svg>
                  Dashboard
                </a>
              </Link>
              <Link href="/adminUI/UserManagement" legacyBehavior>
                <a className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  router.pathname === '/adminUI/UserManagement' 
                    ? 'text-white' 
                    : 'text-green-100 hover:text-white'
                }`} style={{ backgroundColor: router.pathname === '/adminUI/UserManagement' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                  <svg className="mr-4 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Users
                </a>
              </Link>
              <Link href="/adminUI/SearchManagement" legacyBehavior>
                <a className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  router.pathname === '/adminUI/SearchManagement' 
                    ? 'text-white' 
                    : 'text-green-100 hover:text-white'
                }`} style={{ backgroundColor: router.pathname === '/adminUI/SearchManagement' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                  <svg className="mr-4 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Management
                </a>
              </Link>
              <Link href="/adminUI/NutritionData" legacyBehavior>
                <a className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  router.pathname === '/adminUI/NutritionData' 
                    ? 'text-white' 
                    : 'text-green-100 hover:text-white'
                }`} style={{ backgroundColor: router.pathname === '/adminUI/NutritionData' ? '#3a6442' : 'transparent', transition: 'all 0.2s' }}>
                  <svg className="mr-4 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm8-1v16M8 9h8m-8 4h8" />
                  </svg>
                  Nutrition
                </a>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full group flex items-center px-2 py-2 text-base font-medium text-green-100 rounded-md hover:text-white"
                style={{ transition: 'all 0.2s' }}
              >
                <svg className="mr-4 h-6 w-6 text-green-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        {/* Top navigation - mobile only */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-white shadow">
          <button
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Page header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6">
            {children}
          </div>
        </main>
        
        {/* Bottom Navigation for Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-40">
          <div className="flex justify-around">
            <Link href="/adminUI" legacyBehavior>
              <a className={`flex flex-col items-center py-3 px-2 ${router.pathname === '/adminUI' ? 'text-green-600' : 'text-gray-600'}`}>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10l6 6L21 4" />
                </svg>
                <span className="text-xs mt-1">Dashboard</span>
              </a>
            </Link>
            
            <Link href="/adminUI/UserManagement" legacyBehavior>
              <a className={`flex flex-col items-center py-3 px-2 ${router.pathname === '/adminUI/UserManagement' ? 'text-green-600' : 'text-gray-600'}`}>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs mt-1">Users</span>
              </a>
            </Link>
            
            <Link href="/adminUI/SearchManagement" legacyBehavior>
              <a className={`flex flex-col items-center py-3 px-2 ${router.pathname === '/adminUI/SearchManagement' ? 'text-green-600' : 'text-gray-600'}`}>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-xs mt-1">Search</span>
              </a>
            </Link>
            
            <Link href="/adminUI/NutritionData" legacyBehavior>
              <a className={`flex flex-col items-center py-3 px-2 ${router.pathname === '/adminUI/NutritionData' ? 'text-green-600' : 'text-gray-600'}`}>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3zm8-1v16M8 9h8m-8 4h8" />
                </svg>
                <span className="text-xs mt-1">Nutrition</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;