
"use client"

import { Check, Copy, MapPin, Home, Briefcase, Star } from 'lucide-react'

// Flexible interface to accept both formats
interface SuccessViewAddress {
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

interface SuccessViewProps {
  address: SuccessViewAddress
  onClose: () => void
  onContinueShopping?: () => void
}

export default function SuccessView({ address, onClose, onContinueShopping }: SuccessViewProps) {
  const handleCopyAddress = () => {
    const addressText = `
Name: ${address.name}
Phone: ${address.phoneNumber}
Email: ${address.email}
Address: ${address.flatNo}${address.landmark ? `, ${address.landmark}` : ''}
${address.fullAddress}
Label: ${address.label}
    `.trim()
    
    navigator.clipboard.writeText(addressText)
    
    // Better user feedback
    const button = document.activeElement as HTMLButtonElement
    const originalText = button.innerHTML
    button.innerHTML = '✓ Copied!'
    button.classList.add('bg-green-50', 'border-green-500', 'text-green-700')
    
    setTimeout(() => {
      button.innerHTML = originalText
      button.classList.remove('bg-green-50', 'border-green-500', 'text-green-700')
    }, 2000)
  }

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
      case 'Home': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', iconBg: 'bg-blue-500' }
      case 'Work': return { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', iconBg: 'bg-purple-500' }
      case 'Other': return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', iconBg: 'bg-amber-500' }
      default: return { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', iconBg: 'bg-indigo-500' }
    }
  }

  const colors = getLabelColors()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[80vh] overflow-y-auto">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-4 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-2">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold mb-1">
            {address.id ? 'Address Selected!' : 'Address Saved Successfully!'}
          </h2>
          <p className="text-sm text-white/90">Ready for delivery 🚀</p>
        </div>

        {/* Main Content */}
        <div className="p-4 space-y-4">
          {/* Address Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${colors.iconBg} text-white`}>
                {getLabelIcon()}
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {address.label}
                </span>
                {address.isDefault && (
                  <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    ⭐ Default
                  </span>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-gray-800 mb-3">{address.name}</h3>

            <div className="space-y-3 text-gray-700 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-xl">📞</span>
                <span className="font-medium">{address.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl">📧</span>
                <span className="font-medium break-all">{address.email}</span>
              </div>

              <div className="flex items-start gap-2 mt-3">
                <div className="p-1 bg-red-100 rounded-lg mt-0.5">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {address.flatNo}
                    {address.landmark && <span className="font-normal text-gray-600">, {address.landmark}</span>}
                  </p>
                  <p className="text-gray-600 mt-0.5 text-xs leading-snug">{address.fullAddress}</p>
                </div>
              </div>

              {address.coordinates && (
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-2xs text-blue-700 font-medium mb-0.5">📍 GPS Coordinates</p>
                  <p className="text-xs text-blue-600 font-mono">
                    {address.coordinates.lat.toFixed(6)}, {address.coordinates.lng.toFixed(6)}
                  </p>
                </div>
              )}

              {address.savedAt && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <p className="text-2xs font-medium text-gray-500 mb-0.5">Saved on</p>
                  <p className="text-xs text-gray-700">
                    {new Date(address.savedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={onContinueShopping || onClose}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              Continue Shopping 🛍️
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onClose}
                className="py-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 font-medium text-sm transition-all duration-200"
              >
                {address.id ? 'Change Address' : 'Add Another'}
              </button>
              <button
                onClick={handleCopyAddress}
                className="py-2 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 font-medium text-sm transition-all duration-200 flex items-center justify-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy Details
              </button>
            </div>
          </div>

          {/* Tip Box */}
          <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg flex items-start gap-2">
            <div className="text-xl">💡</div>
            <p className="text-xs text-green-900 font-medium">
              <strong>Tip:</strong> Manage addresses in profile settings!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}