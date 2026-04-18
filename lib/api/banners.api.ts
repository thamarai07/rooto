// lib/api/banners.api.ts

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api";
const API_BASE_URL = API_BASE;


export interface BannerAPIResponse {
  success: boolean;
  data?: {
    sections: BannerSection[];
    total_sections: number;
    device: string;
    location?: {
      city: string | null;
      pincode: string | null;
    };
  };
  message?: string;
}

export interface BannerSection {
  section_id: number;
  section_name: string;
  section_type: 'hero' | 'grid' | 'carousel' | 'mosaic' | 'list';
  display_order: number;
  background_color?: string;
  background_gradient?: string;
  background_image?: string;
  overlay_color?: string;
  overlay_opacity?: number;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  margin: {
    top: number;
    bottom: number;
  };
  max_columns: number;
  responsive_columns: {
    mobile: number;
    desktop: number;
  };
  banners: Banner[];
}

export interface Banner {
  banner_id: number;
  title: string;
  subtitle?: string;
  description?: string;
  desktop_image: string;
  mobile_image?: string;
  text_color: string;
  background: {
    type: 'solid' | 'gradient' | 'image';
    color?: string;
    gradient?: {
      color1: string;
      color2: string;
      angle: number;
    };
  };
  styling: {
    borderRadius: number;
    boxShadow: {
      x: number;
      y: number;
      blur: number;
      spread: number;
      color: string;
      opacity: number;
    };
    padding: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    zIndex: number;
    opacity: number;
  };
  badge?: {
    text: string;
    color: string;
  };
  animations: {
    hover: string;
    click: string;
  };
  ctas: CTA[];
}

export interface CTA {
  cta_text: string;
  cta_url: string;
  new_tab: boolean;
  cta_color: string;
  cta_background: string;
  border_radius: number;
}

/**
 * Fetch dynamic banners from API
 */
export async function getDynamicBanners(filters: {
  device?: 'desktop' | 'mobile' | 'tablet';
  city?: string | null;
  pincode?: string | null;
  user_segment?: string | null;
}): Promise<BannerAPIResponse> {
  try {
    const params = new URLSearchParams();

    if (filters.device) params.append('device', filters.device);
    if (filters.city) params.append('city', filters.city);
    if (filters.pincode) params.append('pincode', filters.pincode);
    if (filters.user_segment) params.append('user_segment', filters.user_segment);

    const response = await fetch(`${API_BASE_URL}/bannerapi.php?${params.toString()}`, {

      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Error fetching banners:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch banners',
    };
  }
}

/**
 * Get user location (mock - replace with real geolocation)
 */
export async function getUserLocation(): Promise<{ city: string | null; pincode: string | null }> {
  // TODO: Implement real geolocation API
  // For now, return mock data or get from cookies/localStorage
  return {
    city: 'Mumbai',
    pincode: '400001'
  };
}

/**
 * Get user segment (mock - replace with real user data)
 */
export function getUserSegment(): string | null {
  // TODO: Get from user session/profile
  // Possible values: 'new', 'regular', 'premium', 'vip'
  return 'regular';
}