// ============================================================================
// Geocoding helpers (address autocomplete + reverse geocode for GPS)
// ----------------------------------------------------------------------------
// Uses OpenStreetMap Nominatim — free, no API key required.
// NOTE: Nominatim allows ~1 request/second. Calls are debounced + aborted on
// the client. For high traffic, swap NOMINATIM for Google Places / Mapbox and
// move the key behind the PHP backend.
// ============================================================================

const NOMINATIM = "https://nominatim.openstreetmap.org";

export interface PlaceSuggestion {
    label: string;     // full display name
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    lat: number;
    lng: number;
}

function mapItem(item: any): PlaceSuggestion {
    const a = item.address || {};
    const city =
        a.city || a.town || a.village || a.municipality || a.county || a.state_district || "";
    const area =
        a.suburb || a.neighbourhood || a.locality || a.city_district || a.residential || a.hamlet || "";
    const street = a.road || a.pedestrian || a.footway || a.cycleway || "";

    return {
        label: item.display_name || "",
        street,
        area,
        city,
        state: a.state || "",
        pincode: a.postcode || "",
        country: a.country || "India",
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
    };
}

/** Autocomplete suggestions for a free-text query (India only). */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
    if (!query || query.trim().length < 3) return [];
    const url =
        `${NOMINATIM}/search?format=jsonv2&addressdetails=1&countrycodes=in&limit=6&q=` +
        encodeURIComponent(query);

    try {
        const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data.map(mapItem).filter((p) => p.label) : [];
    } catch {
        return [];
    }
}

/** Reverse geocode GPS coordinates into a structured address. */
export async function reverseGeocode(lat: number, lng: number): Promise<PlaceSuggestion | null> {
    const url = `${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&lat=${lat}&lon=${lng}`;
    try {
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) return null;
        const data = await res.json();
        if (!data || data.error) return null;
        return mapItem(data);
    } catch {
        return null;
    }
}

/** Browser GPS → coordinates (promise wrapper around the Geolocation API). */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            reject(new Error("Location is not supported on this device"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
}
