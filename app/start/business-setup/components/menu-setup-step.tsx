"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Plus, Trash2, ImageIcon, DollarSign, Tag, FileText, MenuIcon, Utensils } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { MenuIngredients } from "./menu-indregients"
import type { Ingredient, MenuIngredient } from "@/lib/types/types"
import Image from 'next/image';

interface MenuSetupStepProps {
  formData: any
  updateFormData: (data: any) => void
  nextStep: () => void
  prevStep: () => void
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
}

export function MenuSetupStep({ formData, updateFormData, nextStep, prevStep, isDialogOpen, setIsDialogOpen }: MenuSetupStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeCategory, setActiveCategory] = useState<string>(formData.menuCategories[0]?.id || "")
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("categories")

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one category has a name
    const hasNamedCategory = formData.menuCategories.some((cat: any) => cat.name.trim() !== "")

    if (!hasNamedCategory) {
      newErrors.categories = "At least one menu category with a name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      nextStep()
    }
  }

  // Ingredient management
  const updateIngredients = (ingredients: Ingredient[]) => {
    updateFormData({ ingredients })
  }

  // Category management
  const addCategory = () => {
    const newCategoryId = uuidv4()
    const updatedCategories = [
      ...formData.menuCategories,
      {
        id: newCategoryId,
        name: "",
        description: "",
        menuItems: [
          {
            id: uuidv4(),
            name: "",
            description: "",
            imageBase64: null,
            priceTypes: [{ id: uuidv4(), name: "Regular", price: 0 }],
            ingredients: [],
          },
        ],
      },
    ]
    updateFormData({ menuCategories: updatedCategories })
    setActiveCategory(newCategoryId)
  }

  const removeCategory = (categoryId: string) => {
    if (formData.menuCategories.length > 1) {
      const updatedCategories = formData.menuCategories.filter((cat: any) => cat.id !== categoryId)
      updateFormData({ menuCategories: updatedCategories })

      // Update active category if the removed one was active
      if (activeCategory === categoryId) {
        setActiveCategory(updatedCategories[0].id)
      }
    }
  }

  const updateCategory = (categoryId: string, field: string, value: string) => {
    const updatedCategories = formData.menuCategories.map((cat: any) => {
      if (cat.id === categoryId) {
        return { ...cat, [field]: value }
      }
      return cat
    })

    updateFormData({ menuCategories: updatedCategories })

    // Clear error when user types
    if (errors.categories) {
      setErrors({ ...errors, categories: "" })
    }
  }

  // Menu item management
  const addMenuItem = (categoryId: string) => {
    const newItemId = uuidv4()
    const updatedCategories = formData.menuCategories.map((cat: any) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          menuItems: [
            ...cat.menuItems,
            {
              id: newItemId,
              name: "",
              description: "",
              imageBase64: null,
              priceTypes: [{ id: uuidv4(), name: "Regular", price: 0 }],
              ingredients: [],
            },
          ],
        }
      }
      return cat
    })

    updateFormData({ menuCategories: updatedCategories })
    setActiveMenuItem(newItemId)
  }

  const removeMenuItem = (categoryId: string, itemId: string) => {
    const category = formData.menuCategories.find((cat: any) => cat.id === categoryId)

    if (category && category.menuItems.length > 1) {
      const updatedCategories = formData.menuCategories.map((cat: any) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            menuItems: cat.menuItems.filter((item: any) => item.id !== itemId),
          }
        }
        return cat
      })

      updateFormData({ menuCategories: updatedCategories })

      // Update active menu item if the removed one was active
      if (activeMenuItem === itemId) {
        const newCategory = updatedCategories.find((cat: any) => cat.id === categoryId)
        setActiveMenuItem(newCategory.menuItems[0].id)
      }
    }
  }

  const updateMenuItem = (categoryId: string, itemId: string, field: string, value: any) => {
    const updatedCategories = formData.menuCategories.map((cat: any) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          menuItems: cat.menuItems.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, [field]: value }
            }
            return item
          }),
        }
      }
      return cat
    })

    updateFormData({ menuCategories: updatedCategories })
  }

  // Price type management
  const addPriceType = (categoryId: string, itemId: string) => {
    const updatedCategories = formData.menuCategories.map((cat: any) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          menuItems: cat.menuItems.map((item: any) => {
            if (item.id === itemId) {
              return {
                ...item,
                priceTypes: [...item.priceTypes, { id: uuidv4(), name: "", price: 0 }],
              }
            }
            return item
          }),
        }
      }
      return cat
    })

    updateFormData({ menuCategories: updatedCategories })
  }

  const removePriceType = (categoryId: string, itemId: string, priceTypeId: string) => {
    const updatedCategories = formData.menuCategories.map((cat: any) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          menuItems: cat.menuItems.map((item: any) => {
            if (item.id === itemId && item.priceTypes.length > 1) {
              return {
                ...item,
                priceTypes: item.priceTypes.filter((pt: any) => pt.id !== priceTypeId),
              }
            }
            return item
          }),
        }
      }
      return cat
    })

    updateFormData({ menuCategories: updatedCategories })
  }

  const updatePriceType = (categoryId: string, itemId: string, priceTypeId: string, field: string, value: any) => {
    const updatedCategories = formData.menuCategories.map((cat: any) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          menuItems: cat.menuItems.map((item: any) => {
            if (item.id === itemId) {
              return {
                ...item,
                priceTypes: item.priceTypes.map((pt: any) => {
                  if (pt.id === priceTypeId) {
                    return { ...pt, [field]: field === "price" ? Number.parseFloat(value) || 0 : value }
                  }
                  return pt
                }),
              }
            }
            return item
          }),
        }
      }
      return cat
    })

    updateFormData({ menuCategories: updatedCategories })
  }

  // Ingredient management
  const updateMenuItemIngredients = (categoryId: string, itemId: string, ingredients: MenuIngredient[]) => {
    const updatedCategories = formData.menuCategories.map((cat: any) => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          menuItems: cat.menuItems.map((item: any) => {
            if (item.id === itemId) {
              return { ...item, ingredients }
            }
            return item
          }),
        }
      }
      return cat
    })

    updateFormData({ menuCategories: updatedCategories })
  }

  // Image handling
  const handleImageChange = (categoryId: string, itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        updateMenuItem(categoryId, itemId, "imageBase64", base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  // Find active category and menu item
  const activeCategoryData =
    formData.menuCategories.find((cat: any) => cat.id === activeCategory) || formData.menuCategories[0]
  const activeMenuItemData =
    activeCategoryData?.menuItems.find((item: any) => item.id === activeMenuItem) || activeCategoryData?.menuItems[0]

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Menu Setup</h2>
        <p className="text-gray-600 dark:text-gray-300">Create your menu categories and items</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Menu Categories</h3>
              <Button type="button" variant="outline" size="sm" onClick={addCategory} className="h-8">
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </div>

            {errors.categories && <p className="text-sm text-red-500">{errors.categories}</p>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.menuCategories.map((category: any) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-all hover:border-primary ${activeCategory === category.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <MenuIcon className="h-4 w-4 mr-2 text-primary" />
                        <span className="font-medium truncate">{category.name || "New Category"}</span>
                      </div>
                      {formData.menuCategories.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCategory(category.id)
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {category.description || "No description"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.menuItems.length} item{category.menuItems.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeCategoryData && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-4">Edit Category: {activeCategoryData.name || "New Category"}</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName" className="text-sm font-medium">
                        Category Name
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                          <Tag className="h-5 w-5" />
                        </div>
                        <Input
                          id="categoryName"
                          value={activeCategoryData.name}
                          onChange={(e) => updateCategory(activeCategoryData.id, "name", e.target.value)}
                          className="pl-10"
                          placeholder="e.g., Appetizers, Main Courses, Desserts"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="categoryDescription" className="text-sm font-medium">
                        Category Description
                      </Label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none text-gray-500">
                          <FileText className="h-5 w-5" />
                        </div>
                        <Textarea
                          id="categoryDescription"
                          value={activeCategoryData.description}
                          onChange={(e) => updateCategory(activeCategoryData.id, "description", e.target.value)}
                          className="pl-10 min-h-[80px]"
                          placeholder="Brief description of this menu category"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="items" className="space-y-4 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium">Menu Items</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({activeCategoryData?.name || "Uncategorized"})
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addMenuItem(activeCategory)}
                className="h-8"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCategoryData?.menuItems.map((item: any) => (
                <Card
                  key={item.id}
                  className={`cursor-pointer transition-all hover:border-primary ${activeMenuItem === item.id ? "border-primary bg-primary/5" : ""}`}
                  onClick={() => setActiveMenuItem(item.id)}
                >
                  <CardContent className="p-4 flex">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md mr-3 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {item.imageBase64 ? (
                        <Image
                          src={item.imageBase64 || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate">{item.name || "New Menu Item"}</div>
                        {activeCategoryData.menuItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeMenuItem(activeCategory, item.id)
                            }}
                            className="h-6 w-6 p-0 ml-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                        {item.description || "No description"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.priceTypes.map((pt: any) => (
                          <div key={pt.id} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                            {pt.name}: {formData.currency} {pt.price.toFixed(2)}
                          </div>
                        ))}
                      </div>
                      {item.ingredients && item.ingredients.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Utensils className="h-3 w-3 mr-1" />
                            {item.ingredients.length} ingredient{item.ingredients.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {activeMenuItemData && (
              <Card className="mt-6">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-4">Edit Menu Item: {activeMenuItemData.name || "New Item"}</h4>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="itemName" className="text-sm font-medium">
                        Item Name
                      </Label>
                      <Input
                        id="itemName"
                        value={activeMenuItemData.name}
                        onChange={(e) => updateMenuItem(activeCategory, activeMenuItemData.id, "name", e.target.value)}
                        placeholder="e.g., Chicken Sandwich, Chocolate Cake"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="itemDescription" className="text-sm font-medium">
                        Item Description
                      </Label>
                      <Textarea
                        id="itemDescription"
                        value={activeMenuItemData.description}
                        onChange={(e) =>
                          updateMenuItem(activeCategory, activeMenuItemData.id, "description", e.target.value)
                        }
                        className="min-h-[80px]"
                        placeholder="Describe the menu item"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="itemImage" className="text-sm font-medium">
                        Item Image
                      </Label>
                      <div className="flex items-center space-x-4">
                        <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800 overflow-hidden">
                          {activeMenuItemData.imageBase64 ? (
                            <Image
                              src={activeMenuItemData.imageBase64 || "/placeholder.svg"}
                              alt="Item preview"
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Input
                            id="itemImage"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(activeCategory, activeMenuItemData.id, e)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById("itemImage")?.click()}
                            className="w-full"
                          >
                            Upload Image
                          </Button>
                          <p className="text-xs text-gray-500 mt-1">Recommended size: 512x512px. Max 2MB.</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Price Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addPriceType(activeCategory, activeMenuItemData.id)}
                          className="h-7 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Price Option
                        </Button>
                      </div>

                      <Accordion type="multiple" className="w-full">
                        {activeMenuItemData.priceTypes.map((priceType: any, index: number) => (
                          <AccordionItem key={priceType.id} value={priceType.id} className="border-b">
                            <AccordionTrigger className="py-2">
                              <div className="flex items-center text-sm">
                                <span>{priceType.name || `Price Option ${index + 1}`}</span>
                                <span className="ml-2 text-gray-500 dark:text-gray-400">
                                  ({formData.currency} {priceType.price.toFixed(2)})
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 py-2">
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label htmlFor={`priceName-${priceType.id}`} className="text-sm font-medium">
                                      Name
                                    </Label>
                                    <Input
                                      id={`priceName-${priceType.id}`}
                                      value={priceType.name}
                                      onChange={(e) =>
                                        updatePriceType(
                                          activeCategory,
                                          activeMenuItemData.id,
                                          priceType.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="e.g., Small, Medium, Large, Regular"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor={`priceValue-${priceType.id}`} className="text-sm font-medium">
                                      Price
                                    </Label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                                        <DollarSign className="h-4 w-4" />
                                      </div>
                                      <Input
                                        id={`priceValue-${priceType.id}`}
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={priceType.price}
                                        onChange={(e) =>
                                          updatePriceType(
                                            activeCategory,
                                            activeMenuItemData.id,
                                            priceType.id,
                                            "price",
                                            e.target.value,
                                          )
                                        }
                                        className="pl-8"
                                        placeholder="0.00"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {activeMenuItemData.priceTypes.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePriceType(activeCategory, activeMenuItemData.id, priceType.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 mt-2"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Remove Price Option
                                  </Button>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Ingredients Tab */}
          <TabsContent value="ingredients" className="space-y-4 pt-4">
            {activeMenuItemData ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Ingredients for: {activeMenuItemData.name || "New Menu Item"}</h3>
                </div>
                <MenuIngredients
                  companyId={formData.companyId || "temp-company-id"}
                  menuId={activeMenuItemData.id}
                  initialIngredients={activeMenuItemData.ingredients || []}
                  allIngredients={formData.ingredients || []}
                  onIngredientsChange={updateIngredients}
                  onChange={(ingredients: MenuIngredient[]) =>
                    updateMenuItemIngredients(activeCategory, activeMenuItemData.id, ingredients)
                  }
                  isDialogOpen={isDialogOpen}
                  setIsDialogOpen={setIsDialogOpen}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Utensils className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Menu Item First</h3>
                <p className="text-muted-foreground max-w-md">
                  Please select a menu item from the &rdquo;Menu Items&rdquo; tab to manage its ingredients
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setActiveTab("items")}>
                  Go to Menu Items
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button type="submit">Continue</Button>
        </div>
      </form>
    </div>
  )
}
