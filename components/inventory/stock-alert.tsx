"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  stock: number
  unit: string
}

interface StockAlertsProps {
  lowStockItems: InventoryItem[]
  outOfStockItems: InventoryItem[]
}

export function StockAlerts({ lowStockItems, outOfStockItems }: StockAlertsProps) {
  if (outOfStockItems.length === 0 && lowStockItems.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          All items are adequately stocked. No immediate action required.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-3">
      {outOfStockItems.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span className="font-medium">Out of Stock ({outOfStockItems.length} items)</span>
              <div className="flex flex-wrap gap-1">
                {outOfStockItems.slice(0, 3).map((item) => (
                  <Badge key={item.id} variant="destructive" className="text-xs">
                    {item.name}
                  </Badge>
                ))}
                {outOfStockItems.length > 3 && (
                  <Badge variant="destructive" className="text-xs">
                    +{outOfStockItems.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {lowStockItems.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <div className="flex items-center justify-between">
              <span className="font-medium">Low Stock ({lowStockItems.length} items)</span>
              <div className="flex flex-wrap gap-1">
                {lowStockItems.slice(0, 3).map((item) => (
                  <Badge key={item.id} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                    {item.name} ({item.stock} {item.unit})
                  </Badge>
                ))}
                {lowStockItems.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                    +{lowStockItems.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
