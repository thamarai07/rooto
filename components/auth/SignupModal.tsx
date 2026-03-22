"use client"

import { useState } from "react"
import { Loader2, Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, UserPlus } from "lucide-react"
import { UserData } from "../types"
import { useAuth } from '@/hooks/useAuth'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://rootoportal.onrender.com/api"


interface SignupModalProps {
  onSuccess: (user: UserData) => void
  onSwitchToLogin?: () => void
}

export default function SignupModal({ onSuccess, onSwitchToLogin }: SignupModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)  // 🔥 ADD THIS
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [formErrors, setFormErrors] = useState<any>({})
  const { setUser } = useAuth()

  const handleGoogleLogin = async () => {
    setSocialLoading('google')
    try {
      window.location.href = `${API_BASE}/oauth/google.php`
    } catch (error) {
      console.error('Google login error:', error)
      setError('Failed to login with Google')
      setSocialLoading(null)
    }
  }


  const validateForm = () => {
    const errors: any = {}

    if (!formData.name || formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email address'
    }

    if (!formData.phone || !/^\d{10,15}$/.test(formData.phone)) {
      errors.phone = 'Phone must be 10-15 digits'
    }

    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

// SignupModal.tsx
const getCaptchaToken = async (): Promise<string | null> => {
  try {
    if (!window.grecaptcha) return null
    return new Promise((resolve) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(
            "6LcAV5EsAAAAAMvuJl6MMRfVuTFe2x32aE_0euu7",
            { action: "signup" }
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

      const res = await fetch(`${API_BASE}/register.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          captcha_token: captchaToken
        }),
      })

      const result = await res.json()

      if (result.status === "success") {
        setUser(result.user)   
        onSuccess(result.user)
      } else {
        setError(result.message || "Registration failed. Email or phone may already be in use.")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-sm p-4">
      {/* Header Section */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg mb-2">
          <UserPlus className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-500 text-xs">Join us and start shopping today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-0.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <User className="w-3 h-3" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setFormErrors({ ...formErrors, name: null })
                }}
                placeholder="John Doe"
                className={`w-full pl-8 pr-2 py-1.5 border rounded-sm focus:outline-none focus:ring-1 transition text-xs ${formErrors.name
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
              />
            </div>
            {formErrors.name && (
              <p className="text-red-600 text-xs mt-0.5 flex items-center gap-0.5">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-0.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-3 h-3" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setFormErrors({ ...formErrors, email: null })
                }}
                placeholder="you@example.com"
                className={`w-full pl-8 pr-2 py-1.5 border rounded-sm focus:outline-none focus:ring-1 transition text-xs ${formErrors.email
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
              />
            </div>
            {formErrors.email && (
              <p className="text-red-600 text-xs mt-0.5 flex items-center gap-0.5">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.email}
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Phone & Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Phone Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-0.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Phone className="w-3 h-3" />
              </div>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })
                  setFormErrors({ ...formErrors, phone: null })
                }}
                placeholder="9876543210"
                maxLength={15}
                className={`w-full pl-8 pr-2 py-1.5 border rounded-sm focus:outline-none focus:ring-1 transition text-xs ${formErrors.phone
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
              />
            </div>
            {formErrors.phone && (
              <p className="text-red-600 text-xs mt-0.5 flex items-center gap-0.5">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.phone}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-0.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-3 h-3" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setFormErrors({ ...formErrors, password: null })
                }}
                placeholder="Min. 8 characters"
                className={`w-full pl-8 pr-8 py-1.5 border rounded-sm focus:outline-none focus:ring-1 transition text-xs ${formErrors.password
                  ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            {formErrors.password && (
              <p className="text-red-600 text-xs mt-0.5 flex items-center gap-0.5">
                <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
                {formErrors.password}
              </p>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-0.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock className="w-3 h-3" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value })
                setFormErrors({ ...formErrors, confirmPassword: null })
              }}
              placeholder="Re-enter password"
              className={`w-full pl-8 pr-8 py-1.5 border rounded-sm focus:outline-none focus:ring-1 transition text-xs ${formErrors.confirmPassword
                ? 'border-red-300 focus:ring-red-200 focus:border-red-500'
                : 'border-gray-300 focus:ring-indigo-200 focus:border-indigo-500'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
          {formErrors.confirmPassword && (
            <p className="text-red-600 text-xs mt-0.5 flex items-center gap-0.5">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms Checkbox */}
        <div>
          <label className="flex items-start gap-1 cursor-pointer group">
            <input
              type="checkbox"
              required
              className="w-3 h-3 mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
            />
            <span className="text-xs text-gray-600 group-hover:text-gray-800 transition">
              I agree to the{" "}
              <button type="button" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Terms
              </button>
              {" "}and{" "}
              <button type="button" className="text-indigo-600 hover:text-indigo-700 font-semibold">
                Privacy
              </button>
            </span>
          </label>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1.5 rounded-sm text-xs flex items-start gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 group"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Creating...</span>
            </>
          ) : (
            <>
              <span className="text-sm">Create Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500 font-medium">or</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-xs text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* Trust Badge */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
          Secured with reCAPTCHA
        </p>
      </div>
    </div>
  )
}