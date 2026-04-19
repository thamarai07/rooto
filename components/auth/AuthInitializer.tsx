// components/auth/AuthInitializer.tsx
"use client";

import { useRememberMe } from "@/hooks/useRememberMe";

export default function AuthInitializer() {
  useRememberMe();
  return null; // renders nothing, just runs the hook
}