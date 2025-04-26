import { motion } from 'framer-motion';

interface CTASectionProps {
  isLoggedIn: boolean;
}

const CTASection = ({ isLoggedIn }: CTASectionProps) => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <motion.section 
      className="py-20 bg-gradient-to-r from-[#e8f4e9] to-[#f0f7f1] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      {/* Organic shapes decoration */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#daf1dc] rounded-full opacity-50"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#daf1dc] rounded-full opacity-50"></div>
      
      <div className="container text-center relative z-10">
        {isLoggedIn ? (
          <>
            <h2 className="text-3xl font-bold mb-6">Continue Your Nutrition Journey</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-700">
              Discover new recipes that align with your dietary preferences and health goals.
              Our personalized nutrition system helps you stay on track.
            </p>
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="/recipes" 
                className="bg-gradient-to-r from-[#4b7e53] to-[#5c9a65] text-white font-bold py-3 px-10 rounded-full shadow-lg transition-all hover:shadow-xl"
              >
                Find New Recipes
              </a>
            </motion.div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">Begin Your Natural Wellness Journey</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-700">
              Join NutriGen Bot today and discover personalized recipes that nourish your body
              and support your health goals, one delicious meal at a time.
            </p>
            <motion.div 
              className="flex flex-wrap justify-center gap-4"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="/auth/signup" 
                className="bg-gradient-to-r from-[#4b7e53] to-[#5c9a65] text-white font-bold py-3 px-10 rounded-full shadow-lg transition-all hover:shadow-xl"
              >
                Start Your Journey
              </a>
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  );
};

export default CTASection;