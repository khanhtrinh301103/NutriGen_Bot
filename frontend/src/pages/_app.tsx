import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import BottomNav from "./components/common/BottomNav";
import ChatPopup from "./components/common/ChatPopup"; // Thêm import
import { AuthProvider, useAuth } from "../api/useAuth";
import { useEffect, useState } from "react"; // Thêm useState
import { doc, getDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";

// Function to check if a user is admin
const checkAdminRole = async (uid) => {
  try {
    const userRef = doc(db, "user", uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.role === "admin";
    }
    return false;
  } catch (error) {
    console.error("❌ [Auth] Error checking admin role:", error);
    return false;
  }
};

// Custom App component to handle auth logic
function AppContent({ Component, pageProps, router }) {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false); // Thêm state để lưu trạng thái admin

  useEffect(() => {
    const handleAuthRedirects = async () => {
      if (!loading && user) {
        const path = router.pathname;
        
        // Kiểm tra vai trò của người dùng
        const adminCheck = await checkAdminRole(user.uid);
        setIsAdmin(adminCheck); // Lưu trạng thái vào state
        
        // Nếu có người dùng và đang ở trang chủ (root path), kiểm tra xem họ có phải admin không
        if (path === '/') {
          if (adminCheck) {
            console.log("🔀 [Redirect] Admin user detected at homepage, redirecting to admin dashboard");
            router.push('/adminUI');
          } else {
            console.log("✅ [Auth] Regular user at homepage, staying here");
          }
        }
      } else if (!loading && !user) {
        const path = router.pathname;
        
        // Nếu người dùng không đăng nhập và không ở trang auth hoặc trang public
        if (!path.includes('/auth/') && 
            path !== '/about' && 
            path !== '/privacy' && 
            path !== '/terms') {
          console.log("🔀 [Redirect] No user detected on protected page, redirecting to login");
          router.push('/auth/login');
          return;
        }
      }
    };
    
    handleAuthRedirects();
  }, [user, loading, router.pathname]);

  // Effect to clear search results when navigating to auth pages
  useEffect(() => {
    // Listen for route changes
    const handleRouteChange = (url: string) => {
      // If navigating to login page, clear recipe search results
      if (url.includes('/auth/login') || url.includes('/auth/signup')) {
        localStorage.removeItem('recipeSearchState');
        console.log("🧹 [Auth] Cleared search results on auth page navigation");
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    
    // Clean up event listener
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  // Only show bottom nav on certain pages (exclude auth pages)
  const showBottomNav = !router.pathname.includes('/auth/');
  
  // Chỉ hiển thị chat popup cho người dùng thường (không phải admin) và khi đã đăng nhập và không ở trang auth
  const showChatPopup = user && !isAdmin && !router.pathname.includes('/auth/');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.route}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Component {...pageProps} />
        {showBottomNav && <BottomNav />} {/* Only show bottom nav on non-auth pages */}
        {showChatPopup && <ChatPopup />} {/* Only show chat popup for regular users */}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </AuthProvider>
  );
}