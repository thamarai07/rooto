// ============================================================================
// Geocoding layer — uses Google Maps Platform when an API key is configured,
// and gracefully falls back to free OpenStreetMap (Nominatim) until then.
//
// Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (Cloudflare Pages env) to switch on the
// accurate Google geocoding + Places autocomplete. Restrict the key by HTTP
// referrer to your domains in the Google Cloud console.
// ============================================================================

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

export const hasGoogleMaps = (): boolean => !!KEY

export interface GeoComponents {
  street: string
  area: string
  city: string
  state: string
  pincode: string
  country: string
}

export interface GeoResult {
  formatted: string
  components: GeoComponents
  coordinates: { lat: number; lng: number }
}

export interface PlacePrediction {
  id: string
  primary: string
  secondary: string
}

const empty: GeoComponents = { street: "", area: "", city: "", state: "", pincode: "", country: "" }

// ── Google Maps JS loader (once) ─────────────────────────────────────────────
let googlePromise: Promise<any> | null = null
function loadGoogle(): Promise<any> {
  if (!KEY) return Promise.reject(new Error("no-key"))
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"))
  if ((window as any).google?.maps) return Promise.resolve((window as any).google)
  if (googlePromise) return googlePromise
  googlePromise = new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&loading=async`
    s.async = true
    s.onload = () => resolve((window as any).google)
    s.onerror = () => { googlePromise = null; reject(new Error("google-load-failed")) }
    document.head.appendChild(s)
  })
  return googlePromise
}

// ── Component parsers ────────────────────────────────────────────────────────
function parseGoogle(result: any): GeoComponents {
  const comps: any[] = result.address_components || []
  const get = (type: string) => comps.find((c) => c.types.includes(type))?.long_name || ""
  const houseNumber = get("street_number")
  const route = get("route")
  const area = get("sublocality_level_1") || get("sublocality") || get("neighborhood") || get("political")
  const city = get("locality") || get("administrative_area_level_2") || get("administrative_area_level_3")
  return {
    street: [houseNumber, route].filter(Boolean).join(" "),
    area,
    city,
    state: get("administrative_area_level_1"),
    pincode: get("postal_code"),
    country: get("country") || "India",
  }
}

function parseNominatim(a: any): GeoComponents {
  if (!a) return { ...empty }
  return {
    street: [a.house_number, a.road || a.pedestrian || a.residential].filter(Boolean).join(" "),
    area: a.neighbourhood || a.suburb || a.quarter || a.village || "",
    city: a.city || a.town || a.municipality || a.county || a.state_district || "",
    state: a.state || "",
    pincode: a.postcode || "",
    country: a.country || "India",
  }
}

// ── Reverse geocode (coords → address) ───────────────────────────────────────
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  if (KEY) {
    try {
      const g = await loadGoogle()
      const geocoder = new g.maps.Geocoder()
      const { results } = await geocoder.geocode({ location: { lat, lng } })
      if (results?.[0]) {
        return { formatted: results[0].formatted_address, components: parseGoogle(results[0]), coordinates: { lat, lng } }
      }
    } catch { /* fall through to Nominatim */ }
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
    const data = await res.json()
    return { formatted: data?.display_name || "", components: parseNominatim(data?.address), coordinates: { lat, lng } }
  } catch {
    return { formatted: "", components: { ...empty }, coordinates: { lat, lng } }
  }
}

// ── Autocomplete (text → predictions) ────────────────────────────────────────
export async function placePredictions(input: string): Promise<PlacePrediction[]> {
  if (!input || input.trim().length < 3) return []
  if (KEY) {
    try {
      const g = await loadGoogle()
      const svc = new g.maps.places.AutocompleteService()
      const preds: any[] = await new Promise((resolve) => {
        svc.getPlacePredictions(
          { input, componentRestrictions: { country: "in" } },
          (r: any[], status: string) => resolve(status === g.maps.places.PlacesServiceStatus.OK && r ? r : [])
        )
      })
      return preds.map((p) => ({
        id: p.place_id,
        primary: p.structured_formatting?.main_text || p.description,
        secondary: p.structured_formatting?.secondary_text || "",
      }))
    } catch { /* fall through */ }
  }
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&countrycodes=IN&limit=5`)
    const data: any[] = await res.json()
    return (data || []).map((d) => ({
      id: `osm:${d.lat},${d.lon}`,
      primary: d.display_name?.split(",")[0] || d.display_name,
      secondary: d.display_name || "",
    }))
  } catch {
    return []
  }
}

// ── Resolve a prediction → coordinates + address ─────────────────────────────
export async function resolvePrediction(p: PlacePrediction): Promise<GeoResult | null> {
  if (p.id.startsWith("osm:")) {
    const [lat, lng] = p.id.slice(4).split(",").map(Number)
    if (!isNaN(lat) && !isNaN(lng)) return reverseGeocode(lat, lng)
    return null
  }
  if (KEY) {
    try {
      const g = await loadGoogle()
      const svc = new g.maps.places.PlacesService(document.createElement("div"))
      const place: any = await new Promise((resolve, reject) => {
        svc.getDetails(
          { placeId: p.id, fields: ["geometry", "formatted_address", "address_components"] },
          (res: any, status: string) => (status === g.maps.places.PlacesServiceStatus.OK && res ? resolve(res) : reject(new Error(status)))
        )
      })
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      return { formatted: place.formatted_address, components: parseGoogle(place), coordinates: { lat, lng } }
    } catch { return null }
  }
  return null
}
