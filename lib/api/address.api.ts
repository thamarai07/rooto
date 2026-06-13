// ============================================================================
// Address REST client — wraps the PHP endpoints with one typed surface.
// ============================================================================

import { API_BASE } from "@/lib/config";
import { authHeaders } from "@/lib/auth";

// ---- Pincode / delivery ----------------------------------------------------
export interface PincodeResult {
    success: boolean;
    pincode?: string;
    city?: string;
    state?: string;
    country?: string;
    areas?: string[];
    serviceable?: boolean;
    cod_available?: boolean;
    delivery_days?: number;
    estimated_delivery_date?: string | null;
    estimated_delivery_text?: string | null;
    message?: string;
}

/** Resolve city/state + delivery availability + ETA for a pincode. */
export async function lookupPincode(pincode: string): Promise<PincodeResult> {
    try {
        const res = await fetch(
            `${API_BASE}/pincode_lookup.php?pincode=${encodeURIComponent(pincode)}`
        );
        return await res.json();
    } catch {
        return { success: false, message: "Could not check this pincode. Please try again." };
    }
}

// ---- Address CRUD ----------------------------------------------------------
// The payload uses camelCase; the backend also accepts snake_case aliases.
export interface AddressPayload {
    id?: number;
    name: string;
    phoneNumber: string;
    email?: string;
    flatNo?: string;
    streetAddress?: string;
    area?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    label?: string;
    coordinates?: { lat: number; lng: number };
    isDefault?: boolean | number;
    phoneVerified?: boolean | number;
}

const jsonHeaders = () => ({ "Content-Type": "application/json", ...authHeaders() });

export async function getAddresses() {
    const res = await fetch(`${API_BASE}/get_addresses.php`, { headers: authHeaders() });
    return res.json();
}

export async function addAddress(payload: AddressPayload) {
    const res = await fetch(`${API_BASE}/save_address.php`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function updateAddress(payload: AddressPayload) {
    const res = await fetch(`${API_BASE}/update_address.php`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify(payload),
    });
    return res.json();
}

export async function deleteAddress(id: number) {
    const res = await fetch(`${API_BASE}/delete_address.php`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ id }),
    });
    return res.json();
}

export async function setDefaultAddress(id: number) {
    const res = await fetch(`${API_BASE}/set_default_address.php`, {
        method: "POST",
        headers: jsonHeaders(),
        body: JSON.stringify({ id }),
    });
    return res.json();
}
