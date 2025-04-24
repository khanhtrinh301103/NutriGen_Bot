import Layout from "./components/common/layout";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from "../api/useAuth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../api/firebaseConfig";
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // Rotating image gallery for the hero section
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideImages = [
    "/homepage1.jpg",
    "/homepage2.jpg",
    "/homepage3.jpg",
    "/homepage4.jpg",
    "/homepage5.jpg",
  ];

  // Auto slide change effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slideImages.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

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

  // Card with leaf pattern SVG
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

  return (
    <Layout>
      {/* Nature-inspired Hero Section */}
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
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="text-white">
            <path fill="currentColor" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      </section>

      {/* Mission Statement with Organic Design */}
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
                    src="/homepage7.jpg" 
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
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Green-Inspired Features */}
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
            Nutrition From Nature, <span className="text-[#4b7e53]">Powered By Science</span>
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
                Discover meals that perfectly match your health profile, dietary preferences, 
                and nutritional needs. No more one-size-fits-all solutions.
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
                Get detailed insights about your meals with advanced nutrition calculations 
                that help you understand exactly what you're eating.
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
                Monitor your nutritional balance over time with intuitive tracking 
                tools that show your progress toward your wellness goals.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* How It Works - Nature Process Flow */}
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
            Our <span className="text-[#4b7e53]">Natural</span> Process
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div 
              className="text-center relative z-10"
              variants={fadeInUp}
            >
              <div className="bg-white w-20 h-20 rounded-full border-4 border-[#daf1dc] flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <div className="bg-[#f0f7f1] w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-[#4b7e53] text-xl font-bold">01</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-700">Tell us about your dietary preferences, health goals, and any restrictions or allergies you have.</p>
              
              {/* Decorative leaf */}
              <div className="absolute -bottom-4 -right-4 text-[#daf1dc] opacity-30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20,4,4,0,0,0,12,16a4,4,0,0,0-4-4,4.12,4.12,0,0,0-1,.14l2.39-5.37A28.28,28.28,0,0,1,17,8Z"/>
                </svg>
              </div>
            </motion.div>
            
            {/* Step 2 */}
            <motion.div 
              className="text-center relative z-10"
              variants={fadeInUp}
            >
              <div className="bg-white w-20 h-20 rounded-full border-4 border-[#daf1dc] flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <div className="bg-[#f0f7f1] w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-[#4b7e53] text-xl font-bold">02</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Discover Recipes</h3>
              <p className="text-gray-700">Search our extensive collection of recipes tailored specifically to your unique nutritional needs.</p>
              
              {/* Decorative leaf */}
              <div className="absolute -top-4 -left-4 text-[#daf1dc] opacity-30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20,4,4,0,0,0,12,16a4,4,0,0,0-4-4,4.12,4.12,0,0,0-1,.14l2.39-5.37A28.28,28.28,0,0,1,17,8Z"/>
                </svg>
              </div>
            </motion.div>
            
            {/* Step 3 */}
            <motion.div 
              className="text-center relative z-10"
              variants={fadeInUp}
            >
              <div className="bg-white w-20 h-20 rounded-full border-4 border-[#daf1dc] flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                <div className="bg-[#f0f7f1] w-16 h-16 rounded-full flex items-center justify-center">
                  <span className="text-[#4b7e53] text-xl font-bold">03</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3">Track Your Journey</h3>
              <p className="text-gray-700">Save your favorite recipes and monitor your nutritional progress on your path to wellness.</p>
              
              {/* Decorative leaf */}
              <div className="absolute -bottom-4 -left-4 text-[#daf1dc] opacity-30">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20,4,4,0,0,0,12,16a4,4,0,0,0-4-4,4.12,4.12,0,0,0-1,.14l2.39-5.37A28.28,28.28,0,0,1,17,8Z"/>
                </svg>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section with Natural Background */}
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
        </div>
      </motion.section>
    </Layout>
  );
}