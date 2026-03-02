
// ====================================================
// components/sections/MosaicSection.tsx
// ====================================================

'use client';

import React from 'react';
// import { BannerSection } from '@/types/banner.types';
// import { BannerSection } from '../types/banner';
import { BannerSection } from '@/lib/api/banners.api';

import BannerCard from '../BannerCard';

interface MosaicSectionProps {
  section: BannerSection;
  isMobile?: boolean;
}

export function MosaicSection({ section, isMobile = false }: MosaicSectionProps) {
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
  
  const gridColumns = isMobile 
    ? section.responsive_columns?.mobile || 2
    : section.responsive_columns?.desktop || section.max_columns || 4;
  
  return (
    <section className="relative w-full" style={sectionStyle}>
      {section.overlay_color && (
        <div className="absolute inset-0 pointer-events-none" style={overlayStyle} />
      )}
      <div className="relative z-10 container mx-auto">
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
            gridAutoRows: 'minmax(150px, auto)',
          }}
        >
          {section.banners.map((banner) => (
            <BannerCard key={banner.banner_id} banner={banner} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </section>
  );
}
