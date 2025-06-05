"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Edit2, Check, X, Package, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface InventoryItem {
  id: string
  name: string
  unit: string
  stock: number
  stockId: string | null
  minStock?: number
  category?: string
  lastUpdated?: string
}

interface InventoryGridProps {
  inventoryData: InventoryItem[]
  onUpdateStock: (ingredientId: string, quantity: number) => void
  isBranchManager?: boolean
}

export function InventoryGrid({ inventoryData, onUpdateStock, isBranchManager = false }: InventoryGridProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditValue(item.stock.toString())
  }

  const handleSave = (item: InventoryItem) => {
    const newStock = Number.parseInt(editValue)
    if (!isNaN(newStock) && newStock >= 0) {
      const difference = newStock - item.stock
      onUpdateStock(item.id, difference)
    }
    setEditingId(null)
    setEditValue("")
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  const getStockStatus = (stock: number, minStock = 10) => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        variant: "destructive" as const,
        color: "border-red-200 bg-red-50",
      }
    if (stock < minStock)
      return {
        label: "Low Stock",
        variant: "secondary" as const,
        color: "border-yellow-200 bg-yellow-50",
      }
    return {
      label: "In Stock",
      variant: "default" as const,
      color: "border-green-200 bg-green-50",
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {inventoryData.map((item, index) => {
        const status = getStockStatus(item.stock, item.minStock)
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`hover:shadow-md transition-shadow ${status.color} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {item.category || "General"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unit:</span>
                  <span className="font-medium">{item.unit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stock:</span>
                  {editingId === item.id ? (
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 h-8"
                      min="0"
                    />
                  ) : (
                    <span className="text-xl font-bold">{item.stock}</span>
                  )}
                </div>

                {item.lastUpdated && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated: {formatDate(item.lastUpdated)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateStock(item.id, -1)}
                      disabled={item.stock <= 0}
                      title="Remove 1"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateStock(item.id, 1)}
                      title="Add 1"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onUpdateStock(item.id, 10)}
                      title="Add 10"
                    >
                      <span className="text-xs font-bold">+10</span>
                    </Button>
                  </div>

                  {editingId === item.id ? (
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleSave(item)}>
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleCancel}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(item)}>
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
