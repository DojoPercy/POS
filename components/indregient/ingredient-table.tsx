"use client"

import { useState } from "react"
import { Edit, Trash2, MoreHorizontal } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditIngredientDialog } from "./edit-indregient"
import { DeleteIngredientDialog } from "./delete-indregient-dialog"
import { formatDate } from "@/lib/utils"

interface Ingredient {
  id: string
  name: string
  unit: string
  createdAt: string
  updatedAt: string
}

interface IngredientTableProps {
  ingredients: Ingredient[]
  onRefresh: () => void
}

export function IngredientTable({ ingredients, onRefresh }: IngredientTableProps) {
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null)
  const [deletingIngredient, setDeletingIngredient] = useState<Ingredient | null>(null)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="hidden md:table-cell">Created</TableHead>
              <TableHead className="hidden md:table-cell">Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No ingredients found.
                </TableCell>
              </TableRow>
            ) : (
              ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell className="font-medium">{ingredient.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{ingredient.unit}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(ingredient.createdAt)}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(ingredient.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingIngredient(ingredient)} className="cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeletingIngredient(ingredient)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingIngredient && (
        <EditIngredientDialog
          ingredient={editingIngredient}
          open={!!editingIngredient}
          onOpenChange={(open) => !open && setEditingIngredient(null)}
          onSuccess={onRefresh}
        />
      )}

      {deletingIngredient && (
        <DeleteIngredientDialog
          ingredient={deletingIngredient}
          open={!!deletingIngredient}
          onOpenChange={(open) => !open && setDeletingIngredient(null)}
          onSuccess={onRefresh}
        />
      )}
    </>
  )
}
