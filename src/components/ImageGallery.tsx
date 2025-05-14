import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  alt: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, alt }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Focus the lightbox when it opens for keyboard navigation
  useEffect(() => {
    if (selectedImageIndex !== null && lightboxRef.current) {
      lightboxRef.current.focus();
    }
  }, [selectedImageIndex]);

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
    // Prevent scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const goToPreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    }
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (selectedImageIndex === null) return;
    
    if (e.key === 'ArrowLeft') {
      setSelectedImageIndex((selectedImageIndex - 1 + images.length) % images.length);
    } else if (e.key === 'ArrowRight') {
      setSelectedImageIndex((selectedImageIndex + 1) % images.length);
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  };

  // Handle touch events for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      goToNextImage({ stopPropagation: () => {} } as React.MouseEvent);
    } else if (isRightSwipe) {
      goToPreviousImage({ stopPropagation: () => {} } as React.MouseEvent);
    }
    
    // Reset touch positions
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Early return if no images
  if (!images || images.length === 0) {
    return <p className="text-center text-gray-400">No gallery images available.</p>;
  }

  return (
    <div>
      {/* Grid Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div 
            key={index} 
            className="rounded-lg overflow-hidden border border-dark-border cursor-pointer"
            onClick={() => openLightbox(index)}
          >
            <img 
              src={image} 
              alt={`${alt} - Gallery ${index + 1}`} 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div 
          ref={lightboxRef}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous button */}
          <button 
            className="absolute left-4 text-white hover:text-gray-300 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
            onClick={goToPreviousImage}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Image container */}
          <div className="max-w-4xl max-h-[80vh] relative">
            <img 
              src={images[selectedImageIndex]} 
              alt={`${alt} - Gallery ${selectedImageIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 text-center text-white py-2 bg-black/50">
              {selectedImageIndex + 1} / {images.length}
            </div>
          </div>

          {/* Next button */}
          <button 
            className="absolute right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
            onClick={goToNextImage}
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageGallery; 