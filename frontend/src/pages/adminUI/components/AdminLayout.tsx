import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { signOutUser } from '../../../api/authService';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { path: '/adminUI', label: 'Dashboard', icon: 'M3 10l6 6L21 4' },
  { path: '/adminUI/UserManagement', label: 'Users', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0z M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { path: '/adminUI/SearchManagement', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { path: '/adminUI/AssistantChat', label: 'Chatbot', icon: 'M8 10h.01 M12 10h.01 M16 10h.01 M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { path: '/adminUI/ChatManagement', label: 'Manage Chat', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l.123.38a1 1 0 00.952.69h.39c.969 0 1.371 1.24.588 1.81l-.316.23a1 1 0 000 1.558l.316.23c.783.57.38 1.81-.588 1.81h-.39a1 1 0 00-.952.69l-.123.38c-.3.921-1.603.921-1.902 0l-.123-.38a1 1 0 00-.952-.69h-.39c-.969 0-1.371-1.24-.588-1.81l.316-.23a1 1 0 000-1.558l-.316-.23c-.783-.57-.38-1.81.588-1.81h.39a1 1 0 00.952-.69l.123-.38z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { path: '/adminUI/PostsManagement', label: 'Blog Posts', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9 M7 16h6M7 8h6v4H7V8z' }
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Dashboard' }) => {
  const router = useRouter();
  const [isMobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/auth/login');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <LayoutGroup>
      <div className="flex h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <motion.aside
          layout
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          className="hidden md:flex flex-col w-64 bg-white shadow-lg"
        >
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-bold text-green-700">NutriGen Admin</h2>
          </div>
          <nav className="flex-1 overflow-y-auto mt-4">
            {navItems.map(item => {
              const active = router.pathname === item.path;
              return (
                <Link 
                  href={item.path} 
                  key={item.path}
                  className={`flex items-center px-6 py-3 mx-2 my-1 rounded-lg cursor-pointer text-gray-700 ${
                    active ? 'font-semibold' : 'font-medium'
                  }`}
                >
                  <motion.div
                    layout
                    whileHover={{ scale: 1.05, backgroundColor: '#f0faf4' }}
                    whileTap={{ scale: 0.97 }}
                    animate={{ backgroundColor: active ? '#e3fcec' : '#fff' }}
                    transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    className="flex items-center w-full"
                  >
                    <svg
                      className="h-6 w-6 mr-3 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span className="flex-1">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </nav>
          <div className="px-6 py-4 border-t">
            <motion.button
              layout
              whileHover={{ scale: 1.03, backgroundColor: '#fde8e8' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 180 }}
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 rounded-lg text-red-600 font-medium"
            >
              <svg
                className="h-5 w-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
              </svg>
              Sign Out
            </motion.button>
          </div>
        </motion.aside>

        {/* Mobile Toggler */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <motion.button
            onClick={() => setMobileOpen(true)}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="p-2 bg-white rounded-md shadow-lg"
          >
            <svg className="h-6 w-6 text-green-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.aside
              layout
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              className="fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg md:hidden"
            >
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-green-700">Admin</h2>
                <motion.button onClick={() => setMobileOpen(false)} whileHover={{ scale: 1.1 }}>
                  <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
              <nav className="mt-4">
                {navItems.map(item => (
                  <Link 
                    href={item.path} 
                    key={item.path}
                    className="flex items-center px-6 py-3 mx-2 rounded-lg text-gray-700"
                    onClick={() => setMobileOpen(false)}
                  >
                    <motion.div
                      layout
                      whileHover={{ scale: 1.05, backgroundColor: '#f0faf4' }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      className="flex items-center w-full"
                    >
                      <svg
                        className="h-5 w-5 mr-3 text-green-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                      {item.label}
                    </motion.div>
                  </Link>
                ))}
              </nav>
              <div className="absolute bottom-0 w-full px-6 py-4 border-t">
                <motion.button
                  layout
                  whileHover={{ scale: 1.03, backgroundColor: '#fde8e8' }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 180 }}
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 rounded-lg text-red-600 font-medium"
                >
                  <svg
                    className="h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                  </svg>
                  Sign Out
                </motion.button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-auto">
          <header className="bg-white shadow px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          </header>
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </LayoutGroup>
  );
};

export default AdminLayout;