"use client"

import { MapPin, Phone, Mail, Home, Briefcase, Star, Edit2 } from 'lucide-react'

interface SavedAddress {
  id?: number
  name: string
  phoneNumber: string
  email: string
  flatNo: string
  landmark?: string
  fullAddress: string
  label: 'Home' | 'Work' | 'Other'
  coordinates?: { lat: number; lng: number }
  savedAt?: string
  isDefault?: boolean
}

interface AddressDisplayProps {
  address: SavedAddress
  onChangeAddress?: () => void
  compact?: boolean
}

export default function AddressDisplay({
  address,
  onChangeAddress,
  compact = false
}: AddressDisplayProps) {
  const getLabelIcon = () => {
    switch (address.label) {
      case 'Home': return <Home className="w-6 h-6" />
      case 'Work': return <Briefcase className="w-6 h-6" />
      case 'Other': return <Star className="w-6 h-6" />
      default: return <MapPin className="w-6 h-6" />
    }
  }

  const getLabelColors = () => {
    switch (address.label) {
      case 'Home': return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-500',
        badge: 'bg-blue-50 border-blue-200'
      }
      case 'Work': return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-500',
        badge: 'bg-purple-50 border-purple-200'
      }
      case 'Other': return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        iconBg: 'bg-amber-500',
        badge: 'bg-amber-50 border-amber-200'
      }
      default: return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        iconBg: 'bg-indigo-500',
        badge: 'bg-indigo-50 border-indigo-200'
      }
    }
  }

  const colors = getLabelColors()

  if (compact) {
    return (
      <div className={`border-2 ${colors.border} rounded-xl p-4 ${colors.badge}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.iconBg} text-white`}>
              {getLabelIcon()}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{address.label}</h4>
              <p className="text-sm text-gray-600">{address.name}</p>
            </div>
          </div>
          {onChangeAddress && (
            <button
              onClick={onChangeAddress}
              className="p-1 hover:bg-white rounded-lg transition"
              title="Change address"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        <div className="space-y-1 text-sm text-gray-700">
          <p className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span className="font-medium">{address.flatNo}{address.landmark ? `, ${address.landmark}` : ''}</span>
          </p>
          <p className="text-xs text-gray-600 ml-6">{address.fullAddress}</p>
          <p className="flex items-center gap-2 pt-1">
            <Phone className="w-4 h-4 text-green-600" />
            {address.phoneNumber}
          </p>
        </div>
      </div>
    )
  }

  // Full detailed view
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${colors.iconBg} text-white`}>
            {getLabelIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{address.label}</h3>
            <p className="text-gray-600 font-medium">{address.name}</p>
          </div>
        </div>

        {address.isDefault && (
          <div className="px-4 py-2 rounded-full bg-amber-100 border border-amber-200 text-amber-700 font-bold text-sm">
            ⭐ Default
          </div>
        )}
      </div>

      {/* Address Details */}
      <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-300">
        {/* Street Address */}
        <div className="flex items-start gap-4">
          <div className="p-2 bg-red-100 rounded-lg mt-1">
            <MapPin className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              {address.flatNo}
              {address.landmark && <span className="font-normal text-gray-600">, {address.landmark}</span>}
            </p>
            <p className="text-gray-600 mt-1 text-sm leading-relaxed">{address.fullAddress}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Phone</p>
            <p className="text-gray-800 font-semibold">{address.phoneNumber}</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Email</p>
            <p className="text-gray-800 font-semibold break-all">{address.email}</p>
          </div>
        </div>
      </div>

      {/* GPS Coordinates */}
      {address.coordinates && (
        <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl mb-4">
          <p className="text-xs text-blue-700 font-bold mb-1">📍 GPS Coordinates</p>
          <p className="text-sm text-blue-600 font-mono">
            {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* Saved Date */}
      {address.savedAt && (
        <div className="text-xs text-gray-600 flex items-center gap-2">
          <span>📅</span>
          Saved on {new Date(address.savedAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </div>
      )}

      {/* Change Address Button */}
      {onChangeAddress && (
        <button
          onClick={onChangeAddress}
          className="w-full mt-6 py-3 border-2 border-green-400 rounded-xl hover:bg-green-50 text-green-700 font-bold transition-all flex items-center justify-center gap-2"
        >
          <Edit2 className="w-5 h-5" />
          Change Delivery Address
        </button>
      )}
    </div>
  )
}