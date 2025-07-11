"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MapPin, Clock, Building2 } from "lucide-react"
import axios from "axios"
import { Branch } from '@/app/owner/branches/page';
import { LocationSearch } from "./location_form"
import { GoogleMapsLoader } from "./google_map"
import Image from 'next/image';
import { uploadBase64Image } from "@/lib/cloudnary"

interface BranchFormProps {
  branch?: Branch
  onSuccess: (branch: Branch) => void
  companyId?: string
  userId?: string
  isEdit?: boolean
}

export default function BranchForm({ branch, onSuccess, companyId, userId, isEdit = false }: BranchFormProps) {
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    id: branch?.id || "",
    name: branch?.name || "",
    location: branch?.address || "",
    city: branch?.city || "",
    state: branch?.state || "",
    country: branch?.country || "",
    openingHours: branch?.openingHours || "",
    status: branch?.status || "active",
    imageUrl: branch?.imageUrl || "",
    latitude: branch?.latitude || null,
    longitude: branch?.longitude || null,
    imageBase64: branch?.imageUrl || "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users")
      const managers = response.data.filter((user: any) => user.role === "manager")
      setUsers(managers)
    } catch (err: any) {
      console.error("Failed to fetch users:", err.response?.data?.error || err.message)
    }
  }

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFormData((prev) => ({ ...prev, imageBase64: reader.result as string }))
        }
        reader.readAsDataURL(file)
      }
    }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

     const url = await uploadBase64Image(formData.imageBase64)

    try {
      const payload = {
        ...formData,
        imageUrl: url,
        
        createdBy: userId,
        companyId: companyId,
      }

      let response
      if (isEdit && branch) {
        response = await axios.put(`/api/branches`, payload)
      } else {
        response = await axios.post("/api/branches", payload)
      }

      onSuccess(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} branch. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Building2 className="h-4 w-4" />
          Basic Information
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Branch Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Downtown Branch"
              required
              className="focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
                <div className="space-y-2">
                          <Label htmlFor="image">Image</Label>
                          <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="border-slate-300"
                            required
                          />
                          {formData.imageBase64 && (
                            <div className="mt-2 relative w-32 h-32 rounded-md overflow-hidden border border-slate-300">
                              <Image
                                src={formData.imageBase64 || "/placeholder.svg"}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => handleChange("status", value)} value={formData.status}>
              <SelectTrigger className="focus:border-purple-500 focus:ring-purple-500">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin className="h-4 w-4" />
          Location Details
        </div>
      <div className="relative z-50 overflow-visible">
  <GoogleMapsLoader>
    <LocationSearch
      onSelect={({ lat, lng }) => {
        console.log("Latitude:", lat, "Longitude:", lng)
        // Use in parent state or form
        formData.latitude = lat
        formData.longitude = lng
      }}
    />
  </GoogleMapsLoader>
</div>

    

        <div className="space-y-2">
          <Label htmlFor="location">Address *</Label>
          <Textarea
            id="location"
            value={formData.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="123 Main Street, Suite 100"
            required
            className="focus:border-purple-500 focus:ring-purple-500"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              placeholder="New York"
              required
              className="focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              placeholder="NY"
              className="focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              placeholder="United States"
              required
              className="focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Operations */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="h-4 w-4" />
          Operations
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="openingHours">Opening Hours *</Label>
            <Input
              id="openingHours"
              value={formData.openingHours}
              onChange={(e) => handleChange("openingHours", e.target.value)}
              placeholder="9:00 AM - 10:00 PM"
              required
              className="focus:border-purple-500 focus:ring-purple-500"
            />
          </div>

          
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1 bg-purple-500 hover:bg-purple-600 text-white">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{isEdit ? "Update Branch" : "Create Branch"}</>
          )}
        </Button>
      </div>
    </form>
  )
}
