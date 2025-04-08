"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Loader2, EyeOff, Eye, Plus, RefreshCw, X } from "lucide-react"
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
  if (isCheckedOut) return "Completed & Checked Out"
  if (isCompleted) return "Completed, Not Checked Out"
  if (isAccepted) return "Order Processing..."
  return "In Progress"
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
  // Calculate how long ago the order was updated
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-all ${
        isSelected ? "bg-gray-100" : ""
      }`}
    >
      <div className="flex flex-col space-y-2 flex-grow">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-900">{order.orderNumber}</span>
          <span className="text-xs text-gray-500">{getTimeAgo(order.updatedAt!)}</span>
        </div>
        <Badge
          variant="outline"
          className={`${getStatusColor(
            order.orderStatus === OrderStatus.COMPLETED,
            order.orderStatus === OrderStatus.PAID,
            order.orderStatus === OrderStatus.PROCESSING,
          )} text-xs font-medium px-2 py-0.5`}
        >
          {getStatusText(
            order.orderStatus === OrderStatus.COMPLETED,
            order.orderStatus === OrderStatus.PAID,
            order.orderStatus === OrderStatus.PROCESSING,
          )}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onDelete(order.id!)
        }}
        className="text-gray-500 hover:text-gray-700 ml-2 rounded-full h-8 w-8"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
        <span className="sr-only">Delete order</span>
      </Button>
    </motion.div>
  )
}

export function OrderList({ onClose }: { onClose?: () => void } = {}) {
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
    const decodedToken: DecodedToken = jwtDecode(token)
    if (decodedToken) {
      dispatch(fetchOrders(decodedToken.userId ?? ""))
    }
  }, [dispatch])

  useEffect(() => {
    Pusher.logToConsole = true

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
    }
  }, [dispatch])

  const filteredData = Array.isArray(orders)
    ? orders
        .filter((order: OrderType) => (showCompleted ? true : !(order.orderStatus === OrderStatus.PAID)))
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : []

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId)
    if (isMobile && onClose) {
      onClose()
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    window.location.href = `/waiter/order/`
  }

  const toggleShowCompleted = () => {
    setShowCompleted(!showCompleted)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    const token = localStorage.getItem("token")
    if (token) {
      const decodedToken: DecodedToken = jwtDecode(token)
      if (decodedToken) {
        dispatch(fetchOrders(decodedToken.userId ?? "")).then(() => {
          setTimeout(() => setRefreshing(false), 500)
        })
      }
    } else {
      setRefreshing(false)
    }
  }

  return (
    <div
      className={`border border-gray-200 rounded-lg shadow-sm ${isMobile ? "w-full" : "w-80"} overflow-hidden bg-white h-full flex flex-col`}
    >
      <div className="p-4 text-xl font-semibold border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
        <span className="text-gray-900">Orders</span>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full h-8 w-8"
            disabled={refreshing || loading}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleShowCompleted} className="rounded-full h-8 w-8">
            {showCompleted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showCompleted ? "Hide completed" : "Show completed"}</span>
          </Button>
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className={`${isMobile ? "h-[calc(100vh-10rem)]" : "h-[calc(90vh-5rem)]"} flex-1`}>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="py-2">
            <AnimatePresence>
              {filteredData.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-40 text-center space-y-4 px-4"
                >
                  <p className="text-gray-500 text-sm">No orders available.</p>
                  <Link href="/waiter/order/new">
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Create Your First Order
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                filteredData.map((order: OrderType) => (
                  <Link key={order.id} href={`/waiter/order/${order.id}`} className="block">
                    <div onClick={() => handleOrderClick(order.id!)}>
                      <OrderItem order={order} onDelete={handleDeleteOrder} isSelected={selectedOrder === order.id} />
                    </div>
                  </Link>
                ))
              )}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-gray-200 bg-gray-50 sticky bottom-0">
        <Link href="/waiter/order/new" className="block">
          <Button variant="default" size="sm" className="w-full flex items-center justify-center gap-1">
            <Plus className="h-4 w-4" />
            New Order
          </Button>
        </Link>
      </div>
    </div>
  )
}
