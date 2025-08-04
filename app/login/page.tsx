"use client"

import type React from "react"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { setUser } from "@/redux/authSlice"
import { Mail, Lock, Building2, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ClipLoader from "react-spinners/ClipLoader"
import { jwtDecode } from "jwt-decode"
import Image from "next/image"

interface FormData {
  email: string
  password: string
}

interface DecodedToken {
  role: string
  userId?: string
  branchId?: string
  companyId?: string
  [key: string]: any
}

const Login = () => {
  const [formData, setFormData] = useState<FormData>({ email: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [isMatch, setIsMatch] = useState<boolean>(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await axios.post("/api/login", formData)
      if (response.status === 200) {
        const token = response.data.token
        if (!token) throw new Error("Token is missing in the response.")

        localStorage.setItem("token", token)
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

        const decoded: DecodedToken = jwtDecode(token)
        dispatch(setUser({ token, user: decoded }))
 setIsMatch(true)
        router.push("/")
       
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Login failed. Please try again."
      setError(errorMsg)
    } finally {
      setLoading(false)
      
    }
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side - SaaS Platform Image */}
<div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <Image
          src="/loginbg.png"
          alt="Inviting restaurant interior with dining tables"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-12 text-white text-center">
          <h2 className="text-4xl font-extrabold mb-6 leading-tight">
            Streamline Your <br /> Restaurant Chain
          </h2>
          <p className="text-lg mb-10 max-w-md">
            Empower your business with comprehensive management tools, real-time insights, and seamless operations across all your locations.
          </p>
          <div className="space-y-4 text-left w-full max-w-xs">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium">Multi-location Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-medium">Centralized Chain Operations</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="w-4 h-4 bg-white rounded"></div>
              </div>
              <span className="text-base font-medium">Real-time Analytics & Reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo and Brand */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ChainPOS</h1>
            <p className="text-gray-600 mb-1">Restaurant Chain Management Platform</p>
            <p className="text-sm text-gray-500">Sign in to manage your restaurant network</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="your@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || isMatch}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
            >
              {loading || isMatch ? <ClipLoader color="#fff" loading={loading || isMatch} size={20} /> : "Sign in to Dashboard"}
            </Button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Forgot your password?</button>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <p className="text-center text-sm text-gray-500">
                Need access?{" "}
                <button className="text-blue-600 hover:text-blue-700 font-medium">Contact your administrator</button>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">© 2025 ChainPOS. Enterprise restaurant management solution.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
