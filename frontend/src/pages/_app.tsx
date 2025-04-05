import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/router";
import BottomNav from "./components/common/BottomNav";
import { AuthProvider } from "../api/useAuth";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

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

  return (
    <AuthProvider>
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
        </motion.div>
      </AnimatePresence>
    </AuthProvider>
  );
}