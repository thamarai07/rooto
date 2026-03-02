// components/BannerCard.tsx

'use client';

import React from 'react';
import Image from 'next/image';
import { Banner } from '@/lib/api/banners.api';

interface BannerCardProps {
  banner: Banner;
  isMobile?: boolean;
}

export default function BannerCard({ banner, isMobile = false }: BannerCardProps) {
  const imageUrl = isMobile && banner.mobile_image ? banner.mobile_image : banner.desktop_image;
  
  // Background styling
  const getBackground = () => {
    if (banner.background.type === 'gradient' && banner.background.gradient) {
      return `linear-gradient(${banner.background.gradient.angle}deg, ${banner.background.gradient.color1}, ${banner.background.gradient.color2})`;
    }
    return banner.background.color || 'transparent';
  };
  
  const cardStyle: React.CSSProperties = {
    background: getBackground(),
    color: banner.text_color,
    borderRadius: `${banner.styling.borderRadius}px`,
    boxShadow: `${banner.styling.boxShadow.x}px ${banner.styling.boxShadow.y}px ${banner.styling.boxShadow.blur}px ${banner.styling.boxShadow.spread}px rgba(0,0,0,${banner.styling.boxShadow.opacity})`,
    padding: `${banner.styling.padding.top}px ${banner.styling.padding.right}px ${banner.styling.padding.bottom}px ${banner.styling.padding.left}px`,
    zIndex: banner.styling.zIndex,
    opacity: banner.styling.opacity,
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };
  
  // Animation classes
  const getAnimationClass = () => {
    const classes = [];
    if (banner.animations.hover === 'zoom') classes.push('hover:scale-105');
    if (banner.animations.hover === 'lift') classes.push('hover:-translate-y-2');
    if (banner.animations.click === 'glow') classes.push('active:shadow-lg');
    return classes.join(' ');
  };
  
  return (
    <div 
      className={`relative w-full h-full ${getAnimationClass()}`}
      style={cardStyle}
    >
      {/* Background Image */}
      {imageUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={imageUrl}
            alt={banner.title || 'Banner'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={banner.styling.zIndex > 1}
          />
        </div>
      )}
      
      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Badge */}
        {banner.badge?.text && (
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{
              backgroundColor: banner.badge.color,
              color: '#fff'
            }}
          >
            {banner.badge.text}
          </div>
        )}
        
        {/* Title */}
        {banner.title && (
          <h3 className="text-2xl font-bold mb-2 line-clamp-2">
            {banner.title}
          </h3>
        )}
        
        {/* Subtitle */}
        {banner.subtitle && (
          <p className="text-lg font-medium mb-2 line-clamp-1">
            {banner.subtitle}
          </p>
        )}
        
        {/* Description */}
        {banner.description && (
          <p className="text-sm mb-4 line-clamp-3 opacity-90">
            {banner.description}
          </p>
        )}
        
        {/* CTAs */}
        {banner.ctas && banner.ctas.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            {banner.ctas.map((cta, idx) => (
              <a
                key={idx}
                href={cta.cta_url}
                target={cta.new_tab ? '_blank' : '_self'}
                rel={cta.new_tab ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center px-6 py-2 font-semibold transition-transform hover:scale-105"
                style={{
                  backgroundColor: cta.cta_background,
                  color: cta.cta_color,
                  borderRadius: `${cta.border_radius}px`
                }}
              >
                {cta.cta_text}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}