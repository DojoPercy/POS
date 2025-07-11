"use client"

import { useState } from "react"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AddressAutocomplete } from "./map"

interface LocationSearchProps {
  onSelect: (coords: { lat: number; lng: number }) => void
}

export function LocationSearch({ onSelect }: LocationSearchProps) {
  const [address, setAddress] = useState("")
  const [selectedPlace, setSelectedPlace] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handlePlaceChange = (place: any) => {
    setSelectedPlace(place)
  }

  const getCoordinates = async () => {
    if (!selectedPlace || !window.google?.maps) return

    setIsLoading(true)

    try {
      if (selectedPlace.geometry?.location) {
        const coords = {
          lat: selectedPlace.geometry.location.lat(),
          lng: selectedPlace.geometry.location.lng(),
        }
        onSelect(coords)
        setIsLoading(false)
        return
      }

      if (selectedPlace.place_id) {
        const success = await tryPlaceDetails(selectedPlace.place_id)
        if (success) return
      }

      if (selectedPlace.formatted_address) {
        const success = await tryGeocoding(selectedPlace.formatted_address)
        if (success) return
      }

      if (selectedPlace.name) {
        const success = await tryGeocoding(`${selectedPlace.name}, Ghana`)
        if (success) return
      }

      alert("Could not resolve location")
    } catch (err) {
      console.error("Error resolving location", err)
    } finally {
      setIsLoading(false)
    }
  }

  const tryPlaceDetails = (placeId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const service = new window.google.maps.places.PlacesService(document.createElement("div"))

      service.getDetails(
        {
          placeId: placeId,
          fields: ["geometry"],
        },
        (place: any, status: any) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
            const coords = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            }
            onSelect(coords)
            resolve(true)
          } else {
            resolve(false)
          }
        }
      )
    })
  }

  const tryGeocoding = (address: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder()

      geocoder.geocode(
        {
          address: address,
          componentRestrictions: { country: "GH" },
        },
        (results: any, status: any) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const location = results[0].geometry.location
            const coords = {
              lat: location.lat(),
              lng: location.lng(),
            }
            onSelect(coords)
            resolve(true)
          } else {
            resolve(false)
          }
        }
      )
    })
  }

  return (
    <div className="flex gap-2 items-center w-full">
      <div className="flex-1 relative">
        <AddressAutocomplete
          value={address}
          onChange={setAddress}
          onPlaceChange={handlePlaceChange}
          placeholder="Search for a place in Ghana..."
        />
      </div>
      <Button
        type="button"
        onClick={getCoordinates}
        disabled={isLoading || !selectedPlace}
        className="h-10 w-10 p-0"
        variant="outline"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
      </Button>
    </div>
  )
}
