"use client"


import { Edit, Trash2, Package } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditIngredientDialog } from "./edit-indregient"
import { DeleteIngredientDialog } from "./delete-indregient-dialog"
import { useState } from "react"
import { formatDate } from "@/lib/utils"


interface Ingredient {
  id: string
  name: string
  unit: string
  createdAt: string
  updatedAt: string
}

interface IngredientGridProps {
  ingredients: Ingredient[]
  onRefresh: () => void
}

export function IngredientGrid({ ingredients, onRefresh }: IngredientGridProps) {
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null)

  return (
    <>
      {ingredients.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No ingredients found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <Card key={ingredient.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold truncate">{ingredient.name}</CardTitle>
                  <Badge variant="outline">{ingredient.unit}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Package className="mr-1 h-4 w-4" />
                  <span>Added: {formatDate(ingredient.createdAt)}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Last updated: {formatDate(ingredient.updatedAt)}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setEditingIngredient(ingredient)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => setDeletingIngredient(ingredient)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {editingIngredient && (
        <EditIngredientDialog
          ingredient={editingIngredient}
          open={!!editingIngredient}
          onOpenChange={(open: any) => !open && setEditingIngredient(null)}
          onSuccess={onRefresh}
        />
      )}

      {deletingIngredient && (
        <DeleteIngredientDialog
          ingredient={deletingIngredient}
          open={!!deletingIngredient}
          onOpenChange={(open : any) => !open && setDeletingIngredient(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
