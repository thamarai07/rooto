// ====================================================
// components/DynamicBannerRenderer.tsx
// Main orchestrator component
// ====================================================

'use client';

import React from 'react';
// import { BannerSection } from './types/banner';
import { BannerSection } from '@/lib/api/banners.api';
import { HeroSection } from './sections/HeroSection';
import { GridSection } from './sections/GridSection';
import { CarouselSection } from './sections/CarouselSection';
import { MosaicSection } from './sections/MosaicSection';
import { ListSection } from './sections/ListSection';

interface DynamicBannerRendererProps {
  sections: BannerSection[];
  isMobile?: boolean;
}

export default function DynamicBannerRenderer({ 
  sections, 
  isMobile = false 
}: DynamicBannerRendererProps) {
  
  // Render the appropriate section component based on section_type
  const renderSection = (section: BannerSection) => {
    // Skip sections with no banners
    if (!section.banners || section.banners.length === 0) {
      return null;
    }
    
    const key = `section-${section.section_id}`;
    
    switch (section.section_type) {
      case 'hero':
        return <HeroSection key={key} section={section} isMobile={isMobile} />;
      
      case 'grid':
        return <GridSection key={key} section={section} isMobile={isMobile} />;
      
      case 'carousel':
        return <CarouselSection key={key} section={section} isMobile={isMobile} />;
      
      case 'mosaic':
        return <MosaicSection key={key} section={section} isMobile={isMobile} />;
      
      case 'list':
        return <ListSection key={key} section={section} isMobile={isMobile} />;
      
      default:
        // Fallback to grid if unknown type
        return <GridSection key={key} section={section} isMobile={isMobile} />;
    }
  };
  
  // If no sections, show empty state
  if (!sections || sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No banners available</h2>
          <p>Check back later for updates</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {sections.map((section) => renderSection(section))}
    </div>
  );
}