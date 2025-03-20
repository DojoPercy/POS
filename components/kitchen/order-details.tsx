"use client"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { Company, MenuItem, OrderType } from "@/lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, CheckCircle2, ChefHat, User, MapPin, Utensils, Coffee } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { getCompanyDetails } from "@/redux/companySlice"
import { getMenuItemsPerCompany } from "@/redux/companyMenuSlice"
import { fetchMenuCategoriesOfCompany } from "@/redux/CompanyCategoryMenuSlice"
import { selectUser, fetchUserFromToken } from "@/redux/authSlice"
import { RootState } from "@/redux"

interface OrderDetailViewProps {
  order: OrderType
  Menuitems: MenuItem[]
    company: Company
  onAccept: (order: OrderType) => void
  onComplete: (order: OrderType) => void
}

export default function OrderDetailView({ order, onAccept, onComplete, company, Menuitems }: OrderDetailViewProps) {
    
  const getStatusBadge = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">New</Badge>
      case OrderStatus.PROCESSING:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Processing</Badge>
      case OrderStatus.COMPLETED:
        return <Badge className="bg-green-100 text-green-800 border-green-300">Completed</Badge>
      case OrderStatus.PAID:
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Paid</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown time"
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm a")
    } catch (error) {
      return "Invalid date"
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

  const getOrderTypeIcon = (orderType?: string) => {
    if (orderType === "Dine-in") {
      return <Utensils className="h-4 w-4 mr-1.5 text-primary" />
    } else if (orderType === "Takeout") {
      return <Coffee className="h-4 w-4 mr-1.5 text-primary" />
    }
    return null
  }

  return (
    <div className="space-y-4 py-2">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">Order #{order.orderNumber}</h2>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {getTimeAgo(order.createdAt || order.orderedDate)}
          </div>
        </div>
        {getStatusBadge(order.orderStatus || "")}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground">Order Date</p>
          <p className="font-medium">{formatDate(order.createdAt || order.orderedDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Required By</p>
          <p className="font-medium">{order.requiredDate ? formatDate(order.requiredDate) : "ASAP"}</p>
        </div>
      </div>

      <div className="bg-muted/20 rounded-lg p-3 flex items-center justify-between">
        {/* <div className="flex items-center">
          {getOrderTypeIcon(order.orderType)}
          <span className="font-medium">{order.orderType || "Standard Order"}</span>
        </div> */}

        {/* {order.orderType === "Dine-in" && order.tableNumber && (
          <div className="flex items-center">
            <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>Table {order.tableNumber}</span>
          </div>
        )} */}

        {/* {order.orderType === "Takeout" && order.customerName && (
          <div className="flex items-center">
            <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            <span>{order.customerName}</span>
          </div>
        )} */}
      </div>

      <Separator />

      <div>
        <h3 className="font-medium mb-2">Order Items</h3>
        <ScrollArea className="h-[200px] rounded-md border p-4">
          <div className="space-y-4">
          {order.orderLines?.map((line, index) => {
  const menuItem = Menuitems.find((item: MenuItem) => item.id === line.menuItemId);
  
  return (
    <div key={index} className="flex justify-between">
      <div className="flex-1">
        <div className="flex items-center">
          <span className="font-medium">{line.quantity}×</span>
          <span className="ml-2">{menuItem ? menuItem.name : `Item #${line.menuItemId}`}</span>
        </div>
      </div>
      <div className="text-right">
        <p>{company.currency}{line.price?.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground">{company.currency}{line.totalPrice?.toFixed(2)}</p>
      </div>
    </div>
  );
})}

            {(!order.orderLines || order.orderLines.length === 0) && (
              <p className="text-muted-foreground text-center py-8">No items in this order</p>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>{company.currency}{order.totalPrice?.toFixed(2) || "0.00"}</span>
        </div>
        {order.discount && order.discount > 0 && (
          <div className="flex justify-between mb-2">
            <span>Discount</span>
            <span>-{company.currency}{order.discount.toFixed(2)}</span>
          </div>
        )}
        {order.rounding && order.rounding !== 0 && (
          <div className="flex justify-between mb-2">
            <span>Rounding</span>
            <span>{company.currency}{order.rounding.toFixed(2)}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{company.currency}{order.finalPrice?.toFixed(2) || order.totalPrice?.toFixed(2) || "0.00"}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        {order.orderStatus === OrderStatus.PENDING && (
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => onAccept(order)}>
            <ChefHat className="h-4 w-4 mr-2" /> Accept Order
          </Button>
        )}

        {order.orderStatus === OrderStatus.PROCESSING && (
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => onComplete(order)}>
            <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Complete
          </Button>
        )}
      </div>
    </div>
  )
}

