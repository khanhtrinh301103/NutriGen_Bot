import { motion } from 'framer-motion';

interface MissionSectionProps {
  isLoggedIn: boolean;
}

const MissionSection = ({ isLoggedIn }: MissionSectionProps) => {
  // Animation variants
  const slideIn = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
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
      className="py-20 bg-white relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      {/* Decorative Circle Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#f0f7f1] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#f0f7f1] rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={slideIn} className="order-2 md:order-1">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={isLoggedIn ? "/homepage8.jpg" : "/homepage7.jpg"} 
                  alt="Healthy lifestyle" 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    console.log("❌ [Home] Error loading mission image");
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/600x450?text=Healthy+Lifestyle";
                  }}  
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#daf1dc] rounded-xl z-[-1]"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#4b7e53] opacity-10 rounded-xl z-[-1]"></div>
            </div>
          </motion.div>
          
          <motion.div variants={slideInRight} className="order-1 md:order-2">
            {isLoggedIn ? (
              <>
                <h4 className="text-[#4b7e53] font-semibold uppercase tracking-wider mb-2">Your Wellness Path</h4>
                <h2 className="text-3xl font-bold mb-6">Personalized Nutrition <br/>For Your Lifestyle</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Your profile helps us recommend recipes that align perfectly with your health goals and dietary 
                  preferences. Our intelligent system considers your unique needs to create a balanced nutrition plan.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#4b7e53] text-xl mr-3">✓</span>
                    <span className="text-gray-700">Recipes filtered to match your diet and allergies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4b7e53] text-xl mr-3">✓</span>
                    <span className="text-gray-700">Nutrition calculations based on your health profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4b7e53] text-xl mr-3">✓</span>
                    <span className="text-gray-700">Recipe suggestions that align with your wellness goals</span>
                  </li>
                </ul>
              </>
            ) : (
              <>
                <h4 className="text-[#4b7e53] font-semibold uppercase tracking-wider mb-2">Our Mission</h4>
                <h2 className="text-3xl font-bold mb-6">Bringing Nature's Nutrition <br/>To Your Table</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  At NutriGen Bot, we believe that good nutrition should work in harmony with your body and the planet. 
                  Our intelligent recipe recommendations consider both your personal health needs and sustainable 
                  food practices.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-[#4b7e53] text-xl mr-3">✓</span>
                    <span className="text-gray-700">Personalized nutrition aligned with your health profile</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4b7e53] text-xl mr-3">✓</span>
                    <span className="text-gray-700">Recipes that respect dietary restrictions and allergies</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#4b7e53] text-xl mr-3">✓</span>
                    <span className="text-gray-700">Science-backed nutrition data and insights</span>
                  </li>
                </ul>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default MissionSection;