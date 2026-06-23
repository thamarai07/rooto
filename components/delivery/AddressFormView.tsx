"use client"

import { useState, useRef } from 'react'
import { MapPin, Home, Briefcase, Star, ChevronLeft, ChevronRight, Loader2, Pencil } from 'lucide-react'
import { UserData, SavedAddress } from '../types'

interface AddressFormViewProps {
  userData: UserData
  onSave: (address: SavedAddress) => void
  onBack: () => void
  selectedLocation?: { coordinates: { lat: number; lng: number }; address: string } | null
}

interface FormState {
  name: string
  email: string
  phoneNumber: string
  flatNo: string
  building: string
  floor: string
  landmark: string
  street: string
  area: string
  city: string
  state: string
  pincode: string
  label: 'Home' | 'Work' | 'Other'
}

export default function AddressFormView({ userData, onSave, onBack, selectedLocation }: AddressFormViewProps) {
  const win = typeof window !== 'undefined' ? (window as any).__selectedLocation : null
  const locationData: any = selectedLocation || win || {}
  const comp: Record<string, string> = win?.components || {}

  const [formData, setFormData] = useState<FormState>({
    name: userData.name || '',
    email: userData.email || '',
    phoneNumber: userData.phone || '',
    flatNo: '',
    building: '',
    floor: '',
    landmark: '',
    // Auto-filled from the map's reverse-geocode (normalised by lib/googleMaps)
    street: comp.street || '',
    area: comp.area || '',
    city: comp.city || '',
    state: comp.state || '',
    pincode: comp.pincode || '',
    label: 'Home',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const errorRef = useRef<HTMLDivElement>(null)
  const set = (k: keyof FormState, v: string) => setFormData(p => ({ ...p, [k]: v }))

  const showError = (msg: string) => {
    setError(msg)
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
  }

  const handleSave = async () => {
    if (!formData.flatNo.trim()) return showError('Please enter your house / flat number')
    if (!formData.name.trim() || !formData.phoneNumber.trim()) return showError('Please add a name and phone number for delivery')
    if (!locationData.coordinates) return showError('Location is missing — please go back and pick it on the map')

    setLoading(true)
    setError('')
    try {
      const streetAddress = [formData.building, formData.floor ? `Floor ${formData.floor}` : '', formData.street]
        .map(s => s.trim()).filter(Boolean).join(', ')

      const parts = [formData.flatNo, streetAddress, formData.area, formData.city, formData.state, formData.pincode]
        .map(s => s.trim()).filter(Boolean)
      let fullAddress = parts.join(', ')
      if (formData.landmark.trim()) fullAddress += ` (Near ${formData.landmark.trim()})`
      if (!fullAddress) fullAddress = locationData.address || ''

      const savedAddress: SavedAddress = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        flatNo: formData.flatNo,
        streetAddress,
        area: formData.area,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        country: 'India',
        landmark: formData.landmark,
        fullAddress,
        label: formData.label,
        coordinates: locationData.coordinates,
        savedAt: new Date().toISOString(),
      }
      onSave(savedAddress)
    } catch {
      showError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const labelIcons = { Home: <Home className="w-5 h-5" />, Work: <Briefcase className="w-5 h-5" />, Other: <Star className="w-5 h-5" /> }
  const field = "peer w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition text-sm disabled:opacity-50"
  const lbl = "absolute left-3 -top-2 px-1 bg-white text-[11px] font-medium text-gray-500"

  return (
    <div className="bg-white sm:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] sm:max-h-[85vh] overflow-y-auto w-full sm:max-w-md mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 text-white flex items-center gap-2 sticky top-0 z-10">
        <button onClick={onBack} disabled={loading} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition disabled:opacity-50">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold leading-tight">Add address details</h2>
          <p className="text-white/90 text-xs">A few details for accurate delivery</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {error && (
          <div ref={errorRef} className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-red-700 text-xs scroll-mt-4">⚠️ {error}</div>
        )}

        {/* Detected location (from the map) */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
          <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-green-700">Pinned location</p>
            <p className="text-xs text-gray-600 leading-snug line-clamp-2">{locationData.address || 'Selected on map'}</p>
          </div>
          <button onClick={onBack} disabled={loading} className="flex items-center gap-1 text-[11px] font-semibold text-green-700 hover:underline flex-shrink-0">
            <Pencil className="w-3 h-3" /> Change
          </button>
        </div>

        {/* House / building */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input className={field} placeholder="e.g. 12B" value={formData.flatNo} onChange={e => set('flatNo', e.target.value)} disabled={loading} />
            <label className={lbl}>House / Flat no <span className="text-red-500">*</span></label>
          </div>
          <div className="relative">
            <input className={field} placeholder="e.g. Floor 3" value={formData.floor} onChange={e => set('floor', e.target.value)} disabled={loading} />
            <label className={lbl}>Floor (opt)</label>
          </div>
        </div>
        <div className="relative">
          <input className={field} placeholder="e.g. Green Residency, Tower A" value={formData.building} onChange={e => set('building', e.target.value)} disabled={loading} />
          <label className={lbl}>Building / Apartment (opt)</label>
        </div>
        <div className="relative">
          <input className={field} placeholder="e.g. Near City Park, opp. SBI" value={formData.landmark} onChange={e => set('landmark', e.target.value)} disabled={loading} />
          <label className={lbl}>Landmark (opt)</label>
        </div>

        {/* Auto-filled area details (editable) */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 space-y-3">
          <p className="text-[11px] font-semibold text-gray-500">Auto-filled from your pin — edit if needed</p>
          <div className="relative">
            <input className={field + " bg-white"} placeholder="Area / Locality" value={formData.area} onChange={e => set('area', e.target.value)} disabled={loading} />
            <label className={lbl}>Area / Locality</label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input className={field + " bg-white"} placeholder="City" value={formData.city} onChange={e => set('city', e.target.value)} disabled={loading} />
              <label className={lbl}>City</label>
            </div>
            <div className="relative">
              <input className={field + " bg-white"} placeholder="Pincode" inputMode="numeric" value={formData.pincode} onChange={e => set('pincode', e.target.value)} disabled={loading} />
              <label className={lbl}>Pincode</label>
            </div>
          </div>
          <div className="relative">
            <input className={field + " bg-white"} placeholder="State" value={formData.state} onChange={e => set('state', e.target.value)} disabled={loading} />
            <label className={lbl}>State</label>
          </div>
        </div>

        {/* Receiver details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <input className={field} placeholder="Name" value={formData.name} onChange={e => set('name', e.target.value)} disabled={loading} />
              <label className={lbl}>Name <span className="text-red-500">*</span></label>
            </div>
            <div className="relative">
              <input className={field} placeholder="Phone" inputMode="tel" value={formData.phoneNumber} onChange={e => set('phoneNumber', e.target.value)} disabled={loading} />
              <label className={lbl}>Phone <span className="text-red-500">*</span></label>
            </div>
          </div>
          <div className="relative">
            <input className={field} placeholder="Email (optional)" value={formData.email} onChange={e => set('email', e.target.value)} disabled={loading} />
            <label className={lbl}>Email (opt)</label>
          </div>
        </div>

        {/* Save as */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-2">Save as</p>
          <div className="grid grid-cols-3 gap-2">
            {(['Home', 'Work', 'Other'] as const).map(label => (
              <button key={label} type="button" onClick={() => set('label', label)} disabled={loading}
                className={`p-3 rounded-xl border transition flex flex-col items-center gap-1 disabled:opacity-50 ${formData.label === label ? 'border-green-600 bg-green-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                <span className={`p-2 rounded-lg ${formData.label === label ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{labelIcons[label]}</span>
                <span className={`text-xs font-medium ${formData.label === label ? 'text-green-700' : 'text-gray-700'}`}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={loading}
          className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-2xl transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <>Save address <ChevronRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  )
}
