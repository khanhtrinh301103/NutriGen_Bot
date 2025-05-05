import { useState, useEffect } from 'react';

interface InstructionSliderProps {
  isLoggedIn: boolean;
}

interface SlideData {
  image: string;
  title: string;
  description: string;
}

const InstructionSlider = ({ isLoggedIn }: InstructionSliderProps) => {
  // Nếu người dùng đã đăng nhập, không hiển thị slider
  if (isLoggedIn) {
    return null;
  }

  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  // Dữ liệu slide
  const slides: SlideData[] = [
    {
      image: "/instructions1.png",
      title: "Create Your Account",
      description: "Get started by creating your free account. Sign up with your email or Google to begin your nutrition journey!"
    },
    {
      image: "/instructions2.png",
      title: "Setup Basic Health Info",
      description: "Tell us a little about yourself. Enter your height, weight, age, and gender so we can personalize your experience."
    },
    {
      image: "/instructions3.png",
      title: "Set Your Activity & Goals",
      description: "Choose your lifestyle and goals. We'll calculate your daily calorie needs based on your activity level and goal."
    },
    {
      image: "/instructions4.png",
      title: "Allergies & Dietary Preferences",
      description: "Customize your nutrition experience. Select any allergies or dietary restrictions so we recommend meals just for you."
    },
    {
      image: "/instructions5.png",
      title: "Find Personalized Recipes",
      description: "Discover meals made for you. Search recipes tailored to your nutrition profile and preferences."
    },
    {
      image: "/instructions6.png",
      title: "Join the NutriGen Community",
      description: "Connect and share with others. Post, comment, and explore delicious ideas from our community!"
    }
  ];

  // Auto-play slider
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoplayEnabled && !isAnimating) {
      console.log("🔄 [InstructionSlider] Starting autoplay");
      interval = setInterval(() => {
        setDirection('right');
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
          setIsAnimating(false);
        }, 300);
      }, 6000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
        console.log("🛑 [InstructionSlider] Stopping autoplay");
      }
    };
  }, [autoplayEnabled, slides.length, isAnimating]);

  // Pause autoplay on user interaction
  const pauseAutoplay = () => {
    setAutoplayEnabled(false);
    console.log("⏸️ [InstructionSlider] Paused autoplay due to user interaction");
    
    // Resume autoplay after 15 seconds of inactivity
    setTimeout(() => {
      setAutoplayEnabled(true);
      console.log("▶️ [InstructionSlider] Resumed autoplay after inactivity");
    }, 15000);
  };

  // Navigation functions
  const nextSlide = () => {
    if (isAnimating) return;
    
    setDirection('right');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
      setIsAnimating(false);
    }, 300);
    
    pauseAutoplay();
    console.log(`➡️ [InstructionSlider] Moving to next slide: ${currentSlide === slides.length - 1 ? 0 : currentSlide + 1}`);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    
    setDirection('left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
      setIsAnimating(false);
    }, 300);
    
    pauseAutoplay();
    console.log(`⬅️ [InstructionSlider] Moving to previous slide: ${currentSlide === 0 ? slides.length - 1 : currentSlide - 1}`);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    
    setDirection(index > currentSlide ? 'right' : 'left');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsAnimating(false);
    }, 300);
    
    pauseAutoplay();
    console.log(`🔀 [InstructionSlider] Moving to slide: ${index}`);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 relative inline-block group">
              How to Get Started
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#009B62] transform scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100"></span>
            </h2>
            <div className="h-1 w-16 bg-[#009B62] mx-auto mt-2 rounded-full"></div>
          </div>
          
          {/* Enhanced Slider with animation and hover effects */}
          <div 
            className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
            style={{transform: 'translateY(0)', transition: 'transform 0.3s ease, box-shadow 0.3s ease'}}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
            }}
          >
            {/* Image Display */}
            <div className="relative h-[400px] md:h-[600px] bg-gray-50">
              {/* Current Image with enhanced transitions */}
              {slides.map((slide, index) => (
                <div 
                  key={index}
                  className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                  style={{
                    animation: index === currentSlide 
                      ? `${direction === 'right' ? 'slideInRight' : 'slideInLeft'} 0.5s forwards` 
                      : '',
                  }}
                >
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="w-full h-full object-contain transition-transform duration-700"
                    style={{transform: 'scale(1)', transition: 'transform 0.7s ease'}}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)';
                    }}
                    onError={(e) => {
                      console.error(`❌ [InstructionSlider] Error loading image: ${slide.image}`);
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/800x600?text=NutriGen+Instructions";
                    }}
                  />
                </div>
              ))}
              
              {/* Enhanced Navigation Arrows */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow-md transition-all duration-300 hover:bg-[#009B62] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#009B62] focus:ring-opacity-50"
                style={{transform: 'translateY(-50%) scale(1)', transition: 'all 0.3s ease'}}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
                aria-label="Previous slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white p-2 rounded-full shadow-md transition-all duration-300 hover:bg-[#009B62] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#009B62] focus:ring-opacity-50"
                style={{transform: 'translateY(-50%) scale(1)', transition: 'all 0.3s ease'}}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
                }}
                aria-label="Next slide"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
              
              {/* Enhanced Step indicator */}
              <div 
                className="absolute top-4 left-4 z-20 bg-white px-3 py-1 rounded-full shadow-sm text-sm font-medium transition-all duration-300 hover:bg-[#009B62] hover:text-white"
                style={{opacity: 0, animation: 'fadeIn 0.5s forwards'}}
              >
                Step {currentSlide + 1} of {slides.length}
              </div>
            </div>
            
            {/* Enhanced Caption */}
            <div className="p-4 md:p-6 border-t border-gray-100">
              <h3 
                className="text-xl font-bold text-gray-800 mb-2 transition-all duration-300 hover:text-[#009B62]"
                style={{opacity: 0, animation: 'fadeIn 0.5s forwards 0.2s'}}
              >
                {slides[currentSlide].title}
              </h3>
              <p 
                className="text-gray-600 transition-all duration-500"
                style={{opacity: 0, animation: 'fadeIn 0.5s forwards 0.4s'}}
              >
                {slides[currentSlide].description}
              </p>
            </div>
            
            {/* Enhanced Dots */}
            <div className="p-4 flex justify-center space-x-2 border-t border-gray-100">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 h-2 bg-[#009B62] rounded-full shadow-md' 
                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-[#009B62] hover:opacity-70'
                  }`}
                  style={index === currentSlide ? {animation: 'pulse 1.5s infinite'} : {}}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          {/* Enhanced CTA */}
          <div className="mt-8 text-center">
            <a 
              href="/auth/signup" 
              className="inline-block bg-[#009B62] text-white font-medium py-3 px-8 rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#009B62] focus:ring-opacity-50 hover:bg-[#008553]"
              style={{
                transform: 'translateY(0) scale(1)',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                animation: 'zoomIn 0.5s forwards'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px) scale(1.02)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0) scale(1)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              Create Your Account
            </a>
          </div>
        </div>
      </div>
      
      {/* CSS Animation styles */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
};


export const getServerSideProps = async (context) => {
  return {
    props: {}, // Will be passed to the page component as props
  }
};

export default InstructionSlider;