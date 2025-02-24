"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Loader2 } from "lucide-react"
import type { Order } from "@prisma/client"
import { jwtDecode } from "jwt-decode"
import { getOrders } from "@/lib/order"
import Link from "next/link"

interface DecodedToken {
  role: string
  branchId?: string
  userId?: string
  [key: string]: any
}

const getStatusColor = (isCompleted: boolean, isCheckedOut: boolean) => {
  if (isCompleted && isCheckedOut) return "bg-green-100 text-green-800"
  if (isCompleted && !isCheckedOut) return "bg-yellow-100 text-yellow-800"
  if (!isCompleted) return "bg-blue-100 text-blue-800"
  return "bg-gray-100 text-gray-800"
}

const getStatusText = (isCompleted: boolean, isCheckedOut: boolean) => {
  if (isCompleted && isCheckedOut) return "Completed & Checked Out"
  if (isCompleted && !isCheckedOut) return "Completed, Not Checked Out"
  if (!isCompleted) return "In Progress"
  return "Unknown Status"
}

const OrderItem = ({ order, onDelete }: { order: Order; onDelete: (id: string) => void }) => (
  <div className="flex items-center justify-between p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <div className="flex flex-col space-y-1 flex-grow">
      <span className="font-medium">{order.orderNumber}</span>
      <Badge
        variant="outline"
        className={`${getStatusColor(order.isCompleted, order.isCheckedOut)} text-xs font-normal`}
      >
        {getStatusText(order.isCompleted, order.isCheckedOut)}
      </Badge>
    </div>
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation()
        onDelete(order.id)
      }}
      className="text-gray-500 hover:text-gray-700 ml-2"
    >
      <Trash2 className="h-4 w-4 text-red-500 " />
      <span className="sr-only">Delete order</span>
    </Button>
  </div>
)

export function OrderList() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<Order[]>([])
  const [filteredData, setFilteredData] = useState<Order[]>([])
  const [showCompleted, setShowCompleted] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }
    const decodedToken: DecodedToken = jwtDecode(token);
  
    const fetchInitialOrders = async () => {
      setIsLoading(true);
      try {
        const orders = await getOrders(undefined, decodedToken.branchId ?? "");
        const filteredOrders = orders.filter(
          (order: Order) => order.waiterId === decodedToken.userId
        );
        setData(filteredOrders);
        setFilteredData(filteredOrders);
      } catch (error) {
        console.error("Failed to fetch initial orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchInitialOrders();
  
    // 🌐 Dynamic SSE URL (works for both local & production)
    const baseUrl =
      process.env.NEXT_PUBLIC_VERCEL_URL && process.env.NODE_ENV === "production"
        ? `https://restaurantpos.vercel.app`
        : window.location.origin;
  
    const eventSourceUrl = new URL("/api/orders/stream", baseUrl);
    eventSourceUrl.searchParams.append("branchId", decodedToken.branchId ?? "");
    eventSourceUrl.searchParams.append("waiterId", decodedToken.userId ?? "");
  
    let eventSource: EventSource | null = null;
  
    const connectToSSE = () => {
      eventSource = new EventSource(eventSourceUrl.toString());
  
      eventSource.onmessage = (event) => {
        const newOrder: Order = JSON.parse(event.data);
        setData((prevData) => {
          const updatedData = prevData.some((order) => order.id === newOrder.id)
            ? prevData.map((order) => (order.id === newOrder.id ? newOrder : order))
            : [...prevData, newOrder];
          return sortOrders(updatedData);
        });
      };
  
      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        if (eventSource) {
          eventSource.close();
        }
        // ♻️ Reconnect after 5 seconds if SSE drops
        setTimeout(connectToSSE, 5000);
      };
    };
  
    connectToSSE();
  
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);
  
  useEffect(() => {
    setFilteredData(sortOrders(showCompleted ? data : data.filter((order) => !order.isCompleted)))
  }, [showCompleted, data])

  const sortOrders = (orders: Order[]) => {
    return orders.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId)
    console.log(`Navigating to order ${orderId}`)
  }

  const handleDeleteOrder = (orderId: string) => {
    window.location.href = `/waiter/order/${orderId}`
  }

  const toggleShowCompleted = () => {
    setShowCompleted(!showCompleted)
  }

  return (
    <div className="border border-gray-200 rounded-lg w-80">
      <div className="p-4 text-xl font-semibold border-b border-gray-200 flex justify-between items-center">
        <span>Orders</span>
        <Link href="/waiter/order/new">
          <Button variant="outline" size="sm">
            Add New Order
          </Button>
        </Link>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="py-2">
            {filteredData.map((order) => (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id)}
                className={`cursor-pointer ${selectedOrder === order.id ? "bg-gray-100" : ""}`}
              >
                <Link href={`/waiter/order/${order.id}`}>
                  <OrderItem order={order} onDelete={handleDeleteOrder} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

