
// ====================================================
// components/sections/CarouselSection.tsx
// ====================================================

'use client';

import React, { useRef, useState } from 'react';
import BannerCard from '../BannerCard';
// import { BannerSection } from '../types/banner';
import { BannerSection } from '@/lib/api/banners.api';


interface CarouselSectionProps {
  section: BannerSection;
  isMobile?: boolean;
}

export function CarouselSection({ section, isMobile = false }: CarouselSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.background_color || 'transparent',
    backgroundImage: section.background_gradient || section.background_image 
      ? `${section.background_gradient || ''}, url(${section.background_image || ''})`
      : undefined,
    paddingTop: section.padding?.top || 20,
    paddingBottom: section.padding?.bottom || 20,
    paddingLeft: section.padding?.left || 0,
    paddingRight: section.padding?.right || 0,
    marginTop: section.margin?.top || 0,
    marginBottom: section.margin?.bottom || 0,
  };
  
  const overlayStyle: React.CSSProperties = section.overlay_color
    ? {
        backgroundColor: section.overlay_color,
        opacity: section.overlay_opacity || 0,
      }
    : {};
  
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  
  // Get items to show based on device
  const itemsPerView = isMobile 
    ? section.responsive_columns?.mobile || 2
    : section.responsive_columns?.desktop || section.max_columns || 6;
  
  return (
    <section className="relative w-full" style={sectionStyle}>
      {section.overlay_color && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}
      <div className="relative z-10 container mx-auto">
        <div className="relative">
          {/* Left Arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-4"
            style={{
              scrollSnapType: 'x mandatory',
            }}
          >
            {section.banners.map((banner) => (
              <div
                key={banner.banner_id}
                className="flex-shrink-0"
                style={{
                  width: `calc((100% - ${(itemsPerView - 1) * 16}px) / ${itemsPerView})`,
                  scrollSnapAlign: 'start',
                }}
              >
                <BannerCard banner={banner} isMobile={isMobile} />
              </div>
            ))}
          </div>
          
          {/* Right Arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}