"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Minus, Plus, ShoppingCart, Trash2, X, Printer, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { PriceType, MenuItem, OrderType, Company, CreatePaymentRequest } from "@/lib/types/types"
import { useDispatch, useSelector } from "react-redux"
import { placeOrder, updateOrder } from "@/redux/orderSlice"
import { selectUser, fetchUserFromToken } from "@/redux/authSlice"
import { getOrderCounter } from "@/lib/order"
import type { OrderLine } from "../lib/types/types"
import { OrderStatus } from "@/lib/enums/enums"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RestaurantReceipt } from "./receipt"
import { useRouter } from "next/navigation"
import { sendPayment } from "@/redux/paymentSlice"
import { getCompanyDetails } from "@/redux/companySlice"

type CartItem = {
  menuItem: MenuItem
  selectedPrice: PriceType
  quantity: number
}

type OrderSummaryProps = {
  cart: CartItem[]
  updateQuantity: (index: number, quantity: number) => void
  onClose?: () => void
  onCheckout?: () => void
  orderId?: string
  isEditingExistingOrder?: boolean
  orderNumber?: string
}

export default function OrderSummary({
  cart,
  updateQuantity,
  onClose,
  onCheckout,
  orderId,
  orderNumber,
  isEditingExistingOrder = false,
}: OrderSummaryProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receivedAmount, setReceivedAmount] = useState<number>(0)
  const [paymentType, setPaymentType] = useState<string>("Cash")
  const [discount, setDiscount] = useState<number>(0)
  const [rounding, setRounding] = useState<number>(0)
  const receiptRef = useRef<HTMLDivElement | null>(null)
  const [paymentTypeSelected, setPaymentTypeSelected] = useState<string[]>([]);

  const { toast } = useToast()
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector(selectUser)

  
  const company = useSelector((state: any) => state.company.company) as Company

  useEffect(() => {
    dispatch(fetchUserFromToken())
    
    
  }, [dispatch, user?.companyId])

 
  useEffect(() => {
    if (user?.companyId) {
      dispatch(getCompanyDetails(user.companyId))
    }
  }, [dispatch, user?.companyId])

 


  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.selectedPrice.price * item.quantity, 0);
  }, [cart]);
  
  const tax = useMemo(() => (company ? subtotal * company.taxRate : 0), [subtotal, company]);
  const totalWithTax = useMemo(() => subtotal + tax, [subtotal, tax]);
  const finalPrice = useMemo(() => totalWithTax - discount + rounding, [totalWithTax, discount, rounding]);
  const balance = useMemo(() => receivedAmount - finalPrice, [receivedAmount, finalPrice]);


  

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Order",
        description: "Please add items to your order first",
        variant: "destructive",
      })
      return
    }

    if (onCheckout) {
      onCheckout()
    } else if (isEditingExistingOrder) {
      const newOrder: OrderType = {
        waiterId: user?.userId,
        branchId: user?.branchId,
        orderLines: cart.map(
          (line) =>
            ({
              menuItemId: line.menuItem.id,
              quantity: line.quantity,
              price: line.selectedPrice.price,
              totalPrice: line.selectedPrice.price * line.quantity,
            }) as OrderLine,
        ),
        totalPrice: totalWithTax,
        orderStatus: OrderStatus.PENDING,
        requiredDate: new Date().toISOString(),
        
      }

      dispatch(updateOrder(newOrder))
      setReceivedAmount(finalPrice) // Set default received amount
    } else {
      
      setIsProcessing(true)
      const orderNum = await getOrderCounter(user?.branchId || "")

      toast({
        title: `Order #${orderNum}`,
        description: "Order Creating...",
        variant: "default",
      })

      const newOrder: OrderType = {
        waiterId: user?.userId,
        branchId: user?.branchId,
        orderLines: cart.map(
          (line) =>
            ({
              menuItemId: line.menuItem.id,
              quantity: line.quantity,
              price: line.selectedPrice.price,
              totalPrice: line.selectedPrice.price * line.quantity,
            }) as OrderLine,
        ),
        totalPrice: totalWithTax,
        orderStatus: OrderStatus.PENDING,
        requiredDate: new Date().toISOString(),
        orderNumber: orderNum,
      }

      dispatch(placeOrder(newOrder))



      setTimeout(() => {
        toast({
          title: "Order Placed!",
          description: `Your order total is $${totalWithTax.toFixed(2)}`,
        })
        setIsProcessing(false)
      }, 1500)
    }
  }

  const handleCheckOutOrder = () => {
    // Open checkout modal
    setShowCheckoutModal(true)
    setReceivedAmount(finalPrice) // Set default received amount
  }

  const handleCompleteCheckout = async () => {
    try {
      setIsProcessing(true)

      // Create payment record
      const payment: CreatePaymentRequest = 
        {
          amount: receivedAmount,
          orderId: orderId || "",
          currency: company.currency,
          paymentStatus: "Completed",
          companyId: user?.companyId || "",
          branchId: user?.branchId || "",
        }
        console.log("payment", payment)
      
        dispatch(sendPayment(payment));
      
      const checkOutOrder: OrderType = {
        id: orderId,
        orderLines: cart.map(
          (line) =>
            ({
              menuItemId: line.menuItem.id,
              quantity: line.quantity,
              price: line.selectedPrice.price,
              totalPrice: line.selectedPrice.price * line.quantity,
            }) as OrderLine,
        ),
        totalPrice: subtotal,
        discount: discount,
        rounding: rounding,
        finalPrice: finalPrice,
        orderStatus: OrderStatus.PAID,
        updatedAt: new Date().toISOString(),

        
      }

      await dispatch(updateOrder(checkOutOrder))

      // Close checkout modal and show receipt
      setShowCheckoutModal(false)
      setShowReceipt(true)

      toast({
        title: "Order Checked Out!",
        description: `Order #${orderNumber} has been completed`,
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

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "", "width=600,height=600")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                @media print {
                  body { width: 300px; margin: 0 auto; }
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
    }
  }

  const handleDone = () => {
    setShowReceipt(false)
    router.push("/")
  }

  const handlePaymentTypeChange = (paymentType: string) => {
    setPaymentTypeSelected((prevSelected) => {
    
      if (prevSelected.includes(paymentType)) {
        return prevSelected.filter((type) => type !== paymentType);
      } 
      
      return [...prevSelected, paymentType];
    });
  };
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {isEditingExistingOrder ? `Order #${orderNumber}` : "Your Order"}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your order is empty</p>
              <p className="text-sm text-muted-foreground mt-2">Add items from the menu to get started</p>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-350px)] lg:h-[calc(100vh-250px)]">
              <div className="px-4 py-2">
                {cart.map((item, index) => (
                  <div key={`${item.menuItem.id}-${item.selectedPrice.id}`} className="py-3">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.selectedPrice.name} - ${item.selectedPrice.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${(item.selectedPrice.price * item.quantity).toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-none"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                        >
                          {item.quantity === 1 ? (
                            <Trash2 className="h-3 w-3 text-destructive" />
                          ) : (
                            <Minus className="h-3 w-3" />
                          )}
                        </Button>
                        <span className="w-7 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-none"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(index, 0)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    <Separator className="mt-3" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>

        <CardFooter className="flex-col p-4 pt-2">
          <div className="w-full space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{company ? company.currency : ""}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (8%)</span>
              <span>{company ? company.currency : ""}{tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{company ? company.currency : ""}{totalWithTax.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full" size="lg" disabled={cart.length === 0 || isProcessing} onClick={handlePlaceOrder}>
            {isProcessing ? "Processing..." : isEditingExistingOrder ? "Update Order" : "Place Order"}
          </Button>
          {isEditingExistingOrder && (
            <Button
              className="w-full my-2 bg-white border-black text-black"
              size="lg"
              disabled={cart.length === 0 || isProcessing}
              onClick={handleCheckOutOrder}
            >
              {"CheckOut Order"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Checkout Modal */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditingExistingOrder ? `Checkout Order #${orderNumber}` : "Checkout"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div className="space-y-2">
    <Label>Payment Type</Label>
    <div className="space-y-2">
    {company?.paymentMethods?.map((paymentMethod: string) => (
  <div className="flex items-center space-x-2" key={paymentMethod}>
    <input
      type="checkbox"
      id={paymentMethod}
      checked={paymentTypeSelected.includes(paymentMethod)}
      onChange={() => handlePaymentTypeChange(paymentMethod)}
      className="hidden"
    />
    <Label htmlFor={paymentMethod} className="cursor-pointer flex items-center space-x-2">
      <div
        className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${
          paymentTypeSelected.includes(paymentMethod) ? "bg-blue-500" : "bg-white"
        }`}
      >
        {paymentTypeSelected.includes(paymentMethod) && <span className="text-white font-bold">✓</span>}
      </div>
      {paymentMethod}
    </Label>
  </div>
))}

    </div>
  </div>

            <div className="space-y-2">
              <Label htmlFor="received-amount">Received Amount</Label>
              <Input
                id="received-amount"
                type="number"
                min={finalPrice}
                step="0.01"
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="flex justify-between font-medium">
              <span>Subtotal:</span>
              <span>{company ? company.currency :  ""}{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-medium">
              <span>Tax (8%):</span>
              <span>{company ? company.currency :  ""}{tax.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-medium">
              <span>Discount:</span>
              <span>-{company ? company.currency :  ""}{discount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-medium">
              <span>Rounding:</span>
              <span>{company ? company.currency : "" }{rounding.toFixed(2)}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>{company ? company.currency : ""}{finalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between font-medium">
              <span>Balance:</span>
              <span>{company ? company.currency : "" }{balance.toFixed(2)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckoutModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteCheckout} disabled={isProcessing || receivedAmount < finalPrice}>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div ref={receiptRef}>
              <RestaurantReceipt
                order={{
                  orderLines: cart.map((item) => ({
                    name: item.menuItem.name,
                    quantity: item.quantity,
                    price: item.selectedPrice.price,
                    totalPrice: item.selectedPrice.price * item.quantity,
                  })),
                  totalPrice: subtotal,
                  discount: discount,
                  rounding: rounding,
                  finalPrice: finalPrice,
                  paymentType: paymentType,
                  receivedAmount: receivedAmount,
                  balance: balance,
                }}
                company={company}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="w-full sm:w-auto flex items-center justify-center"
              onClick={handlePrint}
            >
              <Printer className="mr-2 h-4 w-4" /> Print Receipt
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleDone}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

