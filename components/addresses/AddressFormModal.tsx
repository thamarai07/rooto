"use client";

import { useState, useEffect, useRef } from "react";
import { SavedAddress } from "@/app/addresses/page";
import {
    X, MapPin, Home, Briefcase, Heart, Loader2, Navigation,
    CheckCircle2, Truck, AlertCircle, Search,
} from "lucide-react";
import { lookupPincode, PincodeResult } from "@/lib/api/address.api";
import { searchPlaces, reverseGeocode, getCurrentPosition, PlaceSuggestion } from "@/lib/api/geo.api";
import OtpVerify from "./OtpVerify";

interface AddressFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<SavedAddress>) => Promise<void>;
    initialData?: SavedAddress;
    title: string;
}

type FormState = {
    name: string;
    phoneNumber: string;
    email: string;
    flatNo: string;
    streetAddress: string;
    area: string;
    landmark: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    label: "home" | "work" | "other";
    isDefault: boolean;
    phoneVerified: boolean;
    coordinates?: { lat: number; lng: number };
};

const EMPTY: FormState = {
    name: "", phoneNumber: "", email: "", flatNo: "", streetAddress: "", area: "",
    landmark: "", city: "", state: "", pincode: "", country: "India",
    label: "home", isDefault: false, phoneVerified: false,
};

export default function AddressFormModal({ isOpen, onClose, onSubmit, initialData, title }: AddressFormModalProps) {
    const [form, setForm] = useState<FormState>(EMPTY);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // pincode + delivery
    const [pin, setPin] = useState<PincodeResult | null>(null);
    const [checkingPin, setCheckingPin] = useState(false);

    // autocomplete
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [showSug, setShowSug] = useState(false);
    const [searching, setSearching] = useState(false);

    // gps + otp
    const [locating, setLocating] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

    const pinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const sugAbort = useRef<AbortController | null>(null);

    const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

    // ---- hydrate on open ----------------------------------------------------
    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || "",
                phoneNumber: initialData.phoneNumber || "",
                email: initialData.email || "",
                flatNo: initialData.flatNo || "",
                streetAddress: initialData.streetAddress || "",
                area: initialData.area || "",
                landmark: initialData.landmark || "",
                city: initialData.city || "",
                state: initialData.state || "",
                pincode: initialData.pincode || "",
                country: initialData.country || "India",
                label: initialData.label || "home",
                isDefault: initialData.isDefault || false,
                phoneVerified: initialData.phoneVerified || false,
                coordinates: initialData.coordinates,
            });
            if (initialData.pincode?.length === 6) runPincode(initialData.pincode);
        } else {
            setForm(EMPTY);
            setPin(null);
        }
        setErrors({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialData, isOpen]);

    // ---- pincode lookup -----------------------------------------------------
    const runPincode = async (code: string) => {
        setCheckingPin(true);
        const res = await lookupPincode(code);
        setCheckingPin(false);
        setPin(res);
        if (res.success) {
            set({
                city: res.city || form.city,
                state: res.state || form.state,
                country: res.country || "India",
            });
        }
    };

    const onPincodeChange = (raw: string) => {
        const code = raw.replace(/\D/g, "").slice(0, 6);
        set({ pincode: code });
        setPin(null);
        if (pinTimer.current) clearTimeout(pinTimer.current);
        if (code.length === 6) {
            pinTimer.current = setTimeout(() => runPincode(code), 350);
        }
    };

    // ---- autocomplete -------------------------------------------------------
    const onStreetChange = (val: string) => {
        set({ streetAddress: val });
        if (sugTimer.current) clearTimeout(sugTimer.current);
        if (val.trim().length < 3) {
            setSuggestions([]);
            setShowSug(false);
            return;
        }
        sugTimer.current = setTimeout(async () => {
            sugAbort.current?.abort();
            sugAbort.current = new AbortController();
            setSearching(true);
            const results = await searchPlaces(val, sugAbort.current.signal);
            setSearching(false);
            setSuggestions(results);
            setShowSug(results.length > 0);
        }, 500);
    };

    const applyPlace = (p: PlaceSuggestion) => {
        set({
            streetAddress: p.street || p.label.split(",")[0] || form.streetAddress,
            area: p.area || form.area,
            city: p.city || form.city,
            state: p.state || form.state,
            pincode: p.pincode || form.pincode,
            country: p.country || "India",
            coordinates: { lat: p.lat, lng: p.lng },
        });
        setShowSug(false);
        if (p.pincode && /^[1-9][0-9]{5}$/.test(p.pincode)) runPincode(p.pincode);
    };

    // ---- GPS ----------------------------------------------------------------
    const useCurrentLocation = async () => {
        setLocating(true);
        try {
            const { lat, lng } = await getCurrentPosition();
            const place = await reverseGeocode(lat, lng);
            if (place) {
                applyPlace({ ...place, lat, lng });
            } else {
                set({ coordinates: { lat, lng } });
            }
        } catch {
            setErrors((e) => ({ ...e, gps: "Couldn't get your location. Please allow location access." }));
        } finally {
            setLocating(false);
        }
    };

    // ---- phone / otp --------------------------------------------------------
    const onPhoneChange = (raw: string) => {
        const phone = raw.replace(/\D/g, "").slice(0, 10);
        set({ phoneNumber: phone, phoneVerified: false });
    };

    // ---- validation + submit ------------------------------------------------
    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!/^[6-9]\d{9}$/.test(form.phoneNumber)) e.phoneNumber = "Enter a valid 10-digit mobile number";
        if (!form.phoneVerified) e.phoneVerified = "Please verify your mobile number";
        if (!form.flatNo.trim()) e.flatNo = "House / Flat no. is required";
        if (!form.streetAddress.trim()) e.streetAddress = "Street address is required";
        if (!/^[1-9][0-9]{5}$/.test(form.pincode)) e.pincode = "Enter a valid 6-digit pincode";
        if (!form.city.trim()) e.city = "City is required";
        if (!form.state.trim()) e.state = "State is required";
        if (pin && pin.success && pin.serviceable === false) e.pincode = "We don't deliver to this pincode yet";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await onSubmit({ ...form });
        } catch (err) {
            console.error("Error submitting address:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputCls = (err?: string) =>
        `w-full px-4 py-3 border rounded-xl text-[15px] focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition ${
            err ? "border-red-400" : "border-gray-300"
        }`;

    const labelOptions = [
        { value: "home", icon: Home, label: "Home" },
        { value: "work", icon: Briefcase, label: "Work" },
        { value: "other", icon: Heart, label: "Other" },
    ] as const;

    return (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[94vh] sm:max-h-[90vh] flex flex-col animate-sheet">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-5 py-4 text-white flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
                    {/* Use current location */}
                    <button
                        type="button"
                        onClick={useCurrentLocation}
                        disabled={locating}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-green-200 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition disabled:opacity-60"
                    >
                        {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                        {locating ? "Detecting your location…" : "Use my current location"}
                    </button>
                    {errors.gps && <p className="text-red-500 text-xs -mt-3">{errors.gps}</p>}

                    {/* Name */}
                    <Field label="Full Name" required error={errors.name}>
                        <input
                            value={form.name}
                            onChange={(e) => set({ name: e.target.value })}
                            className={inputCls(errors.name)}
                            placeholder="John Doe"
                        />
                    </Field>

                    {/* Phone with OTP */}
                    <Field label="Mobile Number" required error={errors.phoneNumber || errors.phoneVerified}>
                        <div className="flex gap-2">
                            <span className="inline-flex items-center px-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-600 text-sm">+91</span>
                            <input
                                inputMode="numeric"
                                value={form.phoneNumber}
                                onChange={(e) => onPhoneChange(e.target.value)}
                                className={`${inputCls(errors.phoneNumber)} flex-1`}
                                placeholder="9876543210"
                            />
                            {form.phoneVerified ? (
                                <span className="inline-flex items-center gap-1 px-3 rounded-xl bg-green-100 text-green-700 text-sm font-medium whitespace-nowrap">
                                    <CheckCircle2 className="w-4 h-4" /> Verified
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    disabled={!/^[6-9]\d{9}$/.test(form.phoneNumber)}
                                    onClick={() => setShowOtp(true)}
                                    className="px-4 rounded-xl bg-gray-900 text-white text-sm font-medium disabled:opacity-40 whitespace-nowrap"
                                >
                                    Verify
                                </button>
                            )}
                        </div>
                    </Field>

                    {/* Email (optional) */}
                    <Field label="Email (optional)">
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => set({ email: e.target.value })}
                            className={inputCls()}
                            placeholder="john@example.com"
                        />
                    </Field>

                    {/* Flat + Street */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="House / Flat / Building No." required error={errors.flatNo}>
                            <input
                                value={form.flatNo}
                                onChange={(e) => set({ flatNo: e.target.value })}
                                className={inputCls(errors.flatNo)}
                                placeholder="Flat 301, Tower B"
                            />
                        </Field>

                        <Field label="Area / Locality">
                            <input
                                value={form.area}
                                onChange={(e) => set({ area: e.target.value })}
                                className={inputCls()}
                                placeholder="Indiranagar"
                            />
                        </Field>
                    </div>

                    {/* Street with autocomplete */}
                    <div className="relative">
                        <Field label="Street Address" required error={errors.streetAddress}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={form.streetAddress}
                                    onChange={(e) => onStreetChange(e.target.value)}
                                    onFocus={() => suggestions.length && setShowSug(true)}
                                    onBlur={() => setTimeout(() => setShowSug(false), 150)}
                                    className={`${inputCls(errors.streetAddress)} pl-9`}
                                    placeholder="Start typing your street / road…"
                                    autoComplete="off"
                                />
                                {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                            </div>
                        </Field>
                        {showSug && (
                            <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                                {suggestions.map((s, i) => (
                                    <li key={i}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => { e.preventDefault(); applyPlace(s); }}
                                            className="w-full text-left px-4 py-2.5 hover:bg-green-50 flex items-start gap-2 text-sm"
                                        >
                                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <span className="text-gray-700">{s.label}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Landmark */}
                    <Field label="Landmark (optional)">
                        <input
                            value={form.landmark}
                            onChange={(e) => set({ landmark: e.target.value })}
                            className={inputCls()}
                            placeholder="Near City Mall"
                        />
                    </Field>

                    {/* Pincode / City / State */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        <Field label="Pincode" required error={errors.pincode}>
                            <div className="relative">
                                <input
                                    inputMode="numeric"
                                    value={form.pincode}
                                    onChange={(e) => onPincodeChange(e.target.value)}
                                    className={inputCls(errors.pincode)}
                                    placeholder="560001"
                                />
                                {checkingPin && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
                            </div>
                        </Field>
                        <Field label="City" required error={errors.city}>
                            <input
                                value={form.city}
                                onChange={(e) => set({ city: e.target.value })}
                                className={inputCls(errors.city)}
                                placeholder="Bengaluru"
                            />
                        </Field>
                        <Field label="State" required error={errors.state}>
                            <input
                                value={form.state}
                                onChange={(e) => set({ state: e.target.value })}
                                className={inputCls(errors.state)}
                                placeholder="Karnataka"
                            />
                        </Field>
                    </div>

                    {/* Delivery banner */}
                    {pin && pin.success && (
                        <div
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                                pin.serviceable
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : "bg-red-50 text-red-600 border border-red-200"
                            }`}
                        >
                            {pin.serviceable ? <Truck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span>{pin.message}</span>
                        </div>
                    )}

                    {/* Address type */}
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Save address as</p>
                        <div className="grid grid-cols-3 gap-3">
                            {labelOptions.map((opt) => {
                                const Icon = opt.icon;
                                const active = form.label === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => set({ label: opt.value })}
                                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition ${
                                            active ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Default */}
                    <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(e) => set({ isDefault: e.target.checked })}
                            className="w-5 h-5 accent-green-600"
                        />
                        <span className="text-sm font-medium text-gray-700">Set as default delivery address</span>
                    </label>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-4 flex gap-3 bg-white">
                    <button onClick={onClose} className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-[2] flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                    >
                        {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving…</> : "Save Address"}
                    </button>
                </div>
            </div>

            {showOtp && (
                <OtpVerify
                    phone={form.phoneNumber}
                    onVerified={() => { set({ phoneVerified: true }); setShowOtp(false); }}
                    onClose={() => setShowOtp(false)}
                    onSkip={() => { set({ phoneVerified: true }); setShowOtp(false); }}
                />
            )}

            <style jsx>{`
                @keyframes sheet {
                    from { transform: translateY(60px); opacity: 0.4; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-sheet { animation: sheet 0.28s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
}

// Small labelled-field wrapper
function Field({
    label, required, error, children,
}: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}
