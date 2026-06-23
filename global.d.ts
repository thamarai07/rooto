declare global {
    interface Window {
      __selectedLocation?: {
        address: string
        coordinates: { lat: number; lng: number }
        components?: Record<string, string>
      }
      L: any
    }
  }
  
  export {}