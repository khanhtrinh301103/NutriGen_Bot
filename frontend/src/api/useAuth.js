// frontend/src/api/AuthContext.js (hoặc tương đương)

import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebaseConfig'; // ✅ dùng auth đã được init sẵn

// Create auth context
const AuthContext = createContext({
  user: null,
  userRole: null,
  loading: true,
});

/**
 * Auth Provider component that wraps the application and provides auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        try {
          const userRef = doc(db, 'user', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const role = userData.role || 'user';
            setUserRole(role);
            console.log('🔐 [Auth] User role identified:', role);
          } else {
            setUserRole('user');
            console.log('🔐 [Auth] No user document found, defaulting to role: user');
          }
        } catch (error) {
          console.error('❌ [Auth] Error fetching user role:', error);
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
      console.log('🔐 [Auth] Auth state changed:', user ? `Logged in as ${user.email}` : 'Not logged in');
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
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

// ✅ Danh sách các route không cần đăng nhập
export const publicRoutes = [
  '/about',
  '/auth/login',
  '/auth/signup',
  '/auth/forgotPassword'
];
