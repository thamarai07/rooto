
// app/reset-password/page.tsx
import { Suspense } from "react";
import ResetPasswordPage from "@/components/auth/ResetPasswordPage";

export const metadata = { title: "Reset Password — Rooto" };

export default function Page() {
    return (
        // useSearchParams() inside ResetPasswordPage requires Suspense in Next.js 14+
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ResetPasswordPage />
        </Suspense>
    );
}