import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '@/api/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface PersonalizedContentSectionProps {
  userId: string;
}

const PersonalizedContentSection = ({ userId }: PersonalizedContentSectionProps) => {
  const [recentRecipes, setRecentRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("🔍 [Home] Fetching user saved recipes for personalized section");
        const userRef = doc(db, "user", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.savedRecipes && userData.savedRecipes.length > 0) {
            // Get most recent 3 recipes
            const recent = userData.savedRecipes
              .sort((a: any, b: any) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
              .slice(0, 3);
            
            setRecentRecipes(recent);
            console.log("✅ [Home] Loaded recent recipes:", recent.length);
          }
        }
      } catch (error) {
        console.error("❌ [Home] Error fetching user saved recipes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  if (loading) {
    return null; // Don't render anything while loading
  }

  // Don't render if no recipes
  if (recentRecipes.length === 0) {
    return null;
  }

  return (
    <motion.section
      className="py-16 bg-[#f8fdf9] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      <div className="container relative">
        <motion.div variants={fadeInUp} className="mb-10">
          <h4 className="text-[#4b7e53] font-semibold uppercase tracking-wider mb-2">Your Saved Recipes</h4>
          <h2 className="text-3xl font-bold">Recently Saved <span className="text-[#4b7e53]">Favorites</span></h2>
          <p className="mt-4 text-gray-700">Continue exploring these recipes or find new ones that match your nutrition profile.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentRecipes.map((recipe, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={recipe.image || "https://via.placeholder.com/400x300?text=Recipe+Image"}
                  alt={recipe.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    console.log(`❌ [Home] Error loading recipe image for ${recipe.title}`);
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/400x300?text=Recipe+Image";
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">{recipe.title}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-sm bg-[#f0f7f1] text-[#4b7e53] px-3 py-1 rounded-full">
                    {recipe.calories && `${Math.round(recipe.calories)} cal`}
                  </span>
                  <span className="text-sm bg-[#f0f7f1] text-[#4b7e53] px-3 py-1 rounded-full">
                    {recipe.readyInMinutes && `${recipe.readyInMinutes} min`}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Protein</span>
                      <span className="font-semibold">{recipe.protein && `${Math.round(recipe.protein)}g`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Carbs</span>
                      <span className="font-semibold">{recipe.carbs && `${Math.round(recipe.carbs)}g`}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500">Fat</span>
                      <span className="font-semibold">{recipe.fat && `${Math.round(recipe.fat)}g`}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`/recipe/${recipe.id}`}
                  className="mt-6 block text-center py-2 px-4 bg-[#4b7e53] text-white rounded-lg hover:bg-[#3d6943] transition-colors"
                >
                  View Recipe
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeInUp} className="text-center mt-10">
          <a 
            href="/profile" 
            className="inline-flex items-center text-[#4b7e53] font-semibold hover:underline"
          >
            View all your saved recipes
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default PersonalizedContentSection;