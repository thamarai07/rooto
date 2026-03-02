declare global {
    interface Window {
      __selectedLocation?: {
        address: string
        coordinates: { lat: number; lng: number }
      }
      L: any
    }
  }
  
  export {}