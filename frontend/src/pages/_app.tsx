import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import BottomNav from "./components/common/BottomNav";
import ChatPopup from "./components/common/ChatPopup"; // Thêm import
import { AuthProvider, useAuth } from "../api/useAuth";
import { useEffect, useState } from "react"; // Thêm useState

// Danh sách các route công khai (không cần đăng nhập)
const publicRoutes = [
  '/',
  '/about',
  '/auth/login',
  '/auth/signup',
  '/auth/forgotPassword',
  '/privacy',
  '/terms',
];

// Custom App component to handle auth logic
function AppContent({ Component, pageProps, router }) {
  const { user, userRole, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    const handleAuthRedirects = async () => {
      // Đợi cho quá trình kiểm tra authentication hoàn tất
      if (loading) return;

      // Đã chuyển hướng rồi thì không cần chuyển hướng nữa
      if (redirecting) return;

      const path = router.pathname;
      
      console.log("🔒 [Auth] Current path:", path);
      console.log("🔒 [Auth] User role:", userRole);
      console.log("🔒 [Auth] Loading state:", loading);

      // 1. Xử lý chuyển hướng cho admin
      if (user && userRole === 'admin') {
        // Nếu là admin và đang ở trang chủ, chuyển đến trang admin
        if (path === '/') {
          console.log("🔀 [Redirect] Admin user at homepage, redirecting to admin dashboard");
          setRedirecting(true);
          router.push('/adminUI');
          return;
        }
      }

      // 2. Xử lý cho user chưa đăng nhập
      if (!user) {
        // Kiểm tra xem đường dẫn hiện tại có phải là public route không
        const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route));
        
        // Nếu không phải public route, chuyển hướng về login
        if (!isPublicRoute) {
          console.log("🔀 [Redirect] Protected route, not logged in. Redirecting to login page");
          setRedirecting(true);
          router.push('/auth/login');
          return;
        }
      }
    };
    
    handleAuthRedirects();
  }, [user, userRole, loading, router.pathname, redirecting, router]);

  // Effect to clear search results when navigating to auth pages
  useEffect(() => {
    // Listen for route changes
    const handleRouteChange = (url: string) => {
      // Reset redirecting state when route changes
      setRedirecting(false);
      
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

  // Only show bottom nav on certain pages (exclude auth pages and admin pages)
  const showBottomNav = !router.pathname.includes('/auth/') && !router.pathname.includes('/adminUI');
  
  // Chỉ hiển thị chat popup cho người dùng thường (không phải admin) và khi đã đăng nhập và không ở trang auth
  const showChatPopup = user && userRole !== 'admin' && !router.pathname.includes('/auth/');

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
        {showBottomNav && <BottomNav />} {/* Only show bottom nav on non-auth, non-admin pages */}
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