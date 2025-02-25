"use client"

import { useParams } from "next/navigation"
import { useState, useEffect, useRef, JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactFragment, ReactPortal } from "react"
import { ClipLoader } from "react-spinners"
import { toast } from "@/components/ui/use-toast"

import type { Order } from "@/components/order-columns"
import { getMenuItems, type MenuItem } from "@/lib/menu"
import { fetchUsers } from "@/lib/auth"
import { getOrderById, updateOrderById } from "@/lib/order"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { RestaurantReceipt } from "@/components/receipt"
import { getCompany } from "@/lib/company"
import { OrderType } from "@/lib/types/types"


interface DecodedToken {
  role: string
  branchId?: string
  userId?: string // Additional properties if available
  [key: string]: any
}

interface OrderLine {
  menuItemId: string
  name: string
  quantity: number
  price: number
  totalPrice: number
}
export default function ViewOrderPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedItem, setSelectedItem] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState(true)
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [showReceipt, setShowReceipt] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false) // Added state for checkout modal
  const receiptRef = useRef<HTMLDivElement | null>(null)
  const [company, setCompany] = useState<any>(null) // Added state for company details

  useEffect(() => {
    const fetchOrderAndMenuItems = async () => {
      try {
        setLoading(true)
        setLoadingMenu(true)
        const decodedToken = await fetchUsers()
        const orderData = await getOrderById(params.orderId as string)
        setOrder(orderData)
        const companyData = await getCompany(decodedToken!.companyId ?? "")
        setCompany(companyData) // Assuming company details are in the first element
        const menuItemsData = await getMenuItems(decodedToken!.companyId ?? "")
        setMenuItems(menuItemsData)
      } catch (error) {
        console.error("Failed to fetch order or menu items:", error)
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
        setLoadingMenu(false)
      }
    }

    fetchOrderAndMenuItems()
  }, [params.orderId])

  const handleAddItem = async () => {
    if (!selectedItem || !order) return

    try {
      const menuItem = menuItems.find((item) => item.id === selectedItem)
      if (!menuItem) throw new Error("Menu item not found")

      const newOrderLine = {
        menuItemId: selectedItem,
        quantity: quantity,
        price: menuItem.price,
        totalPrice: menuItem.price * quantity,
      }

      const updatedOrder = {
        ...order,
        totalPrice: order.totalPrice + newOrderLine.totalPrice,
        finalPrice: order.finalPrice + newOrderLine.totalPrice,
        orderLines: [...order.orderLines, newOrderLine], // Directly add the line
      }

      await updateOrderById(updatedOrder as OrderType);
      
      setOrder((prevOrder) => ({
        ...prevOrder!,
        orderLines: [...prevOrder!.orderLines, { ...newOrderLine, name: menuItem.name }],
        totalPrice: updatedOrder.totalPrice,
        finalPrice: updatedOrder.finalPrice,
      }))

      setSelectedItem("")
      setQuantity(1)
      toast({
        title: "Success",
        description: "Item added to the order",
      })
    } catch (error) {
      console.error("Failed to add item:", error)
      toast({
        title: "Error",
        description: "Failed to add item to the order",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = async (index: number) => {
    if (!order) return

    try {
      const removedItem = order.orderLines[index]
      const updatedOrderLines = order.orderLines.filter((_: any, i: number) => i !== index)
      const updatedOrder: Order = {
        ...order,
        orderLines: updatedOrderLines,
        totalPrice: order.totalPrice - removedItem.totalPrice,
        finalPrice: order.finalPrice - removedItem.totalPrice,
      }

      await updateOrderById(updatedOrder as OrderType)
      setOrder(updatedOrder)
      toast({
        title: "Success",
        description: "Item removed from the order",
      })
    } catch (error) {
      console.error("Failed to remove item:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from the order",
        variant: "destructive",
      })
    }
  }

  const handleUpdateOrder = async () => {
    if (!order) return

    try {
      setLoading(true)
      const completedOrder : Order =  {
        ...order,
        isCompleted: true,
        isCheckedOut: true,
      }
      console.log(completedOrder)
      await updateOrderById(completedOrder as OrderType)
      setSuccessMessage("Order updated successfully.")
      setShowCheckoutModal(false)
      setShowReceipt(true)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 2000)
    } catch (error) {
      console.error("Failed to update order:", error)
      setError("Failed to update order. Please try again.")
      setTimeout(() => {
        setError(null)
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (receiptRef.current && order) {
      const printWindow = window.open("", "", "width=600,height=600")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                @media print {
                  body { width: 300px; }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.focus()
        printWindow.print()
        printWindow.close()
      }
    } else {
      console.error("Receipt is not ready for printing.")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color={"#000"} loading={loading} size={50} />
      </div>
    )
  }

  if (!order) {
    return <div>Order not found</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order #{order.orderNumber}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="menu-item">Menu Item</Label>
                  <Select value={selectedItem} onValueChange={setSelectedItem}>
                    <SelectTrigger id="menu-item">
                      <SelectValue placeholder="Select a menu item" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingMenu ? (
                        <ClipLoader color={"#000"} loading={loadingMenu} size={20} />
                      ) : (
                        menuItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name} - ${item.price}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddItem}>Add to Order</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.orderLines.map((line: { menuItemId: string; quantity: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | PromiseLikeOfReactNode | null | undefined; price: number; totalPrice: number }, index: Key | null | undefined) => (
                    <TableRow key={index}>
                      <TableCell>{menuItems.find((item) => item.id === line.menuItemId)?.name || "Unknown"}</TableCell>
                      <TableCell>{line.quantity}</TableCell>
                      <TableCell>${line.price.toFixed(2)}</TableCell>
                      <TableCell>${line.totalPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(index as number)}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Receipt Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Price:</span>
                  <span>${order.totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>${order.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rounding:</span>
                  <span>${order.rounding.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Final Price:</span>
                  <span>${order.finalPrice.toFixed(2)}</span>
                </div>
              </div>
              <Button onClick={() => setShowCheckoutModal(true)} className="w-full mt-4">
                Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="discount">Discount:</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                value={order.discount}
                onChange={(e) => setOrder({ ...order, discount: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="rounding">Rounding:</Label>
              <Input
                id="rounding"
                type="number"
                value={order.rounding}
                onChange={(e) => setOrder({ ...order, rounding: Number.parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label>Payment Type:</Label>
              <RadioGroup
                value={order.payment[0]?.type || "Cash"}
                onValueChange={(value) =>
                  setOrder({
                    ...order,
                    payment: [{ ...order.payment[0], type: value }],
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Mobile Money" id="mobile-money" />
                  <Label htmlFor="mobile-money">Mobile Money</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Cash and Mobile Money" id="cash-and-mobile" />
                  <Label htmlFor="cash-and-mobile">Cash and Mobile Money</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="received-amount">Received Amount:</Label>
              <Input
                id="received-amount"
                type="number"
                min="0"
                value={order.payment[0]?.amount || 0}
                onChange={(e) =>
                  setOrder({
                    ...order,
                    payment: [{ ...order.payment[0], amount: Number.parseFloat(e.target.value) || 0 }],
                  })
                }
              />
            </div>
            <div className="flex justify-between font-bold">
              <span>Balance:</span>
              <span>${((order.payment[0]?.amount || 0) - order.finalPrice).toFixed(2)}</span>
            </div>
            <Button onClick={handleUpdateOrder} className="w-full" disabled={order.isCompleted && order.isCheckedOut || loading}>
              {loading ? <ClipLoader color={"#fff"} loading={loading} size={20} /> : "Complete Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showReceipt && (
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={receiptRef}>
                <RestaurantReceipt
                  order={{
                    orderLines: order.orderLines,
                    totalPrice: order.totalPrice,
                    discount: order.discount,
                    rounding: order.rounding,
                    finalPrice: order.finalPrice,
                    paymentType: order.payment[0]?.type || "Not set",
                    receivedAmount: order.payment[0]?.amount || 0,
                    balance: (order.payment[0]?.amount || 0) - order.finalPrice,
                  }}
                  company={company}
                />
              </div>
              <Button onClick={handlePrint} className="mt-4">
                Print Receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

