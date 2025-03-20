"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, MapPin, Upload } from "lucide-react"

interface BusinessDetailsStepProps {
  formData: any
  updateFormData: (data: any) => void
  nextStep: () => void
  prevStep: () => void
}

export function BusinessDetailsStep({ formData, updateFormData, nextStep, prevStep }: BusinessDetailsStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const businessCategories = {
    retail: ["Clothing", "Electronics", "Grocery", "Home Goods", "Jewelry", "Other"],
    restaurant: ["Fast Food", "Fine Dining", "Cafe", "Bakery", "Bar", "Other"],
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.businessName) newErrors.businessName = "Business name is required"
    if (!formData.businessType) newErrors.businessType = "Business type is required"
    if (!formData.businessCategory) newErrors.businessCategory = "Business category is required"
    if (!formData.businessAddress) newErrors.businessAddress = "Business address is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      nextStep()
    }
  }

  const handleChange = (field: string, value: any) => {
    updateFormData({ [field]: value })
    // Clear error when user makes a selection
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" })
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      
      reader.onloadend = () => {
        const base64String = reader.result as string
        updateFormData({ businessLogo: base64String }) // Store base64
        setLogoPreview(base64String) // Show preview
      }
  
      reader.readAsDataURL(file) // Convert to Base64
    }
  }
  

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Business Details</h2>
        <p className="text-gray-600 dark:text-gray-300">Tell us about your business</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium">
            Business Name
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <Building className="h-5 w-5" />
            </div>
            <Input
              id="businessName"
              value={formData.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              className="pl-10"
              placeholder="Your Business Name"
            />
          </div>
          {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="businessType" className="text-sm font-medium">
              Business Type
            </Label>
            <Select value={formData.businessType} onValueChange={(value) => handleChange("businessType", value)}>
              <SelectTrigger id="businessType">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
              </SelectContent>
            </Select>
            {errors.businessType && <p className="text-sm text-red-500">{errors.businessType}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessCategory" className="text-sm font-medium">
              Business Category
            </Label>
            <Select
              value={formData.businessCategory}
              onValueChange={(value) => handleChange("businessCategory", value)}
            >
              <SelectTrigger id="businessCategory">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {formData.businessType &&
                  businessCategories[formData.businessType as keyof typeof businessCategories].map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.businessCategory && <p className="text-sm text-red-500">{errors.businessCategory}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessLogo" className="text-sm font-medium">
            Business Logo
          </Label>
          <div className="flex items-center space-x-4">
            <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              {logoPreview ? (
                <img
                  src={logoPreview || "/placeholder.svg"}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <Input id="businessLogo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("businessLogo")?.click()}
                className="w-full"
              >
                Upload Logo
              </Button>
              <p className="text-xs text-gray-500 mt-1">Recommended size: 512x512px. Max 2MB.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessAddress" className="text-sm font-medium">
            Business Address
          </Label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <MapPin className="h-5 w-5" />
            </div>
            <Input
              id="businessAddress"
              value={formData.businessAddress}
              onChange={(e) => handleChange("businessAddress", e.target.value)}
              className="pl-10"
              placeholder="123 Business St, City, Country"
            />
          </div>
          {errors.businessAddress && <p className="text-sm text-red-500">{errors.businessAddress}</p>}
        </div>

        <div className="flex justify-between pt-4">
          
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  )
}

