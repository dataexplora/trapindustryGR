import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface SimpleCarouselProps {
  children: React.ReactNode[];
  itemsPerView?: number;
  className?: string;
  containerClassName?: string;
  autoScroll?: boolean;
  autoScrollInterval?: number;
}

const SimpleCarousel: React.FC<SimpleCarouselProps> = ({
  children,
  itemsPerView = 3,
  className,
  containerClassName,
  autoScroll = false,
  autoScrollInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Adjust items per view for mobile
  const effectiveItemsPerView = isMobile 
    ? 1 
    : (window.innerWidth < 1024 ? Math.min(2, itemsPerView) : itemsPerView);
  
  // Check if we can go to the next/previous slide
  const canGoNext = currentIndex < children.length - effectiveItemsPerView;
  const canGoPrev = currentIndex > 0;
  
  // Handler functions for navigation
  const goToNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 1);
    } else if (autoScroll) {
      // If autoscrolling, loop back to the beginning
      setCurrentIndex(0);
    }
  };
  
  const goToPrev = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => prev - 1);
    }
  };
  
  // Handle window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Auto scrolling
  useEffect(() => {
    if (autoScroll) {
      timerRef.current = setInterval(() => {
        goToNext();
      }, autoScrollInterval);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [autoScroll, autoScrollInterval, currentIndex]);
  
  return (
    <div className={cn("relative", containerClassName)}>
      <div 
        className={cn(
          "overflow-hidden",
          className
        )}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / effectiveItemsPerView)}%)`,
            width: `${(children.length / effectiveItemsPerView) * 100}%`
          }}
        >
          {children.map((child, i) => (
            <div 
              key={i} 
              className="px-2"
              style={{ width: `${100 / children.length}%` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "bg-slate-800 hover:bg-slate-700 rounded-full h-10 w-10", 
            !canGoPrev && "opacity-50 cursor-not-allowed"
          )}
          onClick={goToPrev}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "bg-slate-800 hover:bg-slate-700 rounded-full h-10 w-10",
            !canGoNext && "opacity-50 cursor-not-allowed"
          )}
          onClick={goToNext}
          disabled={!canGoNext && !autoScroll}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default SimpleCarousel; 