import Layout from "./components/common/layout";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from "../api/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      const checkUserRole = async () => {
        try {
          const userRef = doc(db, "user", user.uid);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Nếu người dùng là admin, chuyển hướng đến trang admin
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
      {/* Hero Section */}
      <section className="section bg-[#f8f3e7] flex justify-center">
        <div className="container hero flex items-center">
          {/* Left Section */}
          <div className="text md:w-1/2">
            <h1 className="text-5xl font-bold leading-tight">
              Discover Recipes <br />
              <span className="text-[#4b7e53]">Tailored for Your Health</span>
            </h1>
            <p className="mt-4 text-lg text-gray-700 leading-relaxed">
              Find delicious meals that match your dietary needs, health goals,
              and personal preferences. All recipes are personalized based on
              your unique health profile.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="/recipes" className="btn-primary">Find Recipes</a>
            </div>
          </div>

          {/* Right Section */}
          <div className="image md:w-1/2">
            <img
              src="/mainfood.jpg"
              alt="Healthy food"
              className="rounded-lg shadow-lg w-full h-auto max-w-[500px]"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src =
                  "https://via.placeholder.com/500x350?text=NutriGen+Food";
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container text-center">
          <h2 className="text-[#4b7e53] text-2xl font-semibold uppercase tracking-wider mb-2">
            FEATURES
          </h2>
          <h3 className="text-3xl font-bold mb-12">Why Choose NutriGen Bot?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#f8f3e7] p-6 rounded-lg shadow-md">
              <div className="text-[#4b7e53] text-5xl mb-4">🥗</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Recommendations
              </h4>
              <p className="text-gray-700">
                Get recipe suggestions tailored to your health profile and dietary preferences.
              </p>
            </div>
            <div className="bg-[#f8f3e7] p-6 rounded-lg shadow-md">
              <div className="text-[#4b7e53] text-5xl mb-4">🔬</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Smart Nutrition Guidance
              </h4>
              <p className="text-gray-700">
                Get scientifically backed nutrition insights tailored to your health profile.
              </p>
            </div>
            <div className="bg-[#f8f3e7] p-6 rounded-lg shadow-md">
              <div className="text-[#4b7e53] text-5xl mb-4">📊</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Nutrition Analysis
              </h4>
              <p className="text-gray-700">
                Get detailed nutritional information for every recipe to help you meet your health goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ready to Get Started Section
      <section className="py-16 bg-[#4b7e53] text-white text-center">
        <div className="container">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-lg mb-8 max-w-3xl mx-auto">
            Create your health profile today and discover recipes that are perfect for your unique needs.
          </p>
          <a href="/signup" className="btn-primary bg-white text-[#4b7e53] hover:bg-gray-200">
            Get Started Now
          </a>
        </div>
      </section> */}

      {/* 추가적인 Footer 여백 확보 (흰색 배경 유지) */}
      <div className="h-16 bg-white"></div>
    </Layout>
  );
}
