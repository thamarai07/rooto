
export interface UserData {
    id: number 
    name: string
    email: string
    phone?: string
  }
  export interface AddressForm {
    flatNo: string;
    landmark: string;
    label: 'Home' | 'Work' | 'Other';
    phoneNumber: string;
    name: string;
    email: string;
  }


export interface SavedAddress {
    id?: number
    name: string
    email: string
    phoneNumber: string
    flatNo: string
    landmark?: string
    fullAddress: string
    label: 'Home' | 'Work' | 'Other'
    coordinates: {
      lat: number
      lng: number
    }
    savedAt: string
  }
  
  export interface AddressForm {
    name: string
    email: string
    phoneNumber: string
    flatNo: string
    landmark: string
    label: 'Home' | 'Work' | 'Other'
  }
  
  

  declare global {
    interface Window {
      L: any;
      grecaptcha: any;
      __selectedLocation?: {
        coordinates: { lat: number; lng: number };
        address: string;
      };
    }
  }