"use client"

import { useState } from "react"
import type { Company, MenuItem, OrderType } from "@/lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Search, CheckCircle2, ChefHat, AlertCircle, Coffee, Utensils, Timer } from "lucide-react"

import { formatDistanceToNow } from "date-fns"
import OrderDetailView from "./order-details"

interface KitchenDashboardProps {
  orders: OrderType[]
  Menuitems: MenuItem[]
  company: Company
  loading: boolean
  onAcceptOrder: (order: OrderType) => void
  onCompleteOrder: (order: OrderType) => void
}

export default function KitchenDashboard({ orders, loading, onAcceptOrder, onCompleteOrder, company, Menuitems }: KitchenDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")


  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.toString().includes(searchQuery) ||
      order.orderStatus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderLines!.some((line) => line.name?.toLowerCase().includes(searchQuery.toLowerCase())),
  )

 
  const pendingOrders = filteredOrders.filter((order) => order.orderStatus === OrderStatus.PENDING)
  const processingOrders = filteredOrders.filter((order) => order.orderStatus === OrderStatus.PROCESSING)
  const completedOrders = filteredOrders.filter((order) => order.orderStatus === OrderStatus.COMPLETED)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 font-medium">
            New
          </Badge>
        )
      case OrderStatus.PROCESSING:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 font-medium">
            Processing
          </Badge>
        )
      case OrderStatus.COMPLETED:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 font-medium">
            Completed
          </Badge>
        )
      case OrderStatus.PAID:
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-medium">
            Paid
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return "Unknown time"
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Invalid date"
    }
  }

  const getOrderItems = (order: OrderType) => {
    if (!order.orderLines || order.orderLines.length === 0) return "No items"

    return order.orderLines
      .reduce((acc, line) => {
        const menuItem = Menuitems.find((item: MenuItem) => item.id === line.menuItemId)
        return acc + (line.quantity > 1 ? `${line.quantity}× ` : "") + (menuItem?.name ?? `Item #${line.menuItemId}`) + ", "
        }, "")
      .slice(0, -2)
  }


  const getWaitTime = (createdAt?: string) => {
    if (!createdAt) return 0
    try {
      const orderTime = new Date(createdAt)
      const now = new Date()
      return Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60))
    } catch (error) {
      return 0
    }
  }

  // Get appropriate color based on wait time
  const getWaitTimeColor = (minutes: number) => {
    if (minutes < 15) return "text-green-600"
    if (minutes < 30) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders by number or items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")} className="w-[180px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-muted/10">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <p className="text-xl font-medium text-muted-foreground">No orders found</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const waitTime = getWaitTime(order.createdAt)
            const waitTimeColor = getWaitTimeColor(waitTime)

            return (
              <Card
                key={order.id}
                className={`overflow-hidden transition-all hover:shadow-md ${
                  order.orderStatus === OrderStatus.PENDING
                    ? "border-l-4 border-l-yellow-400 border-y-0 border-r-0 rounded-l-none"
                    : order.orderStatus === OrderStatus.PROCESSING
                      ? "border-l-4 border-l-blue-400 border-y-0 border-r-0 rounded-l-none"
                      : "border-l-4 border-l-green-400 border-y-0 border-r-0 rounded-l-none"
                }`}
              >
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        
                        <div>
                          <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {getTimeAgo(order.createdAt || order.orderedDate)}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(order.orderStatus || "")}
                    </div>

                    {order.orderStatus !== OrderStatus.COMPLETED && (
                      <div className="flex items-center mb-3">
                        <Timer className={`h-4 w-4 mr-1.5 ${waitTimeColor}`} />
                        <span className={`text-sm font-medium ${waitTimeColor}`}>{waitTime} min wait</span>
                      </div>
                    )}

                    <div className="mb-4">
                      <p className="text-sm font-medium">Items:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{getOrderItems(order)}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                        View Details
                      </Button>

                      <div className="space-x-2">
                        {order.orderStatus === OrderStatus.PENDING && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => onAcceptOrder(order)}
                          >
                            <ChefHat className="h-4 w-4 mr-1" /> Accept
                          </Button>
                        )}

                        {order.orderStatus === OrderStatus.PROCESSING && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => onCompleteOrder(order)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const waitTime = getWaitTime(order.createdAt)
            const waitTimeColor = getWaitTimeColor(waitTime)

            return (
              <div
                key={order.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  order.orderStatus === OrderStatus.PENDING
                    ? "border-l-4 border-l-yellow-400 bg-yellow-50/30"
                    : order.orderStatus === OrderStatus.PROCESSING
                      ? "border-l-4 border-l-blue-400 bg-blue-50/30"
                      : "border-l-4 border-l-green-400 bg-green-50/30"
                }`}
              >
                <div className="flex items-center space-x-4">
                  

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium truncate mr-2">Order #{order.orderNumber}</h3>
                      {getStatusBadge(order.orderStatus || "")}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-1">{getOrderItems(order)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {order.orderStatus !== OrderStatus.COMPLETED && (
                    <div className="flex items-center">
                      <Timer className={`h-4 w-4 mr-1 ${waitTimeColor}`} />
                      <span className={`text-xs font-medium ${waitTimeColor}`}>{waitTime} min</span>
                    </div>
                  )}

                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {getTimeAgo(order.createdAt || order.orderedDate)}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                      Details
                    </Button>

                    {order.orderStatus === OrderStatus.PENDING && (
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => onAcceptOrder(order)}>
                        Accept
                      </Button>
                    )}

                    {order.orderStatus === OrderStatus.PROCESSING && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onCompleteOrder(order)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <OrderDetailView company={company} Menuitems={Menuitems} order={selectedOrder} onAccept={onAcceptOrder} onComplete={onCompleteOrder} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

