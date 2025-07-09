"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Loader2,
  RefreshCw,
  Clock,
  DollarSign,
  ChefHat,
  CheckCircle,
  AlertCircle,
  Search,
  Plus,
  Edit,
  Printer,
  Check,
  CreditCard,
  Banknote,
  Receipt,
  Eye,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import Image from "next/image"
import { fetchOrders, updateOrderLocally, updateOrder } from "@/redux/orderSlice"
import { sendPayment } from "@/redux/paymentSlice"
import { getCompanyDetails } from "@/redux/companySlice"
import { selectUser, fetchUserFromToken } from "@/redux/authSlice"
import type { RootState, AppDispatch } from "../redux/index"
import { jwtDecode } from "jwt-decode"
import type { OrderType, Company, CreatePaymentRequest } from "@/lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import Pusher from "pusher-js"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { RestaurantReceipt } from "./receipt"
import { useRouter } from "next/navigation"
import OrderScreen from "./orderScreen"

interface DecodedToken {
  role: string
  branchId?: string
  userId?: string
  [key: string]: any
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PAID:
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case OrderStatus.COMPLETED:
      return "bg-amber-100 text-amber-800 border-amber-200"
    case OrderStatus.PROCESSING:
      return "bg-blue-100 text-blue-800 border-blue-200"
    case OrderStatus.PENDING:
      return "bg-gray-100 text-gray-800 border-gray-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusText = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PAID:
      return "Completed"
    case OrderStatus.COMPLETED:
      return "Ready"
    case OrderStatus.PROCESSING:
      return "Accepted"
    case OrderStatus.PENDING:
      return "New"
    default:
      return "Unknown"
  }
}

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PAID:
      return <CheckCircle className="h-3 w-3" />
    case OrderStatus.COMPLETED:
      return <AlertCircle className="h-3 w-3" />
    case OrderStatus.PROCESSING:
      return <ChefHat className="h-3 w-3" />
    case OrderStatus.PENDING:
      return <Clock className="h-3 w-3" />
    default:
      return <Clock className="h-3 w-3" />
  }
}

export default function LiveOrdersMain() {
  const dispatch = useDispatch<AppDispatch>()
  const { orders, loading } = useSelector((state: RootState) => state.orders)
  const company = useSelector((state: any) => state.company.company) as Company
  const user = useSelector(selectUser)
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [updateOrderOpen, setUpdateOrderOpen] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false)

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState("Cash")
  const [receivedAmount, setReceivedAmount] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [rounding, setRounding] = useState(0)
  const [paymentTypeSelected, setPaymentTypeSelected] = useState<string[]>([])

  const { toast } = useToast()
  const router = useRouter()
  const [newOrderOpen, setNewOrderOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchUserFromToken())
  }, [dispatch])

  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId))
    }
  }, [dispatch, user?.companyId])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return

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
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "ap2",
    })

    const channel = pusher.subscribe("orders")

    channel.bind("order-update", (data: any) => {
      dispatch(updateOrderLocally(data))
      toast({
        title: "Order Updated",
        description: `Order #${data.orderNumber} has been updated`,
      })
    })

    return () => {
      channel.unbind_all()
      channel.unsubscribe()
      pusher.disconnect()
    }
  }, [dispatch, toast])

  const filteredOrders = Array.isArray(orders)
  ? Array.from(
      new Map(orders.map((item) => [item.id, item])).values()
    )
      .filter((order) => {
        const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || order.orderStatus?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
  : [];


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

  const handleOrderSelect = (order: OrderType) => {
    setSelectedOrder(order)
    setReceivedAmount(order.finalPrice || order.totalPrice || 0)
    setDiscount(order.discount || 0)
    setRounding(order.rounding || 0)
    // On mobile, open the order details sheet
    if (window.innerWidth < 1024) {
      setOrderDetailsOpen(true)
    }
  }

  const handleUpdateOrder = () => {
    if (!selectedOrder) return
    setUpdateOrderOpen(true)
    setOrderDetailsOpen(false)
  }

  const handleCheckout = () => {
    if (!selectedOrder) return
    setCheckoutOpen(true)
    setReceivedAmount(selectedOrder.finalPrice || selectedOrder.totalPrice || 0)
    setOrderDetailsOpen(false)
  }

  // Checkout functionality from OrderSummary
  const handleCompleteCheckout = async () => {
    if (!selectedOrder) return

    try {
      setIsProcessing(true)

      // Create payment record
      const payment: CreatePaymentRequest = {
        amount: receivedAmount,
        orderId: selectedOrder.id || "",
        currency: company?.currency || "USD",
        paymentStatus: "Completed",
        companyId: user?.companyId || "",
        branchId: user?.branchId || "",
        paymentMethod: paymentTypeSelected.join(", ").toLowerCase() || "cash",
      }

      dispatch(sendPayment(payment))

      const subtotal = selectedOrder.totalPrice || 0
      const tax = company ? subtotal * company.taxRate : 0
      const finalPrice = subtotal + tax - discount + rounding

      const checkOutOrder: OrderType = {
        id: selectedOrder.id,
        waiterId: user?.userId,
        branchId: user?.branchId,
        companyId: user?.companyId,
        orderLines: selectedOrder.orderLines,
        totalPrice: subtotal,
        discount: discount,
        rounding: rounding,
        finalPrice: finalPrice,
        orderStatus: OrderStatus.PAID,
        updatedAt: new Date().toISOString(),
        orderNumber: selectedOrder.orderNumber,
      }

      await dispatch(updateOrder(checkOutOrder))

      // Close checkout modal and show receipt
      setCheckoutOpen(false)
      setShowReceipt(true)

      toast({
        title: "Order Checked Out!",
        description: `Order #${selectedOrder.orderNumber} has been completed`,
      })
    } catch (error) {
      console.error("Error checking out order:", error)
      toast({
        title: "Error",
        description: "Failed to checkout order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePaymentTypeChange = (paymentType: string) => {
    setPaymentTypeSelected((prevSelected) => {
      if (prevSelected.includes(paymentType)) {
        return prevSelected.filter((type) => type !== paymentType)
      }
      return [...prevSelected, paymentType]
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return <Banknote className="h-4 w-4 mr-2" />
      case "credit card":
      case "card":
        return <CreditCard className="h-4 w-4 mr-2" />
      default:
        return <Receipt className="h-4 w-4 mr-2" />
    }
  }

  const handlePrint = () => {
    const printWindow = window.open("", "", "width=600,height=600")
    if (printWindow && selectedOrder) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt</title>
            <style>
              @media print {
                body { width: 300px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif; }
                h1, h2, h3 { margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; }
                th, td { padding: 4px 0; text-align: left; }
                .text-right { text-align: right; }
                .border-top { border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; }
              }
            </style>
          </head>
          <body>
            <div>Receipt content would go here</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
      printWindow.close()
    }
  }

  const handleDone = () => {
    setShowReceipt(false)
    setSelectedOrder(null)
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const OrderCard = ({ order }: { order: OrderType }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
          order.orderStatus === OrderStatus.PAID
            ? "border-l-emerald-500"
            : order.orderStatus === OrderStatus.COMPLETED
              ? "border-l-amber-500"
              : order.orderStatus === OrderStatus.PROCESSING
                ? "border-l-blue-500"
                : "border-l-gray-500"
        } ${selectedOrder?.id === order.id ? "bg-blue-50 border-blue-200" : ""}`}
        onClick={() => handleOrderSelect(order)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold text-sm">
                {order.orderNumber?.slice(-2) || "AA"}
              </div>
              <div>
                <CardTitle className="text-sm font-medium">{"Walk-in Customer"}</CardTitle>
                <p className="text-xs text-gray-500">Order #{order.orderNumber}</p>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs ${getStatusColor(order.orderStatus || OrderStatus.PENDING)}`}>
              {getStatusIcon(order.orderStatus || OrderStatus.PENDING)}
              <span className="ml-1">{getStatusText(order.orderStatus || OrderStatus.PENDING)}</span>
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {formatDate(order.createdAt || "")} {formatTime(order.createdAt || "")}
              </span>
            </div>

            <div className="space-y-1">
              {order.orderLines?.slice(0, 2).map((line, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate">
                    {line.quantity}× {line.menuItem?.name || "Item"}
                  </span>
                  <span className="font-medium">
                    {company?.currency || "$"}
                    {line.totalPrice?.toFixed(2)}
                  </span>
                </div>
              ))}
              {(order.orderLines?.length || 0) > 2 && (
                <p className="text-xs text-gray-500">+{(order.orderLines?.length || 0) - 2} more items</p>
              )}
            </div>

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-lg">
                {company?.currency || "$"}
                {(order.finalPrice || order.totalPrice || 0).toFixed(2)}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 bg-transparent text-xs"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOrderSelect(order)
                  if (window.innerWidth < 1024) {
                    setOrderDetailsOpen(true)
                  }
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-xs"
                disabled={order.orderStatus === OrderStatus.PAID}
                onClick={(e) => {
                  e.stopPropagation()
                  handleOrderSelect(order)
                  setCheckoutOpen(true)
                }}
              >
                <DollarSign className="h-3 w-3 mr-1" />
                Pay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const subtotal = selectedOrder?.totalPrice || 0
  const tax = company ? subtotal * company.taxRate : 0
  const totalWithTax = subtotal + tax
  const finalPrice = totalWithTax - discount + rounding
  const balance = receivedAmount - finalPrice

  // Order Details Component for both desktop sidebar and mobile sheet
  const OrderDetailsContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg lg:text-xl font-semibold">Order Details</h2>
          <Badge
            className={`${getStatusColor(selectedOrder?.orderStatus || OrderStatus.PENDING)} flex items-center gap-1`}
          >
            {getStatusIcon(selectedOrder?.orderStatus || OrderStatus.PENDING)}
            {getStatusText(selectedOrder?.orderStatus || OrderStatus.PENDING)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Recipient:</span>
            <span className="font-medium">{"Walk-in Customer"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span className="font-medium">
              {formatDate(selectedOrder?.createdAt || "")} at {formatTime(selectedOrder?.createdAt || "")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Order ID:</span>
            <span className="font-medium">#{selectedOrder?.orderNumber}</span>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="flex-1 p-4 lg:p-6">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {selectedOrder?.orderLines?.map((line, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Image
                    src={line.menuItem?.imageUrl || "/placeholder.png"}
                    alt={line.menuItem?.name || "Item Image"}
                    className="w-full h-full object-cover rounded-lg"
                    width={48}
                    height={48}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{line.menuItem?.name || "Item"}</h3>
                  <p className="text-sm text-gray-500">Category: {line.menuItem?.category || "Food"}</p>
                  {line.notes && <p className="text-xs text-gray-400 truncate">Note: {line.notes}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium">
                    {company?.currency || "$"}
                    {line.totalPrice?.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">Qty: {line.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Summary */}
      <div className="p-4 lg:p-6 border-t border-gray-200">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span>Items ({selectedOrder?.orderLines?.length || 0}):</span>
            <span>
              {company?.currency || "$"}
              {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax ({company ? (company.taxRate * 100).toFixed(0) : 10}%):</span>
            <span>
              {company?.currency || "$"}
              {tax.toFixed(2)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>
              {company?.currency || "$"}
              {totalWithTax.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {selectedOrder?.orderStatus !== OrderStatus.PAID && (
            <>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 bg-transparent"
                onClick={handleUpdateOrder}
              >
                <Edit className="h-4 w-4" />
                Update Order
              </Button>
              <Button
                onClick={handleCheckout}
                className="w-full bg-purple-500 hover:bg-purple-600 flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Checkout
              </Button>
            </>
          )}
          {selectedOrder?.orderStatus === OrderStatus.PAID && (
            <Button variant="outline" className="w-full flex items-center gap-2 bg-transparent" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print Bill
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content - Orders List */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Orders</h1>
            <div className="flex items-center gap-2 lg:gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="flex items-center gap-2 bg-transparent text-sm lg:text-base"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button
                className="bg-gradient-to-br from-blue-500 to-purple-500 hover:bg-purple-600 flex items-center gap-2 text-sm lg:text-base"
                onClick={() => setNewOrderOpen(true)}
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Order</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">New</SelectItem>
                <SelectItem value="processing">Accepted</SelectItem>
                <SelectItem value="completed">Ready</SelectItem>
                <SelectItem value="paid">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="flex-1 p-4 lg:p-6 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pr-4">
                <AnimatePresence>
                  {filteredOrders.map((order: OrderType) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Desktop Right Sidebar - Order Details */}
      <div className="hidden lg:flex w-96 bg-white border-l border-gray-200 flex-col">
        {selectedOrder ? (
          <OrderDetailsContent />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Order</h3>
            <p className="text-gray-500">Choose an order from the list to view details and manage payment</p>
          </div>
        )}
      </div>

      {/* Mobile Order Details Sheet */}
      <Sheet open={orderDetailsOpen} onOpenChange={setOrderDetailsOpen}>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle>Order Details</SheetTitle>
          </SheetHeader>
          {selectedOrder && <OrderDetailsContent />}
        </SheetContent>
      </Sheet>

      {/* Update Order Modal */}
      <Dialog open={updateOrderOpen} onOpenChange={setUpdateOrderOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="p-4 lg:p-6 pb-0">
            <DialogTitle className="text-lg lg:text-xl">Update Order #{selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          <div className="h-[85vh] overflow-hidden">{selectedOrder && <OrderScreen orderId={selectedOrder.id} />}</div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="max-w-[75vw] lg:max-w-6xl max-h-[95vh] overflow-hidden p-0 w-[85%]">
          <DialogHeader className="p-4 lg:p-6 pb-0 border-b">
            <DialogTitle className="text-lg lg:text-2xl">Pay Bill</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 p-4 lg:p-6">
                {/* Left Column - Customer & Order Info */}
                <div className="space-y-4 lg:space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">Customer Info</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-semibold">
                        {"W"}
                      </div>
                      <div>
                        <p className="font-semibold">{"Walk-in Customer"}</p>
                        <p className="text-sm text-gray-500">Order #{selectedOrder.orderNumber} / Dine</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(selectedOrder.createdAt || "")} {formatTime(selectedOrder.createdAt || "")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Select a payment method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">💵 Cash</SelectItem>
                        <SelectItem value="Card">💳 Card</SelectItem>
                        <SelectItem value="Cash+Card">💵💳 Cash+Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Payment Method</Label>
                    <div className="space-y-2">
                      {company?.paymentMethods?.map((method: string) => (
                        <div
                          key={method}
                          className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                            paymentTypeSelected.includes(method)
                              ? "bg-primary/10 border-primary"
                              : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => handlePaymentTypeChange(method)}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center mr-2 ${
                              paymentTypeSelected.includes(method) ? "bg-primary text-white" : "border border-gray-300"
                            }`}
                          >
                            {paymentTypeSelected.includes(method) && <Check className="h-3 w-3" />}
                          </div>
                          <div className="flex items-center">
                            {getPaymentMethodIcon(method)}
                            <span>{method}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items Summary */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Order Items</Label>
                    <div className="bg-white border rounded-lg p-4 max-h-48 lg:max-h-64 overflow-y-auto">
                      <div className="space-y-3">
                        {selectedOrder.orderLines?.map((line, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{line.menuItem?.name}</p>
                              <p className="text-sm text-gray-500">{line.quantity}x</p>
                            </div>
                            <p className="font-medium">
                              {company?.currency || "$"}
                              {line.totalPrice?.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Payment Input */}
                <div className="space-y-4 lg:space-y-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Enter amount paid by cash</Label>
                    <div className="text-center bg-gray-50 p-4 lg:p-6 rounded-lg">
                      <div className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6 text-purple-600">
                        ${receivedAmount}
                      </div>

                      {/* Quick Amount Buttons */}
                      <div className="grid grid-cols-3 gap-2 lg:gap-3 mb-4 lg:mb-6">
                        {[5, 10, 20, 50, 100, 150].map((amount) => (
                          <Button
                            key={amount}
                            variant="outline"
                            onClick={() => setReceivedAmount(amount)}
                            className="h-10 lg:h-12 text-purple-500 border-purple-200 hover:bg-purple-50 font-semibold text-sm lg:text-base"
                          >
                            ${amount}
                          </Button>
                        ))}
                      </div>

                      {/* Numeric Keypad */}
                      <div className="grid grid-cols-3 gap-2 lg:gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <Button
                            key={num}
                            variant="outline"
                            onClick={() => setReceivedAmount((prev) => Number(prev.toString() + num.toString()))}
                            className="h-12 lg:h-14 text-lg lg:text-xl font-semibold hover:bg-gray-100"
                          >
                            {num}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          className="h-12 lg:h-14 text-lg lg:text-xl font-semibold bg-transparent hover:bg-gray-100"
                          onClick={() => setReceivedAmount((prev) => Number(prev.toString() + "."))}
                        >
                          .
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount((prev) => Number(prev.toString() + "0"))}
                          className="h-12 lg:h-14 text-lg lg:text-xl font-semibold hover:bg-gray-100"
                        >
                          0
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setReceivedAmount((prev) => Math.floor(prev / 10))}
                          className="h-12 lg:h-14 text-lg lg:text-xl font-semibold hover:bg-gray-100"
                        >
                          ⌫
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Summary & Actions */}
                <div className="space-y-4 lg:space-y-6">
                  {/* Discount and Rounding */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="discount">Discount</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={discount}
                        onChange={(e) => setDiscount(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rounding">Rounding</Label>
                      <Input
                        id="rounding"
                        type="number"
                        step="0.01"
                        value={rounding}
                        onChange={(e) => setRounding(Number.parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Total Summary */}
                  <div className="bg-gray-50 p-4 lg:p-6 rounded-lg space-y-4">
                    <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-base">
                        <span>Subtotal:</span>
                        <span className="font-medium">
                          {company?.currency || "$"}
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Tax ({company ? (company.taxRate * 100).toFixed(0) : 10}%):</span>
                        <span className="font-medium">
                          {company?.currency || "$"}
                          {tax.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Discount:</span>
                        <span className="font-medium text-red-500">
                          -{company?.currency || "$"}
                          {discount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-base">
                        <span>Rounding:</span>
                        <span className="font-medium">
                          {company?.currency || "$"}
                          {rounding.toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-3" />
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-purple-600">
                          {company?.currency || "$"}
                          {finalPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Change Calculation */}
                      <div className="mt-4 p-3 bg-white rounded border">
                        <div className="flex justify-between text-base">
                          <span>Amount Received:</span>
                          <span className="font-medium">
                            {company?.currency || "$"}
                            {receivedAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-base mt-2">
                          <span>Balance:</span>
                          <span className={`font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {company?.currency || "$"}
                            {balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleCompleteCheckout}
                      className="w-full bg-purple-500 hover:bg-purple-600 h-12 lg:h-14 text-base lg:text-lg font-semibold"
                      disabled={isProcessing || receivedAmount < finalPrice || paymentTypeSelected.length === 0}
                    >
                      {isProcessing ? (
                        <div className="flex items-center">
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                          Processing...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Check className="mr-2 h-4 w-4" /> Complete Order
                        </div>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCheckoutOpen(false)}
                      className="w-full h-10 lg:h-12 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Payment Status */}
                  {receivedAmount >= finalPrice && (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Payment amount is sufficient</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md max-w-[95vw]">
          <DialogHeader>
            <DialogTitle className="text-xl">Receipt</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-white p-4 rounded-lg">
              {selectedOrder && (
                <RestaurantReceipt
                  order={{
                    orderLines:
                      selectedOrder.orderLines?.map((line) => ({
                        name: line.menuItem?.name || "Item",
                        quantity: line.quantity || 1,
                        price: line.price || 0,
                        totalPrice: line.totalPrice || 0,
                        notes: line.notes,
                      })) || [],
                    totalPrice: subtotal,
                    discount: discount,
                    rounding: rounding,
                    finalPrice: finalPrice,
                    paymentType: paymentTypeSelected.join(", "),
                    receivedAmount: receivedAmount,
                    balance: balance,
                  }}
                  company={company}
                />
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center bg-transparent"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
            <Button className="w-full sm:w-auto bg-primary" onClick={handleDone}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Order Modal */}
      <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="p-4 lg:p-6 pb-0">
            <DialogTitle className="text-lg lg:text-xl">Create New Order</DialogTitle>
          </DialogHeader>
          <div className="h-[85vh] overflow-hidden">
            <OrderScreen />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
