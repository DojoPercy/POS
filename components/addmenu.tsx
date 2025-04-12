"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClipLoader } from "react-spinners"
import { fetchMenuCategoriesOfCompany } from "@/redux/CompanyCategoryMenuSlice"
import { Plus, Trash2 } from "lucide-react"
import { uploadBase64Image } from "@/lib/cloudnary"

interface PriceOption {
  name: string
  price: string
}

interface MenuItemFormData {
  name: string
  description: string
  prices: PriceOption[]
  imageBase64: string
  imageUrl: string
  categoryId: string
}

export default function AddMenuItemForm({ companyId, onAddItem }: { companyId: string; onAddItem: () => void }) {
  const dispatch = useDispatch()
  const { categories, status, error } = useSelector((state: any) => state.menuCategories)

  useEffect(() => {
    console.log("company:", companyId)
    if (companyId) {
      dispatch(fetchMenuCategoriesOfCompany(companyId))
    }
  }, [companyId, dispatch])

  const [formData, setFormData] = useState<MenuItemFormData>({
    name: "",
    description: "",
    prices: [{ name: "Regular", price: "" }], // Default price option
    imageBase64: "",
    imageUrl: "",
    categoryId: "",
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePriceChange = (index: number, field: "name" | "price", value: string) => {
    setFormData((prev) => {
      const updatedPrices = [...prev.prices]
      updatedPrices[index] = { ...updatedPrices[index], [field]: value }
      return { ...prev, prices: updatedPrices }
    })
  }

  const addPriceOption = () => {
    setFormData((prev) => ({
      ...prev,
      prices: [...prev.prices, { name: "", price: "" }],
    }))
  }

  const removePriceOption = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData((prev) => {
        const updatedPrices = [...prev.prices]
        updatedPrices.splice(index, 1)
        return { ...prev, prices: updatedPrices }
      })
    }
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
    setFormError(null)

    // Validate prices
    if (formData.prices.some((p) => !p.name || !p.price)) {
      setFormError("All price options must have both a name and price")
      setLoading(false)
      return
    }

    try {
      // Format prices for API
      const formattedPrices = formData.prices.map((p) => ({
        name: p.name,
        price: Number.parseFloat(p.price),
      }))

      const url =  await uploadBase64Image(formData.imageBase64);
      console.log("Image URL:", url)
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          prices: formattedPrices,
          categoryId: formData.categoryId,
          imageUrl: url,
          companyId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add menu item")
      }

      setSuccessMessage("Menu item added successfully")
      setTimeout(() => setSuccessMessage(null), 2000)

      // Reset form
      setFormData({
        name: "",
        description: "",
        prices: [{ name: "Regular", price: "" }],
        imageBase64: "",
        imageUrl: "",
        categoryId: "",
      })

      onAddItem()
    } catch (err: any) {
      setFormError(err.message || "An error occurred while adding the menu item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Add Menu Item</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <Label>Price Options</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPriceOption}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Price
              </Button>
            </div>

            {formData.prices.map((price, index) => (
              <div key={index} className="flex gap-2 items-start mb-2">
                <div className="flex-1">
                  <Label htmlFor={`price-name-${index}`} className="text-xs">
                    Option Name
                  </Label>
                  <Input
                    id={`price-name-${index}`}
                    placeholder="e.g., Small, Medium, Large"
                    value={price.name}
                    onChange={(e) => handlePriceChange(index, "name", e.target.value)}
                    required
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor={`price-value-${index}`} className="text-xs">
                    Price
                  </Label>
                  <Input
                    id={`price-value-${index}`}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={price.price}
                    onChange={(e) => handlePriceChange(index, "price", e.target.value)}
                    required
                  />
                </div>
                {formData.prices.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-5"
                    onClick={() => removePriceOption(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleImageChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => handleChange("categoryId", value)} value={formData.categoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {status === "loading" ? (
                  <SelectItem disabled value={""}>
                    Loading categories...
                  </SelectItem>
                ) : categories.length === 0 ? (
                  <SelectItem disabled value={""}>
                    No categories found
                  </SelectItem>
                ) : (
                  categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full">
            {loading ? <ClipLoader color={"#fff"} loading={loading} size={20} /> : "Add Menu Item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

