import Layout from "./components/common/layout";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from "../api/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";

// Imported Components
import HeroSection from "./components/home/HeroSection";
import MissionSection from "./components/home/MissionSection";
import FeaturesSection from "./components/home/FeaturesSection";
import ProcessSection from "./components/home/ProcessSection";
import CTASection from "./components/home/CTASection";
import PersonalizedContentSection from "./components/home/PersonalizedContentSection";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Check user role for admin redirection
  useEffect(() => {
    if (!loading && user) {
      const checkUserRole = async () => {
        try {
          const userRef = doc(db, "user", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            if (userData.role === "admin") {
              console.log("🔀 [Home] Admin user detected, redirecting to admin dashboard");
              router.push('/adminUI');
            }
          }
        } catch (error) {
          console.error("❌ [Home] Error checking user role:", error);
        }
      };
      
      checkUserRole();
    }
  }, [user, loading, router]);

  return (
    <Layout>
      {/* Hero Section - Different content for logged in vs guest users */}
      <HeroSection 
        isLoggedIn={!!user} 
        userName={user?.displayName || undefined} 
      />

      {/* Mission Section - Different messaging for logged in vs guest users */}
      <MissionSection isLoggedIn={!!user} />

      {/* Features Section - Different highlighted features based on user state */}
      <FeaturesSection isLoggedIn={!!user} />
      
      {/* For logged-in users only: Recent saved recipes section */}
      {user && <PersonalizedContentSection userId={user.uid} />}

      {/* How It Works / Process Section - Adjusted for user state */}
      <ProcessSection isLoggedIn={!!user} />

      {/* CTA Section - Sign up prompt for guests vs action prompt for users */}
      <CTASection isLoggedIn={!!user} />
    </Layout>
  );
}