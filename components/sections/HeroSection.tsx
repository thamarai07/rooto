// ====================================================
// components/sections/HeroSection.tsx
// ====================================================

'use client';

import React from 'react';
// import { BannerSection } from '../types/banner';
import { BannerSection } from '@/lib/api/banners.api';
import BannerCard from '../BannerCard';

interface HeroSectionProps {
  section: BannerSection;
  isMobile?: boolean;
}

export function HeroSection({ section, isMobile = false }: HeroSectionProps) {
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.background_color || 'transparent',
    backgroundImage: section.background_gradient || section.background_image 
      ? `${section.background_gradient || ''}, url(${section.background_image || ''})`
      : undefined,
    paddingTop: section.padding?.top || 0,
    paddingBottom: section.padding?.bottom || 0,
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
  
  return (
    <section className="relative w-full" style={sectionStyle}>
      {section.overlay_color && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}
      <div className="relative z-10">
        {section.banners.map((banner) => (
          <BannerCard key={banner.banner_id} banner={banner} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}
