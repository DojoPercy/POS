"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchBranchOrders, updateOrder, updateOrderLocally } from "@/redux/orderSlice"
import { OrderStatus } from "@/lib/enums/enums"
import type { OrderType } from "@/lib/types/types"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { selectUser, fetchUserFromToken } from "@/redux/authSlice"
import { Bell, Settings, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import KitchenStats from "@/components/kitchen/kitchen-stats"
import KitchenDashboard from "@/components/kitchen/kitchen-dashboard"
import { getCompanyDetails } from "@/redux/companySlice"
import { getMenuItemsPerCompany } from "@/redux/companyMenuSlice"
import { fetchMenuCategoriesOfCompany } from "@/redux/CompanyCategoryMenuSlice"
import { RootState } from "@/redux"
import Pusher from "pusher-js"

export default function KitchenDashboardPage() {
  const dispatch = useDispatch()
  const { toast } = useToast()
  const user = useSelector(selectUser)
  const { orders, loading } = useSelector((state: any) => state.orders)
  const [activeTab, setActiveTab] = useState("all")
  const [newOrderAlert, setNewOrderAlert] = useState(false)
 
    const { menuItems } = useSelector((state: RootState) => state.menu);
    const {company} = useSelector((state: RootState) => state.company);

  useEffect(() => {
  
    dispatch(fetchUserFromToken() )
   
  }, [dispatch])

 useEffect(() => {
  
    dispatch(getCompanyDetails(user?.companyId ?? ""));
   
  }, [dispatch, user?.companyId]);

  useEffect(() => {
      if (user?.companyId) {
        dispatch(getMenuItemsPerCompany(user.companyId));
      ;
     
      }
    }, [dispatch, user?.companyId]);
 useEffect(() => {
    if(user?.branchId) {
      Pusher.logToConsole = true;
      dispatch(fetchBranchOrders(user?.branchId ?? "") as any)
      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2",
      });
  
      const channel = pusher.subscribe("orders");
  
      channel.bind("order-update", (data: any) => {
        console.log("New order update received:", data);
       
        dispatch(updateOrderLocally(data));
      });
  
      return () => {
        channel.unbind_all();
        channel.unsubscribe();
      };
    }
  }, [dispatch, user?.branchId]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setNewOrderAlert(true)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleAcceptOrder = async (order: OrderType) => {
    try {
      const updatedOrder = {
        ...order,
        orderStatus: OrderStatus.PROCESSING,
      }

      await dispatch(updateOrder(updatedOrder) as any)

      toast({
        title: "Order Accepted",
        description: `Order #${order.orderNumber} is now being processed`,
      })

      if (order.orderNumber === "1001") {
        setNewOrderAlert(false)
      }
    } catch (error) {
      console.error("Failed to accept order:", error)
      toast({
        title: "Error",
        description: "Failed to accept order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteOrder = async (order: OrderType) => {
    try {
      const updatedOrder = {
        ...order,
        orderStatus: OrderStatus.COMPLETED,
      }

      await dispatch(updateOrder(updatedOrder) as any)

      toast({
        title: "Order Completed",
        description: `Order #${order.orderNumber} has been completed`,
      })
    } catch (error) {
      console.error("Failed to complete order:", error)
      toast({
        title: "Error",
        description: "Failed to complete order. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (!orders) return []

    switch (activeTab) {
      case "pending":
        return orders.filter((order: OrderType) => order.orderStatus === OrderStatus.PENDING)
      case "processing":
        return orders.filter((order: OrderType) => order.orderStatus === OrderStatus.PROCESSING)
      case "completed":
        return orders.filter((order: OrderType) => order.orderStatus === OrderStatus.COMPLETED)
      default:
        return orders
    }
  }

  // Add a mock new order for demonstration
  const mockOrders = [...(getFilteredOrders() || [])]



  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
          <p className="text-muted-foreground">Manage and track kitchen orders</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {newOrderAlert && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
              )}
            </Button>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Kitchen Stats */}
      <KitchenStats orders={orders || []} />

    

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            New Orders
            {newOrderAlert && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <KitchenDashboard
          company={company}
          Menuitems={menuItems}
            orders={mockOrders}
            loading={loading}
            onAcceptOrder={handleAcceptOrder}
            onCompleteOrder={handleCompleteOrder}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

