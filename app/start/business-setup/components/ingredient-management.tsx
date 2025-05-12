"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Edit, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { v4 as uuidv4 } from "uuid"

interface Ingredient {
  id?: string
  name: string
  unit: string
  companyId?: string
}

interface IngredientsManagementProps {
  companyId: string
  ingredients: Ingredient[]
  onIngredientsChange: (ingredients: Ingredient[]) => void
  onIngredientSelect: (ingredient: Ingredient) => void
  isDialogOpen: boolean
  setIsDialogOpen: (isOpen: boolean) => void
}

export function IngredientsManagement({
  companyId,
  ingredients = [],
  onIngredientsChange,
  onIngredientSelect,
  isDialogOpen,
  setIsDialogOpen,
}: IngredientsManagementProps) {
  
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({
    name: "",
    unit: "",
    companyId: companyId,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const unitOptions = [
    "grams",
    "kilograms",
    "milliliters",
    "liters",
    "pieces",
    "teaspoons",
    "tablespoons",
    "cups",
    "ounces",
    "pounds",
  ]

  const handleAddIngredient = () => {
    console.log("Adding new ingredient")
    setCurrentIngredient({
      name: "",
      unit: "",
      companyId: companyId,
    })
    setIsEditing(false)
    console.log("Setting dialog open")
    setIsDialogOpen(true) // Set the dialog open
  }

  useEffect(() => {
    // Log whenever the dialog state changes
    console.log("Dialog open state changed:", isDialogOpen)
  }, [isDialogOpen])

  const handleEditIngredient = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient)
    setIsEditing(true)
    setIsDialogOpen(true)
  }

  const handleDeleteIngredient = (id: string) => {
    if (!id || !window.confirm("Are you sure you want to delete this ingredient?")) return

    const updatedIngredients = ingredients.filter((ingredient) => ingredient.id !== id)
    onIngredientsChange(updatedIngredients)
  }

  const handleSaveIngredient = () => {
    if (!currentIngredient.name || !currentIngredient.unit) return

    let updatedIngredients: Ingredient[]

    if (isEditing) {
      updatedIngredients = ingredients.map((ing) => (ing.id === currentIngredient.id ? currentIngredient : ing))
    } else {
      // Generate a temporary ID for new ingredients
      const newIngredient = {
        ...currentIngredient,
        id: `temp-${uuidv4()}`,
      }
      updatedIngredients = [...ingredients, newIngredient]
    }

    onIngredientsChange(updatedIngredients)
    setIsDialogOpen(false)
  }

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search ingredients..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleAddIngredient} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      <ScrollArea className="h-[400px] rounded-md border">
        {filteredIngredients.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <p className="text-muted-foreground mb-4">No ingredients found</p>
            <Button variant="outline" onClick={handleAddIngredient}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Ingredient
            </Button>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 gap-3">
            {filteredIngredients.map((ingredient) => (
              <Card key={ingredient.id} className="hover:border-primary transition-colors">
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">
                        {ingredient.unit}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onIngredientSelect(ingredient)}
                      className="h-8 px-2"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditIngredient(ingredient)}
                      className="h-8 px-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteIngredient(ingredient.id!)}
                      className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Ingredient" : "Add New Ingredient"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Update the details of this ingredient." : "Add a new ingredient to your inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ingredient Name</Label>
              <Input
                id="name"
                value={currentIngredient.name}
                onChange={(e) => setCurrentIngredient({ ...currentIngredient, name: e.target.value })}
                placeholder="e.g., Flour, Sugar, Salt"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit of Measurement</Label>
              <Select
                value={currentIngredient.unit}
                onValueChange={(value) => setCurrentIngredient({ ...currentIngredient, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIngredient}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
