
// ====================================================
// components/sections/ListSection.tsx
// ====================================================

'use client';

import React from 'react';
// import { BannerSection } from '@/types/banner.types';
// import { BannerSection } from '../types/banner';
import { BannerSection } from '@/lib/api/banners.api';

import BannerCard from '../BannerCard';

interface ListSectionProps {
  section: BannerSection;
  isMobile?: boolean;
}

export function ListSection({ section, isMobile = false }: ListSectionProps) {
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.background_color || 'transparent',
    backgroundImage: section.background_gradient || section.background_image 
      ? `${section.background_gradient || ''}, url(${section.background_image || ''})`
      : undefined,
    paddingTop: section.padding?.top || 20,
    paddingBottom: section.padding?.bottom || 20,
    paddingLeft: section.padding?.left || 20,
    paddingRight: section.padding?.right || 20,
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
      <div className="relative z-10 container mx-auto">
        <div className="flex flex-col gap-4">
          {section.banners.map((banner) => (
            <BannerCard key={banner.banner_id} banner={banner} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  );
}