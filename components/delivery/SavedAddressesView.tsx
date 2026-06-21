"use client"

import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Home, Briefcase, Star, Plus, Trash2, Loader2, X, Check, ChevronRight, Shield } from 'lucide-react'
import { UserData } from '../types'
import { authHeaders } from '@/lib/auth'

interface SavedAddress {
  id: number
  customer_id: number
  name: string
  phone: string
  email: string
  flat_no: string
  street_address?: string
  area?: string
  landmark: string
  city?: string
  state?: string
  pincode?: string
  country?: string
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

// Content signature — identical addresses (saved twice) collapse to one.
const signature = (a: SavedAddress) =>
  [a.name, a.phone, a.flat_no, a.street_address, a.full_address, a.pincode]
    .map((x) => (x ?? '').toString().trim().toLowerCase())
    .join('|')

// Human-friendly single line from the structured fields.
const addressLine = (a: SavedAddress) => {
  const line = [a.flat_no, a.street_address, a.area, a.city, a.state, a.pincode]
    .filter((p) => p && p.toString().trim() !== '')
    .join(', ')
  return line || a.full_address || ''
}

const LABEL = {
  Home: { icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
  Work: { icon: Briefcase, color: 'text-violet-600', bg: 'bg-violet-50' },
  Other: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
} as const

export default function SavedAddressesView({
  userData,
  onSelectAddress,
  onAddNewAddress,
  onClose,
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

  // De-duplicate rows for display.
  const uniqueAddresses = useMemo(() => {
    const keepBetter = (existing: SavedAddress | undefined, a: SavedAddress) =>
      !existing || (a.is_default === 1 && existing.is_default !== 1)

    // 1) Collapse rows that share the same primary key. The API can fan one
    //    address into several same-`id` rows (e.g. a JOIN without DISTINCT),
    //    which made the SAME address appear twice AND show as both-selected
    //    (selectedId === id was true for every copy).
    const byId = new Map<number, SavedAddress>()
    for (const a of addresses) {
      if (keepBetter(byId.get(a.id), a)) byId.set(a.id, a)
    }

    // 2) Collapse content-identical rows saved under different ids
    //    (legacy double-save left duplicates with distinct ids).
    const bySig = new Map<string, SavedAddress>()
    for (const a of byId.values()) {
      const key = signature(a)
      if (keepBetter(bySig.get(key), a)) bySig.set(key, a)
    }

    return Array.from(bySig.values())
  }, [addresses])

  const fetchAddresses = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE}/get_addresses.php`, { headers: authHeaders() })
      const result = await response.json()
      if (result.success) {
        const data: SavedAddress[] = result.data || []
        setAddresses(data)
        const def = data.find((a) => a.is_default === 1) ?? data[0]
        if (def) setSelectedId(def.id)
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

  // Deletes the address AND any identical duplicates in one click.
  const handleDeleteAddress = async (address: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this address?')) return

    const ids = addresses.filter((a) => signature(a) === signature(address)).map((a) => a.id)
    setDeletingId(address.id)
    const prev = addresses
    setAddresses((cur) => cur.filter((a) => !ids.includes(a.id))) // optimistic

    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`${API_BASE}/delete_address.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            // Send both keys — the two call sites historically disagreed on the
            // param name (`id` vs `addressId`); cover whichever the API reads.
            body: JSON.stringify({ id, addressId: id }),
          }).then((r) => r.json()).catch(() => ({ success: false })),
        ),
      )
      if (results.some((r) => !r.success)) {
        setAddresses(prev) // rollback
        alert('Could not delete the address. Please try again.')
      } else {
        if (ids.includes(selectedId ?? -1)) setSelectedId(null)
        await fetchAddresses()
      }
    } catch {
      setAddresses(prev)
      alert('Could not delete the address. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const transformAddressForSuccessView = (a: SavedAddress) => ({
    id: a.id,
    name: a.name,
    phoneNumber: a.phone,
    email: a.email,
    flatNo: a.flat_no,
    streetAddress: a.street_address || '',
    area: a.area || '',
    landmark: a.landmark,
    city: a.city || '',
    state: a.state || '',
    pincode: a.pincode || '',
    country: a.country || 'India',
    fullAddress: a.full_address,
    label: a.label,
    coordinates: { lat: a.latitude, lng: a.longitude },
    savedAt: a.created_at || new Date().toISOString(),
    isDefault: a.is_default === 1,
  })

  const handleSelectAndProceed = () => {
    const selected = uniqueAddresses.find((a) => a.id === selectedId) ?? uniqueAddresses[0]
    if (selected) onSelectAddress(transformAddressForSuccessView(selected))
    else alert('Please select an address')
  }

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-3xl shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[80vh] flex flex-col rounded-t-3xl animate-[slideUp_.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <MapPin className="w-4.5 h-4.5 text-green-600" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">Select delivery address</h2>
              <p className="text-xs text-gray-400">Where should we deliver your order?</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/60">
          {/* Add new address — prominent (Blinkit/Zepto style) */}
          <button
            onClick={onAddNewAddress}
            className="w-full flex items-center gap-3 px-4 py-3 mb-3 bg-white border border-green-200 rounded-2xl hover:bg-green-50/60 transition group"
          >
            <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-green-700 text-sm">Add a new address</span>
            <ChevronRight className="w-4 h-4 text-green-600 ml-auto" />
          </button>

          {error && (
            <div className="mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="space-y-2.5">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-9 h-9 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-2.5 bg-gray-200 rounded w-full" />
                      <div className="h-2.5 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : uniqueAddresses.length === 0 ? (
            <div className="text-center py-10 px-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No saved addresses</h3>
              <p className="text-sm text-gray-500">Add one above to get started.</p>
            </div>
          ) : (
            <>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
                Saved addresses
              </p>
              <div className="space-y-2.5">
                {uniqueAddresses.map((address) => {
                  const isSelected = selectedId === address.id
                  const cfg = LABEL[address.label] ?? LABEL.Other
                  const LabelIcon = cfg.icon
                  return (
                    <div
                      key={address.id}
                      onClick={() => setSelectedId(address.id)}
                      className={`relative bg-white rounded-2xl border-2 p-3.5 cursor-pointer transition-all ${
                        isSelected ? 'border-green-500 shadow-sm' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Radio */}
                        <div
                          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                            isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                              <LabelIcon className="w-3 h-3" />
                              {address.label}
                            </span>
                            {address.is_default === 1 && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-gray-900">{address.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{addressLine(address)}</p>
                          <p className="text-xs text-gray-400 mt-1">Phone: {address.phone}</p>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={(e) => handleDeleteAddress(address, e)}
                          disabled={deletingId === address.id}
                          className="self-start p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                          aria-label="Delete address"
                        >
                          {deletingId === address.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!loading && uniqueAddresses.length > 0 && (
          <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
            <button
              onClick={handleSelectAndProceed}
              disabled={selectedId === null}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-1.5"
            >
              Deliver to this address
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-[11px] text-gray-400">
              <Shield className="w-3 h-3 text-green-500" />
              Safe & secure delivery
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0.6; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
