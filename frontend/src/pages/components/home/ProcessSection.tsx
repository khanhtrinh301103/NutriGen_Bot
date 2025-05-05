import { motion } from 'framer-motion';

interface ProcessSectionProps {
  isLoggedIn: boolean;
}

const ProcessSection = ({ isLoggedIn }: ProcessSectionProps) => {
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

  // Content for different user states
  const processSteps = isLoggedIn 
    ? [
        {
          number: '01',
          title: 'Update Your Profile',
          description: 'Keep your health information current to get the most accurate nutrition recommendations.',
          position: 'bottom-4 right-4'
        },
        {
          number: '02',
          title: 'Find New Recipes',
          description: 'Search for meals that match your diet preferences and save them to your collection.',
          position: 'top-4 left-4'
        },
        {
          number: '03',
          title: 'Track Your Progress',
          description: 'Monitor your nutrition journey and see how your saved recipes contribute to your goals.',
          position: 'bottom-4 left-4'
        }
      ]
    : [
        {
          number: '01',
          title: 'Create Your Profile',
          description: 'Tell us about your dietary preferences, health goals, and any restrictions or allergies you have.',
          position: 'bottom-4 right-4'
        },
        {
          number: '02',
          title: 'Discover Recipes',
          description: 'Search our extensive collection of recipes tailored specifically to your unique nutritional needs.',
          position: 'top-4 left-4'
        },
        {
          number: '03',
          title: 'Track Your Journey',
          description: 'Save your favorite recipes and monitor your nutritional progress on your path to wellness.',
          position: 'bottom-4 left-4'
        }
      ];

  return (
    <motion.section 
      className="py-24 bg-[#f8fdf9] relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      {/* Natural flow visual */}
      <div className="absolute left-0 right-0 top-1/2 h-1 bg-[#e1f0e3]"></div>
      
      <div className="container relative">
        <motion.h2 
          className="text-center text-3xl font-bold mb-20"
          variants={fadeInUp}
        >
          {isLoggedIn ? (
            <span>Your <span className="text-[#4b7e53]">Wellness</span> Journey</span>
          ) : (
            <span>Our <span className="text-[#4b7e53]">Natural</span> Process</span>
          )}
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {processSteps.map((step, index) => (
            <motion.div 
              key={index}
              className="text-center relative z-10"
              variants={fadeInUp}
            >
              <div className="bg-white w-20 h-20 rounded-full border-4 border-[#daf1dc] flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <div className="bg-[#f0f7f1] w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-[#4b7e53] text-xl font-bold">{step.number}</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
              
              {/* Decorative leaf */}
              <div className={`absolute ${step.position} text-[#daf1dc] opacity-30`}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20,4,4,0,0,0,12,16a4,4,0,0,0-4-4,4.12,4.12,0,0,0-1,.14l2.39-5.37A28.28,28.28,0,0,1,17,8Z"/>
                </svg>
              </div>
            </motion.div>
          ))}
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

export default ProcessSection;