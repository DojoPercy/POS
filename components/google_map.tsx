"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface GoogleMapsLoaderProps {
  children: React.ReactNode
}

export function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const loadGoogleMaps = () => {
      try {
        // Check if already loaded
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true)
          window.googleMapsLoaded = true
          return
        }

        // Check if script is already being loaded
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
          return
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "YOUR_API_KEY"

        if (apiKey === "YOUR_API_KEY") {
          setError("Google Maps API key not configured")
          return
        }

        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps`
        script.async = true
        script.defer = true

        // Create a unique callback name to avoid conflicts
        const callbackName = `initGoogleMaps_${Date.now()}`

        // Global callback function
        ;(window as any)[callbackName] = () => {
          try {
            setIsLoaded(true)
            window.googleMapsLoaded = true
            console.log("Google Maps API loaded successfully")
          } catch (err) {
            console.error("Error in Google Maps callback:", err)
            setError("Failed to initialize Google Maps")
          }
        }

        // Update script src with unique callback
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`

        script.onerror = () => {
          setError("Failed to load Google Maps API. Please check your internet connection and API key.")
        }

        document.head.appendChild(script)

        // Cleanup function
        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script)
          }
          delete (window as any)[callbackName]
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err)
        setError("An error occurred while loading Google Maps")
      }
    }

    loadGoogleMaps()
  }, [])

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="p-4 text-red-600 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-medium mb-2">Google Maps Error</h3>
          <p className="text-sm">{error}</p>
          {error.includes("API key") && (
            <p className="text-xs mt-2">Please set your NEXT_PUBLIC_GOOGLE_MAPS_API_KEY environment variable.</p>
          )}
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
