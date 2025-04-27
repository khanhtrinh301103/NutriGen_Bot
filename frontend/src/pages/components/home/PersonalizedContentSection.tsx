import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { db } from '@/api/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface PersonalizedContentSectionProps {
  userId: string;
}

interface Recipe {
  id: string;
  title: string;
  image: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  readyInMinutes: number;
  savedAt: string;
}

const PersonalizedContentSection = ({ userId }: PersonalizedContentSectionProps) => {
  const [recentRecipes, setRecentRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("🔍 [Home] Fetching user saved recipes for personalized section");
        const userRef = doc(db, "user", userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.savedRecipes && userData.savedRecipes.length > 0) {
            // Get most recent recipes
            const recent = userData.savedRecipes
              .sort((a: any, b: any) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
              .slice(0, 6); // Increase to 6 for better carousel experience
            
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

  // Carousel variants
  const slideVariants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  // Carousel navigation functions
  const nextSlide = () => {
    console.log("➡️ [Carousel] Moving to next slide");
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex === recentRecipes.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    console.log("⬅️ [Carousel] Moving to previous slide");
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? recentRecipes.length - 1 : prevIndex - 1
    );
  };

  // Handle carousel touch/mouse events
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    setIsDragging(false);
    
    // Calculate if we should move slides based on drag distance and velocity
    const swipeThreshold = 50;
    if (offset.x < -swipeThreshold || velocity.x < -0.5) {
      nextSlide();
    } else if (offset.x > swipeThreshold || velocity.x > 0.5) {
      prevSlide();
    }
  };

  if (loading) {
    return null; // Don't render anything while loading
  }

  // Don't render if no recipes
  if (recentRecipes.length === 0) {
    return null;
  }

  // Calculate indices for visible slides (current, previous, next)
  const getPrevIndex = (index: number) => index === 0 ? recentRecipes.length - 1 : index - 1;
  const getNextIndex = (index: number) => index === recentRecipes.length - 1 ? 0 : index + 1;

  // Get array of recipes to display (for small screens - 1 recipe, for larger screens - 3 recipes)
  const getVisibleRecipes = () => {
    if (recentRecipes.length <= 3) return recentRecipes;
    
    // Create array with current index in the middle and surrounding recipes
    return [
      recentRecipes[getPrevIndex(currentIndex)],
      recentRecipes[currentIndex],
      recentRecipes[getNextIndex(currentIndex)]
    ];
  };

  return (
    <motion.section
      className="py-16 bg-[#f8fdf9] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
    >
      <div className="container relative">
        <motion.div variants={fadeInUp} className="mb-12">
          <h4 className="text-[#4b7e53] font-semibold uppercase tracking-wider mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
            Your Saved Recipes
          </h4>
          <h2 className="text-3xl md:text-4xl font-bold">Recently Saved <span className="text-[#4b7e53]">Favorites</span></h2>
          <div className="w-20 h-1.5 bg-[#4b7e53] rounded mt-3 mb-4"></div>
          <p className="mt-4 text-gray-700 max-w-2xl">Continue exploring these recipes or find new ones that match your nutrition profile.</p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative px-10 md:px-16">
          {/* Carousel Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-6 z-10">
            <button 
              onClick={prevSlide}
              className="bg-white p-2.5 md:p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4b7e53] focus:ring-opacity-50 group"
              aria-label="Previous recipe"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7 text-[#4b7e53] group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-6 z-10">
            <button 
              onClick={nextSlide}
              className="bg-white p-2.5 md:p-3 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#4b7e53] focus:ring-opacity-50 group"
              aria-label="Next recipe"
            >
              <svg className="w-6 h-6 md:w-7 md:h-7 text-[#4b7e53] group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Carousel Content */}
          <div 
            className="overflow-hidden" 
            ref={carouselRef}
          >
            <motion.div
              className="flex"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              dragElastic={0.1}
              style={{ touchAction: 'none' }}
            >
              <AnimatePresence initial={false} custom={direction} mode="popLayout">
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="w-full flex flex-nowrap px-4"
                >
                  {/* Mobile: Single Recipe View */}
                  <div className="block md:hidden w-full">
                    <RecipeCard recipe={recentRecipes[currentIndex]} />
                  </div>
                  
                  {/* Desktop: Multiple Recipes View */}
                  <div className="hidden md:grid md:grid-cols-3 gap-6 w-full">
                    {getVisibleRecipes().map((recipe, idx) => (
                      <RecipeCard key={`${recipe.id}-${idx}`} recipe={recipe} />
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center mt-8 space-x-3">
            {recentRecipes.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 ${
                  idx === currentIndex 
                    ? 'w-8 h-2.5 bg-[#4b7e53] rounded-full' 
                    : 'w-2.5 h-2.5 bg-gray-300 rounded-full hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
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

// Recipe Card Component - extracted for better readability
const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1">
      <div className="h-52 overflow-hidden relative group">
        <img
          src={recipe.image || "https://via.placeholder.com/400x300?text=Recipe+Image"}
          alt={recipe.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            console.log(`❌ [Home] Error loading recipe image for ${recipe.title}`);
            const target = e.target as HTMLImageElement;
            target.src = "https://via.placeholder.com/400x300?text=Recipe+Image";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="font-bold text-lg text-shadow">{recipe.title}</h3>
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:hidden">{recipe.title}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm bg-[#f0f7f1] text-[#4b7e53] px-3 py-1 rounded-full font-medium">
            {recipe.calories && `${Math.round(recipe.calories)} cal`}
          </span>
          <span className="text-sm bg-[#f0f7f1] text-[#4b7e53] px-3 py-1 rounded-full font-medium">
            {recipe.readyInMinutes && `${recipe.readyInMinutes} min`}
          </span>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex-1">
          <div className="flex justify-between text-center">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Protein</span>
              <span className="font-semibold text-[#4b7e53]">{recipe.protein && `${Math.round(recipe.protein)}g`}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Carbs</span>
              <span className="font-semibold text-[#4b7e53]">{recipe.carbs && `${Math.round(recipe.carbs)}g`}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 mb-1">Fat</span>
              <span className="font-semibold text-[#4b7e53]">{recipe.fat && `${Math.round(recipe.fat)}g`}</span>
            </div>
          </div>
        </div>
        <a
          href={`/recipe/${recipe.id}`}
          className="mt-6 block text-center py-2.5 px-4 bg-[#4b7e53] text-white rounded-lg hover:bg-[#3d6943] transition-all duration-300 hover:shadow-lg flex items-center justify-center font-medium"
        >
          View Recipe
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </a>
      </div>
    </div>
  );
};

export default PersonalizedContentSection;