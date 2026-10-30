// ============================================================================
// Location layer — Google is used for SEARCH ONLY; everything else is free.
//
//   • Search box (autocomplete + picking a result) → Google Places API (New)
//     when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set. Google knows apartment /
//     building names ("Hansa Garden Apartment") that OpenStreetMap doesn't.
//   • Map tiles and pin → address (reverse geocode) → free OpenStreetMap, always.
//     No Google map loads / geocoding calls, so the only billable usage is search.
//
// Autocomplete keystrokes + the pick are grouped into one Google "session"
// (AutocompleteSessionToken), which is billed far cheaper than separate calls.
// If the key is missing, the daily quota is used up, or Google errors, search
// silently falls back to OpenStreetMap (Nominatim).
//
// Google Cloud setup: enable "Maps JavaScript API" + "Places API (New)",
// restrict the key by HTTP referrer to the site's domains, and cap the
// Places API daily quota so the bill can never exceed the free usage.
// ============================================================================

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

export const hasGoogleSearch = (): boolean => !!KEY

export interface GeoComponents {
  street: string
  area: string
  city: string
  state: string
  pincode: string
  country: string
  /** Building / apartment / place name, when the result is one (e.g. "Hansa Garden Apartment"). */
  building?: string
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

// ── Google Maps JS loader (Places library only, once) ────────────────────────
let googlePromise: Promise<any> | null = null
function loadGoogle(): Promise<any> {
  if (!KEY) return Promise.reject(new Error("no-key"))
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"))
  if ((window as any).google?.maps?.places) return Promise.resolve((window as any).google)
  if (googlePromise) return googlePromise
  googlePromise = new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&loading=async`
    s.async = true
    // With `loading=async` the Places classes only exist after importLibrary().
    s.onload = () => {
      const g = (window as any).google
      g.maps.importLibrary("places")
        .then(() => resolve(g))
        .catch((err: unknown) => { googlePromise = null; reject(err) })
    }
    s.onerror = () => { googlePromise = null; reject(new Error("google-load-failed")) }
    document.head.appendChild(s)
  })
  return googlePromise
}

// ── Component parsers ────────────────────────────────────────────────────────
// Google address components, normalised to { long_name, types } (legacy shape).
function parseGoogle(comps: { long_name: string; types: string[] }[]): GeoComponents {
  const get = (type: string) => comps.find((c) => c.types?.includes(type))?.long_name || ""
  return {
    street: [get("street_number"), get("route")].filter(Boolean).join(" "),
    area: get("sublocality_level_1") || get("sublocality") || get("neighborhood"),
    city: get("locality") || get("administrative_area_level_2") || get("administrative_area_level_3"),
    state: get("administrative_area_level_1"),
    pincode: get("postal_code"),
    country: get("country") || "India",
  }
}

// Place types that mean "this result is a specific building / place", not an area or road.
const BUILDING_TYPES = ["premise", "subpremise", "establishment", "point_of_interest"]
const isBuilding = (types?: string[]) => !!types?.some((t) => BUILDING_TYPES.includes(t))

// Google's formatted address leaves out the place name — put it in front: "Hansa Garden Apartment, …".
const withBuilding = (building: string | undefined, formatted: string) =>
  building && !formatted.toLowerCase().startsWith(building.toLowerCase()) ? `${building}, ${formatted}` : formatted

// OSM tags Chennai localities with civic admin units ("Ward 135", "Zone 10 Kodambakkam") —
// useless to a customer or delivery partner, so skip them.
const isAdminUnit = (v?: string) => !!v && /^(ward|zone)\b/i.test(v.trim())
const firstUseful = (...vals: (string | undefined)[]) => vals.find((v) => v && !isAdminUnit(v)) || ""

function parseNominatim(a: any): GeoComponents {
  if (!a) return { ...empty }
  return {
    street: [a.house_number, a.road || a.pedestrian || a.residential].filter(Boolean).join(" "),
    area: firstUseful(a.neighbourhood, a.quarter, a.residential, a.suburb, a.village, a.hamlet),
    city: a.city || a.town || a.municipality || a.county || a.state_district || "",
    state: a.state || "",
    pincode: a.postcode || "",
    country: a.country || "India",
  }
}

// Short, human address from a Nominatim result: "Building, 12 Road, Locality, City 600033".
function formatNominatim(data: any): string {
  const a = data?.address
  if (!a) return data?.display_name || ""
  const c = parseNominatim(a)
  const road = a.road || a.pedestrian || a.residential || ""
  // `name` is the building / shop / landmark under the pin, when OSM knows it.
  const place = data.name && data.name !== road && !isAdminUnit(data.name) ? data.name : ""
  const parts = [place, c.street, c.area, [c.city, c.pincode].filter(Boolean).join(" ")]
  const seen = new Set<string>()
  const out = parts.filter((p) => {
    const key = p.trim().toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
  return out.join(", ") || data.display_name || ""
}

// ── Reverse geocode (coords → address) — free OpenStreetMap ──────────────────
export async function reverseGeocode(lat: number, lng: number): Promise<GeoResult> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
    const data = await res.json()
    return { formatted: formatNominatim(data), components: parseNominatim(data?.address), coordinates: { lat, lng } }
  } catch {
    return { formatted: "", components: { ...empty }, coordinates: { lat, lng } }
  }
}

// ── Google autocomplete session ──────────────────────────────────────────────
// One token per "search → pick" round; reset after a pick so the next search is a new session.
let sessionToken: any = null
// Raw new-API predictions by place id, so the pick can reuse them (keeps the same session).
const newApiPredictions = new Map<string, any>()

function getSessionToken(g: any) {
  if (!sessionToken && g.maps.places.AutocompleteSessionToken) {
    sessionToken = new g.maps.places.AutocompleteSessionToken()
  }
  return sessionToken
}

// ── Autocomplete (text → predictions) ────────────────────────────────────────
// Google cloud projects created after March 2025 can only use the *new* Places API
// (AutocompleteSuggestion / Place); older projects may only have the legacy one.
// Try new → legacy → OpenStreetMap, so search keeps working whatever the key allows.
async function googlePredictionsNew(g: any, input: string): Promise<PlacePrediction[]> {
  const AS = g.maps.places.AutocompleteSuggestion
  if (!AS?.fetchAutocompleteSuggestions) throw new Error("new-places-unavailable")
  const { suggestions } = await AS.fetchAutocompleteSuggestions({
    input,
    includedRegionCodes: ["in"],
    sessionToken: getSessionToken(g),
  })
  newApiPredictions.clear()
  return (suggestions || [])
    .map((s: any) => s.placePrediction)
    .filter(Boolean)
    .map((pp: any) => {
      newApiPredictions.set(pp.placeId, pp)
      return {
        id: pp.placeId,
        primary: pp.mainText?.text || pp.text?.text || "",
        secondary: pp.secondaryText?.text || "",
      }
    })
}

async function googlePredictionsLegacy(g: any, input: string): Promise<PlacePrediction[]> {
  const svc = new g.maps.places.AutocompleteService()
  const preds: any[] = await new Promise((resolve, reject) => {
    svc.getPlacePredictions(
      { input, componentRestrictions: { country: "in" }, sessionToken: getSessionToken(g) },
      (r: any[], status: string) => {
        const S = g.maps.places.PlacesServiceStatus
        if (status === S.OK && r) resolve(r)
        else if (status === S.ZERO_RESULTS) resolve([])
        else reject(new Error(status)) // e.g. REQUEST_DENIED / OVER_QUERY_LIMIT — fall back
      }
    )
  })
  return preds.map((p) => ({
    id: p.place_id,
    primary: p.structured_formatting?.main_text || p.description,
    secondary: p.structured_formatting?.secondary_text || "",
  }))
}

async function osmPredictions(input: string): Promise<PlacePrediction[]> {
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

export async function placePredictions(input: string): Promise<PlacePrediction[]> {
  if (!input || input.trim().length < 3) return []
  if (KEY) {
    try {
      const g = await loadGoogle()
      try { return await googlePredictionsNew(g, input) } catch { /* try legacy */ }
      return await googlePredictionsLegacy(g, input)
    } catch { /* quota used up / key problem — fall through to OpenStreetMap */ }
  }
  return osmPredictions(input)
}

// ── Resolve a prediction → coordinates + address ─────────────────────────────
async function resolveGoogleNew(g: any, placeId: string): Promise<GeoResult> {
  const Place = g.maps.places.Place
  if (!Place) throw new Error("new-places-unavailable")
  // toPlace() keeps the autocomplete session, so the pick is billed as part of it.
  const pp = newApiPredictions.get(placeId)
  const place = pp?.toPlace ? pp.toPlace() : new Place({ id: placeId })
  await place.fetchFields({ fields: ["displayName", "location", "formattedAddress", "addressComponents", "types"] })
  const components = parseGoogle((place.addressComponents || []).map((c: any) => ({ long_name: c.longText, types: c.types })))
  if (isBuilding(place.types) && place.displayName) components.building = place.displayName
  return {
    formatted: withBuilding(components.building, place.formattedAddress || ""),
    components,
    coordinates: { lat: place.location.lat(), lng: place.location.lng() },
  }
}

async function resolveGoogleLegacy(g: any, placeId: string): Promise<GeoResult> {
  const svc = new g.maps.places.PlacesService(document.createElement("div"))
  const place: any = await new Promise((resolve, reject) => {
    svc.getDetails(
      { placeId, fields: ["name", "geometry", "formatted_address", "address_components", "types"], sessionToken },
      (res: any, status: string) => (status === g.maps.places.PlacesServiceStatus.OK && res ? resolve(res) : reject(new Error(status)))
    )
  })
  const components = parseGoogle(place.address_components || [])
  if (isBuilding(place.types) && place.name) components.building = place.name
  return {
    formatted: withBuilding(components.building, place.formatted_address || ""),
    components,
    coordinates: { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() },
  }
}

export async function resolvePrediction(p: PlacePrediction): Promise<GeoResult | null> {
  if (p.id.startsWith("osm:")) {
    const [lat, lng] = p.id.slice(4).split(",").map(Number)
    if (!isNaN(lat) && !isNaN(lng)) return reverseGeocode(lat, lng)
    return null
  }
  if (!KEY) return null
  try {
    const g = await loadGoogle()
    try { return await resolveGoogleNew(g, p.id) } catch { /* try legacy */ }
    return await resolveGoogleLegacy(g, p.id)
  } catch {
    return null
  } finally {
    // The pick ends the billing session — the next search starts a fresh one.
    sessionToken = null
    newApiPredictions.clear()
  }
}
