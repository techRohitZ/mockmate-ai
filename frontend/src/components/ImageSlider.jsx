import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Master Tech Interviews',
      description: 'Practice with AI that simulates real interview scenarios',
      gradient: 'from-teal-700 to-cyan-500',
      icon: '🎤',
    },
    {
      title: 'Coding Challenges',
      description: 'Solve problems with integrated Monaco code editor',
      gradient: 'from-cyan-700 to-teal-500',
      icon: '💻',
    },
    {
      title: 'Instant Feedback',
      description: 'Get real-time evaluation and actionable insights',
      gradient: 'from-amber-500 to-orange-400',
      icon: '⚡',
    },
    {
      title: 'Track Progress',
      description: 'Monitor your improvement with detailed analytics',
      gradient: 'from-slate-700 to-teal-500',
      icon: '📈',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full h-80 md:h-96 rounded-2xl overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute w-full h-full bg-gradient-to-br ${slide.gradient} transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="h-full flex flex-col items-center justify-center px-6 text-white text-center">
              <div className="text-7xl mb-6">{slide.icon}</div>
              <h3 className="text-4xl font-bold mb-4">{slide.title}</h3>
              <p className="text-xl text-white/90 max-w-2xl">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-all z-10 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 transition-all z-10 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
