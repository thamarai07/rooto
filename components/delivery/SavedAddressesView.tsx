"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Home, Briefcase, Star, Plus, Trash2, Loader2, Phone, Mail, X, Shield, Clock, ChevronRight } from 'lucide-react'
import { UserData } from '../types'

interface SavedAddress {
  id: number
  customer_id: number
  name: string
  phone: string
  email: string
  flat_no: string
  landmark: string
  full_address: string
  label: 'Home' | 'Work' | 'Other'
  latitude: number
  longitude: number
  is_default: number
  created_at: string
  updated_at: string
}

interface SavedAddressesViewProps {
  userData: UserData
  onSelectAddress: (address: any) => void
  onAddNewAddress: () => void
  onClose: () => void
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://seashell-skunk-617240.hostingersite.com/vfs-admin/api"

export default function SavedAddressesView({
  userData,
  onSelectAddress,
  onAddNewAddress,
  onClose
}: SavedAddressesViewProps) {
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [userData.id])

  const fetchAddresses = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/get_addresses.php?customerId=${userData.id}`)
      const result = await response.json()

      if (result.success) {
        setAddresses(result.data)
        const defaultAddr = result.data.find((addr: SavedAddress) => addr.is_default === 1)
        if (defaultAddr) {
          setSelectedId(defaultAddr.id)
        }
      } else {
        setError(result.message || 'Failed to load addresses')
      }
    } catch (err) {
      console.error('Error fetching addresses:', err)
      setError('Failed to load addresses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAddress = async (addressId: number, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    setDeletingId(addressId)

    try {
      const response = await fetch(`${API_BASE}/delete_address.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressId: addressId,
          customerId: userData.id
        })
      })

      const result = await response.json()

      if (result.success) {
        await fetchAddresses()
        if (selectedId === addressId) {
          setSelectedId(null)
        }
      } else {
        alert(result.message || 'Failed to delete address')
      }
    } catch (err) {
      console.error('Error deleting address:', err)
      alert('Failed to delete address. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const transformAddressForSuccessView = (address: SavedAddress) => {
    return {
      id: address.id,
      name: address.name,
      phoneNumber: address.phone,
      email: address.email,
      flatNo: address.flat_no,
      landmark: address.landmark,
      fullAddress: address.full_address,
      label: address.label,
      coordinates: {
        lat: address.latitude,
        lng: address.longitude
      },
      savedAt: address.created_at || new Date().toISOString(),
      isDefault: address.is_default === 1
    }
  }

  const handleSelectAndProceed = () => {
    const selected = addresses.find(addr => addr.id === selectedId)
    if (selected) {
      const transformedAddress = transformAddressForSuccessView(selected)
      onSelectAddress(transformedAddress)
    } else {
      alert('Please select an address')
    }
  }

  const getLabelIcon = (label: string) => {
    switch (label) {
      case 'Home': return <Home className="w-3.5 h-3.5" />
      case 'Work': return <Briefcase className="w-3.5 h-3.5" />
      case 'Other': return <Star className="w-3.5 h-3.5" />
      default: return <MapPin className="w-3.5 h-3.5" />
    }
  }

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Home': return 'bg-blue-500'
      case 'Work': return 'bg-violet-500'
      case 'Other': return 'bg-amber-500'
      default: return 'bg-gray-500'
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] sm:max-h-[75vh] flex flex-col rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white">Delivery Address</h2>
                <p className="text-xs text-green-100">Choose delivery location</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
          {/* Error */}
          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
              <X className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-xl p-3 border border-gray-100 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-20" />
                      <div className="h-2.5 bg-gray-200 rounded w-full" />
                      <div className="h-2.5 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : addresses.length === 0 ? (
            /* Empty State - Compact */
            <div className="text-center py-8 px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-7 h-7 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No Saved Addresses</h3>
              <p className="text-sm text-gray-500 mb-5">Add your first delivery address</p>
              <button
                onClick={onAddNewAddress}
                className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition"
              >
                <Plus className="w-4 h-4" />
                Add Address
              </button>
            </div>
          ) : (
            /* Address List - Compact */
            <div className="space-y-2">
              {addresses.map((address) => {
                const isSelected = selectedId === address.id

                return (
                  <div
                    key={address.id}
                    onClick={() => setSelectedId(address.id)}
                    className={`bg-white rounded-xl border-2 p-3 cursor-pointer transition-all ${isSelected
                      ? 'border-green-500 bg-green-50/30 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <div className="flex gap-2.5">
                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-lg ${getLabelColor(address.label)} flex items-center justify-center flex-shrink-0 text-white`}>
                        {getLabelIcon(address.label)}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {/* Label & Default Badge */}
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-semibold text-sm text-gray-900">{address.label}</span>
                          {address.is_default === 1 && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Name */}
                        <p className="text-xs font-medium text-gray-700">{address.name}</p>

                        {/* Address - Single line */}
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {address.flat_no}{address.landmark && `, ${address.landmark}`}
                        </p>

                        {/* Contact - Compact inline */}
                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {address.phone}
                          </span>
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{address.email}</span>
                          </span>
                        </div>
                      </div>

                      {/* Selection & Delete */}
                      <div className="flex flex-col items-center justify-between flex-shrink-0">
                        {/* Radio */}
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => handleDeleteAddress(address.id, e)}
                          disabled={deletingId === address.id}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition"
                        >
                          {deletingId === address.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* Add New - Compact */}
              <button
                onClick={onAddNewAddress}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-green-400 rounded-xl text-gray-400 hover:text-green-600 text-sm font-medium flex items-center justify-center gap-1.5 transition hover:bg-green-50/50"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        {!loading && addresses.length > 0 && (
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            {/* Trust Badges - Minimal */}
            <div className="flex items-center justify-center gap-4 mb-2.5 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-green-500" />
                Secure
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-green-500" />
                On-time
              </span>
            </div>

            <button
              onClick={handleSelectAndProceed}
              disabled={!selectedId}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-1.5"
            >
              Deliver Here
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  if (!mounted) return null

  return createPortal(modalContent, document.body)
}