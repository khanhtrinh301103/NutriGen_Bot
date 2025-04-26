import { motion } from 'framer-motion';

// Leaf pattern SVG as a component for reuse
const LeafPattern = () => (
  <svg className="absolute top-0 right-0 w-20 h-20 text-green-100 opacity-30" viewBox="0 0 100 100" fill="currentColor">
    <path d="M95,50c0,24.85-20.15,45-45,45S5,74.85,5,50S25.15,5,50,5S95,25.15,95,50z M80,50c0,16.57-13.43,30-30,30
      S20,66.57,20,50S33.43,20,50,20S80,33.43,80,50z"/>
    <path d="M50,10c-5.52,0-10,4.48-10,10s4.48,10,10,10s10-4.48,10-10S55.52,10,50,10z M50,20c0-2.76,2.24-5,5-5
      s5,2.24,5,5s-2.24,5-5,5S50,22.76,50,20z"/>
    <path d="M30,50c0-5.52,4.48-10,10-10s10,4.48,10,10s-4.48,10-10,10S30,55.52,30,50z M40,55c-2.76,0-5-2.24-5-5
      s2.24-5,5-5s5,2.24,5,5S42.76,55,40,55z"/>
    <path d="M60,50c0-5.52,4.48-10,10-10s10,4.48,10,10s-4.48,10-10,10S60,55.52,60,50z M75,50c0,2.76-2.24,5-5,5
      s-5-2.24-5-5s2.24-5,5-5S75,47.24,75,50z"/>
    <path d="M50,70c-5.52,0-10,4.48-10,10s4.48,10,10,10s10-4.48,10-10S55.52,70,50,70z M55,80c0,2.76-2.24,5-5,5
      s-5-2.24-5-5s2.24-5,5-5S55,77.24,55,80z"/>
  </svg>
);

interface FeaturesSectionProps {
  isLoggedIn: boolean;
}

const FeaturesSection = ({ isLoggedIn }: FeaturesSectionProps) => {
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

  return (
    <motion.section 
      className="py-24 bg-gradient-to-b from-[#f4f9f5] to-white relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      {/* Nature-inspired decorative elements */}
      <div className="absolute left-0 top-1/3 w-32 h-32 bg-[#daf1dc] rounded-full blur-3xl opacity-50"></div>
      <div className="absolute right-10 bottom-10 w-48 h-48 bg-[#e8f4e9] rounded-full blur-3xl opacity-70"></div>
      
      <div className="container text-center relative">
        <motion.h4 
          className="text-[#4b7e53] font-semibold uppercase tracking-wider mb-2"
          variants={fadeInUp}
        >
          FEATURES
        </motion.h4>
        <motion.h2 
          className="text-3xl font-bold mb-16"
          variants={fadeInUp}
        >
          {isLoggedIn 
            ? <span>Tools For Your <span className="text-[#4b7e53]">Wellness Journey</span></span>
            : <span>Nutrition From Nature, <span className="text-[#4b7e53]">Powered By Science</span></span>
          }
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl border border-[#e8f4e9] relative transition-all duration-500 transform hover:-translate-y-2"
            variants={fadeInUp}
          >
            <LeafPattern />
            <div className="bg-[#f0f7f1] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[#4b7e53] text-3xl">🥗</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Personalized Recipes
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {isLoggedIn
                ? "Find meals perfectly matched to your health profile and dietary preferences. Just search and discover!"
                : "Discover meals that perfectly match your health profile, dietary preferences, and nutritional needs. No more one-size-fits-all solutions."}
            </p>
          </motion.div>
          
          {/* Feature Card 2 */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl border border-[#e8f4e9] relative transition-all duration-500 transform hover:-translate-y-2"
            variants={fadeInUp}
          >
            <LeafPattern />
            <div className="bg-[#f0f7f1] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[#4b7e53] text-3xl">🔬</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Smart Nutrition Analysis
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {isLoggedIn
                ? "Get instant insights on your saved recipes and dietary choices with our advanced nutrition calculator."
                : "Get detailed insights about your meals with advanced nutrition calculations that help you understand exactly what you're eating."}
            </p>
          </motion.div>
          
          {/* Feature Card 3 */}
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl border border-[#e8f4e9] relative transition-all duration-500 transform hover:-translate-y-2"
            variants={fadeInUp}
          >
            <LeafPattern />
            <div className="bg-[#f0f7f1] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-[#4b7e53] text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Health Progress Tracking
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {isLoggedIn
                ? "Track your nutritional journey easily through your personalized dashboard and saved recipes collection."
                : "Monitor your nutritional balance over time with intuitive tracking tools that show your progress toward your wellness goals."}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;