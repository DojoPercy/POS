"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceChange?: (place: any) => void
  placeholder?: string
  required?: boolean
}

declare global {
  interface Window {
    google: any
    googleMapsLoaded: boolean
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  onPlaceChange,
  placeholder,
  required,
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        return
      }

      try {
        // Clear any existing autocomplete
        if (autocompleteRef.current) {
          try {
            window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
          } catch (err) {
            console.warn("Error clearing autocomplete listeners:", err)
          }
        }

        // Create new autocomplete instance
        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "gh" },
          fields: ["formatted_address", "geometry", "name", "address_components", "place_id", "types"],
        })

        // Add listener for place selection
        autocompleteRef.current.addListener("place_changed", () => {
          try {
            const place = autocompleteRef.current.getPlace()

            if (!place) return

            let displayValue = ""
            if (place.name && place.formatted_address) {
              displayValue = `${place.name}, ${place.formatted_address}`
            } else if (place.name) {
              displayValue = place.name
            } else if (place.formatted_address) {
              displayValue = place.formatted_address
            }

            if (displayValue) {
              onChange(displayValue)
            }

            // Pass the full place object
            if (onPlaceChange) {
              onPlaceChange(place)
            }
          } catch (err) {
            console.error("Error in place_changed listener:", err)
            setError("Error processing selected place")
          }
        })

        setIsLoaded(true)
        setError("")
        console.log("Google Places Autocomplete initialized successfully")
      } catch (err) {
        console.error("Error initializing autocomplete:", err)
        setError("Failed to initialize address suggestions")
      }
    }

    const checkAndInitialize = () => {
      if (window.google?.maps?.places) {
        initializeAutocomplete()
      } else {
        // Wait a bit and try again
        const timeout = setTimeout(checkAndInitialize, 500)
        return () => clearTimeout(timeout)
      }
    }

    checkAndInitialize()

    // Cleanup
    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
        } catch (err) {
          console.warn("Error cleaning up autocomplete:", err)
        }
      }
    }
  }, [onChange, onPlaceChange])

  return (
    <div>
      <Label htmlFor="address">Pickup Location *</Label>
      <Input
        ref={inputRef}
        id="address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search for a place, landmark, or area..."}
        required={required}
        className="w-full"
      />
      {error ? (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      ) : (
        <p className="text-xs text-slate-500 mt-1">
          {isLoaded ? "Search for places, landmarks, malls, hospitals, schools, etc." : "Loading place suggestions..."}
        </p>
      )}
    </div>
  )
}
