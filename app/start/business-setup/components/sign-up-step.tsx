"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Phone, CheckCircle } from "lucide-react"
import axios from "axios"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface SignUpStepProps {
  formData: any
  updateFormData: (data: any) => void
  nextStep: () => void
}

export function SignUpStep({ formData, updateFormData, nextStep }: SignUpStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpError, setOtpError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"

    if (!formData.password) newErrors.password = "Password is required"
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters"

    if (!formData.phone) newErrors.phone = "Phone number is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otpVerified) {
      // If OTP is already verified, proceed to next step
      nextStep()
      return
    }

    if (otpSent) {
      // If OTP is sent but not verified, verify OTP
      await verifyOtp()
      return
    }

    // Initial form submission - create user and send OTP
    if (validateForm()) {
      await createUserAndSendOtp()
    }
  }

  const createUserAndSendOtp = async () => {
    setIsLoading(true)
    setStatusMessage(null)

    try {
      // Create user account
      const userData = {
        email: formData.email,
        fullname: formData.name,
        password: formData.password,
        role: "owner",
        phone: formData.phone,
        branchId: null,
        status: "active",
      }

      const userResponse = await axios.post("/api/users", userData)
      const newUserId = userResponse.data.user.id

      updateFormData({ userId: newUserId })
      setUserId(newUserId)

     
      await axios.post("/api/send-otp", {
        email: formData.email,
        name: formData.name,
      })

      setOtpSent(true)
      setStatusMessage({
        type: "success",
        message: "Verification code sent to your email",
      })
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: error.response?.data?.message || "Failed to create account. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async () => {
    setIsLoading(true)
    setOtpError(null)

    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      setOtpError("Please enter all 6 digits")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.post("/api/verify-otp", {
        email: formData.email,
        otp: otpValue,
      })

      setOtpVerified(true)
      setStatusMessage({
        type: "success",
        message: "Email verified successfully!",
      })

      // Automatically proceed to next step after short delay
      setTimeout(() => {
        nextStep()
      }, 1500)
    } catch (error: any) {
      setOtpError(error.response?.data?.message || "Invalid verification code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    updateFormData({ [field]: value })
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }

    // Clear error when user types
    if (otpError) {
      setOtpError(null)
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus the last input
      const lastInput = document.getElementById("otp-5")
      if (lastInput) {
        lastInput.focus()
      }
    }
  }

  const resendOtp = async () => {
    setIsLoading(true)
    setStatusMessage(null)

    try {
      await axios.post("/api/send-otp", {
        email: formData.email,
        name: formData.name,
      })

      setStatusMessage({
        type: "success",
        message: "Verification code resent to your email",
      })
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        message: error.response?.data?.message || "Failed to resend code. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Company Owner Sign-Up</h2>
        <p className="text-gray-600 dark:text-gray-300">Enter your personal details to get started</p>
      </div>

      {statusMessage && (
        <Alert
          className={
            statusMessage.type === "success"
              ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900"
              : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900"
          }
        >
          <div className={`mr-2 ${statusMessage.type === "success" ? "text-green-500" : "text-red-500"}`}>
            {statusMessage.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </div>
          <AlertDescription
            className={
              statusMessage.type === "success" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
            }
          >
            {statusMessage.message}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!otpSent ? (
          // Initial sign-up form
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <User className="h-5 w-5" />
                </div>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-10"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Mail className="h-5 w-5" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="pl-10"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Lock className="h-5 w-5" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <Phone className="h-5 w-5" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="pl-10"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            </div>
          </>
        ) : (
          // OTP verification form
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Verify Your Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">We&apos;ve sent a 6-digit verification code to</p>
              <p className="text-sm font-medium">{formData.email}</p>
            </div>

            <div className="space-y-4">
              <Label htmlFor="otp-0" className="text-sm font-medium">
                Enter Verification Code
              </Label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {otpError && <p className="text-sm text-red-500 text-center">{otpError}</p>}

              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Didn&apos;t receive the code?</p>
                <Button type="button" variant="link" onClick={resendOtp} disabled={isLoading} className="text-primary">
                  Resend Code
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isLoading || otpVerified}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : otpSent ? (
              otpVerified ? (
                "Email Verified ✓"
              ) : (
                "Verify Email"
              )
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Missing component from the code
function AlertCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

