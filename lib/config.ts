// ============================================================
// Centralized App Configuration
// ============================================================
// All environment-specific values go here.
// Import from this file instead of reading process.env directly.

/** Base URL for all PHP API calls. Override via NEXT_PUBLIC_API_BASE in .env.production */
export const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api";

/** Base URL for uploaded product images (strips /api suffix to get the uploads path) */
export const IMAGE_BASE =
    process.env.NEXT_PUBLIC_IMAGE_BASE ||
    `${API_BASE.replace("/api", "")}/assets/images/uploads`;

/** Production domain */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rooto.in";

/** Google reCAPTCHA v3 site key */
export const RECAPTCHA_SITE_KEY =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6Lfm6CYsAAAAAERCxmcRMFBAcyF4_gPnN5a1pVrk";
