import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  isLoggedIn: boolean;
  userName?: string;
}

const HeroSection = ({ isLoggedIn, userName }: HeroSectionProps) => {
  // Rotating image gallery for the hero section
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideImages = [
    "/homepage1.jpg",
    "/homepage2.jpg",
    "/homepage3.jpg",
    "/homepage4.jpg",
    "/homepage5.jpg",
    "/homepage6.jpg",
    "/homepage7.jpg",
    "/homepage8.jpg",
  ];

  // Auto slide change effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slideImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <section className="relative h-[650px] overflow-hidden">
      {/* Image Carousel */}
      <div className="absolute inset-0 w-full h-full">
        {slideImages.map((image, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`Healthy food showcase ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.log(`❌ [Home] Error loading image: ${image}`);
                const target = e.target as HTMLImageElement;
                target.src = "https://via.placeholder.com/1600x900?text=NutriGen+Food";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[rgba(0,0,0,0.7)] to-[rgba(0,0,0,0.3)]"></div>
          </div>
        ))}
      </div>

      {/* Carousel Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {slideImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Hero Content with Nature Elements */}
      <div className="container relative z-10 h-full flex items-center">
        <motion.div 
          className="text-white max-w-2xl"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="mb-4 flex items-center">
            <span className="text-[#8eca93] text-3xl mr-2">🌱</span>
            <h4 className="text-[#8eca93] font-semibold uppercase tracking-wider">Natural Nutrition</h4>
          </div>
          
          {isLoggedIn ? (
            // Content for logged-in users
            <>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Welcome Back, <span className="text-[#8eca93]">{userName || 'Friend'}</span>!
              </h1>
              <p className="mt-6 text-lg md:text-xl leading-relaxed">
                Continue your wellness journey with personalized recipes that match your nutrition profile.
                What delicious and healthy meal would you like to discover today?
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <motion.a 
                  href="/recipes" 
                  className="bg-gradient-to-r from-[#4b7e53] to-[#5c9a65] text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Recipes
                </motion.a>
                <motion.a 
                  href="/blog" 
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-[#4b7e53] transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  See New Blogs
                </motion.a>
              </div>
            </>
          ) : (
            // Content for guests
            <>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Discover <span className="text-[#8eca93]">Nutrient-Rich</span> Recipes <br />
                For Your Wellness Journey
              </h1>
              <p className="mt-6 text-lg md:text-xl leading-relaxed">
                Find delicious, earth-friendly meals that nourish your body and support your 
                health goals with personalized nutrition insights.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <motion.a 
                  href="/recipes" 
                  className="bg-gradient-to-r from-[#4b7e53] to-[#5c9a65] text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Recipes
                </motion.a>
                <motion.a 
                  href="/about" 
                  className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-[#4b7e53] transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.a>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="text-white">
          <path fill="currentColor" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
    </section>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default HeroSection;