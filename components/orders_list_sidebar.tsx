"use client"

import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Trash2, Loader2, EyeOff, Eye, Plus, RefreshCw, X, Clock, DollarSign, User, ChefHat } from 'lucide-react'
import Link from "next/link"
import { useDispatch, useSelector } from "react-redux"
import { fetchOrders, updateOrderLocally } from "@/redux/orderSlice"
import type { RootState, AppDispatch } from "../redux/index"
import { jwtDecode } from "jwt-decode"
import type { OrderType } from "@/lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import Pusher from "pusher-js"
import { motion, AnimatePresence } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"

interface DecodedToken {
  role: string
  branchId?: string
  userId?: string
  [key: string]: any
}

const getStatusColor = (isCompleted: boolean, isCheckedOut: boolean, isAccepted: boolean) => {
  if (isCheckedOut) return "bg-emerald-100 text-emerald-800 border-emerald-200"
  if (isCompleted) return "bg-amber-100 text-amber-800 border-amber-200"
  if (!isAccepted) return "bg-sky-100 text-sky-800 border-sky-200"
  return "bg-slate-100 text-slate-800 border-slate-200"
}

const getStatusText = (isCompleted: boolean, isCheckedOut: boolean, isAccepted: boolean) => {
  if (isCheckedOut) return "Completed"
  if (isCompleted) return "Ready"
  if (isAccepted) return "Preparing"
  return "Pending"
}

const getStatusIcon = (isCompleted: boolean, isCheckedOut: boolean, isAccepted: boolean) => {
  if (isCheckedOut) return <ChefHat className="h-3 w-3" />
  if (isCompleted) return <Eye className="h-3 w-3" />
  if (isAccepted) return <ChefHat className="h-3 w-3" />
  return <Clock className="h-3 w-3" />
}

const OrderItem = ({
  order,
  onDelete,
  isSelected,
}: {
  order: OrderType
  onDelete: (id: string) => void
  isSelected: boolean
}) => {
  const getTimeAgo = (date: string) => {
    const now = new Date()
    const updated = new Date(date)
    const diffInMinutes = Math.floor((now.getTime() - updated.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const isCompleted = order.orderStatus === OrderStatus.COMPLETED
  const isCheckedOut = order.orderStatus === OrderStatus.PAID
  const isAccepted = order.orderStatus === OrderStatus.PROCESSING

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`hover:shadow-md transition-all cursor-pointer border-l-4 ${
        isCheckedOut ? 'border-l-emerald-500' : 
        isCompleted ? 'border-l-amber-500' : 
        isAccepted ? 'border-l-blue-500' : 'border-l-gray-500'
      } ${isSelected ? "bg-gray-50" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">{order.orderNumber}</CardTitle>
            <Badge variant="outline" className={`text-xs ${getStatusColor(isCompleted, isCheckedOut, isAccepted)}`}>
              {getStatusIcon(isCompleted, isCheckedOut, isAccepted)}
              <span className="ml-1">{getStatusText(isCompleted, isCheckedOut, isAccepted)}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-3 w-3" />
              <span>Table { 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <DollarSign className="h-3 w-3" />
                <span>${order.totalPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <span className="text-gray-500">{order.orderLines?.length || 0} items</span>
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">{getTimeAgo(order.updatedAt!)}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  e.preventDefault()
                  onDelete(order.id!)
                }}
                className="text-gray-500 hover:text-red-500 h-6 w-6"
              >
                <Trash2 className="h-3 w-3" />
                <span className="sr-only">Delete order</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function OrderListSidebar({ onClose }: { onClose?: () => void } = {}) {
  const dispatch = useDispatch<AppDispatch>()
  const { orders, loading } = useSelector((state: RootState) => state.orders)
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [showCompleted, setShowCompleted] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      console.error("Token not found")
      return
    }
    try {
      const decodedToken: DecodedToken = jwtDecode(token)
      if (decodedToken) {
        dispatch(fetchOrders(decodedToken.userId ?? ""))
      }
    } catch (error) {
      console.error("Error decoding token:", error)
    }
  }, [dispatch])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) {
      console.warn("Pusher key not found, real-time updates disabled")
      return
    }

    Pusher.logToConsole = process.env.NODE_ENV === 'development'

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2",
    })

    const channel = pusher.subscribe("orders")

    channel.bind("order-update", (data: any) => {
      console.log("New order update received:", data)
      dispatch(updateOrderLocally(data))
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [dispatch])

  const filteredData = Array.isArray(orders)
    ? orders
        .filter((order: OrderType) => (showCompleted ? true : !(order.orderStatus === OrderStatus.PAID)))
        .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
    : []

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    // Add confirmation dialog here if needed
    window.location.href = `/waiter/order/`
  }

  const toggleShowCompleted = () => {
    setShowCompleted(!showCompleted)
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token)
        if (decodedToken) {
          await dispatch(fetchOrders(decodedToken.userId ?? ""))
        }
      } catch (error) {
        console.error("Error refreshing orders:", error)
      }
    }
    setTimeout(() => setRefreshing(false), 500)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-blue-600" />
            Active Orders
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8"
              disabled={refreshing || loading}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleShowCompleted} 
              className="h-8 w-8"
              title={showCompleted ? "Hide completed orders" : "Show completed orders"}
            >
              {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="sr-only">{showCompleted ? "Hide completed" : "Show completed"}</span>
            </Button>
            {isMobile && onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500">
          {filteredData.length} {showCompleted ? 'total' : 'active'} orders
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-40 text-center space-y-4 px-4"
                >
                  <ChefHat className="h-12 w-12 text-gray-300" />
                  <div>
                    <p className="text-gray-500 text-sm font-medium">No orders available</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {showCompleted ? "No orders found" : "No active orders"}
                    </p>
                  </div>
                  <Link href="/waiter/order/new">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Create New Order
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                filteredData.map((order: OrderType, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Link href={`/waiter/order/${order.id}`} className="block">
                      <div onClick={() => handleOrderClick(order.id!)}>
                        <OrderItem 
                          order={order} 
                          onDelete={handleDeleteOrder} 
                          isSelected={selectedOrder === order.id} 
                        />
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50">
        <Link href="/waiter/order/new" className="block">
          <Button variant="default" size="sm" className="w-full flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>
    </div>
  )
}
