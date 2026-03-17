"use client"

import { useState } from 'react'
import { MapPin, Home, Briefcase, Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { UserData, AddressForm, SavedAddress } from '../types'

interface AddressFormViewProps {
  userData: UserData
  onSave: (address: SavedAddress) => void
  onBack: () => void
  selectedLocation?: { coordinates: { lat: number; lng: number }; address: string } | null
}

export default function AddressFormView({
  userData,
  onSave,
  onBack,
  selectedLocation
}: AddressFormViewProps) {
  const locationData: any = selectedLocation || (window as any).__selectedLocation || {}

  const [formData, setFormData] = useState<AddressForm>({
    name: userData.name || '',
    email: userData.email || '',
    phoneNumber: userData.phone || '',
    flatNo: '',
    landmark: '',
    label: 'Home'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    // Validation
    if (!formData.flatNo.trim()) {
      setError('Please enter flat/house number')
      return
    }

    if (!formData.name.trim() || !formData.phoneNumber.trim() || !formData.email.trim()) {
      setError('Please fill all required fields')
      return
    }

    if (!locationData.address || !locationData.coordinates) {
      setError('Location data is missing. Please go back and select a location.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const addressData = {
        customerId: userData.id,
        name: formData.name,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        flatNo: formData.flatNo,
        landmark: formData.landmark,
        fullAddress: locationData.address,
        label: formData.label,
        coordinates: locationData.coordinates,
        isDefault: false // Set to true if you want this as default
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"
      const response = await fetch(`${API_BASE}/save_address.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      })

      const result = await response.json()

      if (result.success) {
        // Create SavedAddress object for parent component
        const savedAddress: SavedAddress = {
          ...formData,
          fullAddress: locationData.address,
          coordinates: locationData.coordinates,
          savedAt: new Date().toISOString()
        }

        // Call parent onSave
        onSave(savedAddress)
      } else {
        setError(result.message || 'Failed to save address')
      }
    } catch (err) {
      console.error('Error saving address:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const labelIcons = {
    Home: <Home className="w-7 h-7" />,
    Work: <Briefcase className="w-7 h-7" />,
    Other: <Star className="w-7 h-7" />
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden max-h-[80vh] overflow-y-auto max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 p-4 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative flex items-center gap-2">
          <button
            onClick={onBack}
            disabled={loading}
            className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Complete Address</h2>
            <p className="text-white/90 mt-0.5 text-sm">For accurate delivery</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs">
            ⚠️ {error}
          </div>
        )}

        {/* Selected Location Card */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 flex gap-2 shadow-sm">
          <div className="bg-green-500/20 p-2 rounded-lg">
            <MapPin className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-gray-700">Delivery Location</p>
            <p className="text-gray-600 mt-0.5 text-xs leading-snug">
              {locationData.address || 'No address selected'}
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          {/* Full Name */}
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={loading}
              className="peer w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 text-sm disabled:opacity-50"
            />
            <label className="absolute left-4 -top-2 px-1 bg-white text-xs font-medium text-green-600 peer-focus:text-green-600 transition-all duration-200">
              Name <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Phone */}
          <div className="relative">
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={loading}
              className="peer w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 text-sm disabled:opacity-50"
            />
            <label className="absolute left-4 -top-2 px-1 bg-white text-xs font-medium text-green-600 peer-focus:text-green-600 transition-all duration-200">
              Phone <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Email */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={loading}
              className="peer w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 text-sm disabled:opacity-50"
            />
            <label className="absolute left-4 -top-2 px-1 bg-white text-xs font-medium text-green-600 peer-focus:text-green-600 transition-all duration-200">
              Email <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Flat No */}
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Flat 301, Building A"
              value={formData.flatNo}
              onChange={(e) => setFormData({ ...formData, flatNo: e.target.value })}
              disabled={loading}
              className="peer w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 text-sm disabled:opacity-50"
            />
            <label className="absolute left-4 -top-2 px-1 bg-white text-xs font-medium text-green-600 peer-focus:text-green-600 transition-all duration-200">
              Flat/House No <span className="text-red-500">*</span>
            </label>
          </div>

          {/* Landmark */}
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Near Park, Opposite Mall"
              value={formData.landmark}
              onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
              disabled={loading}
              className="peer w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all duration-200 text-sm disabled:opacity-50"
            />
            <label className="absolute left-4 -top-2 px-1 bg-white text-xs font-medium text-gray-500 peer-focus:text-green-600 transition-all duration-200">
              Landmark (Opt)
            </label>
          </div>
        </div>

        {/* Address Label Selection */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Save As <span className="text-red-500">*</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['Home', 'Work', 'Other'] as const).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => setFormData({ ...formData, label })}
                disabled={loading}
                className={`relative p-3 rounded-lg border transition-all duration-300 group disabled:opacity-50 ${formData.label === label
                  ? 'border-green-600 bg-green-50 shadow-md scale-105'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                  }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`p-2 rounded-lg transition-colors ${formData.label === label
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                      }`}
                  >
                    {labelIcons[label]}
                  </div>
                  <span
                    className={`font-medium text-sm ${formData.label === label ? 'text-green-700' : 'text-gray-700'
                      }`}
                  >
                    {label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              Save & Continue
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}