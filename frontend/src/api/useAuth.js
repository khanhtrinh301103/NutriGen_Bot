import { useState, useEffect, createContext, useContext } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Create auth context
const AuthContext = createContext({
  user: null,
  loading: true,
});

/**
 * Auth Provider component that wraps the application and provides auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    
    // Set up listener for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      console.log("🔐 [Auth] Auth state changed:", user ? `Logged in as ${user.email}` : "Not logged in");
    });

    // Clean up subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth state
 */
export function useAuth() {
  return useContext(AuthContext);
}

// Export list of public routes for use in ProtectedRoute component
export const publicRoutes = [
  '/',           // Home page
  '/about',      // About page
  '/auth/login', // Login page
  '/auth/signup', // Signup page
  '/auth/forgotPassword' // Forgot password page
];