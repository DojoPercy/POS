"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'
import { OrderCard } from '@/components/ordercard'
import { fetchIncompleteOrders } from '@/lib/order'
import { jwtDecode } from 'jwt-decode'


interface DecodedToken {
    role: string; 
    userId?: string;
    branchId?: string; 
    [key: string]: any;
  }
  interface OrderLine {
    id: string; 
    menuItemId: string; 
    quantity: number;
    price: number;
    totalPrice: number;
    
  }
  
  interface Order {
    id: string;
    waiterId: string;
    branchId: string;
    orderLines: OrderLine[]; // An array of OrderLine objects
    totalPrice: number;
    discount: number;
    rounding: number;
    finalPrice: number;
    paymentType: string;
    receivedAmount: number;
    balance: number;
    isCompleted: boolean;
    isCheckedOut: boolean;
    requiredDate: string; // ISO string format
  }
export default function KitchenPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const[branchId, setBranchId] = useState<string>("")
  const router = useRouter()

  const fetchOrders = async () => {
    try {
      const incompleteOrders = await fetchIncompleteOrders(branchId)
      setOrders(incompleteOrders)
      setError("")
    } catch (err) {
      setError('Failed to fetch orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found");
      return;
    }
    const decodedToken: DecodedToken = jwtDecode(token);
    setBranchId(decodedToken.branchId || "");
  }, [])
  useEffect(() => {
    
    fetchOrders()
    const intervalId = setInterval(fetchOrders, 30000) 
    return () => clearInterval(intervalId)
  }, )

  const handleCompleteOrder = async () => {
    try {
      
      fetchOrders() 
    } catch (err) {
      setError('Failed to complete order. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">Kitchen Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.refresh()}>Refresh Orders</Button>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order: Order) => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onComplete={() => handleCompleteOrder()}
          />
        ))}
      </div>
    </div>
  )
}

