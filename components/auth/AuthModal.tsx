
// components/auth/AuthModal.tsx  ← create this new file
"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import ForgotPasswordModal from "./ForgotPasswordModal";

type AuthView = "login" | "signup" | "forgot";

interface AuthModalProps {
  initialView?: AuthView;
  onSuccess?: (user: any) => void;
  onClose?: () => void;
}

export default function AuthModal({ initialView = "login", onSuccess, onClose }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(initialView);

  return (
    <>
      {view === "login" && (
        <LoginModal
          onSuccess={onSuccess}
          onSwitchToSignup={() => setView("signup")}
          onForgotPassword={() => setView("forgot")}   // ← this is the wire-up
        />
      )}
      {view === "signup" && (
        <SignupModal
          onSuccess={onSuccess}
          onSwitchToLogin={() => setView("login")}
        />
      )}
      {view === "forgot" && (
        <ForgotPasswordModal
          onBack={() => setView("login")}              // ← back button returns to login
        />
      )}
    </>
  );
}