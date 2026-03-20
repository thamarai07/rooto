"use client"

import { useState } from "react"
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { UserData } from "../types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"


interface LoginModalProps {
  onSuccess: (user: UserData) => void
  onSwitchToSignup?: () => void
}

export default function LoginModal({ onSuccess, onSwitchToSignup }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [showEmailForm, setShowEmailForm] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [formErrors, setFormErrors] = useState<any>({})

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider)

    try {
      // Different approaches based on provider
      switch (provider) {
        case 'google':
          await handleGoogleLogin()
          break

      }
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setError(`Failed to login with ${provider}`)
    } finally {
      setSocialLoading(null)
    }
  }


  // 🔥 Google Login (using Google One Tap)
  const handleGoogleLogin = async () => {
    // Option 1: Redirect to backend OAuth endpoint
    window.location.href = `${API_BASE}/oauth/google.php`

    // Option 2: Use Google Identity Services (recommended)
    // This requires Google's JavaScript SDK loaded in your app
  }



  const getCaptchaToken = async (): Promise<string | null> => {
    try {
      if (!window.grecaptcha) return null
      return new Promise((resolve) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(
              "6Lfm6CYsAAAAAERCxmcRMFBAcyF4_gPnN5a1pVrk",
              { action: "login" }
            )
            resolve(token)
          } catch (err) {
            resolve(null)
          }
        })
      })
    } catch {
      return null
    }
  }

  const validateForm = () => {
    const errors: any = {}

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address'
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      const captchaToken = await getCaptchaToken()

      if (!captchaToken) {
        setError("Security verification failed. Please try again.")
        setIsLoading(false)
        return
      }

      const res = await fetch(`${API_BASE}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          captcha_token: captchaToken
        }),
      })

      const result = await res.json()

      if (result.status === "success") {
        localStorage.setItem("user", JSON.stringify(result.user))
        onSuccess(result.user)
      } else {
        setError(result.message || "Invalid email or password")
      }
    } catch (err) {
      setError("Network error. Please try again.")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleView = () => {
    setShowEmailForm(!showEmailForm)
    setError(null)
    setFormErrors({})
    setFormData({ email: '', password: '' })
    setShowPassword(false)
  }

  return (
    <div className="w-full max-w-sm bg-white p-5">
      {/* Header Section */}
      <div className="text-center mb-6">

        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-1">Sign in to continue shopping</p>
      </div>



      {/* Conditional Content: Social or Email Form */}
      {showEmailForm ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setFormErrors({ ...formErrors, email: null })
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-1 transition ${formErrors.email
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
                    }`}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    setFormErrors({ ...formErrors, password: null })
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-1 transition ${formErrors.password
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                    : 'border-gray-300 focus:ring-green-200 focus:border-green-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                  {formErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-3.5 h-3.5 rounded border-gray-300 text-green-600 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-gray-600 group-hover:text-gray-800 transition">Remember me</span>
              </label>
              <button
                type="button"
                className="text-xs text-green-600 font-semibold hover:text-green-700 transition"
              >
                Forgot password?
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5">
                <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 group"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Signing in...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <p className="text-xs text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-green-600 font-semibold hover:text-green-700 hover:underline transition"
              >
                Create Account
              </button>
            </p>
          </div>
        </>

      ) : (
        /* Social Buttons - Hide Email Form */
        <div className="space-y-2">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            disabled={socialLoading !== null}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg font-medium text-gray-700 text-sm transition disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </>
            )}
          </button>




          {/* Sign Up Link - In Social View */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={onSwitchToSignup}
                className="text-green-600 font-semibold hover:text-green-700 hover:underline transition"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Trust Badge */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          Secured with reCAPTCHA
        </p>
      </div>
    </div>
  )
}