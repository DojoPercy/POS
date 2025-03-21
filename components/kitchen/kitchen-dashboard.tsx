"use client"

import { useState } from "react"
import type { Company, MenuItem, OrderType } from "@/lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Clock,
  Search,
  CheckCircle2,
  ChefHat,
  AlertCircle,
  Timer,
  FileText,
  LayoutGrid,
  List,
  ArrowUpRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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

export default function KitchenDashboard({
  orders,
  loading,
  onAcceptOrder,
  onCompleteOrder,
  company,
  Menuitems,
}: KitchenDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber?.toString().includes(searchQuery) ||
      order.orderStatus?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.orderLines!.some(
        (line) =>
          line.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (line.notes && line.notes.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
  )

  const pendingOrders = filteredOrders.filter((order) => order.orderStatus === OrderStatus.PENDING)
  const processingOrders = filteredOrders.filter((order) => order.orderStatus === OrderStatus.PROCESSING)
  const completedOrders = filteredOrders.filter((order) => order.orderStatus === OrderStatus.COMPLETED)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 font-medium">
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
          <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-medium">
            Completed
          </Badge>
        )
      case OrderStatus.PAID:
        return (
          <Badge variant="outline" className="bg-violet-100 text-violet-800 border-violet-300 font-medium">
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
        return (
          acc + (line.quantity > 1 ? `${line.quantity}× ` : "") + (menuItem?.name ?? `Item #${line.menuItemId}`) + ", "
        )
      }, "")
      .slice(0, -2)
  }

  const getOrderNotes = (order: OrderType) => {
    if (!order.orderLines) return null

    const notesLines = order.orderLines.filter((line) => line.notes && line.notes.trim() !== "")

    if (notesLines.length === 0) return null

    return notesLines.map((line, index) => {
      const menuItem = Menuitems.find((item: MenuItem) => item.id === line.menuItemId)
      return (
        <div key={index} className="text-xs text-gray-600 mt-1 flex items-start">
          <FileText className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="font-medium mr-1">{menuItem?.name}:</span>
          <span className="line-clamp-1">{line.notes}</span>
        </div>
      )
    })
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
    if (minutes < 15) return "text-emerald-600"
    if (minutes < 30) return "text-amber-600"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search orders by number, items or notes..."
            className="pl-10 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none border-0"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none border-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-gray-50">
          <AlertCircle className="h-12 w-12 text-gray-400 mb-4 opacity-50" />
          <p className="text-xl font-medium text-gray-500">No orders found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : viewMode === "grid" ? (
        // Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const waitTime = getWaitTime(order.createdAt)
              const waitTimeColor = getWaitTimeColor(waitTime)
              const hasNotes = order.orderLines?.some((line) => line.notes && line.notes.trim() !== "")

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card
                    className={`overflow-hidden transition-all hover:shadow-md ${
                      order.orderStatus === OrderStatus.PENDING
                        ? "border-l-4 border-l-amber-400 border-y border-r rounded-l-none"
                        : order.orderStatus === OrderStatus.PROCESSING
                          ? "border-l-4 border-l-blue-400 border-y border-r rounded-l-none"
                          : "border-l-4 border-l-emerald-400 border-y border-r rounded-l-none"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <div>
                              <h3 className="font-semibold text-lg text-gray-800">#{order.orderNumber}</h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
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

                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">Items:</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{getOrderItems(order)}</p>

                          {hasNotes && (
                            <div className="mt-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                              <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                                <FileText className="h-3.5 w-3.5 mr-1" />
                                Special Instructions:
                              </p>
                              {getOrderNotes(order)}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="text-gray-600 border-gray-200"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5 mr-1.5" />
                            Details
                          </Button>

                          <div className="space-x-2">
                            {order.orderStatus === OrderStatus.PENDING && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => onAcceptOrder(order)}
                              >
                                <ChefHat className="h-4 w-4 mr-1.5" /> Accept
                              </Button>
                            )}

                            {order.orderStatus === OrderStatus.PROCESSING && (
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => onCompleteOrder(order)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        // List View
        <div className="space-y-3">
          <AnimatePresence>
            {filteredOrders.map((order) => {
              const waitTime = getWaitTime(order.createdAt)
              const waitTimeColor = getWaitTimeColor(waitTime)
              const hasNotes = order.orderLines?.some((line) => line.notes && line.notes.trim() !== "")

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow ${
                      order.orderStatus === OrderStatus.PENDING
                        ? "border-l-4 border-l-amber-400 bg-amber-50/30"
                        : order.orderStatus === OrderStatus.PROCESSING
                          ? "border-l-4 border-l-blue-400 bg-blue-50/30"
                          : "border-l-4 border-l-emerald-400 bg-emerald-50/30"
                    }`}
                  >
                    <div className="flex items-center space-x-4 mb-3 md:mb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <h3 className="text-sm font-medium text-gray-800 truncate mr-2">
                            Order #{order.orderNumber}
                          </h3>
                          {getStatusBadge(order.orderStatus || "")}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-1">{getOrderItems(order)}</p>

                        {hasNotes && (
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <FileText className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="truncate">Has special instructions</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mt-3 md:mt-0">
                      {order.orderStatus !== OrderStatus.COMPLETED && (
                        <div className="flex items-center">
                          <Timer className={`h-4 w-4 mr-1 ${waitTimeColor}`} />
                          <span className={`text-xs font-medium ${waitTimeColor}`}>{waitTime} min</span>
                        </div>
                      )}

                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {getTimeAgo(order.createdAt || order.orderedDate)}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                          className="text-gray-600"
                        >
                          Details
                        </Button>

                        {order.orderStatus === OrderStatus.PENDING && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => onAcceptOrder(order)}
                          >
                            Accept
                          </Button>
                        )}

                        {order.orderStatus === OrderStatus.PROCESSING && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => onCompleteOrder(order)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Order Details #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <OrderDetailView
              company={company}
              Menuitems={Menuitems}
              order={selectedOrder}
              onAccept={onAcceptOrder}
              onComplete={onCompleteOrder}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

