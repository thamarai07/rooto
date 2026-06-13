"use client";

import { useEffect, useRef, useState } from "react";
import { auth } from "@/lib/firebase";
import {
    RecaptchaVerifier,
    signInWithPhoneNumber,
    signOut,
    type ConfirmationResult,
} from "firebase/auth";
import { Loader2, ShieldCheck, X, RefreshCw } from "lucide-react";

interface OtpVerifyProps {
    phone: string;             // 10-digit Indian number
    onVerified: () => void;    // called once OTP is confirmed
    onClose: () => void;       // user dismissed the sheet
    onSkip?: () => void;       // fallback when OTP service is unavailable
}

export default function OtpVerify({ phone, onVerified, onClose, onSkip }: OtpVerifyProps) {
    const [step, setStep] = useState<"sending" | "enter" | "verifying">("sending");
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const [unavailable, setUnavailable] = useState(false);
    const [resendIn, setResendIn] = useState(0);

    const confirmationRef = useRef<ConfirmationResult | null>(null);
    const verifierRef = useRef<RecaptchaVerifier | null>(null);

    // ---- Send OTP -----------------------------------------------------------
    const sendOtp = async () => {
        setStep("sending");
        setError("");
        try {
            if (!verifierRef.current) {
                verifierRef.current = new RecaptchaVerifier(auth, "otp-recaptcha", {
                    size: "invisible",
                });
            }
            const confirmation = await signInWithPhoneNumber(
                auth,
                `+91${phone}`,
                verifierRef.current
            );
            confirmationRef.current = confirmation;
            setStep("enter");
            setResendIn(30);
        } catch (e: any) {
            console.error("OTP send error:", e);
            // Phone auth not enabled / billing / domain not authorised → graceful fallback.
            const code = e?.code || "";
            if (
                code.includes("operation-not-allowed") ||
                code.includes("billing-not-enabled") ||
                code.includes("invalid-app-credential") ||
                code.includes("captcha")
            ) {
                setUnavailable(true);
            }
            setError(
                code.includes("too-many-requests")
                    ? "Too many attempts. Please try again later."
                    : "Couldn't send the code. " +
                      (code.includes("invalid-phone-number") ? "Check the number." : "Please try again.")
            );
            setStep("enter");
        }
    };

    useEffect(() => {
        sendOtp();
        return () => {
            try {
                verifierRef.current?.clear();
            } catch {
                /* noop */
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // resend countdown
    useEffect(() => {
        if (resendIn <= 0) return;
        const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [resendIn]);

    // ---- Verify OTP ---------------------------------------------------------
    const verify = async () => {
        if (code.length !== 6 || !confirmationRef.current) {
            setError("Enter the 6-digit code");
            return;
        }
        setStep("verifying");
        setError("");
        try {
            await confirmationRef.current.confirm(code);
            // We only needed proof of ownership — don't keep the phone session.
            try {
                await signOut(auth);
            } catch {
                /* noop */
            }
            onVerified();
        } catch (e: any) {
            console.error("OTP verify error:", e);
            setError("Incorrect code. Please try again.");
            setStep("enter");
        }
    };

    return (
        <div className="fixed inset-0 z-[10010] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5" />
                        <h3 className="font-bold text-lg">Verify Mobile Number</h3>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-gray-600 mb-1">
                        We sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-gray-900 mb-5">+91 {phone}</p>

                    {step === "sending" ? (
                        <div className="flex items-center gap-2 text-gray-600 py-6 justify-center">
                            <Loader2 className="w-5 h-5 animate-spin" /> Sending code…
                        </div>
                    ) : (
                        <>
                            <input
                                inputMode="numeric"
                                autoFocus
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="••••••"
                                className="w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />

                            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                            <button
                                onClick={verify}
                                disabled={step === "verifying" || code.length !== 6}
                                className="w-full mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
                            >
                                {step === "verifying" ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Verifying…</>
                                ) : (
                                    "Verify & Continue"
                                )}
                            </button>

                            <div className="flex items-center justify-between mt-4 text-sm">
                                <button
                                    onClick={sendOtp}
                                    disabled={resendIn > 0}
                                    className="flex items-center gap-1 text-green-700 disabled:text-gray-400 font-medium"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
                                </button>

                                {unavailable && onSkip && (
                                    <button onClick={onSkip} className="text-gray-500 underline">
                                        Skip for now
                                    </button>
                                )}
                            </div>

                            {unavailable && (
                                <p className="text-xs text-amber-600 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2">
                                    OTP service isn't fully configured yet (enable Phone sign-in + authorise this
                                    domain in Firebase). You can skip verification for now.
                                </p>
                            )}
                        </>
                    )}

                    {/* invisible reCAPTCHA mount point */}
                    <div id="otp-recaptcha" />
                </div>
            </div>

            <style jsx>{`
                @keyframes slideUp {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slideUp { animation: slideUp 0.25s ease-out; }
            `}</style>
        </div>
    );
}
