"use client"

import { useState } from 'react'
import { UserData, SavedAddress } from '../types'
import MapView from './MapView'
import AddressFormView from './AddressFormView'
import SuccessView from './SuccessView'
import SavedAddressesView from './SavedAddressesView'

interface DeliveryModalProps {
  userData: UserData
  currentView: 'saved' | 'map' | 'form' | 'success'
  onViewChange: (view: 'saved' | 'map' | 'form' | 'success') => void
  onAddressComplete: (address: any) => void
  savedAddress: any | null
  onClose: () => void
  onAddressSelected?: () => void  // ✅ ADD THIS LINE
}

export default function DeliveryModal({
  userData,
  currentView,
  onViewChange,
  onAddressComplete,
  savedAddress,
  onClose,
  onAddressSelected
}: DeliveryModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    coordinates: { lat: number; lng: number }
    address: string
  } | null>(null)

  const handleMapProceed = (coords: { lat: number; lng: number }, address: string) => {
    setSelectedLocation({ coordinates: coords, address })
    
    // Set to window for AddressFormView
    window.__selectedLocation = {
      address: address,
      coordinates: coords
    }
    
    onViewChange('form')
  }

  const handleSavedAddressSelect = (address: any) => {
    // User selected existing address - go directly to success
    onAddressComplete(address)
    onAddressSelected?.()  // ✅ ADD THIS LINE
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-5xl my-8">
        {currentView === 'saved' && (
          <SavedAddressesView
            userData={userData}
            onSelectAddress={handleSavedAddressSelect}
            onAddNewAddress={() => onViewChange('map')}
            onClose={onClose}
          />
        )}
        
        {currentView === 'map' && (
          <MapView
            userData={userData}
            onProceed={handleMapProceed}
            onClose={onClose}
          />
        )}
        
        {currentView === 'form' && (
          <AddressFormView
            userData={userData}
            onSave={onAddressComplete}
            onBack={() => onViewChange('map')}
            selectedLocation={selectedLocation}
          />
        )}
        
        {currentView === 'success' && savedAddress && (
          <SuccessView address={savedAddress} onClose={onClose} />
        )}
      </div>
    </div>
  )
}